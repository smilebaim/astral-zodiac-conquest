import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'battle' | 'resource' | 'council' | 'research' | 'special' | 'zodiac' | 'exploration' | 'social';
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  rewards: {
    stardust?: number;
    celestial_ore?: number;
    ether?: number;
    power?: number;
    special_item?: string;
    title?: string;
  };
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements?: {
    type: string;
    value: number;
    description: string;
  }[];
}

interface AchievementSystemProps {
  userId: string;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'progress' | 'rarity' | 'category'>('progress');

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!inner(
            progress,
            completed,
            unlocked_at
          )
        `)
        .eq('user_achievements.user_id', userId);

      if (error) throw error;

      const processedAchievements = data.map(achievement => ({
        ...achievement,
        progress: achievement.user_achievements[0].progress,
        completed: achievement.user_achievements[0].completed,
        unlockedAt: achievement.user_achievements[0].unlocked_at,
      }));

      setAchievements(processedAchievements);
    } catch (err) {
      setError('Failed to fetch achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (achievementId: string) => {
    try {
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement || !achievement.completed) return;

      // Start a transaction
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('resources, power, inventory')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Update user resources, power, and inventory
      const updates: any = {
        resources: {
          stardust: (userData.resources.stardust || 0) + (achievement.rewards.stardust || 0),
          celestial_ore: (userData.resources.celestial_ore || 0) + (achievement.rewards.celestial_ore || 0),
          ether: (userData.resources.ether || 0) + (achievement.rewards.ether || 0),
        },
        power: (userData.power || 0) + (achievement.rewards.power || 0),
      };

      // Add special item to inventory if present
      if (achievement.rewards.special_item) {
        updates.inventory = [...(userData.inventory || []), achievement.rewards.special_item];
      }

      // Update user title if present
      if (achievement.rewards.title) {
        updates.title = achievement.rewards.title;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Mark achievement as claimed
      const { error: claimError } = await supabase
        .from('user_achievements')
        .update({ claimed: true })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);

      if (claimError) throw claimError;

      // Refresh achievements
      fetchAchievements();
    } catch (err) {
      console.error('Error claiming achievement reward:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'battle':
        return '⚔️';
      case 'resource':
        return '💎';
      case 'council':
        return '👥';
      case 'research':
        return '🔬';
      case 'special':
        return '🌟';
      case 'zodiac':
        return '♈';
      case 'exploration':
        return '🌌';
      case 'social':
        return '💬';
      default:
        return '📜';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-purple-400';
      case 'rare':
        return 'text-blue-400';
      case 'common':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '⭐';
      case 'epic':
        return '✨';
      case 'rare':
        return '💫';
      case 'common':
        return '🌟';
      default:
        return '✨';
    }
  };

  const filteredAchievements = achievements
    .filter(achievement => {
      const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
      const matchesUnlockedFilter = !showUnlockedOnly || achievement.completed;
      const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
      return matchesCategory && matchesUnlockedFilter && matchesRarity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress / b.maxProgress) - (a.progress / a.maxProgress);
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-cosmic-light-purple font-bold">Achievements</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="rounded border-cosmic-purple/40 text-cosmic-purple focus:ring-cosmic-purple"
              />
              Show unlocked only
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === 'all'
                ? 'bg-cosmic-purple text-white'
                : 'bg-cosmic-dark/50 text-slate-400'
            }`}
          >
            All Categories
          </motion.button>
          {['battle', 'resource', 'council', 'research', 'special', 'zodiac', 'exploration', 'social'].map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400'
              }`}
            >
              <span>{getCategoryIcon(category)}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRarity('all')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedRarity === 'all'
                ? 'bg-cosmic-purple text-white'
                : 'bg-cosmic-dark/50 text-slate-400'
            }`}
          >
            All Rarities
          </motion.button>
          {['common', 'rare', 'epic', 'legendary'].map(rarity => (
            <motion.button
              key={rarity}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
                selectedRarity === rarity
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400'
              }`}
            >
              <span className={getRarityColor(rarity)}>{getRarityIcon(rarity)}</span>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-1 text-sm text-white"
          >
            <option value="progress">Sort by Progress</option>
            <option value="rarity">Sort by Rarity</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredAchievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-lg border ${
                    achievement.completed
                      ? 'bg-cosmic-purple/20 border-cosmic-purple/40'
                      : 'bg-cosmic-dark/50 border-cosmic-purple/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className={`text-center mt-1 ${getRarityColor(achievement.rarity)}`}>
                        {getRarityIcon(achievement.rarity)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {achievement.name}
                        </h3>
                        {achievement.completed && (
                          <span className="text-cosmic-gold">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {achievement.description}
                      </p>
                      {achievement.requirements && (
                        <div className="mt-2 space-y-1">
                          {achievement.requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-slate-500">
                              <span>•</span>
                              <span>{req.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2">
                        <div className="h-2 bg-cosmic-dark/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            className={`h-full ${
                              achievement.completed
                                ? 'bg-cosmic-gold'
                                : 'bg-cosmic-purple'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>{achievement.progress}</span>
                          <span>{achievement.maxProgress}</span>
                        </div>
                      </div>
                      {achievement.completed && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2 text-sm">
                            {achievement.rewards.stardust && (
                              <span className="text-yellow-400">
                                +{achievement.rewards.stardust} Stardust
                              </span>
                            )}
                            {achievement.rewards.celestial_ore && (
                              <span className="text-blue-400">
                                +{achievement.rewards.celestial_ore} Celestial Ore
                              </span>
                            )}
                            {achievement.rewards.ether && (
                              <span className="text-purple-400">
                                +{achievement.rewards.ether} Ether
                              </span>
                            )}
                            {achievement.rewards.power && (
                              <span className="text-red-400">
                                +{achievement.rewards.power} Power
                              </span>
                            )}
                            {achievement.rewards.special_item && (
                              <span className="text-cosmic-gold">
                                +{achievement.rewards.special_item}
                              </span>
                            )}
                            {achievement.rewards.title && (
                              <span className="text-cosmic-light-purple">
                                +{achievement.rewards.title} Title
                              </span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => claimReward(achievement.id)}
                            className="mt-2 cosmic-button text-sm"
                          >
                            Claim Rewards
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementSystem; 