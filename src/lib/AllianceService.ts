import { MultiplayerService } from './MultiplayerService';
import type { ZodiacProps } from '@/components/ZodiacCard';

/**
 * Service untuk menangani fitur aliansi dalam game
 * Memperluas MultiplayerService dengan fitur khusus aliansi
 */
export class AllianceService {
  private static instance: AllianceService;
  private multiplayerService: MultiplayerService;

  private constructor() {
    this.multiplayerService = MultiplayerService.getInstance();
  }

  /**
   * Mendapatkan instance AllianceService (Singleton)
   * @returns Instance AllianceService
   */
  public static getInstance(): AllianceService {
    if (!AllianceService.instance) {
      AllianceService.instance = new AllianceService();
    }
    return AllianceService.instance;
  }

  /**
   * Inisialisasi WebSocket untuk komunikasi aliansi
   * @param allianceId ID aliansi yang akan diinisialisasi
   * @returns Status koneksi
   */
  public initializeAllianceWebSocket(allianceId: string): Promise<{ status: string }> {
    return this.multiplayerService.initializeAllianceWebSocket(allianceId);
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
    return this.multiplayerService.createAlliance(name, leaderId, initialMembers);
  }

  /**
   * Menambahkan anggota ke aliansi
   * @param allianceId ID aliansi
   * @param memberId ID anggota baru
   * @returns Status operasi
   */
  public async addMemberToAlliance(allianceId: string, memberId: string) {
    return this.multiplayerService.addMemberToAlliance(allianceId, memberId);
  }

  /**
   * Menghapus anggota dari aliansi
   * @param allianceId ID aliansi
   * @param memberId ID anggota yang akan dihapus
   * @returns Status operasi
   */
  public async removeMemberFromAlliance(allianceId: string, memberId: string) {
    return this.multiplayerService.removeMemberFromAlliance(allianceId, memberId);
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
    return this.multiplayerService.changeAllianceMemberRole(allianceId, memberId, newRole);
  }

  /**
   * Mendapatkan data aliansi
   * @param allianceId ID aliansi
   * @returns Data aliansi
   */
  public async getAllianceData(allianceId: string) {
    return this.multiplayerService.getAllianceData(allianceId);
  }

  /**
   * Mendapatkan daftar aliansi
   * @param limit Batas jumlah aliansi yang diambil
   * @param offset Offset untuk pagination
   * @returns Daftar aliansi
   */
  public async getAllianceList(limit: number = 20, offset: number = 0) {
    return this.multiplayerService.getAllianceList(limit, offset);
  }

  /**
   * Mencari aliansi berdasarkan nama
   * @param searchTerm Kata kunci pencarian
   * @returns Daftar aliansi yang cocok
   */
  public async searchAlliances(searchTerm: string) {
    return this.multiplayerService.searchAlliances(searchTerm);
  }

  /**
   * Memulai pertempuran 12vs12 untuk mengontrol Nebula Inti
   * @param allianceId1 ID aliansi pertama
   * @param allianceId2 ID aliansi kedua
   * @param nebulaCorePosition Posisi Nebula Inti di peta galaksi
   * @param duration Durasi pertempuran dalam milidetik
   * @returns Data pertempuran yang dibuat
   */
  public async startTwelveVsTwelveBattle(
    allianceId1: string,
    allianceId2: string,
    nebulaCorePosition: {x: number, y: number},
    duration: number
  ) {
    return this.multiplayerService.startTwelveVsTwelveBattle(
      allianceId1,
      allianceId2,
      nebulaCorePosition,
      duration
    );
  }

  /**
   * Membuat perjanjian diplomasi antar aliansi
   * @param treatyType Jenis perjanjian (non-aggression/trade/alliance)
   * @param parties ID aliansi yang terlibat
   * @param terms Syarat-syarat perjanjian
   * @param duration Durasi perjanjian dalam milidetik
   * @returns Data perjanjian yang dibuat
   */
  public async createDiplomacyTreaty(
    treatyType: 'non-aggression' | 'trade' | 'alliance',
    parties: string[],
    terms: Record<string, unknown>,
    duration: number
  ) {
    return this.multiplayerService.createDiplomacyTreaty(
      treatyType,
      parties,
      terms,
      duration
    );
  }

  /**
   * Menerima atau menolak perjanjian diplomasi
   * @param treatyId ID perjanjian
   * @param allianceId ID aliansi yang merespons
   * @param accept True jika menerima, false jika menolak
   * @returns Status perjanjian setelah diupdate
   */
  public async respondToDiplomaticTreaty(
    treatyId: string,
    allianceId: string,
    accept: boolean
  ) {
    return this.multiplayerService.respondToDiplomaticTreaty(
      treatyId,
      allianceId,
      accept
    );
  }

  /**
   * Mendapatkan daftar zodiak anggota aliansi
   * @param allianceId ID aliansi
   * @returns Daftar zodiak anggota aliansi
   */
  public async getAllianceZodiacs(allianceId: string): Promise<string[]> {
    return this.multiplayerService.getAllianceZodiacs(allianceId);
  }

