import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { TabType } from '../types/profile';
import { CompassIcon, HeartOutlineIcon, ChatBubbleIcon } from './Icons';
import { Badge } from './ui/Badge';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadChatsCount?: number;
  unreadLikesCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount = 0,
  unreadLikesCount = 0,
}) => {
  const scaleFeed = useRef(new Animated.Value(1)).current;
  const scaleLikes = useRef(new Animated.Value(1)).current;
  const scaleChats = useRef(new Animated.Value(1)).current;

  const handleTabPress = (tab: TabType, anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleFeed }] }}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'feed' && styles.activePillContainer,
          ]}
          onPress={() => handleTabPress('feed', scaleFeed)}
          activeOpacity={0.8}
        >
          <CompassIcon
            size={21}
            color={activeTab === 'feed' ? '#FF5757' : '#737373'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'feed' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Лента
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleLikes }] }}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'likes' && styles.activePillContainer,
          ]}
          onPress={() => handleTabPress('likes', scaleLikes)}
          activeOpacity={0.8}
        >
          <View style={styles.iconWithBadge}>
            <HeartOutlineIcon
              size={21}
              color={activeTab === 'likes' ? '#FF5757' : '#737373'}
            />
            {unreadLikesCount > 0 && (
              <View style={styles.badgePosition}>
                <Badge label={unreadLikesCount} variant="count" />
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'likes' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Симпатии
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleChats }] }}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'chats' && styles.activePillContainer,
          ]}
          onPress={() => handleTabPress('chats', scaleChats)}
          activeOpacity={0.8}
        >
          <View style={styles.iconWithBadge}>
            <ChatBubbleIcon
              size={21}
              color={activeTab === 'chats' ? '#FF5757' : '#737373'}
            />
            {unreadChatsCount > 0 && (
              <View style={styles.badgePosition}>
                <Badge label={unreadChatsCount} variant="count" />
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'chats' ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            Чаты
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#F6EFEA',
    borderTopWidth: 1,
    borderTopColor: '#ECE6E0',
    zIndex: 9999,
    elevation: 25,
    width: '100%',
    opacity: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePosition: {
    position: 'absolute',
    top: -6,
    right: -12,
  },
  activePillContainer: {
    backgroundColor: '#FFE9E4',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#FF5757',
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: '#6E6E6E',
    fontWeight: '500',
  },
});
