import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  HeartFilledIcon,
  CrossIcon,
  ChatBubbleIcon,
  HeartOutlineIcon,
  SparklesIcon,
} from '../components/Icons';
import { LikeItem, Profile } from '../types/profile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export const LikesScreen: React.FC = () => {
  const { likesList, handleLikeBack, handleSkipLike, openChat, chats, setActiveTab } =
    useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'mutual'>('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filteredLikes = useMemo(() => {
    if (activeFilter === 'mutual') {
      return likesList.filter((item) => item.isMutual);
    }
    return likesList;
  }, [likesList, activeFilter]);

  const mutualCount = useMemo(() => {
    return likesList.filter((item) => item.isMutual).length;
  }, [likesList]);

  const handleOpenExistingChat = (profile: Profile) => {
    const existing = chats.find(
      (c) => c.participant.name === profile.name || c.participant.id === profile.id
    );
    if (existing) {
      openChat(existing.id);
    } else {
      handleLikeBack({
        id: `like-${profile.id}`,
        profile,
        likedAt: 'Только что',
        isMutual: true,
      });
    }
  };

  const renderLikeCard = ({ item }: { item: LikeItem }) => {
    const profile = item.profile;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => setSelectedProfile(profile)}
      >
        <Image source={{ uri: profile.imageUrl }} style={styles.cardImage} resizeMode="cover" />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          style={styles.cardGradient}
        />

        <View style={styles.cardTopRow}>
          {item.isMutual ? (
            <View style={styles.mutualBadge}>
              <SparklesIcon size={12} color="#F5A623" />
              <Text style={styles.mutualBadgeText}>Взаимно</Text>
            </View>
          ) : (
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{item.likedAt}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.ageText}>{profile.age}</Text>
          </View>

          <Text style={styles.tagText} numberOfLines={1}>
            {profile.tag}
          </Text>

          <View style={styles.actionRow}>
            {item.isMutual ? (
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => handleOpenExistingChat(profile)}
                activeOpacity={0.8}
              >
                <ChatBubbleIcon size={16} color="#FFFFFF" />
                <Text style={styles.chatActionText}>Написать</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={() => handleSkipLike(item.id)}
                  activeOpacity={0.8}
                >
                  <CrossIcon size={16} color="#737373" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => handleLikeBack(item)}
                  activeOpacity={0.8}
                >
                  <HeartFilledIcon size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Симпатии</Text>
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl<'all' | 'mutual'>
          options={[
            { label: 'Все симпатии', value: 'all', badge: likesList.length },
            { label: 'Взаимно', value: 'mutual', badge: mutualCount },
          ]}
          selectedValue={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>

      {filteredLikes.length > 0 ? (
        <FlatList
          data={filteredLikes}
          renderItem={renderLikeCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <HeartOutlineIcon size={38} color="#FF5757" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'mutual'
              ? 'Пока нет взаимных симпатий'
              : 'Список симпатий пуст'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'mutual'
              ? 'Ответьте взаимностью на симпатии в списке «Все», чтобы начать диалог.'
              : 'Продолжайте свайпать анкеты в ленте, чтобы привлечь больше внимания!'}
          </Text>
          <Button
            title="Перейти в ленту"
            variant="primary"
            size="md"
            onPress={() => setActiveTab('feed')}
            style={styles.emptyActionBtn}
          />
        </View>
      )}

      {selectedProfile && (
        <Modal
          visible={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
          variant="bottomSheet"
        >
          <View style={styles.detailContainer}>
            <View style={styles.detailImageWrapper}>
              <Image
                source={{ uri: selectedProfile.imageUrl }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.detailInfo}>
              <View style={styles.detailNameRow}>
                <Text style={styles.detailName}>{selectedProfile.name}</Text>
                <Text style={styles.detailAge}>, {selectedProfile.age}</Text>
              </View>

              <Text style={styles.detailLocation}>
                {selectedProfile.city || 'Москва'} • {selectedProfile.distance || 3} км от вас
              </Text>

              <Text style={styles.detailBio}>{selectedProfile.bio}</Text>

              <View style={styles.detailTagBadge}>
                <Text style={styles.detailTagText}>{selectedProfile.tag}</Text>
              </View>

              <View style={styles.detailActionsRow}>
                <Button
                  title="Начать диалог"
                  variant="primary"
                  size="md"
                  onPress={() => {
                    const prof = selectedProfile;
                    setSelectedProfile(null);
                    handleOpenExistingChat(prof);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  segmentContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.45,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE4DE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mutualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4D6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mutualBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B27600',
  },
  timeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  nameText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  ageText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  skipBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5757',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  chatActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
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
  detailContainer: {
    paddingBottom: 10,
  },
  detailImageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailInfo: {
    paddingHorizontal: 4,
  },
  detailNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  detailName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  detailAge: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '600',
    color: '#555555',
  },
  detailLocation: {
    fontSize: 13,
    color: '#737373',
    marginVertical: 4,
  },
  detailBio: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginVertical: 10,
  },
  detailTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 18,
  },
  detailTagText: {
    color: '#FF5757',
    fontWeight: '700',
    fontSize: 12,
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
