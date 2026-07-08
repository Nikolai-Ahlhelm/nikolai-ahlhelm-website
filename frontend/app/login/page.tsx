import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
};

function getSafeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function getLoginErrorMessage(error: string | undefined) {
  if (error === "missing") {
    return "Please enter your email or username and password.";
  }

  if (error === "unconfirmed") {
    return "This account has not been confirmed yet.";
  }

  if (error === "blocked") {
    return "This account is blocked.";
  }

  if (error) {
    return "Login failed. Please check your frontend user credentials.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: Props) {
  const [{ error, next }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const nextPath = getSafeNextPath(next);
  const errorMessage = getLoginErrorMessage(error);

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="site-shell py-12 sm:py-16">
      <section className="glass-panel rounded-2xl p-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-10">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold text-[var(--text-strong)]">
            Login
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Sign in with your website account to access protected areas.
          </p>
        </div>

        <form
          action="/api/login"
          className="mt-8 grid max-w-md gap-5"
          method="post"
        >
          <input name="next" type="hidden" value={nextPath} />
          <label className="grid gap-2 text-sm font-medium text-[var(--text-strong)]">
            Email or username
            <input
              autoComplete="username"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-base text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
              name="identifier"
              required
              type="text"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--text-strong)]">
            Password
            <input
              autoComplete="current-password"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-base text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
              name="password"
              required
              type="password"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-[var(--text-strong)]">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-xl bg-[var(--text-strong)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:opacity-85"
              type="submit"
            >
              Einloggen
            </button>
            <Link
              className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
              href="/"
            >
              Back
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
