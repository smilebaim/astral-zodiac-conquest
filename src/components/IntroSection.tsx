
import React from 'react';
import { motion } from 'framer-motion';

const IntroSection: React.FC = () => {
  return (
    <motion.div 
      className="max-w-3xl mx-auto text-center mb-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <h2 className="text-2xl mb-4 text-cosmic-light-purple">Welcome to Galaxia Zodiacus</h2>
      
      <motion.p 
        className="text-lg mb-6 text-slate-300"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        In a parallel universe, 12 zodiac constellations battle for control of the "Cosmic Core" 
        and ultimate dominion over the galaxy's fate.
      </motion.p>
      
      <motion.div 
        className="cosmic-border p-5 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <h3 className="text-xl mb-3 text-cosmic-gold">Your Cosmic Destiny Awaits</h3>
        <p className="text-slate-300">
          Choose your zodiac, build your galactic empire, form strategic alliances, 
          and dominate the star map through conquest, diplomacy, or cunning tactics.
        </p>
      </motion.div>
      
      <motion.div
        className="flex flex-wrap justify-center gap-4 text-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="cosmic-border px-4 py-2">
          <span className="text-cosmic-light-purple block mb-1">Build Galactic Kingdoms</span>
          <span className="text-xs text-slate-300">Construct observatories, forges & nebula farms</span>
        </div>
        
        <div className="cosmic-border px-4 py-2">
          <span className="text-cosmic-light-purple block mb-1">Form Zodiac Alliances</span>
          <span className="text-xs text-slate-300">Unite with compatible signs for powerful bonuses</span>
        </div>
        
        <div className="cosmic-border px-4 py-2">
          <span className="text-cosmic-light-purple block mb-1">Real-Time Strategy</span>
          <span className="text-xs text-slate-300">The galaxy evolves even when you're away</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IntroSection;
