// Nebula Engine untuk Astral Zodiac Conquest
import { AllianceState } from './AllianceEngine';
import gameConfig from '../config/gameConfig';

export interface NebulaCoreState {
  controllingAlliance?: string;
  contestStartTime: Date;
  contestEndTime: Date;
  participants: {
    allianceId: string;
    score: number;
    lastAction: Date;
  }[];
  resourceBonuses: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  status: 'contested' | 'controlled' | 'neutral';
}

export class NebulaEngine {
  private state: NebulaCoreState;
  private config = gameConfig;

  constructor(initialState?: Partial<NebulaCoreState>) {
    const now = new Date();
    this.state = {
      contestStartTime: initialState?.contestStartTime || now,
      contestEndTime: initialState?.contestEndTime || new Date(now.getTime() + 24 * 60 * 60 * 1000),
      participants: initialState?.participants || [],
      resourceBonuses: initialState?.resourceBonuses || {
        stardust: 25,
        celestialOre: 25,
        ether: 25
      },
      status: initialState?.status || 'neutral'
    };
  }

  public joinContest(alliance: AllianceState): boolean {
    // Validasi jumlah anggota aliansi (minimal 12)
    if (alliance.members.length < 12) return false;

    // Cek apakah aliansi sudah berpartisipasi
    if (this.state.participants.some(p => p.allianceId === alliance.id)) return false;

    // Tambahkan aliansi ke daftar peserta
    this.state.participants.push({
      allianceId: alliance.id,
      score: 0,
      lastAction: new Date()
    });

    this.state.status = 'contested';
    return true;
  }

  public updateScore(allianceId: string, points: number): void {
    const participant = this.state.participants.find(p => p.allianceId === allianceId);
    if (!participant) return;

    participant.score += points;
    participant.lastAction = new Date();

    this.checkWinCondition();
  }

  private checkWinCondition(): void {
    const now = new Date();
    if (now > this.state.contestEndTime) {
      // Tentukan pemenang berdasarkan skor tertinggi
      const winner = this.state.participants.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      this.state.controllingAlliance = winner.allianceId;
      this.state.status = 'controlled';

      // Reset kontes untuk putaran berikutnya
      this.resetContest();
    }
  }

  private resetContest(): void {
    const now = new Date();
    this.state.contestStartTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Mulai 12 jam dari sekarang
    this.state.contestEndTime = new Date(this.state.contestStartTime.getTime() + 24 * 60 * 60 * 1000);
    this.state.participants = [];
  }

  public getResourceBonuses(allianceId: string): {
    stardust: number;
    celestialOre: number;
    ether: number;
  } | null {
    if (this.state.controllingAlliance === allianceId) {
      return this.state.resourceBonuses;
    }
    return null;
  }

  public getState(): NebulaCoreState {
    return this.state;
  }
}