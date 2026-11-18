export interface CheckoutDecision {
  status: number;
  error: string;
}

/**
 * Payments stay off unless ENABLE_STRIPE is exactly "true".
 * Even then, only a Stripe test secret (sk_test_...) is accepted.
 * Live keys are refused. This function never creates a charge.
 */
export function decideCheckout(env: {
  ENABLE_STRIPE?: string;
  STRIPE_SECRET_KEY?: string;
}): CheckoutDecision {
  if (env.ENABLE_STRIPE !== "true") {
    return { status: 403, error: "Payments are disabled." };
  }

  const key = env.STRIPE_SECRET_KEY ?? "";
  if (!key.startsWith("sk_test_")) {
    return {
      status: 400,
      error:
        "Checkout refused. STRIPE_SECRET_KEY must be a Stripe test key beginning with sk_test_. Live keys are not accepted.",
    };
  }

  return {
    status: 501,
    error: "Test-mode checkout is not wired yet. No charge was created.",
  };
}
