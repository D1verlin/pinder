import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';

export const PUBLISHED_WEB_URL = 'https://d1verlin.github.io/pinder/';

interface WebViewScreenProps {
  onSwitchToNative?: () => void;
}

export const WebViewScreen: React.FC<WebViewScreenProps> = ({ onSwitchToNative }) => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(PUBLISHED_WEB_URL);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const handleBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F5" />
      
      {/* Top Bar with URL & Controls */}
      <View style={styles.topBar}>
        <View style={styles.urlContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleReload}
            accessibilityLabel="Перезагрузить"
          >
            <Text style={styles.actionBtnText}>↺</Text>
          </TouchableOpacity>

          {onSwitchToNative && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.nativeSwitchBtn]}
              onPress={onSwitchToNative}
            >
              <Text style={styles.nativeSwitchText}>Нативный UI</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main WebView Content */}
      <View style={styles.contentContainer}>
        {Platform.OS === 'web' ? (
          // Web fallback iframe if launched via web browser
          <iframe
            src={PUBLISHED_WEB_URL}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Pinder Web App"
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: PUBLISHED_WEB_URL }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
              if (navState.url) {
                setCurrentUrl(navState.url);
              }
            }}
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            renderLoading={() => (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF5757" />
                <Text style={styles.loadingText}>Загрузка веб-приложения...</Text>
                <Text style={styles.subLoadingText}>https://d1verlin.github.io/pinder/</Text>
              </View>
            )}
            renderError={() => (
              <View style={styles.centerContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Ошибка загрузки</Text>
                <Text style={styles.errorText}>
                  Не удалось загрузить веб-приложение по адресу:{'\n'}
                  {PUBLISHED_WEB_URL}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
                  <Text style={styles.retryButtonText}>Повторить попытку</Text>
                </TouchableOpacity>
                {onSwitchToNative && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSwitchToNative}
                  >
                    <Text style={styles.secondaryButtonText}>Открыть нативный режим</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAF7F5',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6E0',
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE6E0',
    marginRight: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 6,
  },
  urlText: {
    fontSize: 12,
    color: '#737373',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  nativeSwitchBtn: {
    backgroundColor: '#FFE9E4',
    borderColor: '#FF5757',
  },
  nativeSwitchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5757',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  subLoadingText: {
    marginTop: 4,
    fontSize: 12,
    color: '#737373',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#FF5757',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#737373',
    fontSize: 13,
  },
});
