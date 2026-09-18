# The Lambda function itself already exists (student-joseph-saeed-lambda-rest-api,
# created by the lab, using a shared execution role we don't own). Terraform only
# manages the dependency layer; the function's code/config/env vars are updated via
# infra/scripts/deploy_lambda.sh with the AWS CLI instead.

data "archive_file" "dependencies" {
  type        = "zip"
  source_dir  = "${path.module}/layer"
  output_path = "${path.module}/build/layer.zip"
}

resource "aws_lambda_layer_version" "dependencies" {
  layer_name          = "${var.project_name}-deps"
  filename            = data.archive_file.dependencies.output_path
  source_code_hash    = data.archive_file.dependencies.output_base64sha256
  compatible_runtimes = ["python3.14"]
}
