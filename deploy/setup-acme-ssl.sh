#!/bin/bash

# Скрипт для настройки SSL через acme.sh (Let's Encrypt)
# Использование: ./setup-acme-ssl.sh [SSH_HOST] [DOMAIN] [EMAIL]

set -e

SSH_HOST=${1:-root@104.248.93.86}
DOMAIN=${2:-dev.trades.anyapi.net}
EMAIL=${3:-admin@dev.trades.anyapi.net}
REMOTE_DIR="/root/steam-trade/deploy"

echo "🔒 Настройка SSL через acme.sh для $DOMAIN"

ssh "$SSH_HOST" << EOF
    set -e
    
    cd $REMOTE_DIR
    
    # Устанавливаем acme.sh если его нет
    if ! command -v acme.sh &> /dev/null; then
        echo "Установка acme.sh..."
        curl https://get.acme.sh | sh -s email=$EMAIL
        export PATH="\$HOME/.acme.sh:\$PATH"
    fi
    
    # Загружаем acme.sh в PATH
    export PATH="\$HOME/.acme.sh:\$PATH"
    source ~/.bashrc 2>/dev/null || true
    
    # Останавливаем nginx временно для standalone режима
    docker-compose stop nginx || true
    
    # Получаем сертификат через standalone режим
    echo "Получение SSL сертификата..."
    ~/.acme.sh/acme.sh --issue --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Создаем директорию для сертификатов
    mkdir -p ssl-certs
    
    # Устанавливаем сертификаты
    echo "Установка сертификатов..."
    ~/.acme.sh/acme.sh --install-cert -d $DOMAIN \
        --key-file ssl-certs/privkey.pem \
        --fullchain-file ssl-certs/fullchain.pem \
        --reloadcmd "cd $REMOTE_DIR && docker-compose restart nginx"
    
    chmod 600 ssl-certs/privkey.pem
    chmod 644 ssl-certs/fullchain.pem
    
    echo "✅ Сертификаты установлены!"
    
    # Запускаем nginx обратно
    docker-compose up -d nginx
EOF

echo ""
echo "✅ SSL настроен! Проверьте https://$DOMAIN"
