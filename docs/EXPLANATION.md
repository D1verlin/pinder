# Руководство и технический разбор кодовой базы Pinder

В проекте подготовлен полный комплект подробной документации, объясняющей устройство каждого модуля, компонента, экрана и потока данных:

### 📚 Оглавление документации:
1. **[Архитектура и потоки данных](docs/ARCHITECTURE.md)** — общая схема приложения, организация папок, принципы чистого разделения ответственности и дизайн-система.
2. **[Управление состоянием и Context API](docs/STATE_MANAGEMENT.md)** — детальный разбор `AppContext.tsx`, навигации, свайпов, генерации пар и автоответчика.
3. **[Обзор и логика всех 9 экранов](docs/SCREENS.md)** — разбор `WelcomeScreen`, `LoginScreen`, `RegisterScreen`, `FeedScreen`, `LikesScreen`, `ChatsScreen`, `ChatDialogScreen`, `ProfileScreen`, `SettingsScreen`.
4. **[Библиотека компонентов и UI-Kit](docs/COMPONENTS_AND_UIKIT.md)** — атомарные кирпичики (`Button`, `Input`, `Slider`, `Switch`, `Badge`, `Avatar`) и составные компоненты (`Card`, `ActionButtons`, `Header`, `MatchModal`).
5. **[Анимации и обработка жестов](docs/ANIMATIONS_AND_GESTURES.md)** — математика `PanResponder`, интерполяции углов наклона, штампы лайка/дизлайка и пружинные анимации `Animated.spring`.
6. **[Модели данных TypeScript и утилиты](docs/DATA_MODELS_AND_UTILS.md)** — интерфейсы типов `Profile`, `User`, `Message`, мок-наборы и нативный выбор фото `imagePicker`.

---

# Построчный разбор главного экрана: `src/screens/FeedScreen.tsx`

Этот раздел написан максимально просто и понятно. Никаких заумных терминов без объяснений — только суть: что делает каждая строчка, зачем она нужна и как всё это работает вместе.

---

## 1. Импорты (Строки 1–18)

Здесь мы «приглашаем на вечеринку» готовые инструменты из React, React Native и наших собственных файлов, чтобы не писать всё с нуля.

```typescript
1: import React, { useState, useRef } from 'react';
```
- `React` — фундамент, на котором строится всё приложение.
- `useState` — коробка для хранения данных, которые могут меняться (например, номер текущей карточки или активная вкладка). Когда данные в коробке меняются, экран автоматически перерисовывается.
- `useRef` — сейф, который хранит значение между перерисовками экрана и не заставляет экран перерисовываться при каждом чихе. Отлично подходит для анимаций и жестов.

```typescript
2: import {
3:   View,
4:   StyleSheet,
5:   SafeAreaView,
6:   StatusBar,
7:   Animated,
8:   PanResponder,
9:   Dimensions,
10:   Text,
11:   TouchableOpacity,
12: } from 'react-native';
```
Базовые кирпичики мобильного интерфейса:
- `View` — невидимый прямоугольный контейнер (аналог `<div>` в вебе). В него заворачивают другие элементы.
- `StyleSheet` — инструмент для создания стилей (цвета, размеры, отступы).
- `SafeAreaView` — умный экран, который не дает контенту залезть под чёлку iPhone, камеру или нижнюю полоску домой.
- `StatusBar` — верхняя полоска телефона с часами, батареей и Wi-Fi.
- `Animated` — мощный движок для плавных анимаций (движение, поворот, прозрачность).
- `PanResponder` — «радар для пальца». Следит за тем, куда пользователь ткнул пальцем и куда его тащит по экрану.
- `Dimensions` — линейка, которая измеряет ширину и высоту экрана конкретного смартфона.
- `Text` — компонент для отображения букв и слов.
- `TouchableOpacity` — кнопка, которая приятно полупрозрачно моргает при нажатии.

```typescript
13: import { Header } from '../components/Header';
14: import { Card } from '../components/Card';
15: import { ActionButtons } from '../components/ActionButtons';
16: import { BottomNavBar } from '../components/BottomNavBar';
17: import { MOCK_PROFILES } from '../data/mockProfiles';
18: import { TabType } from '../types/profile';
```
Подключаем наши собственные детали:
- `Header` — верхняя панель (профиль, логотип pinder, фильтры).
- `Card` — сама карточка с фото Саши, возрастом и описанием.
- `ActionButtons` — круглые кнопки снизу (крестик, звезда, сердце).
- `BottomNavBar` — нижние вкладки («Лента», «Симпатии», «Чаты»).
- `MOCK_PROFILES` — список анкет с данными и фотографиями.
- `TabType` — описание допустимых названий вкладок для проверки типов TypeScript.

