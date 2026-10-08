import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { UserIcon, FilterIcon } from './Icons';

interface HeaderProps {
  onProfilePress?: () => void;
  onFilterPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfilePress, onFilterPress }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
        accessibilityLabel="Профиль пользователя"
      >
        <UserIcon size={21} color="#2A2A2A" />
      </TouchableOpacity>

      <Text style={styles.logoText}>pinder</Text>

      <TouchableOpacity
        style={styles.circleButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
        accessibilityLabel="Фильтры поиска"
      >
        <FilterIcon size={21} color="#2A2A2A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE4',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoText: {
    fontSize: 33,
    fontWeight: '800',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.8,
  },
});
