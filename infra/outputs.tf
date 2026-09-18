output "dependencies_layer_arn" {
  value = aws_lambda_layer_version.dependencies.arn
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
