// Proposed custody store only: no cloud deployment or approved governance is implied.
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.40, < 7.0"
    }
  }
}
variable "bucket_name" {
  type        = string
  description = "Unique bucket name in an approved ARFI-owned AWS account"
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$", var.bucket_name))
    error_message = "Valid S3 DNS-compatible name required."
  }
}
variable "customer_managed_kms_key_arn" {
  type        = string
  description = "Existing independently approved customer-managed KMS key"
  validation {
    condition     = can(regex("^arn:aws:kms:[a-z0-9-]+:[0-9]{12}:key/[A-Za-z0-9-]+$", var.customer_managed_kms_key_arn))
    error_message = "Customer-managed KMS key ARN is required."
  }
}
variable "approved_retention_days" {
  type        = number
  description = "Duration from RATIFIED institute retention schedule; no default"
  validation {
    condition     = var.approved_retention_days >= 365 && var.approved_retention_days <= 36500 && floor(var.approved_retention_days) == var.approved_retention_days
    error_message = "An expressly ratified integer retention period 365..36500 days is required."
  }
}
variable "approved_governance_resolution" {
  type        = string
  description = "Signed institute retention policy adoption record"
  validation {
    condition     = can(regex("^ARFI-BOARD-[A-Za-z0-9-]{6,50}$", var.approved_governance_resolution))
    error_message = "Adopted ARFI board resolution ID required."
  }
}
variable "institutional_trust_ratified" {
  type        = bool
  default     = false
  description = "False by default; cannot create storage until officially approved"
}
resource "aws_s3_bucket" "evidence" {
  bucket              = var.bucket_name
  force_destroy       = false
  object_lock_enabled = true
  tags = {
    ManagedBy           = "ARFI-Evidence-Custody"
    Project             = "ARFI"
    RetentionResolution = var.approved_governance_resolution
    SourceStatus        = "unpublished"
  }
  lifecycle {
    prevent_destroy = true
    precondition {
      condition     = var.institutional_trust_ratified
      error_message = "Institutional key custody and retention governance must be ratified."
    }
  }
}
resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket                  = aws_s3_bucket.evidence.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_versioning" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  versioning_configuration {
    status = "Enabled"
  }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.customer_managed_kms_key_arn
    }
    bucket_key_enabled = true
  }
}
resource "aws_s3_bucket_object_lock_configuration" "evidence" {
  bucket              = aws_s3_bucket.evidence.id
  object_lock_enabled = "Enabled"
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = var.approved_retention_days
    }
  }
  depends_on = [aws_s3_bucket_versioning.evidence]
}
data "aws_iam_policy_document" "only_tls" {
  statement {
    sid     = "RequireTLS"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.evidence.arn,
      join("", [aws_s3_bucket.evidence.arn, "/*"])
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}
resource "aws_s3_bucket_policy" "tls" {
  bucket     = aws_s3_bucket.evidence.id
  policy     = data.aws_iam_policy_document.only_tls.json
  depends_on = [aws_s3_bucket_public_access_block.evidence]
}
output "archive_bucket_name" {
  value = aws_s3_bucket.evidence.id
}
output "archive_readiness_status" {
  value = "PROVISIONING ONLY: independently verify signatures, object versions, data events and replicas"
}
