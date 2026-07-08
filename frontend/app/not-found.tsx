import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-5 py-16 sm:px-6">
      <div className="glass-panel rounded-2xl p-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-strong)]">
          Seite nicht gefunden
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
          This page does not exist in Strapi or has not been published yet.
        </p>
        <Link
          className="mt-8 w-fit rounded-xl bg-[var(--text-strong)] px-4 py-2 text-[var(--background)] transition opacity-100 hover:opacity-80"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
