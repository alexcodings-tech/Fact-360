import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const DEPARTMENT_CATALOG = [
  { key: "hr", name: "Human Resources" },
  { key: "finance", name: "Finance & Accounts" },
  { key: "operations", name: "Operations" },
  { key: "marketing", name: "Marketing & Sales" },
  { key: "it", name: "IT & Technology" },
  { key: "quality", name: "Quality & Compliance" },
] as const;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function assertAdminRole(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!data?.some((r: any) => r.role === "admin")) throw new Error("Forbidden");
}

const detailsSchema = z.object({
  name: z.string().min(2).max(200),
  industry: z.string().max(120).optional(),
  org_type: z.string().max(120).optional(),
  company_size: z.string().max(60).optional(),
  business_position: z.string().max(2000).optional(),
  objectives: z.string().max(2000).optional(),
  current_level: z.number().int().min(1).max(5),
  target_level: z.number().int().min(1).max(5),
  director_name: z.string().max(160).optional(),
  director_email: z.string().max(200).optional(),
  director_phone: z.string().max(40).optional(),
});

/** Director: create or update the organisation profile */
export const saveOrganisation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => detailsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: assessment } = await supabase.from("assessments").select("id").eq("slug", "org-360").maybeSingle();
    const { data: existing } = await supabase.from("organisations").select("id").eq("director_id", userId).maybeSingle();

    if (existing) {
      const { error } = await supabase.from("organisations").update(data as any).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }

    const { data: created, error } = await supabase
      .from("organisations")
      .insert({ ...(data as any), director_id: userId, assessment_id: assessment?.id ?? null, status: "details" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Director acts as the first "department" so the same response engine is reused.
    const sb = await admin();
    const { data: sec } = await sb
      .from("sections").select("id").eq("assessment_id", assessment?.id).eq("audience", "director").maybeSingle();
    await sb.from("org_departments").insert({
      organisation_id: created.id,
      key: "director",
      name: "Director / Leadership",
      section_id: sec?.id ?? null,
      respondent_name: data.director_name ?? null,
      respondent_email: data.director_email ?? null,
    });
    return { id: created.id };
  });

/** Director: my organisation with departments */
export const getMyOrganisation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: org } = await supabase
      .from("organisations")
      .select("*, org_departments(*)")
      .eq("director_id", userId)
      .maybeSingle();
    if (!org) return null;
    const { data: report } = await supabase
      .from("org_reports").select("*").eq("organisation_id", (org as any).id).eq("status", "approved")
      .order("version", { ascending: false }).limit(1).maybeSingle();
    return { ...(org as any), report: report ?? null };
  });

/** Director: confirm the process and open the director questionnaire */
export const confirmProcess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("organisations")
      .update({ process_confirmed_at: new Date().toISOString(), status: "director" } as any)
      .eq("director_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Director: open the department links based on the chosen departments */
export const openDepartments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ keys: z.array(z.string().max(40)).min(1).max(12) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: org } = await supabase.from("organisations").select("id, assessment_id").eq("director_id", userId).maybeSingle();
    if (!org) throw new Error("Organisation not found");

    const sb = await admin();
    const { data: sections } = await sb
      .from("sections").select("id, audience").eq("assessment_id", (org as any).assessment_id);
    const byAudience = new Map((sections ?? []).map((s: any) => [s.audience, s.id]));

    for (const key of data.keys) {
      const known = DEPARTMENT_CATALOG.find((d) => d.key === key);
      await sb.from("org_departments").upsert(
        {
          organisation_id: (org as any).id,
          key,
          name: known?.name ?? key,
          section_id: byAudience.get(key) ?? null,
        },
        { onConflict: "organisation_id,key" },
      );
    }
    await sb.from("organisations").update({ status: "departments" }).eq("id", (org as any).id);
    const { data: depts } = await sb.from("org_departments").select("*").eq("organisation_id", (org as any).id);
    return depts ?? [];
  });

function scoreOf(responses: any[]) {
  const scored = responses.filter((r) => typeof r.score === "number");
  if (!scored.length) return null;
  const sum = scored.reduce((t, r) => t + r.score, 0);
  return Math.round((sum / (scored.length * 5)) * 100);
}

/** Public (token gated): load a department questionnaire */
export const getDepartmentByToken = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(10).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: dept } = await sb
      .from("org_departments")
      .select("id, key, name, status, respondent_name, respondent_email, respondent_role, section_id, organisation:organisations(name)")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!dept) throw new Error("This link is not valid.");

    const { data: questions } = await sb
      .from("questions")
      .select("id, text, options, order_index, type, required")
      .eq("section_id", dept.section_id)
      .order("order_index");
    const { data: responses } = await sb
      .from("department_responses")
      .select("question_id, score, selected_label, value_text, value_number, attachments")
      .eq("department_id", dept.id);

    return { department: dept, questions: questions ?? [], responses: responses ?? [] };
  });

