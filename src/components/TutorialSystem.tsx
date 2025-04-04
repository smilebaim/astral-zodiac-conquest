import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  image?: string;
  action?: {
    type: 'click' | 'hover' | 'input';
    target: string;
    value?: string;
  };
  tips?: string[];
}

interface TutorialSystemProps {
  userId: string;
  isNewUser: boolean;
}

const TutorialSystem: React.FC<TutorialSystemProps> = ({ userId, isNewUser }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (isNewUser) {
      fetchTutorialProgress();
      loadTutorialSteps();
    }
  }, [userId, isNewUser]);

  const fetchTutorialProgress = async () => {
    const { data, error } = await supabase
      .from('user_tutorials')
      .select('completed')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching tutorial progress:', error);
      return;
    }

    setIsCompleted(data?.completed || false);
    setIsVisible(!data?.completed);
  };

  const loadTutorialSteps = () => {
    const tutorialSteps: TutorialStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Astral Zodiac Conquest!',
        description: 'Let\'s get you started with your cosmic journey. We\'ll guide you through the basics of the game.',
        position: 'top',
        tips: [
          'Each zodiac sign has unique abilities and strengths',
          'Focus on resource management early in the game',
          'Join a council to gain allies and protection'
        ]
      },
      {
        id: 'zodiac-selection',
        title: 'Choose Your Zodiac',
        description: 'First, select your zodiac sign. Each sign has unique abilities and attributes that will shape your playstyle.',
        targetElement: '#zodiac-selection',
        position: 'bottom',
        tips: [
          'Fire signs excel in combat',
          'Earth signs are great at resource gathering',
          'Air signs have superior mobility',
          'Water signs are powerful in defense'
        ]
      },
      {
        id: 'resources',
        title: 'Resource Management',
        description: 'Manage your resources wisely. Stardust, Celestial Ore, and Ether are essential for your kingdom\'s growth.',
        targetElement: '#resource-bar',
        position: 'top',
        tips: [
          'Stardust is used for basic upgrades',
          'Celestial Ore is needed for advanced technologies',
          'Ether powers special abilities',
          'Balance resource collection with defense'
        ]
      },
      {
        id: 'battle-system',
        title: 'Combat System',
        description: 'Engage in epic battles with other players. Use your zodiac\'s unique abilities to gain the upper hand.',
        targetElement: '#battle-system',
        position: 'right',
        tips: [
          'Scout enemy territories before attacking',
          'Use terrain advantages in battle',
          'Coordinate attacks with council members',
          'Keep reserves for defense'
        ]
      },
      {
        id: 'council',
        title: 'Join a Council',
        description: 'Form alliances with other players by joining or creating a council. Work together to dominate the galaxy.',
        targetElement: '#council-system',
        position: 'left',
        tips: [
          'Active councils get resource bonuses',
          'Council members can share resources',
          'Coordinate council-wide attacks',
          'Protect council territories'
        ]
      },
      {
        id: 'research',
        title: 'Research & Development',
        description: 'Advance your kingdom through research. Unlock new technologies and strengthen your forces.',
        targetElement: '#research-system',
        position: 'bottom',
        tips: [
          'Focus on military research early',
          'Balance research with resource production',
          'Unlock special abilities for your zodiac',
          'Research council technologies together'
        ]
      },
      {
        id: 'achievements',
        title: 'Achievements',
        description: 'Complete various achievements to earn rewards and track your progress.',
        targetElement: '#achievement-system',
        position: 'right',
        tips: [
          'Daily achievements give consistent rewards',
          'Complete zodiac-specific achievements',
          'Council achievements provide group rewards',
          'Track progress in your profile'
        ]
      },
      {
        id: 'chat',
        title: 'Communication',
        description: 'Chat with other players, coordinate with your council, and make new allies.',
        targetElement: '#chat-system',
        position: 'left',
        tips: [
          'Use council chat for coordination',
          'Global chat for finding allies',
          'Private messages for diplomacy',
          'Report suspicious activity'
        ]
      },
      {
        id: 'galaxy-map',
        title: 'Galaxy Map',
        description: 'Explore and conquer the galaxy. Each region has unique resources and strategic value.',
        targetElement: '#galaxy-map',
        position: 'top',
        tips: [
          'Control resource-rich regions',
          'Establish defensive perimeters',
          'Plan expansion routes',
          'Watch for enemy movements'
        ]
      },
      {
        id: 'settings',
        title: 'Customize Your Experience',
        description: 'Adjust game settings to match your playstyle and preferences.',
        targetElement: '#settings-system',
        position: 'bottom',
        tips: [
          'Enable notifications for important events',
          'Customize your UI theme',
          'Set privacy preferences',
          'Configure auto-collection settings'
        ]
      }
    ];

    setSteps(tutorialSteps);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowTips(false);
    } else {
      await completeTutorial();
    }
  };

  const handleSkip = async () => {
    await completeTutorial();
  };

  const completeTutorial = async () => {
    const { error } = await supabase
      .from('user_tutorials')
      .upsert({
        user_id: userId,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error completing tutorial:', error);
      return;
    }

    setIsCompleted(true);
    setIsVisible(false);
  };

  const getTooltipPosition = (position: string) => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-4';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-4';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-4';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-4';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-4';
    }
  };

  const getArrowPosition = (position: string) => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full rotate-180';
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full';
      case 'left':
        return 'right-0 top-1/2 -translate-y-1/2 translate-x-full rotate-90';
      case 'right':
        return 'left-0 top-1/2 -translate-y-1/2 -translate-x-full -rotate-90';
      default:
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full rotate-180';
    }
  };

  if (!isVisible || isCompleted) return null;

  const currentTutorialStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {currentTutorialStep.targetElement && (
        <div
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          style={{
            clipPath: `inset(0 0 0 0)`,
          }}
        />
      )}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${getTooltipPosition(currentTutorialStep.position)} pointer-events-auto`}
        >
          <div className="relative bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6 max-w-sm">
            <div className={`absolute ${getArrowPosition(currentTutorialStep.position)} w-4 h-4 bg-cosmic-dark/90 border-r border-b border-cosmic-purple/40 transform`} />
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">🌟</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-cosmic-light-purple">
                  {currentTutorialStep.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  {currentTutorialStep.description}
                </p>
                {currentTutorialStep.image && (
                  <img
                    src={currentTutorialStep.image}
                    alt={currentTutorialStep.title}
                    className="mt-4 rounded-lg"
                  />
                )}
                {currentTutorialStep.tips && (
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTips(!showTips)}
                      className="text-sm text-cosmic-purple hover:text-cosmic-light-purple"
                    >
                      {showTips ? 'Hide Tips' : 'Show Tips'}
                    </motion.button>
                    <AnimatePresence>
                      {showTips && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-2"
                        >
                          {currentTutorialStep.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-cosmic-gold">•</span>
                              <span className="text-sm text-slate-300">{tip}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSkip}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                    >
                      Skip Tutorial
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="cosmic-button px-4 py-2 text-sm"
                    >
                      {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialSystem; 