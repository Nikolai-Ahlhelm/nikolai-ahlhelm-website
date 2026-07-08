import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access denied",
};

export default function ForbiddenPage() {
  return (
    <main className="site-shell py-12 sm:py-16">
      <section className="glass-panel rounded-2xl p-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          403
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-strong)]">
          Access denied
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
          Your account does not have access to this area.
        </p>
        <Link
          className="mt-8 inline-flex rounded-xl bg-[var(--text-strong)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:opacity-85"
          href="/"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
