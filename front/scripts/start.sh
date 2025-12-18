#!/bin/bash
set -e

APP_DIR="/home/ubuntu/app"
PM2="/usr/bin/pm2"
NODE="/usr/bin/node"

cd "$APP_DIR"

$NODE -v
$PM2 -v

# 기존 프로세스 제거
$PM2 delete front || true

# standalone 서버 실행
$PM2 start .next/standalone/server.js --name front
