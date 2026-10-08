import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/ui/Avatar';
import {
  BackArrowIcon,
  SendIcon,
  PhoneIcon,
  CheckCheckIcon,
  SmileyIcon,
} from '../components/Icons';
import { Message } from '../types/profile';

const QUICK_PROMPTS = [
  'Привет! Как проходит твой день? ✨',
  'Знаю отличное место с кофе, сходим? ☕',
  'Какой любимый альбом слушаешь сейчас? 🎵',
  'Давай на выходных погуляем? 🌿',
];

export const ChatDialogScreen: React.FC = () => {
  const { activeChat, sendMessage, goBack } = useApp();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const participant = activeChat?.participant;
  const messages = activeChat?.messages || [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChat) return;

    sendMessage(activeChat.id, text.trim());
    setInputText('');

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1200);
    }, 400);
  };

  const handleCall = () => {
    Alert.alert(
      'Аудиозвонок',
      `Соединение с ${participant?.name || 'собеседником'}...`,
      [{ text: 'Завершить' }]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <Text style={[styles.bubbleText, isMe ? styles.textMe : styles.textOther]}>
            {item.text}
          </Text>

          <View style={styles.timeRow}>
            <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
              {item.timestamp}
            </Text>
            {isMe && <CheckCheckIcon size={14} color="#FFE3DE" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={goBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackArrowIcon size={22} color="#1C1C1E" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Avatar
              uri={participant?.imageUrl}
              name={participant?.name}
              size="sm"
              isOnline={participant?.isOnline}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{participant?.name}</Text>
              <Text style={styles.headerStatus}>
                {isTyping
                  ? 'печатает...'
                  : participant?.isOnline
                  ? 'в сети'
                  : 'была недавно'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PhoneIcon size={20} color="#2A2A2A" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyMessagesContainer}>
              <Text style={styles.emptyMatchTitle}>Вы понравились друг другу!</Text>
              <Text style={styles.emptyMatchDesc}>
                Сделайте первый шаг. Спросите о любимой пекарне или предложите прогуляться.
              </Text>
            </View>
          }
        />

        <View style={styles.chipsSection}>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleSend(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.emojiBtn}
            onPress={() => setInputText((prev) => prev + ' 😊')}
            activeOpacity={0.7}
          >
            <SmileyIcon size={22} color="#737373" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Напишите сообщение..."
            placeholderTextColor="#9E9892"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <SendIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F6EFEA',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6E0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CD964',
    fontWeight: '600',
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyMatchTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyMatchDesc: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bubbleMe: {
    backgroundColor: '#FF5757',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#ECE6E0',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#1C1C1E',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeOther: {
    color: '#9E9E9E',
  },
  chipsSection: {
    paddingVertical: 6,
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE6E0',
  },
  chipText: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE6E0',
  },
  emojiBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F6EFEA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 90,
    fontSize: 15,
    color: '#1C1C1E',
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF5757',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5757',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendBtnDisabled: {
    backgroundColor: '#E5DFD9',
    shadowOpacity: 0,
    elevation: 0,
  },
});
