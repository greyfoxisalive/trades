#!/bin/bash

# Скрипт для настройки SSL сертификатов Let's Encrypt
# Использование: ./setup-ssl.sh [SSH_HOST] [DOMAIN] [EMAIL]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
SSH_HOST=${1:-steam-trade-droplet}
DOMAIN=${2:-dev.trades.anyapi.net}
EMAIL=${3:-}
REMOTE_DIR="/root/steam-trade"

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Ошибка: Email обязателен для Let's Encrypt${NC}"
    echo "Использование: ./setup-ssl.sh [SSH_HOST] [DOMAIN] [EMAIL]"
    exit 1
fi

echo -e "${GREEN}🔒 Настройка SSL сертификатов для ${DOMAIN}${NC}"

# Проверка подключения
echo -e "${YELLOW}Проверка SSH подключения...${NC}"
if ! ssh -o ConnectTimeout=5 "$SSH_HOST" "echo 'SSH connection OK'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не удается подключиться к ${SSH_HOST}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ SSH подключение установлено${NC}"

# Проверка и запуск docker-compose
echo -e "${YELLOW}Проверка запущенных контейнеров...${NC}"
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR/deploy
    
    # Убедимся, что контейнеры запущены
    docker-compose up -d nginx web api || true
    
    # Ждем запуска nginx
    sleep 3
EOF

# Создание временной nginx конфигурации для получения сертификатов
echo -e "${YELLOW}Создание временной конфигурации nginx для Let's Encrypt...${NC}"
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR/deploy
    
    # Создание временной конфигурации nginx только для HTTP (для Let's Encrypt challenge)
    cat > nginx-temp.conf << 'NGINXEOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
    }

    upstream web {
        server web:80;
    }

    server {
        listen 80;
        server_name ${DOMAIN};

        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Проксирование API запросов
        location /api {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Проксирование статических файлов и SPA
        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
NGINXEOF

    # Замена конфигурации nginx на временную
    mv nginx.conf nginx.conf.backup || true
    cp nginx-temp.conf nginx.conf
    
    # Перезапуск nginx с временной конфигурацией
    docker-compose restart nginx || docker-compose up -d nginx
    
    # Ждем запуска nginx
    sleep 2
    
    # Проверка, что nginx запущен
    if ! docker-compose ps nginx | grep -q "Up"; then
        echo "Ошибка: nginx не запустился"
        exit 1
    fi
EOF

echo -e "${GREEN}✓ Временная конфигурация nginx создана${NC}"

# Получение SSL сертификатов
echo -e "${YELLOW}Получение SSL сертификатов от Let's Encrypt...${NC}"
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR/deploy
    
    # Запуск certbot для получения сертификатов
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d ${DOMAIN}
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL сертификаты успешно получены${NC}"
else
    echo -e "${RED}❌ Ошибка при получении сертификатов${NC}"
    echo -e "${YELLOW}Восстановление оригинальной конфигурации...${NC}"
    ssh "$SSH_HOST" << EOF
        cd $REMOTE_DIR/deploy
        mv nginx.conf.backup nginx.conf || true
        docker-compose restart nginx
EOF
    exit 1
fi

# Восстановление полной конфигурации nginx с SSL
echo -e "${YELLOW}Восстановление полной конфигурации nginx с SSL...${NC}"
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR/deploy
    
    # Проверка наличия сертификатов
    if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        echo "Ошибка: сертификаты не найдены"
        exit 1
    fi
    
    # Восстановление оригинальной конфигурации (которая теперь должна содержать SSL)
    if [ -f nginx.conf.backup ]; then
        mv nginx.conf.backup nginx.conf
    fi
    
    # Обновление домена в конфигурации, если нужно
    sed -i "s/server_name .*/server_name ${DOMAIN};/g" nginx.conf
    
    # Перезапуск nginx с полной конфигурацией
    docker-compose restart nginx
EOF

echo -e "${GREEN}✅ SSL настроен успешно!${NC}"
echo ""
echo -e "${GREEN}Ваш сайт теперь доступен по адресу: https://${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}Примечания:${NC}"
echo "  - Сертификаты автоматически обновляются каждые 12 часов"
echo "  - HTTP трафик автоматически перенаправляется на HTTPS"
echo "  - Проверьте, что DNS запись для ${DOMAIN} указывает на ваш сервер"
