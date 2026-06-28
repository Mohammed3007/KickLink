# ADR 0002: Audit Log Hash Chain

## Status

Accepted

## Context

KickLink needs audit trails for sensitive organizer/admin actions. Database rows alone are useful but not tamper-evident.

## Decision

New `AuditLogEntry` rows include `previousHash` and `hash`. The hash is computed from stable audit fields plus the previous entry hash, creating an application-level chain.

## Consequences

- Modification of a historical audit row can be detected by recomputing the chain.
- This is tamper-evident, not tamper-proof.
- Stronger guarantees would require periodically anchoring the latest hash outside the database.
