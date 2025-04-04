import { createClient } from '@supabase/supabase-js';
import type { ZodiacProps } from '@/components/ZodiacCard';

type ZodiacComboBonus = {
  combo: string[];
  bonus: string;
  value: number;
  description: string;
};

/**
 * Pesan pertempuran antara pemain
 * @property type - Jenis aksi (move/attack/ability/chat/turn-end)
 * @property payload - Data spesifik aksi
 * @property timestamp - Waktu pengiriman pesan
 * @property playerId - ID pemain pengirim
 */
type BattleMessage = {
  type: 'move' | 'attack' | 'ability' | 'chat' | 'turn-end';
  payload: Record<string, unknown>;
  timestamp: number;
  playerId: string;
};

/**
 * Data leaderboard pemain
 * @property players - Daftar pemain beserta statistiknya
 */
interface LeaderboardData {
  players: Array<{
    id: string;
    name: string;
    score: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}

/**
 * Service untuk menangani semua fitur multiplayer game
 * termasuk pertempuran, aliansi, dan leaderboard
 */
export class MultiplayerService {
  private static instance: MultiplayerService;
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  private ws: WebSocket | null = null;
  private allianceWs: WebSocket | null = null;
  private diplomacyWs: WebSocket | null = null;
  private marketWs: WebSocket | null = null;
  
