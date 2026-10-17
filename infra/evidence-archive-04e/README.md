# Proposed ARFI protected source evidence store

A Terraform foundation for AWS S3 Object Lock compliance mode, explicit immutable retention, object versioning, KMS-backed encryption and blocked public access. No live AWS resources have been created.

No retention period, approved resolution, bucket name or KMS key is supplied by this PR; institutional_trust_ratified is false and blocks creation. A qualified institute board decision must adopt the schedule and authorize the custodian, region, account, key trust and public-source retention terms.

Operational acceptance requires independent evaluation of access policies, protected Terraform state, KMS key custody, data-event CloudTrail logs, legal hold handling, approved regional retention, separate-account replica and recovery qualification. Neither independent replica nor data-event audit configuration is provisioned by this minimum module. Release proof must read the actual source bytes through authenticated AWS calls, verify the exact version ID, SHA-256, compliance mode and retention deadline. The institution must enroll an external Ed25519 trust root and obtain different custodian/legal signatures before promotion.

Applying Terraform is a privileged action and is not performed from a draft PR or ordinary GitHub CI. Terraform state alone is not evidence of WORM compliance.
