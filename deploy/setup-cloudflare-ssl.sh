#!/bin/bash

# Скрипт для настройки SSL через Cloudflare Origin Certificate
# Использование: ./setup-cloudflare-ssl.sh [SSH_HOST]

set -e

SSH_HOST=${1:-root@104.248.93.86}
REMOTE_DIR="/root/steam-trade/deploy"

echo "🔒 Настройка SSL через Cloudflare Origin Certificate"
echo ""
echo "Для получения Origin Certificate:"
echo "1. Зайдите в Cloudflare Dashboard -> SSL/TLS -> Origin Server"
echo "2. Нажмите 'Create Certificate'"
echo "3. Выберите домен: dev.trades.anyapi.net"
echo "4. Скопируйте Origin Certificate и Private Key"
echo ""
read -p "Нажмите Enter когда получите сертификат..."

echo ""
echo "Вставьте Origin Certificate (закончите вводом пустой строки):"
CERT=""
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    CERT="${CERT}${line}\n"
done

echo ""
echo "Вставьте Private Key (закончите вводом пустой строки):"
KEY=""
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    KEY="${KEY}${line}\n"
done

# Создаем временные файлы
ssh "$SSH_HOST" << EOF
    cd $REMOTE_DIR
    mkdir -p ssl-certs
    
    # Сохраняем сертификат
    cat > ssl-certs/origin.crt << CERTEOF
$(echo -e "$CERT")
CERTEOF

    # Сохраняем ключ
    cat > ssl-certs/origin.key << KEYEOF
$(echo -e "$KEY")
KEYEOF

    chmod 600 ssl-certs/origin.key
    chmod 644 ssl-certs/origin.crt
    
    echo "✓ Сертификаты сохранены"
EOF

# Обновляем nginx.conf для использования Cloudflare сертификатов
ssh "$SSH_HOST" << 'EOF'
    cd /root/steam-trade/deploy
    
    # Создаем новую конфигурацию nginx с Cloudflare сертификатами
    cat > nginx-cloudflare.conf << 'NGINXEOF'
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

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name dev.trades.anyapi.net;

        # Redirect all traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name dev.trades.anyapi.net;

        # Cloudflare Origin Certificate
        ssl_certificate /etc/nginx/ssl-certs/origin.crt;
        ssl_certificate_key /etc/nginx/ssl-certs/origin.key;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Проксирование API запросов
        location /api {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_cache_bypass $http_upgrade;
        }

        # Проксирование статических файлов и SPA
        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
NGINXEOF

    # Обновляем docker-compose.yml для монтирования сертификатов
    # Пока просто копируем конфигурацию
    cp nginx-cloudflare.conf nginx.conf
    
    # Перезапускаем nginx
    docker-compose restart nginx
    
    echo "✅ SSL настроен!"
    echo ""
    echo "Важно: Убедитесь что в Cloudflare SSL/TLS режим установлен на 'Full' или 'Full (strict)'"
EOF

echo ""
echo "✅ Готово! Проверьте https://dev.trades.anyapi.net"
