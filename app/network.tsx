import React, { useMemo, useState } from 'react';
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

type Target = {
  id: string;
  name: string;
  type: string;
  security: number;
  reward: number;
  xp: number;
  trace: number;
  status: 'ONLINE' | 'LOCKED' | 'SCANNING';
  icon: string;
};

const targets: Target[] = [
  {
    id: 'node_01',
    name: 'LOCAL GATEWAY',
    type: 'NETWORK NODE',
    security: 18,
    reward: 850,
    xp: 55,
    trace: 8,
    status: 'ONLINE',
    icon: '◈',
  },
  {
    id: 'node_02',
    name: 'PRIVATE SERVER',
    type: 'PRIVATE INFRA',
    security: 32,
    reward: 1450,
    xp: 90,
    trace: 13,
    status: 'ONLINE',
    icon: '◇',
  },
  {
    id: 'node_03',
    name: 'CORPORATE DB',
    type: 'DATABASE',
    security: 51,
    reward: 3200,
    xp: 180,
    trace: 21,
    status: 'ONLINE',
    icon: '▣',
  },
  {
    id: 'node_04',
    name: 'FINANCIAL CORE',
    type: 'HIGH VALUE',
    security: 68,
    reward: 6800,
    xp: 340,
    trace: 31,
    status: 'ONLINE',
    icon: '◆',
  },
  {
    id: 'node_05',
    name: 'GHOST NETWORK',
    type: 'UNKNOWN',
    security: 86,
    reward: 15000,
    xp: 700,
    trace: 45,
    status: 'LOCKED',
    icon: '◉',
  },
];

