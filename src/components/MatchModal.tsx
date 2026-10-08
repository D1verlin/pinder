import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Profile, User } from '../types/profile';
import { Button } from './ui/Button';
import { HeartFilledIcon, SparklesIcon } from './Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User | null;
  matchedProfile: Profile | null;
  onSendMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  onClose,
  currentUser,
  matchedProfile,
  onSendMessage,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7);
      fadeAnim.setValue(0);
      heartScale.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(heartScale, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, heartScale]);

  if (!matchedProfile) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(28, 28, 30, 0.95)', 'rgba(18, 18, 20, 0.98)']}
          style={styles.gradientBg}
        />

        <Animated.View
          style={[
            styles.contentContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.badgeRow}>
            <SparklesIcon size={24} color="#F5A623" />
            <Text style={styles.matchSubtitle}>ВЗАИМНАЯ СИМПАТИЯ</Text>
            <SparklesIcon size={24} color="#F5A623" />
          </View>

          <Text style={styles.matchTitle}>Это взаимно!</Text>
          <Text style={styles.matchDesc}>
            Вы и {matchedProfile.name} понравились друг другу
          </Text>

          <View style={styles.photosRow}>
            <View style={[styles.photoCard, styles.photoCardLeft]}>
              <Image
                source={{
                  uri:
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
                }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>

            <Animated.View
              style={[
                styles.heartCircle,
                { transform: [{ scale: heartScale }] },
              ]}
            >
              <HeartFilledIcon size={26} color="#FFFFFF" />
            </Animated.View>

            <View style={[styles.photoCard, styles.photoCardRight]}>
              <Image
                source={{ uri: matchedProfile.imageUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              title="Написать первое сообщение"
              variant="primary"
              size="lg"
              onPress={onSendMessage}
              style={styles.sendButton}
            />

            <Button
              title="Продолжить смотреть анкеты"
              variant="ghost"
              size="md"
              onPress={onClose}
              textStyle={styles.cancelText}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gradientBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  matchSubtitle: {
    color: '#F5A623',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  matchTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchDesc: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 36,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 44,
    height: 180,
  },
  photoCard: {
    width: SCREEN_WIDTH * 0.36,
    height: SCREEN_WIDTH * 0.46,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  photoCardLeft: {
    transform: [{ rotate: '-8deg' }],
    marginRight: -16,
    zIndex: 1,
  },
  photoCardRight: {
    transform: [{ rotate: '8deg' }],
    marginLeft: -16,
    zIndex: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  heartCircle: {
    position: 'absolute',
    zIndex: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5757',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FF5757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  sendButton: {
    shadowColor: '#FF5757',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
