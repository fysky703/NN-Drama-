import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateScanUrl,
  isPrivateIp,
  normalizeUrl,
  isBlockedResolvedAddress,
} from "./url.ts";

function rejectCode(input: string): string {
  const r = validateScanUrl(input);
  assert.equal(r.ok, false, `expected rejection for: ${input}`);
  return (r as Extract<typeof r, { ok: false }>).code;
}

test("accepts normal public URLs", () => {
  assert.equal(validateScanUrl("https://example.com").ok, true);
  assert.equal(validateScanUrl("example.com").ok, true);
  assert.equal(validateScanUrl("http://sub.example.co.uk/path?q=1").ok, true);
});

test("rejects empty and malformed input", () => {
  assert.equal(validateScanUrl("").ok, false);
  assert.equal(validateScanUrl("not a url").ok, false);
});

test("rejects non-http protocols", () => {
  assert.equal(rejectCode("ftp://example.com"), "protocol");
  assert.equal(validateScanUrl("javascript:alert(1)").ok, false);
  assert.equal(validateScanUrl("file:///etc/passwd").ok, false);
});

test("blocks loopback and private hosts", () => {
  assert.equal(validateScanUrl("http://localhost:3000").ok, false);
  assert.equal(rejectCode("http://127.0.0.1"), "private-ip");
  assert.equal(rejectCode("http://192.168.1.10"), "private-ip");
  assert.equal(rejectCode("http://10.0.0.5"), "private-ip");
  assert.equal(validateScanUrl("http://169.254.169.254").ok, false);
});

test("blocks URLs with credentials", () => {
  assert.equal(rejectCode("https://user:pass@example.com"), "credentials");
});

test("isPrivateIp detects ranges", () => {
  assert.equal(isPrivateIp("127.0.0.1"), true);
  assert.equal(isPrivateIp("172.16.5.4"), true);
  assert.equal(isPrivateIp("172.32.0.1"), false);
  assert.equal(isPrivateIp("8.8.8.8"), false);
  assert.equal(isPrivateIp("::1"), true);
  assert.equal(isPrivateIp("2606:4700:4700::1111"), false);
});

test("isBlockedResolvedAddress catches metadata", () => {
  assert.equal(isBlockedResolvedAddress("169.254.169.254"), true);
  assert.equal(isBlockedResolvedAddress("93.184.216.34"), false);
});

test("normalizeUrl strips hash and trailing slash", () => {
  assert.equal(normalizeUrl("https://example.com/#x"), "https://example.com");
  assert.equal(normalizeUrl("https://example.com/path/"), "https://example.com/path");
});
