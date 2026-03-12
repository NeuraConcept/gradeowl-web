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
  try {
    const { id_token } = await request.json();

    const res = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Auth failed" }));
      return NextResponse.json(error, { status: res.status });
    }

    const data: TokenResponse = await res.json();

    const response = NextResponse.json({ success: true });
    response.cookies.set("gradeowl_access_token", data.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });
    response.cookies.set("gradeowl_refresh_token", data.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 });
  }
}
