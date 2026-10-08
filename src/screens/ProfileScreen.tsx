import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import {
  BackArrowIcon,
  SettingsIcon,
  EditIcon,
  CheckIcon,
  SparklesIcon,
  CameraIcon,
} from '../components/Icons';
import { POPULAR_TAGS } from '../data/mockProfiles';
import { pickImageFromDevice } from '../utils/imagePicker';

export const ProfileScreen: React.FC = () => {
  const { currentUser, updateUserProfile, navigate, goBack, likesList, chats } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [previewCard, setPreviewCard] = useState(false);

  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAge, setEditAge] = useState(String(currentUser?.age || '26'));
  const [editCity, setEditCity] = useState(currentUser?.city || 'Москва');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(
    currentUser?.avatarUrl || ''
  );
  const [editTags, setEditTags] = useState<string[]>(
    currentUser?.tags || ['кофе & прогулки', 'выставки & искусство', 'фотография & пленка']
  );
  const [lifestylePhotos, setLifestylePhotos] = useState<string[]>(
    currentUser?.photos && currentUser.photos.length > 0
      ? currentUser.photos
      : currentUser?.avatarUrl
      ? [currentUser.avatarUrl]
      : []
  );

  const mutualCount = chats.length;
  const likesCount = likesList.length;

  const handlePickMainAvatar = async () => {
    try {
      const uri = await pickImageFromDevice();
      if (uri) {
        setEditAvatar(uri);
        const filtered = lifestylePhotos.filter((p) => p !== uri);
        const newPhotos = [uri, ...filtered];
        setLifestylePhotos(newPhotos);
        updateUserProfile({
          avatarUrl: uri,
          photos: newPhotos,
        });
        Alert.alert('Фото обновлено', 'Ваше фото с устройства успешно установлено в качестве главного!');
      }
    } catch (err) {
      console.warn('Error picking main avatar:', err);
    }
  };

  const handleAddGalleryPhoto = async () => {
    try {
      const uri = await pickImageFromDevice();
      if (uri) {
        const newPhotos = [uri, ...lifestylePhotos];
        setLifestylePhotos(newPhotos);
        updateUserProfile({
          photos: newPhotos,
        });
        Alert.alert('Фото добавлено', 'Фотография с вашего устройства добавлена в галерею профиля!');
      }
    } catch (err) {
      console.warn('Error picking gallery photo:', err);
    }
  };

  const handleSave = () => {
    if (!editName.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return;
    }

    updateUserProfile({
      name: editName.trim(),
      age: parseInt(editAge, 10) || currentUser?.age || 26,
      city: editCity.trim(),
      bio: editBio.trim(),
      avatarUrl: editAvatar,
      photos: lifestylePhotos,
      tag: editTags[0] || 'кофе & прогулки',
      tags: editTags,
    });

    setIsEditing(false);
    Alert.alert('Успешно', 'Профиль и фотографии сохранены!');
  };

  const toggleTag = (tag: string) => {
    if (editTags.includes(tag)) {
      setEditTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (editTags.length < 5) {
        setEditTags((prev) => [...prev, tag]);
      } else {
        Alert.alert('Лимит', 'Можно выбрать до 5 интересов');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color="#1C1C1E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? 'Редактирование' : previewCard ? 'Предпросмотр' : 'Мой профиль'}
        </Text>

        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => navigate('settings')}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsIcon size={21} color="#2A2A2A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isEditing && !previewCard && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: currentUser?.avatarUrl || editAvatar }}
                  style={styles.mainAvatarImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.7)']}
                  style={styles.avatarGradient}
                />

                <TouchableOpacity
                  style={styles.changePhotoFloatingBtn}
                  onPress={handlePickMainAvatar}
                  activeOpacity={0.85}
                >
                  <CameraIcon size={16} color="#FFFFFF" />
                  <Text style={styles.changePhotoText}>Сменить фото</Text>
                </TouchableOpacity>

                <View style={styles.avatarBadgesRow}>
                  <View style={styles.verifiedGoldBadge}>
                    <SparklesIcon size={14} color="#F5A623" />
                    <Text style={styles.verifiedText}>Верифицирован</Text>
                  </View>
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineGreenDot} />
                    <Text style={styles.onlineBadgeText}>В сети</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{currentUser?.name}</Text>
                  <Text style={styles.userAge}>, {currentUser?.age}</Text>
                </View>

                <Text style={styles.userLocation}>
                  {currentUser?.city || 'Москва'} • 26 лет • Плёночная эстетика
                </Text>

                <View style={styles.scoreRow}>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillText}>Рейтинг анкеты: 98% (Высокий)</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{likesCount}</Text>
                <Text style={styles.statLabel}>Симпатий</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{mutualCount}</Text>
                <Text style={styles.statLabel}>Взаимных пар</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Заполнен</Text>
              </View>
            </View>

            <View style={styles.galleryCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.cardHeader}>Фотографии профиля</Text>
                <TouchableOpacity
                  onPress={handleAddGalleryPhoto}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addPhotoLink}>+ Загрузить фото</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.photoGrid}>
                {lifestylePhotos.map((photoUri, idx) => (
                  <View key={idx} style={styles.photoGridItem}>
                    <Image source={{ uri: photoUri }} style={styles.photoGridImg} />
                    {idx === 0 && (
                      <View style={styles.mainPhotoPill}>
                        <Text style={styles.mainPhotoPillText}>Главное</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>О себе</Text>
              <Text style={styles.bioText}>
                {currentUser?.bio ||
                  'Фотографирую на плёнку 35mm, варю спешелти кофе и ищу компанию на выставки современного искусства.'}
              </Text>

              <Text style={[styles.cardHeader, { marginTop: 18 }]}>Мои интересы</Text>
              <View style={styles.tagsRow}>
                {(currentUser?.tags || editTags).map((tag) => (
                  <Badge key={tag} label={tag} variant="tag" active style={styles.tagBadge} />
                ))}
              </View>
            </View>

            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>☕ МОЙ ИДЕАЛЬНЫЙ ВЫХОДНОЙ</Text>
              <Text style={styles.promptText}>
                {currentUser?.idealDate ||
                  'Выпить фильтр-кофе в тихом дворике на Китай-городе, а потом пойти в галерею или виниловый маркет.'}
              </Text>
            </View>

            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>🎵 МОЙ ТРЕК В SPOTIFY</Text>
              <Text style={styles.promptText}>
                {currentUser?.spotifyTrack || 'Arctic Monkeys — 505'}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Редактировать анкету"
                variant="primary"
                size="md"
                onPress={() => setIsEditing(true)}
              />

              <Button
                title="Предпросмотр карточки"
                variant="secondary"
                size="md"
                onPress={() => setPreviewCard(true)}
              />

              <Button
                title="Настройки аккаунта"
                variant="outline"
                size="md"
                onPress={() => navigate('settings')}
              />
            </View>
          </>
        )}

        {previewCard && (
          <View style={styles.previewContainer}>
            <View style={styles.mockCard}>
              <Image
                source={{ uri: currentUser?.avatarUrl || editAvatar }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                style={styles.cardGradient}
              />
              <View style={styles.previewOverlay}>
                <View style={styles.previewNameRow}>
                  <Text style={styles.previewName}>{currentUser?.name}</Text>
                  <Text style={styles.previewAge}>{currentUser?.age}</Text>
                </View>
                <Text style={styles.previewBio}>{currentUser?.bio}</Text>
                <View style={styles.previewTag}>
                  <Text style={styles.previewTagText}>{currentUser?.tag}</Text>
                </View>
              </View>
            </View>

            <Button
              title="Закрыть предпросмотр"
              variant="secondary"
              size="md"
              onPress={() => setPreviewCard(false)}
              style={styles.closePreviewBtn}
            />
          </View>
        )}

        {isEditing && (
          <View style={styles.editForm}>
            <Text style={styles.editSectionTitle}>Главное фото анкеты</Text>

            <View style={styles.editAvatarCenter}>
              <Image source={{ uri: editAvatar }} style={styles.editAvatarPreview} />
              <TouchableOpacity
                style={styles.editAvatarActionBtn}
                onPress={handlePickMainAvatar}
                activeOpacity={0.8}
              >
                <CameraIcon size={16} color="#FFFFFF" />
                <Text style={styles.editAvatarActionText}>Выбрать фото с телефона</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Имя"
              value={editName}
              onChangeText={setEditName}
              placeholder="Ваше имя"
            />

            <Input
              label="Возраст"
              value={editAge}
              onChangeText={(t) => setEditAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Input
              label="Город"
              value={editCity}
              onChangeText={setEditCity}
              placeholder="Москва"
            />

            <Input
              label="О себе (биография)"
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Расскажите о себе..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.editSectionTitle}>Интересы (до 5 тем)</Text>
            <View style={styles.tagsContainer}>
              {POPULAR_TAGS.map((tag) => {
                const isSelected = editTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    label={tag}
                    variant="tag"
                    active={isSelected}
                    onPress={() => toggleTag(tag)}
                    style={styles.tagItem}
                  />
                );
              })}
            </View>

            <View style={styles.editButtonsRow}>
              <Button
                title="Сохранить"
                variant="primary"
                size="md"
                onPress={handleSave}
                style={{ flex: 1 }}
              />
              <Button
                title="Отмена"
                variant="secondary"
                size="md"
                onPress={() => setIsEditing(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EFEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE4',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarWrapper: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#2A2A2A',
  },
  mainAvatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    position: 'absolute',
    inset: 0,
  },
  changePhotoFloatingBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarBadgesRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedGoldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4D6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B27600',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  onlineGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  heroInfo: {
    padding: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  userName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  userAge: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  userLocation: {
    fontSize: 13,
    color: '#737373',
    marginTop: 4,
  },
  scoreRow: {
    marginTop: 10,
  },
  scorePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scorePillText: {
    fontSize: 11,
    color: '#FF5757',
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5757',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBE4DE',
  },
  galleryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 20,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addPhotoLink: {
    color: '#FF5757',
    fontSize: 13,
    fontWeight: '700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoGridItem: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ECE6E0',
  },
  photoGridImg: {
    width: '100%',
    height: '100%',
  },
  mainPhotoPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5757',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mainPhotoPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginTop: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagBadge: {
    marginBottom: 4,
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 16,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5757',
    letterSpacing: 1,
    marginBottom: 6,
  },
  promptText: {
    fontSize: 14,
    color: '#2A2A2A',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  previewContainer: {
    alignItems: 'center',
  },
  mockCard: {
    width: '100%',
    height: 480,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2A2A2A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    inset: 0,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  previewName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewAge: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 10,
    lineHeight: 20,
  },
  previewTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  previewTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closePreviewBtn: {
    marginTop: 20,
    width: '100%',
  },
  editForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE6E0',
  },
  editSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 10,
    marginTop: 6,
  },
  editAvatarCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editAvatarPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FF5757',
  },
  editAvatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5757',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
  },
  editAvatarActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagItem: {
    marginBottom: 4,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
});
