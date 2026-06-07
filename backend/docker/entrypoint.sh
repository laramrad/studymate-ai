#!/bin/sh

php artisan config:clear
php artisan cache:clear
php artisan route:clear

php artisan migrate --force
php artisan storage:link || true

php artisan config:cache
php artisan route:cache

php artisan serve --host=0.0.0.0 --port=${PORT:-10000}