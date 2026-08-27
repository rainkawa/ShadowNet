import React from 'react';
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

const initialServers = [
  {
    id: 'scrap',
    name: 'SCRAP NODE',
    type: 'BASIC COMPUTE',
    income: 2,
    power: 1,
    nextCost: 150,
    color: '#00F5A0',
  },
  {
    id: 'proxy',
    name: 'PROXY SERVER',
    type: 'NETWORK RELAY',
    income: 12,
    power: 5,
    nextCost: 850,
    color: '#00B8FF',
  },
  {
    id: 'rack',
    name: 'RACK SERVER',
    type: 'HIGH PERFORMANCE',
    income: 35,
    power: 20,
    nextCost: 2400,
    color: '#A66CFF',
  },
  {
    id: 'datacenter',
    name: 'DATA CENTER',
    type: 'ENTERPRISE CORE',
    income: 150,
    power: 100,
    nextCost: 12000,
    color: '#FFB800',
  },
];

export default function InfrastructureScreen() {
  const router = useRouter();

  const {
    game,
    stats,
    upgradeInfrastructure,
  } = useGame();

  const servers = initialServers;

  const getLevel = (id: string) =>
    game.infrastructure[id] ?? 0;

  const totalIncome = stats.passiveIncome;

  const totalPower = servers.reduce(
    (total, server) =>
      total + server.power * getLevel(server.id),
    0
  );

  const upgradeServer = (id: string) => {
    const server = servers.find(
      (item) => item.id === id
    );

    if (!server) return;

    const currentLevel = getLevel(id);

    const cost = getUpgradeCost(
      server,
      currentLevel
    );

    if (game.credits < cost) return;

    upgradeInfrastructure(id, cost);
  };

  const getUpgradeCost = (
    server: (typeof initialServers)[number],
    level: number
  ) => {
    if (level === 0) return server.nextCost;

    return Math.floor(
      server.nextCost * Math.pow(1.65, level - 1)
    );
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
            <Text style={styles.title}>INFRASTRUCTURE</Text>
            <Text style={styles.subtitle}>YOUR DIGITAL EMPIRE</Text>
          </View>

          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE CREDITS</Text>
            <Text style={styles.balanceValue}>
              ${game.credits.toLocaleString()}
            </Text>
          </View>

          <View style={styles.incomeBox}>
            <Text style={styles.incomeLabel}>PASSIVE INCOME</Text>
            <Text style={styles.incomeValue}>
              +${totalIncome} / SEC
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>▣</Text>
            <Text style={styles.statLabel}>ACTIVE NODES</Text>
            <Text style={styles.statValue}>
              {servers.filter((server) => getLevel(server.id) > 0).length}
              <Text style={styles.statMuted}> / {servers.length}</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>◈</Text>
            <Text style={styles.statLabel}>CPU POWER</Text>
            <Text style={styles.statValue}>
              {stats.cpuUsed}
              <Text style={styles.statMuted}>
                {' / '}{stats.cpuCapacity}
              </Text>
            </Text>

            <View style={styles.cpuBar}>
              <View
                style={[
                  styles.cpuBarFill,
                  {
                    width: `${Math.min(
                      100,
                      (stats.cpuUsed / stats.cpuCapacity) * 100
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.cpuAvailable}>
              {stats.cpuAvailable} CPU AVAILABLE
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>↯</Text>
            <Text style={styles.statLabel}>EFFICIENCY</Text>
            <Text style={styles.statValue}>94%</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>SERVER NETWORK</Text>
            <Text style={styles.sectionSubtitle}>
              BUILD AND UPGRADE YOUR INFRASTRUCTURE
            </Text>
          </View>

          <Text style={styles.nodeCount}>
            {servers.length} TYPES
          </Text>
        </View>

        {servers.map((server) => {
          const currentLevel = getLevel(server.id);
          const cost = getUpgradeCost(
            server,
            currentLevel
          );
          const active = currentLevel > 0;

          const cpuAvailable =
            stats.cpuAvailable >= server.power;

          const canUpgrade = game.credits >= cost && cpuAvailable;

          return (
            <View style={styles.serverCard} key={server.id}>
              <View
                style={[
                  styles.serverIcon,
                  {
                    borderColor: active
                      ? `${server.color}55`
                      : '#17202D',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.serverIconText,
                    {
                      color: active ? server.color : '#343D49',
                    },
                  ]}
                >
                  {active ? '▣' : '□'}
                </Text>
              </View>

              <View style={styles.serverBody}>
                <View style={styles.serverHeader}>
                  <View>
                    <Text style={styles.serverName}>
                      {server.name}
                    </Text>
                    <Text style={styles.serverType}>
                      {server.type}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.serverLevel,
                      active && { color: server.color },
                    ]}
                  >
                    LVL {getLevel(server.id)}
                  </Text>
                </View>

                <View style={styles.serverStats}>
                  <View>
                    <Text style={styles.smallLabel}>INCOME</Text>
                    <Text style={styles.smallValue}>
                      +${server.income}/sec
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.smallLabel}>POWER</Text>
                    <Text style={styles.smallValue}>
                      {server.power} PWR
                    </Text>
                  </View>
                </View>

                <View style={styles.upgradeRow}>
                  <View style={styles.levelBar}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.levelSegment,
                          index < Math.min(getLevel(server.id), 8) &&
                            active && {
                              backgroundColor: server.color,
                            },
                        ]}
                      />
                    ))}
                  </View>

                  <Pressable
                    onPress={() => upgradeServer(server.id)}
                    disabled={!canUpgrade}
                    style={({ pressed }) => [
                      styles.upgradeButton,
                      !canUpgrade && styles.upgradeDisabled,
                      pressed &&
                        game.credits >= cost &&
                        styles.upgradePressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.upgradeText,
                        !canUpgrade && styles.upgradeTextDisabled,
                      ]}
                    >
                      {active ? 'UPGRADE' : 'BUILD'}
                    </Text>

                    <Text
                      style={[
                        styles.upgradeCost,
                        !canUpgrade &&
                          styles.upgradeTextDisabled,
                      ]}
                    >
                      {!cpuAvailable
                        ? 'CPU FULL'
                        : `$${cost.toLocaleString()}`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityTitle}>
              NETWORK CAPACITY
            </Text>

            <Text style={styles.capacityValue}>
              {totalPower} / 250 PWR
            </Text>
          </View>

          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                {
                  width: `${Math.min((totalPower / 250) * 100, 100)}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.capacityText}>
            Upgrade your core infrastructure to increase maximum
            network capacity.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>◆</Text>

          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>SYSTEM TIP</Text>
            <Text style={styles.tipText}>
              Higher level servers generate more passive income.
              Keep your infrastructure running while you are offline.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // INFRASTRUCTURE v1.0
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
    marginTop: -3,
  },

  headerCenter: {
    alignItems: 'center',
  },

  title: {
    color: '#F2F5F7',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.6,
  },

  subtitle: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 3,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#123B2E',
    backgroundColor: '#08150F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#00F5A0',
    marginRight: 5,
  },

  statusText: {
    color: '#00F5A0',
    fontSize: 7,
    fontWeight: '900',
  },

  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 12,
    padding: 17,
    marginBottom: 10,
  },

  balanceLabel: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  balanceValue: {
    color: '#F2F5F7',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 4,
  },

  cpuBar: {
    height: 4,
    marginTop: 7,
    backgroundColor: '#18202B',
    borderRadius: 2,
    overflow: 'hidden',
  },

  cpuBarFill: {
    height: '100%',
    backgroundColor: '#00B8FF',
    borderRadius: 2,
  },

  cpuAvailable: {
    marginTop: 5,
    fontSize: 8,
    letterSpacing: 0.7,
    color: '#687482',
  },

  incomeBox: {
    alignItems: 'flex-end',
  },

  incomeLabel: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  incomeValue: {
    color: '#00F5A0',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
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
    borderRadius: 9,
    padding: 11,
  },

  statIcon: {
    color: '#00F5A0',
    fontSize: 14,
    marginBottom: 7,
  },

  statLabel: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  statValue: {
    color: '#DCE2E8',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },

  statMuted: {
    color: '#59616F',
    fontSize: 10,
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
    letterSpacing: 1.4,
  },

  sectionSubtitle: {
    color: '#414B58',
    fontSize: 6.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 3,
  },

  nodeCount: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
  },

  serverCard: {
    flexDirection: 'row',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 11,
    padding: 12,
    marginBottom: 9,
  },

  serverIcon: {
    width: 48,
    height: 48,
    borderRadius: 9,
    borderWidth: 1,
    backgroundColor: '#0A1118',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  serverIconText: {
    fontSize: 22,
  },

  serverBody: {
    flex: 1,
  },

  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  serverName: {
    color: '#DCE2E8',
    fontSize: 11,
    fontWeight: '900',
  },

  serverType: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.5,
  },

  serverLevel: {
    color: '#343D49',
    fontSize: 9,
    fontWeight: '900',
  },

  serverStats: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 12,
  },

  smallLabel: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  smallValue: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },

  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  levelBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    marginRight: 9,
  },

  levelSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#18202B',
    borderRadius: 2,
  },

  upgradeButton: {
    minWidth: 75,
    alignItems: 'center',
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  upgradeDisabled: {
    backgroundColor: '#0B1017',
    borderColor: '#17202D',
  },

  upgradePressed: {
    opacity: 0.65,
  },

  upgradeText: {
    color: '#00F5A0',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  upgradeCost: {
    color: '#597D6E',
    fontSize: 6.5,
    fontWeight: '800',
    marginTop: 2,
  },

  upgradeTextDisabled: {
    color: '#343D49',
  },

  capacityCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginTop: 7,
  },

  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  capacityTitle: {
    color: '#71808D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  capacityValue: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
  },

  capacityBar: {
    height: 5,
    backgroundColor: '#151C27',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },

  capacityFill: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  capacityText: {
    color: '#59616F',
    fontSize: 8,
    lineHeight: 14,
    marginTop: 8,
  },

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#081017',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 9,
    padding: 12,
    marginTop: 10,
  },

  tipIcon: {
    color: '#00B8FF',
    fontSize: 14,
    marginRight: 10,
  },

  tipBody: {
    flex: 1,
  },

  tipTitle: {
    color: '#71808D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  tipText: {
    color: '#59616F',
    fontSize: 8,
    lineHeight: 14,
    marginTop: 4,
  },

  footer: {
    color: '#252E3A',
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 25,
  },
});
