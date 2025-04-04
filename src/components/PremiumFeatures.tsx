import React from 'react';
import { ZodiacSkin, WeeklyHoroscope, premiumSkins, generateWeeklyHoroscope } from '../data/PremiumContent';

interface PremiumFeaturesProps {
  currentZodiac: string;
  onPurchaseSkin: (skin: ZodiacSkin) => void;
  onPurchaseHoroscope: (horoscope: WeeklyHoroscope) => void;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  currentZodiac,
  onPurchaseSkin,
  onPurchaseHoroscope
}) => {
  const availableSkins = premiumSkins.filter(skin => skin.zodiacType === currentZodiac);
  const weeklyHoroscope = generateWeeklyHoroscope(currentZodiac);

  return (
    <div className="p-4 space-y-6">
      <div className="premium-skins">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">Skin Premium Zodiak</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSkins.map(skin => (
            <div key={skin.id} className="border rounded-lg p-4 bg-gradient-to-r from-purple-100 to-pink-100">
              <h3 className="text-xl font-semibold mb-2">{skin.name}</h3>
              <p className="text-gray-600 mb-2">{skin.description}</p>
              <div className="mb-2">
                <span className="font-medium">Elemen: </span>
                <span className="text-blue-600">{skin.element}</span>
              </div>
              <ul className="list-disc list-inside mb-4 text-gray-700">
                {skin.effects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
              <button
                onClick={() => onPurchaseSkin(skin)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Beli {skin.price} Koin
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-horoscope mt-8">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Horoskop Mingguan Premium</h2>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-100 to-blue-100">
          <div className="mb-4">
            <span className="font-medium">Periode: </span>
            <span className="text-gray-600">
              {weeklyHoroscope.validityPeriod.start} sampai {weeklyHoroscope.validityPeriod.end}
            </span>
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <h4 className="font-semibold text-indigo-700">Prediksi Umum</h4>
              <p className="text-gray-700">{weeklyHoroscope.predictions.general}</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700">Sumber Daya</h4>
              <p className="text-gray-700">{weeklyHoroscope.predictions.resources}</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700">Pertempuran</h4>
              <p className="text-gray-700">{weeklyHoroscope.predictions.combat}</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700">Diplomasi</h4>
              <p className="text-gray-700">{weeklyHoroscope.predictions.diplomacy}</p>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-indigo-700 mb-2">Aksi yang Disarankan:</h4>
            <ul className="list-disc list-inside text-gray-700">
              {weeklyHoroscope.recommendedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-indigo-700">Hari Keberuntungan:</h4>
            <p className="text-gray-700">Hari {weeklyHoroscope.luckyDays.join(', ')}</p>
          </div>
          <button
            onClick={() => onPurchaseHoroscope(weeklyHoroscope)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Beli {weeklyHoroscope.price} Koin
          </button>
        </div>
      </div>
    </div>
  );
};