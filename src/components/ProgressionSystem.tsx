import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
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
    type: 'resource' | 'unit' | 'technology' | 'special_ability' | 'cosmetic';
    value: number;
    target: string;
  }[];
  progress: number;
  completed: boolean;
  completion_date?: string;
}

interface PlayerLevel {
  current: number;
  experience: number;
  next_level_threshold: number;
  perks: {
    type: 'resource_capacity' | 'unit_capacity' | 'building_slots' | 'special_ability';
    value: number;
    description: string;
  }[];
}

interface AstralCycleData {
  currentSeason: number;
  seasonStartDate: Date;
  seasonEndDate: Date;
  starFragments: number;
  seasonalRewards: {
    type: 'skin' | 'boost';
    id: string;
    cost: number;
    purchased: boolean;
  }[];
}

interface PrestigeData {
  level: number;
  experience: number;
  nextLevelThreshold: number;
  passiveBonus: {
    type: 'research_speed' | 'resource_production' | 'unit_training' | 'battle_power';
    value: number;
    description: string;
  }[];
}

interface QuestStep {
  id: string;
  description: string;
  completed: boolean;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'side' | 'daily' | 'weekly' | 'event';
  steps: QuestStep[];
  rewards: {
    type: 'resource' | 'unit' | 'technology' | 'special_ability' | 'cosmetic' | 'experience';
    value: number;
    target: string;
  }[];
  deadline?: string;
  progress: number;
  completed: boolean;
  active: boolean;
}

interface ProgressionSystemProps {
  userId: string;
  userZodiac: string;
}

