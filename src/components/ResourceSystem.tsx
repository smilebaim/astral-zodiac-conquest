import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ResourceStats {
  stardust: {
    current: number;
    max: number;
    generation_rate: number;
    bonus_rate: number;
  };
  celestial_ore: {
    current: number;
    max: number;
    generation_rate: number;
    bonus_rate: number;
  };
  ether: {
    current: number;
    max: number;
    generation_rate: number;
    bonus_rate: number;
  };
}

interface ResourceBuilding {
  id: string;
  name: string;
  type: 'stardust' | 'celestial_ore' | 'ether';
  level: number;
  production_rate: number;
  storage_capacity: number;
  efficiency: number;
  upgrade_cost: {
    stardust: number;
    celestial_ore: number;
    ether: number;
  };
}

interface TradeOffer {
  id: string;
  player_id: string;
  player_name: string;
  offer: {
    resource: 'stardust' | 'celestial_ore' | 'ether';
    amount: number;
  };
  request: {
    resource: 'stardust' | 'celestial_ore' | 'ether';
    amount: number;
  };
  status: 'active' | 'accepted' | 'cancelled';
  created_at: string;
}

interface ResourceSystemProps {
  userId: string;
}

const ResourceSystem: React.FC<ResourceSystemProps> = ({ userId }) => {
  const [resourceStats, setResourceStats] = useState<ResourceStats>({
    stardust: { current: 0, max: 0, generation_rate: 0, bonus_rate: 0 },
    celestial_ore: { current: 0, max: 0, generation_rate: 0, bonus_rate: 0 },
    ether: { current: 0, max: 0, generation_rate: 0, bonus_rate: 0 }
  });
  const [buildings, setBuildings] = useState<ResourceBuilding[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'buildings' | 'trading'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTradeOffer, setNewTradeOffer] = useState<Partial<TradeOffer>>({
    offer: { resource: 'stardust', amount: 0 },
    request: { resource: 'celestial_ore', amount: 0 }
  });

  useEffect(() => {
    fetchResourceStats();
    fetchBuildings();
    fetchTradeOffers();
    subscribeToResourceUpdates();
  }, [userId]);

  const fetchResourceStats = async () => {
    try {
      const { data, error } = await supabase
        .from('player_resources')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setResourceStats(data.stats);
    } catch (err) {
      setError('Failed to fetch resource stats');
      console.error('Error fetching resource stats:', err);
    }
  };

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_buildings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBuildings(data || []);
    } catch (err) {
      setError('Failed to fetch buildings');
      console.error('Error fetching buildings:', err);
    }
  };

  const fetchTradeOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTradeOffers(data || []);
    } catch (err) {
      setError('Failed to fetch trade offers');
      console.error('Error fetching trade offers:', err);
    }
  };

  const subscribeToResourceUpdates = () => {
    const channel = supabase
      .channel('resource-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_resources',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setResourceStats(payload.new.stats);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const upgradeBuilding = async (building: ResourceBuilding) => {
    try {
      // Check if player has enough resources
      if (
        resourceStats.stardust.current < building.upgrade_cost.stardust ||
        resourceStats.celestial_ore.current < building.upgrade_cost.celestial_ore ||
        resourceStats.ether.current < building.upgrade_cost.ether
      ) {
        setError('Insufficient resources for upgrade');
        return;
      }

      const { data, error } = await supabase
        .from('resource_buildings')
        .update({
          level: building.level + 1,
          production_rate: building.production_rate * 1.5,
          storage_capacity: building.storage_capacity * 1.5,
          efficiency: building.efficiency * 1.1
        })
        .eq('id', building.id)
        .select()
        .single();

      if (error) throw error;

      // Update player resources
      await supabase
        .from('player_resources')
        .update({
          'stats.stardust.current': resourceStats.stardust.current - building.upgrade_cost.stardust,
          'stats.celestial_ore.current': resourceStats.celestial_ore.current - building.upgrade_cost.celestial_ore,
          'stats.ether.current': resourceStats.ether.current - building.upgrade_cost.ether
        })
        .eq('user_id', userId);

      setBuildings(prev => prev.map(b => b.id === building.id ? data : b));
      setResourceStats(prev => ({
        ...prev,
        stardust: { ...prev.stardust, current: prev.stardust.current - building.upgrade_cost.stardust },
        celestial_ore: { ...prev.celestial_ore, current: prev.celestial_ore.current - building.upgrade_cost.celestial_ore },
        ether: { ...prev.ether, current: prev.ether.current - building.upgrade_cost.ether }
      }));
    } catch (err) {
      setError('Failed to upgrade building');
      console.error('Error upgrading building:', err);
    }
  };

  const createTradeOffer = async () => {
    try {
      // Validate trade offer
      if (!newTradeOffer.offer?.amount || !newTradeOffer.request?.amount) {
        setError('Invalid trade offer');
        return;
      }

      // Check if player has enough resources
      const offerResource = newTradeOffer.offer.resource as keyof ResourceStats;
      if (resourceStats[offerResource].current < newTradeOffer.offer.amount) {
        setError('Insufficient resources for trade');
        return;
      }

      const { data, error } = await supabase
        .from('trade_offers')
        .insert([
          {
            player_id: userId,
            offer: newTradeOffer.offer,
            request: newTradeOffer.request,
            status: 'active',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTradeOffers(prev => [data, ...prev]);
      setNewTradeOffer({
        offer: { resource: 'stardust', amount: 0 },
        request: { resource: 'celestial_ore', amount: 0 }
      });
    } catch (err) {
      setError('Failed to create trade offer');
      console.error('Error creating trade offer:', err);
    }
  };

  const acceptTradeOffer = async (offer: TradeOffer) => {
    try {
      // Check if player has enough resources
      const requestResource = offer.request.resource as keyof ResourceStats;
      if (resourceStats[requestResource].current < offer.request.amount) {
        setError('Insufficient resources for trade');
        return;
      }

      // Update trade offer status
      await supabase
        .from('trade_offers')
        .update({ status: 'accepted' })
        .eq('id', offer.id);

      // Update both players' resources
      await supabase
        .from('player_resources')
        .update({
          [`stats.${offer.offer.resource}.current`]: resourceStats[offer.offer.resource].current + offer.offer.amount,
          [`stats.${offer.request.resource}.current`]: resourceStats[offer.request.resource].current - offer.request.amount
        })
        .eq('user_id', userId);

      await supabase
        .from('player_resources')
        .update({
          [`stats.${offer.offer.resource}.current`]: resourceStats[offer.offer.resource].current - offer.offer.amount,
          [`stats.${offer.request.resource}.current`]: resourceStats[offer.request.resource].current + offer.request.amount
        })
        .eq('user_id', offer.player_id);

      setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
      setResourceStats(prev => ({
        ...prev,
        [offer.offer.resource]: { ...prev[offer.offer.resource], current: prev[offer.offer.resource].current + offer.offer.amount },
        [offer.request.resource]: { ...prev[offer.request.resource], current: prev[offer.request.resource].current - offer.request.amount }
      }));
    } catch (err) {
      setError('Failed to accept trade offer');
      console.error('Error accepting trade offer:', err);
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'stardust':
        return '⭐';
      case 'celestial_ore':
        return '💎';
      case 'ether':
        return '✨';
      default:
        return '📦';
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'stardust':
        return 'text-red-500';
      case 'celestial_ore':
        return 'text-blue-500';
      case 'ether':
        return 'text-purple-500';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-cosmic-light-purple font-bold">Resource Management</h2>
          <div className="flex items-center gap-4">
            {Object.entries(resourceStats).map(([resource, stats]) => (
              <div key={resource} className="text-center">
                <div className={`text-lg ${getResourceColor(resource)}`}>
                  {getResourceIcon(resource)} {stats.current}/{stats.max}
                </div>
                <div className="text-xs text-slate-400">
                  +{stats.generation_rate}/s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {['overview', 'buildings', 'trading'].map(tab => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedTab === tab
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Resource Overview */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(resourceStats).map(([resource, stats]) => (
                    <div key={resource} className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-2xl ${getResourceColor(resource)}`}>
                          {getResourceIcon(resource)}
                        </span>
                        <div className="font-semibold text-white capitalize">{resource}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Current:</span>
                          <span className="text-white">{stats.current}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Max:</span>
                          <span className="text-white">{stats.max}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Generation:</span>
                          <span className="text-green-500">+{stats.generation_rate}/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Bonus:</span>
                          <span className="text-yellow-500">+{stats.bonus_rate}%</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1 bg-cosmic-dark/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${getResourceColor(resource)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.current / stats.max) * 100}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'buildings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Resource Buildings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {buildings.map(building => (
                    <div key={building.id} className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-2xl ${getResourceColor(building.type)}`}>
                          {getResourceIcon(building.type)}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{building.name}</div>
                          <div className="text-sm text-slate-400">Level {building.level}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Production:</span>
                          <span className="text-green-500">+{building.production_rate}/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Storage:</span>
                          <span className="text-white">{building.storage_capacity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Efficiency:</span>
                          <span className="text-yellow-500">{building.efficiency}%</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-slate-400 mb-2">Upgrade Cost:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-red-500">⭐ {building.upgrade_cost.stardust}</div>
                          <div className="text-blue-500">💎 {building.upgrade_cost.celestial_ore}</div>
                          <div className="text-purple-500">✨ {building.upgrade_cost.ether}</div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => upgradeBuilding(building)}
                          className="w-full mt-2 px-4 py-2 bg-cosmic-purple text-white rounded-lg font-semibold"
                        >
                          Upgrade
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'trading' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Create Trade Offer */}
                <div className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                  <h3 className="text-lg text-white font-semibold mb-4">Create Trade Offer</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Offer</label>
                      <div className="space-y-2">
                        <select
                          value={newTradeOffer.offer?.resource}
                          onChange={(e) => setNewTradeOffer({
                            ...newTradeOffer,
                            offer: { ...newTradeOffer.offer!, resource: e.target.value as any }
                          })}
                          className="w-full bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-2 text-white"
                        >
                          <option value="stardust">Stardust</option>
                          <option value="celestial_ore">Celestial Ore</option>
                          <option value="ether">Ether</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={newTradeOffer.offer?.amount}
                          onChange={(e) => setNewTradeOffer({
                            ...newTradeOffer,
                            offer: { ...newTradeOffer.offer!, amount: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Request</label>
                      <div className="space-y-2">
                        <select
                          value={newTradeOffer.request?.resource}
                          onChange={(e) => setNewTradeOffer({
                            ...newTradeOffer,
                            request: { ...newTradeOffer.request!, resource: e.target.value as any }
                          })}
                          className="w-full bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-2 text-white"
                        >
                          <option value="stardust">Stardust</option>
                          <option value="celestial_ore">Celestial Ore</option>
                          <option value="ether">Ether</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={newTradeOffer.request?.amount}
                          onChange={(e) => setNewTradeOffer({
                            ...newTradeOffer,
                            request: { ...newTradeOffer.request!, amount: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createTradeOffer}
                    className="w-full mt-4 px-4 py-2 bg-cosmic-purple text-white rounded-lg font-semibold"
                  >
                    Create Offer
                  </motion.button>
                </div>

                {/* Active Trade Offers */}
                <div className="space-y-4">
                  <h3 className="text-lg text-white font-semibold">Active Trade Offers</h3>
                  {tradeOffers.map(offer => (
                    <div key={offer.id} className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-lg ${getResourceColor(offer.offer.resource)}`}>
                              {getResourceIcon(offer.offer.resource)} {offer.offer.amount}
                            </div>
                            <div className="text-sm text-slate-400">Offered</div>
                          </div>
                          <div className="text-2xl">⇄</div>
                          <div className="text-center">
                            <div className={`text-lg ${getResourceColor(offer.request.resource)}`}>
                              {getResourceIcon(offer.request.resource)} {offer.request.amount}
                            </div>
                            <div className="text-sm text-slate-400">Requested</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            From: {offer.player_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(offer.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => acceptTradeOffer(offer)}
                        className="w-full mt-4 px-4 py-2 bg-cosmic-purple text-white rounded-lg font-semibold"
                      >
                        Accept Offer
                      </motion.button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ResourceSystem; 