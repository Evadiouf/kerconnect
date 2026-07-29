#!/bin/sh
set -e

export PORT="${PORT:-10000}"

echo "==> KerConnect Backend — démarrage sur le port $PORT"

# Générer la config Nginx avec le bon PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Générer APP_KEY si absent
if [ -z "$APP_KEY" ]; then
    echo "==> Génération de APP_KEY..."
    php artisan key:generate --force
fi

# Caches Laravel (prod) — pas de view:cache, backend API sans Blade
echo "==> Cache config/routes..."
php artisan config:cache
php artisan route:cache

# Migrations
echo "==> Migrations..."
php artisan migrate --force

# Lien storage (non-fatal si déjà existant)
echo "==> Storage link..."
php artisan storage:link || true

echo "==> Démarrage Nginx + PHP-FPM..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
