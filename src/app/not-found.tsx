import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap reader">
      <section className="panel">
        <h1>Page not found</h1>
        <p className="prose">That page is not part of Demonic Cortex.</p>
        <Link className="button" href="/">
          Back to the cover
        </Link>
      </section>
    </div>
  );
}
