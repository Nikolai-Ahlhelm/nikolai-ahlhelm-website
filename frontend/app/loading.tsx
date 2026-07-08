export default function Loading() {
  return (
    <main className="site-shell py-12 sm:py-16">
      <section
        aria-label="Page is loading"
        className="glass-panel page-loading rounded-2xl p-6 backdrop-blur-2xl backdrop-saturate-150 sm:p-10"
      >
        <div className="loading-orbit" aria-hidden="true">
          <span />
        </div>
        <div className="mt-8 space-y-4">
          <div className="loading-line h-4 w-28" />
          <div className="loading-line h-12 w-3/4" />
          <div className="space-y-3 pt-3">
            <div className="loading-line h-4 w-full" />
            <div className="loading-line h-4 w-11/12" />
            <div className="loading-line h-4 w-8/12" />
          </div>
        </div>
      </section>
    </main>
  );
}
