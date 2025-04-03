import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface PlayerRanking {
  id: string;
  name: string;
  zodiac: string;
  council?: string;
  rank: number;
  points: number;
  stats: {
    battles: {
      won: number;
      total: number;
    };
    territories: number;
    power: number;
    achievements: number;
  };
  recent_activity: {
    type: string;
    timestamp: string;
  };
}

interface LeaderboardSystemProps {
  userId: string;
}

const LeaderboardSystem: React.FC<LeaderboardSystemProps> = ({ userId }) => {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'battles' | 'territories' | 'power' | 'achievements'>('overall');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<PlayerRanking | null>(null);

  useEffect(() => {
    fetchRankings();
    subscribeToRankingUpdates();
  }, [selectedCategory, timeFrame]);

  const fetchRankings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('player_rankings')
        .select('*')
        .order('points', { ascending: false })
        .limit(100);

      if (timeFrame !== 'all') {
        const startDate = new Date();
        switch (timeFrame) {
          case 'daily':
            startDate.setDate(startDate.getDate() - 1);
            break;
          case 'weekly':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'monthly':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        }
        query = query.gte('last_updated', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process and sort rankings based on selected category
      const processedRankings = data.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      setRankings(processedRankings);

      // Find user's rank
      const userRanking = processedRankings.find(player => player.id === userId);
      setUserRank(userRanking || null);
    } catch (err) {
      setError('Failed to fetch rankings');
      console.error('Error fetching rankings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToRankingUpdates = () => {
    const channel = supabase
      .channel('ranking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_rankings',
        },
        (payload) => {
          fetchRankings();
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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'overall':
        return '🏆';
      case 'battles':
        return '⚔️';
      case 'territories':
        return '🌍';
      case 'power':
        return '⚡';
      case 'achievements':
        return '🌟';
      default:
        return '📊';
    }
  };

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-cosmic-light-purple font-bold">Leaderboard</h2>
          <div className="flex items-center gap-4">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as any)}
              className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded px-3 py-1 text-sm text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['overall', 'battles', 'territories', 'power', 'achievements'].map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category as any)}
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 Players */}
            <div className="grid grid-cols-3 gap-4">
              {rankings.slice(0, 3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    index === 0
                      ? 'bg-yellow-900/30 border-yellow-500/40'
                      : index === 1
                      ? 'bg-gray-900/30 border-gray-500/40'
                      : 'bg-amber-900/30 border-amber-500/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getZodiacIcon(player.zodiac)}
                    </div>
                    <div className={`text-lg font-bold ${getZodiacColor(player.zodiac)}`}>
                      {player.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      Rank #{player.rank}
                    </div>
                    <div className="text-sm text-cosmic-gold mt-2">
                      {player.points} points
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rankings List */}
            <div className="space-y-2">
              {rankings.slice(3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    player.id === userId
                      ? 'bg-cosmic-purple/20 border-cosmic-purple/40'
                      : 'bg-cosmic-dark/50 border-cosmic-purple/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold ${getRankColor(player.rank)}`}>
                      #{player.rank}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${getZodiacColor(player.zodiac)}`}>
                        {getZodiacIcon(player.zodiac)}
                      </span>
                      <span className="font-semibold text-white">{player.name}</span>
                    </div>
                    {player.council && (
                      <div className="text-sm text-slate-400">
                        {player.council}
                      </div>
                    )}
                    <div className="ml-auto text-right">
                      <div className="text-cosmic-gold">
                        {player.points} points
                      </div>
                      <div className="text-xs text-slate-400">
                        {player.stats.battles.won}/{player.stats.battles.total} battles
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* User's Rank */}
            {userRank && userRank.rank > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg border border-cosmic-purple/40 bg-cosmic-purple/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-cosmic-gold">
                      Your Rank: #{userRank.rank}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${getZodiacColor(userRank.zodiac)}`}>
                        {getZodiacIcon(userRank.zodiac)}
                      </span>
                      <span className="font-semibold text-white">{userRank.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cosmic-gold">
                      {userRank.points} points
                    </div>
                    <div className="text-xs text-slate-400">
                      {userRank.stats.battles.won}/{userRank.stats.battles.total} battles
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardSystem; 