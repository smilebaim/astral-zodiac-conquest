import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreateCouncil, useCouncil } from '@/hooks/useSupabase';
import type { ZodiacProps } from './ZodiacCard';

interface CouncilSystemProps {
  userZodiac: ZodiacProps;
  userKingdom: {
    id: string;
    name: string;
    resources: {
      stardust: number;
      celestialOre: number;
      ether: number;
    };
  };
}

const CouncilSystem: React.FC<CouncilSystemProps> = ({ userZodiac, userKingdom }) => {
  const [selectedAction, setSelectedAction] = useState<'create' | 'join' | 'manage' | null>(null);
  const [councilName, setCouncilName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const createCouncil = useCreateCouncil();
  const { data: council } = useCouncil('current-council-id'); // Replace with actual council ID

  const handleCreateCouncil = async () => {
    if (!councilName.trim()) return;

    await createCouncil.mutateAsync({
      name: councilName,
      resources: {
        stardust: 0,
        celestialOre: 0,
        ether: 0,
      },
    });
  };

  const handleJoinCouncil = async () => {
    if (!inviteCode.trim()) return;
    // Implement join council logic
  };

  return (
    <div className="cosmic-border p-6">
      <h2 className="text-2xl text-cosmic-light-purple mb-4">Council System</h2>

      {!council ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              className="cosmic-button p-4 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAction('create')}
            >
              <h3 className="text-lg mb-2">Create Council</h3>
              <p className="text-sm text-slate-300">Form a new alliance</p>
            </motion.button>

            <motion.button
              className="cosmic-button p-4 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAction('join')}
            >
              <h3 className="text-lg mb-2">Join Council</h3>
              <p className="text-sm text-slate-300">Enter an existing alliance</p>
            </motion.button>
          </div>

          {selectedAction === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cosmic-border p-4 mt-4"
            >
              <h3 className="text-lg mb-4">Create New Council</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Council Name
                  </label>
                  <input
                    type="text"
                    value={councilName}
                    onChange={(e) => setCouncilName(e.target.value)}
                    className="w-full bg-cosmic-dark border border-cosmic-purple rounded p-2 text-white"
                    placeholder="Enter council name"
                  />
                </div>
                <motion.button
                  className="cosmic-button w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateCouncil}
                  disabled={!councilName.trim()}
                >
                  Create Council
                </motion.button>
              </div>
            </motion.div>
          )}

          {selectedAction === 'join' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cosmic-border p-4 mt-4"
            >
              <h3 className="text-lg mb-4">Join Existing Council</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full bg-cosmic-dark border border-cosmic-purple rounded p-2 text-white"
                    placeholder="Enter council invite code"
                  />
                </div>
                <motion.button
                  className="cosmic-button w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinCouncil}
                  disabled={!inviteCode.trim()}
                >
                  Join Council
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="cosmic-border p-4">
            <h3 className="text-xl mb-4">{council.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-slate-300">Council Resources</p>
                <p className="text-lg text-cosmic-gold">{council.resources.stardust}</p>
                <p className="text-sm text-slate-300">Stardust</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-300">Council Resources</p>
                <p className="text-lg text-cosmic-blue">{council.resources.celestialOre}</p>
                <p className="text-sm text-slate-300">Celestial Ore</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-300">Council Resources</p>
                <p className="text-lg text-cosmic-accent">{council.resources.ether}</p>
                <p className="text-sm text-slate-300">Ether</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg mb-2">Council Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  className="cosmic-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAction('manage')}
                >
                  Manage Council
                </motion.button>
                <motion.button
                  className="cosmic-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Members
                </motion.button>
              </div>
            </div>
          </div>

          {selectedAction === 'manage' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cosmic-border p-4"
            >
              <h4 className="text-lg mb-4">Council Management</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Generate Invite Code
                  </label>
                  <motion.button
                    className="cosmic-button w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate New Code
                  </motion.button>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Council Settings
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-cosmic-purple" />
                      <span className="text-sm text-slate-300">Allow Member Invites</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-cosmic-purple" />
                      <span className="text-sm text-slate-300">Auto-Accept Members</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouncilSystem; 