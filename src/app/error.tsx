"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap reader">
      <section className="panel">
        <h1>Something went wrong</h1>
        <p className="prose">This page could not be opened.</p>
        <button type="button" className="button" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </div>
  );
}
