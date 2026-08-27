import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';



const servers = [
  {
    name: 'SCRAP NODE',
    level: 'LVL 01',
    income: '+$2 / SEC',
    progress: 38,
  },
  {
    name: 'PROXY SERVER',
    level: 'LVL 03',
    income: '+$12 / SEC',
    progress: 67,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const {
    game,
    stats,
    collectPassiveIncome,
    xpRequired,
    xpProgress,
    rank,
    rankNext,
    rankProgress,
  } = useGame();

  // Idle gelirini canlı olarak üret.
  useEffect(() => {
    collectPassiveIncome();

    const interval = setInterval(() => {
      collectPassiveIncome();
    }, 1000);

    return () => clearInterval(interval);
  }, [collectPassiveIncome]);

  const homeStats = [
    {
      label: 'CREDITS',
      value: `$${game.credits.toLocaleString()}`,
      icon: '$',
    },
    {
      label: 'REPUTATION',
      value: game.reputation.toLocaleString(),
      icon: '◆',
    },
    {
      label: 'LEVEL',
      value: `LVL ${game.level}`,
      icon: '◈',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SHADOW<Text style={styles.logoAccent}>NET</Text></Text>
            <Text style={styles.subtitle}>UNDERGROUND NETWORK</Text>
          </View>

          <View style={styles.online}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>◆</Text>
          </View>

          <View style={styles.profileMain}>
            <View style={styles.profileTopRow}>
              <View>
                <Text style={styles.profileName}>
                  SHADOW
                </Text>

                <Text style={styles.profileRank}>
                  {rank}
                </Text>
              </View>

              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeLabel}>
                  LEVEL
                </Text>

                <Text style={styles.levelBadgeValue}>
                  {game.level}
                </Text>
              </View>
            </View>

            <View style={styles.profileXpHeader}>
              <Text style={styles.profileXpLabel}>
                EXPERIENCE
              </Text>

              <Text style={styles.profileXpValue}>
                {game.xp.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </Text>
            </View>

            <View style={styles.profileXpBar}>
              <View
                style={[
                  styles.profileXpFill,
                  {
                    width: `${xpProgress}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.profileBottomRow}>
              <Text style={styles.profileNextRank}>
                {rankNext
                  ? `NEXT RANK // ${rankNext}`
                  : 'MAXIMUM RANK'}
              </Text>

              <Text style={styles.profileRankProgress}>
                {Math.floor(rankProgress)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>CURRENT BALANCE</Text>
          <Text style={styles.money}>${game.credits.toLocaleString()}</Text>
          <Text style={styles.income}>+${stats.passiveIncome} / SEC</Text>

          <View style={styles.balanceLine}>
            <View style={styles.balanceFill} />
          </View>
        </View>

        <View style={styles.statsRow}>
          {homeStats.map((stat) => (
            <View style={styles.statCard} key={stat.label}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NETWORK ACTIVITY</Text>
          <Text style={styles.sectionStatus}>LIVE</Text>
        </View>

        <View style={styles.terminal}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.terminalTitle}>shadow@node:~</Text>
          </View>

          <Text style={styles.terminalLine}>
            <Text style={styles.prompt}>&gt; </Text>
            scanning network...
          </Text>

          <Text style={styles.terminalLine}>
            <Text style={styles.success}>&gt; </Text>
            14 nodes detected
          </Text>

          <Text style={styles.terminalLine}>
            <Text style={styles.prompt}>&gt; </Text>
            proxy connection established
          </Text>

          <Text style={styles.terminalLine}>
            <Text style={styles.success}>&gt; </Text>
            passive income active
          </Text>

          <Text style={styles.cursor}>_</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR INFRASTRUCTURE</Text>
          <Text style={styles.count}>2 NODES</Text>
        </View>

        {servers.map((server) => (
          <View style={styles.serverCard} key={server.name}>
            <View style={styles.serverIcon}>
              <Text style={styles.serverIconText}>▣</Text>
            </View>

            <View style={styles.serverInfo}>
              <View style={styles.serverTop}>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverLevel}>{server.level}</Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${server.progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.serverIncome}>{server.income}</Text>
            </View>
          </View>
        ))}

        <Pressable
          onPress={() => router.push('/network')}
          style={({ pressed }) => [
            styles.hackButton,
            pressed && styles.hackButtonPressed,
          ]}
        >
          <Text style={styles.hackButtonIcon}>⌁</Text>
          <View>
            <Text style={styles.hackButtonTitle}>SCAN NETWORK</Text>
            <Text style={styles.hackButtonSubtitle}>FIND NEW TARGETS</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/infrastructure')}
          style={({ pressed }) => [
            styles.infrastructureButton,
            pressed && styles.infrastructurePressed,
          ]}
        >
          <Text style={styles.infrastructureIcon}>▣</Text>

          <View>
            <Text style={styles.infrastructureTitle}>
              INFRASTRUCTURE
            </Text>

            <Text style={styles.infrastructureSubtitle}>
              MANAGE YOUR DIGITAL EMPIRE
            </Text>
          </View>

          <Text style={styles.infrastructureArrow}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/operations')}
          style={({ pressed }) => [
            styles.operationsButton,
            pressed && styles.operationsPressed,
          ]}
        >
          <View style={styles.operationsIcon}>
            <Text style={styles.operationsIconText}>⌁</Text>
          </View>

          <View style={styles.operationsBody}>
            <Text style={styles.operationsTitle}>
              OPERATIONS
            </Text>

            <Text style={styles.operationsSubtitle}>
              ACCEPT CONTRACTS • EARN XP • BUILD REPUTATION
            </Text>
          </View>

          <Text style={styles.operationsArrow}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/skills')}
          style={({ pressed }) => [
            styles.skillsButton,
            pressed && styles.skillsPressed,
          ]}
        >
          <View style={styles.skillsIcon}>
            <Text style={styles.skillsIconText}>◆</Text>
          </View>

          <View style={styles.skillsBody}>
            <Text style={styles.skillsTitle}>
              SKILL TREE
            </Text>

            <Text style={styles.skillsSubtitle}>
              UPGRADE YOUR DIGITAL CAPABILITIES
            </Text>
          </View>

          <View style={styles.skillsBadge}>
            <Text style={styles.skillsBadgeText}>
              {game.skillPoints} SP
            </Text>
          </View>

          <Text style={styles.skillsArrow}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/market')}
          style={({ pressed }) => [
            styles.marketButton,
            pressed && styles.marketPressed,
          ]}
        >
          <View style={styles.marketIcon}>
            <Text style={styles.marketIconText}>◆</Text>
          </View>

          <View style={styles.marketBody}>
            <Text style={styles.marketTitle}>
              BLACK MARKET
            </Text>

            <Text style={styles.marketSubtitle}>
              TOOLS • INFRASTRUCTURE • EXPLOITS • INTEL
            </Text>
          </View>

          <View style={styles.marketBadge}>
            <Text style={styles.marketBadgeText}>
              6
            </Text>
          </View>

          <Text style={styles.marketArrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>
          SHADOWNET // SYSTEM v1.0.0
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
    paddingTop: 12,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  logo: {
    color: '#F2F5F7',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 2,
  },

  logoAccent: {
    color: '#00F5A0',
  },

  subtitle: {
    color: '#59616F',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },

  online: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#123B2E',
    backgroundColor: '#08150F',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F5A0',
    marginRight: 7,
  },

  onlineText: {
    color: '#00F5A0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },

  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#071811',
    borderWidth: 1,
    borderColor: '#14513E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  profileAvatarText: {
    color: '#00F5A0',
    fontSize: 21,
    fontWeight: '900',
  },

  profileMain: {
    flex: 1,
  },

  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileName: {
    color: '#F2F5F7',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  profileRank: {
    color: '#00F5A0',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 3,
  },

  levelBadge: {
    minWidth: 48,
    alignItems: 'center',
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#20303C',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  levelBadgeLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  levelBadgeValue: {
    color: '#00B8FF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  profileXpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  profileXpLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  profileXpValue: {
    color: '#788593',
    fontSize: 5.5,
    fontWeight: '700',
  },

  profileXpBar: {
    height: 5,
    backgroundColor: '#18202B',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },

  profileXpFill: {
    height: '100%',
    backgroundColor: '#00B8FF',
    borderRadius: 3,
  },

  profileBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  profileNextRank: {
    color: '#414B58',
    fontSize: 5.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  profileRankProgress: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '900',
  },

  hero: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },

  heroLabel: {
    color: '#59616F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  money: {
    color: '#F2F5F7',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: 1,
  },

  income: {
    color: '#00F5A0',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  balanceLine: {
    height: 3,
    backgroundColor: '#151C27',
    borderRadius: 2,
    marginTop: 17,
    overflow: 'hidden',
  },

  balanceFill: {
    width: '68%',
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 12,
  },

  statIcon: {
    color: '#00F5A0',
    fontSize: 15,
    marginBottom: 8,
  },

  statLabel: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  statValue: {
    color: '#DCE2E8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  sectionTitle: {
    color: '#AEB7C2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  sectionStatus: {
    color: '#00F5A0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  count: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
  },

  terminal: {
    backgroundColor: '#030509',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginBottom: 25,
    minHeight: 155,
  },

  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#111722',
    paddingBottom: 10,
    marginBottom: 11,
  },

  terminalDots: {
    flexDirection: 'row',
    gap: 5,
    marginRight: 12,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#303946',
  },

  terminalTitle: {
    color: '#59616F',
    fontSize: 9,
    fontWeight: '700',
  },

  terminalLine: {
    color: '#87919E',
    fontSize: 10,
    lineHeight: 21,
    fontFamily: 'monospace',
  },

  prompt: {
    color: '#00B8FF',
  },

  success: {
    color: '#00F5A0',
  },

  cursor: {
    color: '#00F5A0',
    fontSize: 12,
    marginTop: 1,
  },

  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  serverIcon: {
    width: 43,
    height: 43,
    borderRadius: 8,
    backgroundColor: '#0D1720',
    borderWidth: 1,
    borderColor: '#18342D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  serverIconText: {
    color: '#00F5A0',
    fontSize: 20,
  },

  serverInfo: {
    flex: 1,
  },

  serverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  serverName: {
    color: '#DCE2E8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  serverLevel: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
  },

  progressBackground: {
    height: 4,
    backgroundColor: '#151C27',
    borderRadius: 2,
    marginTop: 9,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  serverIncome: {
    color: '#00F5A0',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 6,
  },

  hackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F5A0',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },

  hackButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  hackButtonIcon: {
    color: '#03100A',
    fontSize: 28,
    fontWeight: '900',
    marginRight: 12,
  },

  hackButtonTitle: {
    color: '#03100A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  hackButtonSubtitle: {
    color: '#145B43',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.8,
  },

  arrow: {
    color: '#03100A',
    fontSize: 30,
    fontWeight: '300',
    marginLeft: 'auto',
  },

  infrastructureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginTop: 15,
  },

  infrastructurePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  infrastructureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    color: '#00F5A0',
    textAlign: 'center',
    lineHeight: 38,
    fontSize: 19,
    marginRight: 11,
  },

  infrastructureTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  infrastructureSubtitle: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.5,
  },

  infrastructureArrow: {
    color: '#00F5A0',
    fontSize: 28,
    marginLeft: 'auto',
  },

  operationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 10,
    padding: 13,
    marginTop: 10,
  },

  operationsPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  operationsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#081017',
    borderWidth: 1,
    borderColor: '#14513E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  operationsIconText: {
    color: '#00F5A0',
    fontSize: 22,
    fontWeight: '900',
  },

  operationsBody: {
    flex: 1,
  },

  operationsTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  operationsSubtitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },

  operationsArrow: {
    color: '#00F5A0',
    fontSize: 27,
    marginLeft: 8,
  },

  skillsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 10,
    padding: 13,
    marginTop: 10,
  },

  skillsPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  skillsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0A1720',
    borderWidth: 1,
    borderColor: '#14513E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  skillsIconText: {
    color: '#00B8FF',
    fontSize: 17,
  },

  skillsBody: {
    flex: 1,
  },

  skillsTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  skillsSubtitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },

  skillsBadge: {
    backgroundColor: '#081017',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginRight: 7,
  },

  skillsBadgeText: {
    color: '#00B8FF',
    fontSize: 7,
    fontWeight: '900',
  },

  skillsArrow: {
    color: '#00F5A0',
    fontSize: 27,
  },

  marketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#100A0D',
    borderWidth: 1,
    borderColor: '#3B1823',
    borderRadius: 10,
    padding: 13,
    marginTop: 10,
  },

  marketPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  marketIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1A0C11',
    borderWidth: 1,
    borderColor: '#5B2131',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  marketIconText: {
    color: '#FF426D',
    fontSize: 16,
  },

  marketBody: {
    flex: 1,
  },

  marketTitle: {
    color: '#D58A9C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  marketSubtitle: {
    color: '#72535D',
    fontSize: 6.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },

  marketBadge: {
    backgroundColor: '#30121B',
    borderWidth: 1,
    borderColor: '#5B2131',
    borderRadius: 5,
    minWidth: 22,
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 7,
  },

  marketBadgeText: {
    color: '#FF426D',
    fontSize: 7,
    fontWeight: '900',
  },

  marketArrow: {
    color: '#FF426D',
    fontSize: 27,
  },

  footer: {
    textAlign: 'center',
    color: '#252E3A',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 28,
  },
});
