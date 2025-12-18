#!/bin/bash
set -e

APP_DIR=/home/ubuntu/app
cd $APP_DIR

# pm2 없으면 설치 (최소 방어)
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# 의존성 없을 경우만 설치 (매번 안 깔도록)
if [ ! -d "node_modules" ]; then
  npm ci --omit=dev
fi

# 기존 프로세스 정리
pm2 delete front || true

# npm start 실행 (package.json 기준)
pm2 start npm --name "front" -- start

pm2 save
