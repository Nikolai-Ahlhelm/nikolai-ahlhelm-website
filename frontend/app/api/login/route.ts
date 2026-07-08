import { NextResponse } from "next/server";
import { LoginError, loginWithPassword, setSessionToken } from "@/lib/auth";

function getRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const identifier = formData.get("identifier");
  const password = formData.get("password");
  const nextPath = getRedirectPath(formData.get("next"));

  if (typeof identifier !== "string" || typeof password !== "string") {
    return NextResponse.redirect(
      new URL(`/login?error=missing&next=${encodeURIComponent(nextPath)}`, request.url),
      303,
    );
  }

  try {
    const loginResult = await loginWithPassword(identifier, password);
    await setSessionToken(loginResult.jwt);
    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  } catch (error) {
    const errorCode =
      error instanceof LoginError &&
      error.message.toLowerCase().includes("confirmed")
        ? "unconfirmed"
        : error instanceof LoginError &&
            error.message.toLowerCase().includes("blocked")
          ? "blocked"
          : "invalid";

    if (process.env.NODE_ENV !== "production") {
      console.warn("Frontend login failed:", error);
    }

    return NextResponse.redirect(
      new URL(`/login?error=${errorCode}&next=${encodeURIComponent(nextPath)}`, request.url),
      303,
    );
  }
}
