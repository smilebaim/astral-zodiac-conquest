// Definisi kemampuan khusus untuk setiap zodiak
import { ZodiacProps } from "../components/ZodiacCard";

export interface ZodiacAbility {
  name: string;
  description: string;
  type: 'passive' | 'active' | 'ultimate';
  cooldown?: number; // dalam detik, hanya untuk kemampuan aktif dan ultimate
  effect: {
    target: 'self' | 'ally' | 'enemy' | 'global';
    stat?: string;
    value?: number;
    duration?: number; // dalam detik
    special?: string; // efek khusus yang tidak dapat dikategorikan
  };
  unlockLevel: number;
  icon: string;
}

export interface ZodiacAbilities {
  [key: string]: ZodiacAbility[];
}

const zodiacAbilities: ZodiacAbilities = {
  "Aries": [
    {
      name: "Serangan Kilat",
      description: "Meningkatkan kecepatan serangan pasukan sebesar 50% dan memberikan efek Critical Strike",
      type: "passive",
      effect: {
        target: "ally",
        stat: "attack_speed",
        value: 50,
        special: "critical_strike",
        duration: 30
      },
      unlockLevel: 1,
      icon: "⚡"
    },
    {
      name: "Api Perang",
      description: "Memberikan damage tambahan berupa efek terbakar yang mengurangi HP musuh secara bertahap",
      type: "active",
      cooldown: 45,
      effect: {
        target: "enemy",
        special: "burning_damage",
        value: 40,
        duration: 20
      },
      unlockLevel: 3,
      icon: "🔥"
    },
    {
      name: "Amukan Perang",
      description: "Meningkatkan semua stat pasukan sebesar 60% dan memberikan immunity terhadap efek CC",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "ally",
        special: "berserk_mode",
        value: 60,
        duration: 45
      },
      unlockLevel: 10,
      icon: "🐏"
    }
  ],
  "Taurus": [
    {
      name: "Berkah Bumi",
      description: "Meningkatkan produksi sumber daya sebesar 70% dan memberikan bonus penyimpanan ekstra",
      type: "passive",
      effect: {
        target: "self",
        stat: "resource_production",
        value: 70,
        special: "storage_bonus"
      },
      unlockLevel: 1,
      icon: "🌾"
    },
    {
      name: "Benteng Tak Tertembus",
      description: "Menciptakan perisai yang memantulkan 40% damage kembali ke penyerang",
      type: "active",
      cooldown: 45,
      effect: {
        target: "self",
        special: "damage_reflection",
        value: 40,
        duration: 15
      },
      unlockLevel: 3,
      icon: "🛡️"
    },
    {
      name: "Dominasi Tanah",
      description: "Mengubah medan pertempuran menjadi zona suci yang memberikan regenerasi HP dan pertahanan super kepada sekutu",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "ally",
        special: "sacred_ground",
        value: 80,
        duration: 30
      },
      unlockLevel: 10,
      icon: "🐂"
    }
  ],
  "Gemini": [
    {
      name: "Duplikasi Sempurna",
      description: "Setiap unit yang dilatih akan memiliki kemungkinan 30% untuk mendapatkan salinan gratis dengan stats yang sama",
      type: "passive",
      effect: {
        target: "self",
        special: "perfect_clone",
        value: 30
      },
      unlockLevel: 1,
      icon: "🔄"
    },
    {
      name: "Bayangan Ilusi",
      description: "Menciptakan ilusi dari pasukan yang membingungkan musuh dan menyerap 50% damage",
      type: "active",
      cooldown: 45,
      effect: {
        target: "ally",
        special: "mirror_illusion",
        value: 50,
        duration: 20
      },
      unlockLevel: 3,
      icon: "👥"
    },
    {
      name: "Paradoks Kembar",
      description: "Menduplikasi semua efek buff yang aktif pada pasukan dan menggandakan damage output selama durasi",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "ally",
        special: "buff_duplication",
        value: 100,
        duration: 30
      },
      unlockLevel: 10,
      icon: "⚔️"
    }
  ],
  "Cancer": [
    {
      name: "Cangkang Adamantium",
      description: "Memberikan perisai yang menyerap 60% damage dan memulihkan HP berdasarkan damage yang diserap",
      type: "passive",
      effect: {
        target: "self",
        special: "adaptive_shield",
        value: 60
      },
      unlockLevel: 1,
      icon: "🛡️"
    },
    {
      name: "Gelombang Penyembuh",
      description: "Menciptakan area penyembuhan yang memulihkan HP sekutu dan memberikan immunity terhadap efek negatif",
      type: "active",
      cooldown: 45,
      effect: {
        target: "ally",
        special: "healing_zone",
        value: 50,
        duration: 15
      },
      unlockLevel: 3,
      icon: "❤️"
    },
    {
      name: "Cengkeraman Abyssal",
      description: "Mengendalikan musuh dalam area, memaksa mereka menyerang sekutunya sendiri dan menerima damage berlipat",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "enemy",
        special: "mind_control",
        value: 100,
        duration: 20
      },
      unlockLevel: 10,
      icon: "🦀"
    }
  ],
  "Leo": [
    {
      name: "Raja Para Raja",
      description: "Meningkatkan semua atribut pasukan sebesar 40% dan memberikan immunity terhadap efek kontrol",
      type: "passive",
      effect: {
        target: "ally",
        special: "royal_authority",
        value: 40
      },
      unlockLevel: 1,
      icon: "👑"
    },
    {
      name: "Raungan Dominasi",
      description: "Mengeluarkan raungan yang melemahkan pertahanan musuh sebesar 50% dan mematahkan semangat mereka",
      type: "active",
      cooldown: 45,
      effect: {
        target: "enemy",
        special: "intimidation_roar",
        value: 50,
        duration: 15
      },
      unlockLevel: 3,
      icon: "🦁"
    },
    {
      name: "Kemuliaan Sang Raja",
      description: "Mengaktifkan mode raja yang memberikan damage berlipat dan mengkonversi sebagian damage menjadi penyembuhan untuk sekutu",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "self",
        special: "kings_glory",
        value: 120,
        duration: 30
      },
      unlockLevel: 10,
      icon: "⚔️"
    }
  ],
  "Virgo": [
    {
      name: "Riset Cepat",
      description: "Meningkatkan kecepatan riset teknologi sebesar 40%",
      type: "passive",
      effect: {
        target: "self",
        stat: "research_speed",
        value: 40
      },
      unlockLevel: 1,
      icon: "📚"
    },
    {
      name: "Efisiensi Sumber Daya",
      description: "Meningkatkan efisiensi penggunaan sumber daya sebesar 35%",
      type: "passive",
      effect: {
        target: "self",
        stat: "resource_efficiency",
        value: 35
      },
      unlockLevel: 3,
      icon: "⚡"
    },
    {
      name: "Pasukan Presisi",
      description: "Meningkatkan akurasi dan efisiensi pasukan sebesar 45% melalui teknologi canggih",
      type: "ultimate",
      cooldown: 600,
      effect: {
        target: "ally",
        special: "precision_boost",
        value: 45,
        duration: 30
      },
      unlockLevel: 10,
      icon: "🎯"
    }
  ],
  "Libra": [
    {
      name: "Perjanjian Damai",
      description: "Menawarkan perjanjian damai sementara kepada musuh, mencegah serangan selama 120 detik",
      type: "active",
      cooldown: 600,
      effect: {
        target: "enemy",
        special: "peace_treaty",
        duration: 120
      },
      unlockLevel: 1,
      icon: "🕊️"
    },
    {
      name: "Diplomasi Terampil",
      description: "Mendapatkan 20% lebih banyak sumber daya dari perdagangan secara pasif",
      type: "passive",
      effect: {
        target: "self",
        stat: "trade_bonus",
        value: 20
      },
      unlockLevel: 3,
      icon: "🤝"
    },
    {
      name: "Aliansi Kosmik",
      description: "Memanggil bantuan dari semua sekutu, memberikan bonus sumber daya dan unit sementara",
      type: "ultimate",
      cooldown: 900,
      effect: {
        target: "ally",
        special: "cosmic_alliance",
        duration: 60
      },
      unlockLevel: 10,
      icon: "⚖️"
    }
  ],
  "Scorpio": [
    {
      name: "Racun Kalajengking",
      description: "Meracuni sumber daya musuh, mengurangi produksi mereka sebesar 25% selama 60 detik",
      type: "active",
      cooldown: 300,
      effect: {
        target: "enemy",
        stat: "resource_production",
        value: -25,
        duration: 60
      },
      unlockLevel: 1,
      icon: "☠️"
    },
    {
      name: "Jaringan Mata-mata",
      description: "Secara pasif mengungkapkan informasi tentang kerajaan musuh",
      type: "passive",
      effect: {
        target: "enemy",
        special: "reveal_info"
      },
      unlockLevel: 3,
      icon: "🕵️"
    },
    {
      name: "Sabotase Total",
      description: "Meluncurkan operasi sabotase besar-besaran terhadap musuh, menonaktifkan sistem pertahanan mereka",
      type: "ultimate",
      cooldown: 900,
      effect: {
        target: "enemy",
        special: "disable_defenses",
        duration: 30
      },
      unlockLevel: 10,
      icon: "🦂"
    }
  ],
  "Sagittarius": [
    {
      name: "Bidikan Tepat",
      description: "Meningkatkan jangkauan serangan unit jarak jauh sebesar 40% selama 45 detik",
      type: "active",
      cooldown: 240,
      effect: {
        target: "self",
        stat: "attack_range",
        value: 40,
        duration: 45
      },
      unlockLevel: 1,
      icon: "🏹"
    },
    {
      name: "Penjelajah Bintang",
      description: "Unit bergerak 15% lebih cepat secara pasif di semua medan",
      type: "passive",
      effect: {
        target: "self",
        stat: "movement_speed",
        value: 15
      },
      unlockLevel: 3,
      icon: "🌠"
    },
    {
      name: "Hujan Meteor",
      description: "Memanggil hujan meteor yang merusak area luas di wilayah musuh",
      type: "ultimate",
      cooldown: 720,
      effect: {
        target: "enemy",
        special: "meteor_shower",
        value: 75,
        duration: 15
      },
      unlockLevel: 10,
      icon: "🏹"
    }
  ],
  "Capricorn": [
    {
      name: "Fondasi Kokoh",
      description: "Mengurangi biaya pembangunan struktur sebesar 30% selama 120 detik",
      type: "active",
      cooldown: 360,
      effect: {
        target: "self",
        stat: "building_cost",
        value: -30,
        duration: 120
      },
      unlockLevel: 1,
      icon: "🏗️"
    },
    {
      name: "Pertumbuhan Stabil",
      description: "Secara pasif meningkatkan kapasitas penyimpanan sumber daya sebesar 20%",
      type: "passive",
      effect: {
        target: "self",
        stat: "storage_capacity",
        value: 20
      },
      unlockLevel: 3,
      icon: "📈"
    },
    {
      name: "Benteng Gunung",
      description: "Mengubah kerajaan menjadi benteng yang hampir tidak dapat ditembus selama 60 detik",
      type: "ultimate",
      cooldown: 900,
      effect: {
        target: "self",
        special: "mountain_fortress",
        duration: 60
      },
      unlockLevel: 10,
      icon: "🐐"
    }
  ],
  "Aquarius": [
    {
      name: "Terobosan Teknologi",
      description: "Mempercepat penelitian saat ini sebesar 100%, menyelesaikannya dalam waktu setengahnya",
      type: "active",
      cooldown: 480,
      effect: {
        target: "self",
        stat: "research_speed",
        value: 100,
        duration: 30
      },
      unlockLevel: 1,
      icon: "💡"
    },
    {
      name: "Inovasi Konstan",
      description: "Secara pasif memberikan kesempatan 10% untuk mendapatkan teknologi bonus saat menyelesaikan penelitian",
      type: "passive",
      effect: {
        target: "self",
        special: "bonus_tech_chance",
        value: 10
      },
      unlockLevel: 3,
      icon: "🔬"
    },
    {
      name: "Revolusi Teknologi",
      description: "Membuka teknologi canggih sementara yang biasanya tidak tersedia",
      type: "ultimate",
      cooldown: 1200,
      effect: {
        target: "self",
        special: "advanced_tech_access",
        duration: 180
      },
      unlockLevel: 10,
      icon: "⚗️"
    }
  ],
  "Pisces": [
    {
      name: "Kabut Ilusi",
      description: "Menciptakan kabut yang menyembunyikan unit dan bangunan dari musuh selama 60 detik",
      type: "active",
      cooldown: 300,
      effect: {
        target: "self",
        special: "invisibility",
        duration: 60
      },
      unlockLevel: 1,
      icon: "🌫️"
    },
    {
      name: "Intuisi Kosmik",
      description: "Secara pasif memberikan peringatan 30 detik sebelum serangan musuh",
      type: "passive",
      effect: {
        target: "self",
        special: "attack_warning",
        value: 30
      },
      unlockLevel: 3,
      icon: "🔮"
    },
    {
      name: "Lautan Mimpi",
      description: "Menenggelamkan musuh dalam ilusi, membuat mereka menyerang unit mereka sendiri",
      type: "ultimate",
      cooldown: 900,
      effect: {
        target: "enemy",
        special: "confusion",
        duration: 20
      },
      unlockLevel: 10,
      icon: "🐟"
    }
  ]
};

export default zodiacAbilities;