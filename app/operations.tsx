import React, { useEffect, useMemo, useState } from 'react';
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

const missions: Mission[] = [
  {
    id: 'ghost',
    title: 'GHOST PROTOCOL',
    client: 'UNKNOWN CLIENT',
    description: 'Extract encrypted data from an isolated private node.',
    reward: 1250,
    xp: 90,
    security: 22,
    risk: 8,
    duration: 8,
    category: 'INFILTRATION',
  },
  {
    id: 'blackout',
    title: 'BLACKOUT',
    client: 'NIGHTFALL',
    description: 'Disrupt a corporate relay and remain undetected.',
    reward: 3400,
    xp: 180,
    security: 41,
    risk: 19,
    duration: 14,
    category: 'DISRUPTION',
  },
  {
    id: 'vault',
    title: 'VAULT ZERO',
    client: 'UNKNOWN',
    description: 'Break through a high-security digital vault.',
    reward: 7800,
    xp: 360,
    security: 67,
    risk: 34,
    duration: 22,
    category: 'EXTRACTION',
  },
  {
    id: 'phantom',
    title: 'PHANTOM ROUTE',
    client: 'GHOST MARKET',
    description: 'Hijack a hidden relay and establish a permanent route.',
    reward: 15600,
    xp: 620,
    security: 81,
    risk: 48,
    duration: 35,
    category: 'NETWORK',
  },
];

