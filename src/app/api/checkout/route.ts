import { decideCheckout } from "@/lib/payments";

export async function POST() {
  const decision = decideCheckout({
    ENABLE_STRIPE: process.env["ENABLE_STRIPE"],
    STRIPE_SECRET_KEY: process.env["STRIPE_SECRET_KEY"],
  });

  return Response.json({ ok: false, error: decision.error }, { status: decision.status });
}
