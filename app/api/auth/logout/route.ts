import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("gradeowl_access_token")?.value;
  const refreshToken = request.cookies.get("gradeowl_refresh_token")?.value;

  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Ignore — clearing cookies is sufficient
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("gradeowl_access_token");
  response.cookies.delete("gradeowl_refresh_token");
  return response;
}
