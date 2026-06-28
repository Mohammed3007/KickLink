import test from "node:test";
import assert from "node:assert/strict";
import { auditHashPayload, computeAuditHash } from "../lib/audit";

const basePayload = {
  action: "ORGANIZATION_CREATED",
  actorId: "user_1",
  targetType: "Organization",
  targetId: "org_1",
  organizationId: "org_1",
  reason: null,
  metadata: { handle: "westside" },
  previousHash: "previous",
  createdAt: new Date("2026-06-28T08:00:00.000Z"),
};

test("auditHashPayload is stable for identical audit entry data", () => {
  assert.equal(auditHashPayload(basePayload), auditHashPayload({ ...basePayload }));
});

test("computeAuditHash changes when audit payload changes", () => {
  const first = computeAuditHash(auditHashPayload(basePayload));
  const second = computeAuditHash(
    auditHashPayload({
      ...basePayload,
      metadata: { handle: "eastside" },
    })
  );

  assert.notEqual(first, second);
  assert.equal(first.length, 64);
});
