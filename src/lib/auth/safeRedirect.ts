/**
 * Returns a safe, same-origin redirect target for post-authentication
 * navigation. Only absolute paths are accepted. Protocol-relative URLs,
 * schemes, backslashes, encoded separators, and control characters fall back
 * to the caller-provided localized home page.
 */
export function sanitizeCallbackUrl(
  raw: string | null | undefined,
  fallback: string
): string {
  if (typeof raw !== "string") return fallback;

  const candidate = raw.trim();
  if (!candidate) return fallback;

  // Must be a path, not a scheme or a protocol-relative host.
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  // Browsers may normalize backslashes to slashes.
  if (candidate.includes("\\")) return fallback;

  // Reject literal control characters.
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return fallback;

  // Also inspect the decoded form so encoded slashes/backslashes or encoded
  // control characters cannot smuggle an off-site target past the checks.
  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
  if (decoded.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(decoded)) return fallback;

  return candidate;
}
