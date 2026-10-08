import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { HeartFilledIcon, SparklesIcon } from '../components/Icons';

const SLIDES = [
  {
    id: 1,
    title: 'Искренние знакомства',
    description: 'Находите людей с похожими вкусами, ценностями и любимыми местами в городе.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
    tag: 'кофе & прогулки',
  },
  {
    id: 2,
    title: 'Свайпайте в удовольствие',
    description: 'Интуитивные жесты: свайп вправо для симпатии, вверх для суперлайка, влево для пропуска.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=900&auto=format&fit=crop',
    tag: 'выставки & искусство',
  },
  {
    id: 3,
    title: 'Безопасное общение',
    description: 'Диалог начинается только при взаимной симпатии — без навязчивости и спама.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop',
    tag: 'музыка & винил',
  },
];

export const WelcomeScreen: React.FC = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cardHeight = Math.min(windowWidth * 0.95, windowHeight ? windowHeight * 0.48 : 420, 420);

  const { navigate, guestLogin } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeSlide = SLIDES[currentSlideIndex];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.logo}>pinder</Text>
          <View style={styles.badge}>
            <SparklesIcon size={14} color="#FF5757" />
            <Text style={styles.badgeText}>Эстетика встреч</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cardContainer, { height: cardHeight }]}
          activeOpacity={0.9}
          onPress={handleNextSlide}
        >
          <Image
            source={{ uri: activeSlide.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.85)']}
            style={styles.gradient}
          />
          <View style={styles.cardOverlay}>
            <View style={styles.floatingTag}>
              <HeartFilledIcon size={14} color="#FF5757" />
              <Text style={styles.floatingTagText}>{activeSlide.tag}</Text>
            </View>
            <Text style={styles.slideTitle}>{activeSlide.title}</Text>
            <Text style={styles.slideDesc}>{activeSlide.description}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.paginationRow}>
          {SLIDES.map((slide, idx) => (
            <TouchableOpacity
              key={slide.id}
              style={[
                styles.dot,
                idx === currentSlideIndex ? styles.activeDot : styles.inactiveDot,
              ]}
              onPress={() => setCurrentSlideIndex(idx)}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Создать аккаунт"
            variant="primary"
            size="lg"
            onPress={() => navigate('register')}
          />

          <Button
            title="У меня уже есть аккаунт: Войти"
            variant="secondary"
            size="lg"
            onPress={() => navigate('login')}
          />

          <TouchableOpacity
            style={styles.guestButton}
            onPress={guestLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.guestText}>Войти как гость (Демо-режим)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EFEA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  logo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5757',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
  },
  floatingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
  },
  floatingTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  slideTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  slideDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FF5757',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#DCD4CC',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  guestButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    color: '#737373',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
