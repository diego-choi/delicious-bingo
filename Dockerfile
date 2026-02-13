# Stage 1: Frontend build
FROM node:22-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ARG VITE_API_URL=/api
ARG VITE_KAKAO_JS_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_KAKAO_JS_KEY=${VITE_KAKAO_JS_KEY}
RUN npm run build

# Stage 2: Backend
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=frontend-builder /frontend/dist /app/frontend_dist
RUN python manage.py collectstatic --noinput
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
