// Game Configuration for Astral Zodiac Conquest

export interface GameConfig {
  version: string;
  gameConstants: GameConstants;
  battleConfig: BattleConfig;
  resourceConfig: ResourceConfig;
  zodiacConfig: ZodiacConfig;
}

interface GameConstants {
  maxKingdomLevel: number;
  maxUnitTier: number;
  maxAllianceMembers: number;
  baseResourceGatherRate: number;
  baseBuildingTime: number;
  baseUnitTrainingTime: number;
}

interface BattleConfig {
  minBattleDuration: number;
  maxBattleDuration: number;
  baseUnitDamage: number;
  baseUnitHealth: number;
  elementalBonuses: {
    [key: string]: {
      strongAgainst: string;
      weakAgainst: string;
      damageMultiplier: number;
    };
  };
  zodiacComboBonuses: {
    [key: string]: {
      requiredSigns: string[];
      bonus: {
        type: string;
        value: number;
      };
    };
  };
}

interface ResourceConfig {
  baseGatheringRates: {
    stardust: number;
    celestialOre: number;
    ether: number;
  };
  storageCapacity: {
    baseCapacity: number;
    levelMultiplier: number;
  };
  productionBuildings: {
    [key: string]: {
      cost: {
        stardust: number;
        celestialOre: number;
        ether: number;
      };
      productionRate: number;
      upgradeMultiplier: number;
    };
  };
}

interface ZodiacConfig {
  elementalAffinities: {
    Fire: string[];
    Earth: string[];
    Air: string[];
    Water: string[];
  };
  specialAbilityCooldowns: {
    active: number;
    ultimate: number;
  };
  zodiacPowerLevels: {
    [key: string]: {
      baseStats: {
        attack: number;
        defense: number;
        resourceBonus: number;
      };
      levelMultiplier: number;
    };
  };
}

const gameConfig: GameConfig = {
  version: '0.1.0',
  gameConstants: {
    maxKingdomLevel: 50,
    maxUnitTier: 5,
    maxAllianceMembers: 50,
    baseResourceGatherRate: 10,
    baseBuildingTime: 300,
    baseUnitTrainingTime: 60
  },
  battleConfig: {
    minBattleDuration: 60,
    maxBattleDuration: 600,
    baseUnitDamage: 10,
    baseUnitHealth: 100,
    elementalBonuses: {
      Fire: {
        strongAgainst: 'Air',
        weakAgainst: 'Water',
        damageMultiplier: 1.5
      },
      Earth: {
        strongAgainst: 'Water',
        weakAgainst: 'Air',
        damageMultiplier: 1.5
      },
      Air: {
        strongAgainst: 'Earth',
        weakAgainst: 'Fire',
        damageMultiplier: 1.5
      },
      Water: {
        strongAgainst: 'Fire',
        weakAgainst: 'Earth',
        damageMultiplier: 1.5
      }
    },
    zodiacComboBonuses: {
      fireTriangle: {
        requiredSigns: ['Aries', 'Leo', 'Sagittarius'],
        bonus: {
          type: 'attack',
          value: 25
        }
      },
      earthTriangle: {
        requiredSigns: ['Taurus', 'Virgo', 'Capricorn'],
        bonus: {
          type: 'defense',
          value: 25
        }
      },
      airTriangle: {
        requiredSigns: ['Gemini', 'Libra', 'Aquarius'],
        bonus: {
          type: 'speed',
          value: 25
        }
      },
      waterTriangle: {
        requiredSigns: ['Cancer', 'Scorpio', 'Pisces'],
        bonus: {
          type: 'healing',
          value: 25
        }
      }
    }
  },
  resourceConfig: {
    baseGatheringRates: {
      stardust: 5,
      celestialOre: 3,
      ether: 1
    },
    storageCapacity: {
      baseCapacity: 1000,
      levelMultiplier: 1.5
    },
    productionBuildings: {
      stardustCollector: {
        cost: {
          stardust: 100,
          celestialOre: 50,
          ether: 10
        },
        productionRate: 10,
        upgradeMultiplier: 1.2
      },
      celestialMine: {
        cost: {
          stardust: 150,
          celestialOre: 75,
          ether: 15
        },
        productionRate: 6,
        upgradeMultiplier: 1.3
      },
      etherExtractor: {
        cost: {
          stardust: 200,
          celestialOre: 100,
          ether: 20
        },
        productionRate: 2,
        upgradeMultiplier: 1.4
      }
    }
  },
  zodiacConfig: {
    elementalAffinities: {
      Fire: ['Aries', 'Leo', 'Sagittarius'],
      Earth: ['Taurus', 'Virgo', 'Capricorn'],
      Air: ['Gemini', 'Libra', 'Aquarius'],
      Water: ['Cancer', 'Scorpio', 'Pisces']
    },
    specialAbilityCooldowns: {
      active: 180,
      ultimate: 600
    },
    zodiacPowerLevels: {
      Aries: {
        baseStats: {
          attack: 12,
          defense: 8,
          resourceBonus: 5
        },
        levelMultiplier: 1.2
      },
      Taurus: {
        baseStats: {
          attack: 8,
          defense: 12,
          resourceBonus: 10
        },
        levelMultiplier: 1.2
      }
      // ... other zodiac signs with similar structure
    }
  }
};

export default gameConfig;