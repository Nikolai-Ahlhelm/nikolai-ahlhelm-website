import { NextResponse } from "next/server";
import { AuthRequestError, updateCurrentUsername } from "@/lib/auth";

function getSafeMessage(error: unknown) {
  if (error instanceof AuthRequestError) {
    if (error.status === 401) {
      return "You are not signed in.";
    }

    if (error.message.toLowerCase().includes("already")) {
      return "This username is already taken.";
    }
  }

  return "The username could not be updated.";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
  } | null;
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";

  if (username.length < 3) {
    return NextResponse.json(
      { message: "The username must be at least 3 characters long." },
      { status: 400 },
    );
  }

  try {
    const user = await updateCurrentUsername(username);
    return NextResponse.json({ user });
  } catch (error) {
    const status = error instanceof AuthRequestError ? error.status : 500;

    if (process.env.NODE_ENV !== "production") {
      console.warn("Username update failed:", error);
    }

    return NextResponse.json(
      { message: getSafeMessage(error) },
      { status },
    );
  }
}
