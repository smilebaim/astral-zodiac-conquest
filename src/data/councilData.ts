// Definisi data untuk sistem dewan (council) dan aliansi

export interface Council {
  id: string;
  name: string;
  description: string;
  level: number;
  experience: number;
  max_members: number;
  resources: {
    stardust: number;
    celestial_ore: number;
    ether: number;
  };
  perks: CouncilPerk[];
  territories: string[];
  founded_date: string;
  banner_image?: string;
  banner_color?: string;
  requirements?: {
    min_kingdom_level: number;
    zodiac_restriction?: string[];
  };
}

export interface CouncilMember {
  id: string;
  player_id: string;
  player_name: string;
  rank: CouncilRank;
  zodiac: string;
  kingdom_level: number;
  contribution: {
    resources: {
      stardust: number;
      celestial_ore: number;
      ether: number;
    };
    battles_won: number;
    territories_conquered: number;
  };
  join_date: string;
  last_active: string;
  permissions: CouncilPermission[];
}

export interface CouncilPerk {
  id: string;
  name: string;
  description: string;
  type: 'resource_boost' | 'combat_boost' | 'research_boost' | 'diplomatic' | 'special';
  effect: {
    target: string;
    value: number;
    duration?: number; // dalam detik, jika sementara
  };
  level_required: number;
  active: boolean;
  cooldown?: number; // dalam detik, jika ada cooldown
  last_activated?: string;
}

export interface CouncilTask {
  id: string;
  name: string;
  description: string;
  type: 'resource_collection' | 'combat' | 'exploration' | 'research' | 'special';
  requirements: {
    target: string;
    value: number;
  };
  rewards: {
    council_experience: number;
    resources?: {
      stardust?: number;
      celestial_ore?: number;
      ether?: number;
    };
    perk_points?: number;
  };
  deadline?: string;
  participants: string[]; // player_ids
  progress: number;
  completed: boolean;
}

export interface CouncilWar {
  id: string;
  attacker_council_id: string;
  defender_council_id: string;
  status: 'preparation' | 'active' | 'ended';
  start_date: string;
  end_date?: string;
  territory_at_stake?: string;
  battles: {
    id: string;
    attacker_player_id: string;
    defender_player_id: string;
    winner?: string;
    date: string;
  }[];
  war_score: {
    attacker: number;
    defender: number;
  };
  rewards: {
    winner_resources: {
      stardust: number;
      celestial_ore: number;
      ether: number;
    };
    territory?: string;
    special_perk?: string;
  };
}

export interface CouncilDiplomacy {
  id: string;
  council_id: string;
  target_council_id: string;
  type: 'alliance' | 'non_aggression' | 'trade' | 'war';
  status: 'proposed' | 'active' | 'rejected' | 'expired';
  terms: {
    duration?: number; // dalam detik
    resource_exchange?: {
      give: {
        resource_type: string;
        amount: number;
        frequency?: number; // dalam detik
      };
      receive: {
        resource_type: string;
        amount: number;
        frequency?: number; // dalam detik
      };
    };
    special_terms?: string;
  };
  proposed_date: string;
  active_date?: string;
  expiry_date?: string;
}

export type CouncilRank = 'member' | 'elder' | 'co_leader' | 'leader' | 'founder';

export type CouncilPermission = 
  'invite_members' | 
  'kick_members' | 
  'promote_members' | 
  'demote_members' | 
  'start_council_war' | 
  'negotiate_diplomacy' | 
  'access_treasury' | 
  'modify_perks' | 
  'assign_tasks' | 
  'change_settings';

