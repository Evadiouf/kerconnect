#!/bin/sh
set -e

# PORT injecté par Render (défaut 10000)
export PORT="${PORT:-10000}"

echo "==> KerConnect Backend — démarrage sur le port $PORT"

# Générer la config Nginx avec le bon PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Générer APP_KEY si absent
if [ -z "$APP_KEY" ]; then
    echo "==> Génération de APP_KEY..."
    php artisan key:generate --force
fi

# Caches Laravel (prod)
echo "==> Cache config/routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations
echo "==> Migrations..."
php artisan migrate --force

# Lien storage
echo "==> Storage link..."
php artisan storage:link || true

echo "==> Démarrage Nginx + PHP-FPM..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
