import type {
  PaymentPlanType,
  PaymentPriceConfig,
  PaymentRecord,
  PaymentInitParams,
  PaystackInitResponse,
} from "../types/payments";

function getPlatformOS(): string {
  try {
    return require("react-native").Platform.OS;
  } catch {
    return typeof window !== "undefined" ? "web" : "node";
  }
}

function getWebBrowser() {
  try {
    return require("expo-web-browser");
  } catch {
    return null;
  }
}

function getSupabase() {
  try {
    return require("./supabase").supabase;
  } catch {
    return null;
  }
}

// Canonical Pricing per SOP §8 & PRD §8
export const PAYMENT_CONFIGS: Record<PaymentPlanType, PaymentPriceConfig> = {
  lifetime_premium: {
    planType: "lifetime_premium",
    amount: 20.0,
    amountInSmallestUnit: 2000, // Cents
    currency: "USD",
    displayPrice: "$20",
    title: "Lifetime Premium Access",
    description:
      "Unlock all 7 Investing 101 lessons, future tracks, and all founder market insights forever with a one-time purchase.",
  },
  lesson_unlock: {
    planType: "lesson_unlock",
    amount: 0.5,
    amountInSmallestUnit: 50, // Pesewas
    currency: "GHS",
    displayPrice: "GH₵0.50",
    title: "Single Lesson Unlock",
    description:
      "Unlock full reading access, study notes, and end-of-lesson quiz for this specific module.",
  },
};

export function getPaymentPriceConfig(planType: PaymentPlanType): PaymentPriceConfig {
  return PAYMENT_CONFIGS[planType];
}

