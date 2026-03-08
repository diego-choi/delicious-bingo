#!/bin/bash
set -e

DOCKER_IMAGE="chj1472/delicious-bingo:latest"
VITE_KAKAO_JS_KEY="${VITE_KAKAO_JS_KEY:?Set VITE_KAKAO_JS_KEY environment variable}"

echo "### Building Docker image (amd64) ..."
docker buildx build --platform linux/amd64 \
  -t "$DOCKER_IMAGE" \
  --build-arg VITE_KAKAO_JS_KEY="$VITE_KAKAO_JS_KEY" \
  --push .

echo "### Done! Image pushed to $DOCKER_IMAGE"
echo ""
echo "On OCI VM, run:"
echo "  cd ~/delicious-bingo && docker compose pull && docker compose up -d"
