#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn config.wsgi --bind "0.0.0.0:${PORT:-8000}"
