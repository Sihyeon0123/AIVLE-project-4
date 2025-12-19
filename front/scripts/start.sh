#!/bin/bash
set -e

APP_DIR=/home/ubuntu/app
PORT=3000

echo "=== stop existing app ==="
pm2 delete front || true

echo "=== start next.js with pm2 ==="
cd ${APP_DIR}
npm ci --omit=dev

export NODE_ENV=production
export PORT=${PORT}

# 테스트
pm2 start npm --name front -- run start
