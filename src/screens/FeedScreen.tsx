import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
  useWindowDimensions,
  Platform,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { ActionButtons } from '../components/ActionButtons';
import { BottomNavBar } from '../components/BottomNavBar';
import { LikesScreen } from './LikesScreen';
import { ChatsScreen } from './ChatsScreen';
import { MatchModal } from '../components/MatchModal';
import { FilterModal } from '../components/FilterModal';
import { ScreenTransition } from '../components/ScreenTransition';
import { useApp } from '../context/AppContext';

export const FeedScreen: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const effectiveWidth = Math.min(windowWidth - 32, 420);
  const swipeThreshold = 0.28 * effectiveWidth;

  const {
    activeTab,
    setActiveTab,
    navigate,
    feedProfiles,
    currentCardIndex,
    handleSwipe,
    resetFeed,
    currentUser,
    matchedProfile,
    dismissMatchModal,
    openChat,
    chats,
    likesList,
    totalUnreadCount,
    settings,
    updateSettings,
  } = useApp();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    feedProfiles.forEach((profile) => {
      if (profile.imageUrl) {
        Image.prefetch(profile.imageUrl);
      }
    });
  }, [feedProfiles]);

  const rotate = position.x.interpolate({
    inputRange: [-effectiveWidth * 1.5, 0, effectiveWidth * 1.5],
    outputRange: ['-16deg', '0deg', '16deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [{ rotate }, ...position.getTranslateTransform()],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [15, effectiveWidth / 3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-effectiveWidth / 3, -15],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-effectiveWidth / 2, 0, effectiveWidth / 2],
    outputRange: [1, 0.96, 1],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-effectiveWidth / 2, 0, effectiveWidth / 2],
    outputRange: [1, 0.75, 1],
    extrapolate: 'clamp',
  });

  const currentProfile = feedProfiles[currentCardIndex];

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [currentCardIndex]);

  const forceSwipe = (direction: 'right' | 'left' | 'up') => {
    if (!currentProfile) return;

    const toX =
      direction === 'right'
        ? effectiveWidth * 1.5
        : direction === 'left'
        ? -effectiveWidth * 1.5
        : 0;
    const toY = direction === 'up' ? -effectiveWidth * 1.6 : 0;

    Animated.timing(position, {
      toValue: { x: toX, y: toY },
      duration: 200,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  // Keyboard hotkeys for desktop web (ArrowLeft = nope, ArrowRight = like, ArrowUp = superlike)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && activeTab === 'feed') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (filterModalVisible || Boolean(matchedProfile)) return;
        if (e.key === 'ArrowLeft') {
          forceSwipe('left');
        } else if (e.key === 'ArrowRight') {
          forceSwipe('right');
        } else if (e.key === 'ArrowUp') {
          forceSwipe('up');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeTab, currentProfile, filterModalVisible, matchedProfile, effectiveWidth]);

  const onSwipeComplete = (direction: 'right' | 'left' | 'up') => {
    const profile = feedProfiles[currentCardIndex];
    if (profile) {
      handleSwipe(direction, profile);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const clampedY = gestureState.dy > 0 ? Math.min(gestureState.dy * 0.15, 25) : gestureState.dy;
        position.setValue({ x: gestureState.dx, y: clampedY });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > swipeThreshold) {
          forceSwipe('right');
        } else if (gestureState.dx < -swipeThreshold) {
          forceSwipe('left');
        } else if (gestureState.dy < -swipeThreshold) {
          forceSwipe('up');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const handleStartChatFromMatch = () => {
    if (matchedProfile) {
      const match = matchedProfile;
      dismissMatchModal();
      const existingChat = chats.find((c) => c.participant.name === match.name);
      if (existingChat) {
        openChat(existingChat.id);
      } else {
        setActiveTab('chats');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6EFEA" />

      <ScreenTransition screenKey={activeTab} style={styles.screenTransitionWrapper}>
        {activeTab === 'feed' && (
          <View style={styles.feedWrapper}>
            <Header
              onProfilePress={() => navigate('profile')}
              onFilterPress={() => setFilterModalVisible(true)}
            />

            <View style={styles.deckContainer}>
              {currentCardIndex < feedProfiles.length ? (
                feedProfiles
                  .slice(currentCardIndex, currentCardIndex + 2)
                  .reverse()
                  .map((profile) => {
                    const isTop = profile.id === currentProfile?.id;

                    if (isTop) {
                      return (
                        <Animated.View
                          key={profile.id}
                          {...panResponder.panHandlers}
                          style={[styles.cardWrapper, rotateAndTranslate]}
                        >
                          <Card
                            profile={profile}
                            likeOpacity={likeOpacity}
                            nopeOpacity={nopeOpacity}
                          />
                        </Animated.View>
                      );
                    }

                    return (
                      <Animated.View
                        key={profile.id}
                        style={[
                          styles.cardWrapper,
                          styles.nextCardWrapper,
                          {
                            transform: [{ scale: nextCardScale }],
                            opacity: nextCardOpacity,
                          },
                        ]}
                      >
                        <Card profile={profile} />
                      </Animated.View>
                    );
                  })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Анкеты закончились</Text>
                  <Text style={styles.emptySubtitle}>
                    Вы просмотрели всех пользователей по текущим фильтрам.
                  </Text>
                  <TouchableOpacity style={styles.resetButton} onPress={resetFeed}>
                    <Text style={styles.resetButtonText}>Начать сначала</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ActionButtons
              onDislike={() => forceSwipe('left')}
              onSuperlike={() => forceSwipe('up')}
              onLike={() => forceSwipe('right')}
              disabled={!currentProfile}
            />
          </View>
        )}

        {activeTab === 'likes' && <LikesScreen />}

        {activeTab === 'chats' && <ChatsScreen />}
      </ScreenTransition>

      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          unreadChatsCount={totalUnreadCount}
          unreadLikesCount={likesList.length}
        />
      </View>

      <MatchModal
        visible={Boolean(matchedProfile)}
        onClose={dismissMatchModal}
        currentUser={currentUser}
        matchedProfile={matchedProfile}
        onSendMessage={handleStartChatFromMatch}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        settings={settings}
        onApply={(newFilters) => updateSettings(newFilters)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EFEA',
  },
  screenTransitionWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  feedWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  deckContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bottomNavContainer: {
    backgroundColor: '#F6EFEA',
    zIndex: 9999,
    elevation: 25,
    width: '100%',
  },
  cardWrapper: {
    position: 'absolute',
  },
  nextCardWrapper: {
    zIndex: -1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  resetButton: {
    backgroundColor: '#FF5757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
