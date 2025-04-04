// Alliance Engine untuk Astral Zodiac Conquest
import { ZodiacProps } from '../components/ZodiacCard';
import gameConfig from '../config/gameConfig';

export interface AllianceMember {
  id: string;
  name: string;
  zodiac: ZodiacProps;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  joinedAt: Date;
  lastActive: Date;
}

export interface AllianceBonus {
  type: 'attack' | 'defense' | 'resource' | 'special';
  value: number;
  description: string;
  activatedBy: string[];
}

export interface AllianceState {
  id: string;
  name: string;
  level: number;
  experience: number;
  members: AllianceMember[];
  activeZodiacBonuses: AllianceBonus[];
  resources: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  diplomacy: {
    allies: string[];
    enemies: string[];
    treaties: {
      allianceId: string;
      type: 'peace' | 'trade' | 'war' | 'non-aggression';
      terms?: {
        resourceTrade?: {
          offer: Partial<Record<keyof ResourceState['storage'], number>>;
          request: Partial<Record<keyof ResourceState['storage'], number>>;
        };
        duration: number; // Dalam hari
        penalty?: number; // Penalti untuk pelanggaran perjanjian
      };
      startDate: Date;
      endDate?: Date;
      status: 'active' | 'violated' | 'expired';
    }[];
    warScore: {
      allianceId: string;
      score: number;
      lastBattle: Date;
    }[];
  };
  warParticipation?: {
    targetAlliance: string;
    startDate: Date;
    membersParticipating: string[];
    battleResults: {
      date: Date;
      winner: string;
      resourcesGained: Partial<Record<keyof ResourceState['storage'], number>>;
    }[];
  };
}

export class AllianceEngine {
  private state: AllianceState;
  private config = gameConfig;

  constructor(initialState: Partial<AllianceState>) {
    this.state = {
      id: initialState.id || crypto.randomUUID(),
      name: initialState.name || '',
      level: initialState.level || 1,
      experience: initialState.experience || 0,
      members: initialState.members || [],
      activeZodiacBonuses: [],
      resources: initialState.resources || {
        stardust: 0,
        celestialOre: 0,
        ether: 0
      },
      diplomacy: initialState.diplomacy || {
        allies: [],
        enemies: [],
        treaties: []
      }
    };

    this.calculateZodiacBonuses();
  }

  public addMember(member: Omit<AllianceMember, 'joinedAt' | 'lastActive'>): boolean {
    if (this.state.members.length >= this.config.gameConstants.maxAllianceMembers) {
      return false;
    }

    const newMember: AllianceMember = {
      ...member,
      joinedAt: new Date(),
      lastActive: new Date()
    };

    this.state.members.push(newMember);
    this.calculateZodiacBonuses();
    return true;
  }

  public removeMember(memberId: string): boolean {
    const initialLength = this.state.members.length;
    this.state.members = this.state.members.filter(member => member.id !== memberId);
    
    if (this.state.members.length < initialLength) {
      this.calculateZodiacBonuses();
      return true;
    }
    return false;
  }

  private calculateZodiacBonuses(): void {
    const zodiacGroups = this.groupZodiacsByElement();
    this.state.activeZodiacBonuses = [];

    // Periksa bonus kombinasi zodiak
    Object.entries(this.config.battleConfig.zodiacComboBonuses).forEach(([comboName, combo]) => {
      const hasAllSigns = combo.requiredSigns.every(sign =>
        this.state.members.some(member => member.zodiac.name === sign)
      );

      if (hasAllSigns) {
        this.state.activeZodiacBonuses.push({
          type: combo.bonus.type as 'attack' | 'defense' | 'resource' | 'special',
          value: combo.bonus.value,
          description: `${comboName} Alliance Bonus`,
          activatedBy: combo.requiredSigns
        });
      }
    });

    // Tambahkan bonus berdasarkan jumlah zodiak per elemen
    Object.entries(zodiacGroups).forEach(([element, signs]) => {
      if (signs.length >= 3) {
        this.state.activeZodiacBonuses.push({
          type: this.getElementalBonusType(element),
          value: 15 + (signs.length - 3) * 5,
          description: `${element} Elemental Harmony`,
          activatedBy: signs
        });
      }
    });
  }