export default function NetworkScreen() {
  const router = useRouter();

  const {
    game,
    stats,
    addCredits,
    addXp,
    addTrace,
    recordOperation,
    xpRequired,
    xpProgress,
  } = useGame();

  const [selected, setSelected] = useState('node_01');
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState(
    'SELECT A TARGET TO BEGIN'
  );

  const currentTarget = useMemo(
    () =>
      targets.find((target) => target.id === selected) ??
      targets[0],
    [selected]
  );

  const performScan = () => {
    if (scanning) return;

    setScanning(true);
    setMessage('SCANNING NETWORK...');

    setTimeout(() => {
      setScanning(false);
      setMessage(
        `${currentTarget.name} // SCAN COMPLETE`
      );
    }, 1800);
  };

  const launchOperation = () => {
    if (currentTarget.status === 'LOCKED') {
      setMessage('TARGET LOCKED // INCREASE LEVEL');
      return;
    }

    setMessage('OPERATION INITIALIZED...');

    setTimeout(() => {
      // Skill + equipment bonusları başarı ihtimaline ekleniyor.
      const baseChance =
        94 -
        currentTarget.security +
        (game.level - 5) * 2;

      const finalChance = Math.min(
        97,
        Math.max(
          5,
          baseChance + stats.successBonus
        )
      );

      const success =
        Math.random() * 100 < finalChance;

      if (success) {
        // Reward bonusu ekipmanlardan geliyor.
        const reward = Math.floor(
          currentTarget.reward *
            (1 + stats.rewardBonus / 100)
        );

        // XP bonusu skill/equipment üzerinden geliyor.
        const earnedXp = Math.floor(
          currentTarget.xp *
            (1 + stats.xpBonus / 100)
        );

        // Proxy ve diğer trace azaltıcı sistemler
        // oluşan izi düşürüyor.
        const generatedTrace = Math.max(
          1,
          Math.floor(
            currentTarget.trace *
              (1 - stats.traceReduction / 100)
          )
        );

        addCredits(reward);
        addXp(earnedXp);
        addTrace(generatedTrace);
        recordOperation(true);

        setMessage(
          `SUCCESS // +$${reward.toLocaleString()} // +${earnedXp} XP // TRACE +${generatedTrace}%`
        );
      } else {
        const generatedTrace = Math.max(
          1,
          Math.floor(
            (currentTarget.trace + 8) *
              (1 - stats.traceReduction / 100)
          )
        );

        addTrace(generatedTrace);
        recordOperation(false);

        setMessage(
          `FAILED // ${Math.floor(finalChance)}% CHANCE // TRACE +${generatedTrace}%`
        );
      }
    }, 1400);
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
            <Text style={styles.title}>NETWORK</Text>
            <Text style={styles.subtitle}>
              GLOBAL TARGET DISCOVERY
            </Text>
          </View>

          <View style={styles.online}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>
              LIVE
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              CREDITS
            </Text>
            <Text style={styles.statValue}>
              ${game.credits.toLocaleString()}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              LEVEL
            </Text>
            <Text style={styles.statValue}>
              {game.level}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              XP
            </Text>
            <Text style={styles.statValueBlue}>
              {game.xp}/{xpRequired}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              TRACE
            </Text>
            <Text
              style={[
                styles.statValue,
                game.trace >= 70 && styles.dangerText,
              ]}
            >
              {game.trace}%
            </Text>
          </View>
        </View>

        <View style={styles.traceBar}>
          <View
            style={[
              styles.traceFill,
              {
                width: `${game.trace}%`,
              },
            ]}
          />
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>

          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>
              DIGITAL FOOTPRINT
            </Text>

            <Text style={styles.warningText}>
              Every operation generates trace. High trace
              increases the risk of countermeasures.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              DISCOVERED TARGETS
            </Text>
            <Text style={styles.sectionSubtitle}>
              {targets.length} NETWORK SIGNATURES FOUND
            </Text>
          </View>

          <Pressable
            onPress={performScan}
            style={[
              styles.scanButton,
              scanning && styles.scanDisabled,
            ]}
          >
            <Text style={styles.scanText}>
              {scanning ? 'SCANNING' : 'SCAN NETWORK'}
            </Text>
          </Pressable>
        </View>

        {targets.map((target) => {
          const active = selected === target.id;
          const locked = target.status === 'LOCKED';

          return (
            <Pressable
              key={target.id}
              onPress={() => {
                setSelected(target.id);
                setMessage(
                  `${target.name} // TARGET SELECTED`
                );
              }}
              style={[
                styles.target,
                active && styles.targetActive,
                locked && styles.targetLocked,
              ]}
            >
              <View
                style={[
                  styles.targetIcon,
                  active && styles.targetIconActive,
                ]}
              >
                <Text
                  style={[
                    styles.targetIconText,
                    active &&
                      styles.targetIconTextActive,
                  ]}
                >
                  {locked ? '?' : target.icon}
                </Text>
              </View>

              <View style={styles.targetBody}>
                <View style={styles.targetTitleRow}>
                  <Text style={styles.targetName}>
                    {target.name}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      locked &&
                        styles.statusBadgeLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        locked &&
                          styles.statusTextLocked,
                      ]}
                    >
                      {target.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.targetType}>
                  {target.type}
                </Text>

                <View style={styles.targetStats}>
                  <View>
                    <Text style={styles.targetStatLabel}>
                      SECURITY
                    </Text>
                    <Text
                      style={[
                        styles.targetStatValue,
                        target.security >= 60 &&
                          styles.highSecurity,
                      ]}
                    >
                      {target.security}%
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.targetStatLabel}>
                      REWARD
                    </Text>
                    <Text style={styles.rewardValue}>
                      ${target.reward.toLocaleString()}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.targetStatLabel}>
                      XP
                    </Text>
                    <Text style={styles.xpValue}>
                      +{target.xp}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.operationPanel}>
          <View style={styles.operationHeader}>
            <View>
              <Text style={styles.operationLabel}>
                SELECTED TARGET
              </Text>

              <Text style={styles.operationTarget}>
                {currentTarget.name}
              </Text>
            </View>

            <Text style={styles.operationSecurity}>
              {currentTarget.security}% SEC
            </Text>
          </View>

          <View style={styles.operationDivider} />

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              onPress={performScan}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryText}>
                ANALYZE
              </Text>
            </Pressable>

            <Pressable
              onPress={launchOperation}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryText}>
                LAUNCH OPERATION
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.navigationRow}>
          <Pressable
            onPress={() => router.push('/skills')}
            style={styles.navButton}
          >
            <Text style={styles.navIcon}>◆</Text>
            <Text style={styles.navText}>SKILLS</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/market')}
            style={styles.navButton}
          >
            <Text style={styles.navIcon}>◇</Text>
            <Text style={styles.navText}>MARKET</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // NETWORK CONTROL v1.0
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
    letterSpacing: 1,
    marginTop: 3,
  },

  online: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08150F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },

  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#00F5A0',
    marginRight: 5,
  },

  onlineText: {
    color: '#00F5A0',
    fontSize: 6,
    fontWeight: '900',
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 9,
    marginTop: 10,
    paddingVertical: 11,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#151C27',
  },

  statLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
  },

  statValue: {
    color: '#00F5A0',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },

  statValueBlue: {
    color: '#00B8FF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },

  dangerText: {
    color: '#FF426D',
  },

  traceBar: {
    height: 3,
    backgroundColor: '#151C27',
    marginTop: 5,
    borderRadius: 2,
    overflow: 'hidden',
  },

  traceFill: {
    height: '100%',
    backgroundColor: '#FF426D',
  },

  warning: {
    flexDirection: 'row',
    backgroundColor: '#100A0D',
    borderWidth: 1,
    borderColor: '#3B1823',
    borderRadius: 9,
    padding: 10,
    marginTop: 10,
  },

  warningIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF426D',
    color: '#FF426D',
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
    color: '#D58A9C',
    fontSize: 7,
    fontWeight: '900',
  },

  warningText: {
    color: '#72535D',
    fontSize: 7,
    lineHeight: 12,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 21,
    marginBottom: 9,
  },

  sectionTitle: {
    color: '#AEB7C2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  sectionSubtitle: {
    color: '#414B58',
    fontSize: 6,
    fontWeight: '700',
    marginTop: 3,
  },

  scanButton: {
    backgroundColor: '#0A1720',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  scanDisabled: {
    opacity: 0.5,
  },

  scanText: {
    color: '#00B8FF',
    fontSize: 6,
    fontWeight: '900',
  },

  target: {
    flexDirection: 'row',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 9,
    padding: 10,
    marginBottom: 7,
  },

  targetActive: {
    borderColor: '#14513E',
    backgroundColor: '#08150F',
  },

  targetLocked: {
    opacity: 0.48,
  },

  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#17202D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  targetIconActive: {
    backgroundColor: '#0A2119',
    borderColor: '#14513E',
  },

  targetIconText: {
    color: '#59616F',
    fontSize: 17,
  },

  targetIconTextActive: {
    color: '#00F5A0',
  },

  targetBody: {
    flex: 1,
  },

  targetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  targetName: {
    color: '#DCE2E8',
    fontSize: 8.5,
    fontWeight: '900',
    flex: 1,
  },

  statusBadge: {
    backgroundColor: '#08150F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  statusBadgeLocked: {
    backgroundColor: '#111017',
    borderColor: '#332D3D',
  },

  statusText: {
    color: '#00F5A0',
    fontSize: 5,
    fontWeight: '900',
  },

  statusTextLocked: {
    color: '#806B91',
  },

  targetType: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '700',
    marginTop: 3,
  },

  targetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  targetStatLabel: {
    color: '#414B58',
    fontSize: 5,
    fontWeight: '800',
  },

  targetStatValue: {
    color: '#AEB7C2',
    fontSize: 7.5,
    fontWeight: '900',
    marginTop: 2,
  },

  highSecurity: {
    color: '#FFB800',
  },

  rewardValue: {
    color: '#00F5A0',
    fontSize: 7.5,
    fontWeight: '900',
    marginTop: 2,
  },

  xpValue: {
    color: '#00B8FF',
    fontSize: 7.5,
    fontWeight: '900',
    marginTop: 2,
  },

  operationPanel: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 10,
    padding: 13,
    marginTop: 8,
  },

  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  operationLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
  },

  operationTarget: {
    color: '#DCE2E8',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  operationSecurity: {
    color: '#FFB800',
    fontSize: 7,
    fontWeight: '900',
  },

  operationDivider: {
    height: 1,
    backgroundColor: '#17202D',
    marginVertical: 10,
  },

  message: {
    color: '#00B8FF',
    fontSize: 7,
    fontWeight: '800',
    minHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 10,
  },

  secondaryText: {
    color: '#8A9AA8',
    fontSize: 6.5,
    fontWeight: '900',
  },

  primaryButton: {
    flex: 1.6,
    backgroundColor: '#00F5A0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  primaryText: {
    color: '#03100A',
    fontSize: 6.5,
    fontWeight: '900',
  },

  buttonPressed: {
    opacity: 0.65,
  },

  navigationRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 7,
    paddingVertical: 10,
  },

  navIcon: {
    color: '#00B8FF',
    fontSize: 9,
    marginRight: 6,
  },

  navText: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '900',
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
