import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  battles: {
    total: number;
    won: number;
    lost: number;
    draw: number;
  };
  resources: {
    stardust: number;
    celestial_ore: number;
    ether: number;
  };
  territories: {
    total: number;
    controlled: number;
    contested: number;
  };
  achievements: {
    total: number;
    completed: number;
    in_progress: number;
  };
  power: {
    military: number;
    economic: number;
    technological: number;
    diplomatic: number;
  };
  rank: {
    current: number;
    highest: number;
    points: number;
  };
}

interface PlayerProfile {
  id: string;
  name: string;
  zodiac: string;
  level: number;
  experience: number;
  council?: {
    name: string;
    role: string;
  };
  stats: PlayerStats;
  achievements: {
    id: string;
    name: string;
    description: string;
    category: string;
    progress: number;
    completed: boolean;
    reward: {
      type: string;
      amount: number;
    };
  }[];
  recent_activity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

interface PlayerProfileProps {
  userId: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  useEffect(() => {
    fetchPlayerProfile();
    subscribeToProfileUpdates();
  }, [userId]);

  const fetchPlayerProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select(`
          *,
          stats:player_stats(*),
          achievements:player_achievements(*),
          recent_activity:player_activity(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      setError('Failed to fetch player profile');
      console.error('Error fetching player profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToProfileUpdates = () => {
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          fetchPlayerProfile();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const getZodiacIcon = (zodiac: string) => {
    const icons: { [key: string]: string } = {
      aries: '♈',
      taurus: '♉',
      gemini: '♊',
      cancer: '♋',
      leo: '♌',
      virgo: '♍',
      libra: '♎',
      scorpio: '♏',
      sagittarius: '♐',
      capricorn: '♑',
      aquarius: '♒',
      pisces: '♓',
    };
    return icons[zodiac.toLowerCase()] || '✨';
  };

  const getZodiacColor = (zodiac: string) => {
    const colors: { [key: string]: string } = {
      aries: 'text-red-500',
      taurus: 'text-green-500',
      gemini: 'text-yellow-500',
      cancer: 'text-blue-500',
      leo: 'text-orange-500',
      virgo: 'text-purple-500',
      libra: 'text-pink-500',
      scorpio: 'text-red-700',
      sagittarius: 'text-purple-700',
      capricorn: 'text-gray-700',
      aquarius: 'text-blue-700',
      pisces: 'text-indigo-500',
    };
    return colors[zodiac.toLowerCase()] || 'text-white';
  };

  const getAchievementIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      battle: '⚔️',
      resource: '💎',
      council: '👥',
      research: '🔬',
      special: '🌟',
      zodiac: '✨',
      exploration: '🌌',
      social: '💬',
    };
    return icons[category.toLowerCase()] || '🏆';
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      battle: '⚔️',
      resource: '💎',
      council: '👥',
      research: '🔬',
      achievement: '🏆',
      level_up: '⭐',
      territory: '🌍',
    };
    return icons[type.toLowerCase()] || '📝';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-dark p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl">
              {getZodiacIcon(profile.zodiac)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <span className={`text-xl ${getZodiacColor(profile.zodiac)}`}>
                  {profile.zodiac.charAt(0).toUpperCase() + profile.zodiac.slice(1)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-slate-400">
                <div>Level {profile.level}</div>
                <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cosmic-purple"
                    style={{ width: `${(profile.experience / 1000) * 100}%` }}
                  ></div>
                </div>
                <div>{profile.experience}/1000 XP</div>
              </div>
              {profile.council && (
                <div className="mt-2 text-slate-400">
                  {profile.council.role} of {profile.council.name}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cosmic-gold">
                Rank #{profile.stats.rank.current}
              </div>
              <div className="text-sm text-slate-400">
                Highest: #{profile.stats.rank.highest}
              </div>
              <div className="text-sm text-slate-400">
                {profile.stats.rank.points} points
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'achievements', 'activity'].map(tab => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Battle Stats */}
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <h2 className="text-xl font-semibold text-cosmic-light-purple mb-4">Battle Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Battles</span>
                      <span className="text-white">{profile.stats.battles.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Victories</span>
                      <span className="text-white">{profile.stats.battles.won}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">Defeats</span>
                      <span className="text-white">{profile.stats.battles.lost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">Draws</span>
                      <span className="text-white">{profile.stats.battles.draw}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-white">
                        {((profile.stats.battles.won / profile.stats.battles.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <h2 className="text-xl font-semibold text-cosmic-light-purple mb-4">Resources</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400">💎</div>
                    <div className="text-sm text-slate-400">Stardust</div>
                    <div className="text-lg text-white">{profile.stats.resources.stardust}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-blue-400">⚡</div>
                    <div className="text-sm text-slate-400">Celestial Ore</div>
                    <div className="text-lg text-white">{profile.stats.resources.celestial_ore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-purple-400">✨</div>
                    <div className="text-sm text-slate-400">Ether</div>
                    <div className="text-lg text-white">{profile.stats.resources.ether}</div>
                  </div>
                </div>
              </div>

              {/* Territories */}
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <h2 className="text-xl font-semibold text-cosmic-light-purple mb-4">Territories</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-white">🌍</div>
                    <div className="text-sm text-slate-400">Total</div>
                    <div className="text-lg text-white">{profile.stats.territories.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-green-400">🎯</div>
                    <div className="text-sm text-slate-400">Controlled</div>
                    <div className="text-lg text-white">{profile.stats.territories.controlled}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400">⚔️</div>
                    <div className="text-sm text-slate-400">Contested</div>
                    <div className="text-lg text-white">{profile.stats.territories.contested}</div>
                  </div>
                </div>
              </div>

              {/* Power Stats */}
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <h2 className="text-xl font-semibold text-cosmic-light-purple mb-4">Power Statistics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Military Power</span>
                      <span className="text-white">{profile.stats.power.military}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(profile.stats.power.military / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Economic Power</span>
                      <span className="text-white">{profile.stats.power.economic}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(profile.stats.power.economic / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-400">Technological Power</span>
                      <span className="text-white">{profile.stats.power.technological}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(profile.stats.power.technological / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-400">Diplomatic Power</span>
                      <span className="text-white">{profile.stats.power.diplomatic}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${(profile.stats.power.diplomatic / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-cosmic-light-purple">Achievements</h2>
                  <div className="text-sm text-slate-400">
                    {profile.stats.achievements.completed}/{profile.stats.achievements.total} Completed
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map(achievement => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border ${
                        achievement.completed
                          ? 'border-cosmic-gold/40 bg-cosmic-gold/10'
                          : 'border-cosmic-purple/40 bg-cosmic-dark/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getAchievementIcon(achievement.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{achievement.name}</h3>
                            {achievement.completed && (
                              <span className="text-cosmic-gold">✓</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {achievement.description}
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  achievement.completed ? 'bg-cosmic-gold' : 'bg-cosmic-purple'
                                }`}
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Reward: {achievement.reward.amount} {achievement.reward.type}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
                <h2 className="text-xl font-semibold text-cosmic-light-purple mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {profile.recent_activity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-cosmic-dark/50"
                    >
                      <div className="text-xl">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlayerProfile; 