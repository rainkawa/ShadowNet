import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  ReactNode,
} from 'react';

type OperationState = {
  id: string;
  missionId: string;
  startedAt: number;
  completesAt: number;
};

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

  operations: OperationState[];

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

  xpRequired: number;
  xpProgress: number;

  rank: string;
  rankNext: string | null;
  rankProgress: number;

  addCredits: (amount: number) => void;
  collectPassiveIncome: () => number;

  addXp: (amount: number) => void;

  addTrace: (amount: number) => void;
  reduceTrace: (amount: number) => void;

  addSkillPoints: (amount: number) => void;
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

  buyItem: (
    itemId: string,
    price: number
  ) => boolean;

  unlockSkill: (
    skillId: string,
    cost: number
  ) => boolean;

  upgradeInfrastructure: (
    infrastructureId: string,
    cost: number
  ) => boolean;

  hasItem: (itemId: string) => boolean;
  hasSkill: (skillId: string) => boolean;
};

const INITIAL_STATE: GameState = {
  credits: 250,
  xp: 0,
  level: 1,
  trace: 5,
  skillPoints: 0,
  reputation: 0,

  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,

  ownedItems: [],
  unlockedSkills: [],

  infrastructure: {
    scrap: 1,
    proxy: 0,
    rack: 0,
    datacenter: 0,
  },

  operations: [],

  completedToday: 0,
  lastOperationResetAt: Date.now(),

  lastActiveAt: Date.now(),
};

const GameContext =
  createContext<GameContextType | null>(null);

function getRank(level: number) {
  if (level >= 50) return 'SHADOW';
  if (level >= 40) return 'ELITE';
  if (level >= 30) return 'GHOST';
  if (level >= 20) return 'SPECIALIST';
  if (level >= 10) return 'OPERATIVE';
  if (level >= 5) return 'RUNNER';
  return 'ROOKIE';
}

function getNextRank(level: number): string | null {
  if (level < 5) return 'RUNNER';
  if (level < 10) return 'OPERATIVE';
  if (level < 20) return 'SPECIALIST';
  if (level < 30) return 'GHOST';
  if (level < 40) return 'ELITE';
  if (level < 50) return 'SHADOW';
  return null;
}

function getRankProgress(level: number) {
  if (level >= 50) return 100;
  if (level < 5) return (level / 5) * 100;
  if (level < 10) return ((level - 5) / 5) * 100;
  if (level < 20) return ((level - 10) / 10) * 100;
  if (level < 30) return ((level - 20) / 10) * 100;
  if (level < 40) return ((level - 30) / 10) * 100;
  return ((level - 40) / 10) * 100;
}

