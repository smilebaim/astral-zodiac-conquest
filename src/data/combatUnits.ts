// Definisi unit tempur untuk sistem pertempuran

export interface CombatUnit {
  id: string;
  name: string;
  description: string;
  type: 'infantry' | 'cavalry' | 'artillery' | 'naval' | 'air' | 'special';
  tier: 1 | 2 | 3 | 4 | 5;
  stats: {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    range: number;
  };
  cost: {
    stardust: number;
    celestial_ore: number;
    ether: number;
    training_time: number; // dalam detik
  };
  abilities: {
    name: string;
    description: string;
    effect: string;
    cooldown?: number; // dalam detik
    passive?: boolean;
  }[];
  requirements: {
    kingdom_level: number;
    research?: string;
    building?: string;
    zodiac_element?: 'Fire' | 'Earth' | 'Air' | 'Water';
    zodiac_bonus?: string; // nama zodiak yang mendapat bonus
  };
  counters: {
    strong_against: string[];
    weak_against: string[];
  };
  image: string;
}

export interface ZodiacUnitBonus {
  zodiac: string;
  unit_id: string;
  bonus: {
    stat: string;
    value: number;
    description: string;
  };
}

const combatUnits: CombatUnit[] = [
  // Unit Dasar - Tersedia untuk semua zodiak
  {
    id: 'cosmic_scout',
    name: 'Pengintai Kosmik',
    description: 'Unit pengintai cepat yang mengeksplorasi wilayah musuh.',
    type: 'infantry',
    tier: 1,
    stats: {
      attack: 3,
      defense: 2,
      health: 10,
      speed: 8,
      range: 1
    },
    cost: {
      stardust: 50,
      celestial_ore: 20,
      ether: 0,
      training_time: 30
    },
    abilities: [
      {
        name: 'Pengintaian',
        description: 'Meningkatkan jangkauan penglihatan.',
        effect: 'vision_range_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 1
    },
    counters: {
      strong_against: ['artillery'],
      weak_against: ['cavalry']
    },
    image: '/units/cosmic_scout.svg'
  },
  {
    id: 'star_warrior',
    name: 'Prajurit Bintang',
    description: 'Prajurit dasar yang terlatih dalam pertempuran jarak dekat.',
    type: 'infantry',
    tier: 1,
    stats: {
      attack: 5,
      defense: 5,
      health: 20,
      speed: 5,
      range: 1
    },
    cost: {
      stardust: 100,
      celestial_ore: 50,
      ether: 0,
      training_time: 60
    },
    abilities: [
      {
        name: 'Formasi Perisai',
        description: 'Meningkatkan pertahanan saat bertempur dalam kelompok.',
        effect: 'group_defense_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 1
    },
    counters: {
      strong_against: ['artillery'],
      weak_against: ['cavalry']
    },
    image: '/units/star_warrior.svg'
  },
  {
    id: 'celestial_archer',
    name: 'Pemanah Celestial',
    description: 'Unit jarak jauh yang menyerang dari kejauhan.',
    type: 'artillery',
    tier: 1,
    stats: {
      attack: 7,
      defense: 2,
      health: 15,
      speed: 4,
      range: 4
    },
    cost: {
      stardust: 120,
      celestial_ore: 60,
      ether: 10,
      training_time: 90
    },
    abilities: [
      {
        name: 'Bidikan Tepat',
        description: 'Meningkatkan keakuratan serangan jarak jauh.',
        effect: 'accuracy_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 2
    },
    counters: {
      strong_against: ['infantry'],
      weak_against: ['cavalry', 'air']
    },
    image: '/units/celestial_archer.svg'
  },
  
  // Unit Khusus Zodiak - Fire Element (Aries, Leo, Sagittarius)
  {
    id: 'aries_ram_charger',
    name: 'Pendobrak Domba',
    description: 'Unit serangan cepat yang menghancurkan pertahanan musuh.',
    type: 'cavalry',
    tier: 2,
    stats: {
      attack: 12,
      defense: 4,
      health: 25,
      speed: 7,
      range: 1
    },
    cost: {
      stardust: 200,
      celestial_ore: 100,
      ether: 30,
      training_time: 120
    },
    abilities: [
      {
        name: 'Serangan Domba',
        description: 'Serangan beruntun yang meningkatkan kerusakan dengan setiap serangan berturut-turut.',
        effect: 'consecutive_damage_boost',
        cooldown: 30
      },
      {
        name: 'Kecepatan Api',
        description: 'Meningkatkan kecepatan gerakan dan serangan.',
        effect: 'speed_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 3,
      zodiac_element: 'Fire',
      zodiac_bonus: 'Aries'
    },
    counters: {
      strong_against: ['infantry', 'artillery'],
      weak_against: ['air', 'special']
    },
    image: '/units/aries_ram_charger.svg'
  },
  {
    id: 'leo_royal_guardian',
    name: 'Penjaga Kerajaan',
    description: 'Unit pertahanan elit yang menginspirasi unit sekitarnya.',
    type: 'infantry',
    tier: 3,
    stats: {
      attack: 10,
      defense: 15,
      health: 40,
      speed: 4,
      range: 1
    },
    cost: {
      stardust: 300,
      celestial_ore: 150,
      ether: 50,
      training_time: 180
    },
    abilities: [
      {
        name: 'Aura Kerajaan',
        description: 'Meningkatkan serangan dan pertahanan unit sekutu di sekitarnya.',
        effect: 'aura_boost',
        passive: true
      },
      {
        name: 'Raungan Singa',
        description: 'Menakuti musuh, mengurangi serangan mereka untuk sementara.',
        effect: 'enemy_attack_reduction',
        cooldown: 60
      }
    ],
    requirements: {
      kingdom_level: 5,
      zodiac_element: 'Fire',
      zodiac_bonus: 'Leo'
    },
    counters: {
      strong_against: ['cavalry', 'infantry'],
      weak_against: ['artillery', 'air']
    },
    image: '/units/leo_royal_guardian.svg'
  },
  {
    id: 'sagittarius_cosmic_archer',
    name: 'Pemanah Kosmik',
    description: 'Pemanah elit dengan jangkauan serangan yang sangat jauh.',
    type: 'artillery',
    tier: 3,
    stats: {
      attack: 15,
      defense: 5,
      health: 20,
      speed: 5,
      range: 6
    },
    cost: {
      stardust: 250,
      celestial_ore: 120,
      ether: 80,
      training_time: 150
    },
    abilities: [
      {
        name: 'Panah Api',
        description: 'Serangan jarak jauh yang menyebabkan kerusakan api berkelanjutan.',
        effect: 'fire_damage_over_time',
        cooldown: 45
      },
      {
        name: 'Bidikan Sempurna',
        description: 'Meningkatkan jangkauan serangan dan keakuratan.',
        effect: 'range_accuracy_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 4,
      zodiac_element: 'Fire',
      zodiac_bonus: 'Sagittarius'
    },
    counters: {
      strong_against: ['infantry', 'cavalry'],
      weak_against: ['air', 'artillery']
    },
    image: '/units/sagittarius_cosmic_archer.svg'
  },
  
  // Unit Khusus Zodiak - Earth Element (Taurus, Virgo, Capricorn)
  {
    id: 'taurus_earth_crusher',
    name: 'Penghancur Bumi',
    description: 'Unit tangguh yang menghancurkan pertahanan musuh.',
    type: 'infantry',
    tier: 3,
    stats: {
      attack: 14,
      defense: 12,
      health: 45,
      speed: 3,
      range: 1
    },
    cost: {
      stardust: 280,
      celestial_ore: 180,
      ether: 40,
      training_time: 210
    },
    abilities: [
      {
        name: 'Hantaman Banteng',
        description: 'Serangan kuat yang dapat merusak beberapa unit sekaligus.',
        effect: 'area_damage',
        cooldown: 40
      },
      {
        name: 'Kulit Batu',
        description: 'Meningkatkan pertahanan secara pasif.',
        effect: 'defense_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 4,
      zodiac_element: 'Earth',
      zodiac_bonus: 'Taurus'
    },
    counters: {
      strong_against: ['cavalry', 'infantry'],
      weak_against: ['artillery', 'air']
    },
    image: '/units/taurus_earth_crusher.svg'
  },
  {
    id: 'virgo_tactical_commander',
    name: 'Komandan Taktis',
    description: 'Unit pendukung yang meningkatkan efisiensi pasukan.',
    type: 'special',
    tier: 3,
    stats: {
      attack: 6,
      defense: 8,
      health: 30,
      speed: 5,
      range: 2
    },
    cost: {
      stardust: 300,
      celestial_ore: 150,
      ether: 100,
      training_time: 240
    },
    abilities: [
      {
        name: 'Analisis Medan',
        description: 'Menganalisis medan pertempuran, memberikan bonus serangan untuk semua unit.',
        effect: 'battlefield_analysis',
        cooldown: 60
      },
      {
        name: 'Efisiensi Sempurna',
        description: 'Mengurangi konsumsi sumber daya unit di sekitarnya.',
        effect: 'resource_efficiency',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 5,
      zodiac_element: 'Earth',
      zodiac_bonus: 'Virgo'
    },
    counters: {
      strong_against: ['special', 'artillery'],
      weak_against: ['cavalry', 'air']
    },
    image: '/units/virgo_tactical_commander.svg'
  },
  {
    id: 'capricorn_mountain_sentinel',
    name: 'Penjaga Gunung',
    description: 'Unit pertahanan yang sangat tangguh dengan kemampuan bertahan luar biasa.',
    type: 'infantry',
    tier: 4,
    stats: {
      attack: 8,
      defense: 20,
      health: 60,
      speed: 2,
      range: 1
    },
    cost: {
      stardust: 350,
      celestial_ore: 250,
      ether: 80,
      training_time: 300
    },
    abilities: [
      {
        name: 'Benteng Hidup',
        description: 'Dapat bertindak sebagai dinding pertahanan, melindungi unit di belakangnya.',
        effect: 'living_wall',
        cooldown: 90
      },
      {
        name: 'Ketahanan Gunung',
        description: 'Secara pasif mengurangi kerusakan yang diterima.',
        effect: 'damage_reduction',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 6,
      zodiac_element: 'Earth',
      zodiac_bonus: 'Capricorn'
    },
    counters: {
      strong_against: ['infantry', 'cavalry'],
      weak_against: ['artillery', 'air']
    },
    image: '/units/capricorn_mountain_sentinel.svg'
  },
  
  // Unit Khusus Zodiak - Air Element (Gemini, Libra, Aquarius)
  {
    id: 'gemini_twin_striker',
    name: 'Penyerang Kembar',
    description: 'Unit unik yang bertempur sebagai pasangan, memberikan dua serangan sekaligus.',
    type: 'infantry',
    tier: 3,
    stats: {
      attack: 16,
      defense: 7,
      health: 30,
      speed: 6,
      range: 1
    },
    cost: {
      stardust: 280,
      celestial_ore: 140,
      ether: 70,
      training_time: 180
    },
    abilities: [
      {
        name: 'Serangan Ganda',
        description: 'Menyerang dua kali dalam satu giliran.',
        effect: 'double_attack',
        cooldown: 30
      },
      {
        name: 'Adaptasi Cepat',
        description: 'Dapat beralih antara mode serangan dan pertahanan.',
        effect: 'stance_switch',
        cooldown: 20
      }
    ],
    requirements: {
      kingdom_level: 4,
      zodiac_element: 'Air',
      zodiac_bonus: 'Gemini'
    },
    counters: {
      strong_against: ['artillery', 'special'],
      weak_against: ['cavalry', 'air']
    },
    image: '/units/gemini_twin_striker.svg'
  },
  {
    id: 'libra_peace_negotiator',
    name: 'Negosiator Perdamaian',
    description: 'Unit diplomatik yang dapat mengubah musuh menjadi sekutu sementara.',
    type: 'special',
    tier: 3,
    stats: {
      attack: 4,
      defense: 10,
      health: 25,
      speed: 5,
      range: 3
    },
    cost: {
      stardust: 250,
      celestial_ore: 120,
      ether: 150,
      training_time: 210
    },
    abilities: [
      {
        name: 'Diplomasi',
        description: 'Kesempatan untuk mengubah unit musuh menjadi sekutu sementara.',
        effect: 'convert_enemy',
        cooldown: 120
      },
      {
        name: 'Aura Keseimbangan',
        description: 'Mengurangi kerusakan yang diterima dan diberikan di area sekitarnya.',
        effect: 'damage_balance',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 5,
      zodiac_element: 'Air',
      zodiac_bonus: 'Libra'
    },
    counters: {
      strong_against: ['infantry', 'cavalry'],
      weak_against: ['artillery', 'air']
    },
    image: '/units/libra_peace_negotiator.svg'
  },
  {
    id: 'aquarius_tech_innovator',
    name: 'Inovator Teknologi',
    description: 'Unit canggih dengan teknologi futuristik yang memberikan keunggulan di medan perang.',
    type: 'special',
    tier: 4,
    stats: {
      attack: 12,
      defense: 12,
      health: 35,
      speed: 5,
      range: 4
    },
    cost: {
      stardust: 400,
      celestial_ore: 200,
      ether: 200,
      training_time: 360
    },
    abilities: [
      {
        name: 'Senjata Eksperimental',
        description: 'Menggunakan senjata canggih yang memberikan efek acak pada musuh.',
        effect: 'random_tech_effect',
        cooldown: 45
      },
      {
        name: 'Medan Pelindung',
        description: 'Menciptakan medan pelindung yang melindungi unit sekutu di sekitarnya.',
        effect: 'shield_generator',
        cooldown: 90
      },
      {
        name: 'Inovasi Konstan',
        description: 'Secara pasif meningkatkan kemampuan unit seiring waktu pertempuran.',
        effect: 'progressive_improvement',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 7,
      zodiac_element: 'Air',
      zodiac_bonus: 'Aquarius'
    },
    counters: {
      strong_against: ['infantry', 'artillery'],
      weak_against: ['cavalry', 'special']
    },
    image: '/units/aquarius_tech_innovator.svg'
  },
  
  // Unit Khusus Zodiak - Water Element (Cancer, Scorpio, Pisces)
  {
    id: 'cancer_shell_defender',
    name: 'Pembela Cangkang',
    description: 'Unit pertahanan dengan cangkang pelindung yang hampir tidak dapat ditembus.',
    type: 'infantry',
    tier: 3,
    stats: {
      attack: 6,
      defense: 25,
      health: 50,
      speed: 2,
      range: 1
    },
    cost: {
      stardust: 300,
      celestial_ore: 200,
      ether: 50,
      training_time: 240
    },
    abilities: [
      {
        name: 'Cangkang Pelindung',
        description: 'Meningkatkan pertahanan secara drastis untuk sementara waktu.',
        effect: 'defense_surge',
        cooldown: 60
      },
      {
        name: 'Regenerasi',
        description: 'Secara pasif memulihkan kesehatan seiring waktu.',
        effect: 'health_regeneration',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 4,
      zodiac_element: 'Water',
      zodiac_bonus: 'Cancer'
    },
    counters: {
      strong_against: ['infantry', 'cavalry'],
      weak_against: ['artillery', 'special']
    },
    image: '/units/cancer_shell_defender.svg'
  },
  {
    id: 'scorpio_shadow_assassin',
    name: 'Pembunuh Bayangan',
    description: 'Unit penyusup yang mengkhususkan diri dalam serangan diam-diam dan sabotase.',
    type: 'special',
    tier: 3,
    stats: {
      attack: 20,
      defense: 5,
      health: 20,
      speed: 7,
      range: 1
    },
    cost: {
      stardust: 280,
      celestial_ore: 140,
      ether: 120,
      training_time: 210
    },
    abilities: [
      {
        name: 'Sengatan Mematikan',
        description: 'Serangan beracun yang menyebabkan kerusakan berkelanjutan.',
        effect: 'poison_damage',
        cooldown: 30
      },
      {
        name: 'Penyamaran',
        description: 'Dapat menyamar sebagai unit musuh untuk sementara waktu.',
        effect: 'disguise',
        cooldown: 90
      },
      {
        name: 'Gerakan Bayangan',
        description: 'Secara pasif meningkatkan kemampuan untuk menghindari serangan.',
        effect: 'evasion_boost',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 5,
      zodiac_element: 'Water',
      zodiac_bonus: 'Scorpio'
    },
    counters: {
      strong_against: ['artillery', 'special'],
      weak_against: ['infantry', 'cavalry']
    },
    image: '/units/scorpio_shadow_assassin.svg'
  },
  {
    id: 'pisces_mystic_illusionist',
    name: 'Ilusionis Mistik',
    description: 'Unit mistik yang menciptakan ilusi dan manipulasi mental di medan perang.',
    type: 'special',
    tier: 4,
    stats: {
      attack: 10,
      defense: 8,
      health: 30,
      speed: 5,
      range: 4
    },
    cost: {
      stardust: 350,
      celestial_ore: 150,
      ether: 200,
      training_time: 300
    },
    abilities: [
      {
        name: 'Kabut Ilusi',
        description: 'Menciptakan ilusi yang membingungkan musuh, mengurangi akurasi mereka.',
        effect: 'confusion_field',
        cooldown: 60
      },
      {
        name: 'Cermin Air',
        description: 'Menciptakan duplikat ilusi dari unit sekutu.',
        effect: 'create_illusion',
        cooldown: 90
      },
      {
        name: 'Intuisi Kosmik',
        description: 'Secara pasif memberikan kesempatan untuk menghindari serangan sepenuhnya.',
        effect: 'dodge_chance',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 6,
      zodiac_element: 'Water',
      zodiac_bonus: 'Pisces'
    },
    counters: {
      strong_against: ['infantry', 'cavalry'],
      weak_against: ['special', 'air']
    },
    image: '/units/pisces_mystic_illusionist.svg'
  },
  
  // Unit Elite - Tersedia untuk semua zodiak pada level tinggi
  {
    id: 'cosmic_warship',
    name: 'Kapal Perang Kosmik',
    description: 'Kapal perang besar dengan firepower luar biasa.',
    type: 'naval',
    tier: 4,
    stats: {
      attack: 25,
      defense: 20,
      health: 100,
      speed: 3,
      range: 5
    },
    cost: {
      stardust: 800,
      celestial_ore: 500,
      ether: 300,
      training_time: 600
    },
    abilities: [
      {
        name: 'Bombardemen Bintang',
        description: 'Serangan area yang merusak semua unit musuh di area target.',
        effect: 'area_bombardment',
        cooldown: 120
      },
      {
        name: 'Perisai Energi',
        description: 'Mengaktifkan perisai yang menyerap sejumlah besar kerusakan.',
        effect: 'energy_shield',
        cooldown: 180
      }
    ],
    requirements: {
      kingdom_level: 8,
      research: 'advanced_naval_warfare'
    },
    counters: {
      strong_against: ['infantry', 'cavalry', 'artillery'],
      weak_against: ['air', 'special']
    },
    image: '/units/cosmic_warship.svg'
  },
  {
    id: 'celestial_dragon',
    name: 'Naga Celestial',
    description: 'Unit udara legendaris dengan kekuatan luar biasa.',
    type: 'air',
    tier: 5,
    stats: {
      attack: 35,
      defense: 25,
      health: 120,
      speed: 7,
      range: 3
    },
    cost: {
      stardust: 1200,
      celestial_ore: 800,
      ether: 500,
      training_time: 900
    },
    abilities: [
      {
        name: 'Napas Bintang',
        description: 'Serangan napas yang merusak area luas dan memberikan efek elemen sesuai zodiak pemain.',
        effect: 'elemental_breath',
        cooldown: 90
      },
      {
        name: 'Terbang Tinggi',
        description: 'Terbang tinggi untuk menghindari serangan darat.',
        effect: 'evasion_flight',
        cooldown: 60
      },
      {
        name: 'Aura Naga',
        description: 'Secara pasif meningkatkan statistik semua unit sekutu di sekitarnya.',
        effect: 'dragon_aura',
        passive: true
      }
    ],
    requirements: {
      kingdom_level: 10,
      research: 'legendary_creatures'
    },
    counters: {
      strong_against: ['infantry', 'cavalry', 'artillery', 'naval'],
      weak_against: ['special']
    },
    image: '/units/celestial_dragon.svg'
  }
];

// Bonus khusus untuk unit berdasarkan zodiak
const zodiacUnitBonuses: ZodiacUnitBonus[] = [
  {
    zodiac: 'Aries',
    unit_id: 'aries_ram_charger',
    bonus: {
      stat: 'attack',
      value: 30,
      description: 'Pendobrak Domba Aries mendapatkan bonus serangan +30% karena sinergi zodiak.'
    }
  },
  {
    zodiac: 'Taurus',
    unit_id: 'taurus_earth_crusher',
    bonus: {
      stat: 'health',
      value: 40,
      description: 'Penghancur Bumi Taurus mendapatkan bonus kesehatan +40% karena sinergi zodiak.'
    }
  },
  {
    zodiac: 'Gemini',
    unit_id: 'gemini_twin_striker',
    bonus: {
      stat: 'speed',
      value: 25,
      description: 'Penyerang Kembar Gemini mendapatkan bonus kecepatan +25% karena