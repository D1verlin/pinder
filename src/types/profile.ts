export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  tag: string;
  imageUrl: string;
  photos?: string[];
  city?: string;
  distance?: number;
  verified?: boolean;
  isOnline?: boolean;
}

export interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  bio: string;
  tag: string;
  tags: string[];
  avatarUrl: string;
  city: string;
  gender?: 'female' | 'male' | 'other';
  searchGender?: 'female' | 'male' | 'all';
  photos?: string[];
  spotifyTrack?: string;
  zodiac?: string;
  idealDate?: string;
  verified?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participant: Profile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface LikeItem {
  id: string;
  profile: Profile;
  likedAt: string;
  isMutual: boolean;
}

export interface AppSettings {
  discoveryDistance: number;
  minAge: number;
  maxAge: number;
  showGender: 'female' | 'male' | 'all';
  notifyLikes: boolean;
  notifyMessages: boolean;
  soundEnabled: boolean;
  incognito: boolean;
  showOnlineStatus: boolean;
}

export type TabType = 'feed' | 'likes' | 'chats';

export type ScreenType =
  | 'welcome'
  | 'login'
  | 'register'
  | 'main'
  | 'profile'
  | 'settings'
  | 'chat_dialog';
