import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ChatDialogScreen } from './src/screens/ChatDialogScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { WebViewScreen } from './src/screens/WebViewScreen';

interface RootNavigatorProps {
  onSwitchToWebView?: () => void;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({ onSwitchToWebView }) => {
  const { currentScreen } = useApp();

  return (
    <>
      <StatusBar style="dark" />
      {/* Floating button to return to WebView mode when on mobile */}
      {Platform.OS !== 'web' && onSwitchToWebView && (
        <TouchableOpacity
          style={styles.floatingWebViewBtn}
          onPress={onSwitchToWebView}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingBtnText}>🌐 В WebView</Text>
        </TouchableOpacity>
      )}

      <ScreenTransition screenKey={currentScreen}>
        {currentScreen === 'welcome' && <WelcomeScreen />}
        {currentScreen === 'login' && <LoginScreen />}
        {currentScreen === 'register' && <RegisterScreen />}
        {currentScreen === 'main' && <FeedScreen />}
        {currentScreen === 'profile' && <ProfileScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'chat_dialog' && <ChatDialogScreen />}
      </ScreenTransition>
    </>
  );
};

const ResponsiveWebWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webCanvas}>
      <View style={styles.webShell}>
        {children}
      </View>
    </View>
  );
};

export default function App() {
  // On mobile (Expo Go), default to WebView wrapping the published web app.
  // On web platform (GitHub Pages build), render the native web app screens directly.
  const [mode, setMode] = useState<'webview' | 'native'>(
    Platform.OS === 'web' ? 'native' : 'webview'
  );

  if (mode === 'webview') {
    return <WebViewScreen onSwitchToNative={() => setMode('native')} />;
  }

  return (
    <ResponsiveWebWrapper>
      <AppProvider>
        <RootNavigator onSwitchToWebView={() => setMode('webview')} />
      </AppProvider>
    </ResponsiveWebWrapper>
  );
}

const styles = StyleSheet.create({
  webCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#ECE5DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#FAF7F5',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  floatingWebViewBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 9999,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
