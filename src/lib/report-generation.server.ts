import { z } from "zod";

const LANG_NAMES: Record<string, string> = {
  en: "English", ta: "Tamil", ml: "Malayalam", kn: "Kannada", te: "Telugu",
};

const TYPE_NAMES: Record<string, string> = {
  INTJ: "Architect", INTP: "Logician", ENTJ: "Commander", ENTP: "Debater",
  INFJ: "Advocate", INFP: "Mediator", ENFJ: "Protagonist", ENFP: "Campaigner",
  ISTJ: "Logistician", ISFJ: "Defender", ESTJ: "Executive", ESFJ: "Consul",
  ISTP: "Virtuoso", ISFP: "Adventurer", ESTP: "Entrepreneur", ESFP: "Entertainer",
};

const TRAITS: Record<string, { name: string; strength: string; gap: string; action: string }> = {
  E: { name: "Extraversion", strength: "Creates energy through people, discussion and fast stakeholder alignment.", gap: "May decide too quickly before quieter voices are heard.", action: "Schedule short reflection windows before high-impact decisions." },
  I: { name: "Introversion", strength: "Brings depth, focus and careful thinking before speaking.", gap: "Important ideas may stay private unless deliberately invited out.", action: "Share one written pre-read or decision note before key meetings." },
  S: { name: "Sensing", strength: "Grounds work in facts, details, proven methods and practical execution.", gap: "May underweight future possibilities when the current facts feel sufficient.", action: "Add one future-scenario question to every planning review." },
  N: { name: "Intuition", strength: "Connects patterns quickly and sees future possibilities others may miss.", gap: "Execution details can be skipped when the big picture feels obvious.", action: "Pair every new idea with a concrete owner, deadline and success measure." },
  T: { name: "Thinking", strength: "Uses logic, objectivity and fair standards under pressure.", gap: "Direct feedback can be experienced as low empathy by some colleagues.", action: "Lead feedback with context, impact and one supportive next step." },
  F: { name: "Feeling", strength: "Builds trust, inclusion and people-first collaboration.", gap: "Harmony may delay hard calls when performance standards need clarity.", action: "Separate care for people from clarity on decisions and accountability." },
  J: { name: "Judging", strength: "Creates order, closure, deadlines and dependable follow-through.", gap: "May become rigid when new information requires a plan change.", action: "Keep a deliberate review point where the plan can be revised." },
  P: { name: "Perceiving", strength: "Adapts quickly, explores options and stays flexible in changing conditions.", gap: "Too many open options can slow closure and team confidence.", action: "Set a decision deadline before exploring alternatives." },
};

function asNonEmptyStrings(value: unknown, fallback: string[]) {
  const arr = Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
  return arr.length ? arr : fallback;
}

function toShortPoints(value: string[], max = 5, maxWords = 10) {
  return value
    .map((s) => s.replace(/\s+/g, " ").trim().replace(/[.;]+$/, ""))
    .filter(Boolean)
    .map((s) => s.split(" ").slice(0, maxWords).join(" "))
    .slice(0, max);
}

function asActionPlan(value: unknown, fallback: { priority: "P1" | "P2" | "P3"; title: string; outcome: string; timeframe: string }[]) {
  const arr = Array.isArray(value)
    ? value.filter((x: any) => x?.title && x?.outcome).map((x: any, i) => ({
        priority: ["P1", "P2", "P3"].includes(x.priority) ? x.priority : (i < 2 ? "P1" : i < 4 ? "P2" : "P3"),
        title: String(x.title),
        outcome: String(x.outcome),
        timeframe: String(x.timeframe ?? "30 days"),
      }))
    : [];
  return arr.length ? arr : fallback;
}

