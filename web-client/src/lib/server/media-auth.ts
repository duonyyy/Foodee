export interface MediaActor {
  id: string;
  role: string;
}

export function requestToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  if (authorization?.startsWith("Bearer "))
    return authorization.slice(7).trim() || null;
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export async function authenticatedActor(
  req: Request,
): Promise<MediaActor | null> {
  const token = requestToken(req);
  if (!token) return null;
  const baseUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/auth/check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json();
    const data = body?.data ?? body;
    if (!data?.isLogin || !data.user) return null;
    const id = String(
      data.user.id || data.user.uid || data.user.sub || "",
    );
    const role =
      typeof data.user.role === "object"
        ? data.user.role?.name
        : data.user.role;
    return id && role
      ? { id, role: String(role).toLowerCase() }
      : null;
  } catch {
    return null;
  }
}
