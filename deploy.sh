#!/bin/bash
set -e

# Load VITE_KAKAO_JS_KEY from frontend/.env.local if not already set
if [ -z "$VITE_KAKAO_JS_KEY" ] && [ -f "frontend/.env.local" ]; then
  export $(grep '^VITE_KAKAO_JS_KEY=' frontend/.env.local | xargs)
fi

DOCKER_IMAGE="chj1472/delicious-bingo:latest"
VITE_KAKAO_JS_KEY="${VITE_KAKAO_JS_KEY:?Set VITE_KAKAO_JS_KEY environment variable}"

echo "### Building Docker image (amd64) ..."
docker buildx build --platform linux/amd64 \
  -t "$DOCKER_IMAGE" \
  --build-arg VITE_KAKAO_JS_KEY="$VITE_KAKAO_JS_KEY" \
  --push .

echo "### Done! Image pushed to $DOCKER_IMAGE"
echo ""
echo "### Deploying to OCI VM ..."
ssh -i ~/.ssh/oci_key.key ubuntu@168.107.48.160 \
  "cd ~/delicious-bingo && docker compose pull && docker compose up -d && docker restart delicious-bingo-nginx"
echo "### Deployment complete!"
