import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const runtime = "nodejs";

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const accessToken = request.cookies.get("gradeowl_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(`${API_URL}/${targetPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined;

  try {
    const res = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      // @ts-expect-error duplex is required for streaming request bodies
      duplex: "half",
    });

    const responseHeaders = new Headers();
    const skipHeaders = new Set([
      "transfer-encoding",
      "connection",
      "set-cookie",
      "content-encoding",
      "content-length",
    ]);
    res.headers.forEach((value, key) => {
      if (!skipHeaders.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend unreachable" },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context.params);
}
