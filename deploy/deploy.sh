#!/bin/bash

# Скрипт для деплоя приложения на DigitalOcean Droplet
# Использование: ./deploy.sh [SSH_HOST]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
SSH_HOST=${1:-steam-trade-droplet}
REMOTE_DIR="/root/steam-trade"

echo -e "${GREEN}🚀 Начало деплоя на ${SSH_HOST}${NC}"

# Проверка подключения
echo -e "${YELLOW}Проверка SSH подключения...${NC}"
if ! ssh -o ConnectTimeout=5 "$SSH_HOST" "echo 'SSH connection OK'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не удается подключиться к ${SSH_HOST}${NC}"
    echo -e "${YELLOW}Убедитесь, что:${NC}"
    echo "  1. SSH ключ настроен правильно"
    echo "  2. Droplet запущен и доступен"
    echo "  3. Firewall разрешает SSH подключения"
    echo ""
    echo "См. SSH_SETUP.md для подробных инструкций"
    exit 1
fi

echo -e "${GREEN}✓ SSH подключение установлено${NC}"

# Создание директории на сервере
echo -e "${YELLOW}Создание директории на сервере...${NC}"
ssh "$SSH_HOST" "mkdir -p $REMOTE_DIR"

# Копирование файлов
echo -e "${YELLOW}Копирование файлов...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' \
    --exclude '*.db' --exclude '*.db-journal' \
    --exclude '.env' \
    ./ "$SSH_HOST:$REMOTE_DIR/"

# Копирование только deploy директории (если запускаем из корня проекта)
if [ -d "deploy" ]; then
    echo -e "${YELLOW}Копирование конфигурации деплоя...${NC}"
    rsync -avz deploy/ "$SSH_HOST:$REMOTE_DIR/deploy/"
fi

# Проверка наличия .env файла
echo -e "${YELLOW}Проверка переменных окружения...${NC}"
if ! ssh "$SSH_HOST" "test -f $REMOTE_DIR/deploy/.env"; then
    echo -e "${YELLOW}⚠️  Файл .env не найден на сервере${NC}"
    echo -e "${YELLOW}Создайте файл .env на сервере или скопируйте его:${NC}"
    echo "  scp deploy/.env $SSH_HOST:$REMOTE_DIR/deploy/.env"
    read -p "Продолжить без .env файла? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Установка Docker и Docker Compose (если нужно)
echo -e "${YELLOW}Проверка Docker...${NC}"
if ! ssh "$SSH_HOST" "command -v docker" > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker не установлен. Установка Docker...${NC}"
    ssh "$SSH_HOST" << 'EOF'
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        systemctl enable docker
        systemctl start docker
EOF
fi

if ! ssh "$SSH_HOST" "command -v docker-compose" > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker Compose не установлен. Установка Docker Compose...${NC}"
    ssh "$SSH_HOST" << 'EOF'
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
EOF
fi

echo -e "${GREEN}✓ Docker готов${NC}"

# Запуск Docker Compose
echo -e "${YELLOW}Запуск Docker Compose...${NC}"
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR/deploy
    docker-compose down || true
    docker-compose pull || true
    docker-compose build --no-cache
    docker-compose up -d
EOF

# Проверка статуса
echo -e "${YELLOW}Проверка статуса контейнеров...${NC}"
ssh "$SSH_HOST" "cd $REMOTE_DIR/deploy && docker-compose ps"

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
echo -e "${GREEN}Полезные команды:${NC}"
echo "  Просмотр логов: ssh $SSH_HOST 'cd $REMOTE_DIR/deploy && docker-compose logs -f'"
echo "  Остановка:     ssh $SSH_HOST 'cd $REMOTE_DIR/deploy && docker-compose down'"
echo "  Перезапуск:    ssh $SSH_HOST 'cd $REMOTE_DIR/deploy && docker-compose restart'"
