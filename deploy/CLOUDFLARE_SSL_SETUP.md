# Настройка SSL через Cloudflare Origin Certificate

## Шаг 1: Получение Origin Certificate от Cloudflare

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите домен `dev.trades.anyapi.net`
3. Перейдите в **SSL/TLS** → **Origin Server**
4. Нажмите **Create Certificate**
5. Выберите:
   - **Private key type**: RSA (2048)
   - **Hostnames**: `*.dev.trades.anyapi.net, dev.trades.anyapi.net`
   - **Certificate Validity**: 15 years (максимум)
6. Скопируйте **Origin Certificate** и **Private Key**

## Шаг 2: Загрузка сертификатов на сервер

Выполните на сервере:

```bash
ssh root@104.248.93.86
cd /root/steam-trade/deploy
mkdir -p ssl-certs

# Вставьте Origin Certificate в файл
nano ssl-certs/origin.crt
# (вставьте содержимое Origin Certificate, сохраните Ctrl+O, выйдите Ctrl+X)

# Вставьте Private Key в файл
nano ssl-certs/origin.key
# (вставьте содержимое Private Key, сохраните Ctrl+O, выйдите Ctrl+X)

chmod 600 ssl-certs/origin.key
chmod 644 ssl-certs/origin.crt
```

## Шаг 3: Обновление конфигурации

Скопируйте обновленный `nginx.conf` на сервер или используйте готовую конфигурацию с Cloudflare сертификатами.

## Шаг 4: Настройка Cloudflare SSL режима

В Cloudflare Dashboard → SSL/TLS → Overview:
- Установите режим **Full** или **Full (strict)**

## Шаг 5: Перезапуск nginx

```bash
cd /root/steam-trade/deploy
docker-compose restart nginx
```

## Проверка

Откройте https://dev.trades.anyapi.net - должен работать HTTPS!
