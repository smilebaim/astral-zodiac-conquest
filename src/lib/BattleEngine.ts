// Battle Engine untuk Astral Zodiac Conquest
import { CombatUnit } from '../data/combatUnits';
import { ZodiacProps } from '../components/ZodiacCard';
import { ZodiacAbility } from '../data/zodiacAbilities';
import gameConfig from '../config/gameConfig';

export interface BattleState {
  attacker: {
    zodiac: ZodiacProps;
    units: CombatUnit[];
    activeAbilities: ZodiacAbility[];
    resources: {
      stardust: number;
      celestialOre: number;
      ether: number;
    };
  };
  defender: {
    zodiac: ZodiacProps;
    units: CombatUnit[];
    activeAbilities: ZodiacAbility[];
    resources: {
      stardust: number;
      celestialOre: number;
      ether: number;
    };
  };
  battleLog: BattleEvent[];
  turnCount: number;
  isComplete: boolean;
  winner?: 'attacker' | 'defender' | 'draw';
}

export interface BattleEvent {
  turn: number;
  type: 'attack' | 'ability' | 'effect' | 'resource' | 'status';
  source: string;
  target: string;
  value: number;
  description: string;
}

export class BattleEngine {
  private state: BattleState;
  private config = gameConfig;

  constructor(attackerData: BattleState['attacker'], defenderData: BattleState['defender']) {
    this.state = {
      attacker: attackerData,
      defender: defenderData,
      battleLog: [],
      turnCount: 0,
      isComplete: false
    };
  }

  public initiateBattle(): BattleState {
    // Inisialisasi pertempuran
    this.applyZodiacBonuses();
    this.applyElementalAffinities();
    return this.state;
  }

  private applyZodiacBonuses(): void {
    // Terapkan bonus zodiak ke unit
    const applyBonus = (side: 'attacker' | 'defender') => {
      const data = this.state[side];
      const zodiacPower = this.config.zodiacConfig.zodiacPowerLevels[data.zodiac.name];
      
      if (zodiacPower) {
        data.units = data.units.map(unit => ({
          ...unit,
          stats: {
            ...unit.stats,
            attack: unit.stats.attack * (1 + zodiacPower.baseStats.attack / 100),
            defense: unit.stats.defense * (1 + zodiacPower.baseStats.defense / 100)
          }
        }));
      }
    };

    applyBonus('attacker');
    applyBonus('defender');
  }

  private applyElementalAffinities(): void {
    // Terapkan bonus/penalti elemen
    const applyElemental = (side: 'attacker' | 'defender') => {
      const data = this.state[side];
      const opponent = side === 'attacker' ? 'defender' : 'attacker';
      const elementalBonus = this.config.battleConfig.elementalBonuses[data.zodiac.element];

      if (elementalBonus && this.state[opponent].zodiac.element === elementalBonus.strongAgainst) {
        data.units = data.units.map(unit => ({
          ...unit,
          stats: {
            ...unit.stats,
            attack: unit.stats.attack * elementalBonus.damageMultiplier
          }
        }));
      }
    };

    applyElemental('attacker');
    applyElemental('defender');
  }

  public processTurn(): BattleState {
    if (this.state.isComplete) return this.state;

    this.state.turnCount++;
    
    // Proses serangan unit
    this.processUnitCombat();
    
    // Proses kemampuan zodiak
    this.processZodiacAbilities();
    
    // Cek kondisi kemenangan
    this.checkBattleEnd();

    return this.state;
  }

  private processUnitCombat(): void {
    // Implementasi logika pertempuran unit
    ['attacker', 'defender'].forEach(side => {
      const currentSide = side as 'attacker' | 'defender';
      const opponent = currentSide === 'attacker' ? 'defender' : 'attacker';
      
      this.state[currentSide].units.forEach(unit => {
        if (this.state[opponent].units.length > 0) {
          const target = this.state[opponent].units[0]; // Simplifikasi target selection
          const damage = this.calculateDamage(unit, target);
          
          // Terapkan damage
          target.stats.health -= damage;
          
          // Log event pertempuran
          this.state.battleLog.push({
            turn: this.state.turnCount,
            type: 'attack',
            source: unit.name,
            target: target.name,
            value: damage,
            description: `${unit.name} menyerang ${target.name} sebesar ${damage} damage`
          });
          
          // Hapus unit yang mati
          this.state[opponent].units = this.state[opponent].units.filter(u => u.stats.health > 0);
        }
      });
    });
  }

  private calculateDamage(attacker: CombatUnit, defender: CombatUnit): number {
    const baseDamage = attacker.stats.attack;
    const defense = defender.stats.defense;
    const damage = Math.max(1, baseDamage - defense);
    return Math.floor(damage);
  }

  private processZodiacAbilities(): void {
    // Implementasi aktivasi kemampuan zodiak
    ['attacker', 'defender'].forEach(side => {
      const currentSide = side as 'attacker' | 'defender';
      const data = this.state[currentSide];
      
      data.activeAbilities.forEach(ability => {
        if (ability.type === 'active' && this.state.turnCount % (ability.cooldown || 1) === 0) {
          this.activateAbility(currentSide, ability);
        }
      });
    });
  }

  private activateAbility(side: 'attacker' | 'defender', ability: ZodiacAbility): void {
    const data = this.state[side];
    
    // Terapkan efek kemampuan
    if (ability.effect.stat && ability.effect.value) {
      data.units.forEach(unit => {
        const statKey = ability.effect.stat as keyof typeof unit.stats;
        if (unit.stats[statKey]) {
          unit.stats[statKey] *= (1 + ability.effect.value! / 100);
        }
      });
    }

    // Log aktivasi kemampuan
    this.state.battleLog.push({
      turn: this.state.turnCount,
      type: 'ability',
      source: data.zodiac.name,
      target: ability.effect.target,
      value: ability.effect.value || 0,
      description: `${data.zodiac.name} mengaktifkan ${ability.name}`
    });
  }

  private checkBattleEnd(): void {
    const attackerDefeated = this.state.attacker.units.length === 0;
    const defenderDefeated = this.state.defender.units.length === 0;
    
    if (attackerDefeated || defenderDefeated) {
      this.state.isComplete = true;
      if (attackerDefeated && defenderDefeated) {
        this.state.winner = 'draw';
      } else if (attackerDefeated) {
        this.state.winner = 'defender';
      } else {
        this.state.winner = 'attacker';
      }
    } else if (this.state.turnCount >= this.config.battleConfig.maxBattleDuration) {
      this.state.isComplete = true;
      this.state.winner = 'draw';
    }
  }

  public getBattleState(): BattleState {
    return this.state;
  }

  public getBattleLog(): BattleEvent[] {
    return this.state.battleLog;
  }
}