#!/bin/bash
set -e

cd "$(dirname "$0")"

docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
