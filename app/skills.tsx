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

type Skill = {
  id: string;
  name: string;
  description: string;
  branch: string;
  icon: string;
  cost: number;
  bonus: string;
  requiredLevel: number;
};

const skillData: Skill[] = [
  {
    id: 'network_scan',
    name: 'NETWORK SCANNING',
    description: 'Improves target discovery and increases available network targets.',
    branch: 'NETWORKING',
    icon: '◈',
    cost: 1,
    bonus: '+10% TARGET DISCOVERY',
    requiredLevel: 1,
  },
  {
    id: 'packet_analysis',
    name: 'PACKET ANALYSIS',
    description: 'Analyze network traffic more efficiently.',
    branch: 'NETWORKING',
    icon: '◇',
    cost: 2,
    bonus: '+15% OPERATION SPEED',
    requiredLevel: 3,
  },
  {
    id: 'deep_scan',
    name: 'DEEP SCAN',
    description: 'Reveal hidden high-value targets.',
    branch: 'NETWORKING',
    icon: '◎',
    cost: 3,
    bonus: '+25% RARE TARGET CHANCE',
    requiredLevel: 6,
  },

  {
    id: 'exploit_basics',
    name: 'EXPLOIT BASICS',
    description: 'Increase success rate against low-security systems.',
    branch: 'EXPLOITATION',
    icon: '⌁',
    cost: 1,
    bonus: '+8% SUCCESS RATE',
    requiredLevel: 1,
  },
  {
    id: 'zero_day',
    name: 'ZERO DAY',
    description: 'Unlock advanced attack vectors for difficult targets.',
    branch: 'EXPLOITATION',
    icon: '⚡',
    cost: 2,
    bonus: '+18% HIGH SECURITY DAMAGE',
    requiredLevel: 4,
  },
  {
    id: 'root_access',
    name: 'ROOT ACCESS',
    description: 'Gain access to heavily protected infrastructure.',
    branch: 'EXPLOITATION',
    icon: '◆',
    cost: 4,
    bonus: '+35% ELITE OPERATION REWARD',
    requiredLevel: 8,
  },

  {
    id: 'proxy_chain',
    name: 'PROXY CHAIN',
    description: 'Route operations through multiple anonymous relays.',
    branch: 'STEALTH',
    icon: '◇',
    cost: 1,
    bonus: '-8% TRACE GENERATION',
    requiredLevel: 2,
  },
  {
    id: 'ghost_identity',
    name: 'GHOST IDENTITY',
    description: 'Reduce your digital footprint during operations.',
    branch: 'STEALTH',
    icon: '◌',
    cost: 2,
    bonus: '-18% TRACE GENERATION',
    requiredLevel: 5,
  },
  {
    id: 'vanish',
    name: 'VANISH',
    description: 'Advanced counter-trace technology.',
    branch: 'STEALTH',
    icon: '◉',
    cost: 4,
    bonus: '-35% TRACE GENERATION',
    requiredLevel: 9,
  },

  {
    id: 'scripts',
    name: 'AUTOMATION SCRIPTS',
    description: 'Automate repetitive network tasks.',
    branch: 'AUTOMATION',
    icon: '▣',
    cost: 1,
    bonus: '+5% PASSIVE INCOME',
    requiredLevel: 2,
  },
  {
    id: 'botnet',
    name: 'BOTNET CONTROL',
    description: 'Coordinate remote nodes for additional income.',
    branch: 'AUTOMATION',
    icon: '⬡',
    cost: 2,
    bonus: '+15% PASSIVE INCOME',
    requiredLevel: 5,
  },
  {
    id: 'autonomous',
    name: 'AUTONOMOUS CORE',
    description: 'Run complex operations with minimal intervention.',
    branch: 'AUTOMATION',
    icon: '◆',
    cost: 4,
    bonus: '+30% PASSIVE INCOME',
    requiredLevel: 10,
  },
];

const branches = [
  {
    name: 'NETWORKING',
    description: 'DISCOVERY & NETWORK CONTROL',
    icon: '◈',
  },
  {
    name: 'EXPLOITATION',
    description: 'ATTACK & ACCESS',
    icon: '⌁',
  },
  {
    name: 'STEALTH',
    description: 'ANONYMITY & TRACE',
    icon: '◌',
  },
  {
    name: 'AUTOMATION',
    description: 'PASSIVE PRODUCTION',
    icon: '▣',
  },
];

