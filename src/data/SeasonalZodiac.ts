// Definisi sistem zodiak musiman dan bonus berdasarkan kalender astrologi

export interface SeasonalBonus {
  resourceBonus: number; // Persentase bonus sumber daya
  startDate: string; // Tanggal mulai periode zodiak (format: MM-DD)
  endDate: string; // Tanggal akhir periode zodiak (format: MM-DD)
  additionalEffects?: string[]; // Efek tambahan selama periode zodiak
}

export interface DailyHoroscope {
  prediction: string;
  luck: number; // 0-100
  warning?: string;
  opportunities?: string[];
}

// Definisi periode zodiak dan bonus musiman
export const seasonalZodiacPeriods: { [key: string]: SeasonalBonus } = {
  "Aries": {
    resourceBonus: 15,
    startDate: "03-21",
    endDate: "04-19",
    additionalEffects: [
      "Peningkatan kecepatan produksi unit",
      "Bonus moral pasukan +5%"
    ]
  },
  "Taurus": {
    resourceBonus: 15,
    startDate: "04-20",
    endDate: "05-20",
    additionalEffects: [
      "Peningkatan kapasitas penyimpanan",
      "Bonus pertahanan bangunan +5%"
    ]
  },
  "Gemini": {
    resourceBonus: 15,
    startDate: "05-21",
    endDate: "06-20",
    additionalEffects: [
      "Peningkatan efisiensi perdagangan",
      "Bonus diplomasi +5%"
    ]
  },
  "Cancer": {
    resourceBonus: 15,
    startDate: "06-21",
    endDate: "07-22",
    additionalEffects: [
      "Peningkatan regenerasi pertahanan",
      "Bonus produksi makanan +5%"
    ]
  },
  "Leo": {
    resourceBonus: 15,
    startDate: "07-23",
    endDate: "08-22",
    additionalEffects: [
      "Peningkatan kekuatan kepemimpinan",
      "Bonus serangan +5%"
    ]
  },
  "Virgo": {
    resourceBonus: 15,
    startDate: "08-23",
    endDate: "09-22",
    additionalEffects: [
      "Peningkatan efisiensi penelitian",
      "Bonus produksi teknologi +5%"
    ]
  },
  "Libra": {
    resourceBonus: 15,
    startDate: "09-23",
    endDate: "10-22",
    additionalEffects: [
      "Peningkatan keberhasilan diplomasi",
      "Bonus perdagangan +5%"
    ]
  },
  "Scorpio": {
    resourceBonus: 15,
    startDate: "10-23",
    endDate: "11-21",
    additionalEffects: [
      "Peningkatan efektivitas mata-mata",
      "Bonus kekuatan racun +5%"
    ]
  },
  "Sagittarius": {
    resourceBonus: 15,
    startDate: "11-22",
    endDate: "12-21",
    additionalEffects: [
      "Peningkatan jangkauan serangan",
      "Bonus akurasi +5%"
    ]
  },
  "Capricorn": {
    resourceBonus: 15,
    startDate: "12-22",
    endDate: "01-19",
    additionalEffects: [
      "Peningkatan efisiensi konstruksi",
      "Bonus pertahanan +5%"
    ]
  },
  "Aquarius": {
    resourceBonus: 15,
    startDate: "01-20",
    endDate: "02-18",
    additionalEffects: [
      "Peningkatan kecepatan penelitian",
      "Bonus inovasi +5%"
    ]
  },
  "Pisces": {
    resourceBonus: 15,
    startDate: "02-19",
    endDate: "03-20",
    additionalEffects: [
      "Peningkatan kemampuan ilusi",
      "Bonus regenerasi +5%"
    ]
  }
};

// Template prediksi horoskop harian dengan detail yang lebih spesifik
const horoscopePredictions = {
  positive: [
    "Energi kosmik yang kuat mendukung ekspansi wilayah hari ini. Manfaatkan momentum ini untuk memperluas kekuasaan.",
    "Bintang-bintang menunjukkan peluang aliansi yang sangat menguntungkan. Jalin hubungan diplomatik dengan bijak.",
    "Konstelasi yang menguntungkan membawa kelimpahan sumber daya. Tingkatkan produksi dan penyimpanan.",
    "Posisi planet mendukung kekuatan tempur. Pasukan akan memiliki semangat dan efektivitas yang tinggi.",
    "Energi zodiak meningkatkan kemampuan kepemimpinan. Ambil keputusan penting dengan percaya diri."
  ],
  negative: [
    "Gerhana kosmik menandakan ancaman serangan. Perkuat pertahanan dan siagakan pasukan elit.",
    "Aspek planet menunjukkan potensi pengkhianatan. Waspadai gerak-gerik mencurigakan dari sekutu.",
    "Gangguan energi astral dapat menghambat produksi. Siapkan cadangan sumber daya yang cukup.",
    "Posisi retrograde mempengaruhi moral pasukan. Fokus pada pemulihan dan konsolidasi internal.",
    "Turbulensi kosmik mengancam stabilitas. Hindari konflik besar dan jaga keseimbangan."
  ],
  neutral: [
    "Energi zodiak mendukung pengembangan internal. Manfaatkan waktu untuk memperkuat infrastruktur.",
    "Konstelasi menunjukkan periode defensif. Fokus pada penguatan pertahanan dan pengamanan aset.",
    "Aspek planet mendukung kemajuan teknologi. Prioritaskan penelitian dan pengembangan.",
    "Aliran kosmik mendukung hubungan diplomatik. Bangun jaringan aliansi yang strategis.",
    "Keseimbangan astral mendukung konsolidasi. Evaluasi strategi dan rencanakan langkah selanjutnya."
  ]
};

// Fungsi untuk mendapatkan zodiak yang sedang berkuasa berdasarkan tanggal
export function getCurrentRulingZodiac(date: Date = new Date()): string | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  for (const [zodiac, period] of Object.entries(seasonalZodiacPeriods)) {
    // Handle special case for Capricorn (crosses year boundary)
    if (zodiac === "Capricorn") {
      if (dateStr >= period.startDate || dateStr <= period.endDate) {
        return zodiac;
      }
    } else if (dateStr >= period.startDate && dateStr <= period.endDate) {
      return zodiac;
    }
  }

  return null;
}

// Fungsi untuk menghasilkan horoskop harian
export function generateDailyHoroscope(zodiac: string): DailyHoroscope {
  const luck = Math.floor(Math.random() * 101); // 0-100
  const isPositive = luck > 70;
  const isNegative = luck < 30;
  
  let prediction = "";
  let warning = undefined;
  let opportunities = undefined;

  if (isPositive) {
    prediction = horoscopePredictions.positive[Math.floor(Math.random() * horoscopePredictions.positive.length)];
    opportunities = [horoscopePredictions.positive[Math.floor(Math.random() * horoscopePredictions.positive.length)]];
  } else if (isNegative) {
    prediction = horoscopePredictions.negative[Math.floor(Math.random() * horoscopePredictions.negative.length)];
    warning = horoscopePredictions.negative[Math.floor(Math.random() * horoscopePredictions.negative.length)];
  } else {
    prediction = horoscopePredictions.neutral[Math.floor(Math.random() * horoscopePredictions.neutral.length)];
  }

  return {
    prediction,
    luck,
    warning,
    opportunities
  };
}