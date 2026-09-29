FROM php:8.3-cli
RUN apt-get update && apt-get install -y --no-install-recommends libwebp-dev libjpeg62-turbo-dev libpng-dev libcurl4-openssl-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install gd pdo_mysql curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN printf 'upload_max_filesize=5M\npost_max_size=6M\nmemory_limit=256M\ndisplay_errors=Off\n' > /usr/local/etc/php/conf.d/saim.ini
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public", "router.php"]
