#!/bin/bash
set -e

APP_DIR="/home/ubuntu/app"
PM2="/usr/bin/pm2"
NODE="/usr/bin/node"

cd "$APP_DIR/.next/standalone"

$NODE -v
$PM2 -v

$PM2 delete front || true
$PM2 start server.js --name front --cwd "$APP_DIR/.next/standalone"
