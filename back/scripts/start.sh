#!/bin/bash
set -e

APP_DIR=/home/ubuntu/app
cd $APP_DIR

PID=$(pgrep -f '.war' || true)
if [ -n "$PID" ]; then
  kill -15 $PID
  sleep 5
fi

WAR_FILE=$(ls *.war | head -n 1)

nohup java -jar "$WAR_FILE" > app.log 2>&1 &
