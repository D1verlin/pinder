# Модели данных, моки и утилиты

Данный документ описывает структуру данных TypeScript, наборы тестовых данных и вспомогательные утилиты приложения Pinder.

---

## 1. Модели данных TypeScript (`src/types/profile.ts`)

### 1.1. `Profile` — Анкета пользователя в колоде
```typescript
export interface Profile {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  tag: string;
  occupation?: string;
  imageUrl: string;
  photos?: string[];
  tags?: string[];
  spotifyTrack?: string;
  isOnline?: boolean;
  idealDate?: string;
  verified?: boolean;
}
```

### 1.2. `User` — Текущий авторизованный пользователь
```typescript
export interface User {
  id: string;
  name: string;
  email?: string;
  age: number;
  gender?: 'female' | 'male';
  searchGender?: 'female' | 'male' | 'all';
  city?: string;
  bio: string;
  tag: string;
  occupation?: string;
  avatarUrl: string;
  photos?: string[];
  tags?: string[];
  spotifyTrack?: string;
  idealDate?: string;
  verified?: boolean;
}
```

### 1.3. `Message` и `ChatConversation` — Система сообщений
```typescript
export interface Message {
  id: string;
  senderId: string;       // 'user' или 'partner'
  text: string;
  timestamp: string;      // Например: '14:25'
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
```

### 1.4. `LikeItem` — Входящая или взаимная симпатия
```typescript
export interface LikeItem {
  id: string;
  profile: Profile;
  likedAt: string;        // Например: '15 минут назад'
  isMutual: boolean;      // true — взаимная пара, false — односторонняя
}
```

### 1.5. `AppSettings` — Параметры приложения
```typescript
export interface AppSettings {
  discoveryDistance: number;               // Радиус поиска в км (1–100)
  minAge: number;                          // Минимальный возраст
  maxAge: number;                          // Максимальный возраст
  showGender: 'female' | 'male' | 'all';   // Кого искать
  notifyLikes: boolean;                    // Уведомления о симпатиях
  notifyMessages: boolean;                 // Уведомления о сообщениях
  soundEnabled: boolean;                   // Звуки и виброотклик
  incognito: boolean;                      // Скрытие из общей колоды
  showOnlineStatus: boolean;               // Отображение зеленой точки
}
```

---

## 2. Мок-данные (`src/data/mockProfiles.ts`)

Файл предоставляет реалистичный набор данных для автономной работы приложения без бэкенда:
- **`MOCK_PROFILES`:** 8 детализированных анкет (Саша, Алина, Полина, Лера, Катя, Даша, Маша, Соня) с высококачественными фотографиями Unsplash, реальными интересами, городами и описаниями идеальных свиданий.
- **`MOCK_LIKES`:** 4 предзаполненные симпатии с разделением на односторонние и взаимные.
- **`MOCK_CHATS`:** 3 готовых диалога с реалистичной историей сообщений, временными метками и счетчиками непрочитанных.
- **`POPULAR_TAGS`:** Набор тегов для быстрого выбора интересов в анкете (`кофе & прогулки`, `выставки & искусство`, `фотография & пленка`, `архитектура`, `книги & поэзия`, `джаз & винил`, `велосипед`, `путешествия`, `йога & баланс`, `кинематограф`).
- **`DEFAULT_CURRENT_USER`:** Готовый профиль главного героя (Артем, 26 лет, пленочный фотограф) для быстрого входа.

---

## 3. Кроссплатформенный выбор фото (`src/utils/imagePicker.ts`)

Утилита `pickImageFromDevice` предоставляет бесшовный API для загрузки фотографий пользователя как на мобильных устройствах (iOS/Android), так и в веб-браузере:

```typescript
export const pickImageFromDevice = async (): Promise<string | null> => {
  try {
    // 1. На мобильных устройствах запрашиваем системные разрешения
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Для выбора вашего фото необходим доступ к медиатеке устройства');
        return null;
      }
    }

    // 2. Открываем нативную галерею со встроенным кадрированием 1:1
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (err) {
    // 3. Веб-фоллбэк для работы в браузере (через FileReader)
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          } else {
            resolve(null);
          }
        };
        input.click();
      });
    }

    return null;
  }
};
```

### Преимущества реализации
1. **Квадратное кадрирование (`aspect: [1, 1]`):** Фотография автоматически обрезается под круглый аватар и карточку анкеты.
2. **Сжатие (`quality: 0.85`):** Оптимизирует размер файла в памяти без видимой потери четкости.
3. **Безотказность:** Работает в симуляторах, на реальных смартфонах и в Chrome/Safari без падений.
