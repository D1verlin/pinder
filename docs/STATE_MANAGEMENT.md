# Управление состоянием: `src/context/AppContext.tsx`

Файл `AppContext.tsx` выступает центральным диспетчером бизнес-логики приложения Pinder. Он объединяет навигацию, авторизацию, колоду анкет, алгоритм взаимных совпадений, историю сообщений и настройки профиля в единый реактивный контекст.

---

## 1. Интерфейс `AppContextType`

Контекст предоставляет компонентам строго типизированный интерфейс:

```typescript
interface AppContextType {
  // Навигация
  currentScreen: ScreenType;
  screenParams: Record<string, any>;
  activeTab: TabType;
  navigate: (screen: ScreenType, params?: Record<string, any>) => void;
  goBack: () => void;
  setActiveTab: (tab: TabType) => void;

  // Авторизация и профиль
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  guestLogin: () => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Лента и свайпы
  feedProfiles: Profile[];
  currentCardIndex: number;
  matchedProfile: Profile | null;
  handleSwipe: (direction: 'left' | 'right' | 'up', profile: Profile) => void;
  dismissMatchModal: () => void;
  resetFeed: () => void;

  // Симпатии
  likesList: LikeItem[];
  handleLikeBack: (likeItem: LikeItem) => void;
  handleSkipLike: (likeId: string) => void;

  // Чаты и диалоги
  chats: ChatConversation[];
  activeChat: ChatConversation | null;
  openChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  totalUnreadCount: number;

  // Настройки
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}
```

---

## 2. Разбор подсистем контекста

### 2.1. Навигация и стек переходов

В отличие от стандартных роутеров, навигация реализована на массиве `history`:
- `navigate(screen, params)` добавляет целевой экран в конец массива `history`, записывает `screenParams` и устанавливает `currentScreen`.
- `goBack()` извлекает верхний элемент стека и возвращает предыдущий экран.
- **Интеллектуальные правила возврата:**
  1. Если пользователь находился в окне диалога (`chat_dialog`), возврат всегда переключает экран на `main` и вкладку `chats`.
  2. Если пользователь возвращается из `profile` или `settings`, он возвращается на `main`.
  3. Если пользователь уже авторизован, возврат блокирует случайный переход назад на экраны `welcome`, `login` или `register`, оставляя пользователя на `main`.

### 2.2. Авторизация и данные пользователя

- `login(email, password)`: проверяет корректность введенного email, объединяет его с дефолтным профилем пользователя (`DEFAULT_CURRENT_USER`), устанавливает `isAuthenticated = true` и перенаправляет на экран `main`.
- `register(userData)`: принимает данные из 3-шаговой формы регистрации (`RegisterScreen`), генерирует уникальный ID пользователя (`user-${Date.now()}`), объединяет профиль и авторизует пользователя.
- `guestLogin()`: мгновенный гостевой вход без ввода учетных данных для быстрого ознакомления с возможностями приложения.
- `logout()`: сбрасывает флаг авторизации и возвращает пользователя на экран приветствия `welcome`.
- `updateUserProfile(data)`: частичное обновление анкеты (имя, город, био, фото, интересы) с немедленным сохранением в стейте.

### 2.3. Механизм свайпов и алгоритм взаимных совпадений

Метод `handleSwipe(direction, profile)` вызывается при завершении жеста или по нажатию кнопок:
1. Индекс текущей карточки `currentCardIndex` увеличивается на 1.
2. При свайпе вправо (`right` — лайк) или вверх (`up` — суперлайк) срабатывает проверка совпадения:
   - Анкеты с ID `'1'` и `'2'` настроены на гарантированный мэтч для демонстрации.
   - Для остальных анкет действует 60% шанс мгновенного взаимного совпадения (`Math.random() > 0.4`).
3. При наступлении совпадения:
   - В стейт помещается `matchedProfile`, вызывая модальное окно `MatchModal`.
   - Проверяется наличие существующего диалога в `chats`. Если его нет, создается новый диалог с персонализированным приветствием.

### 2.4. Управление симпатиями (`LikesScreen`)

- `handleLikeBack(likeItem)`: когда пользователь отвечает взаимностью на симпатию из списка «Все симпатии», элемент помечается как `isMutual = true`. Автоматически создается чат с собеседником, и открывается окно празднования мэтча.
- `handleSkipLike(likeId)`: удаляет анкету из списка симпатий.

### 2.5. Система чатов и реалистичный автоответчик

- `openChat(chatId)`: активирует диалог, сбрасывает счетчик непрочитанных сообщений `unreadCount = 0`, помечает все сообщения в диалоге как прочитанные (`isRead = true`) и осуществляет переход на `chat_dialog`.
- `sendMessage(chatId, text)`:
  1. Создает новое сообщение отправителя `senderId: 'user'`.
  2. Добавляет его в массив `messages` соответствующего чата и обновляет `lastMessage` и время.
  3. **Имитация собеседника:** Через задержку в 1.4 секунды (`setTimeout`) выбирается случайный реалистичный ответ из пула реплик и добавляется в диалог со статусом партнера.

### 2.6. Вычисляемые значения через `useMemo`

- `activeChat`: кэширует объект текущего выбранного диалога по `activeChatId`.
- `totalUnreadCount`: автоматически подсчитывает сумму непрочитанных сообщений во всех чатах для бейджей на нижней панели `BottomNavBar`.

---

## 3. Пользовательский хук `useApp`

Для безопасного доступа к контексту экспортируется хук:

```typescript
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

При попытке вызвать хук вне дерева `AppProvider` генерируется информативное исключение, предотвращающее скрытые ошибки во время рендеринга.
