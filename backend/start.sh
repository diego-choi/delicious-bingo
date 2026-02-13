#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn config.wsgi \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --worker-class gthread \
  --threads 2 \
  --worker-tmp-dir /dev/shm \
  --timeout 30 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  --access-logfile -
