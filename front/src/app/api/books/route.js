import { NextResponse } from "next/server";
process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "28";

  // 🔴 백엔드 EC2 private IP
  const BACKEND_BASE_URL = process.env.BACK_URL;

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/books?page=${page}&size=${size}`,
      {
        headers: {
          // 쿠키 전달 (refreshToken 등)
          cookie: req.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Backend request failed:", err);
    return NextResponse.json(
      { message: "Backend server error" },
      { status: 500 }
    );
  }
}
