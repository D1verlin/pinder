import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { BackArrowIcon, CheckIcon, UserIcon, LockIcon, CameraIcon } from '../components/Icons';
import { POPULAR_TAGS } from '../data/mockProfiles';
import { pickImageFromDevice } from '../utils/imagePicker';

export const RegisterScreen: React.FC = () => {
  const { navigate, goBack, register } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [searchGender, setSearchGender] = useState<'female' | 'male' | 'all'>('male');
  const [city, setCity] = useState('Москва');
  const [bio, setBio] = useState('');

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'кофе & прогулки',
    'выставки & искусство',
  ]);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePickPhoto = async () => {
    try {
      setIsPickingPhoto(true);
      const uri = await pickImageFromDevice();
      if (uri) {
        setSelectedAvatar(uri);
      }
    } catch (err) {
      console.warn('Error selecting photo:', err);
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Введите ваше имя';
    if (!email.trim() || !email.includes('@')) errs.email = 'Введите корректный email';
    if (!password || password.length < 6) errs.password = 'Минимум 6 символов';
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      errs.age = 'Вам должно быть не менее 18 лет';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!bio.trim() || bio.length < 10) {
      errs.bio = 'Напишите хотя бы пару предложений о себе (от 10 символов)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (!selectedAvatar) {
        Alert.alert('Фото профиля', 'Пожалуйста, выберите ваше личное фото с устройства');
        return;
      }
      if (!agreeTerms) {
        Alert.alert('Внимание', 'Необходимо согласиться с правилами сервиса');
        return;
      }
      if (selectedTags.length === 0) {
        Alert.alert('Интересы', 'Выберите хотя бы один интерес');
        return;
      }

      register({
        name: name.trim(),
        email: email.trim(),
        age: parseInt(age, 10),
        gender,
        searchGender,
        city,
        bio: bio.trim(),
        avatarUrl: selectedAvatar,
        tag: selectedTags[0],
        tags: selectedTags,
      });
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else goBack();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags((prev) => [...prev, tag]);
      } else {
        Alert.alert('Лимит', 'Можно выбрать до 5 интересов');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={22} color="#1C1C1E" />
            </TouchableOpacity>

            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>Шаг {step} из 3</Text>
            </View>

            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' },
              ]}
            />
          </View>

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Давайте знакомиться</Text>
              <Text style={styles.stepSubtitle}>
                Укажите основные данные для создания анкеты в Pinder.
              </Text>

              <Input
                label="Ваше имя"
                placeholder="Например, Анна"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                leftIcon={<UserIcon size={18} color="#737373" />}
                error={errors.name}
              />

              <Input
                label="Email"
                placeholder="name@domain.ru"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Пароль"
                placeholder="Минимум 6 символов"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                leftIcon={<LockIcon size={18} color="#737373" />}
                isPassword
                error={errors.password}
              />

              <Input
                label="Ваш возраст (полных лет)"
                placeholder="23"
                value={age}
                onChangeText={(t) => {
                  setAge(t.replace(/[^0-9]/g, ''));
                  if (errors.age) setErrors({ ...errors, age: '' });
                }}
                keyboardType="number-pad"
                maxLength={2}
                error={errors.age}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Расскажите о себе</Text>
              <Text style={styles.stepSubtitle}>
                Это поможет подобрать наиболее гармоничные совпадения.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.groupLabel}>Мой пол</Text>
                <SegmentedControl<'female' | 'male'>
                  options={[
                    { label: 'Девушка', value: 'female' },
                    { label: 'Парень', value: 'male' },
                  ]}
                  selectedValue={gender}
                  onSelect={setGender}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.groupLabel}>Кого вы ищете?</Text>
                <SegmentedControl<'female' | 'male' | 'all'>
                  options={[
                    { label: 'Парней', value: 'male' },
                    { label: 'Девушек', value: 'female' },
                    { label: 'Всех', value: 'all' },
                  ]}
                  selectedValue={searchGender}
                  onSelect={setSearchGender}
                />
              </View>

              <Input
                label="Город"
                placeholder="Москва"
                value={city}
                onChangeText={setCity}
              />

              <Input
                label="О себе"
                placeholder="Расскажите о своих хобби, любимых местах и что для вас важно в человеке..."
                value={bio}
                onChangeText={(t) => {
                  setBio(t);
                  if (errors.bio) setErrors({ ...errors, bio: '' });
                }}
                multiline
                numberOfLines={3}
                error={errors.bio}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Фотография и теги</Text>
              <Text style={styles.stepSubtitle}>
                Выберите ваш аватар и любимые темы для разговоров.
              </Text>

              <Text style={styles.groupLabel}>Фото профиля (с вашего телефона)</Text>
              {!selectedAvatar ? (
                <TouchableOpacity
                  style={styles.uploadCard}
                  onPress={handlePickPhoto}
                  activeOpacity={0.8}
                  disabled={isPickingPhoto}
                >
                  <View style={styles.uploadIconBadge}>
                    <CameraIcon size={26} color="#FF5757" />
                  </View>
                  <Text style={styles.uploadCardTitle}>
                    {isPickingPhoto ? 'Открытие галереи...' : 'Выбрать фото с телефона'}
                  </Text>
                  <Text style={styles.uploadCardSubtitle}>
                    Загрузите ваше настоящее фото из медиатеки устройства
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.selectedPhotoWrapper}>
                  <View style={styles.selectedPhotoCircle}>
                    <Image source={{ uri: selectedAvatar }} style={styles.selectedPhotoImg} />
                    <View style={styles.photoVerifiedBadge}>
                      <CheckIcon size={14} color="#FFFFFF" />
                    </View>
                  </View>

                  <View style={styles.selectedPhotoMeta}>
                    <Text style={styles.selectedPhotoLabel}>Ваше фото готово к публикации</Text>
                    <TouchableOpacity
                      style={styles.changeSelectedPhotoBtn}
                      onPress={handlePickPhoto}
                      activeOpacity={0.7}
                    >
                      <CameraIcon size={15} color="#FF5757" />
                      <Text style={styles.changeSelectedPhotoText}>Выбрать другое фото</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={[styles.groupLabel, { marginTop: 20 }]}>
                Интересы (до 5 тем)
              </Text>
              <View style={styles.tagsContainer}>
                {POPULAR_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
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

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                  {agreeTerms && <CheckIcon size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  Я согласен(а) с правилами сервиса Pinder и политикой конфиденциальности.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomActions}>
            <Button
              title={step === 3 ? 'Завершить регистрацию' : 'Продолжить'}
              variant="primary"
              size="lg"
              onPress={handleNext}
            />

            {step === 1 && (
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Уже зарегистрированы? </Text>
                <TouchableOpacity onPress={() => navigate('login')} activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Войти</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepIndicatorText: {
    color: '#FF5757',
    fontSize: 13,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 44,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#EBE4DE',
    borderRadius: 2,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5757',
  },
  stepContent: {
    flex: 1,
    marginTop: 8,
  },
  stepTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#737373',
    lineHeight: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
    marginLeft: 4,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FFB8B8',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE9E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadCardSubtitle: {
    fontSize: 13,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  selectedPhotoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 16,
    gap: 16,
  },
  selectedPhotoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    borderWidth: 2.5,
    borderColor: '#FF5757',
    overflow: 'visible',
  },
  selectedPhotoImg: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  photoVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#34C759',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedPhotoMeta: {
    flex: 1,
  },
  selectedPhotoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  changeSelectedPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  changeSelectedPhotoText: {
    color: '#FF5757',
    fontSize: 12,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  tagItem: {
    marginBottom: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4CDC6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FF5757',
    borderColor: '#FF5757',
  },
  termsText: {
    fontSize: 12,
    color: '#737373',
    flex: 1,
    lineHeight: 16,
  },
  bottomActions: {
    marginTop: 24,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#737373',
  },
  loginLink: {
    fontSize: 13,
    color: '#FF5757',
    fontWeight: '700',
  },
});
