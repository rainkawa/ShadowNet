import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type GameState = {
  credits: number;
  xp: number;
  level: number;
  trace: number;
  skillPoints: number;
  reputation: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  ownedItems: string[];
  unlockedSkills: string[];
  infrastructure: Record<string, number>;

  operations: {
    id: string;
    missionId: string;
    startedAt: number;
    completesAt: number;
  }[];

  completedToday: number;
  lastOperationResetAt: number;

  lastActiveAt: number;
};

type GameStats = {
  successBonus: number;
  traceReduction: number;
  rewardBonus: number;
  xpBonus: number;
  scanBonus: number;
  passiveIncome: number;
  cpuUsed: number;
  cpuCapacity: number;
  cpuAvailable: number;
};

type GameContextType = {
  game: GameState;
  stats: GameStats;

  addCredits: (amount: number) => void;
  collectPassiveIncome: () => number;
  spendCredits: (amount: number) => boolean;

  addXp: (amount: number) => void;
  addTrace: (amount: number) => void;
  reduceTrace: (amount: number) => void;

  addSkillPoints: (amount: number) => void;
  spendSkillPoints: (amount: number) => boolean;

  addReputation: (amount: number) => void;

  recordOperation: (success: boolean) => void;

  startOperation: (
    missionId: string,
    duration: number
  ) => boolean;

  claimOperation: (
    operationId: string,
    reward: number,
    xp: number,
    reputation: number,
    security: number,
    risk: number
  ) => boolean;

  buyItem: (itemId: string, price: number) => boolean;
  unlockSkill: (skillId: string, cost: number) => boolean;
  upgradeInfrastructure: (
    infrastructureId: string,
    cost: number
  ) => boolean;

  hasItem: (itemId: string) => boolean;
  hasSkill: (skillId: string) => boolean;

  xpRequired: number;
  xpProgress: number;
};

const INITIAL_STATE: GameState = {
  credits: 42500,
  xp: 1240,
  level: 5,
  trace: 17,
  skillPoints: 8,
  reputation: 105,
  totalOperations: 47,
  successfulOperations: 39,
  failedOperations: 8,
  ownedItems: ['scanner'],
  unlockedSkills: [
    'network_scan',
    'exploit_basics',
    'proxy_chain',
    'scripts',
  ],
  infrastructure: {
    scrap: 1,
    proxy: 3,
    rack: 0,
    datacenter: 0,
  },

  operations: [],

  completedToday: 3,
  lastOperationResetAt: Date.now(),

  lastActiveAt: Date.now(),
};

const GameContext =
  createContext<GameContextType | null>(null);

