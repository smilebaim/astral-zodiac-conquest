import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Gem, Zap } from 'lucide-react';

interface ResourceCollectorProps {
  userId: string;
  resourceStats: {
    stardust: {
      current: number;
      max: number;
      generation_rate: number;
      bonus_rate: number;
    };
    celestial_ore: {
      current: number;
      max: number;
      generation_rate: number;
      bonus_rate: number;
    };
    ether: {
      current: number;
      max: number;
      generation_rate: number;
      bonus_rate: number;
    };
  };
  onResourceUpdate: (newStats: any) => void;
}

const ResourceCollector: React.FC<ResourceCollectorProps> = ({
  userId,
  resourceStats,
  onResourceUpdate
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [lastCollectionTime, setLastCollectionTime] = useState<number>(Date.now());
  const [collectionCooldown, setCollectionCooldown] = useState(0);
  const { toast } = useToast();

  // Auto-generate resources based on generation rate
  useEffect(() => {
    const autoGenerateInterval = setInterval(async () => {
      const now = Date.now();
      const timeDiff = (now - lastCollectionTime) / 1000; // Convert to seconds

      const newStats = { ...resourceStats };
      let updated = false;

      // Update each resource
      Object.entries(resourceStats).forEach(([resource, stats]) => {
        const generatedAmount = Math.floor(stats.generation_rate * timeDiff * (1 + stats.bonus_rate));
        if (generatedAmount > 0) {
          const newAmount = Math.min(stats.current + generatedAmount, stats.max);
          if (newAmount > stats.current) {
            newStats[resource as keyof typeof resourceStats].current = newAmount;
            updated = true;
          }
        }
      });

      if (updated) {
        try {
          const { error } = await supabase
            .from('player_resources')
            .update({ stats: newStats })
            .eq('user_id', userId);

          if (error) throw error;
          onResourceUpdate(newStats);
          setLastCollectionTime(now);
        } catch (err) {
          console.error('Error updating resources:', err);
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(autoGenerateInterval);
  }, [resourceStats, lastCollectionTime, userId]);

  // Manual resource collection
  const collectResources = async () => {
    if (isCollecting || collectionCooldown > 0) return;

    setIsCollecting(true);
    try {
      const collectionBonus = 2; // 2x bonus for manual collection
      const newStats = { ...resourceStats };
      let totalCollected = 0;

      // Calculate collection amounts for each resource
      Object.entries(resourceStats).forEach(([resource, stats]) => {
        const collectionAmount = Math.floor(
          stats.generation_rate * 60 * collectionBonus * (1 + stats.bonus_rate)
        );
        const newAmount = Math.min(stats.current + collectionAmount, stats.max);
        if (newAmount > stats.current) {
          newStats[resource as keyof typeof resourceStats].current = newAmount;
          totalCollected += newAmount - stats.current;
        }
      });

      // Update database
      const { error } = await supabase
        .from('player_resources')
        .update({ stats: newStats })
        .eq('user_id', userId);

      if (error) throw error;

      onResourceUpdate(newStats);
      setLastCollectionTime(Date.now());
      setCollectionCooldown(300); // 5 minutes cooldown

      // Show collection animation and notification
      toast({
        title: "Resources Collected!",
        description: `Collected ${totalCollected} total resources`,
        variant: "default"
      });

      // Start cooldown timer
      const cooldownInterval = setInterval(() => {
        setCollectionCooldown((prev) => {
          if (prev <= 0) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error collecting resources:', err);
      toast({
        title: "Collection Failed",
        description: "Failed to collect resources",
        variant: "destructive"
      });
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="resource-collector">
      <motion.button
        className={`cosmic-button ${isCollecting || collectionCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={collectResources}
        disabled={isCollecting || collectionCooldown > 0}
        whileHover={{ scale: isCollecting || collectionCooldown > 0 ? 1 : 1.05 }}
        whileTap={{ scale: isCollecting || collectionCooldown > 0 ? 1 : 0.95 }}
      >
        {collectionCooldown > 0 ? (
          `Cooldown: ${Math.floor(collectionCooldown / 60)}:${(collectionCooldown % 60).toString().padStart(2, '0')}`
        ) : isCollecting ? (
          'Collecting...'
        ) : (
          'Collect Resources'
        )}
      </motion.button>

      <div className="resource-rates grid grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-cosmic-gold" />
          <span>+{Math.floor(resourceStats.stardust.generation_rate * (1 + resourceStats.stardust.bonus_rate))}/s</span>
        </div>
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-cosmic-blue" />
          <span>+{Math.floor(resourceStats.celestial_ore.generation_rate * (1 + resourceStats.celestial_ore.bonus_rate))}/s</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cosmic-accent" />
          <span>+{Math.floor(resourceStats.ether.generation_rate * (1 + resourceStats.ether.bonus_rate))}/s</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceCollector;