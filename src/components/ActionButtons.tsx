import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { CrossIcon, StarIcon, HeartFilledIcon } from './Icons';

interface ActionButtonsProps {
  onDislike: () => void;
  onSuperlike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDislike,
  onSuperlike,
  onLike,
  disabled = false,
}) => {
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const superlikeScale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  const animatePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.82,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
        <TouchableOpacity
          style={[styles.baseButton, styles.secondaryButton]}
          onPress={() => animatePress(dislikeScale, onDislike)}
          disabled={disabled}
          activeOpacity={0.75}
          accessibilityLabel="Пропустить"
        >
          <CrossIcon size={20} color="#757575" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: superlikeScale }] }}>
        <TouchableOpacity
          style={[styles.baseButton, styles.secondaryButton]}
          onPress={() => animatePress(superlikeScale, onSuperlike)}
          disabled={disabled}
          activeOpacity={0.75}
          accessibilityLabel="Суперлайк"
        >
          <StarIcon size={23} color="#F5A623" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: likeScale }] }}>
        <TouchableOpacity
          style={[styles.baseButton, styles.primaryButton]}
          onPress={() => animatePress(likeScale, onLike)}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityLabel="Нравится"
        >
          <HeartFilledIcon size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  baseButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF5757',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5757',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.38,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
