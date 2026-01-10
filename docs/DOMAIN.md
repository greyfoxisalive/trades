# Доменная модель Steam Trade

## Обзор домена

**Steam Trade** - домен для управления торговыми предложениями между пользователями Steam. Пользователи могут обмениваться скинами из своих инвентарей через систему торговых предложений.

## Основные концепции

### 1. Пользователь (User)

**Концепция**: Представляет пользователя системы, который аутентифицирован через Steam.

**Атрибуты**:
- `id` (UserId) - уникальный идентификатор в системе
- `steamId` (SteamId) - уникальный Steam ID пользователя
- `username` (string) - имя пользователя
- `avatar` (string) - URL аватара
- `createdAt` (Date) - дата регистрации
- `updatedAt` (Date) - дата последнего обновления

**Поведение**:
- `updateProfile(username, avatar)` - обновление профильной информации

**Инварианты**:
- Username не может быть пустым
- SteamId должен быть уникальным

**Агрегат**: User является Aggregate Root

---

### 2. Торговое предложение (TradeOffer)

**Концепция**: Предложение обмена скинами между двумя пользователями.

**Атрибуты**:
- `id` (TradeOfferId) - уникальный идентификатор предложения
- `fromUserId` (UserId) - пользователь, создавший предложение
- `toUserId` (UserId) - пользователь, которому адресовано предложение
- `status` (TradeOfferStatus) - текущий статус предложения
- `itemsFrom` (TradeOfferItem[]) - предметы от отправителя
- `itemsTo` (TradeOfferItem[]) - предметы от получателя
- `createdAt` (Date) - дата создания
- `updatedAt` (Date) - дата последнего обновления

**Поведение**:
- `accept(userId)` - принятие предложения получателем
- `decline(userId)` - отклонение предложения получателем
- `cancel(userId)` - отмена предложения создателем
- `isOwnedBy(userId)` - проверка принадлежности пользователю

**Инварианты**:
- Нельзя создать предложение самому себе (`fromUserId ≠ toUserId`)
- Предложение должно содержать хотя бы один предмет (в itemsFrom или itemsTo)
- Только получатель может принять/отклонить предложение
- Только создатель может отменить предложение
- Можно изменять только предложения со статусом PENDING

**Состояния (TradeOfferStatus)**:
- `PENDING` - ожидает ответа от получателя
- `ACCEPTED` - принято получателем
- `DECLINED` - отклонено получателем
- `CANCELLED` - отменено создателем
- `EXPIRED` - истекло (будущая функциональность)

**Переходы состояний**:
```
PENDING → ACCEPTED (через accept())
PENDING → DECLINED (через decline())
PENDING → CANCELLED (через cancel())
PENDING → EXPIRED (автоматически, будущая функциональность)
```

**Агрегат**: TradeOffer является Aggregate Root, содержит TradeOfferItem как часть агрегата

---

### 3. Предмет торгового предложения (TradeOfferItem)

**Концепция**: Предмет из инвентаря Steam, включенный в торговое предложение.

**Атрибуты**:
- `assetId` (string) - уникальный идентификатор предмета в Steam
- `appId` (number) - ID приложения Steam (730 для CS:GO)
- `contextId` (string) - контекст предмета
- `amount` (number) - количество предметов

**Инварианты**:
- assetId не может быть пустым
- appId должен быть положительным числом
- contextId не может быть пустым
- amount должен быть положительным числом

**Value Object**: TradeOfferItem является Value Object, не имеет собственной идентичности

---

## Value Objects

### UserId
- **Тип**: Value Object
- **Значение**: string (cuid)
- **Валидация**: не может быть пустым
- **Методы**: `getValue()`, `equals()`, `toString()`

### SteamId
- **Тип**: Value Object
- **Значение**: string (Steam ID64)
- **Валидация**: не может быть пустым
- **Методы**: `getValue()`, `equals()`, `toString()`

### TradeOfferId
- **Тип**: Value Object
- **Значение**: string (uuid)
- **Валидация**: не может быть пустым
- **Методы**: `getValue()`, `equals()`, `toString()`

### TradeOfferStatus
- **Тип**: Value Object (Enum-based)
- **Возможные значения**: PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED
- **Методы**:
  - `isPending()` - проверка статуса PENDING
  - `isAccepted()` - проверка статуса ACCEPTED
  - `isDeclined()` - проверка статуса DECLINED
  - `canBeModified()` - можно ли изменять предложение
  - `equals()` - сравнение статусов
  - `toString()` - строковое представление

### TradeOfferItem
- **Тип**: Value Object
- **Атрибуты**: assetId, appId, contextId, amount
- **Валидация**: все поля обязательны и валидны
- **Методы**: геттеры для всех атрибутов, `equals()`

---

## Бизнес-правила

### Правила создания торгового предложения

1. **Правило уникальности отправителя и получателя**
   - Отправитель и получатель должны быть разными пользователями
   - Нарушение: `Cannot create trade offer to yourself`

2. **Правило наличия предметов**
   - Предложение должно содержать хотя бы один предмет
   - Предметы могут быть только от отправителя, только от получателя, или от обоих
   - Нарушение: `Trade offer must have at least one item`

