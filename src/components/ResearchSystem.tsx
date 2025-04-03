import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Technology {
  id: string;
  name: string;
  description: string;
  category: 'military' | 'economic' | 'scientific' | 'mystical';
  level: number;
  max_level: number;
  requirements: {
    technology_id: string;
    level: number;
  }[];
  costs: {
    stardust: number;
    celestial_ore: number;
    ether: number;
    time: number;
  };
  bonuses: {
    type: 'unit' | 'resource' | 'building' | 'research' | 'special';
    target: string;
    value: number;
    description: string;
  }[];
  icon: string;
  color: string;
}

interface ResearchProgress {
  id: string;
  technology_id: string;
  start_time: string;
  end_time: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  current_level: number;
  target_level: number;
}

interface ResearchSystemProps {
  userId: string;
}

const ResearchSystem: React.FC<ResearchSystemProps> = ({ userId }) => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Technology['category']>('military');
  const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerResources, setPlayerResources] = useState({
    stardust: 0,
    celestial_ore: 0,
    ether: 0
  });

  useEffect(() => {
    fetchTechnologies();
    fetchResearchProgress();
    fetchPlayerResources();
    subscribeToResearchUpdates();
  }, [userId]);

  const fetchTechnologies = async () => {
    try {
      const { data, error } = await supabase
        .from('technologies')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTechnologies(data || []);
    } catch (err) {
      setError('Failed to fetch technologies');
      console.error('Error fetching technologies:', err);
    }
  };

  const fetchResearchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('research_progress')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setResearchProgress(data || []);
    } catch (err) {
      setError('Failed to fetch research progress');
      console.error('Error fetching research progress:', err);
    }
  };

  const fetchPlayerResources = async () => {
    try {
      const { data, error } = await supabase
        .from('player_resources')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setPlayerResources(data.stats);
    } catch (err) {
      setError('Failed to fetch player resources');
      console.error('Error fetching player resources:', err);
    }
  };

  const subscribeToResearchUpdates = () => {
    const channel = supabase
      .channel('research-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setResearchProgress(prev => {
            const index = prev.findIndex(p => p.id === payload.new.id);
            if (index === -1) {
              return [payload.new, ...prev];
            }
            return prev.map(p => p.id === payload.new.id ? payload.new : p);
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const startResearch = async (technology: Technology) => {
    try {
      // Check if player has enough resources
      if (
        playerResources.stardust < technology.costs.stardust ||
        playerResources.celestial_ore < technology.costs.celestial_ore ||
        playerResources.ether < technology.costs.ether
      ) {
        setError('Insufficient resources for research');
        return;
      }

      // Check if research is already in progress
      const inProgress = researchProgress.some(
        progress => progress.technology_id === technology.id && progress.status === 'in_progress'
      );

      if (inProgress) {
        setError('Research already in progress');
        return;
      }

      // Create research progress entry
      const { data, error } = await supabase
        .from('research_progress')
        .insert([
          {
            user_id: userId,
            technology_id: technology.id,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + technology.costs.time * 1000).toISOString(),
            status: 'in_progress',
            current_level: technology.level,
            target_level: technology.level + 1
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update player resources
      await supabase
        .from('player_resources')
        .update({
          'stats.stardust': playerResources.stardust - technology.costs.stardust,
          'stats.celestial_ore': playerResources.celestial_ore - technology.costs.celestial_ore,
          'stats.ether': playerResources.ether - technology.costs.ether
        })
        .eq('user_id', userId);

      setResearchProgress(prev => [data, ...prev]);
      setPlayerResources(prev => ({
        stardust: prev.stardust - technology.costs.stardust,
        celestial_ore: prev.celestial_ore - technology.costs.celestial_ore,
        ether: prev.ether - technology.costs.ether
      }));
    } catch (err) {
      setError('Failed to start research');
      console.error('Error starting research:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'military':
        return '⚔️';
      case 'economic':
        return '💰';
      case 'scientific':
        return '🔬';
      case 'mystical':
        return '✨';
      default:
        return '📚';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'military':
        return 'text-red-500';
      case 'economic':
        return 'text-green-500';
      case 'scientific':
        return 'text-blue-500';
      case 'mystical':
        return 'text-purple-500';
      default:
        return 'text-white';
    }
  };

  const getProgressStatus = (progress: ResearchProgress) => {
    if (progress.status === 'completed') return 'Completed';
    if (progress.status === 'cancelled') return 'Cancelled';
    
    const now = new Date().getTime();
    const end = new Date(progress.end_time).getTime();
    const remaining = Math.max(0, end - now);
    
    if (remaining === 0) return 'Completed';
    return `${Math.ceil(remaining / 1000)}s remaining`;
  };

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-cosmic-light-purple font-bold">Research System</h2>
          <div className="flex items-center gap-4">
            <div className="text-yellow-500">⭐ {playerResources.stardust}</div>
            <div className="text-blue-500">💎 {playerResources.celestial_ore}</div>
            <div className="text-purple-500">✨ {playerResources.ether}</div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="flex gap-2">
          {['military', 'economic', 'scientific', 'mystical'].map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category as Technology['category'])}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400'
              }`}
            >
              <span className="mr-2">{getCategoryIcon(category)}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Technology List */}
            <div className="space-y-4">
              <h3 className="text-lg text-white font-semibold">Available Technologies</h3>
              <div className="space-y-2">
                {technologies
                  .filter(tech => tech.category === selectedCategory)
                  .map(technology => (
                    <motion.div
                      key={technology.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTechnology(technology)}
                      className={`bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4 cursor-pointer ${
                        selectedTechnology?.id === technology.id ? 'border-cosmic-purple' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{technology.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{technology.name}</div>
                          <div className="text-sm text-slate-400">Level {technology.level}/{technology.max_level}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{technology.description}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-yellow-500">⭐ {technology.costs.stardust}</div>
                        <div className="text-blue-500">💎 {technology.costs.celestial_ore}</div>
                        <div className="text-purple-500">✨ {technology.costs.ether}</div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Research Progress */}
            <div className="space-y-4">
              <h3 className="text-lg text-white font-semibold">Research Progress</h3>
              <div className="space-y-2">
                {researchProgress.map(progress => {
                  const technology = technologies.find(t => t.id === progress.technology_id);
                  if (!technology) return null;

                  return (
                    <motion.div
                      key={progress.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{technology.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{technology.name}</div>
                          <div className="text-sm text-slate-400">
                            Level {progress.current_level} → {progress.target_level}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        Status: {getProgressStatus(progress)}
                      </div>
                      <div className="mt-2 h-1 bg-cosmic-dark/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${getCategoryColor(technology.category)}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: progress.status === 'completed'
                              ? '100%'
                              : progress.status === 'cancelled'
                              ? '0%'
                              : `${((Date.now() - new Date(progress.start_time).getTime()) / (new Date(progress.end_time).getTime() - new Date(progress.start_time).getTime())) * 100}%`
                          }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Technology Details */}
            {selectedTechnology && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg text-white font-semibold">Technology Details</h3>
                <div className="bg-cosmic-dark/50 border border-cosmic-purple/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{selectedTechnology.icon}</span>
                    <div>
                      <div className="font-semibold text-white text-xl">{selectedTechnology.name}</div>
                      <div className="text-sm text-slate-400">Level {selectedTechnology.level}/{selectedTechnology.max_level}</div>
                    </div>
                  </div>
                  <div className="text-slate-300 mb-4">{selectedTechnology.description}</div>
                  
                  {/* Requirements */}
                  {selectedTechnology.requirements.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-slate-400 mb-2">Requirements:</div>
                      <div className="space-y-2">
                        {selectedTechnology.requirements.map(req => {
                          const reqTech = technologies.find(t => t.id === req.technology_id);
                          return (
                            <div key={req.technology_id} className="flex items-center gap-2">
                              <span className="text-2xl">{reqTech?.icon}</span>
                              <div>
                                <div className="text-sm text-white">{reqTech?.name}</div>
                                <div className="text-xs text-slate-400">Level {req.level}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Costs */}
                  <div className="mb-4">
                    <div className="text-sm text-slate-400 mb-2">Research Costs:</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-yellow-500">⭐ {selectedTechnology.costs.stardust}</div>
                        <div className="text-xs text-slate-400">Stardust</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-500">💎 {selectedTechnology.costs.celestial_ore}</div>
                        <div className="text-xs text-slate-400">Celestial Ore</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-500">✨ {selectedTechnology.costs.ether}</div>
                        <div className="text-xs text-slate-400">Ether</div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-slate-400">⏱️ {selectedTechnology.costs.time}s</div>
                      <div className="text-xs text-slate-400">Research Time</div>
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Technology Bonuses:</div>
                    <div className="space-y-2">
                      {selectedTechnology.bonuses.map((bonus, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={`text-lg ${getCategoryColor(selectedTechnology.category)}`}>
                            {bonus.type === 'unit' ? '⚔️' : bonus.type === 'resource' ? '💰' : bonus.type === 'building' ? '🏗️' : bonus.type === 'research' ? '🔬' : '✨'}
                          </span>
                          <div>
                            <div className="text-sm text-white">{bonus.description}</div>
                            <div className="text-xs text-slate-400">+{bonus.value}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Start Research Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startResearch(selectedTechnology)}
                    className="w-full mt-4 px-4 py-2 bg-cosmic-purple text-white rounded-lg font-semibold"
                  >
                    Start Research
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchSystem; 