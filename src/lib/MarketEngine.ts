// Market Engine untuk Astral Zodiac Conquest
import { ResourceState } from './ResourceEngine';
import gameConfig from '../config/gameConfig';

export interface MarketOrder {
  id: string;
  playerId: string;
  allianceId: string;
  type: 'buy' | 'sell';
  resource: keyof ResourceState['storage'];
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  createdAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface MarketState {
  orders: MarketOrder[];
  priceHistory: {
    resource: keyof ResourceState['storage'];
    timestamp: Date;
    price: number;
  }[];
  currentPrices: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  volatility: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
}

export class MarketEngine {
  private state: MarketState;
  private config = gameConfig;

  constructor(initialState?: Partial<MarketState>) {
    this.state = {
      orders: initialState?.orders || [],
      priceHistory: initialState?.priceHistory || [],
      currentPrices: initialState?.currentPrices || {
        stardust: 100,
        celestialOre: 150,
        ether: 200
      },
      volatility: initialState?.volatility || {
        stardust: 0.1,
        celestialOre: 0.15,
        ether: 0.2
      }
    };
  }

  public createOrder(order: Omit<MarketOrder, 'id' | 'createdAt' | 'status' | 'totalPrice'>): MarketOrder {
    const newOrder: MarketOrder = {
      id: crypto.randomUUID(),
      ...order,
      totalPrice: order.amount * order.pricePerUnit,
      createdAt: new Date(),
      status: 'active'
    };

    this.state.orders.push(newOrder);
    this.updateMarketPrices(order.resource, order.type, order.amount);
    return newOrder;
  }

  public cancelOrder(orderId: string, playerId: string): boolean {
    const order = this.state.orders.find(o => o.id === orderId && o.playerId === playerId);
    if (!order || order.status !== 'active') return false;

    order.status = 'cancelled';
    return true;
  }

  public executeOrder(orderId: string): boolean {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'active') return false;

    order.status = 'completed';
    this.updateMarketPrices(order.resource, order.type, order.amount);
    return true;
  }

  private updateMarketPrices(resource: keyof ResourceState['storage'], orderType: 'buy' | 'sell', amount: number): void {
    const currentPrice = this.state.currentPrices[resource];
    const volatility = this.state.volatility[resource];
    
    // Hitung perubahan harga berdasarkan supply dan demand
    const priceImpact = (amount / 1000) * volatility; // Asumsi 1000 sebagai volume dasar
    const newPrice = orderType === 'buy' 
      ? currentPrice * (1 + priceImpact)
      : currentPrice * (1 - priceImpact);

    // Update harga saat ini
    this.state.currentPrices[resource] = Math.max(1, newPrice);

    // Catat history harga
    this.state.priceHistory.push({
      resource,
      timestamp: new Date(),
      price: this.state.currentPrices[resource]
    });

    // Batasi history harga (simpan 1000 data terakhir)
    if (this.state.priceHistory.length > 1000) {
      this.state.priceHistory = this.state.priceHistory.slice(-1000);
    }
  }

  public getMarketPrices(): MarketState['currentPrices'] {
    return this.state.currentPrices;
  }

  public getActiveOrders(resource?: keyof ResourceState['storage']): MarketOrder[] {
    return this.state.orders.filter(order => 
      order.status === 'active' && 
      (!resource || order.resource === resource)
    );
  }

  public getPriceHistory(resource: keyof ResourceState['storage'], limit: number = 100): MarketState['priceHistory'] {
    return this.state.priceHistory
      .filter(history => history.resource === resource)
      .slice(-limit);
  }

  public getState(): MarketState {
    return this.state;
  }
}