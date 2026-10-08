import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Profile } from '../types/profile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardProps {
  profile: Profile;
  likeOpacity?: Animated.AnimatedInterpolation<number>;
  nopeOpacity?: Animated.AnimatedInterpolation<number>;
}

export const Card: React.FC<CardProps> = ({ profile, likeOpacity, nopeOpacity }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInner}>
        <Image
          source={{ uri: profile.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.85)']}
          locations={[0, 0.5, 1]}
          style={styles.gradientOverlay}
        />

        {likeOpacity && (
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>НОРМ</Text>
          </Animated.View>
        )}

        {nopeOpacity && (
          <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>СТРЁМ</Text>
          </Animated.View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{profile.name}</Text>
            <Text style={styles.ageText}>{profile.age}</Text>
          </View>

          <Text style={styles.bioText} numberOfLines={2}>
            {profile.bio}
          </Text>

          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{profile.tag}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 0.72,
    alignSelf: 'center',
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#EAE5DF',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ageText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bioText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(75, 70, 70, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  stamp: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  likeStamp: {
    left: 28,
    borderColor: '#4CD964',
    transform: [{ rotate: '-16deg' }],
  },
  likeStampText: {
    color: '#4CD964',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  nopeStamp: {
    right: 28,
    borderColor: '#FF3B30',
    transform: [{ rotate: '16deg' }],
  },
  nopeStampText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
