#!/usr/bin/env sh
# Idempotent deploy: pull, test, rebuild, restart, health-check.
set -eu
cd "$(dirname "$0")/.."
git pull --ff-only
if command -v node >/dev/null 2>&1; then npm test --silent; else echo "node not found; skipping tests"; fi
docker compose -f deploy/docker-compose.yml up -d --build
sleep 2
curl -fsS http://127.0.0.1:8088/healthz >/dev/null && echo "riemann: healthy on 127.0.0.1:8088"
