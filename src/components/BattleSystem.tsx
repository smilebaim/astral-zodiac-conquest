import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ZodiacProps } from './ZodiacCard';
import zodiacAbilities from '@/data/zodiacAbilities';
import { CombatUnit } from '@/data/combatUnits';
import { Shield, Swords, Flag, Clock, Zap, Target, Users, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TerrainType {
  id: string;
  name: string;
  movementCost: number;
  attackModifier: number;
  defenseModifier: number;
  visual: string;
}

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
  side?: 'attacker' | 'defender';
  current_health?: number;
  animation?: {
    type: 'attack' | 'move' | 'ability';
    direction: 'left' | 'right' | 'up' | 'down';
    progress: number;
  };
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

interface BattleSystemProps {
  userZodiac: ZodiacProps;
  userKingdom: {
    id: string;
    name: string;
    units: Unit[];
    resources: {
      stardust: number;
      celestialOre: number;
      ether: number;
    };
  };
  onBattleComplete?: (result: BattleResult) => void;
  isMultiplayer?: boolean;
  opponentData?: {
    id: string;
    name: string;
    zodiac: ZodiacProps;
  };
}

interface BattleResult {
  winner: string;
  resources_gained: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  experience_gained: number;
  units_lost: Unit[];
  units_gained: Unit[];
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

const BattleSystem: React.FC<BattleSystemProps> = ({ userZodiac, userKingdom, onBattleComplete, isMultiplayer, opponentData }) => {
  const [chatMessages, setChatMessages] = useState<{player: string, message: string, timestamp: number}[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [timeLeft, setTimeLeft] = useState(30);
  const [matchStats, setMatchStats] = useState({
    totalMoves: 0,
    abilitiesUsed: 0,
    damageDealt: 0,
    unitsLost: 0
  });
  const [battleChat, setBattleChat] = useState<BattleMessage[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnTimer, setTurnTimer] = useState(30);
  const multiplayerService = MultiplayerService();
const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
const [pendingActions, setPendingActions] = useState<Array<{action: string, timestamp: number}>>([]);
const [lastActionValidated, setLastActionValidated] = useState<boolean>(true);
  // Connection handling
useEffect(() => {
  const handleConnectionChange = (status: 'connected' | 'disconnected') => {
    setConnectionStatus(status === 'connected' ? 'connected' : 'reconnecting');
    
    if (status === 'disconnected') {
      toast({
        title: "Connection lost",
        description: "Attempting to reconnect...",
        variant: "destructive"
      });
      
      // Attempt reconnection
      const interval = setInterval(() => {
        multiplayerService.reconnect().then(success => {
          if (success) {
            clearInterval(interval);
            setConnectionStatus('connected');
            toast({
              title: "Reconnected!",
              description: "Your connection has been restored."
            });
            
            // Resend pending actions
            if (pendingActions.length > 0) {
              pendingActions.forEach(action => {
                multiplayerService.sendAction(action);
              });
              setPendingActions([]);
            }
          }
        });
      }, 5000);
      
      return () => clearInterval(interval);
    }
  };
  
  multiplayerService.onConnectionChange(handleConnectionChange);
  return () => multiplayerService.offConnectionChange(handleConnectionChange);
}, [multiplayerService, toast]);

// Action validation
const validatePlayerAction = (action: string) => {
  if (connectionStatus !== 'connected') {
    setPendingActions(prev => [...prev, {action, timestamp: Date.now()}]);
    return false;
  }
  
  // Check if action is valid based on current game state
  const isValid = multiplayerService.validateAction(action, {
    currentTurn,
    battlePhase,
    selectedUnit
  });
  
  setLastActionValidated(isValid);
  if (!isValid) {
    toast({
      title: "Invalid action",
      description: "This action cannot be performed at this time.",
      variant: "destructive"
    });
  }
  
  return isValid;
};

// Battle state
  const [battleId, setBattleId] = useState<string>(`battle-${Date.now()}`);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>({
    id: `phase-${Date.now()}`,
    name: 'preparation',
    start_time: new Date().toISOString(),
    end_time: '',
    status: 'pending',
    current_turn: 1,
    max_turns: 10
  });
  const [enemyKingdom, setEnemyKingdom] = useState<typeof userKingdom | null>(null);
  
  // Units state
  const [attackerUnits, setAttackerUnits] = useState<Unit[]>([]);
  const [defenderUnits, setDefenderUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedAction, setSelectedAction] = useState<'move' | 'attack' | 'ability' | null>(null);
  const [targetPosition, setTargetPosition] = useState<{x: number, y: number} | null>(null);
  
  // Battle map
  const [terrainMap, setTerrainMap] = useState<TerrainType[][]>([]);
const [unitFormations, setUnitFormations] = useState<Record<string, string>>({});
const [zodiacSynergies, setZodiacSynergies] = useState<Record<string, number>>({});
const [battleMap, setBattleMap] = useState<number[][]>([]);
  
  // UI state
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
const [statsReport, setStatsReport] = useState<{
  damageDealt: number;
  damageTaken: number;
  abilityUsage: Record<string, number>;
  movementMap: number[][];
} | null>(null);
  const { toast } = useToast();
  
  // Refs
  const battleLogRef = useRef<HTMLDivElement>(null);

  // Terrain effects calculation
const calculateTerrainEffects = (unit: Unit, position: {x: number, y: number}) => {
  const terrain = terrainMap[position.y]?.[position.x];
  if (!terrain) return;
  
  return {
    attack: unit.stats.attack * (1 + terrain.attackModifier),
    defense: unit.stats.defense * (1 + terrain.defenseModifier),
    speed: Math.max(1, unit.stats.speed - terrain.movementCost)
  };
};

  const evaluateBattleState = () => {
    const enemyUnits = defenderUnits.filter(u => u.status !== 'dead');
    const playerUnits = attackerUnits.filter(u => u.status !== 'dead');
    
    return {
      strengthRatio: enemyUnits.reduce((a,b) => a + b.stats.attack, 0) / 
                    playerUnits.reduce((a,b) => a + b.stats.defense, 1),
      terrainAdvantage: enemyUnits.some(u => 
        terrainMap[u.position.y]?.[u.position.x]?.defenseModifier > 0
      ),
      zodiacSynergy: zodiacSynergies[enemyKingdom?.name || ''] || 0
    };
  };

  // Leaderboard updates
useEffect(() => {
  if (!isMultiplayer) return;
  
  const handleLeaderboardUpdate = (data: {players: Array<{id: string, name: string, score: number}>}) => {
    // Update UI with latest leaderboard data
  };
  
  multiplayerService.onLeaderboardUpdate(handleLeaderboardUpdate);
  return () => multiplayerService.offLeaderboardUpdate(handleLeaderboardUpdate);
}, [isMultiplayer, multiplayerService]);

const executeAIStrategy = (strategy: AIStrategy) => {
    const state = evaluateBattleState();
    
    defenderUnits.forEach(unit => {
      if (unit.status === 'dead') return;

      // Target selection logic
      const targets = attackerUnits
        .filter(u => u.status !== 'dead')
        .map(target => ({
          target,
          threatLevel: (target.stats.attack * (zodiacSynergies[userZodiac.name] || 1)) /
                      (unit.stats.defense * (calculateTerrainEffects(unit, unit.position)?.defense || 1))
        }))
        .sort((a, b) => strategy.targetPriority === 'weakest' ? 
          a.threatLevel - b.threatLevel : b.threatLevel - a.threatLevel);

      const bestTarget = targets[0]?.target;
      
      if (bestTarget) {
        // Movement and attack logic
        const moveRange = Math.floor(unit.stats.speed * 
          (state.terrainAdvantage ? 1.2 : 0.8));
        
        // Implement pathfinding with terrain cost consideration
        const attackPosition = calculateOptimalPosition(unit, bestTarget, moveRange);
        
        // Execute attack
        handleUnitAttack(unit, bestTarget);
      }
    });
  };

  const calculateOptimalPosition = (unit: Unit, target: Unit, maxRange: number) => {
    // Simplified pathfinding algorithm with terrain cost
    const positions = [];
    for (let x = unit.position.x - maxRange; x <= unit.position.x + maxRange; x++) {
      for (let y = unit.position.y - maxRange; y <= unit.position.y + maxRange; y++) {
        if (x >= 0 && y >= 0 && x < battleMap[0]?.length && y < battleMap.length) {
          const terrain = terrainMap[y][x];
          if (terrain && (Math.abs(x - unit.position.x) + Math.abs(y - unit.position.y)) <= maxRange) {
            positions.push({
              x, y,
              attackValue: (unit.stats.attack * (1 + terrain.attackModifier)) -
                          (target.stats.defense * (1 + (calculateTerrainEffects(target, target.position)?.defense || 0))),
              defenseValue: unit.stats.defense * (1 + terrain.defenseModifier)
            });
          }
        }
      }
    }
    return positions.sort((a, b) => b.attackValue - a.attackValue)[0] || unit.position;
  };

// Initialize battle
  useEffect(() => {
    initializeBattle();
    
    // Setup multiplayer subscriptions if applicable
    if (isMultiplayer) {
      const unsubscribeBattle = multiplayerService.syncBattleState(battleId, (payload) => {
        // Handle battle state updates from opponent
        if (payload.new.current_turn !== battlePhase.current_turn) {
          setIsPlayerTurn(!isPlayerTurn);
          setTurnTimer(30);
        }
      });
      
      const unsubscribeChat = multiplayerService.subscribeToBattleChat(battleId, (payload) => {
        setBattleChat(prev => [...prev, payload.new]);
      });
      
      return () => {
        unsubscribeBattle();
        unsubscribeChat();
      };
    }
  }, []);

  // Auto-scroll battle log
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLogs]);
  
  // Turn timer countdown
  useEffect(() => {
    if (!isMultiplayer || !isPlayerTurn) return;
    
    const timer = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlayerTurn, isMultiplayer]);

  // Terrain effects calculation
const calculateTerrainEffects = (unit: Unit, position: {x: number, y: number}) => {
  const terrain = terrainMap[position.y]?.[position.x];
  if (!terrain) return;
  
  return {
    attack: unit.stats.attack * (1 + terrain.attackModifier),
    defense: unit.stats.defense * (1 + terrain.defenseModifier),
    speed: Math.max(1, unit.stats.speed - terrain.movementCost)
  };
};

  const evaluateBattleState = () => {
    const enemyUnits = defenderUnits.filter(u => u.status !== 'dead');
    const playerUnits = attackerUnits.filter(u => u.status !== 'dead');
    
    return {
      strengthRatio: enemyUnits.reduce((a,b) => a + b.stats.attack, 0) / 
                    playerUnits.reduce((a,b) => a + b.stats.defense, 1),
      terrainAdvantage: enemyUnits.some(u => 
        terrainMap[u.position.y]?.[u.position.x]?.defenseModifier > 0
      ),
      zodiacSynergy: zodiacSynergies[enemyKingdom?.name || ''] || 0
    };
  };

  // Leaderboard updates
useEffect(() => {
  if (!isMultiplayer) return;
  
  const handleLeaderboardUpdate = (data: {players: Array<{id: string, name: string, score: number}>}) => {
    // Update UI with latest leaderboard data
  };
  
  multiplayerService.onLeaderboardUpdate(handleLeaderboardUpdate);
  return () => multiplayerService.offLeaderboardUpdate(handleLeaderboardUpdate);
}, [isMultiplayer, multiplayerService]);

const executeAIStrategy = (strategy: AIStrategy) => {
    const state = evaluateBattleState();
    
    defenderUnits.forEach(unit => {
      if (unit.status === 'dead') return;

      // Target selection logic
      const targets = attackerUnits
        .filter(u => u.status !== 'dead')
        .map(target => ({
          target,
          threatLevel: (target.stats.attack * (zodiacSynergies[userZodiac.name] || 1)) /
                      (unit.stats.defense * (calculateTerrainEffects(unit, unit.position)?.defense || 1))
        }))
        .sort((a, b) => strategy.targetPriority === 'weakest' ? 
          a.threatLevel - b.threatLevel : b.threatLevel - a.threatLevel);

      const bestTarget = targets[0]?.target;
      
      if (bestTarget) {
        // Movement and attack logic
        const moveRange = Math.floor(unit.stats.speed * 
          (state.terrainAdvantage ? 1.2 : 0.8));
        
        // Implement pathfinding with terrain cost consideration
        const attackPosition = calculateOptimalPosition(unit, bestTarget, moveRange);
        
        // Execute attack
        handleUnitAttack(unit, bestTarget);
      }
    });
  };

  const calculateOptimalPosition = (unit: Unit, target: Unit, maxRange: number) => {
    // Simplified pathfinding algorithm with terrain cost
    const positions = [];
    for (let x = unit.position.x - maxRange; x <= unit.position.x + maxRange; x++) {
      for (let y = unit.position.y - maxRange; y <= unit.position.y + maxRange; y++) {
        if (x >= 0 && y >= 0 && x < battleMap[0]?.length && y < battleMap.length) {
          const terrain = terrainMap[y][x];
          if (terrain && (Math.abs(x - unit.position.x) + Math.abs(y - unit.position.y)) <= maxRange) {
            positions.push({
              x, y,
              attackValue: (unit.stats.attack * (1 + terrain.attackModifier)) -
                          (target.stats.defense * (1 + (calculateTerrainEffects(target, target.position)?.defense || 0))),
              defenseValue: unit.stats.defense * (1 + terrain.defenseModifier)
            });
          }
        }
      }
    }
    return positions.sort((a, b) => b.attackValue - a.attackValue)[0] || unit.position;
  };

// Initialize battle
  const initializeBattle = async () => {
    setIsLoading(true);
    try {
      // Fetch potential enemy kingdoms based on player level
      await fetchPotentialEnemies();
      
      // Terrain effects calculation
const calculateTerrainEffects = (unit: Unit, position: {x: number, y: number}) => {
  const terrain = terrainMap[position.y]?.[position.x];
  if (!terrain) return;
  
  return {
    attack: unit.stats.attack * (1 + terrain.attackModifier),
    defense: unit.stats.defense * (1 + terrain.defenseModifier),
    speed: Math.max(1, unit.stats.speed - terrain.movementCost)
  };
};

  const evaluateBattleState = () => {
    const enemyUnits = defenderUnits.filter(u => u.status !== 'dead');
    const playerUnits = attackerUnits.filter(u => u.status !== 'dead');
    
    return {
      strengthRatio: enemyUnits.reduce((a,b) => a + b.stats.attack, 0) / 
                    playerUnits.reduce((a,b) => a + b.stats.defense, 1),
      terrainAdvantage: enemyUnits.some(u => 
        terrainMap[u.position.y]?.[u.position.x]?.defenseModifier > 0
      ),
      zodiacSynergy: zodiacSynergies[enemyKingdom?.name || ''] || 0
    };
  };

  // Leaderboard updates
useEffect(() => {
  if (!isMultiplayer) return;
  
  const handleLeaderboardUpdate = (data: {players: Array<{id: string, name: string, score: number}>}) => {
    // Update UI with latest leaderboard data
  };
  
  multiplayerService.onLeaderboardUpdate(handleLeaderboardUpdate);
  return () => multiplayerService.offLeaderboardUpdate(handleLeaderboardUpdate);
}, [isMultiplayer, multiplayerService]);

const executeAIStrategy = (strategy: AIStrategy) => {
    const state = evaluateBattleState();
    
    defenderUnits.forEach(unit => {
      if (unit.status === 'dead') return;

      // Target selection logic
      const targets = attackerUnits
        .filter(u => u.status !== 'dead')
        .map(target => ({
          target,
          threatLevel: (target.stats.attack * (zodiacSynergies[userZodiac.name] || 1)) /
                      (unit.stats.defense * (calculateTerrainEffects(unit, unit.position)?.defense || 1))
        }))
        .sort((a, b) => strategy.targetPriority === 'weakest' ? 
          a.threatLevel - b.threatLevel : b.threatLevel - a.threatLevel);

      const bestTarget = targets[0]?.target;
      
      if (bestTarget) {
        // Movement and attack logic
        const moveRange = Math.floor(unit.stats.speed * 
          (state.terrainAdvantage ? 1.2 : 0.8));
        
        // Implement pathfinding with terrain cost consideration
        const attackPosition = calculateOptimalPosition(unit, bestTarget, moveRange);
        
        // Execute attack
        handleUnitAttack(unit, bestTarget);
      }
    });
  };

  const calculateOptimalPosition = (unit: Unit, target: Unit, maxRange: number) => {
    // Simplified pathfinding algorithm with terrain cost
    const positions = [];
    for (let x = unit.position.x - maxRange; x <= unit.position.x + maxRange; x++) {
      for (let y = unit.position.y - maxRange; y <= unit.position.y + maxRange; y++) {
        if (x >= 0 && y >= 0 && x < battleMap[0]?.length && y < battleMap.length) {
          const terrain = terrainMap[y][x];
          if (terrain && (Math.abs(x - unit.position.x) + Math.abs(y - unit.position.y)) <= maxRange) {
            positions.push({
              x, y,
              attackValue: (unit.stats.attack * (1 + terrain.attackModifier)) -
                          (target.stats.defense * (1 + (calculateTerrainEffects(target, target.position)?.defense || 0))),
              defenseValue: unit.stats.defense * (1 + terrain.defenseModifier)
            });
          }
        }
      }
    }
    return positions.sort((a, b) => b.attackValue - a.attackValue)[0] || unit.position;
  };

// Initialize battle data
  const initializeBattleData = async (isMultiplayer = false, opponentData?: any) => {
    try {
      // Convert user kingdom units to battle units
      const userBattleUnits = userKingdom.units.map(unit => ({
        ...unit,
        side: 'attacker' as const,
        current_health: unit.stats.health,
        // Set initial positions for user units (bottom of the map)
        position: {
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 3) + 7, // Position in the bottom 3 rows
        },
      }));

      // If multiplayer, setup opponent units
      if (isMultiplayer && opponentData) {
        const opponentUnits = opponentData.units.map(unit => ({
          ...unit,
          side: 'defender' as const,
          current_health: unit.stats.health,
          // Set initial positions for opponent units (top of the map)
          position: {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 3), // Position in the top 3 rows
          },
        }));

        return {
          userUnits: userBattleUnits,
          opponentUnits,
          battleMap: opponentData.battleMap || battleMap,
          terrainMap: opponentData.terrainMap || terrainMap
        };
      }
      
      setAttackerUnits(userBattleUnits);
      
      // Generate battle map
      generateBattleMap(userBattleUnits, defenderUnits);
    } catch (error: any) {
      throw new Error('Failed to initialize battle data: ' + error.message);
    }
  };

  // Update battle phase
  const updateBattlePhase = (phaseName: BattlePhase['name']) => {
    const newPhase = {
      ...battlePhase,
      name: phaseName,
      start_time: new Date().toISOString(),
      status: phaseName === 'resolution' ? 'completed' : 'active',
    };
    
    setBattlePhase(newPhase);
    
    // Add battle log for phase change
    addBattleLog({
      type: 'system',
      message: `Battle phase changed to ${phaseName.toUpperCase()}`,
    });
    
    // If phase is resolution, determine battle result
    if (phaseName === 'resolution') {
      determineBattleResult();
    }
  };

  // Add battle log
  const addBattleLog = (log: Partial<BattleLog>) => {
    const newLog: BattleLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      battle_id: battleId,
      turn: battlePhase.current_turn,
      phase: battlePhase.name,
      type: log.type || 'system',
      message: log.message || '',
      timestamp: new Date().toISOString(),
      unit_id: log.unit_id,
      target_id: log.target_id,
      damage: log.damage,
      healing: log.healing,
      status_effect: log.status_effect,
    };
    
    setBattleLogs(prev => [...prev, newLog]);
  };

  // Generate battle map
  const generateBattleMap = (attackerUnits: Unit[], defenderUnits: Unit[]) => {
    const mapSize = 10;
    const map = Array(mapSize).fill(0).map(() => Array(mapSize).fill(0));
    
    // Place units on the map
    attackerUnits.forEach(unit => {
      if (unit.position && unit.position.x >= 0 && unit.position.y >= 0 && 
          unit.position.x < mapSize && unit.position.y < mapSize) {
        map[unit.position.y][unit.position.x] = 1; // 1 for attacker
      }
    });
    
    defenderUnits.forEach(unit => {
      if (unit.position && unit.position.x >= 0 && unit.position.y >= 0 && 
          unit.position.x < mapSize && unit.position.y < mapSize) {
        map[unit.position.y][unit.position.x] = 2; // 2 for defender
      }
    });

    setBattleMap(map);
  };

  // Handle unit action
  const handleUnitAction = async (action: 'move' | 'attack' | 'ability', targetPos?: { x: number; y: number }) => {
    if(isMultiplayer && currentTurn !== 'player') {
      toast({
        title: 'Not Your Turn',
        description: 'Wait for opponent to complete their action',
        variant: 'destructive',
      });
      return;
    }

    if(isMultiplayer) {
      multiplayerService.sendPlayerAction({
        type: action,
        payload: {
          unitId: selectedUnit?.id,
          action,
          targetPos
        }
      });
      setMatchStats(prev => ({
        ...prev,
        totalMoves: prev.totalMoves + 1,
        abilitiesUsed: action === 'ability' ? prev.abilitiesUsed + 1 : prev.abilitiesUsed
      }));
    }
    if (!selectedUnit || battlePhase.status !== 'active') return;

    try {
      switch (action) {
        case 'move':
          if (targetPos) {
            moveUnit(selectedUnit, targetPos);
          }
          break;
        case 'attack':
          if (targetPos) {
            const targetUnit = findUnitAtPosition(targetPos);
            if (targetUnit && targetUnit.side !== selectedUnit.side) {
              attackUnit(selectedUnit, targetUnit);
            } else {
              toast({
                title: 'Invalid Target',
                description: 'No enemy unit at the selected position',
                variant: 'destructive',
              });
            }
          }
          break;
        case 'ability':
          if (selectedUnit.abilities.length > 0) {
            useAbility(selectedUnit, selectedUnit.abilities[0], targetPos);
          }
          break;
      }

      // Reset selection after action
      setSelectedAction(null);
      setTargetPosition(null);
      
      // Check if battle should advance to next phase
      checkBattleProgress();
    } catch (err: any) {
      setError('Failed to execute unit action');
      console.error('Error executing unit action:', err);
      toast({
        title: 'Error',
        description: 'Failed to execute unit action',
        variant: 'destructive',
      });
    }
  };

  // Move unit
  const moveUnit = (unit: Unit, targetPos: { x: number; y: number }) => {
    // Check if the move is valid (within range based on unit speed)
    const distance = Math.sqrt(
      Math.pow(targetPos.x - unit.position.x, 2) + 
      Math.pow(targetPos.y - unit.position.y, 2)
    );
    
    if (distance > unit.stats.speed / 2) {
      toast({
        title: 'Invalid Move',
        description: 'Target position is too far away',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if target position is empty
    if (battleMap[targetPos.y][targetPos.x] !== 0) {
      toast({
        title: 'Invalid Move',
        description: 'Target position is already occupied',
        variant: 'destructive',
      });
      return;
    }
    
    // Update unit position
    const updatedUnit = { ...unit, position: targetPos, status: 'moving' as const };
    
    // Update units array
    if (unit.side === 'attacker') {
      setAttackerUnits(prev => updateUnit(prev, updatedUnit));
    } else {
      setDefenderUnits(prev => updateUnit(prev, updatedUnit));
    }
    
    // Update battle map
    const newMap = [...battleMap];
    newMap[unit.position.y][unit.position.x] = 0; // Clear old position
    newMap[targetPos.y][targetPos.x] = unit.side === 'attacker' ? 1 : 2; // Set new position
    setBattleMap(newMap);
    
    // Add battle log
    addBattleLog({
      type: 'movement',
      message: `${unit.name} moved to position (${targetPos.x}, ${targetPos.y})`,
      unit_id: unit.id,
    });
    
    // Set unit status back to ready after a delay
    setTimeout(() => {
      if (unit.side === 'attacker') {
        setAttackerUnits(prev => 
          updateUnit(prev, { ...updatedUnit, status: 'ready' as const })
        );
      } else {
        setDefenderUnits(prev => 
          updateUnit(prev, { ...updatedUnit, status: 'ready' as const })
        );
      }
    }, 1000);
  };

  // Attack unit
  const attackUnit = (attacker: Unit, defender: Unit) => {
    // Check if the attack is valid (within range)
    const distance = Math.sqrt(
      Math.pow(defender.position.x - attacker.position.x, 2) + 
      Math.pow(defender.position.y - attacker.position.y, 2)
    );
    
    if (distance > attacker.stats.range) {
      toast({
        title: 'Invalid Attack',
        description: 'Target is out of range',
        variant: 'destructive',
      });
      return;
    }
    
    // Calculate damage
    const baseDamage = attacker.stats.attack * attacker.quantity;
    const defense = defender.stats.defense;
    const damage = Math.max(1, Math.floor(baseDamage * (100 / (100 + defense))));
    
    // Apply damage to defender
    const updatedDefender = { 
      ...defender, 
      current_health: Math.max(0, (defender.current_health || defender.stats.health) - damage),
      status: 'defending' as const
    };
    
    // Check if defender is defeated
    if (updatedDefender.current_health <= 0) {
      updatedDefender.status = 'dead';
      updatedDefender.quantity = 0;
    } else {
      // Calculate remaining units based on health percentage
      const healthPercentage = updatedDefender.current_health / defender.stats.health;
      updatedDefender.quantity = Math.max(1, Math.floor(defender.quantity * healthPercentage));
    }
    
    // Update attacker status
    const updatedAttacker = { ...attacker, status: 'attacking' as const };
    
    // Update units arrays
    if (attacker.side === 'attacker') {
      setAttackerUnits(prev => updateUnit(prev, updatedAttacker));
    } else {
      setDefenderUnits(prev => updateUnit(prev, updatedAttacker));
    }
    
    if (defender.side === 'attacker') {
      setAttackerUnits(prev => updateUnit(prev, updatedDefender));
    } else {
      setDefenderUnits(prev => updateUnit(prev, updatedDefender));
    }
    
    // Add battle log
    addBattleLog({
      type: 'combat',
      message: `${attacker.name} attacked ${defender.name} for ${damage} damage!`,
      unit_id: attacker.id,
      target_id: defender.id,
      damage: damage,
    });
    
    // If defender is defeated, add another log
    if (updatedDefender.status === 'dead') {
      addBattleLog({
        type: 'combat',
        message: `${defender.name} was defeated!`,
        unit_id: defender.id,
      });
      
      // Update battle map to remove defeated unit
      const newMap = [...battleMap];
      newMap[defender.position.y][defender.position.x] = 0;
      setBattleMap(newMap);
    }
    
    // Set units status back to ready after a delay
    setTimeout(() => {
      if (attacker.side === 'attacker') {
        setAttackerUnits(prev => 
          updateUnit(prev, { ...updatedAttacker, status: 'ready' as const })
        );
      } else {
        setDefenderUnits(prev => 
          updateUnit(prev, { ...updatedAttacker, status: 'ready' as const })
        );
      }
      
      if (updatedDefender.status !== 'dead') {
        if (defender.side === 'attacker') {
          setAttackerUnits(prev => 
            updateUnit(prev, { ...updatedDefender, status: 'ready' as const })
          );
        } else {
          setDefenderUnits(prev => 
            updateUnit(prev, { ...updatedDefender, status: 'ready' as const })
          );
        }
      }
    }, 1000);
  };

  // Use ability
  const useAbility = (unit: Unit, ability: Unit['abilities'][0], targetPos?: { x: number; y: number }) => {
    // Implement ability effects based on the ability type
    addBattleLog({
      type: 'ability',
      message: `${unit.name} used ${ability.name}!`,
      unit_id: unit.id,
    });
    
    // For now, just show a toast with the ability description
    toast({
      title: ability.name,
      description: ability.description,
    });
    
    // In a real implementation, apply the ability effects
    // This would depend on the specific ability and its effect
  };

  // Find unit at position
  const findUnitAtPosition = (position: { x: number; y: number }): Unit | undefined => {
    const attackerUnit = attackerUnits.find(
      unit => unit.position.x === position.x && unit.position.y === position.y
    );
    
    if (attackerUnit) return attackerUnit;
    
    const defenderUnit = defenderUnits.find(
      unit => unit.position.x === position.x && unit.position.y === position.y
    );
    
    return defenderUnit;
  };

  // Update unit in array
  const updateUnit = (units: Unit[], updatedUnit: Unit) => {
    const index = units.findIndex(u => u.id === updatedUnit.id);
    if (index === -1) {
      return [...units, updatedUnit];
    }
    const newUnits = [...units];
    newUnits[index] = updatedUnit;
    return newUnits;
  };

  // Check battle progress
  const checkBattleProgress = () => {
    // Check if all units of one side are defeated
    const activeAttackers = attackerUnits.filter(unit => unit.status !== 'dead');
    const activeDefenders = defenderUnits.filter(unit => unit.status !== 'dead');
    
    if (activeAttackers.length === 0) {
      // All attacker units defeated
      updateBattlePhase('resolution');
      return;
    }
    
    if (activeDefenders.length === 0) {
      // All defender units defeated
      updateBattlePhase('resolution');
      return;
    }
    
    // Check if we should advance to the next phase based on turn count
    if (battlePhase.current_turn >= battlePhase.max_turns) {
      // Max turns reached, move to resolution
      updateBattlePhase('resolution');
      return;
    }
    
    // Check if we should advance to the next phase based on current phase
    switch (battlePhase.name) {
      case 'preparation':
        // After preparation, move to engagement
        updateBattlePhase('engagement');
        break;
      case 'engagement':
        // After a few turns in engagement, move to clash
        if (battlePhase.current_turn >= 3) {
          updateBattlePhase('clash');
        } else {
          // Increment turn counter
          setBattlePhase(prev => ({
            ...prev,
            current_turn: prev.current_turn + 1
          }));
          
          // Add turn log
          addBattleLog({
            type: 'system',
            message: `Turn ${battlePhase.current_turn + 1} begins`,
          });
        }
        break;
      case 'clash':
        // Increment turn counter
        setBattlePhase(prev => ({
          ...prev,
          current_turn: prev.current_turn + 1
        }));
        
        // Add turn log
        addBattleLog({
          type: 'system',
          message: `Turn ${battlePhase.current_turn + 1} begins`,
        });
        break;
    }
  };

  // Determine battle result
  const determineBattleResult = () => {
    // Check which side has more units remaining
    const activeAttackers = attackerUnits.filter(unit => unit.status !== 'dead');
    const activeDefenders = defenderUnits.filter(unit => unit.status !== 'dead');
    
    let winner: string;
    let resources_gained = {
      stardust: 0,
      celestialOre: 0,
      ether: 0,
    };
    let experience_gained = 0;
    let units_lost: Unit[] = [];
    let units_gained: Unit[] = [];
    
    if (activeAttackers.length > activeDefenders.length) {
      // Player wins
      winner = userKingdom.name;
      
      // Calculate resources gained (50% of enemy resources)
      if (enemyKingdom) {
        resources_gained = {
          stardust: Math.floor(enemyKingdom.resources.stardust * 0.5),
          celestialOre: Math.floor(enemyKingdom.resources.celestialOre * 0.5),
          ether: Math.floor(enemyKingdom.resources.ether * 0.5),
        };
      }
      
      // Calculate experience gained
      experience_gained = 100 + (activeDefenders.length * 10);
      
      // Calculate units lost (any attacker units that are dead)
      units_lost = attackerUnits.filter(unit => unit.status === 'dead');
      
      // Add victory log
      addBattleLog({
        type: 'system',
        message: `Victory! ${userKingdom.name} has defeated ${enemyKingdom?.name || 'the enemy'}!`,
      });
    } else {
      // Enemy wins
      winner = enemyKingdom?.name || 'Enemy';
      
      // Calculate resources lost (25% of player resources)
      resources_gained = {
        stardust: -Math.floor(userKingdom.resources.stardust * 0.25),
        celestialOre: -Math.floor(userKingdom.resources.celestialOre * 0.25),
        ether: -Math.floor(userKingdom.resources.ether * 0.25),
      };
      
      // Calculate experience gained (even in defeat, some experience is gained)
      experience_gained = 25 + (activeAttackers.length * 5);
      
      // Calculate units lost (all dead attacker units)
      units_lost = attackerUnits.filter(unit => unit.status === 'dead');
      
      // Add defeat log
      addBattleLog({
        type: 'system',
        message: `Defeat! ${enemyKingdom?.name || 'The enemy'} has defeated ${userKingdom.name}!`,
      });
    }
    
    // Set battle result
    const result: BattleResult = {
      winner,
      resources_gained,
      experience_gained,
      units_lost,
      units_gained,
    };
    
    setBattleResult(result);
    
    // Call onBattleComplete callback if provided
    if (onBattleComplete) {
      onBattleComplete(result);
    }
  };

  // Start battle
  const startBattle = () => {
    if (battlePhase.name !== 'preparation' || attackerUnits.length === 0) {
      toast({
        title: 'Cannot Start Battle',
        description: 'Please select units for battle first',
        variant: 'destructive',
      });
      return;
    }
    
    // Update battle phase to engagement
    updateBattlePhase('engagement');
    
    // Add battle start log
    addBattleLog({
      type: 'system',
      message: 'Battle has begun! Engage the enemy!',
    });
  };

  // Get unit icon
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
        return '
const [connectionStatus, setConnectionStatus] = useState('Terhubung');
const [afkWarnings, setAfkWarnings] = useState(0);
const [leaderboardData, setLeaderboardData] = useState([]);

useEffect(() => {
  const multiplayerService = MultiplayerService.getInstance();
  const statusSubscription = multiplayerService.getConnectionStats().subscribe(stats => {
    setConnectionStatus(stats.status);
    if(stats.reconnectAttempts > 0) {
      setAfkWarnings(prev => Math.min(prev + 1, 3));
    }
  });
  return () => statusSubscription.unsubscribe();
}, []);
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{connectionStatus}</span>
  </div>
  {afkWarnings > 0 && (
    <div className="text-yellow-500 text-xs mt-1">
      Peringatan AFK ({3 - afkWarnings} kesempatan tersisa)
    </div>
  )}
</div>

{/* Leaderboard */}
<div className="leaderboard cosmic-border">
  <h4 className="text-cosmic-light-purple mb-2">Ranking Pertempuran</h4>
  {leaderboardData.map((player, index) => (
    <div key={player.id} className="flex justify-between items-center py-1">
      <span>#{index + 1} {player.name}</span>
      <span className="text-cosmic-gold">{player.points} Poin</span>
    </div>
  ))}
</div>
{/* Status Koneksi */}
<div className="connection-status cosmic-border">
  <div className="flex items-center gap-2">
    <div className={