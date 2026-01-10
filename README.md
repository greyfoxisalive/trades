# Steam Skins Trade WebApp

Веб-приложение для мобильных устройств для обмена скинов из Steam.

## Структура проекта

Монорепозиторий с использованием pnpm workspaces:

- `apps/web` - Frontend приложение (React + Vite)
- `apps/api` - Backend приложение (Express.js)
- `packages/ui` - shadcn/ui компоненты
- `packages/shared` - Общие типы и утилиты
- `packages/config` - Общие конфигурации

## Технологии

**Frontend:**
- React 18 + TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- React Router
- TanStack Query

**Backend:**
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- Steam API

## Установка

```bash
pnpm install
```

## Настройка

### Backend

1. Создайте файл `apps/api/.env` на основе `apps/api/.env.example`
2. Настройте переменные окружения:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `STEAM_API_KEY` - ваш Steam API ключ (получить можно на https://steamcommunity.com/dev/apikey)
   - `JWT_SECRET` - секретный ключ для JWT токенов
   - `SESSION_SECRET` - секретный ключ для сессий
   - `FRONTEND_URL` - URL frontend приложения (по умолчанию http://localhost:3000)
   - `BACKEND_URL` - URL backend приложения (по умолчанию http://localhost:3001)

3. Инициализируйте базу данных:
```bash
cd apps/api
pnpm db:generate
pnpm db:push
```

### Frontend

Frontend автоматически проксирует запросы к backend через Vite proxy.

## Архитектура

Проект построен на принципах **Domain-Driven Design (DDD)** с четким разделением на слои:

- **Domain Layer** - доменная модель с бизнес-логикой
- **Application Layer** - use cases и оркестрация
- **Infrastructure Layer** - реализация репозиториев и внешних сервисов
- **Presentation Layer** - HTTP endpoints и обработка запросов

Подробное описание архитектуры и доменной модели:
- [Архитектура приложения](./docs/ARCHITECTURE.md)
- [Доменная модель](./docs/DOMAIN.md)

## Разработка

```bash
# Запуск всех приложений
pnpm dev

# Запуск только frontend
pnpm --filter web dev

# Запуск только backend
pnpm --filter api dev
```

## Сборка

```bash
pnpm build
```

## Использование

1. Запустите backend и frontend приложения
2. Откройте браузер на http://localhost:3000
3. Войдите через Steam
4. Создайте обмен, выбрав предметы из вашего инвентаря и инвентаря получателя
