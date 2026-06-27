import test from "node:test";
import assert from "node:assert/strict";
import {
  createClubSchema,
  createGameSchema,
  organizerDecisionSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateProfileSchema,
} from "../lib/validators";
import { normalizeSport, sportSlug } from "../lib/sports";

test("sign in and sign up schemas accept valid credentials", () => {
  assert.equal(
    signInSchema.safeParse({ email: " Player@KickLink.App ", password: "password" }).success,
    true
  );
  assert.equal(
    signUpSchema.safeParse({
      name: "Daniel Profile",
      email: "new-player@kicklink.app",
      password: "strong-pass",
    }).success,
    true
  );
});

test("schemas sanitize ordinary user text before persistence", () => {
  const parsed = updateProfileSchema.parse({
    name: "  Daniel\u0000 Profile  ",
    city: "  Ottawa  ",
    skill: "Intermediate",
    avatarColor: "#14B8A6",
  });

  assert.equal(parsed.name, "Daniel Profile");
  assert.equal(parsed.city, "Ottawa");
});

test("sign up schema rejects weak inputs", () => {
  assert.equal(signUpSchema.safeParse({ name: "A", email: "bad", password: "short" }).success, false);
});

test("reset password schema requires token and a strong enough password", () => {
  assert.equal(resetPasswordSchema.safeParse({ token: "abcdefghij", password: "newpass123" }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: "short", password: "newpass123" }).success, false);
});

test("game schema supports multi-sport games and larger capacities", () => {
  const parsed = createGameSchema.safeParse({
    orgId: "club_1",
    title: "Thursday Basketball",
    sport: "Basketball",
    venue: "Community Gym",
    address: "",
    startsAt: "2026-07-02T20:00:00.000Z",
    durationMins: 90,
    format: "5v5",
    skill: "Intermediate",
    priceCents: 1300,
    capacity: 200,
    model: "PAY",
    recurrenceMode: "WEEKLY",
    occurrenceCount: 6,
    seriesPaymentMode: "PER_GAME",
  });

  assert.equal(parsed.success, true);
});

test("club schema defaults primary sport to Football", () => {
  const parsed = createClubSchema.parse({
    name: "Westside Sunday League",
    city: "Ottawa",
    venue: "Brewer Park",
    blurb: "",
  });

  assert.equal(parsed.sport, "Football");
});

test("organizer rejection requires an admin note", () => {
  assert.equal(
    organizerDecisionSchema.safeParse({
      applicationId: "app_1",
      decision: "REJECTED",
      adminNote: "",
    }).success,
    false
  );
});

test("profile schema validates avatar color and skill", () => {
  assert.equal(
    updateProfileSchema.safeParse({
      name: "Daniel Profile",
      city: "Ottawa",
      skill: "Intermediate",
      avatarColor: "#14B8A6",
    }).success,
    true
  );
});

test("sport helpers normalize search and display values", () => {
  assert.equal(normalizeSport("  Padel  "), "Padel");
  assert.equal(normalizeSport(""), "Football");
  assert.equal(sportSlug(" Beach Volleyball "), "beach volleyball");
});