---

## 2. Глобальные константы (Строки 20–21)

```typescript
20: const { width: SCREEN_WIDTH } = Dimensions.get('window');
```
- Измеряем точную ширину экрана смартфона в пикселях и сохраняем в переменную `SCREEN_WIDTH`. Например, на iPhone это может быть `390`.

```typescript
21: const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
```
- Порог срабатывания свайпа. Если вы сдвинули карточку хотя бы на 25% от ширины экрана (четверть экрана), она улетит. Если сдвинули меньше и отпустили палец — вернется обратно в центр на пружинке.

---

## 3. Объявление компонента и его состояния (Строки 23–28)

```typescript
23: export const FeedScreen: React.FC = () => {
```
- Объявляем наш главный экран `FeedScreen` как функциональный компонент React.

```typescript
24:   const [profiles, setProfiles] = useState(MOCK_PROFILES);
```
- Создаем состояние со списком пользователей. Изначально в него загружаются анкеты из файла `mockProfiles`.

```typescript
25:   const [currentIndex, setCurrentIndex] = useState(0);
```
- Индекс активной карточки. `0` означает, что мы показываем самую первую девушку из списка (Сашу). Когда свайпаем, индекс станет `1`, затем `2` и так далее.

```typescript
26:   const [activeTab, setActiveTab] = useState<TabType>('feed');
```
- Запоминаем, какая вкладка снизу выбрана прямо сейчас. По умолчанию — `'feed'` («Лента»).

```typescript
28:   const position = useRef(new Animated.ValueXY()).current;
```
- Создаем пару координат `(x, y)` в виде анимированного значения. Когда палец двигает карточку, мы меняем этот `position`, и карточка мгновенно смещается следом за пальцем.

---

## 4. Магия интерполяции: вращение, штампы и масштабирование (Строки 30–65)

Интерполяция — это перевод одних чисел в другие. Например: «если палец сдвинулся на 100 пикселей вправо, поверни карточку на 5 градусов».

```typescript
30:   const rotate = position.x.interpolate({
31:     inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
32:     outputRange: ['-16deg', '0deg', '16deg'],
33:     extrapolate: 'clamp',
34:   });
```
- Когда тащим карточку влево — наклоняем её до -16 градусов.
- В центре — 0 градусов (ровно).
- Когда тащим вправо — наклоняем вправо до +16 градусов.
- `clamp` гарантирует, что даже если дернуть карточку со всей силы, угол не превысит 16 градусов.

```typescript
36:   const rotateAndTranslate = {
37:     transform: [
38:       { rotate },
39:       ...position.getTranslateTransform(),
40:     ],
41:   };
```
- Объединяем поворот (`rotate`) и смещение по координатам `x` и `y` в один объект трансформации для карточки.

```typescript
43:   const likeOpacity = position.x.interpolate({
44:     inputRange: [15, SCREEN_WIDTH / 3],
45:     outputRange: [0, 1],
46:     extrapolate: 'clamp',
47:   });
```
- Прозрачность зеленого штампа «LIKE». Если тянем вправо, он плавно проявляется от 0 (невидим) до 1 (полностью виден).

```typescript
49:   const nopeOpacity = position.x.interpolate({
50:     inputRange: [-SCREEN_WIDTH / 3, -15],
51:     outputRange: [1, 0],
52:     extrapolate: 'clamp',
53:   });
```
- Прозрачность красного штампа «NOPE». Плавно появляется, когда мы тянем карточку влево (дизлайк).

```typescript
55:   const nextCardScale = position.x.interpolate({
56:     inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
57:     outputRange: [1, 0.96, 1],
58:     extrapolate: 'clamp',
59:   });
```
- Анимация для *следующей* карточки под текущей. Когда верхняя карточка на месте, нижняя чуть уменьшена (размер 0.96). Как только мы начинаем смахивать верхнюю, нижняя увеличивается до полного размера `1`.

```typescript
61:   const nextCardOpacity = position.x.interpolate({
62:     inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
63:     outputRange: [1, 0.7, 1],
64:     extrapolate: 'clamp',
65:   });
```
- Прозрачность следующей карточки: изначально она немного приглушена (0.7), а при свайпе становится яркой (1.0).

---

## 5. Вылет карточки и пружинный возврат (Строки 67–90)

