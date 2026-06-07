import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

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
 *   http://localhost:3000/api/auth/dev-login
 *   http://localhost:3000/api/auth/dev-login?email=you@example.com&name=Test+User
 *
 * Backend must be running with DEV_AUTH_BYPASS=true. The route hits the
 * backend's /auth/dev-login, sets httpOnly cookies (matching the production
 * auth flow), and redirects to "/".
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") || "dev@neuraconcept.com";
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