// Perks dewan yang dapat dibuka
const councilPerks: CouncilPerk[] = [
  // Perks Tingkat 1
  {
    id: 'resource_efficiency',
    name: 'Efisiensi Sumber Daya',
    description: 'Meningkatkan produksi sumber daya semua anggota sebesar 5%.',
    type: 'resource_boost',
    effect: {
      target: 'resource_production',
      value: 5
    },
    level_required: 1,
    active: true
  },
  {
    id: 'shared_vision',
    name: 'Penglihatan Bersama',
    description: 'Anggota dewan dapat melihat wilayah yang telah dieksplorasi oleh anggota lain.',
    type: 'special',
    effect: {
      target: 'exploration_vision',
      value: 1
    },
    level_required: 1,
    active: true
  },
  
  // Perks Tingkat 2
  {
    id: 'council_market',
    name: 'Pasar Dewan',
    description: 'Membuka pasar khusus untuk perdagangan antar anggota dewan dengan biaya transaksi yang lebih rendah.',
    type: 'resource_boost',
    effect: {
      target: 'trade_fee_reduction',
      value: 30
    },
    level_required: 2,
    active: false
  },
  {
    id: 'united_defense',
    name: 'Pertahanan Bersatu',
    description: 'Meningkatkan pertahanan semua anggota sebesar 10% ketika diserang oleh non-anggota.',
    type: 'combat_boost',
    effect: {
      target: 'defense_boost',
      value: 10
    },
    level_required: 2,
    active: false
  },
  
  // Perks Tingkat 3
  {
    id: 'knowledge_sharing',
    name: 'Berbagi Pengetahuan',
    description: 'Mempercepat penelitian semua anggota sebesar 15%.',
    type: 'research_boost',
    effect: {
      target: 'research_speed',
      value: 15
    },
    level_required: 3,
    active: false
  },
  {
    id: 'council_treasury',
    name: 'Perbendaharaan Dewan',
    description: 'Memungkinkan penyimpanan sumber daya bersama dengan kapasitas yang lebih besar.',
    type: 'resource_boost',
    effect: {
      target: 'shared_storage_capacity',
      value: 5000
    },
    level_required: 3,
    active: false
  },
  
  // Perks Tingkat 4
  {
    id: 'coordinated_attack',
    name: 'Serangan Terkoordinasi',
    description: 'Memungkinkan serangan terkoordinasi di mana beberapa anggota dapat menyerang target yang sama dengan bonus serangan.',
    type: 'combat_boost',
    effect: {
      target: 'coordinated_attack_bonus',
      value: 20
    },
    level_required: 4,
    active: false
  },
  {
    id: 'diplomatic_immunity',
    name: 'Kekebalan Diplomatik',
    description: 'Memberikan perlindungan diplomatik terhadap serangan selama 24 jam setelah diaktifkan.',
    type: 'diplomatic',
    effect: {
      target: 'attack_immunity',
      value: 1,
      duration: 86400 // 24 jam dalam detik
    },
    level_required: 4,
    active: false,
    cooldown: 604800 // 7 hari dalam detik
  },
  
  // Perks Tingkat 5
  {
    id: 'council_reinforcement',
    name: 'Bantuan Dewan',
    description: 'Memungkinkan anggota untuk mengirim unit bantuan ke anggota lain yang diserang.',
    type: 'combat_boost',
    effect: {
      target: 'reinforcement_capability',
      value: 1
    },
    level_required: 5,
    active: false
  },
  {
    id: 'zodiac_synergy',
    name: 'Sinergi Zodiak',
    description: 'Memberikan bonus khusus berdasarkan kombinasi zodiak dalam dewan.',
    type: 'special',
    effect: {
      target: 'zodiac_synergy_bonus',
      value: 1
    },
    level_required: 5,
    active: false
  },
  
  // Perks Tingkat 6
  {
    id: 'council_monument',
    name: 'Monumen Dewan',
    description: 'Membangun monumen dewan yang memberikan bonus pasif ke semua anggota.',
    type: 'special',
    effect: {
      target: 'passive_bonus',
      value: 10
    },
    level_required: 6,
    active: false
  },
  {
    id: 'cosmic_influence',
    name: 'Pengaruh Kosmik',
    description: 'Meningkatkan pengaruh dewan di galaksi, memberikan bonus diplomatik dan ekonomi.',
    type: 'diplomatic',
    effect: {
      target: 'diplomatic_influence',
      value: 25
    },
    level_required: 6,
    active: false
  },
  
  // Perks Tingkat 7
  {
    id: 'council_portal',
    name: 'Portal Dewan',
    description: 'Membangun portal yang memungkinkan pergerakan cepat unit antar wilayah anggota dewan.',
    type: 'special',
    effect: {
      target: 'fast_travel',
      value: 1
    },
    level_required: 7,
    active: false
  },
  {
    id: 'cosmic_blessing',
    name: 'Berkah Kosmik',
    description: 'Memberikan bonus acak yang kuat ke semua anggota dewan selama 48 jam.',
    type: 'special',
    effect: {
      target: 'random_powerful_bonus',
      value: 1,
      duration: 172800 // 48 jam dalam detik
    },
    level_required: 7,
    active: false,
    cooldown: 1209600 // 14 hari dalam detik
  },
  
  // Perks Tingkat 8
  {
    id: 'council_flagship',
    name: 'Kapal Induk Dewan',
    description: 'Membangun kapal induk dewan yang dapat digunakan dalam pertempuran besar.',
    type: 'combat_boost',
    effect: {
      target: 'flagship_support',
      value: 1
    },
    level_required: 8,
    active: false
  },
  {
    id: 'cosmic_dominance',
    name: 'Dominasi Kosmik',
    description: 'Meningkatkan semua statistik tempur anggota dewan sebesar 20% saat berperang.',
    type: 'combat_boost',
    effect: {
      target: 'war_stats_boost',
      value: 20
    },
    level_required: 8,
    active: false
  },
  
  // Perks Tingkat 9
  {
    id: 'council_citadel',
    name: 'Benteng Dewan',
    description: 'Membangun benteng dewan yang memberikan perlindungan tambahan dan bonus produksi untuk semua anggota.',
    type: 'special',
    effect: {
      target: 'citadel_bonus',
      value: 1
    },
    level_required: 9,
    active: false
  },
  {
    id: 'cosmic_unity',
    name: 'Persatuan Kosmik',
    description: 'Menyatukan kekuatan zodiak semua anggota, memberikan bonus unik berdasarkan komposisi dewan.',
    type: 'special',
    effect: {
      target: 'zodiac_unity',
      value: 1
    },
    level_required: 9,
    active: false
  },
  
  // Perks Tingkat 10
  {
    id: 'council_ascension',
    name: 'Kebangkitan Dewan',
    description: 'Membuka kemampuan untuk meningkatkan dewan ke tingkat legendaris, membuka perks yang lebih kuat.',
    type: 'special',
    effect: {
      target: 'council_ascension',
      value: 1
    },
    level_required: 10,
    active: false
  },
  {
    id: 'cosmic_legacy',
    name: 'Warisan Kosmik',
    description: 'Menciptakan warisan abadi untuk dewan, memberikan bonus permanen yang meningkat seiring waktu.',
    type: 'special',
    effect: {
      target: 'legacy_bonus',
      value: 1
    },
    level_required: 10,
    active: false
  }
];

