# Docker Compose для Steam Trade приложения

Этот каталог содержит конфигурацию Docker Compose для развертывания приложения Steam Trade.

## Настройка SSH доступа

Перед развертыванием приложения необходимо настроить SSH доступ к вашему droplet. Подробные инструкции см. в [SSH_SETUP.md](./SSH_SETUP.md).

После настройки SSH вы можете использовать скрипт автоматического деплоя:

```bash
./deploy/deploy.sh [SSH_HOST]
```

Где `SSH_HOST` - это имя хоста из вашего `~/.ssh/config` (по умолчанию `steam-trade-droplet`) или IP адрес droplet.

## Структура

- `docker-compose.yml` - основной файл конфигурации Docker Compose
- `Dockerfile.api` - Dockerfile для API сервера
- `Dockerfile.web` - Dockerfile для веб-приложения
- `nginx.conf` - конфигурация Nginx для проксирования (опционально)
- `nginx-web.conf` - конфигурация Nginx для веб-приложения
- `env.example` - пример файла с переменными окружения
- `ssh-config.example` - пример SSH конфигурации для подключения к droplet
- `SSH_SETUP.md` - подробное руководство по настройке SSH доступа

## Быстрый старт

1. Скопируйте `env.example` в `.env` и заполните необходимые переменные:
   ```bash
   cp env.example .env
   ```

2. Обязательно измените следующие переменные в `.env`:
   - `SESSION_SECRET` - используйте случайную строку для безопасности
   - `POSTGRES_PASSWORD` - надежный пароль для базы данных
   - `STEAM_API_KEY` - ваш Steam API ключ

3. Обновите схему базы данных для PostgreSQL:
   - Откройте `apps/api/prisma/schema.prisma`
   - Измените `provider = "sqlite"` на `provider = "postgresql"`

4. Запустите контейнеры:
   ```bash
   docker-compose up -d
   ```

   Миграции базы данных выполняются автоматически при первом запуске API сервера.

## Сервисы

### PostgreSQL
- Порт: 5432 (по умолчанию)
- База данных: `steam_trade`
- Данные сохраняются в volume `postgres_data`

### API
- Порт: 3001 (по умолчанию)
- Автоматически подключается к PostgreSQL
- Выполняет миграции при первом запуске

### Web
- Порт: 3000 (по умолчанию)
- Статические файлы обслуживаются через Nginx

### Nginx (опционально)
- Порт: 80 (по умолчанию)
- Проксирует запросы к API и Web сервисам
- Можно отключить, если не нужен единый вход

## Команды

### Запуск всех сервисов
```bash
docker-compose up -d
```

### Остановка всех сервисов
```bash
docker-compose down
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api
docker-compose logs -f web
```

### Выполнение команд в контейнере
```bash
# API контейнер
docker-compose exec api pnpm db:push
docker-compose exec api pnpm db:migrate

# PostgreSQL контейнер
docker-compose exec postgres psql -U steam_trade -d steam_trade
```

### Пересборка образов
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Миграции базы данных

Миграции выполняются автоматически при запуске API сервера через entrypoint скрипт.

Для ручного выполнения миграций:

```bash
docker-compose exec api pnpm db:push
```

Или для создания новой миграции:

```bash
docker-compose exec api pnpm db:migrate
```

## Важные замечания

1. **Изменение схемы Prisma**: Перед использованием Docker Compose необходимо изменить `provider` в `schema.prisma` с `sqlite` на `postgresql`.

2. **Переменные окружения**: Обязательно настройте все переменные окружения в `.env` файле, особенно `SESSION_SECRET` и `STEAM_API_KEY`.

3. **Порты**: Убедитесь, что порты 3000, 3001, 5432 и 80 не заняты другими приложениями.

4. **Volumes**: Данные PostgreSQL сохраняются в volume `postgres_data`. При удалении volume данные будут потеряны.

5. **Nginx**: Сервис Nginx опционален. Если вы хотите использовать его, убедитесь, что порт 80 свободен или измените `NGINX_PORT` в `.env`.

## Отключение Nginx

Если вы не хотите использовать Nginx, закомментируйте сервис `nginx` в `docker-compose.yml`:

```yaml
# nginx:
#   ...
```

И измените `FRONTEND_URL` в `.env` на прямой URL веб-приложения.
