# Настройка SSH доступа к DigitalOcean Droplet

Это руководство поможет вам настроить SSH доступ к вашему droplet.

## Шаг 1: Создание SSH ключа (если еще нет)

Если у вас еще нет SSH ключа, создайте его:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Или используйте RSA (если ed25519 не поддерживается):

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Следуйте инструкциям. Рекомендуется использовать пароль для защиты ключа.

## Шаг 2: Добавление SSH ключа в DigitalOcean

### Вариант A: Через веб-интерфейс DigitalOcean

1. Войдите в панель управления DigitalOcean
2. Перейдите в **Settings** → **Security** → **SSH Keys**
3. Нажмите **Add SSH Key**
4. Скопируйте содержимое вашего публичного ключа:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # или
   cat ~/.ssh/id_rsa.pub
   ```
5. Вставьте ключ и дайте ему имя
6. Сохраните

### Вариант B: При создании droplet

При создании нового droplet выберите ваш SSH ключ в разделе **Authentication**.

## Шаг 3: Настройка SSH конфигурации

1. Скопируйте пример конфигурации:
   ```bash
   cp deploy/ssh-config.example ~/.ssh/config
   ```

2. Отредактируйте `~/.ssh/config`:
   ```bash
   nano ~/.ssh/config
   ```

3. Замените `YOUR_DROPLET_IP` на IP адрес вашего droplet

4. Если вы используете другой ключ, измените путь в `IdentityFile`

## Шаг 4: Подключение к droplet

### Первое подключение

```bash
ssh root@YOUR_DROPLET_IP
```

Или используя настроенный алиас:

```bash
ssh steam-trade-droplet
```

При первом подключении вас попросят подтвердить fingerprint сервера. Введите `yes`.

### Если подключение не работает

1. **Проверьте IP адрес**: Убедитесь, что IP адрес правильный
2. **Проверьте firewall**: Убедитесь, что порт 22 открыт в DigitalOcean firewall
3. **Проверьте ключ**: Убедитесь, что правильный ключ добавлен в droplet
4. **Проверьте пользователя**: По умолчанию используется `root`, но может быть другой пользователь

## Шаг 5: Настройка безопасности (рекомендуется)

После первого подключения рекомендуется:

### 1. Создать нового пользователя с sudo правами

```bash
# На сервере
adduser deploy
usermod -aG sudo deploy
```

### 2. Настроить SSH ключ для нового пользователя

```bash
# На вашем локальном компьютере
ssh-copy-id deploy@YOUR_DROPLET_IP
```

Или вручную:

```bash
# На сервере (под root)
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
nano /home/deploy/.ssh/authorized_keys
# Вставьте ваш публичный ключ
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 3. Настроить SSH для большей безопасности

Отредактируйте `/etc/ssh/sshd_config` на сервере:

```bash
sudo nano /etc/ssh/sshd_config
```

Рекомендуемые настройки:

```
# Отключить вход по паролю (только ключи)
PasswordAuthentication no
PermitRootLogin no

# Изменить порт SSH (опционально, но рекомендуется)
Port 2222

# Ограничить попытки входа
MaxAuthTries 3
```

Перезапустите SSH:

```bash
sudo systemctl restart sshd
```

**Важно**: Перед отключением `PermitRootLogin` убедитесь, что вы можете войти под новым пользователем!

### 4. Обновить SSH конфигурацию локально

Обновите `~/.ssh/config`:

```
Host steam-trade-droplet
    HostName YOUR_DROPLET_IP
    User deploy
    Port 2222  # если изменили порт
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## Шаг 6: Настройка firewall

Настройте firewall на сервере:

```bash
# Установить UFW (если еще не установлен)
sudo apt update
sudo apt install ufw

# Разрешить SSH
sudo ufw allow 22/tcp
# или если изменили порт
sudo ufw allow 2222/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

## Проверка подключения

После настройки проверьте подключение:

```bash
ssh steam-trade-droplet
```

Если все настроено правильно, вы должны подключиться без ввода пароля.

## Полезные команды

### Копирование файлов на сервер

```bash
# Копировать файл
scp file.txt steam-trade-droplet:/path/to/destination/

# Копировать директорию
scp -r deploy/ steam-trade-droplet:/root/

# Используя rsync (более эффективно)
rsync -avz deploy/ steam-trade-droplet:/root/deploy/
```

### Выполнение команд на сервере

```bash
# Одна команда
ssh steam-trade-droplet "docker ps"

# Несколько команд
ssh steam-trade-droplet << EOF
cd /root/deploy
docker-compose ps
EOF
```

## Troubleshooting

### Ошибка "Permission denied (publickey)"

1. Проверьте права на файлы:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/id_ed25519.pub
   ```

2. Проверьте, что ключ добавлен в ssh-agent:
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```

3. Проверьте логи на сервере:
   ```bash
   sudo tail -f /var/log/auth.log
   ```

### Ошибка "Connection refused"

1. Проверьте, что droplet запущен
2. Проверьте firewall в DigitalOcean
3. Проверьте, что SSH сервис запущен на сервере:
   ```bash
   sudo systemctl status sshd
   ```

## Дополнительные ресурсы

- [DigitalOcean SSH Keys Guide](https://www.digitalocean.com/docs/droplets/how-to/add-ssh-keys/)
- [SSH Best Practices](https://www.digitalocean.com/community/tutorials/how-to-harden-openssh-on-ubuntu-20-04)
