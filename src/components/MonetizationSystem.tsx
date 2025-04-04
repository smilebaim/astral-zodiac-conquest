import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  zodiacSign: string;
  type: 'armor_skin' | 'profile_border' | 'emote' | 'decorative_building';
  price: number;
  preview_url: string;
}

interface AstralPassTier {
  level: number;
  rewards: {
    free: CosmeticItem[];
    premium: CosmeticItem[];
  };
  requiredPoints: number;
}

interface MonetizationSystemProps {
  userId: string;
  userZodiac: string;
  onPurchase?: (item: CosmeticItem) => void;
}

const MonetizationSystem: React.FC<MonetizationSystemProps> = ({ userId, userZodiac, onPurchase }) => {
  const [ownedItems, setOwnedItems] = useState<CosmeticItem[]>([]);
  const [astralPassLevel, setAstralPassLevel] = useState(0);
  const [astralPassPoints, setAstralPassPoints] = useState(0);
  const [hasPremiumPass, setHasPremiumPass] = useState(false);
  const [hasStarterPack, setHasStarterPack] = useState(false);
  const { toast } = useToast();

  // Zodiac Cosmetics Configuration
  const zodiacCosmetics: CosmeticItem[] = [
    {
      id: 'sagittarius_royal_armor',
      name: 'Royal Archer Armor',
      description: 'Majestic armor set for Sagittarius troops with royal archer theme',
      zodiacSign: 'Sagittarius',
      type: 'armor_skin',
      price: 1000,
      preview_url: '/cosmetics/sagittarius_royal_armor.svg'
    },
    {
      id: 'pisces_aqua_armor',
      name: 'Aqua Kingdom Armor',
      description: 'Mystical water-themed armor set for Pisces troops',
      zodiacSign: 'Pisces',
      type: 'armor_skin',
      price: 1000,
      preview_url: '/cosmetics/pisces_aqua_armor.svg'
    }
  ];

  // Astral Pass Configuration
  const astralPassTiers: AstralPassTier[] = [
    {
      level: 1,
      rewards: {
        free: [{
          id: 'basic_emote_1',
          name: 'Victory Emote',
          description: 'Basic victory celebration emote',
          zodiacSign: 'all',
          type: 'emote',
          price: 0,
          preview_url: '/cosmetics/emotes/victory.svg'
        }],
        premium: [{
          id: 'premium_border_1',
          name: 'Celestial Border',
          description: 'Animated celestial border for your profile',
          zodiacSign: 'all',
          type: 'profile_border',
          price: 0,
          preview_url: '/cosmetics/borders/celestial.svg'
        }]
      },
      requiredPoints: 1000
    }
    // Add more tiers as needed
  ];

  // Starter Pack Configuration
  const starterPack = {
    price: 500,
    rewards: [
      {
        id: 'starter_stardust',
        amount: 500,
        type: 'currency'
      },
      {
        id: 'starter_building',
        name: 'Cosmic Fountain',
        description: 'A beautiful decorative fountain that emanates cosmic energy',
        zodiacSign: 'all',
        type: 'decorative_building',
        price: 0,
        preview_url: '/cosmetics/buildings/cosmic_fountain.svg'
      }
    ]
  };

  useEffect(() => {
    loadUserItems();
    loadAstralPassProgress();
    checkStarterPack();
  }, [userId]);

  const loadUserItems = async () => {
    try {
      const { data, error } = await supabase
        .from('user_items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setOwnedItems(data || []);
    } catch (err) {
      console.error('Error loading user items:', err);
      toast({
        title: 'Error',
        description: 'Gagal memuat item kosmetik',
        variant: 'destructive'
      });
    }
  };

  const loadAstralPassProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('astral_pass_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setAstralPassLevel(data.level);
        setAstralPassPoints(data.points);
        setHasPremiumPass(data.has_premium);
      }
    } catch (err) {
      console.error('Error loading Astral Pass progress:', err);
    }
  };

  const checkStarterPack = async () => {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'starter_pack')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setHasStarterPack(!!data);
    } catch (err) {
      console.error('Error checking starter pack:', err);
    }
  };

  const purchaseItem = async (item: CosmeticItem) => {
    try {
      // Here you would integrate with your payment system
      // For now, we'll simulate a successful purchase
      const { error } = await supabase
        .from('user_items')
        .insert([{
          user_id: userId,
          item_id: item.id,
          purchase_date: new Date().toISOString()
        }]);

      if (error) throw error;

      setOwnedItems([...ownedItems, item]);
      if (onPurchase) onPurchase(item);
      
      toast({
        title: 'Pembelian Berhasil',
        description: `${item.name} telah ditambahkan ke koleksi Anda!`,
      });
    } catch (err) {
      console.error('Error purchasing item:', err);
      toast({
        title: 'Error',
        description: 'Gagal melakukan pembelian',
        variant: 'destructive'
      });
    }
  };

  const purchaseAstralPass = async () => {
    try {
      // Here you would integrate with your payment system
      const { error } = await supabase
        .from('astral_pass_progress')
        .upsert({
          user_id: userId,
          has_premium: true,
          purchase_date: new Date().toISOString()
        });

      if (error) throw error;
      setHasPremiumPass(true);
      
      toast({
        title: 'Astral Pass Aktif!',
        description: 'Selamat! Anda telah mengaktifkan Astral Pass Premium!',
      });
    } catch (err) {
      console.error('Error purchasing Astral Pass:', err);
      toast({
        title: 'Error',
        description: 'Gagal membeli Astral Pass',
        variant: 'destructive'
      });
    }
  };

  const purchaseStarterPack = async () => {
    if (hasStarterPack) return;

    try {
      // Here you would integrate with your payment system
      const { error } = await supabase
        .from('user_purchases')
        .insert([{
          user_id: userId,
          type: 'starter_pack',
          purchase_date: new Date().toISOString()
        }]);

      if (error) throw error;
      setHasStarterPack(true);
      
      toast({
        title: 'Starter Pack Aktif!',
        description: 'Selamat! Anda telah mendapatkan Starter Pack!',
      });
    } catch (err) {
      console.error('Error purchasing Starter Pack:', err);
      toast({
        title: 'Error',
        description: 'Gagal membeli Starter Pack',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Zodiac Cosmetics Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <h3 className="text-xl font-semibold mb-4">Zodiac Cosmetics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zodiacCosmetics.map((item) => (
            <motion.div
              key={item.id}
              className="p-4 rounded-lg bg-cosmic-dark/40 border border-cosmic-light-purple/30"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={item.preview_url}
                alt={item.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h4 className="font-semibold mb-2">{item.name}</h4>
              <p className="text-sm text-gray-400 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span>{item.price} Stardust</span>
                <button
                  onClick={() => purchaseItem(item)}
                  className="px-4 py-2 rounded bg-cosmic-light-purple/20 hover:bg-cosmic-light-purple/30"
                  disabled={ownedItems.some(owned => owned.id === item.id)}
                >
                  {ownedItems.some(owned => owned.id === item.id) ? 'Dimiliki' : 'Beli'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Astral Pass Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Astral Pass</h3>
          {!hasPremiumPass && (
            <button
              onClick={purchaseAstralPass}
              className="px-6 py-2 rounded bg-cosmic-light-purple hover:bg-cosmic-light-purple/80"
            >
              Aktifkan Premium
            </button>
          )}
        </div>
        <div className="space-y-6">
          {astralPassTiers.map((tier) => (
            <div key={tier.level} className="p-4 rounded-lg bg-cosmic-dark/40">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Level {tier.level}</h4>
                <span>{astralPassPoints}/{tier.requiredPoints} XP</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold mb-2">Free Rewards</h5>
                  {tier.rewards.free.map((reward) => (
                    <div key={reward.id} className="p-2 rounded bg-cosmic-dark/20">
                      {reward.name}
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="text-sm font-semibold mb-2">Premium Rewards</h5>
                  {tier.rewards.premium.map((reward) => (
                    <div
                      key={reward.id}
                      className={`p-2 rounded ${hasPremiumPass ? 'bg-cosmic-light-purple/20' : 'bg-cosmic-dark/20 opacity-50'}`}
                    >
                      {reward.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter Pack Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <h3 className="text-xl font-semibold mb-4">Starter Pack</h3>
        {!hasStarterPack ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {starterPack.rewards.map((reward: any) => (
                <div key={reward.id} className="p-4 rounded-lg bg-cosmic-dark/40">
                  {reward.type === 'currency' ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-cosmic-light-purple">{reward.amount}</span>
                      <span>Stardust</span>
                    </div>
                  ) : (
                    <div>
                      <img
                        src={reward.preview_url}
                        alt={reward.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h4 className="font-semibold">{reward.name}</h4>
                      <p className="text-sm text-gray-400">{reward.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={purchaseStarterPack}
              className="w-full py-3 rounded bg-cosmic-light-purple hover:bg-cosmic-light-purple/80"
            >
              Beli Starter Pack ({starterPack.price} Stardust)
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Anda telah memiliki Starter Pack!</p>
        )}
      </div>
    </div>
  );
};

export default MonetizationSystem;