const answerSchema = z.object({
  token: z.string().min(10).max(80),
  questionId: z.string().uuid(),
  score: z.number().int().min(1).max(5).nullable().optional(),
  selectedLabel: z.string().max(500).nullable().optional(),
  valueText: z.string().max(5000).nullable().optional(),
  valueNumber: z.number().nullable().optional(),
});

/** Public (token gated): save one answer */
export const saveDepartmentAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => answerSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: dept } = await sb.from("org_departments").select("id, status").eq("access_token", data.token).maybeSingle();
    if (!dept) throw new Error("This link is not valid.");
    if (dept.status === "submitted") throw new Error("This assessment has already been submitted.");

    const { error } = await sb.from("department_responses").upsert(
      {
        department_id: dept.id,
        question_id: data.questionId,
        score: data.score ?? null,
        selected_label: data.selectedLabel ?? null,
        value_text: data.valueText ?? null,
        value_number: data.valueNumber ?? null,
      },
      { onConflict: "department_id,question_id" },
    );
    if (error) throw new Error(error.message);
    await sb.from("org_departments").update({ status: "in_progress" }).eq("id", dept.id).eq("status", "pending");
    return { ok: true };
  });

/** Public (token gated): upload a supporting file for a question */
export const uploadDepartmentFile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      token: z.string().min(10).max(80),
      questionId: z.string().uuid(),
      filename: z.string().min(1).max(200),
      contentType: z.string().min(3).max(120),
      base64: z.string().min(10),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: dept } = await sb.from("org_departments").select("id, organisation_id").eq("access_token", data.token).maybeSingle();
    if (!dept) throw new Error("This link is not valid.");

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.length > 15 * 1024 * 1024) throw new Error("File is larger than 15MB.");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${dept.organisation_id}/${dept.id}/${Date.now()}-${safe}`;
    const { error: upErr } = await sb.storage.from("assessment-uploads").upload(path, bytes, { contentType: data.contentType });
    if (upErr) throw new Error(upErr.message);

    const { data: existing } = await sb
      .from("department_responses").select("attachments").eq("department_id", dept.id).eq("question_id", data.questionId).maybeSingle();
    const attachments = [...((existing?.attachments as any[]) ?? []), { path, name: data.filename, type: data.contentType }];
    await sb.from("department_responses").upsert(
      { department_id: dept.id, question_id: data.questionId, attachments },
      { onConflict: "department_id,question_id" },
    );
    return { attachments };
  });

/** Public (token gated): submit the department assessment */
export const submitDepartment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      token: z.string().min(10).max(80),
      respondentName: z.string().min(2).max(160),
      respondentEmail: z.string().max(200).optional(),
      respondentRole: z.string().max(160).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: dept } = await sb.from("org_departments").select("id, key, organisation_id").eq("access_token", data.token).maybeSingle();
    if (!dept) throw new Error("This link is not valid.");

    const { data: responses } = await sb.from("department_responses").select("score").eq("department_id", dept.id);
    await sb.from("org_departments").update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      respondent_name: data.respondentName,
      respondent_email: data.respondentEmail ?? null,
      respondent_role: data.respondentRole ?? null,
      score: scoreOf(responses ?? []),
    }).eq("id", dept.id);

    if (dept.key === "director") {
      await sb.from("organisations").update({ status: "director_done" }).eq("id", dept.organisation_id);
    }
    return { ok: true };
  });

/** Director: token of my own director questionnaire */
export const getDirectorToken = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: org } = await supabase.from("organisations").select("id").eq("director_id", userId).maybeSingle();
    if (!org) return null;
    const { data: dept } = await supabase
      .from("org_departments").select("access_token").eq("organisation_id", (org as any).id).eq("key", "director").maybeSingle();
    return (dept as any)?.access_token ?? null;
  });

/* ---------------- Admin ---------------- */

export const adminListOrganisations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdminRole(supabase, userId);
    const { data } = await supabase
      .from("organisations")
      .select("id, name, industry, company_size, current_level, status, created_at, org_departments(id, key, name, status, score)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminGetOrganisation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdminRole(supabase, userId);
    const { data: org } = await supabase
      .from("organisations").select("*, org_departments(*)").eq("id", data.id).maybeSingle();
    if (!org) throw new Error("Not found");

    const sb = await admin();
    const deptIds = ((org as any).org_departments ?? []).map((d: any) => d.id);
    const { data: responses } = deptIds.length
      ? await sb
          .from("department_responses")
          .select("department_id, score, selected_label, value_text, value_number, attachments, question:questions(text, type)")
          .in("department_id", deptIds)
      : { data: [] as any[] };

    const { data: reports } = await supabase
      .from("org_reports").select("*").eq("organisation_id", data.id).order("version", { ascending: false });

    // Signed URLs for uploaded documents
    const withUrls = await Promise.all(
      (responses ?? []).map(async (r: any) => {
        const atts = await Promise.all(
          ((r.attachments as any[]) ?? []).map(async (a: any) => {
            const { data: signed } = await sb.storage.from("assessment-uploads").createSignedUrl(a.path, 3600);
            return { ...a, url: signed?.signedUrl ?? null };
          }),
        );
        return { ...r, attachments: atts };
      }),
    );

    return { organisation: org, responses: withUrls, reports: reports ?? [] };
  });

const AREAS = ["Governance & Strategy", "People & Culture", "Operations & Delivery", "Financial Discipline", "Brand & Market", "Technology & Data"];

export const adminGenerateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), guidance: z.string().max(4000).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdminRole(supabase, userId);

    const sb = await admin();
    const { data: org } = await sb.from("organisations").select("*, org_departments(*)").eq("id", data.id).maybeSingle();
    if (!org) throw new Error("Organisation not found");

    const deptIds = (org.org_departments ?? []).map((d: any) => d.id);
    const { data: responses } = deptIds.length
      ? await sb.from("department_responses")
          .select("department_id, score, selected_label, value_text, value_number, question:questions(text)")
          .in("department_id", deptIds)
      : { data: [] as any[] };

    const deptById = new Map((org.org_departments ?? []).map((d: any) => [d.id, d]));
    const departmentScores: Record<string, number> = {};
    for (const d of org.org_departments ?? []) if (typeof d.score === "number") departmentScores[d.name] = d.score;
    const scores = Object.values(departmentScores);
    const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const transcript = (responses ?? [])
      .map((r: any) => {
        const dept = deptById.get(r.department_id) as any;
        const answer = r.selected_label ?? r.value_text ?? (r.value_number !== null ? String(r.value_number) : "—");
        return `[${dept?.name ?? "?"}] ${r.question?.text}: ${answer}`;
      })
      .join("\n")
      .slice(0, 24000);

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey, undefined, { structuredOutputs: true } as any);
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");

    const prompt = `You are a senior management consultant producing a FACT 360 organisational assessment report.