/** Shared report generation used by both the client submit flow and the auto-ensure flow. */
export async function generateReportForAttempt(supabase: any, userId: string, attemptId: string) {
    

    const { data: attempt, error: attErr } = await supabase
      .from("attempts")
      .select("id, assessment_id, assessments(name, slug, sections(id, name, weight, questions(id, text, dimension, code)))")
      .eq("id", attemptId)
      .maybeSingle();
    if (attErr || !attempt) throw new Error(attErr?.message ?? "Attempt not found");

    const { data: responses } = await supabase
      .from("responses").select("question_id, score, selected_label").eq("attempt_id", attemptId);
    const respByQ = new Map<string, any>(((responses ?? []) as any[]).map((r: any) => [r.question_id, r]));
    const a: any = attempt.assessments;

    // Load user profile for designation, company, language
    const { data: profile } = await supabase
      .from("profiles").select("full_name, title, company, preferred_language").eq("id", userId).maybeSingle();
    const designation = profile?.title ?? "Professional";
    const company = profile?.company ?? "";
    const langCode = profile?.preferred_language ?? "en";
    const languageName = LANG_NAMES[langCode] ?? "English";

    const allQuestions = (a.sections ?? []).flatMap((s: any) => s.questions ?? []);
    if ((responses ?? []).length < allQuestions.length) {
      throw new Error(`Please answer all ${allQuestions.length} questions before generating the report.`);
    }

    // MBTI pole sums (only meaningful when questions have a dimension). Used internally
    // to derive a personality code that guides the AI prompt — the code itself is NOT
    // shown to users; only the derived strengths/weaknesses are surfaced.
    const poleSums: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const poleCounts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    const sectionScores: Record<string, { name: string; score: number; weight: number }> = {};
    let hasAnyDimension = false;

    for (const s of a.sections ?? []) {
      const qs = s.questions ?? [];
      let sectionSum = 0;
      let sectionCount = 0;
      for (const q of qs) {
        const r = respByQ.get(q.id);
        const raw = r?.score ?? 3;
        const val = Math.max(1, Math.min(5, raw));
        sectionSum += val;
        sectionCount += 1;
        if (q.dimension && poleSums[q.dimension] !== undefined) {
          hasAnyDimension = true;
          poleSums[q.dimension] += val;
          poleCounts[q.dimension] += 1;
        }
      }
      // Real section score = average likert (1-5) mapped to 20-100%.
      const pct = sectionCount > 0 ? Math.round((sectionSum / (sectionCount * 5)) * 100) : 0;
      sectionScores[s.id] = { name: s.name, score: pct, weight: s.weight };
    }

    // Compare poles on AVERAGE agreement per question, so an unequal number of
    // questions per pole (e.g. 20 S questions vs 5 N questions) cannot skew the result.
    const poleAvg = (code: string) => (poleCounts[code] > 0 ? poleSums[code] / poleCounts[code] : 0);
    const pick = (a1: string, b1: string) => (poleAvg(a1) >= poleAvg(b1) ? a1 : b1);
    const typeCode = hasAnyDimension ? pick("E", "I") + pick("S", "N") + pick("T", "F") + pick("J", "P") : "";
    const typeName = TYPE_NAMES[typeCode] ?? "";

    const polePct = (a1: string, b1: string) => {
      const total = poleAvg(a1) + poleAvg(b1);
      return total > 0 ? Math.round((poleAvg(a1) / total) * 100) : 50;
    };

    const leaderOf = (a1: string, b1: string) => (poleAvg(a1) === poleAvg(b1) ? "balanced" : poleAvg(a1) > poleAvg(b1) ? a1 : b1);

    const dimensionScores = hasAnyDimension ? {
      EI: { E: poleAvg("E"), I: poleAvg("I"), ePct: polePct("E", "I"), sumE: poleSums.E, sumI: poleSums.I, leader: leaderOf("E", "I") },
      SN: { S: poleAvg("S"), N: poleAvg("N"), sPct: polePct("S", "N"), sumS: poleSums.S, sumN: poleSums.N, leader: leaderOf("S", "N") },
      TF: { T: poleAvg("T"), F: poleAvg("F"), tPct: polePct("T", "F"), sumT: poleSums.T, sumF: poleSums.F, leader: leaderOf("T", "F") },
      JP: { J: poleAvg("J"), P: poleAvg("P"), jPct: polePct("J", "P"), sumJ: poleSums.J, sumP: poleSums.P, leader: leaderOf("J", "P") },
      type_code: typeCode,
    } : null;


    const sectionValues = Object.values(sectionScores).map((s) => s.score);
    const overall = sectionValues.length ? Math.round(sectionValues.reduce((sum, score) => sum + score, 0) / sectionValues.length) : 0;


    const sortedSections = [...sectionValues.length ? Object.values(sectionScores) : []].sort((x, y) => y.score - x.score);
    const topSections = sortedSections.slice(0, Math.min(2, sortedSections.length));
    const bottomSections = sortedSections.slice(-Math.min(2, sortedSections.length)).reverse();

    const winners = hasAnyDimension ? [pick("E", "I"), pick("S", "N"), pick("T", "F"), pick("J", "P")] : [];
    const lowerPoles = hasAnyDimension
      ? [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]].map(([left, right]) => (poleAvg(left) < poleAvg(right) ? left : right))
      : [];

    const fallbackStrengths = hasAnyDimension
      ? winners.map((code) => `${TRAITS[code].name}: ${TRAITS[code].strength}`)
      : topSections.map((s) => `${s.name}: Consistent strength shown in this area (${s.score}%). Keep reinforcing the behaviours that produced this result.`);
    const fallbackGaps = hasAnyDimension
      ? lowerPoles.map((code) => `${TRAITS[code].name}: ${TRAITS[code].gap}`)
      : bottomSections.map((s) => `${s.name}: Lowest area (${s.score}%). Prioritise structured improvement here.`);
    const fallbackActionPlan = hasAnyDimension
      ? winners.map((code, i) => ({
          priority: (i < 2 ? "P1" : i === 2 ? "P2" : "P3") as "P1" | "P2" | "P3",
          title: `Use ${TRAITS[code].name} deliberately`,
          outcome: TRAITS[code].action,
          timeframe: i < 2 ? "30 days" : "60 days",
        }))
      : bottomSections.map((s, i) => ({
          priority: (i === 0 ? "P1" : "P2") as "P1" | "P2" | "P3",
          title: `Lift ${s.name}`,
          outcome: `Design one measurable initiative that moves ${s.name} up by 10 points in the next quarter.`,
          timeframe: i === 0 ? "30 days" : "60 days",
        }));

    let aiOutput: any = {
      executive_summary: "",
      strengths: [],
      gaps: [],
      action_plan: [],
      root_causes: [],
      growth_opportunity: "",
    };

    const sectionBreakdown = Object.values(sectionScores)
      .map((s) => `- ${s.name}: ${s.score}%`)
      .join("\n");

    const mbtiBlock = hasAnyDimension && dimensionScores
      ? `\nInternal personality reference (do NOT reveal this code or the letters in the report — use it only to shape the tone and insights):\n- Type code: ${typeCode} (${typeName})\n- Extraversion (E) ${poleAvg('E').toFixed(1)}/5 avg vs Introversion (I) ${poleAvg('I').toFixed(1)}/5 avg → E=${dimensionScores.EI.ePct}%, I=${100 - dimensionScores.EI.ePct}%\n- Sensing (S) ${poleAvg('S').toFixed(1)}/5 avg vs Intuition (N) ${poleAvg('N').toFixed(1)}/5 avg → S=${dimensionScores.SN.sPct}%, N=${100 - dimensionScores.SN.sPct}%\n- Thinking (T) ${poleAvg('T').toFixed(1)}/5 avg vs Feeling (F) ${poleAvg('F').toFixed(1)}/5 avg → T=${dimensionScores.TF.tPct}%, F=${100 - dimensionScores.TF.tPct}%\n- Judging (J) ${poleAvg('J').toFixed(1)}/5 avg vs Perceiving (P) ${poleAvg('P').toFixed(1)}/5 avg → J=${dimensionScores.JP.jPct}%, P=${100 - dimensionScores.JP.jPct}%\nDerive strengths from the WINNING poles (${winners.join(", ")}) and gaps from the WEAKER poles (${lowerPoles.join(", ")}), but describe them as workplace behaviours — never mention MBTI, four-letter codes, or pole letters.`
      : "";

    // Full answer transcript so the AI analyses the actual selected options, not just scores.
    const transcript = (a.sections ?? [])
      .flatMap((s: any) =>
        (s.questions ?? []).map((q: any) => {
          const r = respByQ.get(q.id);
          return `[${s.name}] ${q.text} → ${r?.selected_label ?? "(no answer)"}${typeof r?.score === "number" ? ` (${r.score}/5)` : ""}`;
        }),
      )
      .join("\n")
      .slice(0, 24000);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (apiKey) {
      try {
        const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
        const gateway = createLovableAiGatewayProvider(apiKey, undefined, { structuredOutputs: true } as any);

        const prompt = `You are a senior organisational psychologist writing a personalised professional development report.

Respondent:
- Name: ${profile?.full_name ?? "the respondent"}
- Designation: ${designation}
- Company: ${company || "n/a"}
- Assessment: ${a?.name ?? "Assessment"}
- Overall score: ${overall}%

Section scores (real, derived from the respondent's answers on a 1-5 scale):
${sectionBreakdown}

Top section(s): ${topSections.map((s) => `${s.name} (${s.score}%)`).join(", ") || "n/a"}
Lowest section(s): ${bottomSections.map((s) => `${s.name} (${s.score}%)`).join(", ") || "n/a"}
${mbtiBlock}

The respondent's actual answers (analyse these directly):
${transcript || "No answers captured."}

Write the ENTIRE response in ${languageName}.

Tailor every insight to a ${designation}. Ground each strength and gap in the ACTUAL answers and section scores above — quote the behaviour the answers reveal and how it shows up day-to-day in the ${designation} role.

REQUIREMENTS (all fields are mandatory, none may be empty):
- strengths: EXACTLY 5 items. Each item is one short phrase of AT MOST 10 words, tied to the highest-scoring answers. No sentences, no punctuation-heavy prose.
- gaps: EXACTLY 5 items. Each item is one short phrase of AT MOST 10 words, tied to the lowest-scoring answers.
- action_plan: 4-6 prioritised actions (mix of P1/P2/P3) with clear outcome and timeframe, focused on lifting the weakest areas.
- root_causes: 2-4 symptom→cause pairs explaining the biggest gaps.
- executive_summary and growth_opportunity: 2-4 sentences each, referencing the overall score, the ${designation} role, and the strongest/weakest sections. Do NOT mention MBTI, personality codes, or four-letter type codes anywhere.`;

        const schema = z.object({
          executive_summary: z.string(),
          strengths: z.array(z.string()),
          gaps: z.array(z.string()),
          action_plan: z.array(z.object({
            priority: z.enum(["P1", "P2", "P3"]),
            title: z.string(),
            outcome: z.string(),
            timeframe: z.string(),
          })),
          root_causes: z.array(z.object({ symptom: z.string(), cause: z.string() })),
          growth_opportunity: z.string(),
        });

        const { streamText, Output, NoObjectGeneratedError } = await import("ai");
        try {
          const result = streamText({ model: gateway("openai/gpt-5.6-sol"), prompt, output: Output.object({ schema }) } as any);
          aiOutput = await (result as any).output;
        } catch (e: any) {
          if (NoObjectGeneratedError.isInstance(e)) {
            aiOutput = JSON.parse(String(e.text ?? "{}"));
          } else throw e;
        }
      } catch (e) {
        console.error("AI generation failed:", e);
      }
    }


    const fallbackSummary = `As a ${designation}${company ? ` at ${company}` : ""}, your overall score is ${overall}%. Your strongest area${topSections.length > 1 ? "s are" : " is"} ${topSections.map((s) => `${s.name} (${s.score}%)`).join(", ") || "—"}, and the biggest opportunity to grow sits in ${bottomSections.map((s) => `${s.name} (${s.score}%)`).join(", ") || "—"}.`;

    aiOutput = {
      ...aiOutput,
      executive_summary: typeof aiOutput.executive_summary === "string" && aiOutput.executive_summary.trim().length
        ? aiOutput.executive_summary
        : fallbackSummary,
      strengths: toShortPoints(asNonEmptyStrings(aiOutput.strengths, fallbackStrengths)),
      gaps: toShortPoints(asNonEmptyStrings(aiOutput.gaps, fallbackGaps)),
      action_plan: asActionPlan(aiOutput.action_plan, fallbackActionPlan),
      root_causes: Array.isArray(aiOutput.root_causes) && aiOutput.root_causes.length
        ? aiOutput.root_causes
        : bottomSections.map((s) => ({ symptom: `${s.name} scored ${s.score}%`, cause: `Behaviours and habits in ${s.name} need a deliberate uplift to move this score.` })),
      growth_opportunity: typeof aiOutput.growth_opportunity === "string" && aiOutput.growth_opportunity.trim().length
        ? aiOutput.growth_opportunity
        : `Focus the next quarter on lifting ${bottomSections.map((s) => s.name).join(" and ") || "your lowest section"} while continuing to leverage ${topSections.map((s) => s.name).join(" and ") || "your top strengths"}.`,
    };


    // Only the organisational assessment goes through admin review; every other
    // module releases its report to the client immediately on completion.
    const needsAdminReview = a?.slug === "org-360";

    await supabase.from("reports").delete().eq("attempt_id", attemptId);
    const { data: report, error: repErr } = await supabase
      .from("reports")
      .insert({
        attempt_id: attemptId,
        user_id: userId,
        assessment_id: attempt.assessment_id,
        overall_score: overall,
        section_scores: sectionScores,
        type_code: typeCode,
        dimension_scores: dimensionScores,
        executive_summary: aiOutput.executive_summary,
        strengths: aiOutput.strengths,
        gaps: aiOutput.gaps,
        action_plan: aiOutput.action_plan,
        root_causes: aiOutput.root_causes,
        growth_opportunity: aiOutput.growth_opportunity,
        status: needsAdminReview ? "draft" : "approved",
        approved_at: needsAdminReview ? null : new Date().toISOString(),
      })
      .select("id").single();
    if (repErr) throw new Error(repErr.message);

    await supabase.from("attempts").update({ status: "submitted", progress: 100, submitted_at: new Date().toISOString() }).eq("id", attemptId);

    return { reportId: report.id, attemptId: attemptId };
}
