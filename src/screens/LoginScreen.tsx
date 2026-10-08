import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { BackArrowIcon, UserIcon, LockIcon } from '../components/Icons';

export const LoginScreen: React.FC = () => {
  const { navigate, goBack, login } = useApp();

  const [email, setEmail] = useState('alex@pinder.app');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Введите email или телефон';
    } else if (!email.includes('@') && email.length < 8) {
      newErrors.email = 'Введите корректный email адрес';
    }

    if (!password) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать от 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const success = login(email, password);
      if (!success) {
        Alert.alert('Ошибка', 'Не удалось войти в аккаунт');
      }
    }, 600);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Восстановление пароля',
      `Код для сброса пароля отправлен на ${email || 'указанную почту'}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={goBack}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <BackArrowIcon size={22} color="#1C1C1E" />
              </TouchableOpacity>
              <Text style={styles.headerLogo}>pinder</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>С возвращением!</Text>
              <Text style={styles.subtitle}>
                Войдите, чтобы продолжить общение и открывать новые симпатии.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Email или номер телефона"
                placeholder="example@mail.ru"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                leftIcon={<UserIcon size={18} color="#737373" />}
                keyboardType="email-address"
                autoCapitalize="none"
                clearable
                error={errors.email}
              />

              <Input
                label="Пароль"
                placeholder="Ваш пароль"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                leftIcon={<LockIcon size={18} color="#737373" />}
                isPassword
                error={errors.password}
              />

              <View style={styles.optionsRow}>
                <View style={styles.rememberMeContainer}>
                  <Switch value={rememberMe} onValueChange={setRememberMe} />
                  <Text style={styles.rememberMeText}>Запомнить меня</Text>
                </View>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Забыли пароль?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Войти"
                variant="primary"
                size="lg"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />

              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  💡 Данные предзаполнены для быстрого входа
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ещё нет профиля в Pinder? </Text>
              <TouchableOpacity onPress={() => navigate('register')} activeOpacity={0.7}>
                <Text style={styles.signupText}>Создать аккаунт</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EFEA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
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
  headerLogo: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerPlaceholder: {
    width: 44,
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#737373',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberMeText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: '#FF5757',
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: 16,
  },
  hintContainer: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#EFE6DE',
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: '#8A827B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#737373',
  },
  signupText: {
    fontSize: 14,
    color: '#FF5757',
    fontWeight: '700',
  },
});
