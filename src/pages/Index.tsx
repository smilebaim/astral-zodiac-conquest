
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ZodiacCard, { ZodiacProps } from '@/components/ZodiacCard';
import ResourceBar from '@/components/ResourceBar';
import CosmicBackground from '@/components/CosmicBackground';
import GameTitle from '@/components/GameTitle';
import IntroSection from '@/components/IntroSection';
import ProfileMenu from '@/components/ProfileMenu';
import zodiacData from '@/data/zodiacData';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacProps | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const { user } = useAuth();
  
  const handleZodiacSelect = (zodiac: ZodiacProps) => {
    setSelectedZodiac(zodiac);
  };
  
  const startGame = () => {
    if (selectedZodiac) {
      setGameStarted(true);
    }
  };
  
  return (
    <div className="min-h-screen w-full">
      <CosmicBackground />
      
      {/* Resources only show when game is started */}
      {gameStarted && <ResourceBar stardust={1000} celestialOre={500} ether={200} />}
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <GameTitle />
          <ProfileMenu />
        </div>
        
        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <IntroSection />
            
            <div className="mb-8">
              <h2 className="text-2xl text-center mb-6 text-cosmic-light-purple">Choose Your Zodiac Constellation</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {zodiacData.map((zodiac) => (
                  <ZodiacCard 
                    key={zodiac.name}
                    zodiac={zodiac}
                    onClick={handleZodiacSelect}
                  />
                ))}
              </div>
            </div>
            
            {selectedZodiac && (
              <motion.div 
                className="fixed bottom-0 left-0 right-0 p-4 bg-cosmic-dark/90 border-t border-cosmic-purple/40 backdrop-blur-md"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cosmic-purple">
                      <img src={selectedZodiac.image} alt={selectedZodiac.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {selectedZodiac.name} <span className="text-2xl">{selectedZodiac.symbol}</span>
                      </h3>
                      <p className="text-sm text-cosmic-gold">{selectedZodiac.element} • {selectedZodiac.primaryAttribute}</p>
                    </div>
                  </div>
                  
                  <motion.button 
                    className="cosmic-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                  >
                    Begin Your Conquest
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="cosmic-border p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl text-cosmic-light-purple mb-4">Your {selectedZodiac?.name} Empire</h2>
            
            <div className="mb-6">
              <div className="cosmic-border p-4 mb-4">
                <h3 className="text-xl mb-2">Galactic Command Center</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Welcome, commander! Your {selectedZodiac?.name} empire is in its early stages. 
                  Begin by establishing your first observatory to survey the cosmic landscape.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="cosmic-button text-sm">Build Observatory</button>
                  <button className="cosmic-button text-sm">Gather Resources</button>
                  <button className="cosmic-button text-sm">Scout Nearby Systems</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="cosmic-border p-4">
                  <h3 className="text-lg mb-2">Resource Production</h3>
                  <p className="text-sm text-slate-300">Your cosmic harvesters are gathering:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Stardust:</span>
                      <span className="text-cosmic-gold">+10/hr</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Celestial Ore:</span>
                      <span className="text-cosmic-blue">+5/hr</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Ether:</span>
                      <span className="text-cosmic-accent">+2/hr</span>
                    </li>
                  </ul>
                </div>
                
                <div className="cosmic-border p-4">
                  <h3 className="text-lg mb-2">{selectedZodiac?.name} Special Ability</h3>
                  <p className="text-sm text-slate-300 mb-3">
                    {selectedZodiac?.description}
                  </p>
                  <button className="cosmic-button text-sm w-full">Activate Special Ability</button>
                </div>
              </div>
            </div>
            
            <div className="cosmic-border p-4">
              <h3 className="text-lg mb-2">Galaxy Map</h3>
              <p className="text-slate-300 text-sm mb-4">
                The map is currently unexplored. Build an observatory to reveal nearby star systems.
              </p>
              <div className="h-60 flex items-center justify-center bg-cosmic-dark/50 rounded border border-dashed border-cosmic-purple/30">
                <p className="text-cosmic-purple/70">Map will be revealed once Observatory is built</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
