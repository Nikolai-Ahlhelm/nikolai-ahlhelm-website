export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6">
      <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 h-12 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 space-y-3">
        <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-11/12 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-8/12 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </main>
  );
}
