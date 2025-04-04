import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface GalaxyRegion {
  id: string;
  name: string;
  type: 'nebula' | 'asteroid' | 'star' | 'blackhole' | 'planet' | 'void' | 'anomaly';
  position: {
    x: number;
    y: number;
  };
  resources: {
    stardust: number;
    celestial_ore: number;
    ether: number;
  };
  controller?: {
    id: string;
    name: string;
    zodiac: string;
    council?: string;
  };
  defenses?: {
    units: number;
    fortifications: number;
    shields: number;
  };
  special?: {
    type: string;
    effect: string;
    duration?: number;
  };
  connections: string[];
  level: number;
  discovery_status: 'unknown' | 'scouted' | 'explored' | 'controlled';
}

interface GalaxyMapProps {
  userId: string;
  userZodiac: string;
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ userId, userZodiac }) => {
  const [regions, setRegions] = useState<GalaxyRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<GalaxyRegion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'explore' | 'attack' | 'colonize' | 'build' | null>(null);
  const [viewMode, setViewMode] = useState<'normal' | 'resources' | 'control' | 'threat'>('normal');
  const [filters, setFilters] = useState({
    showConnections: true,
    showResources: true,
    showDefenses: true,
    showSpecial: true,
  });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGalaxyRegions();
    subscribeToRegionUpdates();
  }, []);

  const fetchGalaxyRegions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('galaxy_regions')
        .select(`
          *,
          controller:region_controllers(
            id,
            name,
            zodiac,
            council:council_members(council:name)
          )
        `);

      if (error) throw error;

      setRegions(data || []);
    } catch (err) {
      setError('Failed to fetch galaxy regions');
      console.error('Error fetching galaxy regions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToRegionUpdates = () => {
    const channel = supabase
      .channel('galaxy-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'galaxy_regions',
        },
        (payload) => {
          fetchGalaxyRegions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleRegionClick = (region: GalaxyRegion) => {
    setSelectedRegion(region);
    setSelectedAction(null);
  };

  const handleAttack = async (region: GalaxyRegion) => {
    // Implement attack logic
  };

  const handleColonize = async (region: GalaxyRegion) => {
    // Implement colonization logic
  };

  const handleExplore = async (region: GalaxyRegion) => {
    // Implement exploration logic
  };

  const handleBuild = async (region: GalaxyRegion) => {
    // Implement building logic
  };

  const handleScroll = (e: React.WheelEvent) => {
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setMapScale(prev => Math.min(Math.max(prev * scaleFactor, 0.5), 2));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getRegionColor = (region: GalaxyRegion) => {
    switch (viewMode) {
      case 'resources':
        const totalResources = region.resources.stardust + region.resources.celestial_ore + region.resources.ether;
        if (totalResources > 1000) return 'bg-green-500/30';
        if (totalResources > 500) return 'bg-yellow-500/30';
        return 'bg-red-500/30';
      case 'control':
        if (region.controller?.id === userId) return 'bg-blue-500/30';
        if (region.controller?.council) return 'bg-purple-500/30';
        return 'bg-gray-500/30';
      case 'threat':
        if (region.defenses?.units && region.defenses.units > 100) return 'bg-red-500/30';
        if (region.defenses?.units && region.defenses.units > 50) return 'bg-yellow-500/30';
        return 'bg-green-500/30';
      default:
        switch (region.type) {
          case 'nebula':
            return 'bg-purple-500/30';
          case 'asteroid':
            return 'bg-gray-500/30';
          case 'star':
            return 'bg-yellow-500/30';
          case 'blackhole':
            return 'bg-black';
          case 'planet':
            return 'bg-blue-500/30';
          case 'void':
            return 'bg-slate-800/30';
          case 'anomaly':
            return 'bg-pink-500/30';
          default:
            return 'bg-slate-500/30';
        }
    }
  };

  const getRegionIcon = (region: GalaxyRegion) => {
    switch (region.type) {
      case 'nebula':
        return '🌌';
      case 'asteroid':
        return '☄️';
      case 'star':
        return '⭐';
      case 'blackhole':
        return '🕳️';
      case 'planet':
        return '🌍';
      case 'void':
        return '🌑';
      case 'anomaly':
        return '✨';
      default:
        return '✨';
    }
  };

  const getDiscoveryStatusIcon = (status: string) => {
    switch (status) {
      case 'unknown':
        return '❓';
      case 'scouted':
        return '👁️';
      case 'explored':
        return '🔍';
      case 'controlled':
        return '🎯';
      default:
        return '❓';
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-cosmic-dark">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-4">
          <h3 className="text-lg font-semibold text-cosmic-light-purple mb-2">View Mode</h3>
          <div className="space-y-2">
            {['normal', 'resources', 'control', 'threat'].map(mode => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode as any)}
                className={`w-full px-3 py-1 text-sm rounded ${
                  viewMode === mode
                    ? 'bg-cosmic-purple text-white'
                    : 'bg-cosmic-dark/50 text-slate-400'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-4">
          <h3 className="text-lg font-semibold text-cosmic-light-purple mb-2">Filters</h3>
          <div className="space-y-2">
            {Object.entries(filters).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded border-cosmic-purple/40 text-cosmic-purple focus:ring-cosmic-purple"
                />
                {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className="absolute inset-0"
        onWheel={handleScroll}
      >
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            scale: mapScale,
            x: mapPosition.x,
            y: mapPosition.y,
          }}
          className="relative w-full h-full"
        >
          {filters.showConnections && (
            <svg className="absolute inset-0 pointer-events-none">
              {regions.map(region =>
                region.connections.map(connectionId => {
                  const connection = regions.find(r => r.id === connectionId);
                  if (!connection) return null;
                  return (
                    <line
                      key={`${region.id}-${connectionId}`}
                      x1={`${region.position.x}%`}
                      y1={`${region.position.y}%`}
                      x2={`${connection.position.x}%`}
                      y2={`${connection.position.y}%`}
                      stroke="rgba(147, 51, 234, 0.2)"
                      strokeWidth="1"
                    />
                  );
                })
              )}
            </svg>
          )}

          {regions.map(region => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute cursor-pointer ${getRegionColor(region)}`}
              style={{
                left: `${region.position.x}%`,
                top: `${region.position.y}%`,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleRegionClick(region)}
            >
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {getRegionIcon(region)}
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                {region.name}
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white">
                {getDiscoveryStatusIcon(region.discovery_status)}
              </div>
              {region.controller && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                  {region.controller.name}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMapScale(prev => Math.min(prev * 1.1, 2))}
          className="cosmic-button p-2"
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMapScale(prev => Math.max(prev * 0.9, 0.5))}
          className="cosmic-button p-2"
        >
          -
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">
                {getRegionIcon(selectedRegion)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-cosmic-light-purple">
                    {selectedRegion.name}
                  </h3>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Type: {selectedRegion.type.charAt(0).toUpperCase() + selectedRegion.type.slice(1)}
                </p>
                <p className="text-sm text-slate-400">
                  Level: {selectedRegion.level}
                </p>
                <p className="text-sm text-slate-400">
                  Status: {selectedRegion.discovery_status.charAt(0).toUpperCase() + selectedRegion.discovery_status.slice(1)}
                </p>

                {filters.showResources && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">Stardust</span>
                      <span>{selectedRegion.resources.stardust}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-400">Celestial Ore</span>
                      <span>{selectedRegion.resources.celestial_ore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-400">Ether</span>
                      <span>{selectedRegion.resources.ether}</span>
                    </div>
                  </div>
                )}

                {filters.showDefenses && selectedRegion.defenses && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">Units</span>
                      <span>{selectedRegion.defenses.units}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-400">Fortifications</span>
                      <span>{selectedRegion.defenses.fortifications}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-400">Shields</span>
                      <span>{selectedRegion.defenses.shields}</span>
                    </div>
                  </div>
                )}

                {filters.showSpecial && selectedRegion.special && (
                  <div className="mt-4">
                    <div className="text-sm text-cosmic-gold">
                      Special: {selectedRegion.special.type}
                    </div>
                    <div className="text-sm text-slate-400">
                      {selectedRegion.special.effect}
                    </div>
                    {selectedRegion.special.duration && (
                      <div className="text-sm text-slate-500">
                        Duration: {selectedRegion.special.duration} turns
                      </div>
                    )}
                  </div>
                )}

                {selectedRegion.controller ? (
                  <div className="mt-4">
                    <div className="text-sm text-slate-400">
                      Controlled by: {selectedRegion.controller.name}
                      {selectedRegion.controller.council && (
                        <span className="text-cosmic-purple">
                          {' '}({selectedRegion.controller.council})
                        </span>
                      )}
                    </div>
                    {selectedRegion.controller.id !== userId && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAttack(selectedRegion)}
                        className="mt-2 cosmic-button w-full"
                      >
                        Attack Region
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleColonize(selectedRegion)}
                      className="cosmic-button w-full"
                    >
                      Colonize Region
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExplore(selectedRegion)}
                      className="cosmic-button w-full"
                    >
                      Explore Region
                    </motion.button>
                  </div>
                )}

                {selectedRegion.controller?.id === userId && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuild(selectedRegion)}
                    className="mt-2 cosmic-button w-full"
                  >
                    Build/Upgrade
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalaxyMap; 