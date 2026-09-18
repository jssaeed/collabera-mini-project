variable "region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "collabera-bank"
}

variable "bucket_name" {
  description = "Existing S3 bucket for the frontend (not created by Terraform)."
  default     = "student-joseph-saeed-s3bucket"
}
