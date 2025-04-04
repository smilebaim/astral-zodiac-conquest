
import React from 'react';
import { Star, Gem, Zap } from 'lucide-react';

interface ResourceBarProps {
  stardust: number;
  celestialOre: number;
  ether: number;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ stardust, celestialOre, ether }) => {
  return (
    <div className="fixed top-4 right-4 flex gap-2 z-50">
      <div className="resource-counter">
        <Star className="w-4 h-4 text-cosmic-gold animate-pulse-glow" />
        <span>{stardust.toLocaleString()}</span>
      </div>
      
      <div className="resource-counter">
        <Gem className="w-4 h-4 text-cosmic-blue animate-pulse-glow" />
        <span>{celestialOre.toLocaleString()}</span>
      </div>
      
      <div className="resource-counter">
        <Zap className="w-4 h-4 text-cosmic-accent animate-pulse-glow" />
        <span>{ether.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ResourceBar;
