export const DEFAULT_ADMIN_SECRET = "rankhub2026";

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_SECRET;
}

export function verifyAdminSecret(providedSecret: string | null | undefined): boolean {
  if (!providedSecret) return false;
  const target = getAdminSecret();
  return providedSecret.trim() === target.trim();
}

export function isAdminAuthorized(request: Request): boolean {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (verifyAdminSecret(token)) return true;
  }

  // 2. Check x-admin-secret or x-api-key header
  const secretHeader =
    request.headers.get("x-admin-secret") ||
    request.headers.get("x-api-key") ||
    request.headers.get("x-admin-token");
  if (secretHeader && verifyAdminSecret(secretHeader)) {
    return true;
  }

  // 3. Check Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    if (cookies["rankhub_admin_token"] && verifyAdminSecret(cookies["rankhub_admin_token"])) {
      return true;
    }
  }

  // 4. Check URL query param (useful for webhooks or bot cURL)
  try {
    const url = new URL(request.url);
    const keyParam = url.searchParams.get("secret") || url.searchParams.get("key");
    if (keyParam && verifyAdminSecret(keyParam)) {
      return true;
    }
  } catch {
    // ignore URL parsing error
  }

  return false;
}
