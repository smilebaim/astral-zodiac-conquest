// Resource Engine untuk Astral Zodiac Conquest
import { ZodiacProps } from '../components/ZodiacCard';
import { AllianceBonus } from './AllianceEngine';
import gameConfig from '../config/gameConfig';

export interface ResourceBuilding {
  id: string;
  type: 'stardustCollector' | 'celestialMine' | 'etherExtractor';
  level: number;
  productionRate: number;
  lastCollected: Date;
  efficiency: number;
  zodiacBonus: number;
}

export interface ResourceState {
  buildings: ResourceBuilding[];
  storage: {
    stardust: number;
    celestialOre: number;
    ether: number;
    capacity: {
      stardust: number;
      celestialOre: number;
      ether: number;
    };
  };
  productionRates: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  zodiacBonuses: {
    resourceGathering: number;
    storageCapacity: number;
    productionEfficiency: number;
  };
}

export class ResourceEngine {
  private state: ResourceState;
  private config = gameConfig;
  private zodiac: ZodiacProps;
  private allianceBonuses: AllianceBonus[];

  constructor(
    initialState: Partial<ResourceState>,
    zodiac: ZodiacProps,
    allianceBonuses: AllianceBonus[] = []
  ) {
    this.zodiac = zodiac;
    this.allianceBonuses = allianceBonuses;

    // Inisialisasi state dengan nilai default
    this.state = {
      buildings: initialState.buildings || [],
      storage: {
        stardust: initialState.storage?.stardust || 0,
        celestialOre: initialState.storage?.celestialOre || 0,
        ether: initialState.storage?.ether || 0,
        capacity: {
          stardust: this.calculateBaseStorageCapacity(),
          celestialOre: this.calculateBaseStorageCapacity(),
          ether: this.calculateBaseStorageCapacity()
        }
      },
      productionRates: {
        stardust: this.config.resourceConfig.baseGatheringRates.stardust,
        celestialOre: this.config.resourceConfig.baseGatheringRates.celestialOre,
        ether: this.config.resourceConfig.baseGatheringRates.ether
      },
      zodiacBonuses: {
        resourceGathering: this.calculateZodiacResourceBonus(),
        storageCapacity: this.calculateZodiacStorageBonus(),
        productionEfficiency: this.calculateZodiacEfficiencyBonus()
      }
    };

    this.updateProductionRates();
  }

  private calculateBaseStorageCapacity(): number {
    return this.config.resourceConfig.storageCapacity.baseCapacity;
  }

  private calculateZodiacResourceBonus(): number {
    let bonus = 0;
    
    // Bonus berdasarkan elemen zodiak
    if (this.zodiac.element === 'Earth') {
      bonus += 10;
    } else if (this.zodiac.element === 'Water') {
      bonus += 8; // Bonus untuk elemen air
    }

    // Bonus spesifik zodiak
    switch (this.zodiac.name) {
      case 'Taurus':
        bonus += 12; // Bonus material
        break;
      case 'Virgo':
        bonus += 15; // Bonus efisiensi pengumpulan
        break;
      case 'Capricorn':
        bonus += 10; // Bonus produksi berkelanjutan
        break;
      case 'Cancer':
        bonus += 8; // Bonus pengumpulan air
        break;
      case 'Scorpio':
        bonus += 7; // Bonus ekstraksi
        break;
    }

    // Bonus dari aliansi
    const resourceBonuses = this.allianceBonuses
      .filter(bonus => bonus.type === 'resource')
      .reduce((total, bonus) => total + bonus.value, 0);

    return bonus + resourceBonuses;
  }

  private calculateZodiacStorageBonus(): number {
    let bonus = 0;
    
    // Bonus khusus untuk zodiak tertentu
    if (['Taurus', 'Virgo', 'Capricorn'].includes(this.zodiac.name)) {
      bonus += 15;
    }

    return bonus;
  }

  private calculateZodiacEfficiencyBonus(): number {
    let bonus = 0;
    
    // Bonus efisiensi berdasarkan zodiak
    switch (this.zodiac.name) {
      case 'Virgo':
        bonus += 20; // Bonus presisi
        break;
      case 'Capricorn':
        bonus += 15; // Bonus efisiensi
        break;
      case 'Taurus':
        bonus += 10; // Bonus produksi
        break;
    }

    return bonus;
  }

  public addBuilding(type: ResourceBuilding['type']): boolean {
    const buildingConfig = this.config.resourceConfig.productionBuildings[type];
    if (!buildingConfig) return false;

    // Cek biaya pembangunan
    if (
      this.state.storage.stardust >= buildingConfig.cost.stardust &&
      this.state.storage.celestialOre >= buildingConfig.cost.celestialOre &&
      this.state.storage.ether >= buildingConfig.cost.ether
    ) {
      // Kurangi sumber daya
      this.state.storage.stardust -= buildingConfig.cost.stardust;
      this.state.storage.celestialOre -= buildingConfig.cost.celestialOre;
      this.state.storage.ether -= buildingConfig.cost.ether;

      // Tambah bangunan baru
      const newBuilding: ResourceBuilding = {
        id: crypto.randomUUID(),
        type,
        level: 1,
        productionRate: buildingConfig.productionRate,
        lastCollected: new Date(),
        efficiency: 100 + this.state.zodiacBonuses.productionEfficiency,
        zodiacBonus: this.state.zodiacBonuses.resourceGathering
      };

      this.state.buildings.push(newBuilding);
      this.updateProductionRates();
      return true;
    }

    return false;
  }

