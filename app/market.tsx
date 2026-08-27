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

type Category = 'ALL' | 'TOOLS' | 'INFRA' | 'EXPLOITS' | 'INTEL';

type Item = {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'ALL'>;
  price: number;
  rarity: string;
  effect: string;
  icon: string;
};

const items: Item[] = [
  {
    id: 'scanner',
    name: 'GHOST SCANNER',
    description: 'Advanced scanner capable of discovering hidden network nodes.',
    category: 'TOOLS',
    price: 1800,
    rarity: 'COMMON',
    effect: '+12% TARGET DISCOVERY',
    icon: '⌁',
  },
  {
    id: 'proxy',
    name: 'ANONYMOUS PROXY',
    description: 'Multi-hop relay that reduces operational trace.',
    category: 'INFRA',
    price: 3200,
    rarity: 'COMMON',
    effect: '-10% TRACE GENERATION',
    icon: '◌',
  },
  {
    id: 'exploit',
    name: 'ZERO-DAY PACKAGE',
    description: 'A premium exploit package designed for high-security targets.',
    category: 'EXPLOITS',
    price: 7800,
    rarity: 'RARE',
    effect: '+20% SUCCESS RATE',
    icon: '⚡',
  },
  {
    id: 'intel',
    name: 'CORPORATE INTEL',
    description: 'Leaked intelligence containing valuable target information.',
    category: 'INTEL',
    price: 4500,
    rarity: 'UNCOMMON',
    effect: '+25% TARGET REWARD',
    icon: '◈',
  },
  {
    id: 'botnet',
    name: 'BOTNET NODE',
    description: 'Remote infrastructure node used for automated operations.',
    category: 'INFRA',
    price: 12500,
    rarity: 'RARE',
    effect: '+18% PASSIVE INCOME',
    icon: '⬡',
  },
  {
    id: 'quantum',
    name: 'QUANTUM DECRYPTOR',
    description: 'Experimental hardware capable of accelerating encrypted workloads.',
    category: 'TOOLS',
    price: 28000,
    rarity: 'EPIC',
    effect: '+35% DECRYPTION SPEED',
    icon: '◆',
  },
];

const categories: Category[] = [
  'ALL',
  'TOOLS',
  'INFRA',
  'EXPLOITS',
  'INTEL',
];

