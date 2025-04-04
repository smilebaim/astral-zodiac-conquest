import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WayangAvatar {
  id: string;
  name: string;
  zodiacSign: string;
  description: string;
  preview_url: string;
  unlocked: boolean;
}

interface ZodiacBonus {
  type: 'attack' | 'defense' | 'resource' | 'diplomacy';
  value: number;
  description: string;
}

interface ZodiacPersonalizationProps {
  userId: string;
  userZodiac: string;
  onAvatarChange?: (avatar: WayangAvatar) => void;
  onBonusActivate?: (bonus: ZodiacBonus) => void;
}

const ZodiacPersonalization: React.FC<ZodiacPersonalizationProps> = ({
  userId,
  userZodiac,
  onAvatarChange,
  onBonusActivate
}) => {
  const [wayangAvatars, setWayangAvatars] = useState<WayangAvatar[]>([
    {
      id: 'arjuna_sagittarius',
      name: 'Arjuna',
      zodiacSign: 'Sagittarius',
      description: 'Ksatria paling terampil dalam Mahabharata, cocok dengan ketepatan Sagittarius',
      preview_url: '/avatars/arjuna.svg',
      unlocked: false
    },
    {
      id: 'bima_leo',
      name: 'Bima',
      zodiacSign: 'Leo',
      description: 'Ksatria kuat dan berani, mencerminkan semangat Leo',
      preview_url: '/avatars/bima.svg',
      unlocked: false
    },
    {
      id: 'srikandi_pisces',
      name: 'Srikandi',
      zodiacSign: 'Pisces',
      description: 'Prajurit wanita yang intuitif dan bijaksana seperti Pisces',
      preview_url: '/avatars/srikandi.svg',
      unlocked: false
    },
    {
      id: 'gatotkaca_aries',
      name: 'Gatotkaca',
      zodiacSign: 'Aries',
      description: 'Ksatria langit dengan kekuatan luar biasa, mewakili semangat petarung Aries',
      preview_url: '/avatars/gatotkaca.svg',
      unlocked: false
    },
    {
      id: 'hanoman_gemini',
      name: 'Hanoman',
      zodiacSign: 'Gemini',
      description: 'Kera putih yang cerdik dan adaptif, mencerminkan dualitas Gemini',
      preview_url: '/avatars/hanoman.svg',
      unlocked: false
    },
    {
      id: 'kresna_libra',
      name: 'Kresna',
      zodiacSign: 'Libra',
      description: 'Penasehat bijak yang menjaga keseimbangan, selaras dengan keadilan Libra',
      preview_url: '/avatars/kresna.svg',
      unlocked: false
    },
    {
      id: 'antareja_scorpio',
      name: 'Antareja',
      zodiacSign: 'Scorpio',
      description: 'Ksatria dengan kekuatan racun mematikan, cocok dengan intensitas Scorpio',
      preview_url: '/avatars/antareja.svg',
      unlocked: false
    },
    {
      id: 'shinta_virgo',
      name: 'Shinta',
      zodiacSign: 'Virgo',
      description: 'Putri yang murni dan bijaksana, mewakili kesempurnaan Virgo',
      preview_url: '/avatars/shinta.svg',
      unlocked: false
    },
    {
      id: 'werkudara_taurus',
      name: 'Werkudara',
      zodiacSign: 'Taurus',
      description: 'Ksatria kuat dengan tekad membaja, mencerminkan ketangguhan Taurus',
      preview_url: '/avatars/werkudara.svg',
      unlocked: false
    }
  ]);

  const [selectedAvatar, setSelectedAvatar] = useState<WayangAvatar | null>(null);
  const [activeBonus, setActiveBonus] = useState<ZodiacBonus | null>(null);
  const { toast } = useToast();

  // Zodiac-specific bonuses
  const zodiacBonuses: Record<string, ZodiacBonus> = {
    Aries: {
      type: 'attack',
      value: 15,
      description: 'Meningkatkan kekuatan serangan pasukan sebesar 15%'
    },
    Taurus: {
      type: 'defense',
      value: 20,
      description: 'Meningkatkan pertahanan kerajaan sebesar 20%'
    },
    Gemini: {
      type: 'diplomacy',
      value: 25,
      description: 'Bonus 25% dalam negosiasi aliansi'
    },
    Cancer: {
      type: 'resource',
      value: 30,
      description: 'Meningkatkan produksi sumber daya sebesar 30%'
    },
    Leo: {
      type: 'attack',
      value: 25,
      description: 'Meningkatkan serangan pasukan elit sebesar 25%'
    },
    Virgo: {
      type: 'resource',
      value: 25,
      description: 'Efisiensi pengumpulan sumber daya meningkat 25%'
    },
    Libra: {
      type: 'diplomacy',
      value: 30,
      description: 'Bonus 30% dalam semua aktivitas diplomatik'
    },
    Scorpio: {
      type: 'attack',
      value: 20,
      description: 'Serangan beracun memberikan damage over time 20%'
    },
    Sagittarius: {
      type: 'attack',
      value: 25,
      description: 'Akurasi serangan jarak jauh meningkat 25%'
    },
    Capricorn: {
      type: 'defense',
      value: 25,
      description: 'Pertahanan bangunan meningkat 25%'
    },
    Aquarius: {
      type: 'resource',
      value: 20,
      description: 'Produksi teknologi meningkat 20%'
    },
    Pisces: {
      type: 'defense',
      value: 20,
      description: 'Regenerasi pertahanan meningkat 20%'
    }
  };

  useEffect(() => {
    loadUserAvatar();
    activateZodiacBonus();
  }, [userId, userZodiac]);

  const loadUserAvatar = async () => {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        const avatar = wayangAvatars.find(a => a.id === data.avatar_id);
        if (avatar) {
          setSelectedAvatar(avatar);
          if (onAvatarChange) onAvatarChange(avatar);
        }
      }

      // Update unlocked status
      const unlockedAvatars = data?.unlocked_avatars || [];
      setWayangAvatars(prev =>
        prev.map(avatar => ({
          ...avatar,
          unlocked: unlockedAvatars.includes(avatar.id)
        }))
      );
    } catch (err) {
      console.error('Error loading avatar:', err);
      toast({
        title: 'Error',
        description: 'Gagal memuat avatar',
        variant: 'destructive'
      });
    }
  };

  const activateZodiacBonus = () => {
    const bonus = zodiacBonuses[userZodiac];
    if (bonus) {
      setActiveBonus(bonus);
      if (onBonusActivate) onBonusActivate(bonus);
      
      toast({
        title: 'Bonus Zodiak Aktif',
        description: bonus.description
      });
    }
  };

  const selectAvatar = async (avatar: WayangAvatar) => {
    if (!avatar.unlocked) {
      toast({
        title: 'Avatar Terkunci',
        description: 'Selesaikan misi untuk membuka avatar ini',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_avatars')
        .upsert({
          user_id: userId,
          avatar_id: avatar.id,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedAvatar(avatar);
      if (onAvatarChange) onAvatarChange(avatar);
      
      toast({
        title: 'Avatar Diperbarui',
        description: `Avatar ${avatar.name} telah dipilih`
      });
    } catch (err) {
      console.error('Error selecting avatar:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui avatar',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Selection Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <h3 className="text-xl font-semibold mb-4">Avatar Wayang</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wayangAvatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              className={`p-4 rounded-lg ${avatar.unlocked ? 'bg-cosmic-dark/40' : 'bg-cosmic-dark/20'} 
                border border-cosmic-light-purple/30 cursor-pointer
                ${selectedAvatar?.id === avatar.id ? 'ring-2 ring-cosmic-light-purple' : ''}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => selectAvatar(avatar)}
            >
              <img
                src={avatar.preview_url}
                alt={avatar.name}
                className={`w-full h-48 object-cover rounded mb-4 
                  ${!avatar.unlocked ? 'filter grayscale opacity-50' : ''}`}
              />
              <h4 className="font-semibold mb-2">{avatar.name}</h4>
              <p className="text-sm text-gray-400 mb-2">{avatar.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-cosmic-light-purple">{avatar.zodiacSign}</span>
                {!avatar.unlocked && (
                  <span className="text-sm text-gray-500">
                    🔒 Terkunci
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Bonus Section */}
      {activeBonus && (
        <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
          <h3 className="text-xl font-semibold mb-4">Bonus Zodiak Aktif</h3>
          <div className="p-4 rounded-lg bg-cosmic-dark/40 border border-cosmic-light-purple/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-cosmic-light-purple">
                {userZodiac}
              </span>
              <span className="text-sm bg-cosmic-light-purple/20 px-3 py-1 rounded">
                +{activeBonus.value}% {activeBonus.type}
              </span>
            </div>
            <p className="text-sm text-gray-400">{activeBonus.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZodiacPersonalization;