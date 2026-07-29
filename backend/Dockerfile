FROM php:8.3-fpm-alpine

# Dépendances système
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    unzip \
    git \
    curl \
    bash \
    gettext

# Extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo pdo_pgsql gd opcache bcmath

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier les sources (sans vendor/)
COPY . .

# Créer les répertoires requis par Laravel avant composer install
RUN mkdir -p bootstrap/cache storage/framework/{cache,sessions,views} storage/logs \
 && chmod -R 775 bootstrap/cache storage

# Installer les dépendances PHP (prod uniquement)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions finales
RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# Configs Nginx et supervisor
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
