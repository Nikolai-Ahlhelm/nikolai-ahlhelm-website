import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const AUTH_COOKIE_NAME = "strapi_jwt";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type CurrentUser = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
};

export type LoginResult = {
  jwt: string;
  user: CurrentUser;
};

export type ChangePasswordResult = {
  jwt: string;
  user: CurrentUser;
};

export class LoginError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "LoginError";
  }
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

function getStrapiUrl(path: string) {
  return new URL(path, STRAPI_URL).toString();
}

async function getStrapiErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const body = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function loginWithPassword(
  identifier: string,
  password: string,
): Promise<LoginResult> {
  const response = await fetch(getStrapiUrl("/api/auth/local"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getStrapiErrorMessage(
      response,
      "Login failed.",
    );
    throw new LoginError(message, response.status);
  }

  return response.json() as Promise<LoginResult>;
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const response = await fetch(getStrapiUrl("/api/users/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<CurrentUser>;
}

export async function updateCurrentUsername(username: string) {
  const token = await getSessionToken();
  const user = await getCurrentUser();

  if (!token || !user) {
    throw new AuthRequestError("You are not signed in.", 401);
  }

  const response = await fetch(getStrapiUrl(`/api/users/${user.id}`), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getStrapiErrorMessage(
      response,
      "The username could not be updated.",
    );
    throw new AuthRequestError(message, response.status);
  }

  return response.json() as Promise<CurrentUser>;
}

export async function changeCurrentPassword({
  currentPassword,
  password,
  passwordConfirmation,
}: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}) {
  const token = await getSessionToken();

  if (!token) {
    throw new AuthRequestError("You are not signed in.", 401);
  }

  const response = await fetch(getStrapiUrl("/api/auth/change-password"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      password,
      passwordConfirmation,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await getStrapiErrorMessage(
      response,
      "The password could not be changed.",
    );
    throw new AuthRequestError(message, response.status);
  }

  const result = (await response.json()) as ChangePasswordResult;
  await setSessionToken(result.jwt);

  return result;
}
