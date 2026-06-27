import test from "node:test";
import assert from "node:assert/strict";
import {
  formDataToSafeObject,
  hasOversizedBody,
  readLimitedText,
  sanitizeText,
} from "../lib/input";

test("sanitizeText normalizes, trims and removes unsafe control characters", () => {
  assert.equal(sanitizeText("  Club\u0000 Name  "), "Club Name");
});

test("formDataToSafeObject rejects too many fields", () => {
  const form = new FormData();
  form.set("a", "1");
  form.set("b", "2");

  const result = formDataToSafeObject(form, { maxFields: 1 });

  assert.equal(result.ok, false);
  assert.equal(result.error, "Too many form fields.");
});

test("formDataToSafeObject rejects oversized fields", () => {
  const form = new FormData();
  form.set("body", "x".repeat(10));

  const result = formDataToSafeObject(form, { maxFieldBytes: 5 });

  assert.equal(result.ok, false);
  assert.equal(result.error, "A form field is too large.");
});

test("formDataToSafeObject rejects file values", () => {
  const form = new FormData();
  form.set("avatar", new Blob(["hello"]), "avatar.txt");

  const result = formDataToSafeObject(form);

  assert.equal(result.ok, false);
  assert.equal(result.error, "File uploads are not supported here.");
});

test("formDataToSafeObject returns sanitized string values", () => {
  const form = new FormData();
  form.set(" name ", "  Westside\u0000 Sunday  ");

  const result = formDataToSafeObject(form);

  assert.deepEqual(result, { ok: true, data: { name: "Westside Sunday" } });
});

test("hasOversizedBody uses content-length without consuming the body", () => {
  const req = new Request("https://kick-link.vercel.app/api/test", {
    headers: { "content-length": "100" },
  });

  assert.equal(hasOversizedBody(req, 99), true);
  assert.equal(hasOversizedBody(req, 100), false);
});

test("readLimitedText rejects streamed bodies over the byte limit", async () => {
  const req = new Request("https://kick-link.vercel.app/api/test", {
    method: "POST",
    body: "abcdef",
  });

  const result = await readLimitedText(req, 5);

  assert.equal(result.ok, false);
  assert.equal(result.error, "Payload too large.");
});
