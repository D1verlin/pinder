import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Profile,
  User,
  ChatConversation,
  LikeItem,
  AppSettings,
  TabType,
  ScreenType,
  Message,
} from '../types/profile';
import {
  MOCK_PROFILES,
  MOCK_LIKES,
  MOCK_CHATS,
  DEFAULT_CURRENT_USER,
  DEFAULT_SETTINGS,
} from '../data/mockProfiles';

interface AppContextType {
  currentScreen: ScreenType;
  screenParams: Record<string, any>;
  activeTab: TabType;
  navigate: (screen: ScreenType, params?: Record<string, any>) => void;
  goBack: () => void;
  setActiveTab: (tab: TabType) => void;

  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  guestLogin: () => void;
  updateUserProfile: (data: Partial<User>) => void;

  feedProfiles: Profile[];
  currentCardIndex: number;
  matchedProfile: Profile | null;
  handleSwipe: (direction: 'left' | 'right' | 'up', profile: Profile) => void;
  dismissMatchModal: () => void;
  resetFeed: () => void;

  likesList: LikeItem[];
  handleLikeBack: (likeItem: LikeItem) => void;
  handleSkipLike: (likeId: string) => void;

  chats: ChatConversation[];
  activeChat: ChatConversation | null;
  openChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  totalUnreadCount: number;

  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<ScreenType[]>(['welcome']);
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [feedProfiles, setFeedProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const [likesList, setLikesList] = useState<LikeItem[]>(MOCK_LIKES);

  const [chats, setChats] = useState<ChatConversation[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const navigate = (screen: ScreenType, params: Record<string, any> = {}) => {
    setHistory((prev) => [...prev, screen]);
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (currentScreen === 'chat_dialog') {
      setActiveTab('chats');
      setCurrentScreen('main');
      setHistory(['main']);
      return;
    }

    if (currentScreen === 'profile' || currentScreen === 'settings') {
      setCurrentScreen('main');
      setHistory(['main']);
      return;
    }

    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];

      if (isAuthenticated && (prevScreen === 'welcome' || prevScreen === 'login' || prevScreen === 'register')) {
        setHistory(['main']);
        setCurrentScreen('main');
      } else {
        setHistory(nextHistory);
        setCurrentScreen(prevScreen);
      }
    } else {
      setCurrentScreen(isAuthenticated ? 'main' : 'welcome');
    }
  };

  const login = (email: string, _pass: string): boolean => {
    if (!email.trim()) return false;
    setCurrentUser({
      ...DEFAULT_CURRENT_USER,
      email: email.trim(),
    });
    setIsAuthenticated(true);
    setHistory(['main']);
    setCurrentScreen('main');
    return true;
  };

  const register = (userData: Partial<User>): boolean => {
    const newUser: User = {
      ...DEFAULT_CURRENT_USER,
      ...userData,
      id: `user-${Date.now()}`,
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setHistory(['main']);
    setCurrentScreen('main');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('welcome');
    setHistory(['welcome']);
  };

  const guestLogin = () => {
    setCurrentUser(DEFAULT_CURRENT_USER);
    setIsAuthenticated(true);
    setHistory(['main']);
    setCurrentScreen('main');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up', profile: Profile) => {
    setCurrentCardIndex((prev) => prev + 1);

    if (direction === 'right' || direction === 'up') {
      const isMatch = profile.id === '1' || profile.id === '2' || Math.random() > 0.4;
      if (isMatch) {
        setMatchedProfile(profile);

        const existingChat = chats.find((c) => c.participant.name === profile.name);
        if (!existingChat) {
          const newChat: ChatConversation = {
            id: `chat-${Date.now()}`,
            participant: profile,
            lastMessage: 'Вы понравились друг другу! Начните диалог ✨',
            lastMessageTime: 'Только что',
            unreadCount: 0,
            messages: [],
          };
          setChats((prev) => [newChat, ...prev]);
        }
      }
    }
  };

  const dismissMatchModal = () => {
    setMatchedProfile(null);
  };

  const resetFeed = () => {
    setCurrentCardIndex(0);
    setFeedProfiles(MOCK_PROFILES);
  };

  const handleLikeBack = (likeItem: LikeItem) => {
    setLikesList((prev) =>
      prev.map((item) =>
        item.id === likeItem.id ? { ...item, isMutual: true } : item
      )
    );

    const chatExists = chats.find((c) => c.participant.id === likeItem.profile.id);
    if (!chatExists) {
      const newChat: ChatConversation = {
        id: `chat-like-${likeItem.profile.id}`,
        participant: likeItem.profile,
        lastMessage: 'Взаимная симпатия! Пора поздороваться 👋',
        lastMessageTime: 'Только что',
        unreadCount: 0,
        messages: [],
      };
      setChats((prev) => [newChat, ...prev]);
    }

    setMatchedProfile(likeItem.profile);
  };

  const handleSkipLike = (likeId: string) => {
    setLikesList((prev) => prev.filter((item) => item.id !== likeId));
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, isRead: true })),
            }
          : c
      )
    );
    navigate('chat_dialog', { chatId });
  };

  const sendMessage = (chatId: string, text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: text.trim(),
            lastMessageTime: userMsg.timestamp,
            messages: [...chat.messages, userMsg],
          };
        }
        return chat;
      })
    );

    setTimeout(() => {
      const replies = [
        'Звучит потрясающе! Я с радостью 😊',
        'Полностью согласна! Когда встретимся?',
        'Ха-ха, в точку! У тебя отличное чувство юмора ✨',
        'Обожаю это место! Давай в пятницу вечером?',
        'Спасибо за теплые слова! Как твой день проходит?',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const partnerMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        senderId: 'partner',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
      };

      setChats((currentChats) =>
        currentChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: randomReply,
              lastMessageTime: partnerMsg.timestamp,
              messages: [...chat.messages, partnerMsg],
            };
          }
          return chat;
        })
      );
    }, 1400);
  };

  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const totalUnreadCount = useMemo(() => {
    return chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [chats]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenParams,
        activeTab,
        navigate,
        goBack,
        setActiveTab,
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        guestLogin,
        updateUserProfile,
        feedProfiles,
        currentCardIndex,
        matchedProfile,
        handleSwipe,
        dismissMatchModal,
        resetFeed,
        likesList,
        handleLikeBack,
        handleSkipLike,
        chats,
        activeChat,
        openChat,
        sendMessage,
        totalUnreadCount,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
