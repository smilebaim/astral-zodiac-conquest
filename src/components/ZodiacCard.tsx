
import React from 'react';
import { motion } from 'framer-motion';

export interface ZodiacProps {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  primaryAttribute: string;
  description: string;
  image: string;
}

interface ZodiacCardProps {
  zodiac: ZodiacProps;
  onClick: (zodiac: ZodiacProps) => void;
}

const elementColors = {
  Fire: 'from-red-500/20 to-orange-500/20',
  Earth: 'from-green-500/20 to-emerald-500/20',
  Air: 'from-blue-400/20 to-cyan-400/20',
  Water: 'from-blue-600/20 to-indigo-500/20',
};

const ZodiacCard: React.FC<ZodiacCardProps> = ({ zodiac, onClick }) => {
  return (
    <motion.div
      className={`zodiac-card cursor-pointer bg-gradient-to-b ${elementColors[zodiac.element]}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(zodiac)}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl text-white font-bold">{zodiac.name}</h3>
          <span className="text-2xl" title={zodiac.name}>{zodiac.symbol}</span>
        </div>
        
        <div className="aspect-square bg-cosmic-dark/40 rounded-md flex items-center justify-center mb-3 overflow-hidden">
          <motion.img 
            src={zodiac.image} 
            alt={zodiac.name} 
            className="w-full h-full object-cover"
            initial={{ filter: 'brightness(0.7)' }}
            whileHover={{ filter: 'brightness(1)' }}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-cosmic-gold">{zodiac.element} Element</span>
            <span className="text-cosmic-nebula">{zodiac.primaryAttribute}</span>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-3">{zodiac.description}</p>
        </div>
        
        <div className="mt-3 flex justify-center">
          <button className="cosmic-button w-full text-sm py-1.5">
            Select {zodiac.name}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ZodiacCard;
