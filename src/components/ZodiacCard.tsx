
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import zodiacAbilities, { ZodiacAbility } from '@/data/zodiacAbilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const abilityTypeColors = {
  passive: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  active: 'bg-green-500/20 text-green-300 border-green-500/50',
  ultimate: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
};

const ZodiacCard: React.FC<ZodiacCardProps> = ({ zodiac, onClick }) => {
  const [showAbilities, setShowAbilities] = useState(false);
  const abilities = zodiacAbilities[zodiac.name] || [];
  
  const handleCardClick = () => {
    onClick(zodiac);
  };
  
  const AbilityCard = ({ ability }: { ability: ZodiacAbility }) => (
    <div className="cosmic-border p-3 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{ability.icon}</span>
            <h4 className="text-lg font-medium text-cosmic-light-purple">{ability.name}</h4>
          </div>
          <Badge className={`mt-1 ${abilityTypeColors[ability.type]}`}>
            {ability.type.charAt(0).toUpperCase() + ability.type.slice(1)}
            {ability.cooldown && ` • ${ability.cooldown}s cooldown`}
          </Badge>
        </div>
        <div className="text-xs text-cosmic-gold">Level {ability.unlockLevel}</div>
      </div>
      <p className="text-sm text-slate-300 mb-2">{ability.description}</p>
      <div className="text-xs text-cosmic-nebula">
        <span className="font-semibold">Effect: </span>
        {ability.effect.target === 'self' && 'Your kingdom'}
        {ability.effect.target === 'ally' && 'Allied units'}
        {ability.effect.target === 'enemy' && 'Enemy units'}
        {ability.effect.target === 'global' && 'All units'}
        {ability.effect.stat && ` • ${ability.effect.stat.replace('_', ' ')}`}
        {ability.effect.value && ` • ${ability.effect.value > 0 ? '+' : ''}${ability.effect.value}%`}
        {ability.effect.duration && ` • ${ability.effect.duration}s`}
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        className={`zodiac-card cursor-pointer bg-gradient-to-b ${elementColors[zodiac.element]}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
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
          
          <div className="mt-3 flex flex-col gap-2">
            <button 
              className="cosmic-button w-full text-sm py-1.5"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              Select {zodiac.name}
            </button>
            
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  className="cosmic-button-secondary w-full text-sm py-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Abilities
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-cosmic-dark border border-cosmic-purple">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-cosmic-light-purple">
                    <span className="text-2xl">{zodiac.symbol}</span>
                    {zodiac.name} Abilities
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="passive">Passive</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="ultimate">Ultimate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-2">
                    {abilities.map((ability) => (
                      <AbilityCard key={ability.name} ability={ability} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="passive" className="space-y-2">
                    {abilities
                      .filter((ability) => ability.type === 'passive')
                      .map((ability) => (
                        <AbilityCard key={ability.name} ability={ability} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="active" className="space-y-2">
                    {abilities
                      .filter((ability) => ability.type === 'active')
                      .map((ability) => (
                        <AbilityCard key={ability.name} ability={ability} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="ultimate" className="space-y-2">
                    {abilities
                      .filter((ability) => ability.type === 'ultimate')
                      .map((ability) => (
                        <AbilityCard key={ability.name} ability={ability} />
                      ))}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ZodiacCard;
