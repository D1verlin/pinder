# Анимации и жесты (`PanResponder` и `Animated`)

В Pinder реализована отзывчивая физика взаимодействия с интерфейсом. Пользователь физически ощущает вес и упругость элементов благодаря связке `PanResponder` и `Animated`.

---

## 1. Механика свайпов карточек в `FeedScreen.tsx`

### 1.1. Жизненный цикл `PanResponder`

Обработчик жестов перехватывает касания пальцем поверхности карточки:

```typescript
const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gestureState) => {
      const clampedY =
        gestureState.dy > 0
          ? Math.min(gestureState.dy * 0.15, 25)
          : gestureState.dy;
      position.setValue({ x: gestureState.dx, y: clampedY });
    },

    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else if (gestureState.dy < -SWIPE_THRESHOLD) {
        forceSwipe('up');
      } else {
        resetPosition();
      }
    },
  })
).current;
```

### 1.2. Ограничение движения вниз (Rubber-band Resistance)
Обычные реализации свайпов позволяют утянуть карточку вниз под нижнее меню или за пределы экрана, что ломает верстку. В Pinder применено резиновое сопротивление:
- Если палец движется вниз (`gestureState.dy > 0`), смещение умножается на понижающий коэффициент `0.15` и ограничивается максимумом в 25 пикселей (`Math.min(dy * 0.15, 25)`).
- Карточка слегка прогибается вниз, сигнализируя об упоре, но не сдвигается с экрана.

### 1.3. Порог срабатывания свайпа (`SWIPE_THRESHOLD`)
- Порог вычисляется как 25% от ширины экрана (`0.25 * SCREEN_WIDTH`).
- Если пользователь сместил карточку больше чем на четверть экрана и оторвал палец — карточка улетает за пределы видимости (`forceSwipe`).
- Если карточку сместили меньше порога — запускается пружинный возврат в центр (`resetPosition`).

---

## 2. Математика интерполяций

Все трансформации карточки вычисляются непрерывно на основе координаты `position.x`:

### 2.1. Вращение карточки (`rotate`)
```typescript
const rotate = position.x.interpolate({
  inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
  outputRange: ['-16deg', '0deg', '16deg'],
  extrapolate: 'clamp',
});
```
- Смещение влево наклоняет карточку против часовой стрелки (до -16°).
- В центре угол равен 0°.
- Смещение вправо наклоняет по часовой стрелке (до +16°).
- Флаг `clamp` гарантирует, что даже при резком рывке угол не превысит предельные значения.

### 2.2. Плавное проявление штампов (LIKE и NOPE)
- **Зеленый штамп «LIKE»:**
  ```typescript
  const likeOpacity = position.x.interpolate({
    inputRange: [15, SCREEN_WIDTH / 3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  ```
  При смещении вправо штамп плавно проявляется от 0 (невидим) до 1 (полная видимость при сдвиге на треть экрана).
- **Красный штамп «NOPE»:**
  ```typescript
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 3, -15],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  ```
  Проявляется зеркально при движении карточки влево.

### 2.3. Масштабирование и прозрачность фоновой карточки
Чтобы колода выглядела объемной, следующая карточка под верхней анимируется синхронно:
```typescript
const nextCardScale = position.x.interpolate({
  inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
  outputRange: [1, 0.96, 1],
  extrapolate: 'clamp',
});

const nextCardOpacity = position.x.interpolate({
  inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
  outputRange: [1, 0.75, 1],
  extrapolate: 'clamp',
});
```
Когда верхняя карточка на месте, нижняя уменьшена до 96% и приглушена до 75% яркости. По мере сдвига верхней карточки нижняя плавно «всплывает» на передний план: увеличивается до 100% и становится полностью непрозрачной.

---

## 3. Физика пружин (`Animated.spring`)

При отмене свайпа карточка возвращается в центр с физикой естественной пружины:

```typescript
const resetPosition = () => {
  Animated.spring(position, {
    toValue: { x: 0, y: 0 },
    friction: 5,   // Сила трения (отвечает за количество колебаний)
    tension: 40,   // Натяжение пружины (скорость возврата)
    useNativeDriver: false,
  }).start();
};
```

---

## 4. Анимация в модальном окне мэтча (`MatchModal.tsx`)

В центре модального окна совпадения расположено анимированное сердце, пульсирующее при открытии:
- Используется составная анимация `Animated.sequence`:
  1. Резкий пружинный рывок от `scale: 0` до `scale: 1.25`.
  2. Плавный откат к нормальному размеру `scale: 1.0`.
- Это создает эмоциональный акцент взаимной симпатии.

---

## 5. Анимация смены экранов (`ScreenTransition.tsx`)

При смене `currentScreen` запускаются три параллельные анимации:

```typescript
Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }),
  Animated.spring(translateAnim, {
    toValue: 0,
    friction: 8,
    tension: 80,
    useNativeDriver: true,
  }),
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 8,
    tension: 80,
    useNativeDriver: true,
  }),
]).start();
```

Использование `useNativeDriver: true` переносит выполнение анимации переходов в нативный поток UI, предотвращая просадки кадров.
