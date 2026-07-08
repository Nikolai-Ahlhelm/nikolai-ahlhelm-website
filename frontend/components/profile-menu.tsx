"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import type { CurrentUser } from "@/lib/auth";

type ProfileMenuProps = {
  user: CurrentUser;
};

type RequestState = {
  message: string | null;
  status: "idle" | "error" | "success";
};

async function readMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  return body?.message ?? fallback;
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [usernameState, setUsernameState] = useState<RequestState>({
    message: null,
    status: "idle",
  });
  const [passwordState, setPasswordState] = useState<RequestState>({
    message: null,
    status: "idle",
  });
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  async function handleUsernameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();

    setIsUpdatingUsername(true);
    setUsernameState({ message: null, status: "idle" });

    const response = await fetch("/api/profile/username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    setIsUpdatingUsername(false);

    if (!response.ok) {
      setUsernameState({
        message: await readMessage(
          response,
          "The username could not be updated.",
        ),
        status: "error",
      });
      return;
    }

    setUsernameState({
      message: "Username updated.",
      status: "success",
    });
    router.refresh();
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    setIsChangingPassword(true);
    setPasswordState({ message: null, status: "idle" });

    const response = await fetch("/api/profile/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        password,
        passwordConfirmation,
      }),
    });

    setIsChangingPassword(false);

    if (!response.ok) {
      setPasswordState({
        message: await readMessage(
          response,
          "The password could not be changed.",
        ),
        status: "error",
      });
      return;
    }

    passwordFormRef.current?.reset();
    setPasswordState({
      message: "Password updated.",
      status: "success",
    });
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-strong)] transition duration-200">
          <UserIcon />
        </span>
        <span>{user.username}</span>
      </button>

      <div
        className={[
          "glass-panel absolute right-0 top-full z-30 mt-5 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4 text-sm backdrop-blur-2xl backdrop-saturate-150",
          "origin-top-right transition duration-200 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0",
        ].join(" ")}
      >
          <div className="border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--text-strong)] text-[var(--background)]">
                <UserIcon />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text-strong)]">
                  {user.username}
                </p>
                <p className="mt-1 break-all text-xs text-[var(--text-muted)]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <form className="mt-4 grid gap-3" onSubmit={handleUsernameSubmit}>
            <label className="grid gap-2 font-medium text-[var(--text-strong)]">
              Username
              <input
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition duration-200 focus:-translate-y-0.5 focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                defaultValue={user.username}
                minLength={3}
                name="username"
                required
                type="text"
              />
            </label>
            {usernameState.message ? (
              <p
                className={
                  usernameState.status === "error"
                    ? "text-xs text-red-500"
                    : "text-xs text-[var(--accent)]"
                }
              >
                {usernameState.message}
              </p>
            ) : null}
            <button
              className="rounded-xl bg-[var(--text-strong)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition duration-200 hover:-translate-y-0.5 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              disabled={isUpdatingUsername}
              type="submit"
            >
              {isUpdatingUsername ? "Saving..." : "Save username"}
            </button>
          </form>

          <form
            className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4"
            onSubmit={handlePasswordSubmit}
            ref={passwordFormRef}
          >
            <label className="grid gap-2 font-medium text-[var(--text-strong)]">
              Current password
              <input
                autoComplete="current-password"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition duration-200 focus:-translate-y-0.5 focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                name="currentPassword"
                required
                type="password"
              />
            </label>
            <label className="grid gap-2 font-medium text-[var(--text-strong)]">
              New password
              <input
                autoComplete="new-password"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition duration-200 focus:-translate-y-0.5 focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                minLength={6}
                name="password"
                required
                type="password"
              />
            </label>
            <label className="grid gap-2 font-medium text-[var(--text-strong)]">
              Repeat new password
              <input
                autoComplete="new-password"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition duration-200 focus:-translate-y-0.5 focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                minLength={6}
                name="passwordConfirmation"
                required
                type="password"
              />
            </label>
            {passwordState.message ? (
              <p
                className={
                  passwordState.status === "error"
                    ? "text-xs text-red-500"
                    : "text-xs text-[var(--accent)]"
                }
              >
                {passwordState.message}
              </p>
            ) : null}
            <button
              className="rounded-xl bg-[var(--text-strong)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition duration-200 hover:-translate-y-0.5 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              disabled={isChangingPassword}
              type="submit"
            >
              {isChangingPassword ? "Saving..." : "Change password"}
            </button>
          </form>

          <form
            action="/api/logout"
            className="mt-4 border-t border-[var(--border)] pt-4"
            method="post"
          >
            <button
              className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-[var(--text-muted)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
    </div>
  );
}
