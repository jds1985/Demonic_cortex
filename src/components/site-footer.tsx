import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>Demonic Cortex is a graphic novel in progress by Jim.</p>
        <p>Cipher CTS. This site does not take payment yet.</p>
        <nav aria-label="Footer">
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/characters">Characters</Link>
            </li>
            <li>
              <Link href="/subscribe">Subscribe</Link>
            </li>
            <li>
              <Link href="/read/1">Read Chapter 1 free</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