  /**
   * Menghitung bonus kombinasi zodiak dalam aliansi
   * @param zodiacSigns Daftar zodiak anggota aliansi
   * @returns Daftar bonus yang aktif
   */
  public async calculateZodiacComboBonuses(zodiacSigns: string[]) {
    return this.multiplayerService.calculateZodiacComboBonuses(zodiacSigns);
  }

  /**
   * Mendapatkan status perang aliansi
   * @param allianceId ID aliansi
   * @returns Status perang aliansi
   */
  public async getAllianceWarStatus(allianceId: string) {
    return this.multiplayerService.getAllianceWarStatus(allianceId);
  }

  /**
   * Memperbarui skor perang aliansi
   * @param warId ID perang
   * @param scoreDelta Perubahan skor
   * @returns Status operasi
   */
  public async updateWarScore(warId: string, scoreDelta: number) {
    return this.multiplayerService.updateWarScore(warId, scoreDelta);
  }

  /**
   * Mengirim pesan broadcast ke semua anggota aliansi
   * @param allianceId ID aliansi tujuan
   * @param message Pesan yang akan dikirim
   */
  public async broadcastToAlliance(allianceId: string, message: Record<string, unknown>) {
    return this.multiplayerService.broadcastToAlliance(allianceId, message);
  }

  /**
   * Mendapatkan data zodiak untuk semua anggota aliansi
   * @param allianceId ID aliansi
   * @returns Data zodiak anggota aliansi
   */
  public async getAllianceMemberZodiacs(allianceId: string): Promise<Array<{memberId: string, zodiac: ZodiacProps}>> {
    return this.multiplayerService.getAllianceMemberZodiacs(allianceId);
  }

  /**
   * Menganalisis kompatibilitas zodiak dalam aliansi
   * @param allianceId ID aliansi
   * @returns Analisis kompatibilitas zodiak
   */
  public async analyzeAllianceZodiacCompatibility(allianceId: string) {
    const memberZodiacs = await this.getAllianceMemberZodiacs(allianceId);
    const zodiacSigns = memberZodiacs.map(member => member.zodiac.name.toLowerCase());
    const comboBonuses = await this.calculateZodiacComboBonuses(zodiacSigns);
    
    // Hitung total bonus
    const totalBonus = comboBonuses.reduce((total, bonus) => total + bonus.value, 0);
    
    // Identifikasi kombinasi yang hilang/potensial
    const potentialCombos = this.identifyPotentialZodiacCombos(zodiacSigns);
    
    return {
      currentBonuses: comboBonuses,
      totalBonus,
      potentialCombos,
      compatibility: totalBonus > 0.3 ? 'high' : totalBonus > 0.15 ? 'medium' : 'low'
    };
  }

  /**
   * Mengidentifikasi kombinasi zodiak potensial yang belum terpenuhi
   * @param currentZodiacs Daftar zodiak saat ini
   * @returns Daftar kombinasi potensial
   * @private
   */
  private identifyPotentialZodiacCombos(currentZodiacs: string[]) {
    const potentialCombos = [];
    
    // Trine Api (Fire Trine): Aries, Leo, Sagittarius
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const missingFireSigns = fireSigns.filter(sign => !currentZodiacs.includes(sign));
    if (missingFireSigns.length > 0 && missingFireSigns.length < 3) {
      potentialCombos.push({
        combo: 'Trine Api',
        missingZodiacs: missingFireSigns,
        bonus: 'Meningkatkan kekuatan serangan sebesar 15%'
      });
    }
    
    // Trine Tanah (Earth Trine): Taurus, Virgo, Capricorn
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const missingEarthSigns = earthSigns.filter(sign => !currentZodiacs.includes(sign));
    if (missingEarthSigns.length > 0 && missingEarthSigns.length < 3) {
      potentialCombos.push({
        combo: 'Trine Tanah',
        missingZodiacs: missingEarthSigns,
        bonus: 'Meningkatkan produksi sumber daya sebesar 15%'
      });
    }
    
    // Trine Udara (Air Trine): Gemini, Libra, Aquarius
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const missingAirSigns = airSigns.filter(sign => !currentZodiacs.includes(sign));
    if (missingAirSigns.length > 0 && missingAirSigns.length < 3) {
      potentialCombos.push({
        combo: 'Trine Udara',
        missingZodiacs: missingAirSigns,
        bonus: 'Meningkatkan kecepatan riset dan diplomasi sebesar 15%'
      });
    }
    
    // Trine Air (Water Trine): Cancer, Scorpio, Pisces
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const missingWaterSigns = waterSigns.filter(sign => !currentZodiacs.includes(sign));
    if (missingWaterSigns.length > 0 && missingWaterSigns.length < 3) {
      potentialCombos.push({
        combo: 'Trine Air',
        missingZodiacs: missingWaterSigns,
        bonus: 'Meningkatkan pertahanan dan kemampuan mata-mata sebesar 15%'
      });
    }
    
    return potentialCombos;
  }
}