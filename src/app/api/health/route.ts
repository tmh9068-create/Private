import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "student-portal",
    timestamp: new Date().toISOString(),
  });
}