```typescript
67:   const forceSwipe = (direction: 'right' | 'left' | 'up') => {
68:     const toX = direction === 'right' ? SCREEN_WIDTH + 100 : direction === 'left' ? -SCREEN_WIDTH - 100 : 0;
69:     const toY = direction === 'up' ? -SCREEN_WIDTH * 1.5 : 0;
```
- Функция принудительного вылета карточки за пределы экрана. Вызывается либо при быстром свайпе пальцем, либо по клику на кнопки снизу.
- Если `'right'` — карточка летит далеко вправо (`+100` пикселей за экран).
- Если `'left'` — летит влево (`-100` пикселей за левый край).
- Если `'up'` — летит высоко вверх (суперлайк).

```typescript
71:     Animated.timing(position, {
72:       toValue: { x: toX, y: toY },
73:       duration: 250,
74:       useNativeDriver: false,
75:     }).start(() => onSwipeComplete());
76:   };
```
- За 250 миллисекунд (четверть секунды) плавно отправляем карточку в заданную точку. Когда она скрылась с глаз, вызываем `onSwipeComplete`.

```typescript
78:   const onSwipeComplete = () => {
79:     position.setValue({ x: 0, y: 0 });
80:     setCurrentIndex((prev) => prev + 1);
81:   };
```
- Сбрасываем позицию новой карточки обратно в центр `(0, 0)`.
- Увеличиваем индекс на 1, переходя к следующей анкете.

```typescript
83:   const resetPosition = () => {
84:     Animated.spring(position, {
85:       toValue: { x: 0, y: 0 },
86:       friction: 5,
87:       tension: 40,
88:       useNativeDriver: false,
89:     }).start();
90:   };
```
- Если пользователь потянул карточку, но передумал и отпустил палец слишком близко к центру, запускаем физическую пружинную анимацию (`Animated.spring`), которая пружинисто возвращает карточку в середину экрана.

---

## 6. Жесты пальцем — PanResponder (Строки 92–110)

```typescript
92:   const panResponder = useRef(
93:     PanResponder.create({
```
- Создаем обработчик жестов с помощью `PanResponder`.

```typescript
94:       onStartShouldSetPanResponder: () => true,
```
- Сообщаем системе: «Да, этот компонент хочет слушать прикосновения пальца».

```typescript
95:       onPanResponderMove: (_, gestureState) => {
96:         position.setValue({ x: gestureState.dx, y: gestureState.dy });
97:       },
```
- Пока палец движется по стеклу экрана, передаем смещение `gestureState.dx` (по горизонтали) и `gestureState.dy` (по вертикали) прямо в наш `position`. Карточка послушно едет за пальцем.

```typescript
98:       onPanResponderRelease: (_, gestureState) => {
99:         if (gestureState.dx > SWIPE_THRESHOLD) {
100:           forceSwipe('right');
101:         } else if (gestureState.dx < -SWIPE_THRESHOLD) {
102:           forceSwipe('left');
103:         } else if (gestureState.dy < -SWIPE_THRESHOLD) {
104:           forceSwipe('up');
105:         } else {
106:           resetPosition();
107:         }
108:       },
109:     })
110:   ).current;
```
- Когда палец оторвался от экрана:
  - Если протащили вправо больше порога — засчитываем лайк и уносим карточку вправо.
  - Если влево — уносим влево.
  - Если вверх — суперлайк.
  - Если никуда далеко не утащили — пружиним карточку обратно на место (`resetPosition()`).

---

## 7. Подготовка текущей и следующей анкеты (Строки 112–117)

```typescript
112:   const currentProfile = profiles[currentIndex];
113:   const nextProfile = profiles[currentIndex + 1];
```
- `currentProfile` — анкета, которую юзер видит прямо сейчас на первом плане.
- `nextProfile` — анкета, которая уже лежит под ней и ждет своей очереди.

```typescript
115:   const handleResetCards = () => {
116:     setCurrentIndex(0);
117:   };
```
- Функция для кнопки «Начать сначала», когда все анкеты кончились — просто сбрасывает счетчик на 0.

---

## 8. Верстка интерфейса JSX (Строки 119–181)

```typescript
119:   return (
120:     <SafeAreaView style={styles.safeArea}>
```
- Открываем безопасную область экрана с фоновым бежевым цветом.

```typescript
121:       <StatusBar barStyle="dark-content" backgroundColor="#F6EFEA" />
```
- Делаем иконки времени и батареи в статус-баре темными (ведь фон у нас светлый).

```typescript
123:       <Header
124:         onProfilePress={() => {}}
125:         onFilterPress={() => {}}
126:       />
```
- Рисуем верхнюю шапку с логотипом `pinder`, кнопкой профиля и кнопкой фильтров.

```typescript
128:       <View style={styles.deckContainer}>
129:         {currentProfile ? (
130:           <>
```
- Контейнер колоды карточек. Проверяем: «Есть ли еще анкеты?». Если да — показываем карточки.

