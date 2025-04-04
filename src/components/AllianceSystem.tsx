import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ZodiacProps } from './ZodiacCard';
import { MultiplayerService } from '@/lib/MultiplayerService';

type AllianceMember = {
  id: string;
  name: string;
  zodiac: ZodiacProps;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
};

type AllianceResource = {
  stardust: number;
  celestialOre: number;
  ether: number;
};

interface AllianceSystemProps {
  userZodiac: ZodiacProps;
  userKingdom: {
    id: string;
    name: string;
  };
  onAllianceUpdate?: (alliance: AllianceData) => void;
}

export interface AllianceData {
  id: string;
  name: string;
  members: AllianceMember[];
  resources: AllianceResource;
  zodiacComboBonuses: {
    combo: string[];
    bonus: string;
    value: number;
  }[];
  warStatus: {
    isAtWar: boolean;
    opponentAllianceId: string | null;
    warScore: number;
  };
}

const AllianceSystem: React.FC<AllianceSystemProps> = ({ 
  userZodiac, 
  userKingdom,
  onAllianceUpdate 
}) => {
  const [alliance, setAlliance] = useState<AllianceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAlliance, setIsCreatingAlliance] = useState(false);
  const [allianceName, setAllianceName] = useState('');
  const [diplomacyStatus, setDiplomacyStatus] = useState<'peace' | 'war' | 'neutral'>('neutral');
  const [warScore, setWarScore] = useState(0);
  const multiplayerService = MultiplayerService.getInstance();
  const { toast } = useToast();

  // Load alliance data
  useEffect(() => {
    const loadAllianceData = async () => {
      try {
        const { data, error } = await supabase
          .from('alliances')
          .select('*')
          .eq('member_ids', userKingdom.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setAlliance(data);
          if (onAllianceUpdate) onAllianceUpdate(data);
          
          // Subscribe to alliance updates
          multiplayerService.subscribeToAlliance(data.id, (payload) => {
            setAlliance(payload.new);
            if (onAllianceUpdate) onAllianceUpdate(payload.new);
          });
        }
      } catch (error) {
        toast({
          title: "Error loading alliance",
          description: "Could not load alliance data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllianceData();
    
    return () => {
      if (alliance?.id) {
        multiplayerService.unsubscribeFromAlliance(alliance.id);
      }
    };
  }, [userKingdom.id]);

  // Handle creating new alliance
  const createAlliance = async () => {
    if (!allianceName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid alliance name",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAlliance(true);
    
    try {
      const { data, error } = await supabase
        .from('alliances')
        .insert([{
          name: allianceName,
          leader_id: userKingdom.id,
          member_ids: [userKingdom.id],
          resources: {
            stardust: 0,
            celestialOre: 0,
            ether: 0
          },
          zodiac_combo_bonuses: [],
          war_status: {
            isAtWar: false,
            opponentAllianceId: null,
            warScore: 0
          }
        }])
        .select()
        .single();

      if (error) throw error;
      
      setAlliance(data);
      toast({
        title: "Alliance created",
        description: `You have founded the ${allianceName} alliance!`
      });
      
      // Subscribe to alliance updates
      multiplayerService.subscribeToAlliance(data.id, (payload) => {
        setAlliance(payload.new);
        if (onAllianceUpdate) onAllianceUpdate(payload.new);
      });
    } catch (error) {
      toast({
        title: "Error creating alliance",
        description: "Could not create alliance",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAlliance(false);
    }
  };

  // Handle declaring war
  const declareWar = async (targetAllianceId: string) => {
    if (!alliance) return;
    
    try {
      const { error } = await supabase
        .from('alliances')
        .update({
          war_status: {
            isAtWar: true,
            opponentAllianceId: targetAllianceId,
            warScore: 0
          }
        })
        .eq('id', alliance.id);

      if (error) throw error;
      
      setDiplomacyStatus('war');
      toast({
        title: "War declared",
        description: "Your alliance is now at war!"
      });
      
      // Notify all members
      multiplayerService.broadcastToAlliance(alliance.id, {
        type: 'war-declaration',
        targetAllianceId
      });
    } catch (error) {
      toast({
        title: "Error declaring war",
        description: "Could not declare war",
        variant: "destructive"
      });
    }
  };

  // Handle peace treaty
  const proposePeace = async () => {
    if (!alliance || !alliance.warStatus.isAtWar) return;
    
    try {
      const { error } = await supabase
        .from('alliances')
        .update({
          war_status: {
            isAtWar: false,
            opponentAllianceId: null,
            warScore: 0
          }
        })
        .eq('id', alliance.id);

      if (error) throw error;
      
      setDiplomacyStatus('peace');
      toast({
        title: "Peace proposed",
        description: "You have proposed a peace treaty"
      });
      
      // Notify opponent alliance
      if (alliance.warStatus.opponentAllianceId) {
        multiplayerService.broadcastToAlliance(alliance.warStatus.opponentAllianceId, {
          type: 'peace-proposal',
          fromAllianceId: alliance.id
        });
      }
    } catch (error) {
      toast({
        title: "Error proposing peace",
        description: "Could not propose peace",
        variant: "destructive"
      });
    }
  };

  // Handle 12v12 war matchmaking
  const findWarMatch = async () => {
    if (!alliance) return;
    
    try {
      const { data, error } = await supabase
        .rpc('find_alliance_war_match', {
          alliance_id: alliance.id,
          zodiac_combo: alliance.zodiacComboBonuses.map(b => b.combo.join('+'))
        });

      if (error) throw error;
      
      if (data) {
        declareWar(data.opponent_alliance_id);
      } else {
        toast({
          title: "No match found",
          description: "Could not find a suitable alliance to war against",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error finding war match",
        description: "Could not search for war match",
        variant: "destructive"
      });
    }
  };

  // Calculate zodiac combo bonuses
  const calculateZodiacBonuses = (members: AllianceMember[]) => {
    const zodiacs = members.map(m => m.zodiac.id);
    const bonuses = [];
    
    // Example bonuses based on zodiac combinations
    if (zodiacs.includes('aries') && zodiacs.includes('leo') && zodiacs.includes('sagittarius')) {
      bonuses.push({
        combo: ['aries', 'leo', 'sagittarius'],
        bonus: "Fire Trine",
        value: 0.15
      });
    }
    
    if (zodiacs.includes('taurus') && zodiacs.includes('virgo') && zodiacs.includes('capricorn')) {
      bonuses.push({
        combo: ['taurus', 'virgo', 'capricorn'],
        bonus: "Earth Trine",
        value: 0.15
      });
    }
    
    if (zodiacs.includes('gemini') && zodiacs.includes('libra') && zodiacs.includes('aquarius')) {
      bonuses.push({
        combo: ['gemini', 'libra', 'aquarius'],
        bonus: "Air Trine",
        value: 0.15
      });
    }
    
    if (zodiacs.includes('cancer') && zodiacs.includes('scorpio') && zodiacs.includes('pisces')) {
      bonuses.push({
        combo: ['cancer', 'scorpio', 'pisces'],
        bonus: "Water Trine",
        value: 0.15
      });
    }
    
    return bonuses;
  };

  if (isLoading) {
    return <div>Loading alliance data...</div>;
  }

  return (
    <div className="alliance-system">
      {!alliance ? (
        <div className="create-alliance">
          <h2>Create New Alliance</h2>
          <p>Form an alliance with other zodiac kingdoms to gain bonuses and compete in 12v12 wars!</p>
          
          <div className="alliance-form">
            <input 
              type="text" 
              value={allianceName}
              onChange={(e) => setAllianceName(e.target.value)}
              placeholder="Alliance name"
            />
            <button 
              onClick={createAlliance}
              disabled={isCreatingAlliance}
            >
              {isCreatingAlliance ? 'Creating...' : 'Create Alliance'}
            </button>
          </div>
        </div>
      ) : (
        <div className="alliance-dashboard">
          <h2>{alliance.name}</h2>
          
          <div className="alliance-members">
            <h3>Members ({alliance.members.length}/12)</h3>
            <div className="member-list">
              {alliance.members.map(member => (
                <div key={member.id} className="member-card">
                  <span className="member-name">{member.name}</span>
                  <span className="member-zodiac">{member.zodiac.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="alliance-bonuses">
            <h3>Zodiac Bonuses</h3>
            {alliance.zodiacComboBonuses.length > 0 ? (
              <ul>
                {alliance.zodiacComboBonuses.map((bonus, index) => (
                  <li key={index}>
                    <strong>{bonus.combo.join(' + ')}</strong>: {bonus.bonus} (+{bonus.value * 100}%)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active zodiac bonuses</p>
            )}
          </div>
          
          <div className="alliance-actions">
            <h3>Alliance Actions</h3>
            
            {alliance.warStatus.isAtWar ? (
              <div className="war-status">
                <p>Currently at war!</p>
                <p>War Score: {warScore}</p>
                <button onClick={proposePeace}>Propose Peace</button>
              </div>
            ) : (
              <button 
                onClick={findWarMatch}
                disabled={alliance.members.length < 12}
              >
                {alliance.members.length < 12 
                  ? `Need ${12 - alliance.members.length} more members for war` 
                  : 'Find 12v12 War Match'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllianceSystem;