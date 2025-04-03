import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  notifications: {
    battles: boolean;
    resources: boolean;
    council: boolean;
    research: boolean;
    achievements: boolean;
  };
  display: {
    theme: 'cosmic' | 'nebula' | 'starlight';
    animations: boolean;
    compactView: boolean;
    showTutorialTips: boolean;
  };
  privacy: {
    showProfile: boolean;
    showResources: boolean;
    showAchievements: boolean;
    allowMessages: boolean;
  };
  gameplay: {
    autoCollectResources: boolean;
    battleConfirmation: boolean;
    showBattleReports: boolean;
    showRegionAlerts: boolean;
  };
}

interface SettingsSystemProps {
  userId: string;
  onSettingsChange: (settings: UserSettings) => void;
}

const SettingsSystem: React.FC<SettingsSystemProps> = ({ userId, onSettingsChange }) => {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      battles: true,
      resources: true,
      council: true,
      research: true,
      achievements: true,
    },
    display: {
      theme: 'cosmic',
      animations: true,
      compactView: false,
      showTutorialTips: true,
    },
    privacy: {
      showProfile: true,
      showResources: true,
      showAchievements: true,
      allowMessages: true,
    },
    gameplay: {
      autoCollectResources: false,
      battleConfirmation: true,
      showBattleReports: true,
      showRegionAlerts: true,
    },
  });
  const [activeSection, setActiveSection] = useState<'notifications' | 'display' | 'privacy' | 'gameplay'>('notifications');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, [userId]);

  const fetchUserSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data.settings);
      }
    } catch (err) {
      setError('Failed to fetch user settings');
      console.error('Error fetching user settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      onSettingsChange(settings);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cosmic-light-purple">Notification Settings</h3>
      <div className="space-y-3">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between">
            <span className="text-slate-400">
              {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
            </span>
            <motion.div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                value ? 'bg-cosmic-purple' : 'bg-cosmic-dark'
              }`}
              onClick={() => handleSettingChange('notifications', key, !value)}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: value ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cosmic-light-purple">Display Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="text-slate-400 block mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {['cosmic', 'nebula', 'starlight'].map(theme => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSettingChange('display', 'theme', theme)}
                className={`p-2 rounded-lg text-sm ${
                  settings.display.theme === theme
                    ? 'bg-cosmic-purple text-white'
                    : 'bg-cosmic-dark/50 text-slate-400'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
        {Object.entries(settings.display)
          .filter(([key]) => key !== 'theme')
          .map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-slate-400">
                {key
                  .split(/(?=[A-Z])/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
              <motion.div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                  value ? 'bg-cosmic-purple' : 'bg-cosmic-dark'
                }`}
                onClick={() => handleSettingChange('display', key, !value)}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: value ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.div>
            </label>
          ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cosmic-light-purple">Privacy Settings</h3>
      <div className="space-y-3">
        {Object.entries(settings.privacy).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between">
            <span className="text-slate-400">
              {key
                .split(/(?=[A-Z])/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
            <motion.div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                value ? 'bg-cosmic-purple' : 'bg-cosmic-dark'
              }`}
              onClick={() => handleSettingChange('privacy', key, !value)}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: value ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderGameplaySettings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cosmic-light-purple">Gameplay Settings</h3>
      <div className="space-y-3">
        {Object.entries(settings.gameplay).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between">
            <span className="text-slate-400">
              {key
                .split(/(?=[A-Z])/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
            <motion.div
              className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                value ? 'bg-cosmic-purple' : 'bg-cosmic-dark'
              }`}
              onClick={() => handleSettingChange('gameplay', key, !value)}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: value ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cosmic-light-purple">Settings</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            disabled={isLoading || isSaving}
            className="cosmic-button px-4 py-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {error && (
          <div className="text-red-500 text-center py-2 bg-red-500/10 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 border-b border-cosmic-purple/40">
          {['notifications', 'display', 'privacy', 'gameplay'].map(section => (
            <motion.button
              key={section}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(section as any)}
              className={`px-4 py-2 text-sm ${
                activeSection === section
                  ? 'text-cosmic-light-purple border-b-2 border-cosmic-purple'
                  : 'text-slate-400'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </motion.button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-4"
            >
              {activeSection === 'notifications' && renderNotificationSettings()}
              {activeSection === 'display' && renderDisplaySettings()}
              {activeSection === 'privacy' && renderPrivacySettings()}
              {activeSection === 'gameplay' && renderGameplaySettings()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SettingsSystem; 