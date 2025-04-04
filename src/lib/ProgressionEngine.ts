// Progression Engine untuk Astral Zodiac Conquest
import { ZodiacProps } from '../components/ZodiacCard';
import gameConfig from '../config/gameConfig';

export interface AstralCycleState {
  currentSeason: number;
  seasonStartDate: Date;
  seasonEndDate: Date;
  starFragments: number;
  seasonalRewards: {
    type: 'skin' | 'boost';
    id: string;
    cost: number;
    purchased: boolean;
  }[];
}

export interface PrestigeState {
  level: number;
  experience: number;
  nextLevelThreshold: number;
  passiveBonus: {
    type: 'research_speed' | 'resource_production' | 'unit_training' | 'battle_power';
    value: number;
    description: string;
  }[];
}

export interface ProgressionState {
  astralCycle: AstralCycleState;
  prestige: PrestigeState;
}

export class ProgressionEngine {
  private state: ProgressionState;
  private config = gameConfig;
  private zodiac: ZodiacProps;

  constructor(initialState: Partial<ProgressionState>, zodiac: ZodiacProps) {
    this.zodiac = zodiac;
    const now = new Date();

    // Inisialisasi state dengan nilai default
    this.state = {
      astralCycle: {
        currentSeason: initialState.astralCycle?.currentSeason || 1,
        seasonStartDate: initialState.astralCycle?.seasonStartDate || now,
        seasonEndDate: initialState.astralCycle?.seasonEndDate || this.calculateSeasonEndDate(now),
        starFragments: initialState.astralCycle?.starFragments || 0,
        seasonalRewards: initialState.astralCycle?.seasonalRewards || []
      },
      prestige: {
        level: initialState.prestige?.level || 1,
        experience: initialState.prestige?.experience || 0,
        nextLevelThreshold: this.calculatePrestigeThreshold(initialState.prestige?.level || 1),
        passiveBonus: this.calculateZodiacPassiveBonus()
      }
    };
  }

  private calculateSeasonEndDate(startDate: Date): Date {
    // Musim berlangsung selama 3 bulan
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);
    return endDate;
  }

  private calculatePrestigeThreshold(level: number): number {
    // Rumus threshold level prestige
    return Math.floor(2000 * Math.pow(1.5, level - 1));
  }

  private calculateZodiacPassiveBonus(): PrestigeState['passiveBonus'] {
    const bonuses: PrestigeState['passiveBonus'] = [];
    const prestigeLevel = this.state.prestige.level;

    // Bonus pasif berdasarkan zodiak
    switch (this.zodiac.name) {
      case 'Virgo':
        bonuses.push({
          type: 'research_speed',
          value: 5 * prestigeLevel,
          description: `+${5 * prestigeLevel}% kecepatan riset`
        });
        break;
      case 'Gemini':
        bonuses.push({
          type: 'unit_training',
          value: 4 * prestigeLevel,
          description: `+${4 * prestigeLevel}% kecepatan pelatihan unit`
        });
        break;
      case 'Taurus':
        bonuses.push({
          type: 'resource_production',
          value: 3 * prestigeLevel,
          description: `+${3 * prestigeLevel}% produksi sumber daya`
        });
        break;
      case 'Leo':
        bonuses.push({
          type: 'battle_power',
          value: 3 * prestigeLevel,
          description: `+${3 * prestigeLevel}% kekuatan tempur`
        });
        break;
      // Tambahkan bonus untuk zodiak lainnya
    }

    return bonuses;
  }

  public checkSeasonEnd(): boolean {
    const now = new Date();
    if (now >= this.state.astralCycle.seasonEndDate) {
      this.endSeason();
      return true;
    }
    return false;
  }

  private endSeason(): void {
    // Simpan Star Fragments yang diperoleh
    const earnedFragments = this.calculateSeasonalFragments();
    
    // Reset musim
    const now = new Date();
    this.state.astralCycle = {
      currentSeason: this.state.astralCycle.currentSeason + 1,
      seasonStartDate: now,
      seasonEndDate: this.calculateSeasonEndDate(now),
      starFragments: this.state.astralCycle.starFragments + earnedFragments,
      seasonalRewards: this.generateSeasonalRewards()
    };
  }

  private calculateSeasonalFragments(): number {
    // Implementasi perhitungan Star Fragments berdasarkan performa musiman
    // Contoh sederhana: 100 fragments per pencapaian
    return 100;
  }

  private generateSeasonalRewards(): AstralCycleState['seasonalRewards'] {
    // Implementasi generasi reward musiman (skin/boost)
    return [
      {
        type: 'skin',
        id: `seasonal_skin_${this.state.astralCycle.currentSeason}`,
        cost: 1000,
        purchased: false
      },
      {
        type: 'boost',
        id: `seasonal_boost_${this.state.astralCycle.currentSeason}`,
        cost: 500,
        purchased: false
      }
    ];
  }

  public addPrestigeExperience(amount: number): void {
    this.state.prestige.experience += amount;
    
    // Cek level up
    while (this.state.prestige.experience >= this.state.prestige.nextLevelThreshold) {
      this.state.prestige.experience -= this.state.prestige.nextLevelThreshold;
      this.state.prestige.level++;
      this.state.prestige.nextLevelThreshold = this.calculatePrestigeThreshold(this.state.prestige.level);
      this.state.prestige.passiveBonus = this.calculateZodiacPassiveBonus();
    }
  }

  public purchaseSeasonalReward(rewardId: string): boolean {
    const reward = this.state.astralCycle.seasonalRewards.find(r => r.id === rewardId);
    if (reward && !reward.purchased && this.state.astralCycle.starFragments >= reward.cost) {
      reward.purchased = true;
      this.state.astralCycle.starFragments -= reward.cost;
      return true;
    }
    return false;
  }

  public getState(): ProgressionState {
    return this.state;
  }

  public getPassiveBonus(type: PrestigeState['passiveBonus'][0]['type']): number {
    const bonus = this.state.prestige.passiveBonus.find(b => b.type === type);
    return bonus ? bonus.value : 0;
  }

  public getRemainingSeasonTime(): number {
    return this.state.astralCycle.seasonEndDate.getTime() - new Date().getTime();
  }
}