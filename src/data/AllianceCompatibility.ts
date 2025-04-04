// Definisi sistem kompatibilitas zodiak untuk aliansi

export interface ZodiacCompatibility {
  bonus: number; // Persentase bonus yang diberikan
  description: string; // Deskripsi efek kompatibilitas
}

export interface ZodiacOpposition {
  penalty: number; // Persentase penalti yang diberikan
  description: string; // Deskripsi efek pertentangan
}

interface ZodiacRelations {
  compatibilities: { [key: string]: ZodiacCompatibility[] };
  oppositions: { [key: string]: ZodiacOpposition[] };
}

// Definisi hubungan antar zodiak
export const zodiacRelations: ZodiacRelations = {
  compatibilities: {
    "Aries": [
      {
        bonus: 20,
        description: "Aliansi dengan Leo meningkatkan kekuatan serangan +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Sagittarius meningkatkan jangkauan serangan +15%"
      }
    ],
    "Leo": [
      {
        bonus: 20,
        description: "Aliansi dengan Aries meningkatkan kekuatan serangan +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Sagittarius meningkatkan moral pasukan +15%"
      }
    ],
    "Sagittarius": [
      {
        bonus: 15,
        description: "Aliansi dengan Aries meningkatkan jangkauan serangan +15%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Leo meningkatkan moral pasukan +15%"
      }
    ],
    "Taurus": [
      {
        bonus: 20,
        description: "Aliansi dengan Virgo meningkatkan produksi sumber daya +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Capricorn meningkatkan pertahanan +15%"
      }
    ],
    "Virgo": [
      {
        bonus: 20,
        description: "Aliansi dengan Taurus meningkatkan produksi sumber daya +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Capricorn meningkatkan efisiensi +15%"
      }
    ],
    "Capricorn": [
      {
        bonus: 15,
        description: "Aliansi dengan Taurus meningkatkan pertahanan +15%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Virgo meningkatkan efisiensi +15%"
      }
    ],
    "Gemini": [
      {
        bonus: 20,
        description: "Aliansi dengan Libra meningkatkan diplomasi +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Aquarius meningkatkan penelitian +15%"
      }
    ],
    "Libra": [
      {
        bonus: 20,
        description: "Aliansi dengan Gemini meningkatkan diplomasi +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Aquarius meningkatkan keseimbangan kekuatan +15%"
      }
    ],
    "Aquarius": [
      {
        bonus: 15,
        description: "Aliansi dengan Gemini meningkatkan penelitian +15%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Libra meningkatkan keseimbangan kekuatan +15%"
      }
    ],
    "Cancer": [
      {
        bonus: 20,
        description: "Aliansi dengan Scorpio meningkatkan pertahanan +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Pisces meningkatkan regenerasi +15%"
      }
    ],
    "Scorpio": [
      {
        bonus: 20,
        description: "Aliansi dengan Cancer meningkatkan pertahanan +20%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Pisces meningkatkan kekuatan racun +15%"
      }
    ],
    "Pisces": [
      {
        bonus: 15,
        description: "Aliansi dengan Cancer meningkatkan regenerasi +15%"
      },
      {
        bonus: 15,
        description: "Aliansi dengan Scorpio meningkatkan kekuatan racun +15%"
      }
    ]
  },
  oppositions: {
    "Aries": [{
      penalty: -15,
      description: "Pertentangan dengan Libra melemahkan kekuatan serangan"
    }],
    "Taurus": [{
      penalty: -15,
      description: "Pertentangan dengan Scorpio melemahkan produksi sumber daya"
    }],
    "Gemini": [{
      penalty: -15,
      description: "Pertentangan dengan Sagittarius melemahkan diplomasi"
    }],
    "Cancer": [{
      penalty: -15,
      description: "Pertentangan dengan Capricorn melemahkan pertahanan"
    }],
    "Leo": [{
      penalty: -15,
      description: "Pertentangan dengan Aquarius melemahkan moral pasukan"
    }],
    "Virgo": [{
      penalty: -15,
      description: "Pertentangan dengan Pisces melemahkan efisiensi"
    }],
    "Libra": [{
      penalty: -15,
      description: "Pertentangan dengan Aries melemahkan diplomasi"
    }],
    "Scorpio": [{
      penalty: -15,
      description: "Pertentangan dengan Taurus melemahkan kekuatan racun"
    }],
    "Sagittarius": [{
      penalty: -15,
      description: "Pertentangan dengan Gemini melemahkan jangkauan serangan"
    }],
    "Capricorn": [{
      penalty: -15,
      description: "Pertentangan dengan Cancer melemahkan pertahanan struktur"
    }],
    "Aquarius": [{
      penalty: -15,
      description: "Pertentangan dengan Leo melemahkan penelitian"
    }],
    "Pisces": [{
      penalty: -15,
      description: "Pertentangan dengan Virgo melemahkan ilusi"
    }]
  }
};

// Fungsi untuk mendapatkan bonus kompatibilitas antara dua zodiak
export function getCompatibilityBonus(zodiac1: string, zodiac2: string): ZodiacCompatibility | null {
  const compatibilities = zodiacRelations.compatibilities[zodiac1];
  if (!compatibilities) return null;
  
  return compatibilities.find(comp => 
    comp.description.toLowerCase().includes(zodiac2.toLowerCase())
  ) || null;
}

// Fungsi untuk mendapatkan penalti pertentangan antara dua zodiak
export function getOppositionPenalty(zodiac1: string, zodiac2: string): ZodiacOpposition | null {
  const opposition = zodiacRelations.oppositions[zodiac1];
  if (!opposition) return null;

  return opposition.find(opp =>
    opp.description.toLowerCase().includes(zodiac2.toLowerCase())
  ) || null;
}