  public upgradeBuilding(buildingId: string): boolean {
    const building = this.state.buildings.find(b => b.id === buildingId);
    if (!building) return false;

    const buildingConfig = this.config.resourceConfig.productionBuildings[building.type];
    const upgradeCost = {
      stardust: buildingConfig.cost.stardust * Math.pow(buildingConfig.upgradeMultiplier, building.level),
      celestialOre: buildingConfig.cost.celestialOre * Math.pow(buildingConfig.upgradeMultiplier, building.level),
      ether: buildingConfig.cost.ether * Math.pow(buildingConfig.upgradeMultiplier, building.level)
    };

    // Cek biaya upgrade
    if (
      this.state.storage.stardust >= upgradeCost.stardust &&
      this.state.storage.celestialOre >= upgradeCost.celestialOre &&
      this.state.storage.ether >= upgradeCost.ether
    ) {
      // Kurangi sumber daya
      this.state.storage.stardust -= upgradeCost.stardust;
      this.state.storage.celestialOre -= upgradeCost.celestialOre;
      this.state.storage.ether -= upgradeCost.ether;

      // Upgrade bangunan
      building.level++;
      building.productionRate = buildingConfig.productionRate * Math.pow(buildingConfig.upgradeMultiplier, building.level - 1);
      
      this.updateProductionRates();
      return true;
    }

    return false;
  }

  public collectResources(): { collected: Record<string, number>; bonuses: Record<string, number> } {
    const now = new Date();
    const collected: Record<string, number> = {
      stardust: 0,
      celestialOre: 0,
      ether: 0
    };
    const bonuses: Record<string, number> = {
      zodiac: this.state.zodiacBonuses.resourceGathering,
      alliance: this.allianceBonuses
        .filter(bonus => bonus.type === 'resource')
        .reduce((total, bonus) => total + bonus.value, 0),
      efficiency: this.state.zodiacBonuses.productionEfficiency
    };
    
    this.state.buildings.forEach(building => {
      const timeDiff = (now.getTime() - building.lastCollected.getTime()) / 1000; // dalam detik
      let baseProduction = (building.productionRate * building.efficiency / 100) * timeDiff;
      
      // Terapkan bonus zodiak dan aliansi
      const totalBonus = (bonuses.zodiac + bonuses.alliance) / 100;
      baseProduction *= (1 + totalBonus);

      // Terapkan bonus efisiensi berdasarkan waktu hari
      const hour = now.getHours();
      if (hour >= 20 || hour < 6) { // Bonus produksi malam hari
        baseProduction *= 1.15;
      }

      switch (building.type) {
        case 'stardustCollector':
          collected.stardust += baseProduction;
          this.addResource('stardust', baseProduction);
          break;
        case 'celestialMine':
          collected.celestialOre += baseProduction;
          this.addResource('celestialOre', baseProduction);
          break;
        case 'etherExtractor':
          collected.ether += baseProduction;
          this.addResource('ether', baseProduction);
          break;
      }

      building.lastCollected = now;
    });

    return { collected, bonuses };
  }

  private addResource(type: keyof typeof this.state.storage, amount: number): void {
    const newAmount = this.state.storage[type] + amount;
    this.state.storage[type] = Math.min(newAmount, this.state.storage.capacity[type]);
  }

  private updateProductionRates(): void {
    const rates = {
      stardust: 0,
      celestialOre: 0,
      ether: 0
    };

    this.state.buildings.forEach(building => {
      const effectiveRate = (building.productionRate * building.efficiency / 100);
      switch (building.type) {
        case 'stardustCollector':
          rates.stardust += effectiveRate;
          break;
        case 'celestialMine':
          rates.celestialOre += effectiveRate;
          break;
        case 'etherExtractor':
          rates.ether += effectiveRate;
          break;
      }
    });

    this.state.productionRates = rates;
  }

  public getResourceState(): ResourceState {
    return this.state;
  }

  public getProductionRates(): ResourceState['productionRates'] {
    return this.state.productionRates;
  }

  public hasResources(resources: Partial<Record<keyof ResourceState['storage'], number>>): boolean {
    return Object.entries(resources).every(([resource, amount]) => {
      return this.state.storage[resource as keyof ResourceState['storage']] >= (amount || 0);
    });
  }

  public spendResources(resources: Partial<Record<keyof ResourceState['storage'], number>>): boolean {
    if (this.hasResources(resources)) {
      Object.entries(resources).forEach(([resource, amount]) => {
        const resourceKey = resource as keyof ResourceState['storage'];
        this.state.storage[resourceKey] -= (amount || 0);
      });
      return true;
    }
    return false;
  }
}