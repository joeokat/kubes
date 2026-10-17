// Supabase Edge Function: paystack-webhook
// Securely verifies Paystack payment webhooks using HMAC SHA-512
// and unlocks lesson or lifetime premium status in the database.
// SOP §5 & §8 compliant: all payment unlocks verified server-side.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Web Crypto HMAC SHA-512 signature verification
export async function verifySignature(
  rawBody: string,
  signature: string | null,
  secretKey: string
): Promise<boolean> {
  if (!signature || !secretKey) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature.toLowerCase() === signature.trim().toLowerCase();
}

// Handler
Deno.serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackSecret) {
    console.error("Missing PAYSTACK_SECRET_KEY in Edge Function environment");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const signatureHeader = req.headers.get("x-paystack-signature");
  const rawBody = await req.text();

  // Verify HMAC SHA-512
  const isValid = await verifySignature(rawBody, signatureHeader, paystackSecret);
  if (!isValid) {
    console.warn("Invalid Paystack webhook signature received");
    return new Response(
      JSON.stringify({ error: "Invalid signature" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Malformed JSON payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // We are only interested in successful charge events
  if (event.event !== "charge.success") {
    return new Response(
      JSON.stringify({ message: "Event ignored", event: event.event }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = event.data;
  const reference = data?.reference;
  const rawAmount = data?.amount; // In pesewas / cents
  const currency = data?.currency;
  const metadata = data?.metadata || {};
  const userId = metadata.user_id;
  const planType = metadata.plan_type; // 'lifetime_premium' or 'lesson_unlock'
  const lessonId = metadata.lesson_id ?? null;

  if (!userId || !reference) {
    console.warn("Missing user_id or reference in webhook metadata", metadata);
    return new Response(
      JSON.stringify({ error: "Missing required metadata (user_id, reference)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Supabase service-role client (bypasses RLS to insert verified payment)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Idempotency check: has this reference already been processed?
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("paystack_reference", reference)
    .single();

  if (existingPayment) {
    console.log(`Reference ${reference} already processed. Skipping duplicate write.`);
    return new Response(
      JSON.stringify({ status: "already_processed", id: existingPayment.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Normalize amount to standard decimal units (e.g. 50 pesewas -> 0.50 GHS, 2000 cents -> 20.00 USD)
  const normalizedAmount = typeof rawAmount === "number" ? rawAmount / 100 : 0.5;

  // Insert payment record into payments table
  const { data: paymentRecord, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      lesson_id: planType === "lesson_unlock" ? lessonId : null,
      amount: normalizedAmount,
      currency: currency || "GHS",
      paystack_reference: reference,
      status: "success",
    })
    .select()
    .single();

  if (paymentError) {
    console.error("Database error inserting payment record:", paymentError);
    return new Response(
      JSON.stringify({ error: "Failed to record payment in database", details: paymentError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // If this was a lifetime premium purchase, unlock premium in profiles
  if (planType === "lifetime_premium") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        premium_status: true,
        premium_purchased_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error upgrading user profile to premium:", profileError);
      return new Response(
        JSON.stringify({ error: "Payment recorded but profile update failed", details: profileError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  console.log(`Payment ${reference} verified and fulfilled for user ${userId} (${planType})`);

  return new Response(
    JSON.stringify({
      status: "success",
      message: "Payment successfully verified and fulfilled",
      payment_id: paymentRecord?.id,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

