"use client";

import { useState } from "react";

export function SubscribeAction({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const [message, setMessage] = useState(
    paymentsEnabled
      ? "Test mode only. Live cards are refused, and checkout does not create a charge yet."
      : "Payments open mid-December. This button does not charge a card.",
  );

  async function onClick() {
    if (!paymentsEnabled) {
      setMessage("Payments open mid-December. No charge was made.");
      return;
    }
    setMessage("Contacting test checkout.");
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "No charge was made.");
    } catch {
      setMessage("Checkout could not be reached. No charge was made.");
    }
  }

  return (
    <div className="subscribe-action">
      <button type="button" className="button" onClick={onClick}>
        {paymentsEnabled ? "Continue in test mode" : "Subscribe"}
      </button>
      <p className="note" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