export default function OperationsScreen() {
  const router = useRouter();

  const {
    game,
    stats,
    startOperation,
    claimOperation,
    xpRequired,
    xpProgress,
  } = useGame();

  const activeOperations = game.operations;

  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const level = game.level;
  const xp = game.xp;
  const credits = game.credits;
  const completedToday = game.completedToday;

  const xpForNextLevel = xpRequired;

  const active = activeOperations.length > 0
    ? missions.find(
        (mission) =>
          mission.id === activeOperations[0].missionId
      )
    : undefined;

  const activeMission = activeOperations[0]?.missionId ?? null;

  const remaining = activeOperations.length > 0
    ? Math.max(
        0,
        Math.ceil(
          (activeOperations[0].completesAt - tick) / 1000
        )
      )
    : 0;

  useEffect(() => {
    for (const operation of activeOperations) {
      if (operation.completesAt > Date.now()) continue;

      const mission = missions.find(
        (item) => item.id === operation.missionId
      );

      if (!mission) continue;

      claimOperation(
        operation.id,
        mission.reward,
        mission.xp,
        5,
        mission.security,
        mission.risk
      );
    }
  }, [tick, activeOperations, claimOperation]);

  const startMission = (mission: Mission) => {
    if (activeOperations.length >= 3) return;

    startOperation(
      mission.id,
      mission.duration
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>OPERATIONS</Text>
            <Text style={styles.subtitle}>
              CONTRACT NETWORK
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>◆</Text>
          </View>

          <View style={styles.profileMain}>
            <Text style={styles.profileName}>
              SHADOW
            </Text>

            <Text style={styles.profileRole}>
              DIGITAL INTRUDER // LEVEL {level}
            </Text>

            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${xpProgress}%` },
                ]}
              />
            </View>

            <Text style={styles.xpText}>
              {xp} / {xpForNextLevel} XP
            </Text>
          </View>

          <View style={styles.creditBox}>
            <Text style={styles.creditLabel}>CREDITS</Text>
            <Text style={styles.creditValue}>
              ${credits.toLocaleString()}
            </Text>
          </View>
        </View>

        {activeOperations.length > 0 && (
          <View>
            {activeOperations.map((operation, index) => {
              const mission = missions.find(
                (item) => item.id === operation.missionId
              );

              if (!mission) return null;

              const operationRemaining = Math.max(
                0,
                Math.ceil(
                  (operation.completesAt - tick) / 1000
                )
              );

              const progress = Math.min(
                100,
                Math.max(
                  0,
                  100 -
                    (operationRemaining / mission.duration) * 100
                )
              );

              return (
                <View
                  key={operation.id}
                  style={styles.activeCard}
                >
                  <View style={styles.activeHeader}>
                    <View>
                      <Text style={styles.activeLabel}>
                        OPERATION {index + 1} / 3
                      </Text>

                      <Text style={styles.activeTitle}>
                        {mission.title}
                      </Text>
                    </View>

                    <Text style={styles.timer}>
                      {formatTime(operationRemaining)}
                    </Text>
                  </View>

                  <View style={styles.activeProgressBackground}>
                    <View
                      style={[
                        styles.activeProgress,
                        {
                          width: `${progress}%`,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.activeFooter}>
                    <Text style={styles.activeStatus}>
                      ● EXECUTION IN PROGRESS
                    </Text>

                    <Text style={styles.activeReward}>
                      +${mission.reward.toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              AVAILABLE CONTRACTS
            </Text>
            <Text style={styles.sectionSubtitle}>
              COMPLETE OPERATIONS TO EARN CREDITS AND XP
            </Text>
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {completedToday} DONE
            </Text>
          </View>
        </View>

        {missions.map((mission) => {
          const locked =
            mission.security > level * 18 + 25;

          const running =
            activeMission === mission.id;

          return (
            <View
              key={mission.id}
              style={[
                styles.missionCard,
                running && styles.runningCard,
                locked && styles.lockedCard,
              ]}
            >
              <View style={styles.missionTop}>
                <View style={styles.missionIcon}>
                  <Text
                    style={[
                      styles.missionIconText,
                      locked && styles.lockedText,
                    ]}
                  >
                    {locked ? '?' : '⌁'}
                  </Text>
                </View>

                <View style={styles.missionIdentity}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.missionTitle,
                        locked && styles.lockedText,
                      ]}
                    >
                      {mission.title}
                    </Text>

                    <Text
                      style={[
                        styles.category,
                        locked && styles.lockedText,
                      ]}
                    >
                      {mission.category}
                    </Text>
                  </View>

                  <Text style={styles.client}>
                    {mission.client}
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>
                {mission.description}
              </Text>

              <View style={styles.missionStats}>
                <View>
                  <Text style={styles.statLabel}>
                    REWARD
                  </Text>
                  <Text style={styles.reward}>
                    ${mission.reward.toLocaleString()}
                  </Text>
                </View>

                <View>
                  <Text style={styles.statLabel}>
                    XP
                  </Text>
                  <Text style={styles.statValue}>
                    +{mission.xp}
                  </Text>
                </View>

                <View>
                  <Text style={styles.statLabel}>
                    SECURITY
                  </Text>
                  <Text style={styles.statValue}>
                    {mission.security}%
                  </Text>
                </View>

                <View>
                  <Text style={styles.statLabel}>
                    TRACE
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      mission.risk >= 30 &&
                        styles.highRisk,
                    ]}
                  >
                    {mission.risk}%
                  </Text>
                </View>
              </View>

              <View style={styles.missionBottom}>
                <View>
                  <Text style={styles.durationLabel}>
                    EST. TIME
                  </Text>
                  <Text style={styles.duration}>
                    {mission.duration}s
                  </Text>
                </View>

                <Pressable
                  disabled={
                    locked ||
                    activeOperations.length >= 3 ||
                    activeMission === mission.id
                  }
                  onPress={() => startMission(mission)}
                  style={({ pressed }) => [
                    styles.startButton,
                    locked && styles.lockedButton,
                    activeOperations.length > 0 &&
                      !running &&
                      styles.busyButton,
                    pressed &&
                      !locked &&
                      !activeMission &&
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
                    {running
                      ? 'RUNNING'
                      : locked
                        ? 'LOCKED'
                        : activeOperations.some(
                            (operation) =>
                              operation.missionId === mission.id
                          )
                          ? 'BUSY'
                          : 'EXECUTE'}
                  </Text>

                  {!locked &&
                    !running &&
                    activeOperations.length < 3 && (
                    <Text style={styles.startArrow}>
                      ›
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.chainCard}>
          <View style={styles.chainIcon}>
            <Text style={styles.chainIconText}>◆</Text>
          </View>

          <View style={styles.chainBody}>
            <Text style={styles.chainTitle}>
              OPERATION CHAIN
            </Text>

            <Text style={styles.chainText}>
              Complete 5 operations without triggering a trace
              to unlock a bonus contract.
            </Text>

            <View style={styles.chainBar}>
              <View style={styles.chainFill} />
            </View>

            <Text style={styles.chainProgress}>
              3 / 5 OPERATIONS
            </Text>
          </View>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>

          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>
              TRACE WARNING
            </Text>

            <Text style={styles.warningText}>
              High-security contracts generate more trace.
              Upgrade Stealth to access dangerous contracts safely.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // CONTRACT NETWORK v1.0
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
    paddingBottom: 40,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#123B2E',
    backgroundColor: '#08150F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#00F5A0',
    marginRight: 5,
  },

  liveText: {
    color: '#00F5A0',
    fontSize: 7,
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
    letterSpacing: 0.5,
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

  activeCard: {
    backgroundColor: '#071811',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 10,
    padding: 13,
    marginBottom: 22,
  },

  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeLabel: {
    color: '#00F5A0',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  activeTitle: {
    color: '#DCE2E8',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },

  timer: {
    color: '#00F5A0',
    fontSize: 17,
    fontWeight: '900',
    fontFamily: 'monospace',
  },

  activeProgressBackground: {
    height: 5,
    backgroundColor: '#13261F',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 13,
  },

  activeProgress: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  activeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  activeStatus: {
    color: '#52796A',
    fontSize: 6.5,
    fontWeight: '800',
  },

  activeReward: {
    color: '#00F5A0',
    fontSize: 8,
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

  runningCard: {
    borderColor: '#14513E',
  },

  lockedCard: {
    opacity: 0.55,
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
    letterSpacing: 0.5,
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
    letterSpacing: 0.5,
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
    paddingVertical: 8,
  },

  lockedButton: {
    backgroundColor: '#151B24',
  },

  busyButton: {
    backgroundColor: '#111923',
  },

  buttonPressed: {
    opacity: 0.7,
  },

  startText: {
    color: '#03100A',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  lockedButtonText: {
    color: '#59616F',
  },

  startArrow: {
    color: '#03100A',
    fontSize: 17,
    marginLeft: 5,
  },

  lockedText: {
    color: '#59616F',
  },

  chainCard: {
    flexDirection: 'row',
    backgroundColor: '#081017',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 10,
    padding: 12,
    marginTop: 7,
  },

  chainIcon: {
    width: 34,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#0A1720',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  chainIconText: {
    color: '#00B8FF',
    fontSize: 14,
  },

  chainBody: {
    flex: 1,
  },

  chainTitle: {
    color: '#8A9AA8',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  chainText: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 4,
  },

  chainBar: {
    height: 4,
    backgroundColor: '#18202B',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },

  chainFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#00B8FF',
  },

  chainProgress: {
    color: '#59616F',
    fontSize: 6,
    marginTop: 4,
  },

  warning: {
    flexDirection: 'row',
    backgroundColor: '#11100A',
    borderWidth: 1,
    borderColor: '#393019',
    borderRadius: 9,
    padding: 11,
    marginTop: 9,
  },

  warningIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFB800',
    color: '#FFB800',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 10,
    fontWeight: '900',
    marginRight: 9,
  },

  warningBody: {
    flex: 1,
  },

  warningTitle: {
    color: '#A98D43',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  warningText: {
    color: '#6D6348',
    fontSize: 7,
    lineHeight: 13,
    marginTop: 3,
  },

  footer: {
    color: '#252E3A',
    textAlign: 'center',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 24,
  },
});
