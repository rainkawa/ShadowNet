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
  correct: boolean;
  trace: number;
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

const choices: Record<string, Choice[][]> = {
  ghost: [
    [
      {
        id: 'scan',
        label: 'PASSIVE SCAN',
        description: 'Map the node without touching the target.',
        correct: true,
        trace: 0,
      },
      {
        id: 'probe',
        label: 'ACTIVE PROBE',
        description: 'Force a response from the remote host.',
        correct: false,
        trace: 8,
      },
      {
        id: 'direct',
        label: 'DIRECT ACCESS',
        description: 'Attempt immediate entry.',
        correct: false,
        trace: 14,
      },
    ],
    [
      {
        id: 'proxy',
        label: 'PROXY CHAIN',
        description: 'Route the connection through multiple relays.',
        correct: true,
        trace: 1,
      },
      {
        id: 'direct',
        label: 'DIRECT ROUTE',
        description: 'Connect directly to the target.',
        correct: false,
        trace: 9,
      },
      {
        id: 'spoof',
        label: 'IDENTITY SPOOF',
        description: 'Forge a temporary identity signature.',
        correct: false,
        trace: 6,
      },
    ],
    [
      {
        id: 'extract',
        label: 'QUIET EXTRACTION',
        description: 'Copy only the requested payload.',
        correct: true,
        trace: 1,
      },
      {
        id: 'dump',
        label: 'FULL DATA DUMP',
        description: 'Take everything from the node.',
        correct: false,
        trace: 12,
      },
      {
        id: 'destroy',
        label: 'PURGE NODE',
        description: 'Destroy the evidence after extraction.',
        correct: false,
        trace: 10,
      },
    ],
  ],

  blackout: [
    [
      {
        id: 'observe',
        label: 'OBSERVE TRAFFIC',
        description: 'Study relay patterns first.',
        correct: true,
        trace: 0,
      },
      {
        id: 'flood',
        label: 'FLOOD RELAY',
        description: 'Overload the relay immediately.',
        correct: false,
        trace: 12,
      },
      {
        id: 'scan',
        label: 'DEEP SCAN',
        description: 'Aggressively scan every service.',
        correct: false,
        trace: 8,
      },
    ],
    [
      {
        id: 'mirror',
        label: 'MIRROR ROUTE',
        description: 'Clone the relay path and attack the mirror.',
        correct: true,
        trace: 1,
      },
      {
        id: 'brute',
        label: 'BRUTE FORCE',
        description: 'Hammer the authentication layer.',
        correct: false,
        trace: 13,
      },
      {
        id: 'inject',
        label: 'DIRECT INJECTION',
        description: 'Inject a command into the primary relay.',
        correct: false,
        trace: 10,
      },
    ],
    [
      {
        id: 'shutdown',
        label: 'CONTROLLED SHUTDOWN',
        description: 'Disable the relay subsystem cleanly.',
        correct: true,
        trace: 1,
      },
      {
        id: 'crash',
        label: 'FORCED CRASH',
        description: 'Destroy the relay immediately.',
        correct: false,
        trace: 15,
      },
      {
        id: 'linger',
        label: 'MAINTAIN ACCESS',
        description: 'Keep the connection open longer.',
        correct: false,
        trace: 8,
      },
    ],
  ],

  vault: [
    [
      {
        id: 'intel',
        label: 'READ METADATA',
        description: 'Analyze the vault structure first.',
        correct: true,
        trace: 0,
      },
      {
        id: 'attack',
        label: 'ATTACK SURFACE',
        description: 'Start probing protected endpoints.',
        correct: false,
        trace: 12,
      },
      {
        id: 'credentials',
        label: 'GUESS CREDENTIALS',
        description: 'Try common administrator credentials.',
        correct: false,
        trace: 10,
      },
    ],
    [
      {
        id: 'key',
        label: 'KEY RECONSTRUCTION',
        description: 'Rebuild the fragmented access key.',
        correct: true,
        trace: 2,
      },
      {
        id: 'brute',
        label: 'BRUTE FORCE',
        description: 'Search the entire key space.',
        correct: false,
        trace: 18,
      },
      {
        id: 'bypass',
        label: 'SECURITY BYPASS',
        description: 'Attempt to bypass the encryption layer.',
        correct: false,
        trace: 14,
      },
    ],
    [
      {
        id: 'extract',
        label: 'TARGETED EXTRACTION',
        description: 'Extract only the contracted data.',
        correct: true,
        trace: 1,
      },
      {
        id: 'all',
        label: 'TOTAL EXTRACTION',
        description: 'Copy the complete vault.',
        correct: false,
        trace: 14,
      },
      {
        id: 'wipe',
        label: 'WIPE EVERYTHING',
        description: 'Destroy the vault after entry.',
        correct: false,
        trace: 16,
      },
    ],
  ],

  phantom: [
    [
      {
        id: 'ghost',
        label: 'GHOST ROUTE',
        description: 'Build a hidden route before touching the relay.',
        correct: true,
        trace: 0,
      },
      {
        id: 'direct',
        label: 'DIRECT TAKEOVER',
        description: 'Attempt immediate control of the relay.',
        correct: false,
        trace: 18,
      },
      {
        id: 'scan',
        label: 'FULL NETWORK SCAN',
        description: 'Scan all connected nodes.',
        correct: false,
        trace: 14,
      },
    ],
    [
      {
        id: 'mirror',
        label: 'MIRROR RELAY',
        description: 'Clone the relay through a disposable mirror.',
        correct: true,
        trace: 2,
      },
      {
        id: 'force',
        label: 'FORCE ACCESS',
        description: 'Break through the primary gateway.',
        correct: false,
        trace: 20,
      },
      {
        id: 'spoof',
        label: 'FULL ID SPOOF',
        description: 'Replace the entire identity chain.',
        correct: false,
        trace: 12,
      },
    ],
    [
      {
        id: 'lock',
        label: 'LOCK ROUTE',
        description: 'Seal the route and leave minimal evidence.',
        correct: true,
        trace: 2,
      },
      {
        id: 'expand',
        label: 'EXPAND CONTROL',
        description: 'Take control of additional relays.',
        correct: false,
        trace: 18,
      },
      {
        id: 'destroy',
        label: 'DESTROY RELAY',
        description: 'Destroy the target after takeover.',
        correct: false,
        trace: 20,
      },
    ],
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
  const [operationTrace, setOperationTrace] =
    useState(0);

  const [message, setMessage] = useState(
    'SELECT A CONTRACT TO BEGIN'
  );

  const [outcome, setOutcome] = useState<
    | 'SUCCESS'
    | 'PARTIAL'
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

  const phaseChoices =
    activeMission
      ? choices[activeMission.id]?.[phase] ??
        []
      : [];

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

    const started = startOperation(
      mission.id,
      mission.duration
    );

    if (!started) {
      setMessage(
        'OPERATION COULD NOT START'
      );
      return;
    }

    const createdId =
      `${mission.id}-${Date.now()}`;

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

    const nextMistakes =
      mistakes + (choice.correct ? 0 : 1);

    const nextTrace =
      operationTrace + choice.trace;

    setMistakes(nextMistakes);
    setOperationTrace(nextTrace);

    advanceOperation(
      activeOperation.id,
      choice.correct,
      choice.trace
    );

    if (!choice.correct) {
      if (nextMistakes >= 2) {
        setOutcome(
          'CRITICAL_FAILURE'
        );

        setMessage(
          'SECURITY SYSTEM // TRACE LOCK'
        );

        setSelectedOperationId(null);

        return;
      }

      setMessage(
        `WARNING // TRACE +${choice.trace}%`
      );
    } else {
      setMessage(
        phase >= 2
          ? 'FINAL ROUTE ACCEPTED // RESOLVING'
          : 'ACCESS VECTOR ACCEPTED // CONTINUE'
      );
    }

    if (phase >= 2) {
      if (nextMistakes === 0) {
        setOutcome('SUCCESS');
      } else {
        setOutcome('PARTIAL');
      }
    } else {
      setPhase((current) =>
        Math.min(2, current + 1)
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
    ((phase + 1) / 3) * 100;

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
                    PHASE {phase + 1} / 3
                  </Text>

                  <Text style={styles.operationTitle}>
                    {activeMission.title}
                  </Text>
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
                SELECT THE SAFEST VECTOR
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
                        {choice.correct
                          ? '›'
                          : '?'}
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
                    'SUCCESS'
                      ? `+$${activeMission.reward.toLocaleString()} // +${activeMission.xp} XP`
                      : outcome ===
                        'PARTIAL'
                        ? `PARTIAL PAYOUT // +$${Math.floor(
                            activeMission.reward *
                              0.45
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
            Correct decisions advance the operation.
            Wrong decisions increase trace and mistakes.
            Two mistakes can trigger a critical failure.
          </Text>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // INTERACTIVE CONTRACT NETWORK v2.0
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
