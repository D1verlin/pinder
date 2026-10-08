import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ChatBubbleIcon, SearchIcon, SparklesIcon } from '../components/Icons';
import { ChatConversation } from '../types/profile';

export const ChatsScreen: React.FC = () => {
  const { chats, openChat, likesList, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const matchStories = useMemo(() => {
    return likesList.filter((l) => l.isMutual).map((l) => l.profile);
  }, [likesList]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [chats, searchQuery]);

  const renderChatItem = ({ item }: { item: ChatConversation }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.chatCard, isUnread && styles.chatCardUnread]}
        onPress={() => openChat(item.id)}
        activeOpacity={0.75}
      >
        <Avatar
          uri={item.participant.imageUrl}
          name={item.participant.name}
          size="md"
          isOnline={item.participant.isOnline}
          hasBorder={isUnread}
          borderColor="#FF5757"
        />

        <View style={styles.chatInfo}>
          <View style={styles.topInfoRow}>
            <View style={styles.nameRow}>
              <Text style={[styles.nameText, isUnread && styles.nameUnread]}>
                {item.participant.name}
              </Text>
              {item.participant.verified && (
                <View style={styles.verifiedDot}>
                  <SparklesIcon size={12} color="#FF5757" />
                </View>
              )}
            </View>

            <Text style={[styles.timeText, isUnread && styles.timeUnread]}>
              {item.lastMessageTime}
            </Text>
          </View>

          <View style={styles.bottomInfoRow}>
            <Text
              style={[styles.lastMsgText, isUnread && styles.lastMsgUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {isUnread && <Badge label={item.unreadCount} variant="count" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Поиск по диалогам и собеседникам..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<SearchIcon size={18} color="#737373" />}
          clearable
          containerStyle={styles.searchInputStyle}
        />
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {matchStories.length > 0 && !searchQuery && (
              <View style={styles.storiesSection}>
                <View style={styles.storiesHeader}>
                  <Text style={styles.sectionHeaderTitle}>Новые пары</Text>
                  <Text style={styles.matchesCountBadge}>{matchStories.length}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storiesScroll}
                >
                  {matchStories.map((profile) => (
                    <TouchableOpacity
                      key={profile.id}
                      style={styles.storyItem}
                      onPress={() => {
                        const existingChat = chats.find(
                          (c) => c.participant.name === profile.name
                        );
                        if (existingChat) {
                          openChat(existingChat.id);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Avatar
                        uri={profile.imageUrl}
                        name={profile.name}
                        size="md"
                        hasBorder
                        borderColor="#FF5757"
                        isOnline={profile.isOnline}
                      />
                      <Text style={styles.storyName} numberOfLines={1}>
                        {profile.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.messagesHeader}>
              <Text style={styles.sectionHeaderTitle}>Сообщения</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <ChatBubbleIcon size={38} color="#FF5757" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Ничего не найдено' : 'Нет активных диалогов'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос.'
                : 'Здесь появятся ваши переписки после совпадения симпатий.'}
            </Text>
            {!searchQuery && (
              <Button
                title="Найти пары в ленте"
                variant="primary"
                size="md"
                onPress={() => setActiveTab('feed')}
                style={styles.emptyActionBtn}
              />
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFEA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: -4,
  },
  searchInputStyle: {
    marginBottom: 8,
  },
  storiesSection: {
    marginBottom: 16,
  },
  storiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchesCountBadge: {
    backgroundColor: '#FFE9E4',
    color: '#FF5757',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  storiesScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
  },
  storyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginTop: 6,
    textAlign: 'center',
  },
  messagesHeader: {
    paddingHorizontal: 18,
    marginBottom: 8,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  chatCardUnread: {
    borderColor: '#FFD3CA',
    backgroundColor: '#FFFBF9',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  nameUnread: {
    fontWeight: '800',
  },
  verifiedDot: {
    marginLeft: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timeUnread: {
    color: '#FF5757',
    fontWeight: '700',
  },
  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsgText: {
    fontSize: 13,
    color: '#737373',
    flex: 1,
    marginRight: 8,
  },
  lastMsgUnread: {
    color: '#1C1C1E',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 48,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE9E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionBtn: {
    paddingHorizontal: 28,
  },
});
