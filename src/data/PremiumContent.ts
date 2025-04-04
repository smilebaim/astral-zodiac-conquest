// Definisi sistem konten premium dan monetisasi

export interface ZodiacSkin {
  id: string;
  name: string;
  zodiacType: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  price: number;
  description: string;
  effects: string[];
  visualAssets: {
    kingdom: string; // Path ke aset visual kerajaan
    units: string; // Path ke aset visual unit
    buildings: string; // Path ke aset visual bangunan
  };
}

export interface WeeklyHoroscope {
  id: string;
  zodiacType: string;
  price: number;
  validityPeriod: {
    start: string; // Format: YYYY-MM-DD
    end: string; // Format: YYYY-MM-DD
  };
  predictions: {
    general: string;
    resources: string;
    combat: string;
    diplomacy: string;
  };
  recommendedActions: string[];
  luckyDays: number[];
}

// Daftar skin premium untuk setiap zodiak
export const premiumSkins: ZodiacSkin[] = [
  {
    id: 'aries-inferno',
    name: 'Inferno Kingdom',
    zodiacType: 'Aries',
    element: 'Fire',
    price: 1000,
    description: 'Transformasi kerajaan Anda dengan tema api yang menyala-nyala',
    effects: [
      'Visual efek api pada bangunan',
      'Animasi khusus untuk unit tempur',
      'Aura api pada pemimpin pasukan'
    ],
    visualAssets: {
      kingdom: '/assets/skins/aries/inferno-kingdom.svg',
      units: '/assets/skins/aries/inferno-units.svg',
      buildings: '/assets/skins/aries/inferno-buildings.svg'
    }
  },
  {
    id: 'pisces-abyss',
    name: 'Abyss Kingdom',
    zodiacType: 'Pisces',
    element: 'Water',
    price: 1000,
    description: 'Ubah kerajaan Anda menjadi kota bawah laut yang mistis',
    effects: [
      'Efek air bergelombang pada bangunan',
      'Unit dengan tema makhluk laut',
      'Kabut mistis di sekitar kerajaan'
    ],
    visualAssets: {
      kingdom: '/assets/skins/pisces/abyss-kingdom.svg',
      units: '/assets/skins/pisces/abyss-units.svg',
      buildings: '/assets/skins/pisces/abyss-buildings.svg'
    }
  }
];

// Fungsi untuk mendapatkan prediksi horoskop mingguan berbayar
export function generateWeeklyHoroscope(zodiacType: string): WeeklyHoroscope {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);

  return {
    id: `weekly-${zodiacType.toLowerCase()}-${startDate.getTime()}`,
    zodiacType,
    price: 500,
    validityPeriod: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    },
    predictions: {
      general: 'Minggu yang penuh dengan peluang pengembangan kerajaan',
      resources: 'Fokuskan pada pengumpulan sumber daya strategis',
      combat: 'Waktu yang tepat untuk memperkuat pertahanan',
      diplomacy: 'Peluang aliansi menguntungkan akan muncul'
    },
    recommendedActions: [
      'Tingkatkan produksi sumber daya utama',
      'Perkuat pertahanan di perbatasan',
      'Jalin hubungan diplomatik baru'
    ],
    luckyDays: [2, 4, 6] // Hari-hari dengan keberuntungan tinggi
  };
}