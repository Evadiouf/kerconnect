#!/bin/sh
set -e

export PORT="${PORT:-10000}"

echo "==> KerConnect Backend — démarrage sur le port $PORT"

# Générer la config Nginx avec le bon PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Générer APP_KEY si absent ou format invalide (doit commencer par base64:)
if [ -z "$APP_KEY" ] || ! echo "$APP_KEY" | grep -q "^base64:"; then
    echo "==> Génération de APP_KEY (clé absente ou format invalide)..."
    php artisan key:generate --force
fi

# Recréer les répertoires storage nécessaires
echo "==> Préparation storage..."
mkdir -p storage/framework/{cache,sessions,views} storage/logs
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Caches Laravel (prod) — pas de view:cache, backend API sans Blade
echo "==> Cache config/routes..."
php artisan config:cache
php artisan route:cache

# Migrations
echo "==> Migrations..."
php artisan migrate --force

# Seed admin + paramètres (updateOrCreate — sans danger à chaque démarrage)
echo "==> Seed admin..."
php artisan db:seed --force

# Lien storage (non-fatal si déjà existant)
echo "==> Storage link..."
php artisan storage:link || true

echo "==> Démarrage Nginx + PHP-FPM..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
