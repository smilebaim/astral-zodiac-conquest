// Definisi data progres pemain, pencapaian, dan misi

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'combat' | 'economy' | 'alliance' | 'special';
  requirements: {
    type: 'regions_discovered' | 'battles_won' | 'resources_collected' | 'research_completed' | 'council_rank' | 'custom';
    value: number;
    custom_check?: string;
  };
  rewards: {
    type: 'resource' | 'unit' | 'technology' | 'special_ability' | 'cosmetic' | 'experience';
    value: number;
    target: string;
  }[];
  secret?: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'side' | 'daily' | 'weekly' | 'event';
  steps: {
    id: string;
    description: string;
    objective: {
      type: 'collect_resource' | 'win_battles' | 'build_structure' | 'research_technology' | 'train_units' | 'explore_regions' | 'join_council' | 'custom';
      target?: string;
      value: number;
      custom_check?: string;
    };
  }[];
  rewards: {
    type: 'resource' | 'unit' | 'technology' | 'special_ability' | 'cosmetic' | 'experience';
    value: number;
    target: string;
  }[];
  time_limit?: number; // dalam detik, hanya untuk misi dengan batas waktu
  prerequisite_quests?: string[];
  zodiac_specific?: string; // nama zodiak jika misi khusus untuk zodiak tertentu
  level_requirement?: number;
}

export interface LevelThreshold {
  level: number;
  experience_required: number;
  rewards: {
    type: 'resource' | 'unit' | 'technology' | 'special_ability' | 'cosmetic' | 'building_slot' | 'unit_capacity';
    value: number;
    target?: string;
  }[];
}

