import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';

type Mission = {
  id: string;
  title: string;
  client: string;
  description: string;
  reward: number;
  xp: number;
  security: number;
  risk: number;
  duration: number;
  category: string;
};

type Choice = {
  id: string;
  label: string;
  description: string;

  /*
   * V2 karar motoru:
   * seçimlerin artık sadece true/false olması yerine
   * risk, güvenlik ve beceri etkileri bulunuyor.
   */
  baseSuccess: number;
  trace: number;
  rewardModifier: number;
  xpModifier: number;

  /*
   * Bazı seçimler belirli skill/item'larla güçlenir.
   */
  requiredSkill?: string;
  requiredItem?: string;

  /*
   * Kritik başarı ihtimalini etkiler.
   */
  criticalBonus?: number;
};

const missions: Mission[] = [
  {
    id: 'ghost',
    title: 'GHOST PROTOCOL',
    client: 'UNKNOWN CLIENT',
    description:
      'Extract encrypted data from an isolated private node.',
    reward: 90,
    xp: 120,
    security: 22,
    risk: 8,
    duration: 45,
    category: 'INFILTRATION',
  },
  {
    id: 'blackout',
    title: 'BLACKOUT',
    client: 'NIGHTFALL',
    description:
      'Disrupt a corporate relay and remain undetected.',
    reward: 160,
    xp: 180,
    security: 41,
    risk: 19,
    duration: 60,
    category: 'DISRUPTION',
  },
  {
    id: 'vault',
    title: 'VAULT ZERO',
    client: 'UNKNOWN',
    description:
      'Break through a high-security digital vault.',
    reward: 280,
    xp: 280,
    security: 67,
    risk: 34,
    duration: 90,
    category: 'EXTRACTION',
  },
  {
    id: 'phantom',
    title: 'PHANTOM ROUTE',
    client: 'GHOST MARKET',
    description:
      'Hijack a hidden relay and establish a permanent route.',
    reward: 450,
    xp: 420,
    security: 81,
    risk: 48,
    duration: 120,
    category: 'NETWORK',
  },
];

type OperationPhase = {
  title: string;
  subtitle: string;
  choices: Choice[];
};

/*
 * Her görev artık 5 aşamalı.
 *
 * Oyuncu:
 * RECON
 * ACCESS
 * CONTROL
 * EXTRACTION
 * EXIT
 *
 * üzerinden ilerliyor.
 *
 * Bazı seçimler doğrudan iyi/kötü değil.
 * Başarı oranı, trace ve ekipmanlara göre değişiyor.
 */
