#!/usr/bin/env bash
# Stage cheat-sheet — prints the tag-by-tag progression for the React Brno
# talk. Run from the repo root.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "RSC Trading Dashboard — tag progression"
echo "----------------------------------------"
echo ""
git tag -n --sort=creatordate \
  | grep -E '^step-[0-9]' \
  || true
echo ""
echo "----------------------------------------"
echo "Use 'pnpm demo:N' to switch onto live-N from step-N and start dev."
echo "Use 'git switch -C live-5a step-5a-rsc-ws-fail' for the failed-attempt demo."
