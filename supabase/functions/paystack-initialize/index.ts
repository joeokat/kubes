// Supabase Edge Function: paystack-initialize
// Creates a server-side Paystack transaction session with canonical pricing
// and metadata, returning the hosted checkout URL to the client.
// Golden Rule: Paystack secret key lives ONLY here in Edge Function environment.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user JWT with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { plan_type, lesson_id, callback_url } = body;

    if (plan_type !== "lifetime_premium" && plan_type !== "lesson_unlock") {
      return new Response(JSON.stringify({ error: "Invalid plan_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (plan_type === "lesson_unlock" && !lesson_id) {
      return new Response(JSON.stringify({ error: "lesson_id required for lesson_unlock" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Canonical pricing (SOP §8)
    // GH₵0.50 per lesson (50 pesewas)
    // $20.00 USD for lifetime premium (2000 cents)
    const isLifetime = plan_type === "lifetime_premium";
    const amountInSmallestUnit = isLifetime ? 2000 : 50;
    const currency = isLifetime ? "USD" : "GHS";

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret || paystackSecret.startsWith("pk_") || paystackSecret === "placeholder") {
      // In development mode or missing real secret key, return simulated reference
      const devRef = `kubes_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return new Response(
        JSON.stringify({
          status: true,
          message: "Development mode checkout initialized",
          data: {
            authorization_url: `https://checkout.paystack.com/dev-mock-${devRef}`,
            access_code: `mock_${devRef}`,
            reference: devRef,
            amount: amountInSmallestUnit,
            currency,
            is_dev_simulation: true,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = `kubes_${isLifetime ? "prem" : "les"}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call Paystack Transaction Initialize
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInSmallestUnit,
        currency,
        reference,
        callback_url: callback_url || "https://kubes.app/payment/callback",
        metadata: {
          user_id: user.id,
          plan_type,
          lesson_id: lesson_id ?? null,
          custom_fields: [
            {
              display_name: "App Name",
              variable_name: "app_name",
              value: "Kubes",
            },
            {
              display_name: "Plan",
              variable_name: "plan",
              value: isLifetime ? "Lifetime Premium Access" : `Lesson Unlock (${lesson_id})`,
            },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack API error:", paystackData);
      return new Response(
        JSON.stringify({ error: paystackData.message || "Failed to initialize payment with Paystack" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(paystackData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unhandled initialize error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

