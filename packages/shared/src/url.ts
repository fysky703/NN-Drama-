/**
 * URL validation and SSRF protection helpers.
 *
 * These are shared by the web API (pre-flight validation) and the browser
 * worker (defence in depth before launching Playwright).
 */

export interface UrlValidationOk {
  ok: true;
  url: URL;
}

export interface UrlValidationError {
  ok: false;
  reason: string;
  code: UrlErrorCode;
}

export type UrlErrorCode =
  | "empty"
  | "malformed"
  | "protocol"
  | "credentials"
  | "blocked-host"
  | "private-ip"
  | "port";

export type UrlValidationResult = UrlValidationOk | UrlValidationError;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Hostnames that must never be scanned: loopback, link-local, internal
 * service discovery names, and cloud metadata endpoints.
 */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
  "169.254.169.254",
]);

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa"];

/** Parse and validate a user-supplied URL for scanning. */
export function validateScanUrl(input: string): UrlValidationResult {
  const trimmed = (input ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "Please enter a URL.", code: "empty" };
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return {
      ok: false,
      reason: "That is not a valid URL. Example: https://example.com",
      code: "malformed",
    };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return {
      ok: false,
      reason: "Only http:// and https:// URLs are supported.",
      code: "protocol",
    };
  }

  if (url.username || url.password) {
    return {
      ok: false,
      reason: "URLs containing credentials are not allowed.",
      code: "credentials",
    };
  }

  const host = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(host) || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return {
      ok: false,
      reason: "This host is not publicly accessible and cannot be scanned.",
      code: "blocked-host",
    };
  }

  if (isPrivateIp(host)) {
    return {
      ok: false,
      reason: "Private and internal network addresses cannot be scanned.",
      code: "private-ip",
    };
  }

  if (url.port && !isAllowedPort(url.port)) {
    return {
      ok: false,
      reason: "Only standard web ports (80, 443, 8080, 8443) are allowed.",
      code: "port",
    };
  }

  return { ok: true, url };
}

function isAllowedPort(port: string): boolean {
  return ["80", "443", "8080", "8443"].includes(port);
}

/** True when the given host string is an IP literal inside a private range. */
export function isPrivateIp(host: string): boolean {
  const bare = host.replace(/^\[|\]$/g, "");

  if (isIPv4(bare)) return isPrivateIPv4(bare);
  if (bare.includes(":")) return isPrivateIPv6(bare);
  return false;
}

/** Validate a DNS-resolved address (worker side) against blocked ranges. */
export function isBlockedResolvedAddress(address: string): boolean {
  return isPrivateIp(address) || address === "0.0.0.0" || address === "::";
}

function isIPv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number) as [number, number, number, number];
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

/** True when the given IPv6 literal is inside a private / non-routable range. */
function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true; // unspecified / loopback

  // IPv4-mapped addresses: reuse the IPv4 rules.
  if (/^::ffff:/.test(v)) {
    const mapped = v.replace(/^::ffff:/, "");
    return isIPv4(mapped) ? isPrivateIPv4(mapped) : true;
  }

  if (v.startsWith("fc") || v.startsWith("fd")) return true; // fc00::/7 unique local
  if (v.startsWith("2001:db8")) return true; // 2001:db8::/32 documentation

  const first = v.split(":")[0] ?? "";
  if (["fe8", "fe9", "fea", "feb"].some((p) => first.startsWith(p))) return true; // link-local
  if (first.startsWith("ff")) return true; // multicast

  // Residual IPv4-embedded forms.
  if (v.includes(".")) return true;
  return false;
}

/** Normalize a URL for storage / dedupe (strip hash + trailing slash). */
export function normalizeUrl(input: string): string {
  const result = validateScanUrl(input);
  if (!result.ok) return input.trim();
  const url = result.url;
  url.hash = "";
  let s = url.toString();
  if (s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

export function displayHost(input: string): string {
  const result = validateScanUrl(input);
  return result.ok ? result.url.hostname : input;
}