3. **Правило существования пользователей**
   - Оба пользователя (отправитель и получатель) должны существовать в системе
   - Нарушение: `From user not found` или `To user not found`

### Правила изменения торгового предложения

1. **Правило прав на принятие/отклонение**
   - Только получатель может принять или отклонить предложение
   - Нарушение: `Only the recipient can accept/decline a trade offer`

2. **Правило прав на отмену**
   - Только создатель может отменить предложение
   - Нарушение: `Only the creator can cancel a trade offer`

3. **Правило статуса для изменений**
   - Можно изменять только предложения со статусом PENDING
   - Нарушение: `Cannot accept/decline/cancel trade offer with status: <status>`

### Правила работы с пользователями

1. **Правило уникальности Steam ID**
   - Каждый Steam ID может быть связан только с одним пользователем
   - При повторной аутентификации обновляется существующий профиль

2. **Правило валидности имени**
   - Имя пользователя не может быть пустым
   - Нарушение: `Username cannot be empty`

---

## Агрегаты

### User Aggregate

**Корень агрегата**: User

**Границы агрегата**:
- User содержит только свои собственные данные
- Связи с TradeOffer хранятся через ID (не как часть агрегата)

**Правила консистентности**:
- При обновлении профиля обновляется `updatedAt`
- SteamId остается неизменным после создания

### TradeOffer Aggregate

**Корень агрегата**: TradeOffer

**Границы агрегата**:
- TradeOffer содержит TradeOfferItem как часть агрегата
- User не является частью агрегата (хранится только UserId)

**Правила консистентности**:
- При изменении статуса обновляется `updatedAt`
- Все TradeOfferItem должны принадлежать одному TradeOffer
- При удалении TradeOffer удаляются все связанные TradeOfferItem (CASCADE)

---

## Доменные сервисы

### SteamInventoryService

**Назначение**: Получение инвентаря пользователя из внешнего API Steam.

**Ответственность**:
- Запрос к Steam Community API
- Парсинг ответа API
- Фильтрация только торговых предметов (`tradable === 1`)
- Преобразование в доменные объекты

**Интерфейс**:
```typescript
getInventory(steamId: string, appId?: number, contextId?: number): Promise<SteamInventoryItem[]>
```

---

## Словарь домена (Ubiquitous Language)

| Термин | Определение |
|--------|-------------|
| **User** | Пользователь системы, аутентифицированный через Steam |
| **TradeOffer** | Торговое предложение между двумя пользователями |
| **TradeOfferItem** | Предмет из инвентаря Steam, включенный в предложение |
| **Accept** | Действие получателя по принятию предложения |
| **Decline** | Действие получателя по отклонению предложения |
| **Cancel** | Действие создателя по отмене предложения |
| **Pending** | Статус предложения, ожидающего ответа |
| **SteamId** | Уникальный идентификатор пользователя в Steam |
| **Inventory** | Коллекция предметов пользователя в Steam |
| **AssetId** | Уникальный идентификатор предмета в Steam |

---

## Примеры использования

### Создание торгового предложения

```typescript
// 1. Создание Value Objects
const fromUserId = UserId.create("user-123")
const toUserId = UserId.create("user-456")
const tradeOfferId = TradeOfferId.create("offer-789")

// 2. Создание предметов
const itemsFrom = [
  TradeOfferItem.create("asset-1", 730, "2", 1),
  TradeOfferItem.create("asset-2", 730, "2", 1)
]
const itemsTo = [
  TradeOfferItem.create("asset-3", 730, "2", 1)
]

// 3. Создание агрегата
const tradeOffer = TradeOffer.create(
  tradeOfferId,
  fromUserId,
  toUserId,
  itemsFrom,
  itemsTo
)
// Статус автоматически устанавливается в PENDING
```

### Принятие торгового предложения

```typescript
// 1. Загрузка предложения
const tradeOffer = await tradeOfferRepository.findById(tradeOfferId)

// 2. Проверка прав и принятие
const recipientId = UserId.create("user-456")
tradeOffer.accept(recipientId) // Изменяет статус на ACCEPTED

// 3. Сохранение изменений
await tradeOfferRepository.save(tradeOffer)
```

### Обновление профиля пользователя

```typescript
// 1. Загрузка пользователя
const user = await userRepository.findBySteamId(steamId)

// 2. Обновление профиля
user.updateProfile("NewUsername", "https://avatar.url")

// 3. Сохранение
await userRepository.save(user)
```

---

## Ограничения и будущие улучшения

### Текущие ограничения

1. Нет автоматического истечения предложений (EXPIRED статус не используется)
2. Нет уведомлений о новых предложениях
3. Нет истории изменений предложений
4. Нет возможности редактировать предложение после создания

### Потенциальные улучшения

1. **Domain Events**: Добавить события для реактивных обновлений
   - `TradeOfferCreated`
   - `TradeOfferAccepted`
   - `TradeOfferDeclined`

2. **Expiration**: Автоматическое истечение предложений через определенное время

3. **Counter-offers**: Возможность создания встречных предложений

4. **Trade History**: История всех торговых операций пользователя

5. **Notifications**: Уведомления о новых предложениях и изменениях статуса
