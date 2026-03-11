import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';

const TEST_CATEGORIES = [
  { id: '1', title: 'Recent Tests', icon: '🕒', count: '12 Available', color: '#6366f1' },
  { id: '2', title: 'Upcoming', icon: '📅', count: '3 Scheduled', color: '#10b981' },
  { id: '3', title: 'Mock Tests', icon: '📝', count: '50+ Sets', color: '#f59e0b' },
  { id: '4', title: 'Sample Papers', icon: '📄', count: '24 Papers', color: '#3b82f6' },
  { id: '5', title: 'Interview Prep', icon: '💼', count: '15 Modules', color: '#8b5cf6' },
  { id: '6', title: 'Performance', icon: '📊', count: 'View Stats', color: '#ec4899' },
];

const TestScreen = () => {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const renderItem = ({ item }: { item: typeof TEST_CATEGORIES[number] }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.subText }]}>{item.count}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>Practice Arena</Text>
        <Text style={[styles.subGreeting, { color: colors.subText }]}>
          Select a category to begin your prep
        </Text>
      </View>

      <FlatList
        data={TEST_CATEGORIES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Android Shadow
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TestScreen;