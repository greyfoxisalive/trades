# Архитектура приложения Steam Trade

## Обзор

Приложение для обмена скинами из Steam между пользователями. Проект построен на принципах Domain-Driven Design (DDD) и использует многослойную архитектуру.

## Доменная модель

### Бизнес-домен

**Steam Trade** - платформа для создания и управления торговыми предложениями между пользователями Steam. Пользователи могут создавать предложения обмена скинами, просматривать предложения от других пользователей, принимать или отклонять их.

### Основные концепции домена

#### Пользователь (User)
- **Описание**: Представляет пользователя системы, аутентифицированного через Steam
- **Ответственность**: 
  - Хранение профильной информации (Steam ID, имя, аватар)
  - Обновление профиля
- **Агрегат**: Является Aggregate Root

#### Торговое предложение (TradeOffer)
- **Описание**: Предложение обмена скинами между двумя пользователями
- **Ответственность**:
  - Управление жизненным циклом предложения (создание, принятие, отклонение, отмена)
  - Валидация бизнес-правил (нельзя создать предложение самому себе, только получатель может принять/отклонить)
  - Хранение списка предметов от отправителя и получателя
- **Агрегат**: Является Aggregate Root
- **Состояния**: PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED

#### Предмет торгового предложения (TradeOfferItem)
- **Описание**: Предмет из инвентаря Steam, включенный в торговое предложение
- **Ответственность**: Хранение информации о предмете (assetId, appId, contextId, amount)
- **Value Object**: Не имеет собственной идентичности

### Value Objects

#### UserId
- Уникальный идентификатор пользователя
- Валидация: не может быть пустым

#### SteamId
- Steam ID пользователя
- Валидация: не может быть пустым

#### TradeOfferId
- Уникальный идентификатор торгового предложения
- Валидация: не может быть пустым

#### TradeOfferStatus
- Статус торгового предложения
- Возможные значения: PENDING, ACCEPTED, DECLINED, CANCELLED, EXPIRED
- Методы: `isPending()`, `isAccepted()`, `canBeModified()`

#### TradeOfferItem
- Предмет в торговом предложении
- Содержит: assetId, appId, contextId, amount
- Валидация: все поля обязательны, amount > 0

## Архитектура

### Слои приложения

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Routes)         │
│  - HTTP endpoints                       │
│  - Request/Response handling            │
│  - DTO mapping                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Application Layer                     │
│  - Application Services                 │
│  - Use cases orchestration              │
│  - Transaction boundaries               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Domain Layer                       │
│  - Entities (Aggregate Roots)           │
│  - Value Objects                        │
│  - Domain Services                      │
│  - Repository Interfaces                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Infrastructure Layer                  │
│  - Repository Implementations           │
│  - External Services                    │
│  - Database Access (Prisma)             │
│  - DI Container                         │
└─────────────────────────────────────────┘
```

### Структура директорий

```
apps/api/src/
├── domain/                          # Доменный слой
│   ├── entities/                    # Агрегаты (Aggregate Roots)
│   │   ├── User.ts
│   │   └── TradeOffer.ts
│   ├── valueObjects/                # Объекты-значения
│   │   ├── UserId.ts
│   │   ├── SteamId.ts
│   │   ├── TradeOfferId.ts
│   │   ├── TradeOfferStatus.ts
│   │   └── TradeOfferItem.ts
│   ├── repositories/                # Интерфейсы репозиториев
│   │   ├── IUserRepository.ts
│   │   └── ITradeOfferRepository.ts
│   └── services/                    # Доменные сервисы
│       └── SteamInventoryService.ts
│
├── application/                     # Слой приложения
│   └── services/                   # Application Services
│       ├── AuthApplicationService.ts
│       ├── TradeOfferApplicationService.ts
│       └── InventoryApplicationService.ts
│
├── infrastructure/                  # Инфраструктурный слой
│   ├── repositories/               # Реализации репозиториев
│   │   ├── UserRepository.ts
│   │   └── TradeOfferRepository.ts
│   └── di/                         # Dependency Injection
│       └── container.ts
│
├── routes/                         # Presentation Layer
│   ├── auth.ts
│   ├── inventory.ts
│   ├── tradeOffers.ts
│   └── users.ts
│
├── middleware/                     # Middleware
│   └── auth.ts
│
└── config/                         # Конфигурация
    └── passport.ts
