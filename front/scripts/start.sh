#!/bin/bash
set -e

APP_DIR=/home/ubuntu/app
PORT=3000
DEPLOY_ROOT=/opt/codedeploy-agent/deployment-root

echo "=== stop existing app ==="
pm2 delete front || true

echo "=== clean old CodeDeploy bundles ==="
sudo rm -rf ${DEPLOY_ROOT}/* || true

echo "=== clean npm cache ==="
npm cache clean --force || true

echo "=== clean old node_modules (safety) ==="
rm -rf ${APP_DIR}/node_modules || true

echo "=== start next.js with pm2 ==="
cd ${APP_DIR}

npm ci --omit=dev

export NODE_ENV=production
export PORT=${PORT}

pm2 start npm --name front -- run start