// Tugas dewan yang dapat diselesaikan oleh anggota
const councilTasks: CouncilTask[] = [
  // Tugas Pengumpulan Sumber Daya
  {
    id: 'resource_stockpile',
    name: 'Penimbunan Sumber Daya',
    description: 'Kumpulkan sumber daya untuk perbendaharaan dewan.',
    type: 'resource_collection',
    requirements: {
      target: 'total_resources',
      value: 5000
    },
    rewards: {
      council_experience: 500,
      perk_points: 1
    },
    participants: [],
    progress: 0,
    completed: false
  },
  {
    id: 'ether_collection',
    name: 'Pengumpulan Ether',
    description: 'Kumpulkan ether untuk penelitian dewan.',
    type: 'resource_collection',
    requirements: {
      target: 'ether',
      value: 1000
    },
    rewards: {
      council_experience: 800,
      resources: {
        stardust: 500,
        celestial_ore: 300
      },
      perk_points: 2
    },
    participants: [],
    progress: 0,
    completed: false
  },
  
  // Tugas Pertempuran
  {
    id: 'council_defense',
    name: 'Pertahanan Dewan',
    description: 'Pertahankan wilayah dewan dari serangan.',
    type: 'combat',
    requirements: {
      target: 'defensive_victories',
      value: 10
    },
    rewards: {
      council_experience: 1000,
      resources: {
        stardust: 800,
        celestial_ore: 400,
        ether: 200
      },
      perk_points: 3
    },
    participants: [],
    progress: 0,
    completed: false
  },
  {
    id: 'territory_conquest',
    name: 'Penaklukan Wilayah',
    description: 'Taklukkan wilayah baru untuk dewan.',
    type: 'combat',
    requirements: {
      target: 'territories_conquered',
      value: 3
    },
    rewards: {
      council_experience: 1500,
      resources: {
        stardust: 1200,
        celestial_ore: 600,
        ether: 300
      },
      perk_points: 5
    },
    participants: [],
    progress: 0,
    completed: false
  },
  
  // Tugas Eksplorasi
  {
    id: 'cosmic_exploration',
    name: 'Eksplorasi Kosmik',
    description: 'Jelajahi wilayah baru untuk memperluas pengetahuan dewan.',
    type: 'exploration',
    requirements: {
      target: 'regions_explored',
      value: 15
    },
    rewards: {
      council_experience: 700,
      resources: {
        stardust: 600,
        celestial_ore: 300,
        ether: 150
      },
      perk_points: 2
    },
    participants: [],
    progress: 0,
    completed: false
  },
  {
    id: 'cosmic_anomaly',
    name: 'Anomali Kosmik',
    description: 'Selidiki anomali kosmik yang misterius.',
    type: 'exploration',
    requirements: {
      target: 'anomalies_investigated',
      value: 5
    },
    rewards: {
      council_experience: 1200,
      resources: {
        stardust: 1000,
        celestial_ore: 500,
        ether: 250
      },
      perk_points: 4
    },
    participants: [],
    progress: 0,
    completed: false
  },
  
  // Tugas Penelitian
  {
    id: 'council_research',
    name: 'Penelitian Dewan',
    description: 'Selesaikan penelitian untuk kemajuan teknologi dewan.',
    type: 'research',
    requirements: {
      target: 'research_completed',
      value: 5
    },
    rewards: {
      council_experience: 900,
      resources: {
        stardust: 700,
        celestial_ore: 350,
        ether: 200
      },
      perk_points: 3
    },
    participants: [],
    progress: 0,
    completed: false
  },
  {
    id: 'advanced_technology',
    name: 'Teknologi Lanjutan',
    description: 'Kembangkan teknologi lanjutan untuk dewan.',
    type: 'research',
    requirements: {
      target: 'advanced_research_completed',
      value: 2
    },
    rewards: {
      council_experience: 1800,
      resources: {
        stardust: 1500,
        celestial_ore: 800,
        ether: 400
      },
      perk_points: 6
    },
    participants: [],
    progress: 0,
    completed: false
  },
  
  // Tugas Khusus
  {
    id: 'zodiac_alignment',
    name: 'Penyelarasan Zodiak',
    description: 'Selaraskan kekuatan zodiak anggota dewan untuk ritual khusus.',
    type: 'special',
    requirements: {
      target: 'zodiac_alignment_ritual',
      value: 1
    },
    rewards: {
      council_experience: 2000,
      resources: {
        stardust: 2000,
        celestial_ore: 1000,
        ether: 500
      },
      perk_points: 8
    },
    participants: [],
    progress: 0,
    completed: false
  },
  {
    id: 'cosmic_event',
    name: 'Peristiwa Kosmik',
    description: 'Berpartisipasi dalam peristiwa kosmik langka.',
    type: 'special',
    requirements: {
      target: 'cosmic_event_participation',
      value: 1
    },
    rewards: {
      council_experience: 2500,
      resources: {
        stardust: 3000,
        celestial_ore: 1500,
        ether: 800
      },
      perk_points: 10
    },
    deadline: '', // Diatur saat peristiwa kosmik muncul
    participants: [],
    progress: 0,
    completed: false
  }
];

export { councilPerks, councilTasks };