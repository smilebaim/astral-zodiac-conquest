
import React from 'react';
import { motion } from 'framer-motion';

const GameTitle: React.FC = () => {
  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl font-[Orbitron] font-bold bg-gradient-to-r from-cosmic-gold via-cosmic-nebula to-cosmic-light-purple bg-clip-text text-transparent"
        initial={{ letterSpacing: "0.1em" }}
        animate={{ 
          letterSpacing: ["0.1em", "0.15em", "0.1em"],
          textShadow: [
            "0 0 5px rgba(155, 135, 245, 0.3)",
            "0 0 15px rgba(155, 135, 245, 0.5)",
            "0 0 5px rgba(155, 135, 245, 0.3)"
          ]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ASTRAL CONQUEST
      </motion.h1>
      
      <motion.h2 
        className="text-xl sm:text-2xl md:text-3xl text-cosmic-nebula mt-2 font-semibold tracking-wider"
        animate={{ 
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ZODIAC WARS
      </motion.h2>
    </motion.div>
  );
};

export default GameTitle;