const choices: Record<string, OperationPhase[]> = {
  ghost: [
    {
      title: 'RECON',
      subtitle: 'MAP THE TARGET WITHOUT MAKING NOISE',
      choices: [
        {
          id: 'passive_scan',
          label: 'PASSIVE SCAN',
          description: 'Observe the node without generating active traffic.',
          baseSuccess: 82,
          trace: 1,
          rewardModifier: 0,
          xpModifier: 5,
          criticalBonus: 4,
        },
        {
          id: 'metadata',
          label: 'READ METADATA',
          description: 'Pull exposed metadata and inspect the target surface.',
          baseSuccess: 70,
          trace: 3,
          rewardModifier: 5,
          xpModifier: 8,
        },
        {
          id: 'active_probe',
          label: 'ACTIVE PROBE',
          description: 'Force the remote host to answer a probe.',
          baseSuccess: 55,
          trace: 9,
          rewardModifier: 15,
          xpModifier: 15,
          requiredSkill: 'network_scan',
        },
      ],
    },

    {
      title: 'ACCESS',
      subtitle: 'CHOOSE AN ENTRY VECTOR',
      choices: [
        {
          id: 'proxy_access',
          label: 'PROXY ENTRY',
          description: 'Route the access attempt through an anonymous relay.',
          baseSuccess: 76,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 5,
          requiredSkill: 'proxy_chain',
          criticalBonus: 8,
        },
        {
          id: 'credential',
          label: 'CREDENTIAL VECTOR',
          description: 'Attempt controlled credential-based access.',
          baseSuccess: 63,
          trace: 5,
          rewardModifier: 10,
          xpModifier: 10,
        },
        {
          id: 'direct',
          label: 'DIRECT ACCESS',
          description: 'Connect directly and accept the additional exposure.',
          baseSuccess: 48,
          trace: 13,
          rewardModifier: 25,
          xpModifier: 20,
        },
      ],
    },

    {
      title: 'CONTROL',
      subtitle: 'STABILIZE THE SESSION',
      choices: [
        {
          id: 'low_noise',
          label: 'LOW-NOISE CONTROL',
          description: 'Maintain a minimal command footprint.',
          baseSuccess: 84,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'aggressive',
          label: 'AGGRESSIVE CONTROL',
          description: 'Increase throughput at the cost of exposure.',
          baseSuccess: 64,
          trace: 9,
          rewardModifier: 20,
          xpModifier: 12,
        },
        {
          id: 'exploit_control',
          label: 'EXPLOIT CONTROL',
          description: 'Use an exploit-assisted session takeover.',
          baseSuccess: 72,
          trace: 6,
          rewardModifier: 15,
          xpModifier: 18,
          requiredSkill: 'exploit_basics',
          requiredItem: 'exploit',
          criticalBonus: 8,
        },
      ],
    },

    {
      title: 'EXTRACTION',
      subtitle: 'TAKE ONLY WHAT YOU NEED',
      choices: [
        {
          id: 'targeted',
          label: 'TARGETED EXTRACTION',
          description: 'Copy only the contracted payload.',
          baseSuccess: 84,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 0,
          criticalBonus: 5,
        },
        {
          id: 'extended',
          label: 'EXTENDED EXTRACTION',
          description: 'Pull additional intelligence from the target.',
          baseSuccess: 66,
          trace: 8,
          rewardModifier: 30,
          xpModifier: 20,
        },
        {
          id: 'full_dump',
          label: 'FULL DUMP',
          description: 'Attempt to copy the entire target dataset.',
          baseSuccess: 50,
          trace: 16,
          rewardModifier: 60,
          xpModifier: 30,
        },
      ],
    },

    {
      title: 'EXIT',
      subtitle: 'LEAVE BEFORE THE WINDOW CLOSES',
      choices: [
        {
          id: 'clean_exit',
          label: 'CLEAN EXIT',
          description: 'Terminate the session and remove active handles.',
          baseSuccess: 88,
          trace: 1,
          rewardModifier: 0,
          xpModifier: 0,
          criticalBonus: 8,
        },
        {
          id: 'fast_exit',
          label: 'FAST EXIT',
          description: 'Leave immediately before the target reacts.',
          baseSuccess: 70,
          trace: 4,
          rewardModifier: -5,
          xpModifier: 5,
        },
        {
          id: 'linger',
          label: 'LINGER FOR INTEL',
          description: 'Stay online longer to search for additional value.',
          baseSuccess: 52,
          trace: 14,
          rewardModifier: 45,
          xpModifier: 25,
        },
      ],
    },
  ],

  blackout: [
    {
      title: 'RECON',
      subtitle: 'UNDERSTAND THE RELAY',
      choices: [
        {
          id: 'observe',
          label: 'OBSERVE TRAFFIC',
          description: 'Monitor traffic before interacting with the relay.',
          baseSuccess: 78,
          trace: 1,
          rewardModifier: 0,
          xpModifier: 5,
        },
        {
          id: 'deep_scan',
          label: 'DEEP SCAN',
          description: 'Probe several services to map the relay.',
          baseSuccess: 62,
          trace: 7,
          rewardModifier: 15,
          xpModifier: 12,
          requiredSkill: 'network_scan',
        },
        {
          id: 'flood',
          label: 'FLOOD RELAY',
          description: 'Overwhelm the relay before studying its structure.',
          baseSuccess: 42,
          trace: 16,
          rewardModifier: 35,
          xpModifier: 20,
        },
      ],
    },

    {
      title: 'ACCESS',
      subtitle: 'ENTER THE CONTROL LAYER',
      choices: [
        {
          id: 'mirror',
          label: 'MIRROR ROUTE',
          description: 'Use a mirrored route to approach the relay.',
          baseSuccess: 76,
          trace: 2,
          rewardModifier: 5,
          xpModifier: 8,
          requiredSkill: 'proxy_chain',
        },
        {
          id: 'inject',
          label: 'CONTROLLED INJECTION',
          description: 'Inject a limited command into the relay.',
          baseSuccess: 65,
          trace: 8,
          rewardModifier: 15,
          xpModifier: 12,
        },
        {
          id: 'brute',
          label: 'BRUTE FORCE',
          description: 'Hammer the authentication layer.',
          baseSuccess: 48,
          trace: 18,
          rewardModifier: 40,
          xpModifier: 25,
        },
      ],
    },

    {
      title: 'DISRUPTION',
      subtitle: 'DISABLE THE RELAY',
      choices: [
        {
          id: 'controlled_shutdown',
          label: 'CONTROLLED SHUTDOWN',
          description: 'Take the relay offline through its intended control path.',
          baseSuccess: 82,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 5,
        },
        {
          id: 'timed_crash',
          label: 'TIMED CRASH',
          description: 'Force a failure while minimizing session time.',
          baseSuccess: 63,
          trace: 9,
          rewardModifier: 20,
          xpModifier: 15,
        },
        {
          id: 'hard_crash',
          label: 'HARD CRASH',
          description: 'Destroy the relay immediately.',
          baseSuccess: 45,
          trace: 20,
          rewardModifier: 45,
          xpModifier: 25,
        },
      ],
    },

    {
      title: 'EXTRACTION',
      subtitle: 'TAKE THE CONTRACTED DATA',
      choices: [
        {
          id: 'targeted',
          label: 'TARGETED EXTRACTION',
          description: 'Take only the requested payload.',
          baseSuccess: 82,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'intel',
          label: 'INTELLIGENCE EXTRACTION',
          description: 'Collect additional information from the relay.',
          baseSuccess: 64,
          trace: 8,
          rewardModifier: 35,
          xpModifier: 22,
        },
        {
          id: 'everything',
          label: 'TAKE EVERYTHING',
          description: 'Attempt maximum data extraction.',
          baseSuccess: 44,
          trace: 17,
          rewardModifier: 65,
          xpModifier: 30,
        },
      ],
    },

    {
      title: 'EXIT',
      subtitle: 'DISAPPEAR FROM THE RELAY',
      choices: [
        {
          id: 'mirror_exit',
          label: 'MIRROR EXIT',
          description: 'Terminate through the mirrored route.',
          baseSuccess: 85,
          trace: 1,
          rewardModifier: 0,
          xpModifier: 0,
          requiredSkill: 'proxy_chain',
          criticalBonus: 8,
        },
        {
          id: 'rapid_exit',
          label: 'RAPID EXIT',
          description: 'Close everything and leave immediately.',
          baseSuccess: 72,
          trace: 4,
          rewardModifier: -5,
          xpModifier: 5,
        },
        {
          id: 'hold_position',
          label: 'HOLD POSITION',
          description: 'Remain inside the network to harvest more data.',
          baseSuccess: 50,
          trace: 15,
          rewardModifier: 40,
          xpModifier: 20,
        },
      ],
    },
  ],

  vault: [
    {
      title: 'RECON',
      subtitle: 'ANALYZE THE VAULT STRUCTURE',
      choices: [
        {
          id: 'metadata',
          label: 'READ METADATA',
          description: 'Analyze exposed vault information before attacking.',
          baseSuccess: 80,
          trace: 1,
          rewardModifier: 0,
          xpModifier: 5,
        },
        {
          id: 'surface',
          label: 'MAP ATTACK SURFACE',
          description: 'Probe protected endpoints for structural weaknesses.',
          baseSuccess: 63,
          trace: 7,
          rewardModifier: 20,
          xpModifier: 12,
          requiredSkill: 'network_scan',
        },
        {
          id: 'credentials',
          label: 'GUESS CREDENTIALS',
          description: 'Attempt direct credential guessing.',
          baseSuccess: 38,
          trace: 16,
          rewardModifier: 35,
          xpModifier: 20,
        },
      ],
    },

    {
      title: 'ACCESS',
      subtitle: 'RECONSTRUCT THE ACCESS PATH',
      choices: [
        {
          id: 'key',
          label: 'KEY RECONSTRUCTION',
          description: 'Reconstruct the fragmented access key.',
          baseSuccess: 74,
          trace: 3,
          rewardModifier: 5,
          xpModifier: 10,
          requiredSkill: 'zero_day',
          criticalBonus: 6,
        },
        {
          id: 'bypass',
          label: 'SECURITY BYPASS',
          description: 'Attempt to bypass the primary encryption layer.',
          baseSuccess: 54,
          trace: 12,
          rewardModifier: 25,
          xpModifier: 18,
        },
        {
          id: 'brute',
          label: 'BRUTE FORCE',
          description: 'Search the key space directly.',
          baseSuccess: 34,
          trace: 21,
          rewardModifier: 55,
          xpModifier: 28,
        },
      ],
    },

    {
      title: 'CONTROL',
      subtitle: 'MAINTAIN ACCESS UNDER PRESSURE',
      choices: [
        {
          id: 'stable',
          label: 'STABLE SESSION',
          description: 'Maintain a narrow and controlled session.',
          baseSuccess: 82,
          trace: 3,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'exploit',
          label: 'EXPLOIT SESSION',
          description: 'Push an exploit deeper into the vault.',
          baseSuccess: 63,
          trace: 10,
          rewardModifier: 25,
          xpModifier: 18,
          requiredSkill: 'exploit_basics',
        },
        {
          id: 'root',
          label: 'ROOT ATTEMPT',
          description: 'Attempt full administrative control.',
          baseSuccess: 44,
          trace: 18,
          rewardModifier: 55,
          xpModifier: 30,
          requiredSkill: 'root_access',
        },
      ],
    },

    {
      title: 'EXTRACTION',
      subtitle: 'BALANCE VALUE AGAINST EXPOSURE',
      choices: [
        {
          id: 'contract',
          label: 'CONTRACT DATA',
          description: 'Extract only the requested information.',
          baseSuccess: 84,
          trace: 3,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'intel',
          label: 'ADDITIONAL INTEL',
          description: 'Take extra information while the vault is open.',
          baseSuccess: 61,
          trace: 11,
          rewardModifier: 45,
          xpModifier: 20,
        },
        {
          id: 'vault_dump',
          label: 'VAULT DUMP',
          description: 'Attempt to extract the complete vault.',
          baseSuccess: 38,
          trace: 23,
          rewardModifier: 80,
          xpModifier: 35,
        },
      ],
    },

    {
      title: 'EXIT',
      subtitle: 'CLOSE THE VAULT WITHOUT BURNING THE ROUTE',
      choices: [
        {
          id: 'quiet',
          label: 'QUIET EXIT',
          description: 'Close the session cleanly.',
          baseSuccess: 86,
          trace: 2,
          rewardModifier: 0,
          xpModifier: 0,
          criticalBonus: 10,
        },
        {
          id: 'quick',
          label: 'QUICK EXIT',
          description: 'Leave before security can react.',
          baseSuccess: 72,
          trace: 5,
          rewardModifier: -5,
          xpModifier: 5,
        },
        {
          id: 'linger',
          label: 'LINGER',
          description: 'Stay longer to search for hidden assets.',
          baseSuccess: 47,
          trace: 17,
          rewardModifier: 50,
          xpModifier: 25,
        },
      ],
    },
  ],

  phantom: [
    {
      title: 'RECON',
      subtitle: 'MAP THE UNKNOWN ROUTE',
      choices: [
        {
          id: 'ghost_route',
          label: 'GHOST ROUTE',
          description: 'Build a quiet route before touching the relay.',
          baseSuccess: 76,
          trace: 2,
          rewardModifier: 5,
          xpModifier: 10,
          requiredSkill: 'proxy_chain',
        },
        {
          id: 'network_map',
          label: 'NETWORK MAP',
          description: 'Map connected relays before committing.',
          baseSuccess: 61,
          trace: 8,
          rewardModifier: 25,
          xpModifier: 18,
          requiredSkill: 'network_scan',
        },
        {
          id: 'direct_takeover',
          label: 'DIRECT TAKEOVER',
          description: 'Attempt immediate control.',
          baseSuccess: 35,
          trace: 20,
          rewardModifier: 60,
          xpModifier: 35,
        },
      ],
    },

    {
      title: 'ACCESS',
      subtitle: 'BREAK INTO THE PRIMARY RELAY',
      choices: [
        {
          id: 'mirror',
          label: 'MIRROR RELAY',
          description: 'Clone the relay through a disposable route.',
          baseSuccess: 73,
          trace: 4,
          rewardModifier: 10,
          xpModifier: 12,
          requiredSkill: 'proxy_chain',
        },
        {
          id: 'spoof',
          label: 'IDENTITY SPOOF',
          description: 'Replace part of the relay identity chain.',
          baseSuccess: 60,
          trace: 9,
          rewardModifier: 25,
          xpModifier: 18,
        },
        {
          id: 'force',
          label: 'FORCE ACCESS',
          description: 'Break through the primary gateway.',
          baseSuccess: 32,
          trace: 24,
          rewardModifier: 70,
          xpModifier: 38,
        },
      ],
    },

    {
      title: 'CONTROL',
      subtitle: 'SECURE THE ROUTE',
      choices: [
        {
          id: 'lock',
          label: 'LOCK ROUTE',
          description: 'Seal the route and minimize evidence.',
          baseSuccess: 81,
          trace: 3,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'expand',
          label: 'EXPAND CONTROL',
          description: 'Take control of secondary relays.',
          baseSuccess: 57,
          trace: 14,
          rewardModifier: 40,
          xpModifier: 24,
        },
        {
          id: 'network_root',
          label: 'NETWORK ROOT',
          description: 'Attempt privileged control of the network.',
          baseSuccess: 42,
          trace: 21,
          rewardModifier: 65,
          xpModifier: 35,
          requiredSkill: 'root_access',
        },
      ],
    },

    {
      title: 'EXTRACTION',
      subtitle: 'TAKE THE ROUTE DATA',
      choices: [
        {
          id: 'targeted',
          label: 'TARGETED EXTRACTION',
          description: 'Take the contracted route data.',
          baseSuccess: 80,
          trace: 3,
          rewardModifier: 0,
          xpModifier: 0,
        },
        {
          id: 'deep_intel',
          label: 'DEEP INTEL',
          description: 'Search connected relays for additional value.',
          baseSuccess: 58,
          trace: 13,
          rewardModifier: 50,
          xpModifier: 28,
        },
        {
          id: 'network_dump',
          label: 'NETWORK DUMP',
          description: 'Attempt to collect everything.',
          baseSuccess: 35,
          trace: 26,
          rewardModifier: 90,
          xpModifier: 45,
        },
      ],
    },

    {
      title: 'EXIT',
      subtitle: 'VANISH FROM THE NETWORK',
      choices: [
        {
          id: 'ghost_exit',
          label: 'GHOST EXIT',
          description: 'Disappear through a minimal trace route.',
          baseSuccess: 84,
          trace: 2,
          rewardModifier: 5,
          xpModifier: 5,
          requiredSkill: 'ghost_identity',
          criticalBonus: 12,
        },
        {
          id: 'fast_exit',
          label: 'FAST EXIT',
          description: 'Terminate immediately.',
          baseSuccess: 71,
          trace: 5,
          rewardModifier: -5,
          xpModifier: 5,
        },
        {
          id: 'stay',
          label: 'STAY FOR MORE',
          description: 'Keep access open for maximum information.',
          baseSuccess: 43,
          trace: 19,
          rewardModifier: 55,
          xpModifier: 30,
        },
      ],
    },
  ],
};