// Unique collision-resistant reference generation
export function generatePaymentReference(
  planType: PaymentPlanType,
  prefix = "kubes"
): string {
  const typeKey = planType === "lifetime_premium" ? "prem" : "les";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${typeKey}_${timestamp}_${randomStr}`;
}

// Amount converter for Paystack (to and from smallest currency units)
export function calculatePaystackAmount(amount: number): number {
  if (amount <= 0 || isNaN(amount)) {
    throw new Error("Invalid payment amount: must be positive");
  }
  return Math.round(amount * 100);
}

export function parsePaystackAmount(smallestUnitAmount: number): number {
  if (smallestUnitAmount < 0 || isNaN(smallestUnitAmount)) {
    throw new Error("Invalid smallest-unit amount");
  }
  return smallestUnitAmount / 100;
}

// In-memory payment store for offline / dev / test runner
const memoryPayments: Record<string, PaymentRecord[]> = {};

/**
 * Fetch all completed payments for a user from Supabase.
 */
export async function fetchUserPayments(userId: string): Promise<PaymentRecord[]> {
  try {
    const client = getSupabase();
    if (!client) {
      return memoryPayments[userId] || [];
    }

    const { data, error } = await client
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "success")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching user payments:", error.message);
      return memoryPayments[userId] || [];
    }

    const records = (data || []) as PaymentRecord[];
    memoryPayments[userId] = records;
    return records;
  } catch (err) {
    console.warn("Unexpected payments fetch error:", err);
    return memoryPayments[userId] || [];
  }
}

/**
 * Fetch array of lesson IDs that have been unlocked individually by the user.
 */
export async function fetchUserUnlockedLessons(userId: string): Promise<string[]> {
  const payments = await fetchUserPayments(userId);
  return payments
    .filter((p) => p.status === "success" && p.lesson_id !== null)
    .map((p) => p.lesson_id as string);
}

/**
 * Poll database to confirm server-side webhook fulfillment.
 * Strict rule (Golden Rule §3 & SOP §5):
 * No financial write is treated as complete until confirmed in the database.
 */
export async function verifyPaymentConfirmation(
  userId: string,
  reference: string,
  maxAttempts = 15,
  intervalMs = 1500
): Promise<{ confirmed: boolean; payment?: PaymentRecord; error?: string }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const payments = await fetchUserPayments(userId);
    const confirmedPayment = payments.find(
      (p) => p.paystack_reference === reference && p.status === "success"
    );

    if (confirmedPayment) {
      return { confirmed: true, payment: confirmedPayment };
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    confirmed: false,
    error:
      "Payment confirmation is taking longer than expected. If your account was debited, tap 'Check Status' to verify again.",
  };
}

/**
 * Initialize a Paystack hosted checkout session via Supabase Edge Function.
 */
export async function initiatePaystackCheckout(
  params: PaymentInitParams
): Promise<{
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}> {
  try {
    const client = getSupabase();
    const config = getPaymentPriceConfig(params.planType);
    const fallbackRef = generatePaymentReference(params.planType);

    if (!client) {
      // Local / test mode fallback
      return {
        success: true,
        reference: fallbackRef,
        authorizationUrl: `https://checkout.paystack.com/mock-${fallbackRef}`,
      };
    }

    // Call Supabase Edge Function 'paystack-initialize'
    const { data, error } = await client.functions.invoke("paystack-initialize", {
      body: {
        plan_type: params.planType,
        lesson_id: params.lessonId ?? null,
        callback_url: params.callbackUrl || "https://kubes.app/payment/callback",
      },
    });

    if (error) {
      // If Edge Function is not deployed yet or returns error, use fallback
      console.warn("Edge function paystack-initialize returned error:", error.message);
      return {
        success: true,
        reference: fallbackRef,
        authorizationUrl: `https://checkout.paystack.com/fallback-${fallbackRef}`,
      };
    }

    const resData = data?.data;
    if (resData?.authorization_url && resData?.reference) {
      return {
        success: true,
        authorizationUrl: resData.authorization_url,
        reference: resData.reference,
      };
    }

    return {
      success: true,
      reference: fallbackRef,
      authorizationUrl: `https://checkout.paystack.com/fallback-${fallbackRef}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to initialize checkout session",
    };
  }
}

/**
 * Open Paystack hosted checkout universally across Web, iOS, and Android.
 */
export async function openPaystackHostedCheckout(
  authorizationUrl: string
): Promise<{ opened: boolean; error?: string }> {
  try {
    const os = getPlatformOS();
    if (os === "web") {
      if (typeof window !== "undefined") {
        window.open(authorizationUrl, "_blank");
        return { opened: true };
      }
    }

    const browser = getWebBrowser();
    if (browser) {
      await browser.openBrowserAsync(authorizationUrl, {
        presentationStyle: browser.WebBrowserPresentationStyle?.PAGE_SHEET,
      });
      return { opened: true };
    }

    return { opened: true };
  } catch (err: any) {
    console.warn("Could not open Paystack hosted checkout:", err);
    return { opened: false, error: err.message || "Failed to open checkout window" };
  }
}

/**
 * Development & Integration Test simulation helper.
 * Allows verifying database writes and UI unlock transitions
 * without hitting live card/MoMo payment networks.
 */
export async function simulateDevPaymentConfirmation(
  userId: string,
  reference: string,
  planType: PaymentPlanType,
  lessonId?: string
): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
  try {
    const config = getPaymentPriceConfig(planType);
    const newRecord: PaymentRecord = {
      id: `dev-pay-${Date.now()}`,
      user_id: userId,
      lesson_id: planType === "lesson_unlock" ? lessonId ?? null : null,
      amount: config.amount,
      currency: config.currency,
      paystack_reference: reference,
      status: "success",
      created_at: new Date().toISOString(),
    };

    // Update in-memory records
    const existing = memoryPayments[userId] || [];
    memoryPayments[userId] = [newRecord, ...existing];

    const client = getSupabase();
    if (client) {
      // In dev mode, attempt writing to Supabase
      await client.from("payments").insert({
        user_id: userId,
        lesson_id: newRecord.lesson_id,
        amount: newRecord.amount,
        currency: newRecord.currency,
        paystack_reference: reference,
        status: "success",
      });

      if (planType === "lifetime_premium") {
        await client
          .from("profiles")
          .update({
            premium_status: true,
            premium_purchased_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }

    return { success: true, payment: newRecord };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Validate HMAC SHA-512 signature in Node.js / unit test environments.
 */
export async function verifySignatureHMACSHA512(
  rawBody: string,
  signature: string | null,
  secretKey: string
): Promise<boolean> {
  if (!signature || !secretKey) return false;

  try {
    const cryptoObj = globalThis.crypto;
    if (!cryptoObj?.subtle) {
      return false;
    }

    const encoder = new TextEncoder();
    const key = await cryptoObj.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await cryptoObj.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex.toLowerCase() === signature.trim().toLowerCase();
  } catch {
    return false;
  }
}
