import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ZodiacBonus {
  zodiacSign: string;
  month: number;
  bonusType: 'defense' | 'attack' | 'resource_production' | 'research_speed';
  bonusValue: number;
}

interface EclipseWarEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  participants: string[];
  resourceLosses: {
    playerId: string;
    resources: {
      type: string;
      amount: number;
    }[];
  }[];
}

interface EventSystemProps {
  userId: string;
  userZodiac: string;
  onBonusUpdate: (bonuses: { type: string; value: number }[]) => void;
}

const EventSystem: React.FC<EventSystemProps> = ({ userId, userZodiac, onBonusUpdate }) => {
  const [currentZodiacBonus, setCurrentZodiacBonus] = useState<ZodiacBonus | null>(null);
  const [eclipseWar, setEclipseWar] = useState<EclipseWarEvent | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const { toast } = useToast();

  // Zodiac Festival bonuses configuration
  const zodiacBonuses: ZodiacBonus[] = [
    { zodiacSign: 'Cancer', month: 6, bonusType: 'defense', bonusValue: 30 },
    { zodiacSign: 'Leo', month: 7, bonusType: 'attack', bonusValue: 30 },
    { zodiacSign: 'Virgo', month: 8, bonusType: 'research_speed', bonusValue: 30 },
    { zodiacSign: 'Libra', month: 9, bonusType: 'resource_production', bonusValue: 30 },
    { zodiacSign: 'Scorpio', month: 10, bonusType: 'attack', bonusValue: 30 },
    { zodiacSign: 'Sagittarius', month: 11, bonusType: 'defense', bonusValue: 30 },
    { zodiacSign: 'Capricorn', month: 0, bonusType: 'resource_production', bonusValue: 30 },
    { zodiacSign: 'Aquarius', month: 1, bonusType: 'research_speed', bonusValue: 30 },
    { zodiacSign: 'Pisces', month: 2, bonusType: 'defense', bonusValue: 30 },
    { zodiacSign: 'Aries', month: 3, bonusType: 'attack', bonusValue: 30 },
    { zodiacSign: 'Taurus', month: 4, bonusType: 'resource_production', bonusValue: 30 },
    { zodiacSign: 'Gemini', month: 5, bonusType: 'research_speed', bonusValue: 30 },
  ];

  useEffect(() => {
    checkCurrentZodiacBonus();
    subscribeToEclipseWarEvents();
    return () => {
      // Cleanup subscriptions
    };
  }, [userId, userZodiac]);

  const checkCurrentZodiacBonus = () => {
    const currentMonth = new Date().getMonth();
    const currentBonus = zodiacBonuses.find(bonus => bonus.month === currentMonth);
    if (currentBonus) {
      setCurrentZodiacBonus(currentBonus);
      if (currentBonus.zodiacSign === userZodiac) {
        onBonusUpdate([{ type: currentBonus.bonusType, value: currentBonus.bonusValue }]);
        toast({
          title: 'Zodiac Festival',
          description: `Your zodiac is in power! Enjoy +${currentBonus.bonusValue}% ${currentBonus.bonusType.replace('_', ' ')}!`,
        });
      }
    }
  };

  const subscribeToEclipseWarEvents = () => {
    const channel = supabase
      .channel('eclipse-war-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eclipse_war_events',
        },
        (payload) => {
          if (payload.new) {
            const eventData = payload.new as EclipseWarEvent;
            if (eventData.isActive) {
              setEclipseWar(eventData);
              toast({
                title: 'Eclipse War Started!',
                description: 'Attack speed increased by 50%, but resource loss risk is doubled!',
              });
            } else {
              setEclipseWar(null);
              setIsParticipating(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const joinEclipseWar = async () => {
    if (!eclipseWar) return;

    try {
      const { error } = await supabase
        .from('eclipse_war_events')
        .update({
          participants: [...eclipseWar.participants, userId]
        })
        .eq('id', eclipseWar.id);

      if (error) throw error;

      setIsParticipating(true);
      toast({
        title: 'Joined Eclipse War',
        description: 'You have joined the Eclipse War! Be careful with your resources!',
      });
    } catch (err) {
      console.error('Error joining Eclipse War:', err);
      toast({
        title: 'Error',
        description: 'Failed to join Eclipse War. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Zodiac Festival Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <h3 className="text-xl font-semibold mb-4">Zodiac Festival</h3>
        {currentZodiacBonus && (
          <div className="space-y-4">
            <p className="text-gray-400">
              Current Ruling Zodiac: <span className="text-cosmic-light-purple">{currentZodiacBonus.zodiacSign}</span>
            </p>
            <div className="flex items-center space-x-2">
              <span>Bonus:</span>
              <span className="text-cosmic-light-purple">
                +{currentZodiacBonus.bonusValue}% {currentZodiacBonus.bonusType.replace('_', ' ')}
              </span>
            </div>
            {currentZodiacBonus.zodiacSign === userZodiac && (
              <div className="mt-2 p-2 bg-cosmic-light-purple/20 rounded">
                Your zodiac is in power! Bonus is active!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Eclipse War Section */}
      <div className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60">
        <h3 className="text-xl font-semibold mb-4">Eclipse War</h3>
        {eclipseWar ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400">Active Eclipse War</p>
                <p className="text-sm">
                  Time Remaining: {Math.floor((new Date(eclipseWar.endTime).getTime() - Date.now()) / 3600000)}h
                </p>
              </div>
              {!isParticipating && (
                <motion.button
                  className="px-4 py-2 rounded bg-cosmic-light-purple/20 hover:bg-cosmic-light-purple/30"
                  onClick={joinEclipseWar}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join War
                </motion.button>
              )}
            </div>
            <div className="p-4 bg-cosmic-dark/40 rounded space-y-2">
              <p className="text-sm">⚡ Attack Speed: +50%</p>
              <p className="text-sm">⚠️ Resource Loss Risk: 2x</p>
              <p className="text-sm">👥 Participants: {eclipseWar.participants.length}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No active Eclipse War. Check back later!</p>
        )}
      </div>
    </div>
  );
};

export default EventSystem;