// Pencapaian dasar yang tersedia untuk semua pemain
const achievements: Achievement[] = [
  // Pencapaian Eksplorasi
  {
    id: 'first_steps',
    name: 'Langkah Pertama',
    description: 'Temukan wilayah pertama Anda di peta galaksi.',
    icon: '🌟',
    category: 'exploration',
    requirements: {
      type: 'regions_discovered',
      value: 1
    },
    rewards: [
      {
        type: 'resource',
        value: 100,
        target: 'stardust'
      },
      {
        type: 'experience',
        value: 50,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'cosmic_explorer',
    name: 'Penjelajah Kosmik',
    description: 'Temukan 10 wilayah di peta galaksi.',
    icon: '🔭',
    category: 'exploration',
    requirements: {
      type: 'regions_discovered',
      value: 10
    },
    rewards: [
      {
        type: 'resource',
        value: 500,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 200,
        target: 'celestial_ore'
      },
      {
        type: 'experience',
        value: 200,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'galactic_cartographer',
    name: 'Kartografer Galaksi',
    description: 'Temukan 50 wilayah di peta galaksi.',
    icon: '🌌',
    category: 'exploration',
    requirements: {
      type: 'regions_discovered',
      value: 50
    },
    rewards: [
      {
        type: 'resource',
        value: 2000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 1000,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 500,
        target: 'ether'
      },
      {
        type: 'experience',
        value: 1000,
        target: 'player_xp'
      }
    ]
  },
  
  // Pencapaian Pertempuran
  {
    id: 'first_victory',
    name: 'Kemenangan Pertama',
    description: 'Menangkan pertempuran pertama Anda.',
    icon: '⚔️',
    category: 'combat',
    requirements: {
      type: 'battles_won',
      value: 1
    },
    rewards: [
      {
        type: 'resource',
        value: 150,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 50,
        target: 'celestial_ore'
      },
      {
        type: 'experience',
        value: 100,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'battle_hardened',
    name: 'Terlatih Pertempuran',
    description: 'Menangkan 10 pertempuran.',
    icon: '🛡️',
    category: 'combat',
    requirements: {
      type: 'battles_won',
      value: 10
    },
    rewards: [
      {
        type: 'resource',
        value: 800,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 400,
        target: 'celestial_ore'
      },
      {
        type: 'unit',
        value: 5,
        target: 'star_warrior'
      },
      {
        type: 'experience',
        value: 300,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'cosmic_conqueror',
    name: 'Penakluk Kosmik',
    description: 'Menangkan 50 pertempuran.',
    icon: '👑',
    category: 'combat',
    requirements: {
      type: 'battles_won',
      value: 50
    },
    rewards: [
      {
        type: 'resource',
        value: 3000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 1500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 800,
        target: 'ether'
      },
      {
        type: 'special_ability',
        value: 1,
        target: 'tactical_mastery'
      },
      {
        type: 'experience',
        value: 1500,
        target: 'player_xp'
      }
    ]
  },
  
  // Pencapaian Ekonomi
  {
    id: 'resource_collector',
    name: 'Pengumpul Sumber Daya',
    description: 'Kumpulkan total 1.000 sumber daya dari semua jenis.',
    icon: '💎',
    category: 'economy',
    requirements: {
      type: 'resources_collected',
      value: 1000
    },
    rewards: [
      {
        type: 'resource',
        value: 200,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 100,
        target: 'celestial_ore'
      },
      {
        type: 'experience',
        value: 100,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'cosmic_entrepreneur',
    name: 'Pengusaha Kosmik',
    description: 'Kumpulkan total 10.000 sumber daya dari semua jenis.',
    icon: '📈',
    category: 'economy',
    requirements: {
      type: 'resources_collected',
      value: 10000
    },
    rewards: [
      {
        type: 'resource',
        value: 1000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 200,
        target: 'ether'
      },
      {
        type: 'technology',
        value: 1,
        target: 'efficient_harvesting'
      },
      {
        type: 'experience',
        value: 500,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'galactic_tycoon',
    name: 'Taipan Galaksi',
    description: 'Kumpulkan total 100.000 sumber daya dari semua jenis.',
    icon: '🏆',
    category: 'economy',
    requirements: {
      type: 'resources_collected',
      value: 100000
    },
    rewards: [
      {
        type: 'resource',
        value: 5000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 2500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 1000,
        target: 'ether'
      },
      {
        type: 'technology',
        value: 1,
        target: 'resource_mastery'
      },
      {
        type: 'experience',
        value: 2000,
        target: 'player_xp'
      }
    ]
  },
  
  // Pencapaian Aliansi
  {
    id: 'council_member',
    name: 'Anggota Dewan',
    description: 'Bergabung dengan dewan aliansi.',
    icon: '🤝',
    category: 'alliance',
    requirements: {
      type: 'council_rank',
      value: 1
    },
    rewards: [
      {
        type: 'resource',
        value: 300,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 150,
        target: 'celestial_ore'
      },
      {
        type: 'experience',
        value: 200,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'council_elder',
    name: 'Tetua Dewan',
    description: 'Mencapai peringkat tetua dalam dewan aliansi.',
    icon: '📜',
    category: 'alliance',
    requirements: {
      type: 'council_rank',
      value: 3
    },
    rewards: [
      {
        type: 'resource',
        value: 1000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 200,
        target: 'ether'
      },
      {
        type: 'experience',
        value: 500,
        target: 'player_xp'
      }
    ]
  },
  {
    id: 'council_leader',
    name: 'Pemimpin Dewan',
    description: 'Menjadi pemimpin dewan aliansi.',
    icon: '👑',
    category: 'alliance',
    requirements: {
      type: 'council_rank',
      value: 5
    },
    rewards: [
      {
        type: 'resource',
        value: 3000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 1500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 800,
        target: 'ether'
      },
      {
        type: 'special_ability',
        value: 1,
        target: 'diplomatic_influence'
      },
      {
        type: 'experience',
        value: 2000,
        target: 'player_xp'
      }
    ]
  }
];

// Misi utama yang tersedia untuk semua pemain
const quests: Quest[] = [
  // Misi Tutorial
  {
    id: 'welcome_to_cosmos',
    name: 'Selamat Datang di Kosmos',
    description: 'Mulai perjalanan kosmik Anda dengan mempelajari dasar-dasar permainan.',
    category: 'main',
    steps: [
      {
        id: 'choose_zodiac',
        description: 'Pilih zodiak Anda',
        objective: {
          type: 'custom',
          value: 1,
          custom_check: 'zodiac_selected'
        }
      },
      {
        id: 'collect_initial_resources',
        description: 'Kumpulkan 100 stardust',
        objective: {
          type: 'collect_resource',
          target: 'stardust',
          value: 100
        }
      },
      {
        id: 'build_first_structure',
        description: 'Bangun pengumpul stardust dasar',
        objective: {
          type: 'build_structure',
          target: 'stardust_collector_1',
          value: 1
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 200,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 100,
        target: 'celestial_ore'
      },
      {
        type: 'experience',
        value: 150,
        target: 'player_xp'
      }
    ],
    level_requirement: 1
  },
  
  // Misi Ekonomi Awal
  {
    id: 'resource_foundation',
    name: 'Fondasi Sumber Daya',
    description: 'Bangun fondasi ekonomi untuk kerajaan Anda.',
    category: 'main',
    steps: [
      {
        id: 'build_ore_extractor',
        description: 'Bangun ekstraktor bijih dasar',
        objective: {
          type: 'build_structure',
          target: 'ore_extractor_1',
          value: 1
        }
      },
      {
        id: 'collect_celestial_ore',
        description: 'Kumpulkan 200 celestial ore',
        objective: {
          type: 'collect_resource',
          target: 'celestial_ore',
          value: 200
        }
      },
      {
        id: 'upgrade_stardust_collector',
        description: 'Tingkatkan pengumpul stardust ke level 2',
        objective: {
          type: 'build_structure',
          target: 'stardust_collector_2',
          value: 1
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 300,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 150,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 50,
        target: 'ether'
      },
      {
        type: 'experience',
        value: 250,
        target: 'player_xp'
      }
    ],
    prerequisite_quests: ['welcome_to_cosmos'],
    level_requirement: 2
  },
  
  // Misi Pertempuran Awal
  {
    id: 'first_defense',
    name: 'Pertahanan Pertama',
    description: 'Siapkan pertahanan kerajaan Anda dan hadapi serangan pertama.',
    category: 'main',
    steps: [
      {
        id: 'train_warriors',
        description: 'Latih 5 Prajurit Bintang',
        objective: {
          type: 'train_units',
          target: 'star_warrior',
          value: 5
        }
      },
      {
        id: 'train_archers',
        description: 'Latih 3 Pemanah Celestial',
        objective: {
          type: 'train_units',
          target: 'celestial_archer',
          value: 3
        }
      },
      {
        id: 'win_first_battle',
        description: 'Menangkan pertempuran pertama Anda',
        objective: {
          type: 'win_battles',
          value: 1
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 400,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 200,
        target: 'celestial_ore'
      },
      {
        type: 'unit',
        value: 2,
        target: 'celestial_archer'
      },
      {
        type: 'experience',
        value: 300,
        target: 'player_xp'
      }
    ],
    prerequisite_quests: ['resource_foundation'],
    level_requirement: 3
  },
  
  // Misi Eksplorasi
  {
    id: 'cosmic_exploration',
    name: 'Eksplorasi Kosmik',
    description: 'Jelajahi galaksi dan temukan wilayah baru.',
    category: 'main',
    steps: [
      {
        id: 'explore_regions',
        description: 'Temukan 5 wilayah baru',
        objective: {
          type: 'explore_regions',
          value: 5
        }
      },
      {
        id: 'collect_exploration_data',
        description: 'Kumpulkan data eksplorasi dari wilayah baru',
        objective: {
          type: 'collect_resource',
          target: 'exploration_data',
          value: 100
        }
      },
      {
        id: 'establish_outpost',
        description: 'Bangun pos terdepan di wilayah baru',
        objective: {
          type: 'build_structure',
          target: 'outpost',
          value: 1
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 500,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 250,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 100,
        target: 'ether'
      },
      {
        type: 'technology',
        value: 1,
        target: 'advanced_navigation'
      },
      {
        type: 'experience',
        value: 400,
        target: 'player_xp'
      }
    ],
    prerequisite_quests: ['first_defense'],
    level_requirement: 4
  },
  
  // Misi Aliansi
  {
    id: 'cosmic_diplomacy',
    name: 'Diplomasi Kosmik',
    description: 'Mulai hubungan diplomatik dengan membentuk atau bergabung dengan dewan aliansi.',
    category: 'main',
    steps: [
      {
        id: 'join_council',
        description: 'Bergabung atau bentuk dewan aliansi',
        objective: {
          type: 'join_council',
          value: 1
        }
      },
      {
        id: 'contribute_resources',
        description: 'Sumbangkan sumber daya ke dewan',
        objective: {
          type: 'custom',
          value: 500,
          custom_check: 'council_contribution'
        }
      },
      {
        id: 'complete_council_task',
        description: 'Selesaikan tugas dewan',
        objective: {
          type: 'custom',
          value: 1,
          custom_check: 'council_task_completed'
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 800,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 400,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 200,
        target: 'ether'
      },
      {
        type: 'special_ability',
        value: 1,
        target: 'council_influence'
      },
      {
        type: 'experience',
        value: 600,
        target: 'player_xp'
      }
    ],
    prerequisite_quests: ['cosmic_exploration'],
    level_requirement: 5
  },
  
  // Misi Harian
  {
    id: 'daily_resource_collection',
    name: 'Pengumpulan Harian',
    description: 'Kumpulkan sumber daya harian untuk kerajaan Anda.',
    category: 'daily',
    steps: [
      {
        id: 'collect_daily_stardust',
        description: 'Kumpulkan 500 stardust',
        objective: {
          type: 'collect_resource',
          target: 'stardust',
          value: 500
        }
      },
      {
        id: 'collect_daily_ore',
        description: 'Kumpulkan 250 celestial ore',
        objective: {
          type: 'collect_resource',
          target: 'celestial_ore',
          value: 250
        }
      },
      {
        id: 'collect_daily_ether',
        description: 'Kumpulkan 100 ether',
        objective: {
          type: 'collect_resource',
          target: 'ether',
          value: 100
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 200,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 100,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 50,
        target: 'ether'
      },
      {
        type: 'experience',
        value: 100,
        target: 'player_xp'
      }
    ],
    time_limit: 86400 // 24 jam dalam detik
  },
  
  // Misi Mingguan
  {
    id: 'weekly_conquest',
    name: 'Penaklukan Mingguan',
    description: 'Tunjukkan dominasi Anda di medan perang minggu ini.',
    category: 'weekly',
    steps: [
      {
        id: 'win_weekly_battles',
        description: 'Menangkan 10 pertempuran',
        objective: {
          type: 'win_battles',
          value: 10
        }
      },
      {
        id: 'train_weekly_units',
        description: 'Latih 20 unit',
        objective: {
          type: 'train_units',
          target: 'any',
          value: 20
        }
      },
      {
        id: 'conquer_region',
        description: 'Taklukkan wilayah baru',
        objective: {
          type: 'custom',
          value: 1,
          custom_check: 'region_conquered'
        }
      }
    ],
    rewards: [
      {
        type: 'resource',
        value: 1000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 250,
        target: 'ether'
      },
      {
        type: 'unit',
        value: 5,
        target: 'star_warrior'
      },
      {
        type: 'experience',
        value: 500,
        target: 'player_xp'
      }
    ],
    time_limit: 604800 // 7 hari dalam detik
  }
];

// Ambang batas level dan hadiah
const levelThresholds: LevelThreshold[] = [
  {
    level: 1,
    experience_required: 0,
    rewards: []
  },
  {
    level: 2,
    experience_required: 500,
    rewards: [
      {
        type: 'resource',
        value: 200,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 100,
        target: 'celestial_ore'
      },
      {
        type: 'building_slot',
        value: 1
      }
    ]
  },
  {
    level: 3,
    experience_required: 1200,
    rewards: [
      {
        type: 'resource',
        value: 400,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 200,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 50,
        target: 'ether'
      },
      {
        type: 'unit_capacity',
        value: 5
      }
    ]
  },
  {
    level: 4,
    experience_required: 2500,
    rewards: [
      {
        type: 'resource',
        value: 600,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 300,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 100,
        target: 'ether'
      },
      {
        type: 'building_slot',
        value: 1
      },
      {
        type: 'technology',
        value: 1,
        target: 'basic_research'
      }
    ]
  },
  {
    level: 5,
    experience_required: 5000,
    rewards: [
      {
        type: 'resource',
        value: 1000,
        target: 'stardust'
      },
      {
        type: 'resource',
        value: 500,
        target: 'celestial_ore'
      },
      {
        type: 'resource',
        value: 200,
        target: 'ether'
      },
      {
        type: 'unit_capacity',
        value: 10
      },
      {