#!/bin/bash
set -e

# PM2 프로세스 제거
pm2 delete front || true

# 혹시 남아 있을 수 있는 node 프로세스 정리 (보험)
pkill -f "next start" || true
