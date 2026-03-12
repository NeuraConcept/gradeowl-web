import { NextRequest, NextResponse } from "next/server";
import type { TokenResponse } from "@/lib/api/types";

const API_URL = process.env.API_URL || "http://localhost:8000";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("gradeowl_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      const response = NextResponse.json(
        { detail: "Refresh failed" },
        { status: 401 },
      );
      response.cookies.delete("gradeowl_access_token");
      response.cookies.delete("gradeowl_refresh_token");
      return response;
    }

    const data: TokenResponse = await res.json();

    const response = NextResponse.json({ success: true });
    response.cookies.set("gradeowl_access_token", data.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });
    response.cookies.set("gradeowl_refresh_token", data.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 });
  }
}
