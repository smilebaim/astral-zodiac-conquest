import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentRulingZodiac, generateDailyHoroscope, type DailyHoroscope } from '../data/SeasonalZodiac';
import { seasonalZodiacPeriods } from '../data/SeasonalZodiac';
import { useToast } from '../hooks/use-toast';

interface HoroscopeSystemProps {
  userZodiac: string;
  onBonusActivate?: (bonus: any) => void;
}

const HoroscopeSystem: React.FC<HoroscopeSystemProps> = ({ userZodiac, onBonusActivate }) => {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [rulingZodiac, setRulingZodiac] = useState<string | null>(null);
  const [seasonalBonus, setSeasonalBonus] = useState<number>(0);
  const [cosmicEnergy, setCosmicEnergy] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Generate horoskop harian dengan energi kosmik
    const dailyHoroscope = generateDailyHoroscope(userZodiac);
    setHoroscope(dailyHoroscope);

    // Hitung energi kosmik berdasarkan fase bulan dan posisi planet
    const energy = Math.floor(Math.random() * 100);
    setCosmicEnergy(energy);

    // Cek zodiak yang sedang berkuasa
    const currentRulingZodiac = getCurrentRulingZodiac();
    setRulingZodiac(currentRulingZodiac);

    // Aktifkan bonus musiman jika zodiak pemain sedang berkuasa
    if (currentRulingZodiac === userZodiac) {
      const bonus = seasonalZodiacPeriods[userZodiac].resourceBonus;
      setSeasonalBonus(bonus);
      if (onBonusActivate) {
        onBonusActivate({
          type: 'seasonal',
          value: bonus,
          effects: seasonalZodiacPeriods[userZodiac].additionalEffects
        });
      }

      toast({
        title: 'Bonus Zodiak Musiman Aktif!',
        description: `Zodiak ${userZodiac} sedang berkuasa! Bonus sumber daya +${bonus}%`
      });
    }
  }, [userZodiac, onBonusActivate]);

  const getLuckColor = (luck: number): string => {
    if (luck > 70) return 'text-green-400';
    if (luck < 30) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* Horoskop Harian */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60 relative overflow-hidden"
      >
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cosmic-light-purple/20 to-cosmic-light-purple"
          style={{ 
            transform: `scaleX(${cosmicEnergy / 100})`,
            transition: 'transform 1s ease-in-out'
          }}
        />
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>Horoskop Harian {userZodiac}</span>
          <span className="text-sm font-normal text-cosmic-light-purple">
            Energi Kosmik: {cosmicEnergy}%
          </span>
        </h3>
        {horoscope && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-cosmic-dark/40 border border-cosmic-light-purple/30 relative">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-lg mb-4 leading-relaxed">{horoscope.prediction}</p>
                <div className="flex items-center justify-between">
                  <span>Tingkat Keberuntungan:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-cosmic-dark rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${horoscope.luck}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${getLuckColor(horoscope.luck)}`}
                      />
                    </div>
                    <span className={`font-semibold ${getLuckColor(horoscope.luck)}`}>
                      {horoscope.luck}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {horoscope.warning && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                <h4 className="text-red-400 font-semibold mb-2">⚠️ Peringatan</h4>
                <p>{horoscope.warning}</p>
              </div>
            )}

            {horoscope.opportunities && horoscope.opportunities.length > 0 && (
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-2">✨ Peluang</h4>
                <ul className="list-disc list-inside">
                  {horoscope.opportunities.map((opportunity, index) => (
                    <li key={index}>{opportunity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Zodiak Musiman */}
      {rulingZodiac && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-cosmic-light-purple bg-cosmic-dark/60"
        >
          <h3 className="text-xl font-semibold mb-4">Zodiak yang Berkuasa</h3>
          <div className="p-4 rounded-lg bg-cosmic-dark/40 border border-cosmic-light-purple/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg">{rulingZodiac}</span>
              {rulingZodiac === userZodiac && (
                <span className="bg-cosmic-light-purple/20 px-3 py-1 rounded text-sm">
                  Bonus Aktif +{seasonalBonus}%
                </span>
              )}
            </div>

            {seasonalZodiacPeriods[rulingZodiac].additionalEffects && (
              <div className="space-y-2">
                <h4 className="font-semibold">Efek Tambahan:</h4>
                <ul className="list-disc list-inside text-sm">
                  {seasonalZodiacPeriods[rulingZodiac].additionalEffects?.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HoroscopeSystem;