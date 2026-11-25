import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

test("membership migration keeps existing clubs private and preserves legacy queue order", async () => {
  if (!process.env.TEST_DATABASE_URL) throw new Error("Set TEST_DATABASE_URL to a disposable database.");
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `migration_${randomUUID().replaceAll("-", "")}`;
  const migrationName = "20261124120000_club_memberships";
  const root = path.join(process.cwd(), "prisma", "migrations");
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    for (const name of (await readdir(root)).filter((name) => /^\d/.test(name) && name < migrationName).sort()) {
      await client.query(await readFile(path.join(root, name, "migration.sql"), "utf8"));
    }
    await client.query(`
      INSERT INTO "User" (id,name,email) VALUES ('older','Older','older@example.test'), ('newer','Newer','newer@example.test');
      INSERT INTO "Organization" (id,name,handle,"ownerId","inviteCode") VALUES ('org','Legacy club','legacy','older','CODE');
      INSERT INTO "Membership" (id,"orgId","userId") VALUES ('member','org','older');
      INSERT INTO "Game" (id,"orgId",title,venue,"startsAt") VALUES ('game','org','Legacy game','Field',now());
      INSERT INTO "Registration" (id,"userId","gameId",status,"waitlistPos","createdAt","updatedAt") VALUES
        ('older','older','game','WAITLISTED',2,now() - interval '1 day',now()),
        ('newer','newer','game','WAITLISTED',1,now(),now());
    `);
    await client.query(await readFile(path.join(root, migrationName, "migration.sql"), "utf8"));
    const queue = await client.query('SELECT id,"waitlistedAt" FROM "Registration" ORDER BY "waitlistedAt"');
    assert.deepEqual(queue.rows.map((row) => row.id), ["newer", "older"]);
    assert.equal(queue.rows[1].waitlistedAt.getTime() - queue.rows[0].waitlistedAt.getTime(), 1);
    const defaults = await client.query('SELECT "membershipEnabled","monthlyMembershipCents","yearlyMembershipCents" FROM "Organization"');
    assert.deepEqual(defaults.rows, [{ membershipEnabled: false, monthlyMembershipCents: 500, yearlyMembershipCents: 5000 }]);
    assert.equal((await client.query('SELECT access FROM "Game"')).rows[0].access, "CLUB");
    assert.equal((await client.query('SELECT "clubAccess" FROM "Membership"')).rows[0].clubAccess, true);
  } finally {
    await client.query('SET search_path TO public');
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await client.end();
  }
});