  /**
   * Mendapatkan instance MultiplayerService (Singleton)
   * @returns Instance MultiplayerService
   */
  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService();
    }
    return MultiplayerService.instance;
  }

  /**
   * Inisialisasi WebSocket untuk komunikasi aliansi
   * @param allianceId ID aliansi yang akan diinisialisasi
   * @returns Status koneksi
   */
  public async initializeAllianceWebSocket(allianceId: string): Promise<{ status: string }> {
    try {
      if (this.allianceWs && this.allianceWs.readyState === WebSocket.OPEN) {
        return { status: 'already_connected' };
      }

      const wsUrl = `wss://alliance-server.example.com/ws/alliance/${allianceId}`;
      this.allianceWs = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.allianceWs) {
          reject(new Error('Gagal membuat koneksi WebSocket'));
          return;
        }

        this.allianceWs.onopen = () => {
          console.log(`WebSocket untuk aliansi ${allianceId} terhubung`);
          resolve({ status: 'connected' });
        };
        
        this.allianceWs.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleAllianceMessage(message);
          } catch (error) {
            console.error('Error processing alliance message:', error);
          }
        };
        
        this.allianceWs.onerror = (error) => {
          console.error(`WebSocket error for alliance ${allianceId}:`, error);
          reject(new Error('Koneksi WebSocket mengalami error'));
        };
        
        this.allianceWs.onclose = () => {
          console.log(`WebSocket untuk aliansi ${allianceId} ditutup`);
          // Coba hubungkan kembali setelah beberapa detik
          setTimeout(() => {
            if (this.reconnectAttempts < 5) {
              this.reconnectAttempts++;
              this.initializeAllianceWebSocket(allianceId);
            }
          }, 5000);
        };
      });
    } catch (error) {
      console.error('Error initializing alliance WebSocket:', error);
      throw error;
    }
  }

  /**
   * Menangani pesan yang diterima dari WebSocket aliansi
   * @param message Pesan yang diterima
   * @private
   */
  private handleAllianceMessage(message: any) {
    // Implementasi penanganan pesan aliansi
    switch (message.type) {
      case 'member-joined':
        // Tangani ketika anggota baru bergabung
        break;
      case 'member-left':
        // Tangani ketika anggota keluar
        break;
      case 'resource-contribution':
        // Tangani kontribusi sumber daya
        break;
      case 'alliance-war-update':
        // Tangani pembaruan status perang
        break;
      default:
        console.log('Unhandled alliance message type:', message.type);
    }
  }
  
  // Data untuk pertempuran 12vs12
  private twelveVsTwelveData: {
    battleId: string;
    alliances: {
      id: string;
      name: string;
      members: string[];
      zodiacCombo: string[];
      bonuses: ZodiacComboBonus[];
    }[];
    nebulaCorePosition: {x: number, y: number};
    startTime: number;
    duration: number;
    rewards: {
      winner: {
        stardust: number;
        celestialOre: number;
        ether: number;
        prestige: number;
      };
      loser: {
        stardust: number;
        celestialOre: number;
        ether: number;
        prestige: number;
      };
    };
  } | null = null;
  
  // Data untuk sistem diplomasi
  private diplomacyData: {
    treaties: Array<{
      id: string;
      type: 'non-aggression' | 'trade' | 'alliance';
      parties: string[];
      terms: Record<string, unknown>;
      expiresAt: number;
      status: 'active' | 'pending' | 'expired' | 'broken';
      benefits: {
        resourceBonus?: number;
        defenseBonus?: number;
        attackBonus?: number;
        tradeTax?: number;
      };
    }>;
    marketPrices: Record<string, {
      currentPrice: number;
      trend: 'rising' | 'falling' | 'stable';
      volatility: number;
      lastUpdate: number;
    }>;
    zodiacFestival: {
      activeZodiac: string | null;
      startTime: number;
      endTime: number;
      bonuses: Record<string, number>;
    };
    eclipseWarActive: boolean;
    eclipseWarData: {
      startTime: number;
      endTime: number;
      attackSpeedBonus: number;
      resourceRiskMultiplier: number;
    } | null;
  } = {
    treaties: [],
    marketPrices: {},
    zodiacFestival: {
      activeZodiac: null,
      startTime: 0,
      endTime: 0,
      bonuses: {}
    },
    eclipseWarActive: false,
    eclipseWarData: null
  };
  private reconnectAttempts = 0;
  private lastActionTimestamp = Date.now();
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  private allianceZodiacCombos: Record<string, ZodiacComboBonus[]> = {};

    /**
     * Memulai pertempuran 12vs12 untuk mengontrol Nebula Inti
     * @param allianceId1 ID aliansi pertama
     * @param allianceId2 ID aliansi kedua
     * @param nebulaCorePosition Posisi Nebula Inti di peta galaksi
     * @param duration Durasi pertempuran dalam milidetik
     * @returns Data pertempuran yang dibuat
     * @throws Error jika gagal memulai pertempuran
     */
    public async startTwelveVsTwelveBattle(
      allianceId1: string,
      allianceId2: string,
      nebulaCorePosition: {x: number, y: number},
      duration: number
    ) {
      try {
        // Ambil data aliansi dari database
        const { data: alliance1Data, error: alliance1Error } = await this.supabase
          .from('alliances')
          .select('id, name, member_ids')
          .eq('id', allianceId1)
          .single();
        
        if (alliance1Error) throw new Error(`Gagal mengambil data aliansi 1: ${alliance1Error.message}`);
        
        const { data: alliance2Data, error: alliance2Error } = await this.supabase
          .from('alliances')
          .select('id, name, member_ids')
          .eq('id', allianceId2)
          .single();
        
        if (alliance2Error) throw new Error(`Gagal mengambil data aliansi 2: ${alliance2Error.message}`);
        
        // Validasi jumlah anggota aliansi (harus 12 untuk perang 12vs12)
        if (alliance1Data.member_ids.length !== 12 || alliance2Data.member_ids.length !== 12) {
          throw new Error('Kedua aliansi harus memiliki tepat 12 anggota untuk pertempuran 12vs12');
        }
        
        // Hitung bonus zodiak untuk kedua aliansi
        const alliance1Zodiacs = await this.getAllianceZodiacs(allianceId1);
        const alliance2Zodiacs = await this.getAllianceZodiacs(allianceId2);
        
        const alliance1Bonuses = await this.calculateZodiacComboBonuses(alliance1Zodiacs);
        const alliance2Bonuses = await this.calculateZodiacComboBonuses(alliance2Zodiacs);
        
        // Buat data pertempuran
        const battleId = crypto.randomUUID();
        this.twelveVsTwelveData = {
          battleId,
          alliances: [
            {
              id: allianceId1,
              name: alliance1Data.name,
              members: alliance1Data.member_ids,
              zodiacCombo: alliance1Zodiacs,
              bonuses: alliance1Bonuses
            },
            {
              id: allianceId2,
              name: alliance2Data.name,
              members: alliance2Data.member_ids,
              zodiacCombo: alliance2Zodiacs,
              bonuses: alliance2Bonuses
            }
          ],
          nebulaCorePosition,
          startTime: Date.now(),
          duration,
          rewards: {
            winner: {
              stardust: 5000,
              celestialOre: 2000,
              ether: 1000,
              prestige: 500
            },
            loser: {
              stardust: 1000,
              celestialOre: 500,
              ether: 250,
              prestige: 100
            }
          }
        };
        
        // Simpan data pertempuran ke database
        const { error: insertError } = await this.supabase
          .from('alliance_wars')
          .insert({
            id: battleId,
            alliance1_id: allianceId1,
            alliance2_id: allianceId2,
            nebula_core_position: nebulaCorePosition,
            start_time: this.twelveVsTwelveData.startTime,
            duration,
            status: 'ongoing',
            score_alliance1: 0,
            score_alliance2: 0,
            winner_alliance_id: null
          });
        
        if (insertError) throw new Error(`Gagal menyimpan data pertempuran: ${insertError.message}`);
        
        // Notifikasi ke semua anggota aliansi
        await this.broadcastToAlliance(allianceId1, {
          type: 'war-started',
          battleId,
          opponentId: allianceId2,
          opponentName: alliance2Data.name,
          nebulaCorePosition,
          duration
        });
        
        await this.broadcastToAlliance(allianceId2, {
          type: 'war-started',
          battleId,
          opponentId: allianceId1,
          opponentName: alliance1Data.name,
          nebulaCorePosition,
          duration
        });
        
        // Inisialisasi WebSocket untuk pertempuran 12vs12
        this.initializeTwelveVsTwelveWebSocket(battleId);
        
        return {
          battleId,
          alliances: this.twelveVsTwelveData.alliances,
          nebulaCorePosition,
          startTime: this.twelveVsTwelveData.startTime,
          duration
        };
      } catch (error) {
        console.error('Error starting 12vs12 battle:', error);
        throw error;
      }
    }
    
    /**
     * Inisialisasi WebSocket untuk pertempuran 12vs12
     * @param battleId ID pertempuran
     * @private
     */
    private initializeTwelveVsTwelveWebSocket(battleId: string) {
      const wsUrl = `wss://battle-server.example.com/ws/alliance-war/${battleId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket untuk pertempuran aliansi ${battleId} terhubung`);
      };
      
      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Proses pesan pertempuran aliansi
          if (message.type === 'battle-update' && this.twelveVsTwelveData) {
            // Update skor pertempuran
            await this.updateWarScore(battleId, message.scoreDelta);
          }
          
          // Cek apakah pertempuran sudah selesai
          if (message.type === 'battle-end' && this.twelveVsTwelveData) {
            await this.endTwelveVsTwelveBattle(battleId, message.winnerAllianceId);
          }
        } catch (error) {
          console.error('Error processing alliance battle message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for alliance battle ${battleId}:`, error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket untuk pertempuran aliansi ${battleId} ditutup`);
      };
    }
    
    /**
     * Mengakhiri pertempuran 12vs12
     * @param battleId ID pertempuran
     * @param winnerAllianceId ID aliansi pemenang
     * @private
     */
    private async endTwelveVsTwelveBattle(battleId: string, winnerAllianceId: string) {
      if (!this.twelveVsTwelveData) return;
      
      try {
        // Update status pertempuran di database
        const { error } = await this.supabase
          .from('alliance_wars')
          .update({
            status: 'finished',
            winner_alliance_id: winnerAllianceId,
            end_time: Date.now()
          })
          .eq('id', battleId);
        
        if (error) throw new Error(`Gagal mengupdate status pertempuran: ${error.message}`);
        
        // Berikan hadiah ke aliansi pemenang dan yang kalah
        const loserAllianceId = this.twelveVsTwelveData.alliances[0].id === winnerAllianceId
          ? this.twelveVsTwelveData.alliances[1].id
          : this.twelveVsTwelveData.alliances[0].id;
        
        await this.distributeWarRewards(winnerAllianceId, loserAllianceId);
        
        // Notifikasi ke semua anggota aliansi
        await this.broadcastToAlliance(winnerAllianceId, {
          type: 'war-ended',
          battleId,
          result: 'victory',
          rewards: this.twelveVsTwelveData.rewards.winner
        });
        
        await this.broadcastToAlliance(loserAllianceId, {
          type: 'war-ended',
          battleId,
          result: 'defeat',
          rewards: this.twelveVsTwelveData.rewards.loser
        });
        
        // Reset data pertempuran
        this.twelveVsTwelveData = null;
      } catch (error) {
        console.error('Error ending 12vs12 battle:', error);
      }
    }
    
    /**
     * Mendistribusikan hadiah perang ke aliansi
     * @param winnerAllianceId ID aliansi pemenang
     * @param loserAllianceId ID aliansi yang kalah
     * @private
     */
    private async distributeWarRewards(winnerAllianceId: string, loserAllianceId: string) {
      if (!this.twelveVsTwelveData) return;
      
      try {
        // Distribusi hadiah ke aliansi pemenang
        const { error: winnerError } = await this.supabase.rpc('distribute_alliance_rewards', {
          alliance_id: winnerAllianceId,
          stardust: this.twelveVsTwelveData.rewards.winner.stardust,
          celestial_ore: this.twelveVsTwelveData.rewards.winner.celestialOre,
          ether: this.twelveVsTwelveData.rewards.winner.ether,
          prestige: this.twelveVsTwelveData.rewards.winner.prestige
        });
        
        if (winnerError) throw new Error(`Gagal mendistribusikan hadiah ke pemenang: ${winnerError.message}`);
        
        // Distribusi hadiah ke aliansi yang kalah
        const { error: loserError } = await this.supabase.rpc('distribute_alliance_rewards', {
          alliance_id: loserAllianceId,
          stardust: this.twelveVsTwelveData.rewards.loser.stardust,
          celestial_ore: this.twelveVsTwelveData.rewards.loser.celestialOre,
          ether: this.twelveVsTwelveData.rewards.loser.ether,
          prestige: this.twelveVsTwelveData.rewards.loser.prestige
        });
        
        if (loserError) throw new Error(`Gagal mendistribusikan hadiah ke yang kalah: ${loserError.message}`);
      } catch (error) {
        console.error('Error distributing war rewards:', error);
      }
    }
    
    /**
     * Mendapatkan daftar zodiak anggota aliansi
     * @param allianceId ID aliansi
     * @returns Daftar zodiak anggota aliansi
     * @private
     */
    private async getAllianceZodiacs(allianceId: string): Promise<string[]> {
      const { data, error } = await this.supabase.rpc('get_alliance_zodiacs', {
        alliance_id: allianceId
      });
      
      if (error) throw new Error(`Gagal mendapatkan zodiak aliansi: ${error.message}`);
      return data || [];
    }

    /**
     * Membuat perjanjian diplomasi antar aliansi
     * @param treatyType Jenis perjanjian (non-aggression/trade/alliance)
     * @param parties ID aliansi yang terlibat
     * @param terms Syarat-syarat perjanjian
     * @param duration Durasi perjanjian dalam milidetik
     * @returns Data perjanjian yang dibuat
     * @throws Error jika gagal membuat perjanjian
     */
    public async createDiplomacyTreaty(
      treatyType: 'non-aggression' | 'trade' | 'alliance',
      parties: string[],
      terms: Record<string, unknown>,
      duration: number
    ) {
      try {
        if (parties.length < 2) {
          throw new Error('Perjanjian diplomasi membutuhkan minimal 2 aliansi');
        }
        
        // Tentukan benefit berdasarkan jenis perjanjian
        const benefits: {
          resourceBonus?: number;
          defenseBonus?: number;
          attackBonus?: number;
          tradeTax?: number;
        } = {};
        
        switch (treatyType) {
          case 'non-aggression':
            benefits.defenseBonus = 0.05; // 5% bonus pertahanan
            break;
          case 'trade':
            benefits.resourceBonus = 0.1; // 10% bonus produksi sumber daya
            benefits.tradeTax = 0.05; // 5% pajak perdagangan
            break;
          case 'alliance':
            benefits.attackBonus = 0.1; // 10% bonus serangan
            benefits.defenseBonus = 0.1; // 10% bonus pertahanan
            benefits.resourceBonus = 0.05; // 5% bonus produksi sumber daya
            break;
        }
        
        const treatyId = crypto.randomUUID();
        const treaty = {
          id: treatyId,
          type: treatyType,
          parties,
          terms,
          expiresAt: Date.now() + duration,
          status: 'pending' as const,
          benefits
        };

        // Simpan ke database
        const { error } = await this.supabase
          .from('diplomatic_treaties')
          .insert({
            id: treatyId,
            type: treatyType,
            parties,
            terms,
            expires_at: treaty.expiresAt,
            status: treaty.status,
            benefits
          });
        
        if (error) throw new Error(`Gagal menyimpan perjanjian: ${error.message}`);
        
        // Tambahkan ke data lokal
        this.diplomacyData.treaties.push(treaty);
        
        // Kirim notifikasi ke semua aliansi yang terlibat
        for (const allianceId of parties) {
          await this.broadcastToAlliance(allianceId, {
            type: 'treaty-proposed',
            treatyId,
            treatyType,
            proposedBy: parties[0], // Aliansi pertama adalah pengusul
            expiresAt: treaty.expiresAt,
            benefits
          });
        }
        
        // Inisialisasi WebSocket untuk diplomasi jika belum ada
        this.initializeDiplomacyWebSocket();
        
        return treaty;
      } catch (error) {
        console.error('Error creating diplomatic treaty:', error);
        throw error;
      }
    }
    
    /**
     * Menerima atau menolak perjanjian diplomasi
     * @param treatyId ID perjanjian
     * @param allianceId ID aliansi yang merespons
     * @param accept True jika menerima, false jika menolak
     * @returns Status perjanjian setelah diupdate
     * @throws Error jika gagal memperbarui perjanjian
     */
    public async respondToDiplomaticTreaty(treatyId: string, allianceId: string, accept: boolean) {
      try {
        // Cari perjanjian di data lokal
        const treatyIndex = this.diplomacyData.treaties.findIndex(t => t.id === treatyId);
        if (treatyIndex === -1) {
          throw new Error('Perjanjian tidak ditemukan');
        }
        
        const treaty = this.diplomacyData.treaties[treatyIndex];
        
        // Pastikan aliansi adalah bagian dari perjanjian
        if (!treaty.parties.includes(allianceId)) {
          throw new Error('Aliansi tidak terlibat dalam perjanjian ini');
        }
        
        // Jika menolak, batalkan perjanjian
        if (!accept) {
          // Update di database
          const { error } = await this.supabase
            .from('diplomatic_treaties')
            .update({ status: 'rejected' })
            .eq('id', treatyId);
          
          if (error) throw new Error(`Gagal memperbarui perjanjian: ${error.message}`);
          
          // Update di data lokal
          this.diplomacyData.treaties.splice(treatyIndex, 1);
          
          // Notifikasi ke semua aliansi yang terlibat
          for (const partyId of treaty.parties) {
            await this.broadcastToAlliance(partyId, {
              type: 'treaty-rejected',
              treatyId,
              rejectedBy: allianceId
            });
          }
          
          return { status: 'rejected' };
        }
        
        // Jika menerima, aktifkan perjanjian
        // Update di database
        const { error } = await this.supabase
          .from('diplomatic_treaties')
          .update({ status: 'active' })
          .eq('id', treatyId);
        
        if (error) throw new Error(`Gagal memperbarui perjanjian: ${error.message}`);
        
        // Update di data lokal
        this.diplomacyData.treaties[treatyIndex].status = 'active';
        
        // Notifikasi ke semua aliansi yang terlibat
        for (const partyId of treaty.parties) {
          await this.broadcastToAlliance(partyId, {
            type: 'treaty-activated',
            treatyId,
            treatyType: treaty.type,
            parties: treaty.parties,
            benefits: treaty.benefits
          });
        }
        
        return { status: 'active' };
      } catch (error) {
        console.error('Error responding to diplomatic treaty:', error);
        throw error;
      }
    }
    
    /**
     * Inisialisasi WebSocket untuk sistem diplomasi
     * @private
     */
    private initializeDiplomacyWebSocket() {
      if (this.diplomacyWs) return;
      
      this.diplomacyWs = new WebSocket('wss://diplomacy-server.example.com/ws');
      
      this.diplomacyWs.onopen = () => {
        console.log('WebSocket diplomasi terhubung');
      };
      
      this.diplomacyWs.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Proses pesan diplomasi
          if (message.type === 'treaty-update') {
            await this.handleTreatyUpdate(message.treatyId, message.status);
          }
          
          // Proses pesan Eclipse War
          if (message.type === 'eclipse-war-start') {
            await this.startEclipseWar(message.duration);
          }
          
          // Proses pesan Zodiac Festival
          if (message.type === 'zodiac-festival-update') {
            await this.updateZodiacFestival(message.activeZodiac, message.bonuses, message.duration);
          }

          // Proses pesan Market Update
          if (message.type === 'market-price-update') {
            await this.updateMarketPrices(message.resources);
          }
        } catch (error) {
          console.error('Error processing diplomacy message:', error);
        }
      };
      
      this.diplomacyWs.onerror = (error) => {
        console.error('WebSocket diplomasi error:', error);
      };
      
      this.diplomacyWs.onclose = () => {
        console.log('WebSocket diplomasi ditutup');
        this.diplomacyWs = null;
      };
    }
    
    /**
     * Menangani update status perjanjian
     * @param treatyId ID perjanjian
     * @param status Status baru perjanjian
     * @private
     */
    private async handleTreatyUpdate(treatyId: string, status: 'active' | 'expired' | 'broken') {
      const treatyIndex = this.diplomacyData.treaties.findIndex(t => t.id === treatyId);
      if (treatyIndex === -1) return;
      
      // Update status perjanjian di data lokal
      this.diplomacyData.treaties[treatyIndex].status = status;
      
      // Update di database
      const { error } = await this.supabase
        .from('diplomatic_treaties')
        .update({ status })
        .eq('id', treatyId);
      
      if (error) console.error(`Gagal memperbarui status perjanjian: ${error.message}`);
      
      // Notifikasi ke semua aliansi yang terlibat
      const treaty = this.diplomacyData.treaties[treatyIndex];
      for (const allianceId of treaty.parties) {
        await this.broadcastToAlliance(allianceId, {
          type: 'treaty-status-update',
          treatyId,
          status
        });
      }
    }

    /**
     * Memulai Eclipse War - event khusus dimana serangan lebih cepat tapi risiko kehilangan sumber daya lebih tinggi
     * @param duration Durasi Eclipse War dalam milidetik
     * @returns Status Eclipse War
     */
    private async startEclipseWar(duration: number) {
      try {
        // Durasi maksimal 48 jam (dalam milidetik)
        const maxDuration = 48 * 60 * 60 * 1000;
        const actualDuration = Math.min(duration, maxDuration);
        
        this.diplomacyData.eclipseWarActive = true;
        this.diplomacyData.eclipseWarData = {
          startTime: Date.now(),
          endTime: Date.now() + actualDuration,
          attackSpeedBonus: 0.5, // 50% lebih cepat
          resourceRiskMultiplier: 2 // 2x risiko kehilangan sumber daya
        };
        
        // Simpan ke database
        const { error } = await this.supabase
          .from('game_events')
          .insert({
            type: 'eclipse_war',
            start_time: this.diplomacyData.eclipseWarData.startTime,
            end_time: this.diplomacyData.eclipseWarData.endTime,
            data: {
              attackSpeedBonus: this.diplomacyData.eclipseWarData.attackSpeedBonus,
              resourceRiskMultiplier: this.diplomacyData.eclipseWarData.resourceRiskMultiplier
            }
          });
        
        if (error) throw new Error(`Gagal menyimpan data Eclipse War: ${error.message}`);
        
        // Broadcast ke semua pemain
        const { data: alliances, error: alliancesError } = await this.supabase
          .from('alliances')
          .select('id');
        
        if (alliancesError) throw new Error(`Gagal mendapatkan daftar aliansi: ${alliancesError.message}`);
        
        for (const alliance of alliances) {
          await this.broadcastToAlliance(alliance.id, {
            type: 'eclipse-war-started',
            startTime: this.diplomacyData.eclipseWarData.startTime,
            endTime: this.diplomacyData.eclipseWarData.endTime,
            attackSpeedBonus: this.diplomacyData.eclipseWarData.attackSpeedBonus,
            resourceRiskMultiplier: this.diplomacyData.eclipseWarData.resourceRiskMultiplier
          });
        }
        
        // Set timer untuk mengakhiri Eclipse War
        setTimeout(() => this.endEclipseWar(), actualDuration);
        
        return { status: 'started', duration: actualDuration };
      } catch (error) {
        console.error('Error starting Eclipse War:', error);
        this.diplomacyData.eclipseWarActive = false;
        this.diplomacyData.eclipseWarData = null;
        return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    /**
     * Mengakhiri Eclipse War
     * @private
     */
    private async endEclipseWar() {
      if (!this.diplomacyData.eclipseWarActive) return;
      
      try {
        this.diplomacyData.eclipseWarActive = false;
        
        // Update di database
        const { error } = await this.supabase
          .from('game_events')
          .update({ status: 'ended', actual_end_time: Date.now() })
          .eq('type', 'eclipse_war')
          .eq('status', 'active');
        
        if (error) console.error(`Gagal mengupdate status Eclipse War: ${error.message}`);
        
        // Broadcast ke semua pemain
        const { data: alliances, error: alliancesError } = await this.supabase
          .from('alliances')
          .select('id');
        
        if (alliancesError) {
          console.error(`Gagal mendapatkan daftar aliansi: ${alliancesError.message}`);
          return;
        }
        
        for (const alliance of alliances) {
          await this.broadcastToAlliance(alliance.id, {
            type: 'eclipse-war-ended'
          });
        }
        
        this.diplomacyData.eclipseWarData = null;
      } catch (error) {
        console.error('Error ending Eclipse War:', error);
      }
    }
    
    /**
     * Memperbarui Zodiac Festival - event bulanan dimana zodiak yang sedang berkuasa mendapat bonus
     * @param activeZodiac Zodiak yang aktif
     * @param bonuses Bonus yang diberikan
     * @param duration Durasi festival dalam milidetik
     * @private
     */
    private async updateZodiacFestival(activeZodiac: string, bonuses: Record<string, number>, duration: number) {
      try {
        this.diplomacyData.zodiacFestival = {
          activeZodiac,
          startTime: Date.now(),
          endTime: Date.now() + duration,
          bonuses
        };
        
        // Simpan ke database
        const { error } = await this.supabase
          .from('game_events')
          .insert({
            type: 'zodiac_festival',
            start_time: this.diplomacyData.zodiacFestival.startTime,
            end_time: this.diplomacyData.zodiacFestival.endTime,
            data: {
              activeZodiac,
              bonuses
            }
          });
        
        if (error) throw new Error(`Gagal menyimpan data Zodiac Festival: ${error.message}`);
        
        // Broadcast ke semua pemain
        const { data: alliances, error: alliancesError } = await this.supabase
          .from('alliances')
          .select('id');
        
        if (alliancesError) throw new Error(`Gagal mendapatkan daftar aliansi: ${alliancesError.message}`);
        
        for (const alliance of alliances) {
          await this.broadcastToAlliance(alliance.id, {
            type: 'zodiac-festival-update',
            activeZodiac,
            bonuses,
            startTime: this.diplomacyData.zodiacFestival.startTime,
            endTime: this.diplomacyData.zodiacFestival.endTime
          });
        }
        
        // Set timer untuk mengakhiri Zodiac Festival
        setTimeout(() => this.endZodiacFestival(), duration);
        
        return { status: 'updated', activeZodiac };
      } catch (error) {
        console.error('Error updating Zodiac Festival:', error);
        return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    /**
     * Mengakhiri Zodiac Festival
     * @private
     */
    private async endZodiacFestival() {
      try {
        // Reset data festival
        this.diplomacyData.zodiacFestival = {
          activeZodiac: null,
          startTime: 0,
          endTime: 0,
          bonuses: {}
        };
        
        // Update di database
        const { error } = await this.supabase
          .from('game_events')
          .update({ status: 'ended', actual_end_time: Date.now() })
          .eq('type', 'zodiac_festival')
          .eq('status', 'active');
        
        if (error) console.error(`Gagal mengupdate status Zodiac Festival: ${error.message}`);
        
        // Broadcast ke semua pemain
        const { data: alliances, error: alliancesError } = await this.supabase
          .from('alliances')
          .select('id');
        
        if (alliancesError) {
          console.error(`Gagal mendapatkan daftar aliansi: ${alliancesError.message}`);
          return;
        }
        
        for (const alliance of alliances) {
          await this.broadcastToAlliance(alliance.id, {
            type: 'zodiac-festival-ended'
          });
        }
      } catch (error) {
        console.error('Error ending Zodiac Festival:', error);
      }
    }
    
    /**
     * Memperbarui harga pasar galaksi
     * @param resources Objek berisi harga terbaru untuk setiap sumber daya
     * @private
     */
    private async updateMarketPrices(resources: Record<string, {
      price: number;
      trend: 'rising' | 'falling' | 'stable';
      volatility: number;
    }>) {
      try {
        // Update harga di data lokal
        for (const [resourceType, data] of Object.entries(resources)) {
          this.diplomacyData.marketPrices[resourceType] = {
            currentPrice: data.price,
            trend: data.trend,
            volatility: data.volatility,
            lastUpdate: Date.now()
          };
        }
        
        // Update di database
        const { error } = await this.supabase
          .from('market_prices')
          .upsert(
            Object.entries(resources).map(([resourceType, data]) => ({
              resource_type: resourceType,
              price: data.price,
              trend: data.trend,
              volatility: data.volatility,
              last_update: new Date().toISOString()
            }))
          );
        
        if (error) throw new Error(`Gagal memperbarui harga pasar: ${error.message}`);
        
        // Broadcast ke semua pemain
        const { data: alliances, error: alliancesError } = await this.supabase
          .from('alliances')
          .select('id');
        
        if (alliancesError) throw new Error(`Gagal mendapatkan daftar aliansi: ${alliancesError.message}`);
        
        for (const alliance of alliances) {
          await this.broadcastToAlliance(alliance.id, {
            type: 'market-prices-updated',
            prices: Object.fromEntries(
              Object.entries(this.diplomacyData.marketPrices).map(([resource, data]) => [
                resource,
                {
                  price: data.currentPrice,
                  trend: data.trend,
                  volatility: data.volatility
                }
              ])
            )
          });
        }
        
        return { status: 'updated' };
      } catch (error) {
        console.error('Error updating market prices:', error);
        return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    /**
     * Memperbarui harga pasar galaksi untuk satu jenis sumber daya
     * @param resourceType Jenis sumber daya (stardust/celestialOre/ether)
     * @param newPrice Harga baru
     * @param trend Tren harga (naik/turun/stabil)
     * @returns Status pembaruan harga
     */
    public async updateMarketPrice(resourceType: string, newPrice: number, trend: 'rising' | 'falling' | 'stable' = 'stable') {
      try {
        // Validasi input
        if (newPrice <= 0) {
          throw new Error('Harga harus lebih dari 0');
        }
        
        // Hitung volatilitas berdasarkan perubahan harga
        let volatility = 0.1; // Default volatility
        
        if (this.diplomacyData.marketPrices[resourceType]) {
          const oldPrice = this.diplomacyData.marketPrices[resourceType].currentPrice;
          const priceChange = Math.abs(newPrice - oldPrice) / oldPrice;
          volatility = Math.min(Math.max(priceChange, 0.05), 0.5); // Batasi volatilitas antara 5% - 50%
        }
        
        // Update di data lokal
        this.diplomacyData.marketPrices[resourceType] = {
          currentPrice: newPrice,
          trend,
          volatility,
          lastUpdate: Date.now()
        };
        
        // Update di database
        const { error } = await this.supabase
          .from('market_prices')
          .upsert({
            resource_type: resourceType,
            price: newPrice,
            trend,
            volatility,
            last_update: new Date().toISOString()
          });
        
        if (error) throw new Error(`Gagal memperbarui harga pasar: ${error.message}`);
        
        // Broadcast ke semua pemain jika terhubung ke WebSocket diplomasi
        if (this.diplomacyWs && this.diplomacyWs.readyState === WebSocket.OPEN) {
          this.diplomacyWs.send(JSON.stringify({
            type: 'market-price-update',
            resourceType,
            price: newPrice,
            trend,
            volatility
          }));
        }
        
        return { status: 'updated', price: newPrice, trend, volatility };
      } catch (error) {
        console.error('Error updating market price:', error);
        return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    /**
     * Mendapatkan harga pasar terkini untuk semua sumber daya
     * @returns Objek berisi harga terkini untuk setiap sumber daya
     */
    public async getMarketPrices() {
      try {
        // Cek apakah perlu refresh dari database (jika data lokal kosong atau sudah lama)
        const needsRefresh = Object.keys(this.diplomacyData.marketPrices).length === 0 ||
          Date.now() - Math.max(
            ...Object.values(this.diplomacyData.marketPrices).map(data => data.lastUpdate)
          ) > 5 * 60 * 1000; // 5 menit
        
        if (needsRefresh) {
          const { data, error } = await this.supabase
            .from('market_prices')
            .select('*');
          
          if (error) throw new Error(`Gagal mendapatkan harga pasar: ${error.message}`);
          
          // Update data lokal
          for (const item of data) {
            this.diplomacyData.marketPrices[item.resource_type] = {
              currentPrice: item.price,
              trend: item.trend,
              volatility: item.volatility,
              lastUpdate: new Date(item.last_update).getTime()
            };
          }
        }
        
        return Object.fromEntries(
          Object.entries(this.diplomacyData.marketPrices).map(([resource, data]) => [
            resource,
            {
              price: data.currentPrice,
              trend: data.trend,
              volatility: data.volatility,
              lastUpdate: data.lastUpdate
            }
          ])
        );
      } catch (error) {
        console.error('Error getting market prices:', error);
        throw error;
      }
    }
  private allianceSubscriptions: Record<string, (payload: any) => void> = {};

  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService();
    }
    return MultiplayerService.instance;
  }

  /**
   * Berlangganan update aliansi
   * @param allianceId - ID aliansi yang akan di-subscribe
   * @param callback - Fungsi yang dipanggil saat ada update
   * @throws Error jika gagal melakukan subscribe
   */
  async subscribeToAlliance(allianceId: string, callback: (payload: Record<string, unknown>) => void) {
    this.allianceSubscriptions[allianceId] = callback;
    
    // Connect to alliance WebSocket if not already connected
    if (!this.allianceWs) {
      this.allianceWs = new WebSocket(`wss://alliance-server.example.com/ws/${allianceId}`);
      
      this.allianceWs.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (this.allianceSubscriptions[message.allianceId]) {
          this.allianceSubscriptions[message.allianceId](message);
        }
      };
    }
  }

  async unsubscribeFromAlliance(allianceId: string) {
    delete this.allianceSubscriptions[allianceId];
    
    // Close WebSocket if no more subscriptions
    if (Object.keys(this.allianceSubscriptions).length === 0 && this.allianceWs) {
      this.allianceWs.close();
      this.allianceWs = null;
    }
  }

  /**
   * Mengirim pesan broadcast ke semua anggota aliansi
   * @param allianceId - ID aliansi tujuan
   * @param message - Pesan yang akan dikirim
   * @throws Error jika WebSocket tidak tersedia atau tidak terbuka
   */
  async broadcastToAlliance(allianceId: string, message: Record<string, unknown>) {
    if (!this.allianceWs) {
      throw new Error('WebSocket aliansi belum diinisialisasi');
    }
    
    if (this.allianceWs.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket aliansi tidak dalam keadaan terbuka');
    }
    
    this.allianceWs.send(JSON.stringify({
      allianceId,
      ...message
    }));
  }

  /**
   * Memulai perang aliansi 12v12
   * @param alliance1Id - ID aliansi pertama
   * @param alliance2Id - ID aliansi kedua
   * @returns Data perang yang baru dibuat
   * @throws Error jika gagal memulai perang
   */
  async startAllianceWar(alliance1Id: string, alliance2Id: string) {
    const { data, error } = await this.supabase.rpc('start_alliance_war', {
      alliance1_id: alliance1Id,
      alliance2_id: alliance2Id
    });

    if (error) throw error;
    return data;
  }

  /**
   * Menghitung bonus kombinasi zodiak dalam aliansi
   * @param zodiacSigns - Daftar zodiak anggota aliansi
   * @returns Daftar bonus yang aktif
   * @throws Error jika gagal menghitung bonus
   */
  async calculateZodiacComboBonuses(zodiacSigns: string[]): Promise<ZodiacComboBonus[]> {
    try {
      // Cek apakah sudah ada di cache
      const cacheKey = zodiacSigns.sort().join(',');
      if (this.allianceZodiacCombos[cacheKey]) {
        return this.allianceZodiacCombos[cacheKey];
      }
      
      // Definisi kombinasi zodiak dan bonusnya
      const combos: ZodiacComboBonus[] = [];
      
      // Trine Api (Fire Trine): Aries, Leo, Sagittarius
      if (zodiacSigns.includes('aries') && zodiacSigns.includes('leo') && zodiacSigns.includes('sagittarius')) {
        combos.push({
          combo: ['aries', 'leo', 'sagittarius'],
          bonus: 'Trine Api',
          value: 0.15,
          description: 'Meningkatkan kekuatan serangan sebesar 15%'
        });
      }
      
      // Trine Tanah (Earth Trine): Taurus, Virgo, Capricorn
      if (zodiacSigns.includes('taurus') && zodiacSigns.includes('virgo') && zodiacSigns.includes('capricorn')) {
        combos.push({
          combo: ['taurus', 'virgo', 'capricorn'],
          bonus: 'Trine Tanah',
          value: 0.15,
          description: 'Meningkatkan produksi sumber daya sebesar 15%'
        });
      }
      
      // Trine Udara (Air Trine): Gemini, Libra, Aquarius
      if (zodiacSigns.includes('gemini') && zodiacSigns.includes('libra') && zodiacSigns.includes('aquarius')) {
        combos.push({
          combo: ['gemini', 'libra', 'aquarius'],
          bonus: 'Trine Udara',
          value: 0.15,
          description: 'Meningkatkan kecepatan riset dan diplomasi sebesar 15%'
        });
      }
      
      // Trine Air (Water Trine): Cancer, Scorpio, Pisces
      if (zodiacSigns.includes('cancer') && zodiacSigns.includes('scorpio') && zodiacSigns.includes('pisces')) {
        combos.push({
          combo: ['cancer', 'scorpio', 'pisces'],
          bonus: 'Trine Air',
          value: 0.15,
          description: 'Meningkatkan pertahanan dan kemampuan mata-mata sebesar 15%'
        });
      }
      
      // Kombinasi Kardinal (Cardinal Combo): Aries, Cancer, Libra, Capricorn
      if (zodiacSigns.includes('aries') && zodiacSigns.includes('cancer') && 
          zodiacSigns.includes('libra') && zodiacSigns.includes('capricorn')) {
        combos.push({
          combo: ['aries', 'cancer', 'libra', 'capricorn'],
          bonus: 'Kuartet Kardinal',
          value: 0.2,
          description: 'Meningkatkan kecepatan ekspansi dan pembangunan sebesar 20%'
        });
      }
      
      // Kombinasi Tetap (Fixed Combo): Taurus, Leo, Scorpio, Aquarius
      if (zodiacSigns.includes('taurus') && zodiacSigns.includes('leo') && 
          zodiacSigns.includes('scorpio') && zodiacSigns.includes('aquarius')) {
        combos.push({
          combo: ['taurus', 'leo', 'scorpio', 'aquarius'],
          bonus: 'Kuartet Tetap',
          value: 0.2,
          description: 'Meningkatkan ketahanan dan stabilitas kerajaan sebesar 20%'
        });
      }
      
      // Kombinasi Mutable (Mutable Combo): Gemini, Virgo, Sagittarius, Pisces
      if (zodiacSigns.includes('gemini') && zodiacSigns.includes('virgo') && 
          zodiacSigns.includes('sagittarius') && zodiacSigns.includes('pisces')) {
        combos.push({
          combo: ['gemini', 'virgo', 'sagittarius', 'pisces'],
          bonus: 'Kuartet Mutable',
          value: 0.2,
          description: 'Meningkatkan adaptabilitas dan efisiensi sebesar 20%'
        });
      }
      
      // Kombinasi Pasangan (Polarity Pairs)
      // Aries-Libra
      if (zodiacSigns.includes('aries') && zodiacSigns.includes('libra')) {
        combos.push({
          combo: ['aries', 'libra'],
          bonus: 'Keseimbangan Perang & Damai',
          value: 0.1,
          description: 'Meningkatkan efektivitas serangan dan diplomasi sebesar 10%'
        });
      }
      
      // Taurus-Scorpio
      if (zodiacSigns.includes('taurus') && zodiacSigns.includes('scorpio')) {
        combos.push({
          combo: ['taurus', 'scorpio'],
          bonus: 'Kekayaan Tersembunyi',
          value: 0.1,
          description: 'Meningkatkan produksi sumber daya dan kemampuan mata-mata sebesar 10%'
        });
      }
      
      // Gemini-Sagittarius
      if (zodiacSigns.includes('gemini') && zodiacSigns.includes('sagittarius')) {
        combos.push({
          combo: ['gemini', 'sagittarius'],
          bonus: 'Pengetahuan & Eksplorasi',
          value: 0.1,
          description: 'Meningkatkan jangkauan serangan dan kecepatan riset sebesar 10%'
        });
      }
      
      // Cancer-Capricorn
      if (zodiacSigns.includes('cancer') && zodiacSigns.includes('capricorn')) {
        combos.push({
          combo: ['cancer', 'capricorn'],
          bonus: 'Benteng Kerajaan',
          value: 0.1,
          description: 'Meningkatkan pertahanan dan efisiensi pembangunan sebesar 10%'
        });
      }
      
      // Leo-Aquarius
      if (zodiacSigns.includes('leo') && zodiacSigns.includes('aquarius')) {
        combos.push({
          combo: ['leo', 'aquarius'],
          bonus: 'Pemimpin Visioner',
          value: 0.1,
          description: 'Meningkatkan moral pasukan dan inovasi teknologi sebesar 10%'
        });
      }
      
      // Virgo-Pisces
      if (zodiacSigns.includes('virgo') && zodiacSigns.includes('pisces')) {
        combos.push({
          combo: ['virgo', 'pisces'],
          bonus: 'Analisis & Intuisi',
          value: 0.1,
          description: 'Meningkatkan efisiensi produksi dan kemampuan ilusi sebesar 10%'
        });
      }
      
      // Bonus Aliansi Lengkap (semua 12 zodiak)
      if (zodiacSigns.length === 12 && 
          zodiacSigns.includes('aries') && zodiacSigns.includes('taurus') && 
          zodiacSigns.includes

  /**
   * Membuat perjanjian diplomasi antar aliansi
   * @param allianceId - ID aliansi pengirim
   * @param targetAllianceId - ID aliansi target
   * @param treatyType - Jenis perjanjian (trade/non-aggression/alliance)
   * @param terms - Syarat perjanjian
   * @returns Data perjanjian yang dibuat
   */
  async createDiplomaticTreaty(
    allianceId: string,
    targetAllianceId: string,
    treatyType: 'trade' | 'non-aggression' | 'alliance',
    terms: Record<string, unknown>
  ) {
    const { data, error } = await this.supabase.rpc('create_diplomatic_treaty', {
      alliance_id: allianceId,
      target_alliance_id: targetAllianceId,
      treaty_type: treatyType,
      terms: terms
    });

    if (error) throw new Error(`Gagal membuat perjanjian: ${error.message}`);
    return data;
  }

  /**
   * Mendapatkan status perang aliansi
   * @param warId - ID perang
   * @returns Objek berisi status perang
   * @throws Error jika gagal mendapatkan data perang
   */
  async getWarStatus(warId: string): Promise<{
    id: string;
    alliance1_id: string;
    alliance2_id: string;
    score_alliance1: number;
    score_alliance2: number;
    status: 'ongoing' | 'finished';
    winner_alliance_id: string | null;
  }> {
    const { data, error } = await this.supabase
      .from('alliance_wars')
      .select('*')
      .eq('id', warId)
      .single();

    if (error) throw new Error(`Gagal mendapatkan status perang: ${error.message}`);
    return data;
  }

  async updateWarScore(warId: string, scoreDelta: number) {
    const { data, error } = await this.supabase.rpc('update_war_score', {
      war_id: warId,
      score_delta: scoreDelta
    });

    if (error) throw error;
    return data;
  }

  /**
   * Membuat aliansi baru
   * @param name Nama aliansi
   * @param leaderId ID pemimpin aliansi
   * @param initialMembers Daftar ID anggota awal
   * @returns Data aliansi yang dibuat
   */
  public async createAlliance(
    name: string,
    leaderId: string,
    initialMembers: string[] = [leaderId]
  ) {
    try {
      // Validasi data
      if (!name.trim()) {
        throw new Error('Nama aliansi tidak boleh kosong');
      }

      if (!initialMembers.includes(leaderId)) {
        initialMembers.push(leaderId);
      }

      // Buat aliansi baru
      const { data, error } = await this.supabase
        .from('alliances')
        .insert({
          name,
          leader_id: leaderId,
          member_ids: initialMembers,
          resources: {
            stardust: 0,
            celestialOre: 0,
            ether: 0
          },
          zodiac_combo_bonuses: [],
          war_status: {
            isAtWar: false,
            opponentAllianceId: null,
            warScore: 0
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Inisialisasi WebSocket untuk aliansi
      await this.initializeAllianceWebSocket(data.id);

      return data;
    } catch (error) {
      console.error('Error creating alliance:', error);
      throw error;
    }
  }

  /**
   * Menambahkan anggota ke aliansi
   * @param allianceId ID aliansi
   * @param memberId ID anggota baru
   * @returns Status operasi
   */
  public async addMemberToAlliance(allianceId: string, memberId: string) {
    try {
      // Dapatkan data aliansi saat ini
      const { data: alliance, error: fetchError } = await this.supabase
        .from('alliances')
        .select('member_ids')
        .eq('id', allianceId)
        .single();

      if (fetchError) throw fetchError;

      // Periksa apakah anggota sudah ada
      if (alliance.member_ids.includes(memberId)) {
        return { status: 'already_member' };
      }

      // Tambahkan anggota baru
      const updatedMembers = [...alliance.member_ids, memberId];
      const { error: updateError } = await this.supabase
        .from('alliances')
        .update({ member_ids: updatedMembers })
        .eq('id', allianceId);

      if (updateError) throw updateError;

      // Notifikasi ke semua anggota aliansi
      await this.broadcastToAlliance(allianceId, {
        type: 'member-joined',
        memberId,
        timestamp: Date.now()
      });

      return { status: 'success', memberId };
    } catch (error) {
      console.error('Error adding member to alliance:', error);
      throw error;
    }
  }

  /**
   * Menghapus anggota dari aliansi
   * @param allianceId ID aliansi
   * @param memberId ID anggota yang akan dihapus
   * @returns Status operasi
   */
  public async removeMemberFromAlliance(allianceId: string, memberId: string) {
    try {
      // Dapatkan data aliansi saat ini
      const { data: alliance, error: fetchError } = await this.supabase
        .from('alliances')
        .select('member_ids, leader_id')
        .eq('id', allianceId)
        .single();

      if (fetchError) throw fetchError;

      // Periksa apakah anggota ada
      if (!alliance.member_ids.includes(memberId)) {
        return { status: 'not_a_member' };
      }

      // Periksa apakah anggota adalah pemimpin
      if (alliance.leader_id === memberId) {
        return { status: 'cannot_remove_leader' };
      }

      // Hapus anggota
      const updatedMembers = alliance.member_ids.filter(id => id !== memberId);
      const { error: updateError } = await this.supabase
        .from('alliances')
        .update({ member_ids: updatedMembers })
        .eq('id', allianceId);

      if (updateError) throw updateError;

      // Notifikasi ke semua anggota aliansi
      await this.broadcastToAlliance(allianceId, {
        type: 'member-left',
        memberId,
        timestamp: Date.now()
      });

      return { status: 'success', memberId };
    } catch (error) {
      console.error('Error removing member from alliance:', error);
      throw error;
    }
  }

  /**
   * Mengubah peran anggota dalam aliansi
   * @param allianceId ID aliansi
   * @param memberId ID anggota
   * @param newRole Peran baru ('leader', 'officer', 'member')
   * @returns Status operasi
   */
  public async changeAllianceMemberRole(
    allianceId: string,
    memberId: string,
    newRole: 'leader' | 'officer' | 'member'
  ) {
    try {
      // Dapatkan data aliansi saat ini
      const { data: alliance, error: fetchError } = await this.supabase
        .from('alliances')
        .select('member_ids, leader_id, member_roles')
        .eq('id', allianceId)
        .single();

      if (fetchError) throw fetchError;

      // Periksa apakah anggota ada
      if (!alliance.member_ids.includes(memberId)) {
        return { status: 'not_a_member' };
      }

      // Update peran
      let updatedData: Record<string, any> = {};
      
      if (newRole === 'leader') {
        // Jika peran baru adalah pemimpin, tukar dengan pemimpin lama
        const oldLeaderId = alliance.leader_id;
        updatedData.leader_id = memberId;
        
        // Update peran anggota
        const memberRoles = alliance.member_roles || {};
        memberRoles[oldLeaderId] = 'officer'; // Pemimpin lama menjadi officer
        memberRoles[memberId] = 'leader'; // Anggota baru menjadi pemimpin
        updatedData.member_roles = memberRoles;
      } else {
        // Update peran anggota
        const memberRoles = alliance.member_roles || {};
        memberRoles[memberId] = newRole;
        updatedData.member_roles = memberRoles;
      }

      const { error: updateError } = await this.supabase
        .from('alliances')
        .update(updatedData)
        .eq('id', allianceId);

      if (updateError) throw updateError;

      // Notifikasi ke semua anggota aliansi
      await this.broadcastToAlliance(allianceId, {
        type: 'role-changed',
        memberId,
        newRole,
        timestamp: Date.now()
      });

      return { status: 'success', memberId, newRole };
    } catch (error) {
      console.error('Error changing alliance member role:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data aliansi
   * @param allianceId ID aliansi
   * @returns Data aliansi
   */
  public async getAllianceData(allianceId: string) {
    try {
      const { data, error } = await this.supabase
        .from('alliances')
        .select('*')
        .eq('id', allianceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting alliance data:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan daftar aliansi
   * @param limit Batas jumlah aliansi yang diambil
   * @param offset Offset untuk pagination
   * @returns Daftar aliansi
   */
  public async getAllianceList(limit: number = 20, offset: number = 0) {
    try {
      const { data, error } = await this.supabase
        .from('alliances')
        .select('id, name, leader_id, member_ids')
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting alliance list:', error);
      throw error;
    }
  }

  /**
   * Mencari aliansi berdasarkan nama
   * @param searchTerm Kata kunci pencarian
   * @returns Daftar aliansi yang cocok
   */
  public async searchAlliances(searchTerm: string) {
    try {
      const { data, error } = await this.supabase
        .from('alliances')
        .select('id, name, leader_id, member_ids')
        .ilike('name', `%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching alliances:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan status perang aliansi
   * @param allianceId ID aliansi
   * @returns Status perang aliansi
   */
  public async getAllianceWarStatus(allianceId: string) {
    try {
      const { data, error } = await this.supabase
        .from('alliances')
        .select('war_status')
        .eq('id', allianceId)
        .single();

      if (error) throw error;
      return data.war_status;
    } catch (error) {
      console.error('Error getting alliance war status:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data zodiak untuk semua anggota aliansi
   * @param allianceId ID aliansi
   * @returns Data zodiak anggota aliansi
   */
  public async getAllianceMemberZodiacs(allianceId: string): Promise<Array<{memberId: string, zodiac: ZodiacProps}>> {
    try {
      // Dapatkan daftar anggota aliansi
      const { data: alliance, error: allianceError } = await this.supabase
        .from('alliances')
        .select('member_ids')
        .eq('id', allianceId)
        .single();

      if (allianceError) throw allianceError;

      // Dapatkan data zodiak untuk setiap anggota
      const { data: members, error: membersError } = await this.supabase
        .from('players')
        .select('id, zodiac')
        .in('id', alliance.member_ids);

      if (membersError) throw membersError;

      return members.map(member => ({
        memberId: member.id,
        zodiac: member.zodiac
      }));
    } catch (error) {
      console.error('Error getting alliance member zodiacs:', error);
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardData> {
    const { data, error } = await this.supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;
    return { players: data };
  }

  // Matchmaking berdasarkan level dan kekuatan zodiak
  /**
   * Mencari pertandingan kompetitif berdasarkan level dan kekuatan zodiak
   * @param playerData - Data pemain yang akan dicocokkan
   * @param playerData.userId - ID unik pemain
   * @param playerData.zodiacLevel - Level zodiak pemain
   * @param playerData.zodiacPower - Kekuatan zodiak pemain
   * @returns Data pertandingan yang ditemukan
   * @throws Error jika gagal mencari pertandingan
   */
  async findMatch(playerData: {
    userId: string;
    zodiacLevel: number;
    zodiacPower: number;
  }): Promise<{ battleId: string; opponentId: string }> {
    const { data, error } = await this.supabase.rpc('find_competitive_match', {
      player_level: playerData.zodiacLevel,
      player_power: playerData.zodiacPower,
      user_id: playerData.userId
    });

    if (error) throw new Error(`Gagal mencari pertandingan: ${error.message}`);
    return data;
  }

  // Inisialisasi koneksi WebSocket untuk pertempuran dengan validasi dan error handling yang lebih baik
  /**
   * Membuka koneksi WebSocket untuk pertempuran
   * @param battleId - ID pertempuran
   * @param handlers - Object berisi handler untuk berbagai event
   * @param handlers.onMessage - Handler untuk pesan pertempuran
   * @param handlers.onStatusUpdate - Handler untuk update status koneksi
   * @param handlers.onError - Handler untuk error
   * @throws Error jika ID pertempuran tidak valid atau gagal koneksi
   */
  connectToBattle(battleId: string, handlers: {
    onMessage: (msg: BattleMessage) => void;
    onStatusUpdate: (status: string) => void;
    onError: (error: string) => void;
  }) {
    try {
      if (!battleId || typeof battleId !== 'string') {
        throw new Error('ID pertempuran tidak valid');
      }

      this.ws = new WebSocket(`wss://battle-server.example.com/ws/${battleId}`);

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (!message.type) {
            throw new Error('Format pesan tidak valid');
          }
          handlers.onMessage(message);
        } catch (error) {
          handlers.onError(`Error parsing message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      this.ws.onerror = (error) => {
        this.connectionStatus = 'disconnected';
        handlers.onStatusUpdate('Mencoba menyambung kembali...');
        handlers.onError(`WebSocket error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        this.handleReconnection(battleId, handlers);
      };

      this.ws.onclose = (event) => {
        if (!event.wasClean) {
          handlers.onError(`Koneksi ditutup dengan kode: ${event.code}, alasan: ${event.reason}`);
        }
      };

      this.ws.onopen = () => {
        this.connectionStatus = 'connected';
        handlers.onStatusUpdate('Terhubung ke server pertempuran');
        this.reconnectAttempts = 0;
      };

    } catch (error) {
      handlers.onError(`Error initializing WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Mengirim aksi pemain ke server dengan validasi yang lebih ketat
  sendPlayerAction(action: Omit<BattleMessage, 'timestamp' | 'playerId'>) {
    try {
      // Validasi tambahan untuk payload aksi
      if (!action.type || !['move', 'attack', 'ability', 'chat', 'turn-end'].includes(action.type)) {
        throw new Error('Jenis aksi tidak valid');
      }
      
      if (action.type !== 'chat' && !action.payload?.targetId) {
        throw new Error('Payload aksi tidak lengkap');
      }
      
      this.validateAction(action);
      this.lastActionTimestamp = Date.now();
      
      if (!this.ws) {
        throw new Error('WebSocket belum diinisialisasi');
      }
      
      if (this.ws.readyState !== WebSocket.OPEN) {
        throw new Error('Koneksi WebSocket tidak aktif');
      }
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('ID pemain tidak ditemukan');
      }
      
      const message: BattleMessage = {
        ...action,
        timestamp: Date.now(),
        playerId: userId
      };
      
      this.ws.send(JSON.stringify(message));
      return { status: 'success', message: 'Aksi berhasil dikirim' };
      
    } catch (error) {
      console.error('Error sending player action:', error);
      return { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Gagal mengirim aksi'
      };
    }
  }

  getConnectionStats() {
    return {
      status: this.connectionStatus,
      lastActivity: this.lastActionTimestamp,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Handle reconnect dengan exponential backoff
  private handleReconnection(battleId: string, handlers: any) {
    const MAX_RECONNECT_ATTEMPTS = 5;
    const BASE_DELAY_MS = 1000;
    const MAX_DELAY_MS = 30000;
    
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.connectionStatus = 'connecting';
      const attempt = this.reconnectAttempts + 1;
      handlers.onStatusUpdate(`Menyambung kembali (percobaan ${attempt}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      // Exponential backoff dengan jitter
      const delay = Math.min(
        BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
        MAX_DELAY_MS
      );
      
      const reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connectToBattle(battleId, handlers);
      }, delay);
      
      return () => clearTimeout(reconnectTimeout);
    } else {
      // Auto reset setelah 1 menit
      setTimeout(() => {
        this.reconnectAttempts = 0;
      }, 60000);
      
      handlers.onError(`Gagal menyambung setelah ${MAX_RECONNECT_ATTEMPTS} percobaan`);
      handlers.onStatusUpdate('Klik untuk mencoba menyambung kembali');
    }
  }

  private validateAction(action: any, gameState?: any) {
    const MAX_ACTION_DELAY = 3000;
    const MIN_ACTION_INTERVAL = 500;
    
    // Validasi timestamp
    const now = Date.now();
    const actionAge = now - action.timestamp;
    
    if (actionAge > MAX_ACTION_DELAY) {
      throw new Error('Aksi kedaluwarsa - timestamp terlalu lama');
    }
    
    if (now - this.lastActionTimestamp < MIN_ACTION_INTERVAL) {
      throw new Error('Aksi terlalu cepat - tunggu 500ms');
    }
    
    // Validasi struktur aksi dasar
    if (!action.type || !action.payload || !action.timestamp) {
      throw new Error('Format aksi tidak valid');
    }
    
    // Validasi tipe aksi yang diperbolehkan
    const allowedTypes = ['move', 'attack', 'ability', 'chat', 'turn-end'];
    if (!allowedTypes.includes(action.type)) {
      throw new Error(`Tipe aksi ${action.type} tidak valid`);
    }
    
    // Validasi payload berdasarkan tipe aksi dan game state
    if (action.type === 'move') {
      if (!action.payload.direction || !['up','down','left','right'].includes(action.payload.direction)) {
        throw new Error('Arah pergerakan tidak valid');
      }
      
      if (gameState && gameState.selectedUnit?.movementLeft <= 0) {
        throw new Error('Unit tidak memiliki movement point tersisa');
      }
    }
    
    if (action.type === 'attack') {
      if (!action.payload.targetId || !gameState?.availableTargets?.includes(action.payload.targetId)) {
        throw new Error('Target serangan tidak valid');
      }
    }
  }

  // Sistem timeout turn-based
  startTurnTimer(duration: number, onTimeout: () => void) {
    let timeLeft = duration;
    const timer = setInterval(() => {
      timeLeft -= 1000;
      if (timeLeft <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, 1000);
    return timer;
  }
}