  private groupZodiacsByElement(): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    this.state.members.forEach(member => {
      const element = member.zodiac.element;
      if (!groups[element]) {
        groups[element] = [];
      }
      groups[element].push(member.zodiac.name);
    });

    return groups;
  }

  private getElementalBonusType(element: string): 'attack' | 'defense' | 'resource' | 'special' {
    switch (element) {
      case 'Fire':
        return 'attack';
      case 'Earth':
        return 'defense';
      case 'Air':
        return 'special';
      case 'Water':
        return 'resource';
      default:
        return 'special';
    }
  }

  public contributeResources(memberId: string, resources: Partial<AllianceState['resources']>): void {
    const member = this.state.members.find(m => m.id === memberId);
    if (!member) return;

    // Update resources dan kontribusi member
    Object.entries(resources).forEach(([resource, amount]) => {
      if (amount && amount > 0) {
        this.state.resources[resource as keyof typeof this.state.resources] += amount;
        member.contribution += amount;
      }
    });

    member.lastActive = new Date();
    this.checkLevelUp();
  }

  private checkLevelUp(): void {
    const requiredExp = this.state.level * 1000;
    const totalContribution = this.state.members.reduce((sum, member) => sum + member.contribution, 0);

    if (totalContribution >= requiredExp && this.state.level < this.config.gameConstants.maxKingdomLevel) {
      this.state.level++;
      this.state.experience = totalContribution - requiredExp;
    }
  }

  public declareTreaty(targetAllianceId: string, type: 'peace' | 'trade' | 'war' | 'non-aggression', terms?: AllianceState['diplomacy']['treaties'][0]['terms']): boolean {
    // Validasi jumlah anggota untuk perang
    if (type === 'war' && this.state.members.length < 12) {
      return false;
    }

    // Validasi perjanjian yang sudah ada
    const existingTreaty = this.state.diplomacy.treaties.find(t => 
      t.allianceId === targetAllianceId && 
      t.status === 'active'
    );
    
    if (existingTreaty) {
      // Jika ada perjanjian damai atau non-agresi yang aktif, tidak bisa langsung berperang
      if (type === 'war' && 
          (existingTreaty.type === 'peace' || existingTreaty.type === 'non-aggression') &&
          existingTreaty.terms?.duration && 
          new Date().getTime() < existingTreaty.startDate.getTime() + (existingTreaty.terms.duration * 24 * 60 * 60 * 1000)
      ) {
        return false;
      }

      // Akhiri perjanjian yang ada
      existingTreaty.endDate = new Date();
      existingTreaty.status = 'expired';

      // Terapkan penalti jika melanggar perjanjian
      if (existingTreaty.terms?.penalty && 
          (existingTreaty.type === 'peace' || existingTreaty.type === 'non-aggression') && 
          type === 'war'
      ) {
        this.state.resources.stardust -= existingTreaty.terms.penalty;
        this.state.resources.celestialOre -= existingTreaty.terms.penalty;
        this.state.resources.ether -= existingTreaty.terms.penalty;
      }
    }

    // Buat perjanjian baru
    this.state.diplomacy.treaties.push({
      allianceId: targetAllianceId,
      type,
      terms,
      startDate: new Date(),
      status: 'active'
    });

    // Inisialisasi perang jika tipe perjanjian adalah perang
    if (type === 'war') {
      this.initializeWar(targetAllianceId);
    }

    // Update ally/enemy lists
    if (type === 'peace' || type === 'trade') {
      this.state.diplomacy.allies = [...new Set([...this.state.diplomacy.allies, targetAllianceId])];
      this.state.diplomacy.enemies = this.state.diplomacy.enemies.filter(id => id !== targetAllianceId);
    } else if (type === 'war') {
      this.state.diplomacy.enemies = [...new Set([...this.state.diplomacy.enemies, targetAllianceId])];
      this.state.diplomacy.allies = this.state.diplomacy.allies.filter(id => id !== targetAllianceId);
    }

    return true;
  }

  private initializeWar(targetAllianceId: string): void {
    // Validasi jumlah minimum anggota untuk perang
    if (this.state.members.length < 12) {
      throw new Error('Minimum 12 anggota diperlukan untuk memulai perang');
    }

    this.state.warParticipation = {
      targetAlliance: targetAllianceId,
      startDate: new Date(),
      membersParticipating: [],
      battleResults: []
    };

    this.state.diplomacy.warScore.push({
      allianceId: targetAllianceId,
      score: 0,
      lastBattle: new Date()
    });

    // Reset status aliansi
    this.state.diplomacy.allies = this.state.diplomacy.allies.filter(id => id !== targetAllianceId);
    this.state.diplomacy.enemies.push(targetAllianceId);
  }

  public joinWar(memberId: string): boolean {
    if (!this.state.warParticipation) return false;

    const member = this.state.members.find(m => m.id === memberId);
    if (!member) return false;

    // Validasi jumlah maksimum peserta perang
    if (this.state.warParticipation.membersParticipating.length >= 12) {
      return false;
    }

    // Validasi cooldown pertempuran
    const lastBattle = this.state.diplomacy.warScore.find(
      w => w.allianceId === this.state.warParticipation?.targetAlliance
    )?.lastBattle;

    if (lastBattle && new Date().getTime() - lastBattle.getTime() < 6 * 60 * 60 * 1000) {
      return false; // Cooldown 6 jam antar pertempuran
    }

    this.state.warParticipation.membersParticipating.push(memberId);
    return true;
  }

  public recordBattleResult(targetAllianceId: string, won: boolean, resourcesGained: Partial<Record<keyof ResourceState['storage'], number>>): void {
    if (!this.state.warParticipation || this.state.warParticipation.targetAlliance !== targetAllianceId) return;

    const warScore = this.state.diplomacy.warScore.find(w => w.allianceId === targetAllianceId);
    if (warScore) {
      // Update skor perang dengan bobot berdasarkan jumlah sumber daya yang dimenangkan
      const resourceWeight = Object.values(resourcesGained).reduce((sum, value) => sum + (value || 0), 0) / 1000;
      warScore.score += won ? (1 + resourceWeight) : (-1 - resourceWeight);
      warScore.lastBattle = new Date();

      // Periksa kondisi kemenangan perang
      if (Math.abs(warScore.score) >= 10) {
        this.endWar(targetAllianceId, won);
      }
    }

    this.state.warParticipation.battleResults.push({
      date: new Date(),
      winner: won ? this.state.id : targetAllianceId,
      resourcesGained
    });

    // Update resources aliansi
    if (won && resourcesGained) {
      Object.entries(resourcesGained).forEach(([resource, amount]) => {
        if (amount && amount > 0) {
          this.state.resources[resource as keyof typeof this.state.resources] += amount;
        }
      });
    }
  }

  private endWar(targetAllianceId: string, won: boolean): void {
    if (!this.state.warParticipation) return;

    // Buat perjanjian damai otomatis
    const peaceTreaty = {
      allianceId: targetAllianceId,
      type: 'peace' as const,
      terms: {
        duration: 7, // Perjanjian damai selama 7 hari
        penalty: 1000 // Penalti 1000 resources jika dilanggar
      },
      startDate: new Date(),
      status: 'active' as const
    };

    this.state.diplomacy.treaties.push(peaceTreaty);

    // Update status aliansi
    if (won) {
      this.state.diplomacy.enemies = this.state.diplomacy.enemies.filter(id => id !== targetAllianceId);
      if (!this.state.diplomacy.allies.includes(targetAllianceId)) {
        this.state.diplomacy.allies.push(targetAllianceId);
      }
    }

    // Reset war participation
    this.state.warParticipation = undefined;
  }

  public getActiveWars(): string[] {
    return this.state.diplomacy.treaties
      .filter(t => t.type === 'war' && t.status === 'active')
      .map(t => t.allianceId);
  }

  public getActiveTreaties(): AllianceState['diplomacy']['treaties'] {
    return this.state.diplomacy.treaties.filter(t => t.status === 'active');
  }
}

  public getState(): AllianceState {
    return this.state;
  }

  public getActiveBonus(type: AllianceBonus['type']): number {
    return this.state.activeZodiacBonuses
      .filter(bonus => bonus.type === type)
      .reduce((total, bonus) => total + bonus.value, 0);
  }
}