export default function OperationsScreen() {
  const router = useRouter();

  const {
    game,
    stats,
    startOperation,
    advanceOperation,
    resolveOperation,
    xpRequired,
    xpProgress,
    rank,
  } = useGame();

  const [selectedMissionId, setSelectedMissionId] =
    useState<string | null>(null);

  const [selectedOperationId, setSelectedOperationId] =
    useState<string | null>(null);

  const [phase, setPhase] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [phaseRoll, setPhaseRoll] = useState<number | null>(null);
  const [operationTrace, setOperationTrace] =
    useState(0);

  const [message, setMessage] = useState(
    'SELECT A CONTRACT TO BEGIN'
  );

  const [outcome, setOutcome] = useState<
    | 'SUCCESS'
    | 'PARTIAL'
    | 'CRITICAL_SUCCESS'
    | 'FAILURE'
    | 'CRITICAL_FAILURE'
    | null
  >(null);

  const activeMission = useMemo(
    () =>
      missions.find(
        (mission) =>
          mission.id === selectedMissionId
      ),
    [selectedMissionId]
  );

  const activeOperation =
    game.operations.find(
      (operation) =>
        operation.id === selectedOperationId
    );

  const activePhase =
    activeMission
      ? choices[activeMission.id]?.[phase]
      : undefined;

  const phaseChoices =
    activePhase?.choices ?? [];

  const resetOperation = () => {
    setSelectedMissionId(null);
    setSelectedOperationId(null);
    setPhase(0);
    setMistakes(0);
    setOperationTrace(0);
    setOutcome(null);
    setMessage(
      'SELECT A CONTRACT TO BEGIN'
    );
  };

  const beginOperation = (
    mission: Mission
  ) => {
    if (
      game.operations.length > 0
    ) {
      setMessage(
        'ACTIVE OPERATION // FINISH CURRENT JOB FIRST'
      );
      return;
    }

    const createdId = startOperation(
      mission.id,
      mission.duration
    );

    if (!createdId) {
      setMessage(
        'OPERATION COULD NOT START'
      );
      return;
    }

    setSelectedMissionId(mission.id);
    setSelectedOperationId(createdId);
    setPhase(0);
    setMistakes(0);
    setOperationTrace(0);
    setOutcome(null);
    setMessage(
      'CONNECTION ESTABLISHED // AWAITING INPUT'
    );
  };

  const chooseAction = (
    choice: Choice
  ) => {
    if (
      !activeMission ||
      !activeOperation ||
      outcome
    ) {
      return;
    }

    /*
     * Skill/item etkileri.
     *
     * Eksik gereksinim varsa seçim hâlâ yapılabilir,
     * fakat daha kötü başarı oranıyla çalışır.
     */
    const hasSkill =
      choice.requiredSkill
        ? game.unlockedSkills.includes(
            choice.requiredSkill
          )
        : false;

    const hasItem =
      choice.requiredItem
        ? game.ownedItems.includes(
            choice.requiredItem
          )
        : false;

    let successChance =
      choice.baseSuccess;

    /*
     * Seviye etkisi küçük tutuldu.
     * Böylece oyuncu sadece level kasarak sistemi kırmıyor.
     */
    successChance +=
      Math.min(
        12,
        Math.max(
          0,
          game.level - 1
        ) * 0.45
      );

    /*
     * Genel skill bonusu.
     */
    successChance +=
      stats.successBonus * 0.45;

    /*
     * Gereken skill/item varsa anlamlı bonus.
     */
    if (
      choice.requiredSkill
    ) {
      if (hasSkill) {
        successChance += 9;
      } else {
        successChance -= 7;
      }
    }

    if (
      choice.requiredItem
    ) {
      if (hasItem) {
        successChance += 10;
      } else {
        successChance -= 12;
      }
    }

    /*
     * Trace yükseldikçe kararlar zorlaşıyor.
     *
     * Oyuncu trace'i yok sayarak sürekli yüksek
     * değerli riskli seçimleri spamlayamaz.
     */
    successChance -=
      Math.max(
        0,
        game.trace - 25
      ) * 0.12;

    successChance =
      Math.min(
        91,
        Math.max(
          15,
          successChance
        )
      );

    /*
     * RNG.
     */
    const roll =
      Math.random() *
      100;

    const success =
      roll < successChance;

    /*
     * Trace reduction.
     *
     * Yanlış kararlar item/skill olsa bile tamamen
     * silinmiyor.
     */
    const reduction =
      Math.floor(
        stats.traceReduction *
          0.55
      );

    let generatedTrace =
      Math.max(
        1,
        Math.floor(
          choice.trace *
            (
              1 -
              reduction / 100
            )
        )
      );

    /*
     * Yüksek trace durumunda yeni hata daha pahalı.
     */
    if (
      game.trace >= 70
    ) {
      generatedTrace += 3;
    } else if (
      game.trace >= 50
    ) {
      generatedTrace += 2;
    }

    /*
     * Riskli seçimlerin başarısızlığı:
     * normal trace + ek ceza.
     */
    if (!success) {
      generatedTrace +=
        Math.max(
          1,
          Math.floor(
            choice.trace *
              0.35
          )
        );
    }

    const nextMistakes =
      mistakes +
      (success ? 0 : 1);

    setPhaseRoll(
      Math.floor(roll)
    );

    setMistakes(
      nextMistakes
    );

    setOperationTrace(
      (current) =>
        current + generatedTrace
    );

    advanceOperation(
      activeOperation.id,
      success,
      generatedTrace
    );

    /*
     * Trace %100.
     */
    const projectedTrace =
      Math.min(
        100,
        game.trace +
          operationTrace +
          generatedTrace
      );

    if (
      !success &&
      (
        nextMistakes >= 2 ||
        projectedTrace >= 100
      )
    ) {
      setOutcome(
        'CRITICAL_FAILURE'
      );

      setMessage(
        projectedTrace >= 100
          ? 'TRACE 100% // SECURITY RESPONSE // CONNECTION TERMINATED'
          : 'MULTIPLE ERRORS // SECURITY LOCK // OPERATION TERMINATED'
      );

      return;
    }

    if (!success) {
      setMessage(
        `FAILED DECISION // ${Math.floor(
          successChance
        )}% CHANCE // ROLL ${Math.floor(
          roll
        )} // TRACE +${generatedTrace}%`
      );
    } else {
      setMessage(
        `VECTOR ACCEPTED // ${Math.floor(
          successChance
        )}% CHANCE // ROLL ${Math.floor(
          roll
        )}`
      );
    }

    /*
     * Beşinci faz tamamlanınca sonucu hesapla.
     */
    if (
      phase >= 4
    ) {
      if (
        nextMistakes === 0
      ) {
        /*
         * Critical success artık çok zor.
         * Yüksek trace kritik başarı şansını azaltıyor.
         */
        const criticalChance =
          Math.max(
            1,
            Math.min(
              9,
              3 +
                (choice.criticalBonus ??
                  0) /
                  2 -
                Math.max(
                  0,
                  game.trace - 10
                ) *
                  0.03
            )
          );

        const criticalRoll =
          Math.random() *
          100;

        if (
          criticalRoll <
          criticalChance
        ) {
          setOutcome(
            'CRITICAL_SUCCESS'
          );

          setMessage(
            'PERFECT RUN // CRITICAL EXECUTION'
          );
        } else {
          setOutcome(
            'SUCCESS'
          );

          setMessage(
            'OPERATION COMPLETE // CLEAN EXECUTION'
          );
        }
      } else {
        setOutcome(
          'PARTIAL'
        );

        setMessage(
          'OPERATION COMPLETE // DAMAGE CONTROL PAYOUT'
        );
      }
    } else {
      setPhase(
        (current) =>
          Math.min(
            4,
            current + 1
          )
      );
    }
  };

  useEffect(() => {
    if (
      !outcome ||
      !activeMission ||
      !selectedOperationId
    ) {
      return;
    }

    const result =
      resolveOperation(
        selectedOperationId,
        activeMission.reward,
        activeMission.xp,
        5
      );

    if (!result) {
      return;
    }
  }, [
    outcome,
    activeMission,
    selectedOperationId,
    resolveOperation,
  ]);

  const progressPercent =
    ((phase + 1) / 5) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>
              OPERATIONS
            </Text>

            <Text style={styles.subtitle}>
              INTERACTIVE CONTRACT NETWORK
            </Text>
          </View>

          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>
              {rank}
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              ◆
            </Text>
          </View>

          <View style={styles.profileMain}>
            <Text style={styles.profileName}>
              SHADOW
            </Text>

            <Text style={styles.profileRole}>
              DIGITAL INTRUDER // LEVEL {game.level}
            </Text>

            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${xpProgress}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.xpText}>
              {game.xp} / {xpRequired} XP
            </Text>
          </View>

          <View style={styles.creditBox}>
            <Text style={styles.creditLabel}>
              CREDITS
            </Text>

            <Text style={styles.creditValue}>
              ${game.credits.toLocaleString()}
            </Text>
          </View>
        </View>

        {activeMission &&
          activeOperation && (
            <View style={styles.operationPanel}>
              <View style={styles.operationTop}>
                <View>
                  <Text style={styles.phaseLabel}>
                    PHASE {phase + 1} / 5
                  </Text>

                  <Text style={styles.operationTitle}>
                    {activeMission.title}
                  </Text>

                  {activePhase && (
                    <Text style={styles.phaseSubtitle}>
                      {activePhase.title} // {activePhase.subtitle}
                    </Text>
                  )}
                </View>

                <View style={styles.traceBox}>
                  <Text style={styles.traceLabel}>
                    TRACE
                  </Text>

                  <Text
                    style={[
                      styles.traceValue,
                      operationTrace >= 25 &&
                        styles.traceDanger,
                    ]}
                  >
                    {game.trace + operationTrace}%
                  </Text>
                </View>
              </View>

              <View
                style={styles.phaseBarBackground}
              >
                <View
                  style={[
                    styles.phaseBarFill,
                    {
                      width: `${progressPercent}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.terminal}>
                <View style={styles.terminalHeader}>
                  <View
                    style={styles.terminalDots}
                  >
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>

                  <Text style={styles.terminalTitle}>
                    shadow@{activeMission.id}:~
                  </Text>
                </View>

                <Text style={styles.terminalLine}>
                  <Text style={styles.prompt}>
                    &gt;{' '}
                  </Text>
                  target handshake established
                </Text>

                <Text style={styles.terminalLine}>
                  <Text style={styles.prompt}>
                    &gt;{' '}
                  </Text>
                  security layer{' '}
                  {activeMission.security}%
                </Text>

                <Text style={styles.terminalLine}>
                  <Text style={styles.success}>
                    &gt;{' '}
                  </Text>
                  awaiting operator decision...
                </Text>
              </View>

              <Text style={styles.instruction}>
                SELECT YOUR VECTOR
              </Text>

              {phaseChoices.map(
                (choice) => (
                  <Pressable
                    key={choice.id}
                    onPress={() =>
                      chooseAction(
                        choice
                      )
                    }
                    style={({ pressed }) => [
                      styles.choiceButton,
                      pressed &&
                        styles.choicePressed,
                    ]}
                  >
                    <View
                      style={styles.choiceIcon}
                    >
                      <Text
                        style={
                          styles.choiceIconText
                        }
                      >
                        {choice.requiredSkill
                          ? 'S'
                          : choice.requiredItem
                            ? 'I'
                            : '›'}
                      </Text>
                    </View>

                    <View
                      style={styles.choiceBody}
                    >
                      <Text
                        style={styles.choiceTitle}
                      >
                        {choice.label}
                      </Text>

                      <Text
                        style={styles.choiceDescription}
                      >
                        {choice.description}
                      </Text>

                      <Text
                        style={styles.choiceMeta}
                      >
                        BASE {choice.baseSuccess}% // TRACE +{choice.trace}% // PAYOUT {choice.rewardModifier >= 0 ? '+' : ''}{choice.rewardModifier}%
                      </Text>
                    </View>

                    <Text
                      style={styles.choiceArrow}
                    >
                      ›
                    </Text>
                  </Pressable>
                )
              )}

              <View
                style={styles.messageBox}
              >
                <Text
                  style={styles.messageText}
                >
                  {message}
                </Text>
              </View>

              {outcome && (
                <View
                  style={[
                    styles.outcomeCard,
                    outcome === 'SUCCESS' &&
                      styles.outcomeSuccess,
                    outcome ===
                      'PARTIAL' &&
                      styles.outcomePartial,
                    outcome ===
                      'CRITICAL_FAILURE' &&
                      styles.outcomeFailure,
                  ]}
                >
                  <Text
                    style={styles.outcomeTitle}
                  >
                    {outcome}
                  </Text>

                  <Text
                    style={styles.outcomeText}
                  >
                    {outcome ===
                    'CRITICAL_SUCCESS'
                      ? `CRITICAL PAYOUT // +$${Math.floor(
                          activeMission.reward * 1.75
                        ).toLocaleString()} // +${Math.floor(
                          activeMission.xp * 1.5
                        )} XP`
                      : outcome ===
                        'SUCCESS'
                        ? `+$${activeMission.reward.toLocaleString()} // +${activeMission.xp} XP`
                        : outcome ===
                          'PARTIAL'
                          ? `PARTIAL PAYOUT // +$${Math.floor(
                              activeMission.reward * 0.45
                            ).toLocaleString()}`
                          : `TRACE LOCK // NO PAYOUT`}
                  </Text>

                  <Pressable
                    onPress={resetOperation}
                    style={
                      styles.continueButton
                    }
                  >
                    <Text
                      style={
                        styles.continueText
                      }
                    >
                      RETURN TO CONTRACTS
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

        {!activeMission && (
          <>
            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  AVAILABLE CONTRACTS
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  EVERY DECISION CHANGES THE OUTCOME
                </Text>
              </View>

              <View
                style={styles.counter}
              >
                <Text
                  style={styles.counterText}
                >
                  {game.completedToday} DONE
                </Text>
              </View>
            </View>

            {missions.map(
              (mission) => {
                const locked =
                  mission.security >
                  game.level * 18 +
                    25;

                return (
                  <View
                    key={mission.id}
                    style={[
                      styles.missionCard,
                      locked &&
                        styles.lockedCard,
                    ]}
                  >
                    <View
                      style={styles.missionTop}
                    >
                      <View
                        style={
                          styles.missionIcon
                        }
                      >
                        <Text
                          style={
                            styles.missionIconText
                          }
                        >
                          {locked
                            ? '?'
                            : '⌁'}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.missionIdentity
                        }
                      >
                        <View
                          style={
                            styles.titleRow
                          }
                        >
                          <Text
                            style={[
                              styles.missionTitle,
                              locked &&
                                styles.lockedText,
                            ]}
                          >
                            {mission.title}
                          </Text>

                          <Text
                            style={[
                              styles.category,
                              locked &&
                                styles.lockedText,
                            ]}
                          >
                            {mission.category}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.client
                          }
                        >
                          {mission.client}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.description
                      }
                    >
                      {mission.description}
                    </Text>

                    <View
                      style={
                        styles.missionStats
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          REWARD
                        </Text>

                        <Text
                          style={
                            styles.reward
                          }
                        >
                          $
                          {mission.reward.toLocaleString()}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          XP
                        </Text>

                        <Text
                          style={
                            styles.statValue
                          }
                        >
                          +{mission.xp}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          SECURITY
                        </Text>

                        <Text
                          style={
                            styles.statValue
                          }
                        >
                          {mission.security}%
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={
                            styles.statLabel
                          }
                        >
                          RISK
                        </Text>

                        <Text
                          style={[
                            styles.statValue,
                            mission.risk >=
                              30 &&
                              styles.highRisk,
                          ]}
                        >
                          {mission.risk}%
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.missionBottom
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.durationLabel
                          }
                        >
                          OPERATION
                        </Text>

                        <Text
                          style={
                            styles.duration
                          }
                        >
                          3 PHASES
                        </Text>
                      </View>

                      <Pressable
                        disabled={locked}
                        onPress={() =>
                          beginOperation(
                            mission
                          )
                        }
                        style={({ pressed }) => [
                          styles.startButton,
                          locked &&
                            styles.lockedButton,
                          pressed &&
                            !locked &&
                            styles.buttonPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.startText,
                            locked &&
                              styles.lockedButtonText,
                          ]}
                        >
                          {locked
                            ? 'LOCKED'
                            : 'START'}
                        </Text>

                        {!locked && (
                          <Text
                            style={
                              styles.startArrow
                            }
                          >
                            ›
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              }
            )}
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            OPERATOR RULES
          </Text>

          <Text style={styles.infoText}>
            Five phases make up each contract.
            Every decision has a success chance, trace cost and payout profile.
            Two mistakes or 100% trace can terminate the operation.
          </Text>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // INTERACTIVE CONTRACT NETWORK v2.1
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070D',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 45,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#17202D',
    backgroundColor: '#090D15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    color: '#DCE2E8',
    fontSize: 31,
    fontWeight: '300',
  },

  headerCenter: {
    alignItems: 'center',
  },

  title: {
    color: '#F2F5F7',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.8,
  },

  subtitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 3,
  },

  rankBadge: {
    backgroundColor: '#08150F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },

  rankText: {
    color: '#00F5A0',
    fontSize: 6.5,
    fontWeight: '900',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 11,
    padding: 13,
    marginBottom: 10,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 9,
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#00F5A0',
    fontSize: 18,
  },

  profileMain: {
    flex: 1,
  },

  profileName: {
    color: '#DCE2E8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  profileRole: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
    marginTop: 3,
  },

  xpBar: {
    height: 4,
    backgroundColor: '#18202B',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },

  xpFill: {
    height: '100%',
    backgroundColor: '#00B8FF',
  },

  xpText: {
    color: '#59616F',
    fontSize: 6.5,
    marginTop: 3,
  },

  creditBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  creditLabel: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
  },

  creditValue: {
    color: '#00F5A0',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },

  operationPanel: {
    backgroundColor: '#07110F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 11,
    padding: 13,
    marginBottom: 13,
  },

  operationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  phaseLabel: {
    color: '#00F5A0',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 1,
  },

  operationTitle: {
    color: '#DCE2E8',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },

  phaseSubtitle: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
    marginTop: 3,
    maxWidth: 220,
  },

  traceBox: {
    alignItems: 'flex-end',
  },

  traceLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
  },

  traceValue: {
    color: '#00F5A0',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },

  traceDanger: {
    color: '#FF426D',
  },

  phaseBarBackground: {
    height: 4,
    backgroundColor: '#16231F',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 11,
  },

  phaseBarFill: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  terminal: {
    backgroundColor: '#04070B',
    borderWidth: 1,
    borderColor: '#151C27',
    borderRadius: 8,
    padding: 11,
    marginTop: 11,
  },

  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111823',
  },

  terminalDots: {
    flexDirection: 'row',
    marginRight: 8,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#28323F',
    marginRight: 4,
  },

  terminalTitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
  },

  terminalLine: {
    color: '#687482',
    fontSize: 7,
    lineHeight: 14,
  },

  prompt: {
    color: '#00B8FF',
  },

  success: {
    color: '#00F5A0',
  },

  instruction: {
    color: '#AEB7C2',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 13,
    marginBottom: 8,
  },

  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 7,
  },

  choicePressed: {
    opacity: 0.65,
  },

  choiceIcon: {
    width: 34,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#20303C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  choiceIconText: {
    color: '#00B8FF',
    fontSize: 15,
    fontWeight: '900',
  },

  choiceBody: {
    flex: 1,
  },

  choiceTitle: {
    color: '#DCE2E8',
    fontSize: 8,
    fontWeight: '900',
  },

  choiceDescription: {
    color: '#59616F',
    fontSize: 6.5,
    lineHeight: 11,
    marginTop: 3,
  },

  choiceMeta: {
    color: '#3F7180',
    fontSize: 5.5,
    fontWeight: '800',
    marginTop: 5,
    letterSpacing: 0.35,
  },

  choiceArrow: {
    color: '#414B58',
    fontSize: 20,
    marginLeft: 7,
  },

  messageBox: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 7,
    padding: 9,
    marginTop: 5,
  },

  messageText: {
    color: '#00B8FF',
    fontSize: 6.5,
    fontWeight: '800',
  },

  outcomeCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#31503F',
    backgroundColor: '#0B1712',
    borderRadius: 8,
    padding: 11,
  },

  outcomeSuccess: {
    borderColor: '#14513E',
  },

  outcomeCritical: {
    borderColor: '#00B8FF',
    backgroundColor: '#07151F',
  },

  outcomePartial: {
    borderColor: '#5B4B1B',
    backgroundColor: '#161205',
  },

  outcomeFailure: {
    borderColor: '#542034',
    backgroundColor: '#16090E',
  },

  outcomeTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  outcomeText: {
    color: '#71808E',
    fontSize: 7,
    marginTop: 5,
  },

  continueButton: {
    backgroundColor: '#00F5A0',
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },

  continueText: {
    color: '#03100A',
    fontSize: 6.5,
    fontWeight: '900',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#AEB7C2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  sectionSubtitle: {
    color: '#414B58',
    fontSize: 6.5,
    fontWeight: '700',
    marginTop: 3,
  },

  counter: {
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  counterText: {
    color: '#00F5A0',
    fontSize: 6.5,
    fontWeight: '900',
  },

  missionCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 11,
    padding: 13,
    marginBottom: 9,
  },

  lockedCard: {
    opacity: 0.48,
  },

  missionTop: {
    flexDirection: 'row',
  },

  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#17202D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  missionIconText: {
    color: '#00F5A0',
    fontSize: 20,
  },

  lockedText: {
    color: '#59616F',
  },

  missionIdentity: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  missionTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    flex: 1,
  },

  category: {
    color: '#00B8FF',
    fontSize: 6,
    fontWeight: '900',
    marginLeft: 5,
  },

  client: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 4,
  },

  description: {
    color: '#65707C',
    fontSize: 8,
    lineHeight: 14,
    marginTop: 12,
  },

  missionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#151C27',
    marginTop: 12,
    paddingVertical: 10,
  },

  statLabel: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
  },

  reward: {
    color: '#00F5A0',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 3,
  },

  statValue: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 3,
  },

  highRisk: {
    color: '#FFB800',
  },

  missionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  durationLabel: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
  },

  duration: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 3,
  },

  startButton: {
    minWidth: 92,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00F5A0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  lockedButton: {
    backgroundColor: '#151B24',
  },

  lockedButtonText: {
    color: '#59616F',
  },

  startText: {
    color: '#03100A',
    fontSize: 6.5,
    fontWeight: '900',
  },

  startArrow: {
    color: '#03100A',
    fontSize: 16,
    marginLeft: 5,
  },

  buttonPressed: {
    opacity: 0.65,
  },

  infoCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 9,
    padding: 11,
    marginTop: 7,
  },

  infoTitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 1,
  },

  infoText: {
    color: '#414B58',
    fontSize: 7,
    lineHeight: 12,
    marginTop: 5,
  },

  footer: {
    color: '#252E3A',
    textAlign: 'center',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 25,
  },
});
