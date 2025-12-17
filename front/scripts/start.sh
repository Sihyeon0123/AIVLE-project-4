#!/bin/bash
cd /home/ubuntu/front

npm install --omit=dev

pm2 start npm --name "front" -- start
