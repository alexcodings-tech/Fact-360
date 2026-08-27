import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!data?.some((r: any) => r.role === "admin")) throw new Error("Forbidden");
}

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, company, title, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("attempts")
      .select("id, status, progress, created_at, submitted_at, user:profiles(id, full_name, company, title, phone), assessment:assessments(name, slug), report:reports(id, overall_score, type_code, status, approved_at)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListAssessments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("assessments")
      .select("id, slug, name, category, price, duration_min, is_active, sections(id)")
      .order("created_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetAssessment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: a } = await supabase
      .from("assessments")
      .select("*, sections(*, questions(*))")
      .eq("id", data.id)
      .maybeSingle();
    return a;
  });

export const adminCreateAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      slug: z.string().min(2).max(60),
      name: z.string().min(2).max(200),
      tagline: z.string().max(200).optional(),
      description: z.string().max(2000).optional(),
      category: z.string().min(2).max(50),
      price: z.number().min(0),
      duration_min: z.number().int().min(5).max(300),
      badge: z.string().max(50).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: created, error } = await supabase.from("assessments").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    return created;
  });

export const adminGrantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: data.user_id, role: "admin" as const });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [u, at, rep, pur] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("attempts").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }),
      supabase.from("purchases").select("amount", { count: "exact" }).eq("status", "paid"),
    ]);
    const revenue = (pur.data ?? []).reduce((s, r: any) => s + Number(r.amount ?? 0), 0);
    return { users: u.count ?? 0, attempts: at.count ?? 0, reports: rep.count ?? 0, revenue };
  });

/** Admin: full report for review (bypasses the client-facing approval filter via admin RLS). */
export const adminGetReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attemptId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: report, error } = await supabase
      .from("reports")
      .select("*, assessment:assessments(name, slug, tagline), attempt:attempts(submitted_at, user_id, user:profiles(full_name, company, title))")
      .eq("attempt_id", data.attemptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!report) throw new Error("Report not found");

    // Documents this client uploaded while answering — admin-only view.
    const { data: rows } = await supabase
      .from("responses")
      .select("attachments, question:questions(text)")
      .eq("attempt_id", data.attemptId);
    const raw = ((rows ?? []) as any[]).flatMap((r: any) =>
      (((r.attachments as any[]) ?? []).map((att: any) => ({ ...att, question: r.question?.text ?? "" }))),
    );
    let uploads: any[] = [];
    if (raw.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      uploads = await Promise.all(
        raw.map(async (att: any) => {
          const { data: signed } = await supabaseAdmin.storage.from("assessment-uploads").createSignedUrl(att.path, 3600);
          return { ...att, url: signed?.signedUrl ?? null };
        }),
      );
    }
    return { ...report, uploads };
  });

/** Admin: save edits and optionally approve + release the report to the client. */
export const adminSaveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
  attemptId: z.string().uuid(),
  executive_summary: z.string().max(6000).optional(),
  growth_opportunity: z.string().max(6000).optional(),
  overall_score: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string().max(600)).max(20).optional(),
  gaps: z.array(z.string().max(600)).max(20).optional(),
  root_causes: z.array(z.object({
    symptom: z.string().max(600),
    cause: z.string().max(1000),
  })).max(20).optional(),
  action_plan: z.array(z.object({
    priority: z.string().max(10),
    title: z.string().max(300),
    outcome: z.string().max(1000),
    timeframe: z.string().max(60),
  })).max(20).optional(),
      approve: z.boolean().optional(),
    }).parse(d),
  )

  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { attemptId, approve, ...fields } = data;
    const patch: any = { ...fields };
    if (approve) {
      patch.status = "approved";
      patch.approved_by = userId;
      patch.approved_at = new Date().toISOString();
    }
    const { error } = await supabase.from("reports").update(patch).eq("attempt_id", attemptId);
    if (error) throw new Error(error.message);
    return { ok: true, approved: !!approve };
  });

/** Admin: every registered user with their saved contact details. */
export const adminListContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, company, phone, email");
    const byId = new Map<string, any>(((profiles ?? []) as any[]).map((p: any) => [p.id, p]));
    return ((authUsers?.users ?? []) as any[]).map((u: any) => {
      const p = byId.get(u.id) ?? {};
      return {
        id: u.id,
        email: (p.email as string) || (u.email as string) || "",
        full_name: (p.full_name as string) || "",
        company: (p.company as string) || "",
        phone: (p.phone as string) || "",
      };
    }).filter((u) => !!u.email);
  });

/** Admin: send a broadcast email to selected registered users. */
export const adminSendBulkEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      recipients: z.array(z.string().email()).min(1).max(500),
      subject: z.string().min(2).max(200),
      message: z.string().min(2).max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      throw new Error("Email sending is not configured yet. Add the email service key to enable broadcasts.");
    }
    const from = process.env["EMAIL_FROM"] || "FACT 360 <onboarding@resend.dev>";
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">${
      data.message.split("\n").map((l) => `<p style="margin:0 0 12px">${l.replace(/</g, "&lt;")}</p>`).join("")
    }</div>`;

    let sent = 0;
    const failed: string[] = [];
    for (const to of data.recipients) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject: data.subject, html }),
      });
      if (res.ok) sent += 1;
      else failed.push(to);
    }
    return { sent, failed };
  });
