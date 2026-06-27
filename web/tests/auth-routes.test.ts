import test from "node:test";
import assert from "node:assert/strict";
import { getAuthRouteRedirect, safeInternalPath } from "../lib/auth-routes";

test("safeInternalPath rejects external and protocol-relative redirects", () => {
  assert.equal(safeInternalPath("https://evil.example"), "/home");
  assert.equal(safeInternalPath("//evil.example"), "/home");
  assert.equal(safeInternalPath("profile"), "/home");
  assert.equal(safeInternalPath("/games"), "/games");
});

test("public routes stay available to signed-out users", () => {
  assert.equal(getAuthRouteRedirect("/", false), null);
  assert.equal(getAuthRouteRedirect("/login", false), null);
  assert.equal(getAuthRouteRedirect("/signup", false), null);
  assert.equal(getAuthRouteRedirect("/forgot", false), null);
});

test("protected routes redirect signed-out users to login with a safe return path", () => {
  assert.equal(getAuthRouteRedirect("/home", false), "/login?from=%2Fhome");
  assert.equal(getAuthRouteRedirect("/manage/games", false), "/login?from=%2Fmanage%2Fgames");
});

test("signed-in users are moved away from auth entry pages", () => {
  assert.equal(getAuthRouteRedirect("/login", true), "/home");
  assert.equal(getAuthRouteRedirect("/signup", true), "/home");
  assert.equal(getAuthRouteRedirect("/home", true), null);
});
