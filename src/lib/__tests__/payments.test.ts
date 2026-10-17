import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  PAYMENT_CONFIGS,
  calculatePaystackAmount,
  parsePaystackAmount,
  generatePaymentReference,
  verifySignatureHMACSHA512,
  getPaymentPriceConfig,
} from "../payments.ts";
import type { PaymentPlanType } from "../../types/payments.ts";

describe("Payment Calculations & Currency Units", () => {
  it("defines exact canonical pricing per PRD §8 and SOP §8", () => {
    const lifetime = PAYMENT_CONFIGS.lifetime_premium;
    assert.equal(lifetime.amount, 20.0);
    assert.equal(lifetime.amountInSmallestUnit, 2000);
    assert.equal(lifetime.currency, "USD");
    assert.equal(lifetime.displayPrice, "$20");

    const lesson = PAYMENT_CONFIGS.lesson_unlock;
    assert.equal(lesson.amount, 0.5);
    assert.equal(lesson.amountInSmallestUnit, 50);
    assert.equal(lesson.currency, "GHS");
    assert.equal(lesson.displayPrice, "GH₵0.50");
  });

  it("calculates smallest currency units accurately for Paystack API", () => {
    assert.equal(calculatePaystackAmount(20.0), 2000);
    assert.equal(calculatePaystackAmount(0.5), 50);
    assert.equal(calculatePaystackAmount(1.25), 125);
    assert.equal(calculatePaystackAmount(100.99), 10099);
  });

  it("parses smallest currency units back to standard decimals", () => {
    assert.equal(parsePaystackAmount(2000), 20.0);
    assert.equal(parsePaystackAmount(50), 0.5);
    assert.equal(parsePaystackAmount(125), 1.25);
  });

  it("rejects non-positive and invalid amounts", () => {
    assert.throws(() => calculatePaystackAmount(0), /must be positive/);
    assert.throws(() => calculatePaystackAmount(-10), /must be positive/);
    assert.throws(() => calculatePaystackAmount(NaN), /must be positive/);
    assert.throws(() => parsePaystackAmount(-50), /Invalid/);
  });
});

describe("Payment Reference Generation", () => {
  it("generates formatted reference with plan tag and unique timestamp", () => {
    const refPrem = generatePaymentReference("lifetime_premium");
    assert.match(refPrem, /^kubes_prem_\d+_[a-z0-9]+$/);

    const refLes = generatePaymentReference("lesson_unlock");
    assert.match(refLes, /^kubes_les_\d+_[a-z0-9]+$/);
  });

  it("generates distinct references on rapid successive invocations", () => {
    const refs = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const ref = generatePaymentReference("lifetime_premium");
      assert.equal(refs.has(ref), false, `Duplicate reference detected: ${ref}`);
      refs.add(ref);
    }
  });

  it("supports custom prefix", () => {
    const ref = generatePaymentReference("lesson_unlock", "test_app");
    assert.match(ref, /^test_app_les_\d+_[a-z0-9]+$/);
  });
});

describe("Paystack Webhook HMAC SHA-512 Verification", () => {
  const secretKey = "sk_test_mock_secret_key_123456789";

  it("successfully verifies valid Paystack HMAC SHA-512 signature", async () => {
    const payload = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "kubes_prem_123456",
        amount: 2000,
        currency: "USD",
        metadata: {
          user_id: "user-uuid-1",
          plan_type: "lifetime_premium",
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha512", secretKey)
      .update(payload)
      .digest("hex");

    const isValid = await verifySignatureHMACSHA512(payload, validSignature, secretKey);
    assert.equal(isValid, true);
  });

  it("rejects tampered or mismatched payload with original signature", async () => {
    const originalPayload = JSON.stringify({ event: "charge.success", amount: 2000 });
    const tamperedPayload = JSON.stringify({ event: "charge.success", amount: 50 });

    const signature = crypto
      .createHmac("sha512", secretKey)
      .update(originalPayload)
      .digest("hex");

    const isValid = await verifySignatureHMACSHA512(tamperedPayload, signature, secretKey);
    assert.equal(isValid, false);
  });

  it("rejects signature generated with a different secret key", async () => {
    const payload = JSON.stringify({ event: "charge.success" });
    const forgedSignature = crypto
      .createHmac("sha512", "sk_wrong_secret_key")
      .update(payload)
      .digest("hex");

    const isValid = await verifySignatureHMACSHA512(payload, forgedSignature, secretKey);
    assert.equal(isValid, false);
  });

  it("rejects empty or null signatures and keys", async () => {
    const payload = JSON.stringify({ event: "charge.success" });
    assert.equal(await verifySignatureHMACSHA512(payload, null, secretKey), false);
    assert.equal(await verifySignatureHMACSHA512(payload, "", secretKey), false);
    assert.equal(await verifySignatureHMACSHA512(payload, "sig", ""), false);
  });
});

describe("Payment Content Non-Advisory & Compliance (SOP §7)", () => {
  it("ensures payment descriptions do not make return guarantees or trading claims", () => {
    const lifetime = getPaymentPriceConfig("lifetime_premium");
    const lesson = getPaymentPriceConfig("lesson_unlock");

    const copyToCheck = [
      lifetime.title,
      lifetime.description,
      lesson.title,
      lesson.description,
    ].join(" ").toLowerCase();

    assert.doesNotMatch(copyToCheck, /guaranteed return/);
    assert.doesNotMatch(copyToCheck, /make money/);
    assert.doesNotMatch(copyToCheck, /trading signal/);
    assert.doesNotMatch(copyToCheck, /buy this/);
    assert.doesNotMatch(copyToCheck, /sell this/);
  });
});
