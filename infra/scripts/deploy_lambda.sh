#!/bin/bash
# Updates the existing Lambda function's code + config to run Django via the
# Lambda Web Adapter. Reads secrets from backend/.env directly (never via
# `source`/`eval`, since the DB password contains shell-special characters).
set -euo pipefail
cd "$(dirname "$0")/../.."

FUNCTION_NAME="student-joseph-saeed-lambda-rest-api"

# Check this is still current: https://github.com/awslabs/aws-lambda-web-adapter#lambda-adapter-layer
ADAPTER_LAYER_ARN="arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerX86:28"

DEPENDENCIES_LAYER_ARN=$(cd infra && terraform output -raw dependencies_layer_arn)
CLOUDFRONT_DOMAIN=$(cd infra && terraform output -raw cloudfront_domain)

SECRET_KEY=$(grep -E '^SECRET_KEY=' backend/.env | head -1 | cut -d= -f2-)
DATABASE_URL=$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | sed -E 's/#.*$//' | sed -E 's/[[:space:]]+$//')

python3 - "$SECRET_KEY" "$DATABASE_URL" "$CLOUDFRONT_DOMAIN" <<'PYEOF' > infra/build/env.json
import json
import sys

secret_key, database_url, cloudfront_domain = sys.argv[1:4]
env = {
    "AWS_LAMBDA_EXEC_WRAPPER": "/opt/bootstrap",
    "AWS_LWA_PORT": "8000",
    "DJANGO_SETTINGS_MODULE": "config.settings",
    "SECRET_KEY": secret_key,
    "DEBUG": "False",
    "DATABASE_URL": database_url,
    # Leading dot = Django subdomain-wildcard syntax, matches the API Gateway's
    # execute-api host regardless of API id. 127.0.0.1 is needed too: the
    # Lambda Web Adapter's own internal readiness check hits Django on
    # localhost before any real traffic arrives.
    "ALLOWED_HOSTS": ".execute-api.us-east-1.amazonaws.com,127.0.0.1",
    "CORS_ALLOWED_ORIGINS": f"https://{cloudfront_domain}",
}
print(json.dumps({"Variables": env}))
PYEOF

aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://infra/build/backend.zip

aws lambda wait function-updated --function-name "$FUNCTION_NAME"

aws lambda update-function-configuration \
  --function-name "$FUNCTION_NAME" \
  --runtime python3.14 \
  --handler run.sh \
  --timeout 30 \
  --memory-size 512 \
  --layers "$DEPENDENCIES_LAYER_ARN" "$ADAPTER_LAYER_ARN" \
  --environment file://infra/build/env.json

echo "Deployed. Function ARN / API Gateway integration are unchanged, so no API Gateway update is needed."
