#!/bin/bash
set -e

export JWT_SECRET="SecretKey123456SecretKey123456SecretKey123456"
export DB_USERNAME="sa"
export DB_PASSWORD="1234"

APP_DIR=/home/ubuntu/app
cd $APP_DIR || exit 1

echo "=== Stop existing WAR ==="
PID=$(pgrep -f '.war' || true)
if [ -n "$PID" ]; then
  kill -15 $PID
  sleep 5
fi

echo "=== Start new WAR ==="
WAR_FILE=$(ls *.war | head -n 1)

if [ -z "$WAR_FILE" ]; then
  echo "❌ WAR file not found" >> app.log
  exit 1
fi

/usr/bin/java -jar "$WAR_FILE" >> app.log 2>&1 &