export default function MarketScreen() {
  const router = useRouter();

  const {
    game,
    buyItem: purchaseItem,
  } = useGame();

  const [activeCategory, setActiveCategory] =
    useState<Category>('ALL');
  const [notification, setNotification] = useState('');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') return items;

    return items.filter(
      (item) => item.category === activeCategory
    );
  }, [activeCategory]);

  const buyItem = (item: Item) => {
    if (game.ownedItems.includes(item.id)) {
      setNotification('ITEM ALREADY INSTALLED');
      return;
    }

    const purchased = purchaseItem(
      item.id,
      item.price
    );

    if (!purchased) {
      setNotification('INSUFFICIENT CREDITS');
      return;
    }

    setNotification(`${item.name} INSTALLED`);
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
            <Text style={styles.title}>MARKET</Text>
            <Text style={styles.subtitle}>
              UNDERGROUND DIGITAL EXCHANGE
            </Text>
          </View>

          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.wallet}>
          <View>
            <Text style={styles.walletLabel}>
              AVAILABLE CREDITS
            </Text>

            <Text style={styles.walletValue}>
              ${game.credits.toLocaleString()}
            </Text>
          </View>

          <View style={styles.walletRight}>
            <Text style={styles.walletSmall}>
              INVENTORY
            </Text>

            <Text style={styles.inventoryValue}>
              {game.ownedItems.length} ITEMS
            </Text>
          </View>
        </View>

        <View style={styles.blackMarket}>
          <View style={styles.blackIcon}>
            <Text style={styles.blackIconText}>◆</Text>
          </View>

          <View style={styles.blackBody}>
            <View style={styles.blackTitleRow}>
              <Text style={styles.blackTitle}>
                BLACK MARKET
              </Text>

              <View style={styles.hotBadge}>
                <Text style={styles.hotText}>HOT</Text>
              </View>
            </View>

            <Text style={styles.blackText}>
              Restricted tools, exploits and intelligence.
              Stock changes periodically.
            </Text>
          </View>
        </View>

        {notification !== '' && (
          <View style={styles.notification}>
            <Text style={styles.notificationDot}>●</Text>
            <Text style={styles.notificationText}>
              {notification}
            </Text>

            <Pressable
              onPress={() => setNotification('')}
            >
              <Text style={styles.notificationClose}>
                ×
              </Text>
            </Pressable>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => {
            const selected =
              activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryButton,
                  selected &&
                    styles.categoryButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              AVAILABLE STOCK
            </Text>

            <Text style={styles.sectionSubtitle}>
              VERIFIED UNDERGROUND SUPPLIERS
            </Text>
          </View>

          <Text style={styles.stockCount}>
            {filteredItems.length} ITEMS
          </Text>
        </View>

        {filteredItems.map((item) => {
          const isOwned = game.ownedItems.includes(item.id);
          const canBuy = game.credits >= item.price;

          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                isOwned && styles.itemOwned,
              ]}
            >
              <View style={styles.itemTop}>
                <View style={styles.itemIcon}>
                  <Text style={styles.itemIconText}>
                    {item.icon}
                  </Text>
                </View>

                <View style={styles.itemIdentity}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>
                      {item.name}
                    </Text>

                    <Text
                      style={[
                        styles.rarity,
                        item.rarity === 'RARE' &&
                          styles.rare,
                        item.rarity === 'EPIC' &&
                          styles.epic,
                      ]}
                    >
                      {item.rarity}
                    </Text>
                  </View>

                  <Text style={styles.itemCategory}>
                    {item.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemDescription}>
                {item.description}
              </Text>

              <View style={styles.effectBox}>
                <Text style={styles.effectLabel}>
                  SYSTEM EFFECT
                </Text>

                <Text style={styles.effectValue}>
                  {item.effect}
                </Text>
              </View>

              <View style={styles.itemBottom}>
                <View>
                  <Text style={styles.priceLabel}>
                    MARKET PRICE
                  </Text>

                  <Text style={styles.price}>
                    ${item.price.toLocaleString()}
                  </Text>
                </View>

                <Pressable
                  disabled={isOwned}
                  onPress={() => buyItem(item)}
                  style={({ pressed }) => [
                    styles.buyButton,
                    isOwned &&
                      styles.ownedButton,
                    !isOwned &&
                      !canBuy &&
                      styles.disabledButton,
                    pressed &&
                      !isOwned &&
                      canBuy &&
                      styles.buyPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.buyText,
                      isOwned &&
                        styles.ownedText,
                      !isOwned &&
                        !canBuy &&
                        styles.disabledText,
                    ]}
                  >
                    {isOwned
                      ? 'INSTALLED'
                      : canBuy
                        ? 'PURCHASE'
                        : 'INSUFFICIENT'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.vendorCard}>
          <View style={styles.vendorHeader}>
            <View>
              <Text style={styles.vendorTitle}>
                SUPPLIER NETWORK
              </Text>

              <Text style={styles.vendorSubtitle}>
                REPUTATION REQUIRED
              </Text>
            </View>

            <Text style={styles.vendorLevel}>
              TIER 01
            </Text>
          </View>

          <View style={styles.vendorLine}>
            <View style={styles.vendorFill} />
          </View>

          <Text style={styles.vendorText}>
            Increase your reputation to unlock encrypted
            suppliers, legendary equipment and exclusive
            contracts.
          </Text>

          <View style={styles.unlockRow}>
            <View>
              <Text style={styles.unlockLabel}>
                NEXT UNLOCK
              </Text>

              <Text style={styles.unlockValue}>
                DARKNET AUCTION
              </Text>
            </View>

            <Text style={styles.unlockRep}>
              250 REP
            </Text>
          </View>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>

          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>
              MARKET WARNING
            </Text>

            <Text style={styles.warningText}>
              Prices and inventory are controlled by the
              underground network. Rare items may disappear
              without notice.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          SHADOWNET // BLACK MARKET v1.0
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
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08150F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 6,
    paddingHorizontal: 7,
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
    fontSize: 6.5,
    fontWeight: '900',
  },

  wallet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  walletLabel: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  walletValue: {
    color: '#00F5A0',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  walletRight: {
    alignItems: 'flex-end',
  },

  walletSmall: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
  },

  inventoryValue: {
    color: '#AEB7C2',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
  },

  blackMarket: {
    flexDirection: 'row',
    backgroundColor: '#100A0D',
    borderWidth: 1,
    borderColor: '#3B1823',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  blackIcon: {
    width: 37,
    height: 37,
    borderRadius: 8,
    backgroundColor: '#1A0C11',
    borderWidth: 1,
    borderColor: '#5B2131',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  blackIconText: {
    color: '#FF426D',
    fontSize: 15,
  },

  blackBody: {
    flex: 1,
  },

  blackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  blackTitle: {
    color: '#D58A9C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  hotBadge: {
    backgroundColor: '#30121B',
    borderWidth: 1,
    borderColor: '#5B2131',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 7,
  },

  hotText: {
    color: '#FF426D',
    fontSize: 5.5,
    fontWeight: '900',
  },

  blackText: {
    color: '#72535D',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 4,
  },

  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08150F',
    borderWidth: 1,
    borderColor: '#14513E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },

  notificationDot: {
    color: '#00F5A0',
    fontSize: 8,
    marginRight: 7,
  },

  notificationText: {
    color: '#7EAA98',
    fontSize: 7,
    fontWeight: '800',
    flex: 1,
  },

  notificationClose: {
    color: '#59616F',
    fontSize: 18,
  },

  categories: {
    gap: 7,
    paddingBottom: 17,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#17202D',
    backgroundColor: '#090D15',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  categoryButtonSelected: {
    borderColor: '#14513E',
    backgroundColor: '#0A2119',
  },

  categoryText: {
    color: '#59616F',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  categoryTextSelected: {
    color: '#00F5A0',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    color: '#AEB7C2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionSubtitle: {
    color: '#414B58',
    fontSize: 6,
    fontWeight: '700',
    marginTop: 3,
  },

  stockCount: {
    color: '#59616F',
    fontSize: 7,
    fontWeight: '900',
  },

  itemCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 9,
  },

  itemOwned: {
    borderColor: '#14513E',
    backgroundColor: '#08150F',
  },

  itemTop: {
    flexDirection: 'row',
  },

  itemIcon: {
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

  itemIconText: {
    color: '#00B8FF',
    fontSize: 18,
  },

  itemIdentity: {
    flex: 1,
  },

  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemName: {
    color: '#DCE2E8',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
    flex: 1,
  },

  rarity: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '900',
    marginLeft: 5,
  },

  rare: {
    color: '#00B8FF',
  },

  epic: {
    color: '#C36BFF',
  },

  itemCategory: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
    marginTop: 4,
  },

  itemDescription: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 11,
  },

  effectBox: {
    backgroundColor: '#071017',
    borderWidth: 1,
    borderColor: '#12222D',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },

  effectLabel: {
    color: '#414B58',
    fontSize: 5.5,
    fontWeight: '900',
  },

  effectValue: {
    color: '#00B8FF',
    fontSize: 7.5,
    fontWeight: '900',
    marginTop: 3,
  },

  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 11,
  },

  priceLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
  },

  price: {
    color: '#00F5A0',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  buyButton: {
    backgroundColor: '#00F5A0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  ownedButton: {
    backgroundColor: '#0A2119',
    borderWidth: 1,
    borderColor: '#14513E',
  },

  disabledButton: {
    backgroundColor: '#111720',
  },

  buyPressed: {
    opacity: 0.65,
  },

  buyText: {
    color: '#03100A',
    fontSize: 6.5,
    fontWeight: '900',
  },

  ownedText: {
    color: '#00F5A0',
  },

  disabledText: {
    color: '#59616F',
  },

  vendorCard: {
    backgroundColor: '#090D15',
    borderWidth: 1,
    borderColor: '#17202D',
    borderRadius: 10,
    padding: 13,
    marginTop: 6,
  },

  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  vendorTitle: {
    color: '#AEB7C2',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  vendorSubtitle: {
    color: '#59616F',
    fontSize: 6,
    fontWeight: '800',
    marginTop: 3,
  },

  vendorLevel: {
    color: '#00B8FF',
    fontSize: 7,
    fontWeight: '900',
  },

  vendorLine: {
    height: 4,
    backgroundColor: '#18202B',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 11,
  },

  vendorFill: {
    width: '42%',
    height: '100%',
    backgroundColor: '#00B8FF',
  },

  vendorText: {
    color: '#59616F',
    fontSize: 7.5,
    lineHeight: 13,
    marginTop: 8,
  },

  unlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#151C27',
    marginTop: 10,
    paddingTop: 10,
  },

  unlockLabel: {
    color: '#59616F',
    fontSize: 5.5,
    fontWeight: '800',
  },

  unlockValue: {
    color: '#AEB7C2',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 3,
  },

  unlockRep: {
    color: '#FFB800',
    fontSize: 7,
    fontWeight: '900',
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
    marginTop: 25,
  },
});