export default function SkillsScreen() {
  const router = useRouter();

  const {
    game,
    unlockSkill,
  } = useGame();

  const level = game.level;
  const skillPoints = game.skillPoints;
  const unlocked = game.unlockedSkills;

  const totalUnlocked = unlocked.length;

  const branchProgress = useMemo(() => {
    return branches.map((branch) => {
      const branchSkills = skillData.filter(
        (skill) => skill.branch === branch.name
      );

      const amount = branchSkills.filter((skill) =>
        unlocked.includes(skill.id)
      ).length;

      return {
        ...branch,
        amount,
        total: branchSkills.length,
      };
    });
  }, [unlocked]);

  const purchaseSkill = (skill: Skill) => {
    if (unlocked.includes(skill.id)) return;
    if (skillPoints < skill.cost) return;
    if (level < skill.requiredLevel) return;

    unlockSkill(skill.id, skill.cost);
  };

  const getStatus = (skill: Skill) => {
    if (unlocked.includes(skill.id)) return 'UNLOCKED';
    if (level < skill.requiredLevel) return `LVL ${skill.requiredLevel}`;
    if (skillPoints < skill.cost) return `${skill.cost} SP`;
    return 'AVAILABLE';
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
            <Text style={styles.title}>SKILL TREE</Text>
            <Text style={styles.subtitle}>DIGITAL EVOLUTION</Text>
          </View>

          <View style={styles.pointsBadge}>
            <Text style={styles.pointsValue}>{skillPoints}</Text>
            <Text style={styles.pointsLabel}>SP</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.coreIcon}>
            <Text style={styles.coreIconText}>◆</Text>
          </View>

          <View style={styles.profileBody}>
            <Text style={styles.profileTitle}>
              SHADOW OPERATIVE
            </Text>

            <Text style={styles.profileSubtitle}>
              LEVEL {level} // DIGITAL INTRUDER
            </Text>

            <View style={styles.levelBar}>
              <View style={styles.levelFill} />
            </View>

            <Text style={styles.levelText}>
              NEXT LEVEL // 420 XP REQUIRED
            </Text>
          </View>

          <View style={styles.skillCount}>
            <Text style={styles.skillCountValue}>
              {totalUnlocked}
            </Text>
            <Text style={styles.skillCountLabel}>
              UNLOCKED
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>◆</Text>
          </View>

          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>
              SKILL POINTS
            </Text>

            <Text style={styles.infoText}>
              Earn Skill Points by leveling up and completing
              advanced operations. Choose your specialization carefully.
            </Text>
          </View>
        </View>

        {branchProgress.map((branch) => {
          const branchSkills = skillData.filter(
            (skill) => skill.branch === branch.name
          );

          return (
            <View key={branch.name} style={styles.branch}>
              <View style={styles.branchHeader}>
                <View style={styles.branchIdentity}>
                  <View style={styles.branchIcon}>
                    <Text style={styles.branchIconText}>
                      {branch.icon}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.branchTitle}>
                      {branch.name}
                    </Text>

                    <Text style={styles.branchDescription}>
                      {branch.description}
                    </Text>
                  </View>
                </View>

                <Text style={styles.branchProgress}>
                  {branch.amount}/{branch.total}
                </Text>
              </View>

              <View style={styles.branchLine}>
                <View
                  style={[
                    styles.branchLineFill,
                    {
                      width: `${
                        (branch.amount / branch.total) * 100
                      }%`,
                    },
                  ]}
                />
              </View>

              {branchSkills.map((skill, index) => {
                const active = unlocked.includes(skill.id);
                const levelLocked =
                  level < skill.requiredLevel;
                const affordable =
                  skillPoints >= skill.cost;

                const available =
                  !active &&
                  !levelLocked &&
                  affordable;

                return (
                  <View
                    key={skill.id}
                    style={[
                      styles.skillCard,
                      active && styles.skillActive,
                      levelLocked && styles.skillLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.skillIcon,
                        active && styles.skillIconActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.skillIconText,
                          active && styles.skillIconActiveText,
                        ]}
                      >
                        {levelLocked ? '?' : skill.icon}
                      </Text>
                    </View>

                    <View style={styles.skillBody}>
                      <View style={styles.skillTitleRow}>
                        <Text
                          style={[
                            styles.skillName,
                            levelLocked &&
                              styles.lockedText,
                          ]}
                        >
                          {skill.name}
                        </Text>

                        <Text
                          style={[
                            styles.skillStatus,
                            active &&
                              styles.skillStatusActive,
                            available &&
                              styles.skillStatusAvailable,
                          ]}
                        >
                          {getStatus(skill)}
                        </Text>
                      </View>

                      <Text style={styles.skillDescription}>
                        {skill.description}
                      </Text>

                      <View style={styles.skillFooter}>
                        <Text
                          style={[
                            styles.skillBonus,
                            levelLocked &&
                              styles.lockedText,
                          ]}
                        >
                          {skill.bonus}
                        </Text>

                        <Pressable
                          disabled={!available}
                          onPress={() =>
                            purchaseSkill(skill)
                          }
                          style={({ pressed }) => [
                            styles.skillButton,
                            active &&
                              styles.skillButtonActive,
                            !available &&
                              styles.skillButtonDisabled,
                            pressed &&
                              available &&
                              styles.skillButtonPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.skillButtonText,
                              active &&
                                styles.skillButtonActiveText,
                              !available &&
                                styles.skillButtonDisabledText,
                            ]}
                          >
                            {active
                              ? 'OWNED'
                              : levelLocked
                                ? `LVL ${skill.requiredLevel}`
                                : `${skill.cost} SP`}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {index <
                      branchSkills.length - 1 && (
                      <View style={styles.connector} />
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={styles.specializationCard}>
          <Text style={styles.specializationTitle}>
            SPECIALIZATION
          </Text>

          <Text style={styles.specializationText}>
            Your current build favors balanced progression.
            Future advanced skills will unlock based on your
            specialization.
          </Text>

          <View style={styles.specializationStats}>
            <View>
              <Text style={styles.specLabel}>DISCOVERY</Text>
              <Text style={styles.specValue}>+10%</Text>
            </View>

            <View>
              <Text style={styles.specLabel}>SUCCESS</Text>
              <Text style={styles.specValue}>+8%</Text>
            </View>

            <View>
              <Text style={styles.specLabel}>STEALTH</Text>
              <Text style={styles.specValue}>-8%</Text>
            </View>

            <View>
              <Text style={styles.specLabel}>INCOME</Text>
              <Text style={styles.specValue}>+5%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // SKILL SYSTEM v1.0
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

  pointsBadge: {
    minWidth: 45,
    alignItems: 'center',
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },

  pointsValue: {
    color: '#00F5A0',
    fontSize: 14,
    fontWeight: '900',
  },

  pointsLabel: {
    color: '#52796A',
    fontSize: 6,
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

  coreIcon: {
    width: 47,
    height: 47,
    borderRadius: 9,
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  coreIconText: {
    color: '#00F5A0',
    fontSize: 19,
  },

  profileBody: {
    flex: 1,
  },

  profileTitle: {
    color: '#DCE2E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  profileSubtitle: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
    marginTop: 3,
  },

  levelBar: {
    height: 4,
    backgroundColor: '#18202B',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },

  levelFill: {
    width: '72%',
    height: '100%',
    backgroundColor: '#00B8FF',
  },

  levelText: {
    color: '#59616F',
    fontSize: 6,
    marginTop: 3,
  },

  skillCount: {
    alignItems: 'flex-end',
    marginLeft: 9,
  },

  skillCountValue: {
    color: '#00B8FF',
    fontSize: 16,
    fontWeight: '900',
  },

  skillCountLabel: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#081017',
    borderWidth: 1,
    borderColor: '#12303A',
    borderRadius: 9,
    padding: 12,
    marginBottom: 22,
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 7,
    backgroundColor: '#0A1720',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoIconText: {
    color: '#00B8FF',
    fontSize: 13,
  },

  infoBody: {
    flex: 1,
  },

  infoTitle: {
    color: '#8A9AA8',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  infoText: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 4,
  },

  branch: {
    marginBottom: 21,
  },

  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  branchIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  branchIcon: {
    width: 34,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#0A1118',
    borderWidth: 1,
    borderColor: '#17202D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  branchIconText: {
    color: '#00F5A0',
    fontSize: 15,
  },

  branchTitle: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  branchDescription: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '700',
    marginTop: 3,
  },

  branchProgress: {
    color: '#59616F',
    fontSize: 8,
    fontWeight: '900',
  },

  branchLine: {
    height: 3,
    backgroundColor: '#151C27',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 9,
  },

  branchLineFill: {
    height: '100%',
    backgroundColor: '#00F5A0',
  },

  skillCard: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 11,
    marginBottom: 7,
  },

  skillActive: {
    borderColor: '#14513E',
    backgroundColor: '#08150F',
  },

  skillLocked: {
    opacity: 0.48,
  },

  skillIcon: {
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

  skillIconActive: {
    backgroundColor: '#0A2119',
    borderColor: '#14513E',
  },

  skillIconText: {
    color: '#59616F',
    fontSize: 17,
  },

  skillIconActiveText: {
    color: '#00F5A0',
  },

  skillBody: {
    flex: 1,
  },

  skillTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  skillName: {
    color: '#DCE2E8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
    flex: 1,
  },

  skillStatus: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '900',
    marginLeft: 6,
  },

  skillStatusActive: {
    color: '#00F5A0',
  },

  skillStatusAvailable: {
    color: '#00B8FF',
  },

  skillDescription: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 5,
  },

  skillFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  skillBonus: {
    color: '#00B8FF',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  skillButton: {
    minWidth: 57,
    alignItems: 'center',
    backgroundColor: '#0A1720',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 7,
  },

  skillButtonActive: {
    backgroundColor: '#0A2119',
  },

  skillButtonDisabled: {
    backgroundColor: '#0B1017',
    borderColor: '#17202D',
  },

  skillButtonPressed: {
    opacity: 0.65,
  },

  skillButtonText: {
    color: '#00B8FF',
    fontSize: 6.5,
    fontWeight: '900',
  },

  skillButtonActiveText: {
    color: '#00F5A0',
  },

  skillButtonDisabledText: {
    color: '#59616F',
  },

  lockedText: {
    color: '#3F4854',
  },

  connector: {
    position: 'absolute',
    left: 30,
    bottom: -8,
    width: 1,
    height: 8,
    backgroundColor: '#17202D',
  },

  specializationCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginTop: 2,
  },

  specializationTitle: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  specializationText: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 14,
    marginTop: 6,
  },

  specializationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#151C27',
    marginTop: 12,
    paddingTop: 11,
  },

  specLabel: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
  },

  specValue: {
    color: '#00F5A0',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 3,
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
