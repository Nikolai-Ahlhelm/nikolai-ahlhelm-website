import { NextResponse } from "next/server";
import { AuthRequestError, changeCurrentPassword } from "@/lib/auth";

function getSafeMessage(error: unknown) {
  if (error instanceof AuthRequestError) {
    if (error.status === 401) {
      return "You are not signed in.";
    }

    if (error.message.toLowerCase().includes("current password")) {
      return "The current password is not correct.";
    }

    if (error.message.toLowerCase().includes("match")) {
      return "The new passwords do not match.";
    }
  }

  return "The password could not be changed.";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    currentPassword?: unknown;
    password?: unknown;
    passwordConfirmation?: unknown;
  } | null;
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const passwordConfirmation =
    typeof body?.passwordConfirmation === "string"
      ? body.passwordConfirmation
      : "";

  if (!currentPassword || !password || !passwordConfirmation) {
    return NextResponse.json(
      { message: "Please fill in all password fields." },
      { status: 400 },
    );
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json(
      { message: "The new passwords do not match." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "The new password must be at least 6 characters long." },
      { status: 400 },
    );
  }

  try {
    const { user } = await changeCurrentPassword({
      currentPassword,
      password,
      passwordConfirmation,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const status = error instanceof AuthRequestError ? error.status : 500;

    if (process.env.NODE_ENV !== "production") {
      console.warn("Password change failed:", error);
    }

    return NextResponse.json(
      { message: getSafeMessage(error) },
      { status },
    );
  }
}
