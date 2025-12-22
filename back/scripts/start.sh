#!/bin/bash
set -e

export JWT_SECRET="SecretKey123456SecretKey123456SecretKey123456"
export DB_USERNAME="sa"
export DB_PASSWORD="1234"

APP_DIR=/home/ubuntu/app
LOG_FILE=${APP_DIR}/app.log

cd "$APP_DIR" || exit 1

echo "=== Stop existing app ===" | tee -a "$LOG_FILE"
PID=$(pgrep -f 'java.*\.jar' || true)
if [ -n "$PID" ]; then
  kill -15 $PID
  sleep 5
fi

echo "=== Find executable JAR ===" | tee -a "$LOG_FILE"
JAR_FILE=$(ls *.jar 2>/dev/null | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "❌ Executable JAR not found" | tee -a "$LOG_FILE"
  ls -al "$APP_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

echo "=== Start JAR: $JAR_FILE ===" | tee -a "$LOG_FILE"
nohup /usr/bin/java -jar "$JAR_FILE" >> "$LOG_FILE" 2>&1 &
