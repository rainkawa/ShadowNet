import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

type OperationOutcome =
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL'
  | 'FAILURE'
  | 'CRITICAL_FAILURE';

type OperationState = {
  id: string;
  missionId: string;
  startedAt: number;
  completesAt: number;

  phase: number;
  mistakes: number;
  warnings: number;
  traceGenerated: number;

  completed: boolean;
  outcome: OperationOutcome;

  finalReward?: number;
  finalXp?: number;
  finalTrace?: number;
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

  operationHistory: OperationState[];

  completedToday: number;
  lastOperationResetAt: number;

  lastActiveAt: number;
  lastTraceReductionAt: number;
};

type GameStats = {
  successBonus: number;
  traceReduction: number;
  rewardBonus: number;
  xpBonus: number;
  scanBonus: number;

  heatLevel: number;
  heatMultiplier: number;

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

  rankUpVersion: number;
  rankUpMessage: string | null;
  clearRankUp: () => void;

  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
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
  ) => string | null;

  advanceOperation: (
    operationId: string,
    success: boolean,
    tracePenalty: number
  ) => boolean;

  resolveOperation: (
    operationId: string,
    reward: number,
    xp: number,
    reputation: number
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
  /*
   * ECONOMY V2
   *
   * Eski 250 kredi başlangıç için fazla cömertti.
   * Oyuncu ilk dakikada market ekonomisini ezemesin.
   */
  credits: 100,

  xp: 0,
  level: 1,

  /*
   * Başlangıç trace'i artık biraz daha anlamlı.
   * Oyuncu direkt olarak tamamen temiz başlamıyor.
   */
  trace: 3,

  skillPoints: 0,
  reputation: 0,

  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,

  ownedItems: [],
  unlockedSkills: [],

  infrastructure: {
    /*
     * Passive ekonomi baştan açık değil.
     * İlk node'u oyuncu satın almak zorunda.
     */
    scrap: 0,
    proxy: 0,
    rack: 0,
    datacenter: 0,
  },

  operations: [],

  operationHistory: [],

  completedToday: 0,
  lastOperationResetAt: Date.now(),

  lastActiveAt: Date.now(),

  lastTraceReductionAt: 0,
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

function getNextRank(
  level: number
): string | null {
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
  if (level < 5) {
    return (level / 5) * 100;
  }

  if (level < 10) {
    return ((level - 5) / 5) * 100;
  }

  if (level < 20) {
    return ((level - 10) / 10) * 100;
  }

  if (level < 30) {
    return ((level - 20) / 10) * 100;
  }

  if (level < 40) {
    return ((level - 30) / 10) * 100;
  }

  return ((level - 40) / 10) * 100;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function currentHeatLevel(
  trace: number
) {
  if (trace >= 90) return 5;
  if (trace >= 70) return 4;
  if (trace >= 50) return 3;
  if (trace >= 25) return 2;
  return 1;
}

export function GameProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [game, setGame] =
    useState<GameState>(INITIAL_STATE);

  const [rankUpVersion, setRankUpVersion] =
    useState(0);

  const [rankUpMessage, setRankUpMessage] =
    useState<string | null>(null);

  const clearRankUp = useCallback(() => {
    setRankUpMessage(null);
  }, []);

  /*
   * XP CURVE V2
   *
   * Level yükseldikçe gereken XP daha sert artıyor.
   */
  const xpRequired = useMemo(() => {
    return Math.floor(
      650 +
        Math.pow(game.level, 1.45) *
          145
    );
  }, [game.level]);

  const xpProgress = useMemo(() => {
    if (xpRequired <= 0) {
      return 0;
    }

    return clamp(
      Math.floor(
        (game.xp / xpRequired) * 100
      ),
      0,
      100
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

  /*
   * STATS
   *
   * Burada item ve skill etkilerini gerçekten
   * sayısal olarak topluyoruz.
   */
  const stats = useMemo<GameStats>(() => {
    let successBonus = 0;
    let traceReduction = 0;
    let rewardBonus = 0;
    let xpBonus = 0;
    let scanBonus = 0;

    const heatLevel =
      currentHeatLevel(game.trace);

    const heatMultiplier =
      1 +
      Math.max(
        0,
        heatLevel - 1
      ) *
        0.08;

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
      70 +
      Math.max(
        0,
        game.level - 1
      ) * 20;

    const cpuAvailable =
      Math.max(
        0,
        cpuCapacity - cpuUsed
      );

    /*
     * PASSIVE ECONOMY V2
     *
     * Önceki değerler oyunu çok hızlı besliyordu.
     * Yeni değerler intentionally düşük.
     */
    passiveIncome += scrap * 0.5;
    passiveIncome += proxy * 2;
    passiveIncome += rack * 7;
    passiveIncome += datacenter * 25;

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
      successBonus += 6;
    }

    if (
      game.unlockedSkills.includes(
        'proxy_chain'
      )
    ) {
      traceReduction += 8;
    }

    if (
      game.unlockedSkills.includes(
        'ghost_identity'
      )
    ) {
      traceReduction += 12;
    }

    if (
      game.unlockedSkills.includes(
        'vanish'
      )
    ) {
      traceReduction += 18;
    }

    if (
      game.unlockedSkills.includes(
        'scripts'
      )
    ) {
      xpBonus += 5;
      passiveIncome *= 1.05;
    }

    if (
      game.unlockedSkills.includes(
        'packet_analysis'
      )
    ) {
      successBonus += 4;
    }

    if (
      game.unlockedSkills.includes(
        'zero_day'
      )
    ) {
      successBonus += 7;
    }

    if (
      game.unlockedSkills.includes(
        'root_access'
      )
    ) {
      rewardBonus += 10;
    }

    if (
      game.unlockedSkills.includes(
        'deep_scan'
      )
    ) {
      scanBonus += 15;
    }

    /*
     * ITEM BONUSES
     */
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
      successBonus += 12;
    }

    if (
      game.ownedItems.includes(
        'intel'
      )
    ) {
      rewardBonus += 12;
    }

    if (
      game.ownedItems.includes(
        'botnet'
      )
    ) {
      passiveIncome += 3;
    }

    if (
      game.ownedItems.includes(
        'quantum'
      )
    ) {
      successBonus += 8;
      xpBonus += 10;
    }

    return {
      successBonus,
      traceReduction,
      rewardBonus,
      xpBonus,
      scanBonus,

      heatLevel,
      heatMultiplier,

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
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      setGame((current) => ({
        ...current,
        credits:
          current.credits +
          Math.floor(amount),
      }));
    },
    []
  );

  /*
   * OFFLINE / PASSIVE INCOME
   *
   * Saniyelik gelir korunuyor fakat çok daha düşük.
   * 8 saat cap devam ediyor.
   */
  const spendCredits = useCallback(
    (amount: number) => {
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return false;
      }

      const cost =
        Math.floor(amount);

      let spent = false;

      setGame((current) => {
        if (
          current.credits < cost
        ) {
          return current;
        }

        spent = true;

        return {
          ...current,
          credits:
            current.credits - cost,
          lastActiveAt:
            Date.now(),
        };
      });

      return spent;
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
            (now -
              current.lastActiveAt) /
              1000
          );

        const cappedSeconds =
          Math.min(
            elapsedSeconds,
            8 * 60 * 60
          );

        let incomePerSecond = 0;

        incomePerSecond +=
          (current.infrastructure
            .scrap ?? 0) * 0.5;

        incomePerSecond +=
          (current.infrastructure
            .proxy ?? 0) * 2;

        incomePerSecond +=
          (current.infrastructure
            .rack ?? 0) * 7;

        incomePerSecond +=
          (current.infrastructure
            .datacenter ?? 0) * 25;

        if (
          current.ownedItems.includes(
            'botnet'
          )
        ) {
          incomePerSecond += 3;
        }

        if (
          current.unlockedSkills.includes(
            'scripts'
          )
        ) {
          incomePerSecond *= 1.05;
        }

        earned = Math.floor(
          cappedSeconds *
            incomePerSecond
        );

        return {
          ...current,

          credits:
            current.credits +
            Math.max(0, earned),

          lastActiveAt: now,
        };
      });

      return earned;
    }, []);

  const addXp = useCallback(
    (amount: number) => {
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      setGame((current) => {
        const previousRank =
          getRank(
            current.level
          );

        let nextXp =
          current.xp +
          Math.floor(amount);

        let nextLevel =
          current.level;

        let nextSkillPoints =
          current.skillPoints;

        let required =
          Math.floor(
            650 +
              Math.pow(
                nextLevel,
                1.45
              ) *
                145
          );

        while (
          nextXp >= required &&
          nextLevel < 50
        ) {
          nextXp -= required;

          nextLevel += 1;

          /*
           * Her level sadece 1 SP.
           * Böylece skill ağacı da ekonomi kadar hızlı bitmiyor.
           */
          nextSkillPoints += 1;

          required =
            Math.floor(
              650 +
                Math.pow(
                  nextLevel,
                  1.45
                ) *
                  145
            );
        }

        if (
          nextLevel >= 50
        ) {
          nextXp = Math.min(
            nextXp,
            required
          );
        }

        const nextRank =
          getRank(nextLevel);

        if (
          nextRank !==
          previousRank
        ) {
          setRankUpMessage(
            `RANK UP // ${nextRank}`
          );

          setRankUpVersion(
            (value) =>
              value + 1
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
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      setGame((current) => ({
        ...current,

        trace: clamp(
          current.trace +
            Math.floor(amount),
          0,
          100
        ),
      }));
    },
    []
  );

  const reduceTrace = useCallback(
    (amount: number) => {
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return;
      }

      setGame((current) => ({
        ...current,

        trace: clamp(
          current.trace -
            Math.floor(amount),
          0,
          100
        ),
        lastActiveAt:
          Date.now(),
      }));
    },
    []
  );

  const reduceTraceSafely = useCallback(
    (
      amount: number,
      cooldownMs: number
    ) => {
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isFinite(cooldownMs) ||
        cooldownMs < 0
      ) {
        return false;
      }

      const now =
        Date.now();

      let reduced = false;

      setGame((current) => {
        if (
          current.trace <= 0
        ) {
          return current;
        }

        if (
          now -
            current.lastTraceReductionAt <
          cooldownMs
        ) {
          return current;
        }

        reduced = true;

        return {
          ...current,

          trace: clamp(
            current.trace -
              Math.floor(amount),
            0,
            100
          ),

          lastTraceReductionAt:
            now,

          lastActiveAt:
            now,
        };
      });

      return reduced;
    },
    []
  );

  const addSkillPoints =
    useCallback(
      (amount: number) => {
        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return;
        }

        setGame((current) => ({
          ...current,

          skillPoints:
            current.skillPoints +
            Math.floor(amount),
        }));
      },
      []
    );

  const addReputation =
    useCallback(
      (amount: number) => {
        if (
          !Number.isFinite(amount) ||
          amount === 0
        ) {
          return;
        }

        setGame((current) => ({
          ...current,

          reputation:
            Math.max(
              0,
              current.reputation +
                Math.floor(amount)
            ),
        }));
      },
      []
    );

  const recordOperation =
    useCallback(
      (success: boolean) => {
        setGame((current) => ({
          ...current,

          totalOperations:
            current.totalOperations +
            1,

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

  /*
   * OPERATION START
   */
  const startOperation =
    useCallback(
      (
        missionId: string,
        duration: number
      ) => {
        const now =
          Date.now();

        const safeDuration =
          Math.max(
            1,
            Math.floor(duration)
          );

        const operationId =
          `${missionId}-${now}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

        let started = false;

        setGame((current) => {
          /*
           * Aynı anda sadece 1 operasyon.
           */
          if (
            current.operations
              .length >= 1
          ) {
            return current;
          }

          /*
           * Trace %100 ise yeni operasyon açılamaz.
           * Önümüzdeki sistemlerde güvenli bekleme
           * ve trace düşürme bunun etrafına kurulacak.
           */
          if (
            current.trace >= 100
          ) {
            return current;
          }

          const operation: OperationState =
            {
              id: operationId,

              missionId,

              startedAt: now,

              completesAt:
                now +
                safeDuration *
                  1000,

              phase: 0,

              mistakes: 0,

              warnings: 0,

              traceGenerated: 0,

              completed: false,

              outcome:
                'RUNNING',
            };

          started = true;

          return {
            ...current,

            operations: [
              ...current.operations,
              operation,
            ],

            lastActiveAt:
              now,
          };
        });

        return started
          ? operationId
          : null;
      },
      []
    );

  /*
   * OPERATION ADVANCE V2
   *
   * Bir yanlış karar trace üretir.
   * İki yanlış karar kritik failure.
   * Trace 100'e ulaştığında anında operasyon kesilir.
   */
  const advanceOperation =
    useCallback(
      (
        operationId: string,
        success: boolean,
        tracePenalty: number
      ) => {
        let advanced = false;

        setGame((current) => {
          const operation =
            current.operations.find(
              (item) =>
                item.id ===
                operationId
            );

          if (
            !operation ||
            operation.completed
          ) {
            return current;
          }

          advanced = true;

          const safeTracePenalty =
            Math.max(
              0,
              Math.floor(
                Number.isFinite(
                  tracePenalty
                )
                  ? tracePenalty
                  : 0
              )
            );

          if (success) {
            return {
              ...current,

              operations:
                current.operations.map(
                  (item) =>
                    item.id ===
                    operationId
                      ? {
                          ...item,

                          phase:
                            Math.min(
                              3,
                              item.phase +
                                1
                            ),
                        }
                      : item
                ),
            };
          }

          const nextMistakes =
            operation.mistakes +
            1;

          const nextTrace =
            clamp(
              current.trace +
                safeTracePenalty,
              0,
              100
            );

          const criticalFailure =
            nextMistakes >=
              2 ||
            nextTrace >= 100;

          return {
            ...current,

            trace:
              nextTrace,

            operations:
              current.operations.map(
                (item) =>
                  item.id ===
                  operationId
                    ? {
                        ...item,

                        phase:
                          Math.min(
                            3,
                            item.phase +
                              1
                          ),

                        mistakes:
                          nextMistakes,

                        warnings:
                          item.warnings +
                          1,

                        traceGenerated:
                          item.traceGenerated +
                          safeTracePenalty,

                        completed:
                          criticalFailure,

                        outcome:
                          criticalFailure
                            ? 'CRITICAL_FAILURE'
                            : 'RUNNING',
                      }
                    : item
              ),
          };
        });

        return advanced;
      },
      []
    );

  /*
   * RESOLUTION V2
   *
   * Başarılar artık aynı değerde değil.
   *
   * 0 hata:
   *   normal success
   *   düşük ihtimal critical success
   *
   * 1 hata:
   *   partial
   *
   * 2 hata:
   *   critical failure
   *
   * Ayrıca son payout daha kontrollü.
   */
  const resolveOperation =
    useCallback(
      (
        operationId: string,
        reward: number,
        xp: number,
        reputation: number
      ) => {
        let resolved = false;

        setGame((current) => {
          const operation =
            current.operations.find(
              (item) =>
                item.id ===
                operationId
            );

          if (!operation) {
            return current;
          }

          /*
           * CRITICAL FAILURE
           */
          if (
            operation.outcome ===
              'CRITICAL_FAILURE' ||
            (
              operation.completed &&
              operation.mistakes >= 2
            )
          ) {
            resolved = true;

            return {
              ...current,

              totalOperations:
                current.totalOperations +
                1,

              failedOperations:
                current.failedOperations +
                1,

              reputation:
                Math.max(
                  0,
                  current.reputation -
                    Math.max(
                      1,
                      Math.floor(
                        Math.max(
                          1,
                          reputation
                        ) / 2
                      )
                    )
                ),

              /*
               * Failure biraz ek trace bırakıyor.
               * Oyuncu arka arkaya kumar oynayamaz.
               */
              trace:
                clamp(
                  current.trace +
                    2,
                  0,
                  100
                ),

              completedToday:
                current.completedToday +
                1,

              operations:
                current.operations.filter(
                  (item) =>
                    item.id !==
                    operationId
                ),

              operationHistory: [
                {
                  ...operation,
                  completed: true,
                  outcome:
                    'CRITICAL_FAILURE',
                  finalReward: 0,
                  finalXp: 0,
                  finalTrace:
                    current.trace + 2,
                },
                ...current.operationHistory,
              ].slice(0, 50),

              lastActiveAt:
                Date.now(),
            };
          }

          /*
           * Henüz 3 faz bitmemişse resolve etme.
           */
          if (
            operation.phase < 3 ||
            operation.completed
          ) {
            return current;
          }

          resolved = true;

          const perfectRun =
            operation.mistakes ===
            0;

          const roughRun =
            operation.mistakes ===
            1;

          /*
           * Critical success artık yalnızca
           * tamamen hatasız operasyonlarda mümkün.
           *
           * %7.
           */
          const criticalSuccess =
            perfectRun &&
            Math.random() < 0.07;

          let rewardMultiplier = 0;

          let xpMultiplier = 0;

          let reputationMultiplier = 0;

          if (
            criticalSuccess
          ) {
            rewardMultiplier = 1.35;
            xpMultiplier = 1.25;
            reputationMultiplier =
              1.5;
          } else if (
            perfectRun
          ) {
            rewardMultiplier = 1;
            xpMultiplier = 1;
            reputationMultiplier = 1;
          } else if (
            roughRun
          ) {
            rewardMultiplier = 0.30;
            xpMultiplier = 0.50;
            reputationMultiplier = 0.50;
          } else {
            rewardMultiplier = 0;
            xpMultiplier = 0;
            reputationMultiplier = 0;
          }

          /*
           * Reward bonusları kontrollü tutuluyor.
           */
          const finalReward =
            Math.max(
              0,
              Math.floor(
                Math.max(
                  0,
                  reward
                ) *
                  rewardMultiplier *
                  (
                    1 +
                    stats.rewardBonus /
                      100
                  )
              )
            );

          const finalXp =
            Math.max(
              0,
              Math.floor(
                Math.max(
                  0,
                  xp
                ) *
                  xpMultiplier *
                  (
                    1 +
                    stats.xpBonus /
                      100
                  )
              )
            );

          const finalReputation =
            Math.max(
              0,
              Math.floor(
                Math.max(
                  0,
                  reputation
                ) *
                  reputationMultiplier
              )
            );

          /*
           * Başarılı operasyon da az miktarda trace
           * üretiyor. Perfect run'da daha düşük.
           */
          const generatedTrace =
            perfectRun
              ? 1
              : 4;

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
              finalReputation,

            trace:
              clamp(
                current.trace +
                  Math.max(
                    1,
                    Math.floor(
                      generatedTrace -
                        stats.traceReduction /
                          20
                    )
                  ),
                0,
                100
              ),

            totalOperations:
              current.totalOperations +
              1,

            successfulOperations:
              current.successfulOperations +
              1,

            completedToday:
              current.completedToday +
              1,

            operations:
              current.operations.filter(
                (item) =>
                  item.id !==
                  operationId
              ),

            operationHistory: [
              {
                ...operation,
                completed: true,
                outcome:
                  criticalSuccess
                    ? 'SUCCESS'
                    : 'SUCCESS',
                finalReward:
                  finalReward,
                finalXp:
                  finalXp,
                finalTrace:
                  current.trace +
                  Math.max(
                    1,
                    Math.floor(
                      generatedTrace -
                        stats.traceReduction /
                          20
                    )
                  ),
              },
              ...current.operationHistory,
            ].slice(0, 50),

            lastActiveAt:
              Date.now(),
          };
        });

        return resolved;
      },
      [stats]
    );

  /*
   * LEGACY TIMER OPERATION
   *
   * Eski ekranlar bozulmasın diye tutuluyor.
   * Yeni Interactive Operation V2 bunu kullanmayacak.
   */
  const claimOperation =
    useCallback(
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
                item.id ===
                operationId
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

          /*
           * Eski sisteme göre daha zor.
           */
          const difficulty =
            security * 0.62 +
            risk * 0.38;

          const levelBonus =
            Math.max(
              0,
              current.level - 1
            ) * 1.25;

          const successChance =
            clamp(
              60 +
                levelBonus +
                stats.successBonus -
                difficulty,
              8,
              88
            );

          const success =
            Math.random() *
              100 <
            successChance;

          const rewardMultiplier =
            success
              ? 0.65
              : 0;

          const xpMultiplier =
            success
              ? 0.70
              : 0;

          const generatedTrace =
            Math.max(
              1,
              Math.floor(
                (
                  risk +
                  (
                    success
                      ? 2
                      : 8
                  )
                ) *
                  (
                    1 -
                    stats.traceReduction /
                      100
                  )
              )
            );

          const finalReward =
            Math.floor(
              reward *
                rewardMultiplier *
                (
                  1 +
                  stats.rewardBonus /
                    100
                )
            );

          const finalXp =
            Math.floor(
              xp *
                xpMultiplier *
                (
                  1 +
                  stats.xpBonus /
                    100
                )
            );

          const reputationDelta =
            success
              ? Math.max(
                  1,
                  Math.floor(
                    reputation *
                      0.75
                  )
                )
              : 0;

          return {
            ...current,

            credits:
              current.credits +
              finalReward,

            xp:
              current.xp +
              finalXp,

            reputation:
              Math.max(
                0,
                current.reputation +
                  reputationDelta
              ),

            trace:
              clamp(
                current.trace +
                  generatedTrace,
                0,
                100
              ),

            totalOperations:
              current.totalOperations +
              1,

            successfulOperations:
              current.successfulOperations +
              (success
                ? 1
                : 0),

            failedOperations:
              current.failedOperations +
              (success
                ? 0
                : 1),

            completedToday:
              current.completedToday +
              1,

            operations:
              current.operations.filter(
                (item) =>
                  item.id !==
                  operationId
              ),

            lastActiveAt:
              Date.now(),
          };
        });

        return claimed;
      },
      [stats]
    );

  /*
   * MARKET V2 FOUNDATION
   */
  const buyItem = useCallback(
    (
      itemId: string,
      price: number
    ) => {
      let purchased = false;

      const safePrice = Math.max(
        0,
        Math.floor(price)
      );

      setGame((current) => {
        if (
          current.ownedItems.includes(
            itemId
          )
        ) {
          return current;
        }

        if (
          current.credits <
          safePrice
        ) {
          return current;
        }

        purchased = true;

        return {
          ...current,

          credits:
            current.credits -
            safePrice,

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

  const unlockSkill =
    useCallback(
      (
        skillId: string,
        cost: number
      ) => {
        let unlocked = false;

        const safeCost =
          Math.max(
            1,
            Math.floor(cost)
          );

        setGame((current) => {
          if (
            current.unlockedSkills.includes(
              skillId
            )
          ) {
            return current;
          }

          if (
            current.skillPoints <
            safeCost
          ) {
            return current;
          }

          unlocked = true;

          return {
            ...current,

            skillPoints:
              current.skillPoints -
              safeCost,

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

        const safeCost =
          Math.max(
            1,
            Math.floor(cost)
          );

        setGame((current) => {
          if (
            current.credits <
            safeCost
          ) {
            return current;
          }

          const cpuCost =
            infrastructureId ===
            'scrap'
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

          if (
            cpuCost <= 0
          ) {
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

          /*
           * CPU cap artık daha sert.
           */
          const cpuCapacity =
            70 +
            Math.max(
              0,
              current.level - 1
            ) *
              20;

          if (
            currentCpu +
              cpuCost >
            cpuCapacity
          ) {
            return current;
          }

          const currentLevel =
            current
              .infrastructure[
              infrastructureId
            ] ?? 0;

          upgraded = true;

          return {
            ...current,

            credits:
              current.credits -
              safeCost,

            infrastructure: {
              ...current.infrastructure,

              [infrastructureId]:
                currentLevel +
                1,
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

  const value =
    useMemo(
      () => ({
        game,
        stats,

        xpRequired,
        xpProgress,

        rank,
        rankNext,
        rankProgress,

        rankUpVersion,
        rankUpMessage,
        clearRankUp,

        addCredits,
        spendCredits,
        collectPassiveIncome,

        addXp,

        addTrace,
        reduceTrace,
        reduceTraceSafely,

        addSkillPoints,
        addReputation,

        recordOperation,

        startOperation,
        advanceOperation,
        resolveOperation,
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

        rankUpVersion,
        rankUpMessage,
        clearRankUp,

        addCredits,
        spendCredits,
        collectPassiveIncome,

        addXp,

        addTrace,
        reduceTrace,
        reduceTraceSafely,

        addSkillPoints,
        addReputation,

        recordOperation,

        startOperation,
        advanceOperation,
        resolveOperation,
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
