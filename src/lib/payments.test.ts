import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { decideCheckout } from "./payments";

describe("checkout gate", () => {
  it("stays disabled unless the flag is exactly true", () => {
    assert.equal(decideCheckout({}).status, 403);
    assert.equal(decideCheckout({ ENABLE_STRIPE: "false" }).status, 403);
    assert.equal(decideCheckout({ ENABLE_STRIPE: "TRUE", STRIPE_SECRET_KEY: "sk_test_123" }).status, 403);
  });

  it("refuses live keys and missing keys", () => {
    assert.equal(decideCheckout({ ENABLE_STRIPE: "true" }).status, 400);
    assert.equal(decideCheckout({ ENABLE_STRIPE: "true", STRIPE_SECRET_KEY: "sk_live_123" }).status, 400);
    assert.match(decideCheckout({ ENABLE_STRIPE: "true", STRIPE_SECRET_KEY: "sk_live_123" }).error, /Live keys/);
  });

  it("accepts a test key without creating a charge", () => {
    const decision = decideCheckout({ ENABLE_STRIPE: "true", STRIPE_SECRET_KEY: "sk_test_123" });
    assert.equal(decision.status, 501);
    assert.match(decision.error, /No charge was created/);
  });
});