```

## Детальное описание слоев

### 1. Domain Layer (Доменный слой)

**Ответственность**: Содержит бизнес-логику и правила домена.

#### Entities (Сущности)

**User** - Aggregate Root
```typescript
- create(id, steamId, username, avatar): User
- reconstitute(...): User
- updateProfile(username, avatar): void
- getId(): UserId
- getSteamId(): SteamId
- getUsername(): string
- getAvatar(): string
```

**TradeOffer** - Aggregate Root
```typescript
- create(id, fromUserId, toUserId, itemsFrom, itemsTo): TradeOffer
- reconstitute(...): TradeOffer
- accept(userId): void
- decline(userId): void
- cancel(userId): void
- getId(): TradeOfferId
- getStatus(): TradeOfferStatus
- isOwnedBy(userId): boolean
```

**Бизнес-правила TradeOffer**:
- Нельзя создать предложение самому себе
- Только получатель может принять/отклонить предложение
- Только создатель может отменить предложение
- Можно изменять только предложения со статусом PENDING
- Предложение должно содержать хотя бы один предмет

#### Value Objects

Все Value Objects инкапсулируют валидацию и обеспечивают типобезопасность:
- `UserId`, `SteamId`, `TradeOfferId` - идентификаторы
- `TradeOfferStatus` - статус с методами проверки
- `TradeOfferItem` - предмет с валидацией полей

#### Repository Interfaces

Определяют контракты для работы с данными:
- `IUserRepository` - операции с пользователями
- `ITradeOfferRepository` - операции с торговыми предложениями

### 2. Application Layer (Слой приложения)

**Ответственность**: Оркестрация use cases, координация между доменом и инфраструктурой.

#### Application Services

**AuthApplicationService**
- `handleSteamCallback()` - обработка OAuth callback от Steam
- `generateToken()` - генерация JWT токена
- `verifyToken()` - верификация JWT токена

**TradeOfferApplicationService**
- `createTradeOffer()` - создание нового торгового предложения
- `getTradeOffers()` - получение всех предложений пользователя
- `getTradeOfferById()` - получение предложения по ID
- `acceptTradeOffer()` - принятие предложения
- `declineTradeOffer()` - отклонение предложения

**InventoryApplicationService**
- `getInventory()` - получение инвентаря пользователя из Steam API

### 3. Infrastructure Layer (Инфраструктурный слой)

**Ответственность**: Реализация технических деталей (БД, внешние API).

#### Repositories

**UserRepository** - реализация `IUserRepository`
- Использует Prisma для работы с БД
- Маппинг между доменными сущностями и моделями Prisma
- Обработка автогенерации ID (cuid для User, uuid для TradeOffer)

**TradeOfferRepository** - реализация `ITradeOfferRepository`
- Сохранение агрегата TradeOffer вместе с его элементами
- Загрузка агрегата с полной информацией

#### DI Container

Централизованная конфигурация зависимостей:
- Создание экземпляров репозиториев
- Создание Application Services с инъекцией зависимостей
- Экспорт готовых сервисов для использования в routes

### 4. Presentation Layer (Слой представления)

**Ответственность**: Обработка HTTP запросов, валидация входных данных, маппинг в DTO.

#### Routes

- `/api/auth/*` - аутентификация через Steam
- `/api/inventory/:steamId` - получение инвентаря
- `/api/trade-offers/*` - операции с торговыми предложениями
- `/api/users/*` - операции с пользователями

#### Middleware

- `authMiddleware` - проверка JWT токена, добавление пользователя в request

## Потоки данных

### Создание торгового предложения

```
1. HTTP POST /api/trade-offers
   ↓
2. Route (tradeOffers.ts)
   - Извлечение userId из токена
   - Валидация входных данных
   ↓
3. TradeOfferApplicationService.createTradeOffer()
   - Проверка существования пользователей
   - Создание Value Objects
   ↓
4. TradeOffer.create() (Domain Entity)
   - Валидация бизнес-правил
   - Создание агрегата
   ↓
5. TradeOfferRepository.save()
   - Сохранение в БД через Prisma
   - Маппинг доменной модели в модель БД
   ↓
6. Возврат результата через слои обратно в Route
   - Маппинг доменной модели в DTO
   - HTTP Response
```

### Принятие торгового предложения

```
1. HTTP PUT /api/trade-offers/:id/accept
   ↓
2. Route (tradeOffers.ts)
   - Извлечение userId из токена
   ↓
3. TradeOfferApplicationService.acceptTradeOffer()
   - Загрузка TradeOffer из репозитория
   ↓
4. TradeOffer.accept() (Domain Entity)
   - Проверка прав (только получатель)
   - Проверка статуса (только PENDING)
   - Изменение статуса на ACCEPTED
   ↓
5. TradeOfferRepository.save()
   - Сохранение изменений в БД
   ↓
6. Возврат обновленного предложения
```

## Принципы DDD

### 1. Ubiquitous Language (Единый язык)
- Используются термины домена: TradeOffer, User, SteamId
- Имена классов и методов отражают бизнес-концепции

### 2. Bounded Context (Ограниченный контекст)
- Весь домен находится в одном контексте (Steam Trade)
- Четкие границы между слоями

### 3. Aggregate Roots (Корни агрегатов)
- `User` и `TradeOffer` являются агрегатами
- Доступ к агрегатам только через корни
- Репозитории работают только с агрегатами

### 4. Rich Domain Model (Богатая доменная модель)
- Бизнес-логика находится в доменных сущностях
- Сущности имеют поведение, а не только данные

### 5. Repository Pattern
- Абстракция над хранилищем данных
- Домен не знает о деталях реализации БД

### 6. Value Objects
- Неизменяемые объекты с валидацией
- Определяются по значению, а не по идентичности

## Технологический стек

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite (dev), PostgreSQL (production)
- **Authentication**: Passport.js + Steam OAuth
- **JWT**: jsonwebtoken

## Зависимости между слоями

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓           ↑            ↑
     └──────────────┴───────────┴──────────┘
```

- Presentation зависит от Application
- Application зависит от Domain
- Infrastructure реализует интерфейсы Domain
- Domain не зависит ни от чего (чистый слой)

## Расширяемость

Архитектура позволяет легко:
- Добавлять новые use cases через Application Services
- Изменять реализацию хранилища (замена Prisma)
- Добавлять новые доменные сущности
- Интегрировать внешние сервисы через Infrastructure
- Тестировать доменную логику изолированно

## Следующие шаги

Возможные улучшения:
- Добавить Domain Events для реактивных обновлений
- Реализовать Unit of Work для транзакций
- Добавить Specification Pattern для сложных запросов
- Внедрить CQRS для разделения чтения и записи
- Добавить валидацию через Value Objects на уровне Application
