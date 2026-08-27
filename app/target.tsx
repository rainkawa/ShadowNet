import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TargetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const name = String(params.name || 'UNKNOWN NODE');
  const reward = String(params.reward || '$840');
  const security = Number(params.security || 18);
  const difficulty = String(params.difficulty || 'LOW');

  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(timer);
          setRunning(false);
          setComplete(true);
          return 100;
        }

        return current + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [running]);

  const startOperation = () => {
    if (complete) return;

    setProgress(0);
    setComplete(false);
    setRunning(true);
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
            <Text style={styles.title}>OPERATION</Text>
            <Text style={styles.subtitle}>REMOTE ACCESS</Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SECURE</Text>
          </View>
        </View>

        <View style={styles.targetCard}>
          <View style={styles.targetIcon}>
            <Text style={styles.targetIconText}>◈</Text>
          </View>

          <Text style={styles.targetName}>{name}</Text>
          <Text style={styles.targetType}>REMOTE NETWORK TARGET</Text>

          <View style={styles.targetId}>
            <Text style={styles.targetIdLabel}>TARGET STATUS</Text>
            <Text
              style={[
                styles.targetIdValue,
                complete && styles.completeText,
              ]}
            >
              {complete ? 'COMPROMISED' : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>SECURITY</Text>
            <Text style={styles.statValue}>{security}%</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>DIFFICULTY</Text>
            <Text style={styles.statValue}>{difficulty}</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>REWARD</Text>
            <Text style={[styles.statValue, styles.rewardText]}>
              {reward}
            </Text>
          </View>
        </View>

        <View style={styles.terminal}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.terminalTitle}>
              operation@shadow:~
            </Text>
          </View>

          <Text style={styles.line}>
            <Text style={styles.blue}>&gt; </Text>
            target: {name}
          </Text>

          <Text style={styles.line}>
            <Text style={styles.blue}>&gt; </Text>
            security level: {security}%
          </Text>

          <Text style={styles.line}>
            <Text style={styles.green}>&gt; </Text>
            encrypted channel ready
          </Text>

          {running && (
            <>
              <Text style={styles.line}>
                <Text style={styles.blue}>&gt; </Text>
                establishing connection...
              </Text>

              <Text style={styles.line}>
                <Text style={styles.green}>&gt; </Text>
                bypassing security layer...
              </Text>
            </>
          )}

          {complete && (
            <>
              <Text style={styles.line}>
                <Text style={styles.green}>&gt; </Text>
                access granted
              </Text>

              <Text style={styles.line}>
                <Text style={styles.green}>&gt; </Text>
                operation completed
              </Text>

              <Text style={styles.rewardLine}>
                + {reward}
              </Text>
            </>
          )}

          {!running && !complete && (
            <Text style={styles.cursor}>_</Text>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              OPERATION PROGRESS
            </Text>

            <Text style={styles.progressValue}>
              {progress}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>

          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              TRACE RISK
            </Text>

            <Text style={styles.warningText}>
              Every operation generates trace activity.
              Upgrade your infrastructure to reduce detection risk.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={startOperation}
          disabled={running || complete}
          style={({ pressed }) => [
            styles.executeButton,
            (running || complete) && styles.disabledButton,
            pressed && !running && !complete && styles.pressedButton,
          ]}
        >
          <Text style={styles.executeIcon}>
            {complete ? '✓' : '⌁'}
          </Text>

          <View>
            <Text style={styles.executeTitle}>
              {complete ? 'ACCESS GRANTED' : running ? 'RUNNING...' : 'START OPERATION'}
            </Text>

            <Text style={styles.executeSubtitle}>
              {complete
                ? 'TARGET COMPROMISED'
                : running
                  ? 'ESTABLISHING ACCESS'
                  : 'BEGIN REMOTE ACCESS'}
            </Text>
          </View>

          {!running && !complete && (
            <Text style={styles.executeArrow}>›</Text>
          )}
        </Pressable>

        {complete && (
          <Pressable
            onPress={() => router.back()}
            style={styles.returnButton}
          >
            <Text style={styles.returnText}>
              RETURN TO NETWORK
            </Text>
          </Pressable>
        )}

        <Text style={styles.footer}>
          SHADOWNET // OPERATION v1.0
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
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 2,
  },

  subtitle: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 2,
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
    letterSpacing: 0.8,
  },

  targetCard: {
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
  },

  targetIcon: {
    width: 62,
    height: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14513E',
    backgroundColor: '#0A2119',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  targetIconText: {
    color: '#00F5A0',
    fontSize: 27,
  },

  targetName: {
    color: '#E7EBEF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  targetType: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 5,
  },

  targetId: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#151C27',
    marginTop: 16,
    paddingTop: 12,
  },

  targetIdLabel: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },

  targetIdValue: {
    color: '#00B8FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  completeText: {
    color: '#00F5A0',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  stat: {
    flex: 1,
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 9,
    padding: 12,
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
    fontWeight: '900',
    marginTop: 5,
  },

  rewardText: {
    color: '#00F5A0',
  },

  terminal: {
    backgroundColor: '#030509',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    minHeight: 195,
    marginBottom: 17,
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

  line: {
    color: '#87919E',
    fontSize: 10,
    lineHeight: 22,
    fontFamily: 'monospace',
  },

  blue: {
    color: '#00B8FF',
  },

  green: {
    color: '#00F5A0',
  },

  cursor: {
    color: '#00F5A0',
    fontSize: 12,
    marginTop: 2,
  },

  rewardLine: {
    color: '#00F5A0',
    fontSize: 17,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 5,
  },

  progressSection: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressLabel: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  progressValue: {
    color: '#00F5A0',
    fontSize: 9,
    fontWeight: '900',
  },

  progressBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#151C27',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  warning: {
    flexDirection: 'row',
    backgroundColor: '#11100A',
    borderWidth: 1,
    borderColor: '#393019',
    borderRadius: 9,
    padding: 12,
    marginBottom: 15,
  },

  warningIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FFB800',
    color: '#FFB800',
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 11,
    fontWeight: '900',
    marginRight: 10,
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    color: '#A98D43',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  warningText: {
    color: '#6D6348',
    fontSize: 8,
    lineHeight: 14,
    marginTop: 4,
  },

  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F5A0',
    borderRadius: 10,
    padding: 16,
  },

  disabledButton: {
    backgroundColor: '#0C3B2D',
  },

  pressedButton: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  executeIcon: {
    color: '#03100A',
    fontSize: 27,
    fontWeight: '900',
    marginRight: 12,
  },

  executeTitle: {
    color: '#03100A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  executeSubtitle: {
    color: '#145B43',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 3,
    letterSpacing: 0.7,
  },

  executeArrow: {
    color: '#03100A',
    fontSize: 29,
    marginLeft: 'auto',
  },

  returnButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#17202D',
    backgroundColor: '#090D15',
    borderRadius: 9,
    padding: 14,
    marginTop: 9,
  },

  returnText: {
    color: '#8B96A3',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
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
