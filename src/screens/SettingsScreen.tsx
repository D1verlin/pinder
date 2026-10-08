import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Slider } from '../components/ui/Slider';
import { Switch } from '../components/ui/Switch';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import {
  BackArrowIcon,
  BellIcon,
  LockIcon,
  LogoutIcon,
  ChevronRightIcon,
} from '../components/Icons';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, logout, resetFeed, goBack } = useApp();

  const handleLogout = () => {
    Alert.alert('Выход из аккаунта', 'Вы уверены, что хотите выйти из Pinder?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const handleResetSwipes = () => {
    resetFeed();
    Alert.alert('Готово', 'История свайпов сброшена. Все анкеты снова доступны в ленте!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Это действие необратимо. Ваша анкета, симпатии и диалоги будут удалены навсегда.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить навсегда', style: 'destructive', onPress: logout },
      ]
    );
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
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Параметры поиска</Text>

          <Text style={styles.label}>Кого показывать в ленте</Text>
          <SegmentedControl<'female' | 'male' | 'all'>
            options={[
              { label: 'Девушек', value: 'female' },
              { label: 'Парней', value: 'male' },
              { label: 'Всех', value: 'all' },
            ]}
            selectedValue={settings.showGender}
            onSelect={(val) => updateSettings({ showGender: val })}
            style={styles.segmented}
          />

          <Slider
            label="Максимальное расстояние"
            value={settings.discoveryDistance}
            onValueChange={(val) => updateSettings({ discoveryDistance: val })}
            min={1}
            max={100}
            step={1}
            unit="км"
            quickPresets={[10, 25, 50, 100]}
          />

          <Slider
            label="Максимальный возраст"
            value={settings.maxAge}
            onValueChange={(val) => updateSettings({ maxAge: val })}
            min={18}
            max={55}
            step={1}
            unit="лет"
            quickPresets={[25, 30, 35, 45, 55]}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <BellIcon size={18} color="#FF5757" />
            <Text style={styles.sectionTitle}>Уведомления</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Новые симпатии</Text>
              <Text style={styles.settingDesc}>
                Оповещать, когда кто-то ответил взаимностью
              </Text>
            </View>
            <Switch
              value={settings.notifyLikes}
              onValueChange={(val) => updateSettings({ notifyLikes: val })}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Сообщения в чатах</Text>
              <Text style={styles.settingDesc}>
                Мгновенные push-уведомления о новых ответах
              </Text>
            </View>
            <Switch
              value={settings.notifyMessages}
              onValueChange={(val) => updateSettings({ notifyMessages: val })}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Звуки и вибрация</Text>
              <Text style={styles.settingDesc}>Тактильный отклик при свайпах</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => updateSettings({ soundEnabled: val })}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <LockIcon size={18} color="#FF5757" />
            <Text style={styles.sectionTitle}>Приватность</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Режим «Невидимка»</Text>
              <Text style={styles.settingDesc}>
                Скрыть анкету из ленты. Вас увидят только те, кого лайкнули вы
              </Text>
            </View>
            <Switch
              value={settings.incognito}
              onValueChange={(val) => updateSettings({ incognito: val })}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Показывать статус «В сети»</Text>
              <Text style={styles.settingDesc}>Зеленая точка активности на аватаре</Text>
            </View>
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(val) => updateSettings({ showOnlineStatus: val })}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Аккаунт и данные</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetSwipes}
            activeOpacity={0.7}
          >
            <Text style={styles.actionRowLabel}>Сбросить историю свайпов</Text>
            <ChevronRightIcon size={18} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutRow}>
              <LogoutIcon size={18} color="#FF3B30" />
              <Text style={styles.logoutLabel}>Выйти из аккаунта</Text>
            </View>
            <ChevronRightIcon size={18} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteLabel}>Удалить аккаунт</Text>
            <ChevronRightIcon size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>pinder Mobile • Версия 1.0.0</Text>
          <Text style={styles.versionSubtext}>Expo SDK 57 • React Native</Text>
        </View>
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
  placeholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EFEA',
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionRowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  deleteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#8A8A8E',
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 11,
    color: '#B0AAA3',
    marginTop: 2,
  },
});
