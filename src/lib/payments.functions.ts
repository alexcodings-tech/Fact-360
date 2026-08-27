import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Mock Razorpay flow.
 * In production this will create a real Razorpay order via the Razorpay SDK
 * and the client will call the Razorpay Checkout widget. For now we mark the
 * purchase as `mock` paid so the user can immediately start the assessment.
 */
export const mockRazorpayCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    slug: z.string(),
    profile: z.object({
      full_name: z.string().min(2).max(120),
      title: z.string().min(2).max(120),
      company: z.string().min(1).max(160),
      phone: z.string().min(6).max(30),
      email: z.string().email().max(180).optional(),
      preferred_language: z.enum(["en", "ta", "ml", "kn", "te"]).default("en"),
    }),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: a, error } = await supabase
      .from("assessments")
      .select("id, price")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error || !a) throw new Error("Assessment not found");

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        full_name: data.profile.full_name,
        title: data.profile.title,
        company: data.profile.company,
        phone: data.profile.phone,
        // Stored so the team can contact and follow up with the customer later.
        ...(data.profile.email ? { email: data.profile.email } : {}),
        preferred_language: data.profile.preferred_language,
      })
      .eq("id", userId);
    if (profileErr) throw new Error(profileErr.message);

    const fakeOrderId = "order_mock_" + Math.random().toString(36).slice(2, 10);
    const fakePaymentId = "pay_mock_" + Math.random().toString(36).slice(2, 10);

    const { data: purchase, error: pErr } = await supabase
      .from("purchases")
      .insert({
        user_id: userId,
        assessment_id: a.id,
        amount: a.price,
        currency: "INR",
        provider: "razorpay",
        order_id: fakeOrderId,
        payment_id: fakePaymentId,
        status: "paid",
      })
      .select("id")
      .single();
    if (pErr) throw new Error(pErr.message);
    return { purchaseId: purchase.id, slug: data.slug, mock: true };
  });

export const listMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("purchases")
      .select("id, amount, currency, status, order_id, payment_id, created_at, assessment:assessments(slug, name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
