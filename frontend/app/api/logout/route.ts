import { NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSessionToken();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