```typescript
131:             {nextProfile && (
132:               <Animated.View
133:                 style={[
134:                   styles.cardWrapper,
135:                   styles.nextCardWrapper,
136:                   {
137:                     transform: [{ scale: nextCardScale }],
138:                     opacity: nextCardOpacity,
139:                   },
140:                 ]}
141:               >
142:                 <Card profile={nextProfile} />
143:               </Animated.View>
144:             )}
```
- Фоновая карточка: если есть следующий профиль, рендерим его позади активной карточки со специальной анимацией масштабирования и прозрачности.

```typescript
146:             <Animated.View
147:               {...panResponder.panHandlers}
148:               style={[styles.cardWrapper, rotateAndTranslate]}
149:             >
150:               <Card
151:                 profile={currentProfile}
152:                 likeOpacity={likeOpacity}
153:                 nopeOpacity={nopeOpacity}
154:               />
155:             </Animated.View>
156:           </>
```
- Передняя карточка: к ней привязаны обработчики касания пальцем (`panHandlers`) и стили вращения со смещением (`rotateAndTranslate`). Внутрь передаем штампы лайка и дизлайка.

```typescript
157:         ) : (
158:           <View style={styles.emptyContainer}>
159:             <Text style={styles.emptyTitle}>Анкеты закончились</Text>
160:             <Text style={styles.emptySubtitle}>Загляните позже или сбросьте список</Text>
161:             <TouchableOpacity style={styles.resetButton} onPress={handleResetCards}>
162:               <Text style={styles.resetButtonText}>Начать сначала</Text>
163:             </TouchableOpacity>
164:           </View>
165:         )}
166:       </View>
```
- Если анкеты закончились — показываем аккуратную заглушку с кнопкой «Начать сначала».

```typescript
168:       <ActionButtons
169:         onDislike={() => forceSwipe('left')}
170:         onSuperlike={() => forceSwipe('up')}
171:         onLike={() => forceSwipe('right')}
172:         disabled={!currentProfile}
173:       />
```
- Три круглые кнопки действий:
  - Крестик вызывает свайп влево.
  - Звезда вызывает свайп вверх.
  - Сердце вызывает свайп вправо.
  - Если анкет нет — кнопки неактивны (`disabled`).

```typescript
175:       <BottomNavBar
176:         activeTab={activeTab}
177:         onTabChange={(tab) => setActiveTab(tab)}
178:       />
179:     </SafeAreaView>
180:   );
181: };
```
- Нижняя панель навигации («Лента», «Симпатии», «Чаты»). При нажатии на любую вкладку обновляется состояние `activeTab`.

---

## 9. Стилизация экрана (Строки 183–230)

```typescript
184:   safeArea: {
185:     flex: 1,
186:     backgroundColor: '#F6EFEA',
187:   },
```
- Растягиваем экран на всю доступную высоту (`flex: 1`) и заливаем фирменным теплым бежевым цветом `#F6EFEA`.

```typescript
188:   deckContainer: {
189:     flex: 1,
190:     justifyContent: 'center',
191:     alignItems: 'center',
192:     position: 'relative',
193:   },
```
- Центрируем карточки ровно посередине свободного пространства между шапкой и кнопками.

```typescript
194:   cardWrapper: {
195:     position: 'absolute',
196:   },
```
- Накладываем карточки друг на друга слоями в одной и той же точке (как настоящую колоду карт).

```typescript
197:   nextCardWrapper: {
198:     zIndex: -1,
199:   },
```
- Гарантируем, что следующая карточка лежит *под* верхней (`zIndex: -1`).

```typescript
200:   emptyContainer: {
201:     flex: 1,
202:     justifyContent: 'center',
203:     alignItems: 'center',
204:     paddingHorizontal: 32,
205:   },
206:   emptyTitle: {
207:     fontSize: 22,
208:     fontWeight: '700',
209:     color: '#333333',
210:     marginBottom: 8,
211:   },
212:   emptySubtitle: {
213:     fontSize: 15,
214:     color: '#777777',
215:     textAlign: 'center',
216:     marginBottom: 20,
217:   },
218:   resetButton: {
219:     backgroundColor: '#FF5757',
220:     paddingHorizontal: 24,
221:     paddingVertical: 12,
222:     borderRadius: 24,
223:   },
224:   resetButtonText: {
225:     color: '#FFFFFF',
226:     fontWeight: '700',
227:     fontSize: 15,
228:   },
```
- Стили для экрана с сообщением «Анкеты закончились» и коралловой кнопкой сброса.
