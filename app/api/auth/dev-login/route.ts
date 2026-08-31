import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";
const DEV_AUTH_BYPASS_ENABLED =
  process.env.APP_ENV === "development" &&
  ["true", "1", "yes"].includes(process.env.DEV_AUTH_BYPASS?.toLowerCase() ?? "");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

/**
 * DEV ONLY — opens a browser-friendly login flow that bypasses Firebase.
 *
 * Visit:
 *   http://localhost:3000/api/auth/dev-login?email=you@example.com&name=Test+User
 *
 * Both this app and the backend must run with APP_ENV=development and
 * DEV_AUTH_BYPASS=true. The route requires an explicit email address.
 */
export async function GET(request: NextRequest) {
  if (!DEV_AUTH_BYPASS_ENABLED) {
    return new NextResponse(null, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ detail: "email query parameter is required" }, { status: 400 });
  }
  const fullName = request.nextUrl.searchParams.get("name") || undefined;

  const res = await fetch(`${API_URL}/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name: fullName }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Dev login failed — is DEV_AUTH_BYPASS=true on the backend?" }));
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("gradeowl_access_token", data.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });
  response.cookies.set("gradeowl_refresh_token", data.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
