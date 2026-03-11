import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ThemeColors } from './useColors';

type SearchBarProps = {
  colors: ThemeColors;
  placeholder?: string;
};

export function SearchBar({ colors, placeholder = 'Search for Stats' }: SearchBarProps) {
  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card }]}>
      <MaterialIcons name="search" size={20} color={colors.subText} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        editable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