const ProgressionSystem: React.FC<ProgressionSystemProps> = ({ userId, userZodiac }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [playerLevel, setPlayerLevel] = useState<PlayerLevel>({
    current: 1,
    experience: 0,
    next_level_threshold: 1000,
    perks: [],
  });
  const [activeTab, setActiveTab] = useState<'achievements' | 'quests' | 'level' | 'astral-cycle' | 'prestige'>('achievements');
  const [astralCycle, setAstralCycle] = useState<AstralCycleData | null>(null);
  const [prestige, setPrestige] = useState<PrestigeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgressionData();
  }, [userId]);

  const fetchProgressionData = async () => {
    setIsLoading(true);
    try {
      // Fetch Astral Cycle data
      const { data: astralData, error: astralError } = await supabase
        .from('player_progression')
        .select('astral_cycle')
        .eq('player_id', userId)
        .single();

      if (astralError) throw astralError;

      // Fetch Prestige data
      const { data: prestigeData, error: prestigeError } = await supabase
        .from('player_progression')
        .select('prestige')
        .eq('player_id', userId)
        .single();

      if (prestigeError) throw prestigeError;
      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*, player_achievements!inner(*)')
        .eq('player_achievements.player_id', userId);

      if (achievementsError) throw achievementsError;

      // Fetch quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*, player_quests!inner(*)')
        .eq('player_quests.player_id', userId);

      if (questsError) throw questsError;

      // Fetch player level
      const { data: levelData, error: levelError } = await supabase
        .from('player_profiles')
        .select('level, experience, perks')
        .eq('id', userId)
        .single();

      if (levelError) throw levelError;

      // Transform and set data
      setAchievements(achievementsData || []);
      setQuests(questsData || []);
      if (levelData) {
        setPlayerLevel({
          current: levelData.level,
          experience: levelData.experience,
          next_level_threshold: calculateNextLevelThreshold(levelData.level),
          perks: levelData.perks || [],
        });
      }

      if (astralData?.astral_cycle) {
        setAstralCycle(astralData.astral_cycle);
      }

      if (prestigeData?.prestige) {
        setPrestige(prestigeData.prestige);
      }
    } catch (error) {
      console.error('Error fetching progression data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load progression data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextLevelThreshold = (level: number): number => {
    // Exponential level scaling formula
    return Math.floor(1000 * Math.pow(1.5, level - 1));
  };

  const calculateExperiencePercentage = (): number => {
    return (playerLevel.experience / playerLevel.next_level_threshold) * 100;
  };

  const renderAchievements = () => {
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<Achievement['category'], Achievement[]>);

    const renderAstralCycle = () => {
    if (!astralCycle) return null;

    const remainingTime = new Date(astralCycle.seasonEndDate).getTime() - new Date().getTime();
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
          <h3 className="text-xl font-semibold mb-4">Astral Cycle - Season {astralCycle.currentSeason}</h3>
          <div className="mb-4">
            <p className="text-gray-400">Sisa Waktu Musim: {days}d {hours}h</p>
            <p className="text-cosmic-light-purple">Star Fragments: {astralCycle.starFragments}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {astralCycle.seasonalRewards.map((reward) => (
              <motion.div
                key={reward.id}
                className={`p-4 rounded-lg border ${reward.purchased ? 'border-green-500' : 'border-cosmic-light-purple'} bg-cosmic-dark/40`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{reward.type === 'skin' ? 'Seasonal Skin' : 'Seasonal Boost'}</h4>
                    <p className="text-sm text-gray-400">Cost: {reward.cost} Star Fragments</p>
                  </div>
                  {!reward.purchased && (
                    <button
                      className="px-4 py-2 rounded bg-cosmic-light-purple/20 hover:bg-cosmic-light-purple/30 disabled:opacity-50"
                      disabled={astralCycle.starFragments < reward.cost}
                      onClick={() => handlePurchaseReward(reward.id)}
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPrestige = () => {
    if (!prestige) return null;

    const progressPercentage = (prestige.experience / prestige.nextLevelThreshold) * 100;

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
          <h3 className="text-xl font-semibold mb-4">Prestige Level {prestige.level}</h3>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Experience: {prestige.experience}</span>
              <span>{prestige.nextLevelThreshold}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-cosmic-light-purple h-2 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Passive Bonuses:</h4>
            {prestige.passiveBonus.map((bonus, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded bg-cosmic-dark/40">
                <span>{bonus.description}</span>
                <span className="text-cosmic-light-purple">+{bonus.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handlePurchaseReward = async (rewardId: string) => {
    try {
      const { data, error } = await supabase.rpc('purchase_seasonal_reward', {
        p_player_id: userId,
        p_reward_id: rewardId
      });

      if (error) throw error;

      // Refresh data after purchase
      fetchProgressionData();

      toast({
        title: 'Success',
        description: 'Reward purchased successfully!',
      });
    } catch (error) {
      console.error('Error purchasing reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to purchase reward. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'achievements' ? 'bg-cosmic-light-purple' : 'bg-cosmic-dark/40'}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'quests' ? 'bg-cosmic-light-purple' : 'bg-cosmic-dark/40'}`}
            onClick={() => setActiveTab('quests')}
          >
            Quests
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'level' ? 'bg-cosmic-light-purple' : 'bg-cosmic-dark/40'}`}
            onClick={() => setActiveTab('level')}
          >
            Level
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'astral-cycle' ? 'bg-cosmic-light-purple' : 'bg-cosmic-dark/40'}`}
            onClick={() => setActiveTab('astral-cycle')}
          >
            Astral Cycle
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'prestige' ? 'bg-cosmic-light-purple' : 'bg-cosmic-dark/40'}`}
            onClick={() => setActiveTab('prestige')}
          >
            Prestige
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'quests' && renderQuests()}
            {activeTab === 'level' && renderLevel()}
            {activeTab === 'astral-cycle' && renderAstralCycle()}
            {activeTab === 'prestige' && renderPrestige()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderAchievements = () => {
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<Achievement['category'], Achievement[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize">{category} Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${achievement.completed ? 'border-cosmic-light-purple bg-cosmic-dark/60' : 'border-gray-700 bg-cosmic-dark/30'}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievement.completed ? 'bg-cosmic-light-purple/20' : 'bg-gray-800'}`}>
                      <span className="text-xl">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-cosmic-light-purple h-2 rounded-full"
                          style={{ width: `${(achievement.progress * 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400 flex justify-between">
                        <span>{Math.floor(achievement.progress * 100)}%</span>
                        {achievement.completed && (
                          <span>Completed {new Date(achievement.completion_date || '').toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuests = () => {
    const activeQuests = quests.filter(quest => quest.active && !quest.completed);
    const completedQuests = quests.filter(quest => quest.completed);

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Active Quests</h3>
          {activeQuests.length === 0 ? (
            <p className="text-gray-400">No active quests. Complete current quests to unlock more.</p>
          ) : (
            <div className="space-y-4">
              {activeQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  className="p-4 rounded-lg border border-gray-700 bg-cosmic-dark/30"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{quest.name}</h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-cosmic-dark">{quest.category}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                    </div>
                    {quest.deadline && (
                      <div className="text-xs text-gray-400">
                        Expires: {new Date(quest.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {quest.steps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-cosmic-light-purple' : 'bg-gray-700'}`} />
                        <span className={`text-sm ${step.completed ? 'line-through text-gray-400' : 'text-gray-300'}`}>
                          {step.description}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-cosmic-light-purple h-2 rounded-full"
                        style={{ width: `${quest.progress * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {Math.floor(quest.progress * 100)}% completed
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <h5 className="text-sm font-medium mb-2">Rewards:</h5>
                    <div className="flex flex-wrap gap-2">
                      {quest.rewards.map((reward, index) => (
                        <div key={index} className="px-2 py-1 text-xs rounded bg-cosmic-dark flex items-center space-x-1">
                          <span>{reward.value}</span>
                          <span>{reward.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Completed Quests</h3>
          {completedQuests.length === 0 ? (
            <p className="text-gray-400">No completed quests yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  className="p-3 rounded-lg border border-cosmic-light-purple/30 bg-cosmic-dark/20"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{quest.name}</h4>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-cosmic-light-purple/20">{quest.category}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPlayerLevel = () => {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-cosmic-light-purple/30 bg-cosmic-dark/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Level {playerLevel.current}</h3>
              <p className="text-gray-400">Cosmic Influence</p>
            </div>
            <motion.div
              className="w-20 h-20 rounded-full bg-cosmic-dark flex items-center justify-center border-4 border-cosmic-light-purple"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-2xl font-bold">{playerLevel.current}</span>
            </motion.div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Experience</span>
              <span>{playerLevel.experience} / {playerLevel.next_level_threshold}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-cosmic-light-purple to-purple-500 h-3 rounded-full"
                style={{ width: `${calculateExperiencePercentage()}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${calculateExperiencePercentage()}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium mb-3">Level Perks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerLevel.perks.map((perk, index) => (
                <div key={index} className="p-3 rounded-lg bg-cosmic-dark/50 border border-gray-700">
                  <h5 className="font-medium capitalize">{perk.type.replace('_', ' ')}</h5>
                  <p className="text-sm text-gray-400">{perk.description}</p>
                  <div className="mt-2 text-cosmic-light-purple font-medium">+{perk.value}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium mb-3">Next Level Rewards</h4>
            <div className="p-4 rounded-lg bg-cosmic-dark border border-gray-700">
              <h5 className="font-medium">Level {playerLevel.current + 1}</h5>
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-cosmic-light-purple/30" />
                  <span>+10% Resource Storage Capacity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-cosmic-light-purple/30" />
                  <span>+5% Unit Training Speed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-cosmic-light-purple/30" />
                  <span>New Building Slot Unlocked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-cosmic-light-purple/30" />
                  <span>Access to Advanced Zodiac Abilities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cosmic-border p-6">
      <h2 className="text-2xl text-cosmic-light-purple mb-6">Player Progression</h2>

      <div className="flex space-x-1 mb-6 bg-cosmic-dark/30 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 rounded-md transition-colors ${activeTab === 'achievements' ? 'bg-cosmic-light-purple/20 text-cosmic-light-purple' : 'hover:bg-cosmic-dark/50'}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button
          className={`flex-1 py-2 rounded-md transition-colors ${activeTab === 'quests' ? 'bg-cosmic-light-purple/20 text-cosmic-light-purple' : 'hover:bg-cosmic-dark/50'}`}
          onClick={() => setActiveTab('quests')}
        >
          Quests
        </button>
        <button
          className={`flex-1 py-2 rounded-md transition-colors ${activeTab === 'level' ? 'bg-cosmic-light-purple/20 text-cosmic-light-purple' : 'hover:bg-cosmic-dark/50'}`}
          onClick={() => setActiveTab('level')}
        >
          Level
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-cosmic-light-purple/30 border-t-cosmic-light-purple rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'quests' && renderQuests()}
            {activeTab === 'level' && renderPlayerLevel()}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ProgressionSystem;