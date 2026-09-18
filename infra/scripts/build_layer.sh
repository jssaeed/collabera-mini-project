#!/bin/bash
# Builds the Python dependency layer for Lambda (python3.14, matching the
# existing function's runtime) without needing Docker.
set -euo pipefail
cd "$(dirname "$0")/../.."

rm -rf infra/layer
mkdir -p infra/layer/python

pip install \
  -r backend/requirements.txt \
  --platform manylinux2014_x86_64 \
  --only-binary=:all: \
  --python-version 3.14 \
  --implementation cp \
  -t infra/layer/python

echo "Built infra/layer/python"
echo "If this fails on psycopg2-binary with 'no matching distribution', python3.14 wheels"
echo "may not exist yet for it — switch the Lambda runtime to python3.13 and rerun with"
echo "--python-version 3.13 instead."
