#!/bin/bash
set -e

DOMAIN="delicious-bingo.duckdns.org"
EMAIL="${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL environment variable}"
STAGING=${LETSENCRYPT_STAGING:-0}  # Set to 1 for testing (avoids rate limits)

mkdir -p certbot/www certbot/conf nginx/conf.d

echo "### Creating dummy certificate for $DOMAIN ..."
mkdir -p certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout certbot/conf/live/$DOMAIN/privkey.pem \
  -out certbot/conf/live/$DOMAIN/fullchain.pem \
  -subj "/CN=localhost"

echo "### Starting nginx with dummy certificate ..."
docker compose up -d nginx

echo "### Removing dummy certificate ..."
rm -rf certbot/conf/live/$DOMAIN
rm -rf certbot/conf/archive/$DOMAIN
rm -rf certbot/conf/renewal/$DOMAIN.conf

echo "### Requesting real certificate from Let's Encrypt ..."
STAGING_ARG=""
if [ "$STAGING" -eq 1 ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  $STAGING_ARG \
  -d "$DOMAIN"

echo "### Reloading nginx with real certificate ..."
docker compose exec nginx nginx -s reload

echo "### Done! SSL certificate installed for $DOMAIN"
