# Draft ARFI primary-source evidence retention and trust governance

**Unratified proposal v0.1.0; requires authorized institute governance approval.** The institute's chosen historical scope makes a long-term archive necessary, but neither an autonomous coding agent nor GitHub CI can legitimately ratify a board policy or designate a human custodian.

Suggested controls before archive promotion: institute-controlled Ed25519 keys created and held outside public source code; key custody and rotation documented; explicitly approved signer public-key SHA-256 fingerprints; custodian/legal reviewer separation; canonical and signed per-release manifests; source-binary SHA-256 addresses; immutable object versions and independently verified lock/hold evidence; redundant archival replicas under independent accounts; audit events; fixed source edition/observed date; provenance correction events without overwriting originals.

Retention duration is a **policy choice** requiring legal counsel/board ratification. Prior architecture research proposed an institute-lifetime plus ten-year principle; it is not an enacted ARFI records schedule. Document effective date, applicable exceptions, legal hold and disposition policy before treating any retention deadline as approved.

**Do not** commit private signing keys, override preservation locks, call an ordinary Git branch "immutably stored", use self-signed test keys as institutional attestations, or declare legal classification based solely on PDF headers, publisher directory categories or a successful CI result.

Before activating \`qualifyControlledRelease\`, an independent storage-provider verification adapter must validate provider-signed lock and version receipts. Merely submitting JSON that says \`provider_verified: true\` is explicitly insufficient and the runtime rejects permanent promotion.
