// Definisi bangunan sumber daya untuk sistem permainan

export interface ResourceBuilding {
  id: string;
  name: string;
  description: string;
  type: 'stardust' | 'celestial_ore' | 'ether' | 'multi';
  tier: 1 | 2 | 3 | 4 | 5;
  baseStats: {
    production_rate: number; // per menit
    storage_capacity: number;
    efficiency: number; // persentase
  };
  upgradeCost: {
    stardust: number;
    celestial_ore: number;
    ether: number;
  };
  requirements: {
    kingdom_level: number;
    research?: string;
    zodiac_element?: 'Fire' | 'Earth' | 'Air' | 'Water';
    zodiac_bonus?: string; // nama zodiak yang mendapat bonus
  };
  special_ability?: {
    name: string;
    description: string;
    effect: string;
    activation_chance?: number; // persentase
  };
  construction_time: number; // dalam detik
  image: string;
}

const buildingData: ResourceBuilding[] = [
  // Bangunan Stardust - Tier 1
  {
    id: 'stardust_collector_1',
    name: 'Pengumpul Stardust Dasar',
    description: 'Bangunan dasar untuk mengumpulkan stardust dari atmosfer planet.',
    type: 'stardust',
    tier: 1,
    baseStats: {
      production_rate: 10,
      storage_capacity: 500,
      efficiency: 100
    },
    upgradeCost: {
      stardust: 200,
      celestial_ore: 50,
      ether: 0
    },
    requirements: {
      kingdom_level: 1
    },
    construction_time: 60,
    image: '/buildings/stardust_collector_1.svg'
  },
  
  // Bangunan Stardust - Tier 2
  {
    id: 'stardust_collector_2',
    name: 'Pengumpul Stardust Lanjutan',
    description: 'Versi yang ditingkatkan dari pengumpul stardust dengan efisiensi yang lebih baik.',
    type: 'stardust',
    tier: 2,
    baseStats: {
      production_rate: 25,
      storage_capacity: 1000,
      efficiency: 110
    },
    upgradeCost: {
      stardust: 500,
      celestial_ore: 150,
      ether: 50
    },
    requirements: {
      kingdom_level: 3,
      research: 'stardust_efficiency'
    },
    construction_time: 180,
    image: '/buildings/stardust_collector_2.svg'
  },
  
  // Bangunan Stardust - Tier 3
  {
    id: 'stardust_refinery',
    name: 'Kilang Stardust',
    description: 'Memproses stardust mentah menjadi bentuk yang lebih murni, meningkatkan produksi secara signifikan.',
    type: 'stardust',
    tier: 3,
    baseStats: {
      production_rate: 60,
      storage_capacity: 2500,
      efficiency: 120
    },
    upgradeCost: {
      stardust: 1200,
      celestial_ore: 400,
      ether: 150
    },
    requirements: {
      kingdom_level: 5,
      research: 'stardust_refinement'
    },
    special_ability: {
      name: 'Pemurnian Beruntun',
      description: 'Kesempatan untuk menghasilkan stardust bonus setiap menit.',
      effect: 'bonus_production',
      activation_chance: 15
    },
    construction_time: 360,
    image: '/buildings/stardust_refinery.svg'
  },
  
  // Bangunan Celestial Ore - Tier 1
  {
    id: 'ore_extractor_1',
    name: 'Ekstraktor Bijih Dasar',
    description: 'Menambang bijih celestial dari kerak planet.',
    type: 'celestial_ore',
    tier: 1,
    baseStats: {
      production_rate: 8,
      storage_capacity: 400,
      efficiency: 100
    },
    upgradeCost: {
      stardust: 250,
      celestial_ore: 100,
      ether: 0
    },
    requirements: {
      kingdom_level: 1
    },
    construction_time: 90,
    image: '/buildings/ore_extractor_1.svg'
  },
  
  // Bangunan Celestial Ore - Tier 2
  {
    id: 'ore_extractor_2',
    name: 'Ekstraktor Bijih Lanjutan',
    description: 'Ekstraktor yang ditingkatkan dengan kemampuan penambangan yang lebih dalam.',
    type: 'celestial_ore',
    tier: 2,
    baseStats: {
      production_rate: 20,
      storage_capacity: 800,
      efficiency: 110
    },
    upgradeCost: {
      stardust: 600,
      celestial_ore: 300,
      ether: 50
    },
    requirements: {
      kingdom_level: 3,
      research: 'deep_mining'
    },
    construction_time: 210,
    image: '/buildings/ore_extractor_2.svg'
  },
  
  // Bangunan Celestial Ore - Tier 3
  {
    id: 'ore_processing_plant',
    name: 'Pabrik Pemrosesan Bijih',
    description: 'Fasilitas canggih yang memproses bijih mentah menjadi bahan berkualitas tinggi.',
    type: 'celestial_ore',
    tier: 3,
    baseStats: {
      production_rate: 45,
      storage_capacity: 2000,
      efficiency: 125
    },
    upgradeCost: {
      stardust: 1500,
      celestial_ore: 800,
      ether: 200
    },
    requirements: {
      kingdom_level: 5,
      research: 'ore_processing'
    },
    special_ability: {
      name: 'Ekstraksi Presisi',
      description: 'Meningkatkan efisiensi produksi saat diaktifkan.',
      effect: 'efficiency_boost',
      activation_chance: 20
    },
    construction_time: 420,
    image: '/buildings/ore_processing_plant.svg'
  },
  
  // Bangunan Ether - Tier 1
  {
    id: 'ether_collector_1',
    name: 'Kolektor Ether Dasar',
    description: 'Mengumpulkan energi ether dari aliran kosmik.',
    type: 'ether',
    tier: 1,
    baseStats: {
      production_rate: 5,
      storage_capacity: 300,
      efficiency: 100
    },
    upgradeCost: {
      stardust: 300,
      celestial_ore: 150,
      ether: 50
    },
    requirements: {
      kingdom_level: 2
    },
    construction_time: 120,
    image: '/buildings/ether_collector_1.svg'
  },
  
  // Bangunan Ether - Tier 2
  {
    id: 'ether_collector_2',
    name: 'Kolektor Ether Lanjutan',
    description: 'Kolektor yang ditingkatkan dengan jangkauan yang lebih luas untuk menangkap ether.',
    type: 'ether',
    tier: 2,
    baseStats: {
      production_rate: 12,
      storage_capacity: 600,
      efficiency: 115
    },
    upgradeCost: {
      stardust: 700,
      celestial_ore: 350,
      ether: 150
    },
    requirements: {
      kingdom_level: 4,
      research: 'ether_attraction'
    },
    construction_time: 240,
    image: '/buildings/ether_collector_2.svg'
  },
  
  // Bangunan Ether - Tier 3
  {
    id: 'ether_condenser',
    name: 'Kondensor Ether',
    description: 'Teknologi canggih yang mengkondensasi ether menjadi bentuk yang lebih terkonsentrasi.',
    type: 'ether',
    tier: 3,
    baseStats: {
      production_rate: 30,
      storage_capacity: 1500,
      efficiency: 130
    },
    upgradeCost: {
      stardust: 2000,
      celestial_ore: 1000,
      ether: 500
    },
    requirements: {
      kingdom_level: 6,
      research: 'ether_condensation'
    },
    special_ability: {
      name: 'Resonansi Ether',
      description: 'Menciptakan resonansi yang meningkatkan produksi semua bangunan ether.',
      effect: 'global_ether_boost',
      activation_chance: 10
    },
    construction_time: 480,
    image: '/buildings/ether_condenser.svg'
  },
  
  // Bangunan Multi-Resource - Tier 3
  {
    id: 'cosmic_harvester',
    name: 'Pemanen Kosmik',
    description: 'Struktur canggih yang dapat mengumpulkan berbagai jenis sumber daya sekaligus.',
    type: 'multi',
    tier: 3,
    baseStats: {
      production_rate: 15, // untuk setiap jenis sumber daya
      storage_capacity: 1000, // untuk setiap jenis sumber daya
      efficiency: 110
    },
    upgradeCost: {
      stardust: 1800,
      celestial_ore: 900,
      ether: 450
    },
    requirements: {
      kingdom_level: 7,
      research: 'multi_resource_harvesting'
    },
    special_ability: {
      name: 'Sinergi Kosmik',
      description: 'Meningkatkan produksi semua sumber daya berdasarkan total sumber daya yang tersimpan.',
      effect: 'synergy_boost'
    },
    construction_time: 600,
    image: '/buildings/cosmic_harvester.svg'
  },
  
  // Bangunan Khusus Zodiak - Fire Element
  {
    id: 'fire_forge',
    name: 'Penempaan Api Kosmik',
    description: 'Struktur khusus yang memanfaatkan energi api zodiak untuk meningkatkan produksi sumber daya.',
    type: 'multi',
    tier: 4,
    baseStats: {
      production_rate: 25,
      storage_capacity: 1500,
      efficiency: 140
    },
    upgradeCost: {
      stardust: 3000,
      celestial_ore: 1500,
      ether: 750
    },
    requirements: {
      kingdom_level: 8,
      research: 'elemental_mastery',
      zodiac_element: 'Fire',
      zodiac_bonus: 'Aries'
    },
    special_ability: {
      name: 'Penguatan Api',
      description: 'Meningkatkan produksi stardust secara signifikan dan memberikan bonus kecil untuk sumber daya lain.',
      effect: 'fire_element_boost'
    },
    construction_time: 720,
    image: '/buildings/fire_forge.svg'
  },
  
  // Bangunan Khusus Zodiak - Earth Element
  {
    id: 'earth_nexus',
    name: 'Nexus Bumi Kosmik',
    description: 'Pusat energi yang memanfaatkan kekuatan elemen bumi untuk meningkatkan produksi sumber daya.',
    type: 'multi',
    tier: 4,
    baseStats: {
      production_rate: 20,
      storage_capacity: 2000,
      efficiency: 135
    },
    upgradeCost: {
      stardust: 3000,
      celestial_ore: 1500,
      ether: 750
    },
    requirements: {
      kingdom_level: 8,
      research: 'elemental_mastery',
      zodiac_element: 'Earth',
      zodiac_bonus: 'Taurus'
    },
    special_ability: {
      name: 'Stabilitas Bumi',
      description: 'Meningkatkan produksi celestial ore secara signifikan dan memberikan bonus kecil untuk sumber daya lain.',
      effect: 'earth_element_boost'
    },
    construction_time: 720,
    image: '/buildings/earth_nexus.svg'
  },
  
  // Bangunan Khusus Zodiak - Air Element
  {
    id: 'air_spire',
    name: 'Menara Udara Kosmik',
    description: 'Menara tinggi yang memanfaatkan arus udara kosmik untuk mengumpulkan sumber daya.',
    type: 'multi',
    tier: 4,
    baseStats: {
      production_rate: 22,
      storage_capacity: 1800,
      efficiency: 145
    },
    upgradeCost: {
      stardust: 3000,
      celestial_ore: 1500,
      ether: 750
    },
    requirements: {
      kingdom_level: 8,
      research: 'elemental_mastery',
      zodiac_element: 'Air',
      zodiac_bonus: 'Gemini'
    },
    special_ability: {
      name: 'Aliran Udara',
      description: 'Meningkatkan efisiensi semua bangunan dan memberikan bonus kecepatan penelitian.',
      effect: 'air_element_boost'
    },
    construction_time: 720,
    image: '/buildings/air_spire.svg'
  },
  
  // Bangunan Khusus Zodiak - Water Element
  {
    id: 'water_basin',
    name: 'Kolam Air Kosmik',
    description: 'Struktur yang memanfaatkan energi air kosmik untuk menghasilkan dan menyimpan sumber daya.',
    type: 'multi',
    tier: 4,
    baseStats: {
      production_rate: 18,
      storage_capacity: 2500,
      efficiency: 130
    },
    upgradeCost: {
      stardust: 3000,
      celestial_ore: 1500,
      ether: 750
    },
    requirements: {
      kingdom_level: 8,
      research: 'elemental_mastery',
      zodiac_element: 'Water',
      zodiac_bonus: 'Cancer'
    },
    special_ability: {
      name: 'Aliran Kosmik',
      description: 'Meningkatkan produksi ether secara signifikan dan memberikan regenerasi pasif untuk semua sumber daya.',
      effect: 'water_element_boost'
    },
    construction_time: 720,
    image: '/buildings/water_basin.svg'
  }
];

export default buildingData;