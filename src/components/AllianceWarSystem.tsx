import React, { useState, useEffect } from 'react';
import { AllianceService } from '@/lib/AllianceService';
import { useToast } from '@/hooks/use-toast';
import { ZodiacProps } from './ZodiacCard';

type ZodiacComboBonus = {
  combo: string[];
  bonus: string;
  value: number;
  description: string;
};

interface AllianceWarSystemProps {
  userAlliance: {
    id: string;
    name: string;
  };
  userZodiac: ZodiacProps;
  onWarStatusChange?: (status: {
    isAtWar: boolean;
    opponentAllianceId: string | null;
    warScore: number;
  }) => void;
}

const AllianceWarSystem: React.FC<AllianceWarSystemProps> = ({
  userAlliance,
  userZodiac,
  onWarStatusChange
}) => {
  const [isAtWar, setIsAtWar] = useState(false);
  const [warData, setWarData] = useState<{
    battleId: string;
    opponentAlliance: {
      id: string;
      name: string;
    };
    nebulaCorePosition: {x: number, y: number};
    startTime: number;
    duration: number;
    warScore: {
      alliance1: number;
      alliance2: number;
    };
  } | null>(null);
  const [allianceList, setAllianceList] = useState<Array<{
    id: string;
    name: string;
  }>>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingWar, setIsStartingWar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allianceService = AllianceService.getInstance();
  const { toast } = useToast();

  // Load war status
  useEffect(() => {
    const loadWarStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get alliance war status
        const warStatus = await allianceService.getAllianceWarStatus(userAlliance.id);
        setIsAtWar(warStatus.isAtWar);

        // If at war, load war data
        if (warStatus.isAtWar && warStatus.opponentAllianceId) {
          // This would be a call to get the current battle data
          // For now, we'll simulate it
          const opponentAlliance = await allianceService.getAllianceData(warStatus.opponentAllianceId);
          
          setWarData({
            battleId: 'battle-' + Math.random().toString(36).substr(2, 9),
            opponentAlliance: {
              id: opponentAlliance.id,
              name: opponentAlliance.name
            },
            nebulaCorePosition: { x: 150, y: 150 },
            startTime: Date.now() - 3600000, // Started 1 hour ago
            duration: 86400000, // 24 hours
            warScore: {
              alliance1: warStatus.warScore,
              alliance2: Math.floor(Math.random() * 100)
            }
          });
        }

        // Notify parent component
        if (onWarStatusChange) {
          onWarStatusChange(warStatus);
        }

        // Load alliance list for potential opponents
        const alliances = await allianceService.getAllianceList();
        setAllianceList(alliances.filter(alliance => alliance.id !== userAlliance.id));
      } catch (err) {
        console.error('Error loading war status:', err);
        setError('Gagal memuat status perang');
        toast({
          title: "Error",
          description: "Gagal memuat status perang",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userAlliance?.id) {
      loadWarStatus();
    }
  }, [userAlliance.id]);

  // Start a new 12vs12 war
  const startWar = async () => {
    if (!selectedOpponent) {
      toast({
        title: "Pilih Lawan",
        description: "Silakan pilih aliansi lawan terlebih dahulu",
        variant: "warning"
      });
      return;
    }

    try {
      setIsStartingWar(true);
      setError(null);

      // Generate random position for Nebula Inti
      const nebulaCorePosition = {
        x: Math.floor(Math.random() * 300),
        y: Math.floor(Math.random() * 300)
      };

      // Start the 12vs12 battle
      const battleData = await allianceService.startTwelveVsTwelveBattle(
        userAlliance.id,
        selectedOpponent,
        nebulaCorePosition,
        86400000 // 24 hours
      );

      // Update local state
      setIsAtWar(true);
      const opponentAlliance = await allianceService.getAllianceData(selectedOpponent);
      
      setWarData({
        battleId: battleData.battleId,
        opponentAlliance: {
          id: opponentAlliance.id,
          name: opponentAlliance.name
        },
        nebulaCorePosition: battleData.nebulaCorePosition,
        startTime: battleData.startTime,
        duration: battleData.duration,
        warScore: {
          alliance1: 0,
          alliance2: 0
        }
      });

      // Notify parent component
      if (onWarStatusChange) {
        onWarStatusChange({
          isAtWar: true,
          opponentAllianceId: selectedOpponent,
          warScore: 0
        });
      }

      toast({
        title: "Perang Dimulai!",
        description: `Perang melawan ${opponentAlliance.name} telah dimulai!`,
        variant: "default"
      });
    } catch (err) {
      console.error('Error starting war:', err);
      setError('Gagal memulai perang');
      toast({
        title: "Error",
        description: "Gagal memulai perang. Pastikan aliansi memiliki 12 anggota.",
        variant: "destructive"
      });