Organisation: ${org.name}
Industry: ${org.industry ?? "n/a"} | Type: ${org.org_type ?? "n/a"} | Size: ${org.company_size ?? "n/a"}
Business position: ${org.business_position ?? "n/a"}
Key objectives: ${org.objectives ?? "n/a"}
Current maturity level: ${org.current_level}/5, target level: ${org.target_level}/5
Department scores: ${Object.entries(departmentScores).map(([k, v]) => `${k} ${v}%`).join(", ") || "n/a"}
Overall score: ${overall}%
${data.guidance ? `Additional admin guidance: ${data.guidance}` : ""}

Assessment responses:
${transcript || "No responses captured yet."}

Score each of these six areas from 0-100 based strictly on the evidence above: ${AREAS.join(", ")}.
Write concise, specific, evidence-based content. Reference departments by name. No filler.
Keep each list to 4-6 items and each narrative field to 3-5 sentences.
EXCEPTION: strengths and gaps must each have EXACTLY 5 items, and each item must be a short phrase of AT MOST 10 words.`;

    const schema = z.object({
      executive_summary: z.string(),
      metric_scores: z.array(z.object({ area: z.string(), score: z.number(), comment: z.string() })),
      department_analysis: z.array(z.object({ department: z.string(), score: z.number(), observation: z.string() })),
      strengths: z.array(z.string()),
      gaps: z.array(z.string()),
      improvement_areas: z.array(z.string()),
      recommendations: z.array(z.string()),
      priority_actions: z.array(z.object({ priority: z.string(), action: z.string(), owner: z.string(), timeframe: z.string() })),
      development_suggestions: z.array(z.string()),
      maturity_path: z.string(),
    });

    let draft: any;
    try {
      const result = streamText({ model: gateway("openai/gpt-5.6-sol"), prompt, output: Output.object({ schema }) } as any);
      draft = await (result as any).output;
    } catch (e: any) {
      if (NoObjectGeneratedError.isInstance(e)) {
        try { draft = JSON.parse(String(e.text ?? "{}")); } catch { throw new Error("AI draft could not be generated. Try again."); }
      } else throw new Error(e?.message ?? "AI draft failed");
    }

    const metricScores: Record<string, number> = {};
    for (const m of draft?.metric_scores ?? []) metricScores[m.area] = m.score;

    const { data: last } = await sb
      .from("org_reports").select("version").eq("organisation_id", data.id).order("version", { ascending: false }).limit(1).maybeSingle();
    const version = ((last as any)?.version ?? 0) + 1;

    const { data: created, error } = await sb.from("org_reports").insert({
      organisation_id: data.id,
      version,
      ai_draft: draft,
      metric_scores: metricScores,
      department_scores: departmentScores,
      overall_score: overall,
      status: "draft",
    }).select("*").single();
    if (error) throw new Error(error.message);
    return created;
  });

export const adminSaveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reportId: z.string().uuid(), edited: z.any() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdminRole(supabase, userId);
    const { error } = await supabase.from("org_reports").update({ edited: data.edited, status: "reviewed" } as any).eq("id", data.reportId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminApproveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reportId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdminRole(supabase, userId);
    const { error } = await supabase
      .from("org_reports")
      .update({ status: "approved", approved_by: userId, approved_at: new Date().toISOString() } as any)
      .eq("id", data.reportId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
