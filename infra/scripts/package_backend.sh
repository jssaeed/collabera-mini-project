#!/bin/bash
# Zips backend/ into infra/build/backend.zip for `aws lambda update-function-code`.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p infra/build
rm -f infra/build/backend.zip

cd backend
zip -r ../infra/build/backend.zip . \
  -x ".venv/*" \
  -x "__pycache__/*" -x "*/__pycache__/*" \
  -x ".env" \
  -x ".mypy_cache/*" \
  -x "db.sqlite3"

echo "Wrote infra/build/backend.zip"