export function GameProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [game, setGame] =
    useState<GameState>(INITIAL_STATE);

  const xpRequired = useMemo(() => {
    return Math.floor(
      500 + Math.pow(game.level, 1.35) * 120
    );
  }, [game.level]);

  const xpProgress = useMemo(() => {
    if (xpRequired <= 0) return 0;

    return Math.min(
      100,
      Math.floor(
        (game.xp / xpRequired) * 100
      )
    );
  }, [game.xp, xpRequired]);

  const rank = useMemo(
    () => getRank(game.level),
    [game.level]
  );

  const rankNext = useMemo(
    () => getNextRank(game.level),
    [game.level]
  );

  const rankProgress = useMemo(
    () => getRankProgress(game.level),
    [game.level]
  );

  const stats = useMemo<GameStats>(() => {
    let successBonus = 0;
    let traceReduction = 0;
    let rewardBonus = 0;
    let xpBonus = 0;
    let scanBonus = 0;
    let passiveIncome = 0;

    const scrap =
      game.infrastructure.scrap ?? 0;

    const proxy =
      game.infrastructure.proxy ?? 0;

    const rack =
      game.infrastructure.rack ?? 0;

    const datacenter =
      game.infrastructure.datacenter ?? 0;

    const cpuUsed =
      scrap * 1 +
      proxy * 5 +
      rack * 20 +
      datacenter * 100;

    const cpuCapacity =
      100 +
      Math.max(
        0,
        game.level - 1
      ) * 25;

    const cpuAvailable =
      Math.max(
        0,
        cpuCapacity - cpuUsed
      );

    passiveIncome += scrap * 2;
    passiveIncome += proxy * 12;
    passiveIncome += rack * 35;
    passiveIncome += datacenter * 150;

    if (
      game.unlockedSkills.includes(
        'network_scan'
      )
    ) {
      scanBonus += 10;
    }

    if (
      game.unlockedSkills.includes(
        'exploit_basics'
      )
    ) {
      successBonus += 8;
    }

    if (
      game.unlockedSkills.includes(
        'proxy_chain'
      )
    ) {
      traceReduction += 10;
    }

    if (
      game.unlockedSkills.includes(
        'scripts'
      )
    ) {
      xpBonus += 10;
    }

    if (
      game.ownedItems.includes(
        'scanner'
      )
    ) {
      scanBonus += 12;
    }

    if (
      game.ownedItems.includes(
        'proxy'
      )
    ) {
      traceReduction += 10;
    }

    if (
      game.ownedItems.includes(
        'exploit'
      )
    ) {
      successBonus += 20;
    }

    if (
      game.ownedItems.includes(
        'intel'
      )
    ) {
      rewardBonus += 25;
    }

    if (
      game.ownedItems.includes(
        'botnet'
      )
    ) {
      passiveIncome += 18;
    }

    if (
      game.ownedItems.includes(
        'quantum'
      )
    ) {
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
    game.level,
    game.infrastructure,
    game.ownedItems,
    game.unlockedSkills,
  ]);

  const addCredits = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setGame((current) => ({
        ...current,
        credits:
          current.credits + amount,
      }));
    },
    []
  );

  const collectPassiveIncome =
    useCallback(() => {
      const now = Date.now();
      let earned = 0;

      setGame((current) => {
        const elapsedSeconds =
          Math.max(
            0,
            (now - current.lastActiveAt) /
              1000
          );

        const cappedSeconds =
          Math.min(
            elapsedSeconds,
            8 * 60 * 60
          );

        let income = 0;

        income +=
          (current.infrastructure.scrap ?? 0) * 2;

        income +=
          (current.infrastructure.proxy ?? 0) * 12;

        income +=
          (current.infrastructure.rack ?? 0) * 35;

        income +=
          (current.infrastructure.datacenter ?? 0) * 150;

        if (
          current.ownedItems.includes(
            'botnet'
          )
        ) {
          income += 18;
        }

        earned = Math.floor(
          cappedSeconds * income
        );

        return {
          ...current,
          credits:
            current.credits + earned,
          lastActiveAt: now,
        };
      });

      return earned;
    }, []);

  const addXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setGame((current) => {
        let nextXp =
          current.xp + amount;

        let nextLevel =
          current.level;

        let nextSkillPoints =
          current.skillPoints;

        let required =
          Math.floor(
            500 +
              Math.pow(
                nextLevel,
                1.35
              ) *
              120
          );

        while (
          nextXp >= required &&
          nextLevel < 50
        ) {
          nextXp -= required;
          nextLevel += 1;
          nextSkillPoints += 1;

          required =
            Math.floor(
              500 +
                Math.pow(
                  nextLevel,
                  1.35
                ) *
                120
            );
        }

        if (nextLevel >= 50) {
          nextXp = Math.min(
            nextXp,
            required
          );
        }

        return {
          ...current,
          xp: nextXp,
          level: nextLevel,
          skillPoints:
            nextSkillPoints,
        };
      });
    },
    []
  );

  const addTrace = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setGame((current) => ({
        ...current,
        trace: Math.min(
          100,
          current.trace + amount
        ),
      }));
    },
    []
  );

  const reduceTrace = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setGame((current) => ({
        ...current,
        trace: Math.max(
          0,
          current.trace - amount
        ),
      }));
    },
    []
  );

  const addSkillPoints = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      setGame((current) => ({
        ...current,
        skillPoints:
          current.skillPoints + amount,
      }));
    },
    []
  );

  const addReputation = useCallback(
    (amount: number) => {
      if (amount === 0) return;

      setGame((current) => ({
        ...current,
        reputation: Math.max(
          0,
          current.reputation + amount
        ),
      }));
    },
    []
  );

  const recordOperation = useCallback(
    (success: boolean) => {
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
    },
    []
  );

  const startOperation = useCallback(
    (
      missionId: string,
      duration: number
    ) => {
      let started = false;

      setGame((current) => {
        if (
          current.operations.length >= 3
        ) {
          return current;
        }

        const now = Date.now();

        const operation: OperationState = {
          id: `${missionId}-${now}`,
          missionId,
          startedAt: now,
          completesAt:
            now + duration * 1000,
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
    },
    []
  );

  const claimOperation = useCallback(
    (
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
            (item) =>
              item.id === operationId
          );

        if (!operation) {
          return current;
        }

        if (
          Date.now() <
          operation.completesAt
        ) {
          return current;
        }

        claimed = true;

        const difficulty =
          security * 0.55 +
          risk * 0.45;

        const levelBonus =
          current.level * 2;

        const successChance =
          Math.min(
            95,
            Math.max(
              15,
              72 +
                levelBonus +
                stats.successBonus -
                difficulty
            )
          );

        const success =
          Math.random() * 100 <
          successChance;

        const rewardMultiplier =
          1 +
          stats.rewardBonus / 100;

        const xpMultiplier =
          1 +
          stats.xpBonus / 100;

        const finalReward =
          Math.floor(
            reward * rewardMultiplier
          );

        const finalXp =
          Math.floor(
            xp * xpMultiplier
          );

        if (success) {
          return {
            ...current,

            credits:
              current.credits +
              finalReward,

            xp:
              current.xp +
              finalXp,

            reputation:
              current.reputation +
              reputation,

            trace: Math.min(
              100,
              current.trace +
                Math.max(
                  1,
                  Math.floor(
                    3 -
                      stats.traceReduction /
                        20
                  )
                )
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
                  item.id !==
                  operationId
              ),

            lastActiveAt:
              Date.now(),
          };
        }

        return {
          ...current,

          reputation: Math.max(
            0,
            current.reputation -
              Math.max(
                1,
                Math.floor(
                  risk / 12
                )
              )
          ),

          trace: Math.min(
            100,
            current.trace +
              Math.max(
                3,
                Math.floor(
                  risk / 8 -
                    stats.traceReduction /
                      15
                )
              )
          ),

          totalOperations:
            current.totalOperations + 1,

          failedOperations:
            current.failedOperations + 1,

          completedToday:
            current.completedToday + 1,

          operations:
            current.operations.filter(
              (item) =>
                item.id !== operationId
            ),

          lastActiveAt:
            Date.now(),
        };
      });

      return claimed;
    },
    [stats]
  );

  const buyItem = useCallback(
    (
      itemId: string,
      price: number
    ) => {
      let purchased = false;

      setGame((current) => {
        if (
          current.ownedItems.includes(
            itemId
          )
        ) {
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
    },
    []
  );

  const unlockSkill = useCallback(
    (
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

        if (
          current.skillPoints < cost
        ) {
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
    },
    []
  );

  const upgradeInfrastructure =
    useCallback(
      (
        infrastructureId: string,
        cost: number
      ) => {
        let upgraded = false;

        setGame((current) => {
          if (
            current.credits < cost
          ) {
            return current;
          }

          const cpuCost =
            infrastructureId === 'scrap'
              ? 1
              : infrastructureId ===
                'proxy'
                ? 5
                : infrastructureId ===
                  'rack'
                  ? 20
                  : infrastructureId ===
                    'datacenter'
                    ? 100
                    : 0;

          if (cpuCost <= 0) {
            return current;
          }

          const currentCpu =
            (current.infrastructure
              .scrap ?? 0) *
              1 +
            (current.infrastructure
              .proxy ?? 0) *
              5 +
            (current.infrastructure
              .rack ?? 0) *
              20 +
            (current.infrastructure
              .datacenter ?? 0) *
              100;

          const cpuCapacity =
            100 +
            Math.max(
              0,
              current.level - 1
            ) *
              25;

          if (
            currentCpu + cpuCost >
            cpuCapacity
          ) {
            return current;
          }

          const currentLevel =
            current.infrastructure[
              infrastructureId
            ] ?? 0;

          upgraded = true;

          return {
            ...current,
            credits:
              current.credits - cost,
            infrastructure: {
              ...current.infrastructure,
              [infrastructureId]:
                currentLevel + 1,
            },
          };
        });

        return upgraded;
      },
      []
    );

  const hasItem = useCallback(
    (itemId: string) =>
      game.ownedItems.includes(
        itemId
      ),
    [game.ownedItems]
  );

  const hasSkill = useCallback(
    (skillId: string) =>
      game.unlockedSkills.includes(
        skillId
      ),
    [game.unlockedSkills]
  );

  const value = useMemo(
    () => ({
      game,
      stats,

      xpRequired,
      xpProgress,

      rank,
      rankNext,
      rankProgress,

      addCredits,
      collectPassiveIncome,

      addXp,

      addTrace,
      reduceTrace,

      addSkillPoints,
      addReputation,

      recordOperation,

      startOperation,
      claimOperation,

      buyItem,
      unlockSkill,
      upgradeInfrastructure,

      hasItem,
      hasSkill,
    }),
    [
      game,
      stats,
      xpRequired,
      xpProgress,
      rank,
      rankNext,
      rankProgress,
      addCredits,
      collectPassiveIncome,
      addXp,
      addTrace,
      reduceTrace,
      addSkillPoints,
      addReputation,
      recordOperation,
      startOperation,
      claimOperation,
      buyItem,
      unlockSkill,
      upgradeInfrastructure,
      hasItem,
      hasSkill,
    ]
  );

  return (
    <GameContext.Provider
      value={value}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context =
    useContext(GameContext);

  if (!context) {
    throw new Error(
      'useGame must be used inside GameProvider'
    );
  }

  return context;
}
