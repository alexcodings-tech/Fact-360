import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Public: list active assessments */
export const listAssessments = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("assessments")
    .select("id, slug, name, tagline, description, category, price, duration_min, badge")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Public: get one assessment by slug */
export const getAssessmentBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: a, error } = await sb
      .from("assessments")
      .select("id, slug, name, tagline, description, category, price, duration_min, badge, sections(id, slug, name, weight, order_index, questions(id, text, options, order_index, dimension))")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!a) throw new Error("Not found");
    const sections = (a.sections ?? [])
      .sort((x: any, y: any) => x.order_index - y.order_index)
      .map((s: any) => ({ ...s, questions: (s.questions ?? []).sort((x: any, y: any) => x.order_index - y.order_index) }));
    return { ...a, sections };
  });

/** Authed: start or resume an attempt */
export const startAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: a } = await supabase.from("assessments").select("id, price").eq("slug", data.slug).maybeSingle();
    if (!a) throw new Error("Assessment not found");

    // Make sure every started assessment shows up in the user's purchase history.
    const { data: existingPurchase } = await supabase
      .from("purchases").select("id").eq("user_id", userId).eq("assessment_id", a.id).eq("status", "paid").maybeSingle();
    if (!existingPurchase) {
      await supabase.from("purchases").insert({
        user_id: userId,
        assessment_id: a.id,
        amount: a.price,
        currency: "INR",
        provider: "razorpay",
        order_id: "order_mock_" + Math.random().toString(36).slice(2, 10),
        payment_id: "pay_mock_" + Math.random().toString(36).slice(2, 10),
        status: "paid",
      });
    }

    const { data: existing } = await supabase
      .from("attempts").select("id, status").eq("user_id", userId).eq("assessment_id", a.id).eq("status", "in_progress").maybeSingle();
    if (existing) return { attemptId: existing.id };
    const { data: created, error } = await supabase.from("attempts").insert({ user_id: userId, assessment_id: a.id }).select("id").single();
    if (error) throw new Error(error.message);
    return { attemptId: created.id };
  });

/** Authed: get attempt */
export const getAttempt = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: attempt, error } = await supabase
      .from("attempts")
      .select("id, status, progress, assessment_id, assessments(id, slug, name, tagline, sections(id, slug, name, weight, order_index, questions(id, text, options, order_index, dimension, code, icon)))")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!attempt) throw new Error("Attempt not found");
    const { data: responses } = await supabase
      .from("responses").select("question_id, score, selected_label").eq("attempt_id", attempt.id);
    const a: any = attempt.assessments;
    const sections = (a?.sections ?? [])
      .sort((x: any, y: any) => x.order_index - y.order_index)
      .map((s: any) => ({ ...s, questions: (s.questions ?? []).sort((x: any, y: any) => x.order_index - y.order_index) }));
    return {
      id: attempt.id,
      status: attempt.status,
      assessment: { id: a.id, slug: a.slug, name: a.name, tagline: a.tagline, sections },
      responses: responses ?? [],
    };
  });

export const saveResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      attemptId: z.string().uuid(),
      questionId: z.string().uuid(),
      score: z.number().int().min(0).max(100),
      selectedLabel: z.string().min(1).max(500),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("responses").upsert(
      { attempt_id: data.attemptId, question_id: data.questionId, score: data.score, selected_label: data.selectedLabel },
      { onConflict: "attempt_id,question_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Authed: mark the attempt submitted immediately (fast) so the client can see the thank-you page. */
export const markAttemptSubmitted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: attempt, error } = await supabase
      .from("attempts")
      .select("id, user_id")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (error || !attempt) throw new Error(error?.message ?? "Attempt not found");
    if (attempt.user_id !== userId) throw new Error("Forbidden");
    await supabase
      .from("attempts")
      .update({ status: "submitted", progress: 100, submitted_at: new Date().toISOString() })
      .eq("id", data.attemptId);
    return { ok: true };
  });

/** Authed: submit + generate the AI report for one attempt. */
export const submitAndGenerateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { generateReportForAttempt } = await import("./report-generation.server");
    return generateReportForAttempt(context.supabase, context.userId, data.attemptId);
  });

/**
 * Authed: generate reports for any submitted attempt of the signed-in user that
 * has no report yet. Called from the thank-you page and the dashboard so the
 * admin review queue always receives the report, even if the first background
 * call was interrupted.
 */
export const ensureMyReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: attempts } = await supabase
      .from("attempts")
      .select("id, reports(id)")
      .eq("user_id", userId)
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(5);
    const pending = (attempts ?? []).filter((a: any) => !(a.reports ?? []).length);
    if (!pending.length) return { generated: 0, pending: 0 };
    const { generateReportForAttempt } = await import("./report-generation.server");
    let generated = 0;
    for (const a of pending) {
      try {
        await generateReportForAttempt(supabase, userId, a.id);
        generated += 1;
      } catch (e) {
        console.error("ensureMyReports failed for attempt", a.id, e);
      }
    }
    return { generated, pending: pending.length - generated };
  });

export const listMyAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("attempts")
      .select("id, status, progress, created_at, submitted_at, assessment:assessments(id, slug, name, category), report:reports(id, overall_score, type_code)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: report, error } = await supabase
      .from("reports")
      .select("*, assessment:assessments(name, slug, tagline), attempt:attempts(submitted_at)")
      .eq("attempt_id", data.attemptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!report) throw new Error("Report not found");
    return report;
  });

/** Authed: latest report's action plan (used by the Action Plan page). */
export const getMyActionPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("reports")
      .select("id, attempt_id, overall_score, action_plan, gaps, strengths, growth_opportunity, created_at, assessment:assessments(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  });
