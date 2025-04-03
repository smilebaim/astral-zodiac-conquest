import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Unit {
  id: string;
  name: string;
  type: 'infantry' | 'cavalry' | 'artillery' | 'naval' | 'air' | 'special';
  level: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
    range: number;
  };
  abilities: {
    name: string;
    description: string;
    effect: string;
    cooldown: number;
  }[];
  quantity: number;
  position: {
    x: number;
    y: number;
  };
  status: 'ready' | 'moving' | 'attacking' | 'defending' | 'retreating' | 'dead';
}

interface BattlePhase {
  id: string;
  name: 'preparation' | 'engagement' | 'clash' | 'resolution';
  start_time: string;
  end_time: string;
  status: 'pending' | 'active' | 'completed';
  current_turn: number;
  max_turns: number;
}

interface BattleLog {
  id: string;
  battle_id: string;
  turn: number;
  phase: BattlePhase['name'];
  type: 'combat' | 'ability' | 'movement' | 'status' | 'system';
  message: string;
  timestamp: string;
  unit_id?: string;
  target_id?: string;
  damage?: number;
  healing?: number;
  status_effect?: string;
}

interface BattleSystemProps {
  battleId: string;
  userId: string;
}

const BattleSystem: React.FC<BattleSystemProps> = ({ battleId, userId }) => {
  const [attackerUnits, setAttackerUnits] = useState<Unit[]>([]);
  const [defenderUnits, setDefenderUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [battlePhase, setBattlePhase] = useState<BattlePhase | null>(null);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleMap, setBattleMap] = useState<number[][]>([]);
  const [selectedAction, setSelectedAction] = useState<'move' | 'attack' | 'ability' | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchBattleData();
    subscribeToBattleUpdates();
  }, [battleId]);

  const fetchBattleData = async () => {
    try {
      // Fetch battle phase
      const { data: phaseData, error: phaseError } = await supabase
        .from('battle_phases')
        .select('*')
        .eq('battle_id', battleId)
        .single();

      if (phaseError) throw phaseError;
      setBattlePhase(phaseData);

      // Fetch units
      const { data: unitsData, error: unitsError } = await supabase
        .from('battle_units')
        .select('*')
        .eq('battle_id', battleId);

      if (unitsError) throw unitsError;

      const attackerUnits = unitsData.filter(unit => unit.side === 'attacker');
      const defenderUnits = unitsData.filter(unit => unit.side === 'defender');
      setAttackerUnits(attackerUnits);
      setDefenderUnits(defenderUnits);

      // Fetch battle logs
      const { data: logsData, error: logsError } = await supabase
        .from('battle_logs')
        .select('*')
        .eq('battle_id', battleId)
        .order('timestamp', { ascending: true });

      if (logsError) throw logsError;
      setBattleLogs(logsData);

      // Generate battle map
      generateBattleMap(attackerUnits, defenderUnits);
    } catch (err) {
      setError('Failed to fetch battle data');
      console.error('Error fetching battle data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToBattleUpdates = () => {
    const channel = supabase
      .channel('battle-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_units',
          filter: `battle_id=eq.${battleId}`,
        },
        (payload) => {
          const unit = payload.new;
          if (unit.side === 'attacker') {
            setAttackerUnits(prev => updateUnit(prev, unit));
          } else {
            setDefenderUnits(prev => updateUnit(prev, unit));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_logs',
          filter: `battle_id=eq.${battleId}`,
        },
        (payload) => {
          setBattleLogs(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const updateUnit = (units: Unit[], updatedUnit: Unit) => {
    const index = units.findIndex(u => u.id === updatedUnit.id);
    if (index === -1) {
      return [...units, updatedUnit];
    }
    const newUnits = [...units];
    newUnits[index] = updatedUnit;
    return newUnits;
  };

  const generateBattleMap = (attackerUnits: Unit[], defenderUnits: Unit[]) => {
    const mapSize = 10;
    const map = Array(mapSize).fill(0).map(() => Array(mapSize).fill(0));
    
    // Place units on the map
    attackerUnits.forEach(unit => {
      map[unit.position.y][unit.position.x] = 1; // 1 for attacker
    });
    
    defenderUnits.forEach(unit => {
      map[unit.position.y][unit.position.x] = 2; // 2 for defender
    });

    setBattleMap(map);
  };

  const handleUnitAction = async (action: 'move' | 'attack' | 'ability', targetPos?: { x: number; y: number }) => {
    if (!selectedUnit || !battlePhase || battlePhase.status !== 'active') return;

    try {
      let actionData = {
        unit_id: selectedUnit.id,
        action_type: action,
        target_position: targetPos,
        battle_id: battleId,
        phase_id: battlePhase.id,
        turn: battlePhase.current_turn
      };

      const { error } = await supabase
        .from('battle_actions')
        .insert([actionData]);

      if (error) throw error;

      // Reset selection
      setSelectedUnit(null);
      setSelectedAction(null);
      setTargetPosition(null);
    } catch (err) {
      setError('Failed to execute unit action');
      console.error('Error executing unit action:', err);
    }
  };

  const getUnitIcon = (type: Unit['type']) => {
    switch (type) {
      case 'infantry':
        return '👥';
      case 'cavalry':
        return '🐎';
      case 'artillery':
        return '💥';
      case 'naval':
        return '🚢';
      case 'air':
        return '✈️';
      case 'special':
        return '🌟';
      default:
        return '❓';
    }
  };

  const getUnitColor = (side: 'attacker' | 'defender') => {
    return side === 'attacker' ? 'text-blue-500' : 'text-red-500';
  };

  const getPhaseColor = (phase: BattlePhase['name']) => {
    switch (phase) {
      case 'preparation':
        return 'text-yellow-500';
      case 'engagement':
        return 'text-green-500';
      case 'clash':
        return 'text-red-500';
      case 'resolution':
        return 'text-purple-500';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-cosmic-light-purple font-bold">Battle System</h2>
          {battlePhase && (
            <div className="flex items-center gap-2">
              <span className={`text-lg ${getPhaseColor(battlePhase.name)}`}>
                {battlePhase.name.charAt(0).toUpperCase() + battlePhase.name.slice(1)}
              </span>
              <span className="text-slate-400">
                Turn {battlePhase.current_turn}/{battlePhase.max_turns}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Battle Map */}
            <div className="md:col-span-2">
              <div className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                <div className="grid grid-cols-10 gap-1">
                  {battleMap.map((row, y) => (
                    row.map((cell, x) => (
                      <motion.div
                        key={`${x}-${y}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (selectedAction && selectedUnit) {
                            handleUnitAction(selectedAction, { x, y });
                          }
                        }}
                        className={`aspect-square rounded-sm cursor-pointer ${
                          cell === 0 ? 'bg-cosmic-dark/30' :
                          cell === 1 ? 'bg-blue-500/30' :
                          'bg-red-500/30'
                        } ${
                          targetPosition?.x === x && targetPosition?.y === y
                            ? 'ring-2 ring-cosmic-purple'
                            : ''
                        }`}
                      >
                        {cell !== 0 && (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {cell === 1 ? '🔵' : '🔴'}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ))}
                </div>
              </div>
            </div>

            {/* Unit List */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg text-white font-semibold mb-2">Your Units</h3>
                <div className="space-y-2">
                  {attackerUnits.map(unit => (
                    <motion.div
                      key={unit.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUnit(unit)}
                      className={`bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4 cursor-pointer ${
                        selectedUnit?.id === unit.id ? 'border-cosmic-purple' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getUnitIcon(unit.type)}</span>
                        <div>
                          <div className="font-semibold text-white">{unit.name}</div>
                          <div className="text-sm text-slate-400">Level {unit.level}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-red-500">⚔️ {unit.stats.attack}</div>
                        <div className="text-blue-500">🛡️ {unit.stats.defense}</div>
                        <div className="text-green-500">⚡ {unit.stats.speed}</div>
                        <div className="text-yellow-500">❤️ {unit.stats.health}</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        Quantity: {unit.quantity}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Unit Actions */}
              {selectedUnit && (
                <div className="space-y-2">
                  <h3 className="text-lg text-white font-semibold">Unit Actions</h3>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAction('move')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        selectedAction === 'move'
                          ? 'bg-cosmic-purple text-white'
                          : 'bg-cosmic-dark/50 text-slate-400'
                      }`}
                    >
                      Move
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAction('attack')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        selectedAction === 'attack'
                          ? 'bg-cosmic-purple text-white'
                          : 'bg-cosmic-dark/50 text-slate-400'
                      }`}
                    >
                      Attack
                    </motion.button>
                    {selectedUnit.abilities.map((ability, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAction('ability')}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          selectedAction === 'ability'
                            ? 'bg-cosmic-purple text-white'
                            : 'bg-cosmic-dark/50 text-slate-400'
                        }`}
                      >
                        {ability.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Battle Logs */}
              <div>
                <h3 className="text-lg text-white font-semibold mb-2">Battle Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {battleLogs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-2"
                    >
                      <div className="text-xs text-slate-400 mb-1">
                        Turn {log.turn} - {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`text-sm ${
                        log.type === 'combat' ? 'text-red-500' :
                        log.type === 'ability' ? 'text-blue-500' :
                        log.type === 'movement' ? 'text-green-500' :
                        log.type === 'status' ? 'text-yellow-500' :
                        'text-slate-400'
                      }`}>
                        {log.message}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSystem; 