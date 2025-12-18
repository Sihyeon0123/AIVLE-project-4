#!/bin/bash

export JWT_SECRET="SecretKey123456SecretKey123456SecretKey123456"
export DB_USERNAME="sa"
export DB_PASSWORD="1234"

APP_DIR=/home/ubuntu/app
cd $APP_DIR || exit 1

PID=$(pgrep -f '.war' || true)
if [ -n "$PID" ]; then
  kill -15 $PID
  sleep 5
fi

WAR_FILE=$(ls *.war | head -n 1)

/usr/bin/java -jar "$WAR_FILE" >> app.log 2>&1 &