export function GameProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [game, setGame] =
    useState<GameState>(INITIAL_STATE);

  const stats = useMemo<GameStats>(() => {
    let successBonus = 0;
    let traceReduction = 0;
    let rewardBonus = 0;
    let xpBonus = 0;
    let scanBonus = 0;
    let passiveIncome = 0;

    const cpuUsed =
      (game.infrastructure.scrap ?? 0) * 1 +
      (game.infrastructure.proxy ?? 0) * 5 +
      (game.infrastructure.rack ?? 0) * 20 +
      (game.infrastructure.datacenter ?? 0) * 100;

    // Her 5 level +25 CPU kapasitesi.
    // Başlangıçta 100 CPU.
    const cpuCapacity =
      100 + Math.max(0, game.level - 1) * 25;

    const cpuAvailable =
      Math.max(0, cpuCapacity - cpuUsed);

    // Infrastructure
    passiveIncome +=
      (game.infrastructure.scrap_node ?? 0) * 2;

    passiveIncome +=
      (game.infrastructure.proxy_server ?? 0) * 12;

    passiveIncome +=
      (game.infrastructure.botnet_farm ?? 0) * 35;

    passiveIncome +=
      (game.infrastructure.dark_data_center ?? 0) * 150;

    // Skills
    if (game.unlockedSkills.includes('network_scan')) {
      scanBonus += 10;
    }

    if (game.unlockedSkills.includes('exploit_basics')) {
      successBonus += 8;
    }

    if (game.unlockedSkills.includes('proxy_chain')) {
      traceReduction += 10;
    }

    if (game.unlockedSkills.includes('scripts')) {
      xpBonus += 10;
    }

    // Market items
    if (game.ownedItems.includes('scanner')) {
      scanBonus += 12;
    }

    if (game.ownedItems.includes('proxy')) {
      traceReduction += 10;
    }

    if (game.ownedItems.includes('exploit')) {
      successBonus += 20;
    }

    if (game.ownedItems.includes('intel')) {
      rewardBonus += 25;
    }

    if (game.ownedItems.includes('botnet')) {
      passiveIncome += 18;
    }

    if (game.ownedItems.includes('quantum')) {
      successBonus += 15;
      xpBonus += 20;
    }

    return {
      successBonus,
      traceReduction,
      rewardBonus,
      xpBonus,
      scanBonus,
      passiveIncome,
      cpuUsed,
      cpuCapacity,
      cpuAvailable,
    };
  }, [
    game.unlockedSkills,
    game.ownedItems,
    game.infrastructure,
  ]);

  const xpRequired = useMemo(() => {
    return Math.floor(
      1000 + (game.level - 1) * 250
    );
  }, [game.level]);

  const xpProgress = useMemo(() => {
    return Math.min(
      100,
      Math.floor((game.xp / xpRequired) * 100)
    );
  }, [game.xp, xpRequired]);

  const addCredits = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => ({
      ...current,
      credits: current.credits + amount,
    }));
  };

  const collectPassiveIncome = useCallback(() => {
    const now = Date.now();
    let earned = 0;

    setGame((current) => {
      const elapsedSeconds = Math.max(
        0,
        (now - current.lastActiveAt) / 1000
      );

      const cappedSeconds = Math.min(
        elapsedSeconds,
        8 * 60 * 60
      );

      let passiveIncome = 0;

      passiveIncome +=
        (current.infrastructure.scrap_node ?? 0) * 2;

      passiveIncome +=
        (current.infrastructure.proxy_server ?? 0) * 12;

      passiveIncome +=
        (current.infrastructure.botnet_farm ?? 0) * 35;

      passiveIncome +=
        (current.infrastructure.dark_data_center ?? 0) * 150;

      if (current.ownedItems.includes('botnet')) {
        passiveIncome += 18;
      }

      earned = Math.floor(
        cappedSeconds * passiveIncome
      );

      if (earned <= 0) {
        return {
          ...current,
          lastActiveAt: now,
        };
      }

      return {
        ...current,
        credits: current.credits + earned,
        lastActiveAt: now,
      };
    });

    return earned;
  }, []);

  const spendCredits = (amount: number) => {
    if (amount <= 0) return false;

    let success = false;

    setGame((current) => {
      if (current.credits < amount) {
        return current;
      }

      success = true;

      return {
        ...current,
        credits: current.credits - amount,
      };
    });

    return success;
  };

  const addXp = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => {
      let nextXp = current.xp + amount;
      let nextLevel = current.level;
      let nextSkillPoints = current.skillPoints;

      let required =
        1000 + (nextLevel - 1) * 250;

      while (nextXp >= required) {
        nextXp -= required;
        nextLevel += 1;
        nextSkillPoints += 2;

        required =
          1000 + (nextLevel - 1) * 250;
      }

      return {
        ...current,
        xp: nextXp,
        level: nextLevel,
        skillPoints: nextSkillPoints,
      };
    });
  };

  const addTrace = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => ({
      ...current,
      trace: Math.min(
        100,
        current.trace + amount
      ),
    }));
  };

  const reduceTrace = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => ({
      ...current,
      trace: Math.max(
        0,
        current.trace - amount
      ),
    }));
  };

  const addSkillPoints = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => ({
      ...current,
      skillPoints:
        current.skillPoints + amount,
    }));
  };

  const spendSkillPoints = (amount: number) => {
    if (amount <= 0) return false;

    let success = false;

    setGame((current) => {
      if (current.skillPoints < amount) {
        return current;
      }

      success = true;

      return {
        ...current,
        skillPoints:
          current.skillPoints - amount,
      };
    });

    return success;
  };

  const addReputation = (amount: number) => {
    if (amount <= 0) return;

    setGame((current) => ({
      ...current,
      reputation:
        current.reputation + amount,
    }));
  };

  const startOperation = (
    missionId: string,
    duration: number
  ) => {
    let started = false;

    setGame((current) => {
      if (current.operations.length >= 3) {
        return current;
      }

      const now = Date.now();

      const operation = {
        id: `${missionId}-${now}`,
        missionId,
        startedAt: now,
        completesAt: now + duration * 1000,
      };

      started = true;

      return {
        ...current,
        operations: [
          ...current.operations,
          operation,
        ],
      };
    });

    return started;
  };

  const claimOperation = (
    operationId: string,
    reward: number,
    xp: number,
    reputation: number,
    security: number,
    risk: number
  ) => {
    let claimed = false;

    setGame((current) => {
      const operation =
        current.operations.find(
          (item) => item.id === operationId
        );

      if (!operation) {
        return current;
      }

      if (Date.now() < operation.completesAt) {
        return current;
      }

      claimed = true;

      /*
       * OPERATION SUCCESS ENGINE
       *
       * Base success:
       * - Player level helps.
       * - Skills / equipment add successBonus.
       * - Target security reduces success.
       * - Mission risk adds additional difficulty.
       *
       * Minimum chance: 15%
       * Maximum chance: 95%
       */

      const levelBonus =
        current.level * 2;

      const difficulty =
        security * 0.55 +
        risk * 0.45;

      const successChance = Math.min(
        95,
        Math.max(
          15,
          72 +
            levelBonus +
            stats.successBonus -
            difficulty
        )
      );

      const roll =
        Math.random() * 100;

      const success =
        roll < successChance;

      const rewardMultiplier =
        1 + stats.rewardBonus / 100;

      const xpMultiplier =
        1 + stats.xpBonus / 100;

      const finalReward =
        Math.floor(
          reward * rewardMultiplier
        );

      const finalXp =
        Math.floor(
          xp * xpMultiplier
        );

      const successTraceGain = Math.max(
        1,
        Math.floor(
          3 - stats.traceReduction / 20
        )
      );

      const failureTraceGain = Math.max(
        3,
        Math.floor(
          risk / 8 -
          stats.traceReduction / 15
        )
      );

      if (success) {
        return {
          ...current,

          credits:
            current.credits + finalReward,

          xp:
            current.xp + finalXp,

          reputation:
            current.reputation + reputation,

          trace:
            Math.min(
              100,
              current.trace + successTraceGain
            ),

          totalOperations:
            current.totalOperations + 1,

          successfulOperations:
            current.successfulOperations + 1,

          completedToday:
            current.completedToday + 1,

          operations:
            current.operations.filter(
              (item) =>
                item.id !== operationId
            ),

          lastActiveAt: Date.now(),
        };
      }

      return {
        ...current,

        reputation:
          Math.max(
            0,
            current.reputation -
              Math.max(
                1,
                Math.floor(risk / 12)
              )
          ),

        trace:
          Math.min(
            100,
            current.trace + failureTraceGain
          ),

        totalOperations:
          current.totalOperations + 1,

        failedOperations:
          current.failedOperations + 1,

        operations:
          current.operations.filter(
            (item) =>
              item.id !== operationId
          ),

        lastActiveAt: Date.now(),
      };
    });

    return claimed;
  };

  const recordOperation = (
    success: boolean
  ) => {
    setGame((current) => ({
      ...current,
      totalOperations:
        current.totalOperations + 1,
      successfulOperations:
        current.successfulOperations +
        (success ? 1 : 0),
      failedOperations:
        current.failedOperations +
        (success ? 0 : 1),
    }));
  };

  const buyItem = (
    itemId: string,
    price: number
  ) => {
    let purchased = false;

    setGame((current) => {
      if (current.ownedItems.includes(itemId)) {
        return current;
      }

      if (current.credits < price) {
        return current;
      }

      purchased = true;

      return {
        ...current,
        credits:
          current.credits - price,
        ownedItems: [
          ...current.ownedItems,
          itemId,
        ],
      };
    });

    return purchased;
  };

  const unlockSkill = (
    skillId: string,
    cost: number
  ) => {
    let unlocked = false;

    setGame((current) => {
      if (
        current.unlockedSkills.includes(
          skillId
        )
      ) {
        return current;
      }

      if (current.skillPoints < cost) {
        return current;
      }

      unlocked = true;

      return {
        ...current,
        skillPoints:
          current.skillPoints - cost,
        unlockedSkills: [
          ...current.unlockedSkills,
          skillId,
        ],
      };
    });

    return unlocked;
  };

  const upgradeInfrastructure = (
    infrastructureId: string,
    cost: number
  ) => {
    let upgraded = false;

    setGame((current) => {
      if (current.credits < cost) {
        return current;
      }

      const currentLevel =
        current.infrastructure[infrastructureId] ?? 0;

      const cpuCost =
        infrastructureId === 'scrap' ? 1 :
        infrastructureId === 'proxy' ? 5 :
        infrastructureId === 'rack' ? 20 :
        infrastructureId === 'datacenter' ? 100 :
        0;

      const cpuUsed =
        (current.infrastructure.scrap ?? 0) * 1 +
        (current.infrastructure.proxy ?? 0) * 5 +
        (current.infrastructure.rack ?? 0) * 20 +
        (current.infrastructure.datacenter ?? 0) * 100;

      const cpuCapacity =
        100 + Math.max(0, current.level - 1) * 25;

      if (
        cpuCost <= 0 ||
        cpuUsed + cpuCost > cpuCapacity
      ) {
        return current;
      }

      upgraded = true;

      return {
        ...current,
        credits: current.credits - cost,
        infrastructure: {
          ...current.infrastructure,
          [infrastructureId]: currentLevel + 1,
        },
      };
    });

    return upgraded;
  };

  const hasItem = (itemId: string) => {
    return game.ownedItems.includes(itemId);
  };

  const hasSkill = (skillId: string) => {
    return game.unlockedSkills.includes(
      skillId
    );
  };

  const value = useMemo(
    () => ({
      game,
      stats,
      addCredits,
      collectPassiveIncome,
      spendCredits,
      addXp,
      addTrace,
      reduceTrace,
      addSkillPoints,
      spendSkillPoints,
      addReputation,
      recordOperation,
      startOperation,
      claimOperation,
      buyItem,
      unlockSkill,
      upgradeInfrastructure,
      hasItem,
      hasSkill,
      xpRequired,
      xpProgress,
    }),
    [game, stats, xpRequired, xpProgress]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error(
      'useGame must be used inside GameProvider'
    );
  }

  return context;
}
