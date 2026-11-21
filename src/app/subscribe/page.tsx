import type { Metadata } from "next";
import { io } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { SubscribeAction } from "@/components/subscribe-action";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Placeholder subscription for Demonic Cortex. Payments are not open yet.",
};

export default function SubscribePage() {
  return (
    <div className="wrap reader">
      <section className="panel" aria-labelledby="subscribe-title">
        <p className="kicker">Cipher CTS</p>
        <h1 id="subscribe-title">Subscribe</h1>
        <p className="prose">
          Cortex Reader is the planned way to open locked chapters, including the illustrated pages. Chapters 1 and 2
          stay free. Nothing on this page charges a card.
        </p>
        <dl className="facts">
          <div>
            <dt>Plan</dt>
            <dd>Cortex Reader</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>
              <span className="price-amount">$9</span> per month. Placeholder price. Not a live offer.
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Closed until mid-December.</dd>
          </div>
        </dl>
        <h2>What a subscription is for</h2>
        <ul className="prose">
          <li>Chapters 2 through 7, text and illustrated pages, once subscriptions are active.</li>
          <li>Chapters 8 through 13 as they are drawn and written.</li>
          <li>The same reading tools: text size, line spacing, panel zoom, and progress saved on this device.</li>
        </ul>
        <Suspense fallback={<p className="note">Checking whether payments are open.</p>}>
          <PaymentSwitch />
        </Suspense>
        <p>
          <Link href="/read/1">Read Chapter 1 free</Link>
        </p>
      </section>
    </div>
  );
}

async function PaymentSwitch() {
  await io();
  const paymentsEnabled = process.env["ENABLE_STRIPE"] === "true";
  return <SubscribeAction paymentsEnabled={paymentsEnabled} />;
}
