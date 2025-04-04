
import React from 'react';
import { motion } from 'framer-motion';

const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-cosmic-dark"></div>
      
      {/* Constellation patterns */}
      <div className="constellation top-[10%] left-[10%]"></div>
      <div className="constellation bottom-[10%] right-[10%]"></div>
      
      {/* Animated nebula effects */}
      <motion.div 
        className="absolute top-20 -left-40 w-96 h-96 rounded-full bg-cosmic-purple/5 blur-3xl"
        animate={{
          x: [0, 30, 0],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 -right-40 w-96 h-96 rounded-full bg-cosmic-accent/5 blur-3xl"
        animate={{
          x: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default CosmicBackground;
