import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  Gauge,
  Grid2X2,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { RadarScore } from "@/components/charts/RadarScore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/site/Logo";
import { getReport } from "@/lib/assessments.functions";
import { getAssessment, SAMPLE_FACT_SCORES, SAMPLE_LEADERSHIP_SCORES } from "@/data/assessments";
import { getPersonalityProfile } from "@/data/personality-profiles";
import {
  behaviourMetrics,
  clamp,
  temperamentSplit,
  toPoles,
  type PoleSet,
} from "@/components/report/PersonalityVisuals";
import { exportPagesToPdf, type PdfPreviewResult } from "@/lib/pdf-export";
import landscapeBackdrop from "@/assets/life-landscape-backdrop.jpg";

const SAMPLE_IDS = new Set(["fact-360", "leadership-360"]);

function buildSample(id: string) {
  if (!SAMPLE_IDS.has(id)) return null;
  const assessment = getAssessment(id);
  const isLeadership = id === "leadership-360";
  const scores = isLeadership ? SAMPLE_LEADERSHIP_SCORES : SAMPLE_FACT_SCORES;
  const fallbackSections = isLeadership
    ? ["Vision", "Execution", "People", "Communication", "Accountability"]
    : ["Governance", "People", "Operations", "Financial", "Brand", "Technology"];
  const sections = assessment?.sections.length
    ? assessment.sections
    : fallbackSections.map((name, index) => ({ id: `sample-${index}`, name, weight: 1 }));
  const section_scores = sections.reduce((acc: Record<string, any>, s: any, i: number) => {
    const vals = Object.values(scores).slice(0, -1) as number[];
    const raw = vals[i % vals.length] ?? 60;
    acc[s.id] = { name: s.name, score: isLeadership ? Math.round(raw * 20) : raw, weight: s.weight };
    return acc;
  }, {} as Record<string, { name: string; score: number; weight: number }>);
  const overall_score = isLeadership
    ? Math.round((SAMPLE_LEADERSHIP_SCORES.overall as number) * 20)
    : SAMPLE_FACT_SCORES.overall;
  return {
    attempt_id: id,
    assessment: {
      name: assessment?.name ?? (isLeadership ? "360° Leadership & Personality" : "FACT 360° Business Architecture"),
      tagline: assessment?.tagline ?? (isLeadership ? "Leadership capability at a glance" : "Business health at a glance"),
    },
    attempt: { submitted_at: new Date().toISOString() },
    section_scores,
    overall_score,
    dimension_scores: isLeadership
      ? {
          EI: { ePct: 62, leader: "E" },
          SN: { sPct: 45, leader: "N" },
          TF: { tPct: 68, leader: "T" },
          JP: { jPct: 72, leader: "J" },
          role_analysis: { target_role: "Senior Manager", result_role: "Team Leader", fit_score: 78 },
        }
      : undefined,
    executive_summary: `This sample ${assessment?.name ?? (isLeadership ? "leadership" : "business")} infographic turns assessment scores into a visual leadership snapshot, highlighting dominant preferences, behavioural capability and the next development priorities.`,
    growth_opportunity: "Prioritize the two lowest-scoring capabilities this quarter. Small structural fixes here compound the fastest.",
    strengths: ["Strong brand equity", "Committed leadership", "Cash discipline", "Loyal customer base"],
    gaps: ["Limited digital visibility", "Founder-dependent decisions", "Undocumented SOPs", "Weak follow-through"],
    action_plan: [
      { priority: "P1", title: "Deploy MIS Dashboard", outcome: "Real-time visibility", timeframe: "30 days" },
      { priority: "P1", title: "Document Top-5 SOPs", outcome: "Reduce founder dependence", timeframe: "45 days" },
      { priority: "P2", title: "Weekly Review", outcome: "Build accountability", timeframe: "60 days" },
    ],
  };
}

export const Route = createFileRoute("/report/landscape/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Visual Landscape Report | FACT 360°" },
      { name: "description", content: "A one-page A4 landscape infographic of assessment scores, personality preferences, behavioural capability and development priorities." },
      { property: "og:title", content: "Visual Landscape Report | FACT 360°" },
      { property: "og:description", content: "A dense, visual-first assessment report designed for a single A4 landscape page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ params }) => {
    if (SAMPLE_IDS.has(params.id)) {
      const sample = buildSample(params.id);
      if (sample) return sample;
    }
    try {
      return await getReport({ data: { attemptId: params.id } });
    } catch {
      throw notFound();
    }
  },
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Report not found.</div>,
  component: Landscape,
});

function Panel({
  title,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-report-line bg-report-paper/95 ${className}`}>
      <header className="flex h-7 shrink-0 items-center gap-2 pr-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-report-sun text-report-ink"><Icon className="h-4 w-4" /></span>
        <span className="flex h-5 flex-1 items-center rounded-full bg-report-ink px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-report-paper">{title}</span>
      </header>
      <div className="min-h-0 flex-1 px-2.5 pb-2 pt-1.5">{children}</div>
    </section>
  );
}

function Highlight({ icon: Icon, value, label, note }: { icon: LucideIcon; value: string; label: string; note?: string }) {
  return (
    <div className="flex min-h-0 flex-col items-center justify-center rounded border border-report-line bg-report-paper px-1 py-1 text-center">
      <Icon className="mb-0.5 h-4 w-4 text-report-ink" />
      <div className="max-w-full truncate text-[15px] font-extrabold leading-tight text-report-ink" title={value}>{value}</div>
      <div className="max-w-full truncate text-[8px] font-semibold uppercase tracking-wide text-report-ink/65" title={label}>{label}</div>
      {note && <div className="max-w-full truncate text-[8px] font-bold text-report-gold" title={note}>{note}</div>}
    </div>
  );
}

function MiniGauge({ value, label }: { value: number; label: string }) {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const normalized = clamp(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-report-line)" strokeWidth="6" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-report-sun)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - normalized / 100)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[14px] font-extrabold text-report-ink">{normalized}%</span>
      </div>
      <span className="w-14 text-[8px] font-bold uppercase leading-tight tracking-wider text-report-ink/65">{label}</span>
    </div>
  );
}

function PreferenceBalance({ poles }: { poles: PoleSet }) {
  const rows = [
    { title: "Energy", left: "Outgoing", right: "Reflective", l: poles.E, r: poles.I },
    { title: "Learning", left: "Practical", right: "Innovative", l: poles.S, r: poles.N },
    { title: "Decisions", left: "Logical", right: "People-centred", l: poles.T, r: poles.F },
    { title: "Planning", left: "Structured", right: "Adaptive", l: poles.J, r: poles.P },
  ];
  return (
    <div className="flex h-full flex-col justify-around" role="img" aria-label="Preference balance across four personality dimensions">
      {rows.map((row) => (
        <div key={row.title}>
          <div className="mb-1 flex items-center justify-between text-[8px] font-bold text-report-ink">
            <span>{row.left} {row.l}%</span><span className="uppercase tracking-wider text-report-ink/50">{row.title}</span><span>{row.right} {row.r}%</span>
          </div>
          <div className="relative flex h-4 overflow-hidden rounded-full bg-report-line">
            <div className="h-full bg-report-ink" style={{ width: `${row.l}%` }} />
            <div className="h-full flex-1 bg-report-sun" />
            <span className="absolute left-1/2 top-0 h-full w-px bg-report-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkstyleDonut({ poles }: { poles: PoleSet }) {
  const data = temperamentSplit(poles);
  const colors = ["var(--color-report-ink)", "var(--color-report-sun)", "var(--color-report-gold)", "var(--color-report-sage)"];
  let running = 0;
  const segments = data.map((item, index) => {
    const segment = { ...item, start: running, color: colors[index] };
    running += item.value;
    return segment;
  });
  return (
    <div className="grid h-full grid-cols-[118px_1fr] items-center gap-2">
      <div className="relative mx-auto h-28 w-28" role="img" aria-label="Work-style distribution donut chart">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-report-line)" strokeWidth="18" />
          {segments.map((segment) => (
            <circle
              key={segment.name}
              cx="50"
              cy="50"
              r="35"
              fill="none"
              pathLength="100"
              stroke={segment.color}
              strokeWidth="18"
              strokeDasharray={`${segment.value} ${100 - segment.value}`}
              strokeDashoffset={-segment.start}
            />
          ))}
        </svg>
        <div className="absolute inset-[22px] grid place-items-center rounded-full bg-report-paper text-center">
          <div><div className="text-[20px] font-extrabold leading-none text-report-ink">4</div><div className="text-[7px] font-bold uppercase tracking-wider text-report-ink/55">Work styles</div></div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="grid grid-cols-[8px_1fr_auto] items-center gap-1.5 text-[9px]">
            <span className="h-2 w-2 rounded-full" style={{ background: colors[index] }} />
            <span className="truncate font-semibold text-report-ink/75">{item.name.split(" — ")[1]}</span>
            <span className="font-extrabold text-report-ink">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapabilityColumns({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex h-full items-stretch gap-2 pb-1 pt-3" role="img" aria-label="Behavioural capability column chart">
      {data.slice(0, 7).map((item, index) => (
        <div key={item.name} className="flex min-w-0 flex-1 flex-col items-center justify-end">
          <span className="mb-1 text-[8px] font-extrabold text-report-ink">{item.value}%</span>
          <div className="flex h-[112px] w-full max-w-10 items-end rounded-t-sm bg-report-line/55">
            <div className={`w-full rounded-t-sm ${index % 2 ? "bg-report-sun" : "bg-report-ink"}`} style={{ height: `${clamp(item.value)}%` }} />
          </div>
          <span className="mt-1.5 h-5 w-full text-center text-[7px] font-semibold leading-tight text-report-ink/70" title={item.name}>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function PreferenceHeatmap({ poles }: { poles: PoleSet }) {
  const cells = [
    { label: "Outgoing", value: poles.E }, { label: "Reflective", value: poles.I },
    { label: "Practical", value: poles.S }, { label: "Innovative", value: poles.N },
    { label: "Logical", value: poles.T }, { label: "People-centred", value: poles.F },
    { label: "Structured", value: poles.J }, { label: "Adaptive", value: poles.P },
  ];
  return (
    <div className="grid h-full grid-cols-2 gap-1.5" role="img" aria-label="Heatmap of all eight preference strengths">
      {cells.map((cell) => (
        <div key={cell.label} className="flex min-h-0 flex-col justify-center rounded border border-report-line px-1.5 text-center" style={{ background: `color-mix(in oklab, var(--color-report-sun) ${Math.max(8, cell.value * 0.55)}%, var(--color-report-paper))` }}>
          <span className="text-[13px] font-extrabold leading-none text-report-ink">{cell.value}%</span>
          <span className="mt-0.5 truncate text-[7px] font-bold uppercase tracking-wide text-report-ink/70">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionPerformance({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex h-full flex-col justify-around" role="img" aria-label="Section performance bars">
      {data.slice(0, 7).map((item, index) => (
        <div key={item.name} className="grid grid-cols-[92px_1fr_28px] items-center gap-1.5">
          <span className="truncate text-[8px] font-semibold text-report-ink" title={item.name}>{item.name}</span>
          <div className="h-2.5 overflow-hidden rounded-sm bg-report-line">
            <div className={`h-full ${index % 2 ? "bg-report-sun" : "bg-report-ink"}`} style={{ width: `${clamp(item.value)}%` }} />
          </div>
          <span className="text-right text-[8px] font-extrabold text-report-ink">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

function CapabilityDots({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex h-full flex-col justify-around" role="img" aria-label="Behavioural capability dot plot">
      {data.slice(0, 7).map((item) => (
        <div key={item.name} className="grid grid-cols-[94px_1fr_28px] items-center gap-1.5">
          <span className="truncate text-[8px] font-semibold text-report-ink" title={item.name}>{item.name}</span>
          <div className="relative h-3 border-b border-report-line">
            <span className="absolute bottom-[-4px] h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-report-paper bg-report-sun" style={{ left: `${clamp(item.value)}%` }} />
          </div>
          <span className="text-right text-[8px] font-extrabold text-report-ink">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

function ActionTimeline({ items }: { items: { priority: string; title: string; timeframe: string }[] }) {
  return (
    <div className="relative flex h-full flex-col justify-around pl-1">
      <span className="absolute bottom-5 left-[17px] top-5 w-0.5 bg-report-line" />
      {items.slice(0, 3).map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative z-10 flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-report-paper bg-report-sun text-[11px] font-extrabold text-report-ink">{index + 1}</span>
          <div className="min-w-0 flex-1 rounded border border-report-line bg-report-paper px-2 py-1">
            <div className="truncate text-[9px] font-bold text-report-ink" title={item.title}>{item.title}</div>
            <div className="text-[7px] font-semibold uppercase tracking-wide text-report-ink/55">{item.priority} · {item.timeframe}</div>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="grid h-full place-items-center text-[10px] text-report-ink/60">No actions generated</div>}
    </div>
  );
}

function Landscape() {
  const report = Route.useLoaderData() as any;
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewResult | null>(null);
  const [exportError, setExportError] = useState("");
  const a = report.assessment;
  const submittedAt = report.attempt?.submitted_at
    ? new Date(report.attempt.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const sectionScores: Record<string, { name: string; score: number; weight: number }> = report.section_scores ?? {};
  const sectionData = Object.values(sectionScores).map((s) => ({ name: s.name, value: Math.round(s.score) }));
  const overall = Math.round(report.overall_score ?? 0);
  const dim = report.dimension_scores as any;
  const poles = toPoles(dim);
  const profile = getPersonalityProfile(report.type_code);
  const roleAnalysis = dim?.role_analysis;
  const roleFit = clamp(roleAnalysis?.fit_score ?? overall);
  const behaviour = poles
    ? behaviourMetrics(poles).map((item) => ({ name: item.label, value: item.value }))
    : sectionData;
  const rankedBehaviour = [...behaviour].sort((x, y) => y.value - x.value);
  const strongest = rankedBehaviour[0] ?? { name: "Profile", value: overall };
  const focus = rankedBehaviour[rankedBehaviour.length - 1] ?? { name: "Development", value: overall };
  const radar = poles
    ? [
        { area: "Strategic", value: clamp((poles.N + poles.T) / 2) },
        { area: "Analytical", value: clamp((poles.T + poles.J) / 2) },
        { area: "Adaptive", value: clamp((poles.P + poles.N) / 2) },
        { area: "Social", value: clamp((poles.E + poles.F) / 2) },
        { area: "Structured", value: clamp((poles.J + poles.S) / 2) },
        { area: "Reflective", value: clamp((poles.I + poles.N) / 2) },
      ]
    : sectionData.map((item) => ({ area: item.name, value: item.value }));
  const actionPlan = (report.action_plan ?? []) as { priority: string; title: string; outcome: string; timeframe: string }[];
  const displaySections = sectionData.length ? sectionData : behaviour;

  const handlePreview = async () => {
    if (!printRef.current || exporting) return;
    setExporting(true);
    setExportError("");
    try {
      const result = await exportPagesToPdf(printRef.current, "FACT360-Landscape-Report.pdf", "landscape", "preview");
      if (!result || result instanceof Blob) throw new Error("No PDF document was returned");
      setPdfPreview(result);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Unable to generate landscape report PDF", error);
      setExportError("The preview could not be prepared. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const downloadPreview = () => {
    if (!pdfPreview) return;
    const url = URL.createObjectURL(pdfPreview.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "FACT360-Landscape-Report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <>
      <div className="no-print border-b border-border bg-muted/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3">
          {SAMPLE_IDS.has(report.attempt_id) ? (
            <Link to="/sample-reports" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> Back to Sample Reports</Link>
          ) : (
            <Link to="/dashboard/report/$id" params={{ id: report.attempt_id }} className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> Back to Report</Link>
          )}
          <div className="flex items-center gap-2">
            {exportError && <span role="alert" className="text-xs text-destructive">{exportError}</span>}
            <Button onClick={handlePreview} disabled={exporting} className="bg-primary hover:bg-primary/90" size="sm">
              {exporting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Eye className="mr-1 h-4 w-4" />}
              {exporting ? "Preparing landscape PDF..." : "Preview landscape PDF"}
            </Button>
          </div>
        </div>
      </div>

      <main className="overflow-x-auto bg-muted/30 p-4 md:p-6">
        <div ref={printRef} className="mx-auto w-max">
          <section className="print-page relative h-[794px] w-[1123px] overflow-hidden bg-report-cream p-3 text-report-ink">
            <img src={landscapeBackdrop} alt="" aria-hidden="true" loading="lazy" width={2400} height={1792} className="absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
            <div className="relative z-10 flex h-full flex-col gap-2">
              <header className="flex h-[82px] shrink-0 items-center justify-between gap-4 rounded-md border border-report-line bg-report-paper/95 px-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Logo size="sm" />
                  <span className="h-11 w-px bg-report-line" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-report-gold">Visual assessment infographic</p>
                    <h1 className="line-clamp-2 max-w-[430px] text-[18px] font-extrabold leading-tight text-report-ink">{a?.name ?? "Assessment Report"}</h1>
                    <p className="truncate text-[9px] font-semibold text-report-ink/60">{profile?.name ?? a?.tagline ?? "Capability at a glance"} · {submittedAt}</p>
                  </div>
                </div>
                <div className="hidden h-9 items-center gap-2 rounded-full bg-report-sun px-4 text-[9px] font-extrabold uppercase tracking-wider text-report-ink xl:flex">
                  Analyse <span>→</span> Insights <span>→</span> Transform
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <MiniGauge value={overall} label="Overall score" />
                  {roleAnalysis && <MiniGauge value={roleFit} label="Target role fit" />}
                </div>
              </header>

              <div className="grid min-h-0 flex-1 grid-cols-12 grid-rows-3 gap-2">
                <Panel title="Key Highlights" icon={Star} className="col-span-3">
                  <div className="grid h-full grid-cols-2 grid-rows-3 gap-1.5">
                    <Highlight icon={Gauge} value={`${overall}%`} label="Overall" note={overall >= 70 ? "Strong" : overall >= 50 ? "Moderate" : "Developing"} />
                    <Highlight icon={User} value={profile?.name ?? "L.I.F.E.™"} label="Profile" />
                    <Highlight icon={Briefcase} value={roleAnalysis ? `${roleFit}%` : `${strongest.value}%`} label={roleAnalysis ? "Role fit" : "Top capability"} />
                    <Highlight icon={Award} value={`${strongest.value}%`} label={strongest.name} note="Strength" />
                    <Highlight icon={Target} value={`${focus.value}%`} label={focus.name} note="Focus" />
                    <Highlight icon={Layers} value={`${displaySections.length}`} label="Dimensions" note={roleAnalysis?.target_role ?? "Measured"} />
                  </div>
                </Panel>

                <Panel title="Personality Snapshot" icon={Brain} className="col-span-5">
                  <div className="grid h-full grid-cols-[1.25fr_1fr] items-center gap-1">
                    <RadarScore data={radar} height={166} color="var(--color-report-gold)" />
                    <div className="space-y-1.5">
                      {radar.slice(0, 6).map((item) => (
                        <div key={item.area} className="grid grid-cols-[56px_1fr_25px] items-center gap-1">
                          <span className="truncate text-[7px] font-semibold text-report-ink">{item.area}</span>
                          <div className="h-1.5 rounded-full bg-report-line"><div className="h-full rounded-full bg-report-sun" style={{ width: `${item.value}%` }} /></div>
                          <span className="text-right text-[7px] font-extrabold text-report-ink">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Work-style Distribution" icon={Users} className="col-span-4">
                  {poles ? <WorkstyleDonut poles={poles} /> : <CapabilityDots data={behaviour.slice(0, 4)} />}
                </Panel>

                <Panel title="Preference Balance" icon={Activity} className="col-span-4">
                  {poles ? <PreferenceBalance poles={poles} /> : <SectionPerformance data={displaySections.slice(0, 4)} />}
                </Panel>

                <Panel title="Behavioural Capability" icon={BarChart3} className="col-span-5">
                  <CapabilityColumns data={behaviour} />
                </Panel>

                <Panel title="Preference Heatmap" icon={Grid2X2} className="col-span-3">
                  {poles ? <PreferenceHeatmap poles={poles} /> : <CapabilityDots data={behaviour.slice(0, 6)} />}
                </Panel>

                <Panel title="Section Performance" icon={TrendingUp} className="col-span-4">
                  <SectionPerformance data={displaySections} />
                </Panel>

                <Panel title="Capability Dot Plot" icon={Zap} className="col-span-4">
                  <CapabilityDots data={rankedBehaviour} />
                </Panel>

                <Panel title="Priority Action Path" icon={CheckCircle2} className="col-span-4">
                  <ActionTimeline items={actionPlan} />
                </Panel>
              </div>

              <footer className="flex h-11 shrink-0 items-center gap-3 overflow-hidden rounded-md bg-report-ink px-3 text-report-paper">
                <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-report-sun"><Lightbulb className="h-4 w-4" /> Overall diagnosis</span>
                <p className="line-clamp-2 flex-1 text-[8px] leading-snug text-report-paper/85">{report.executive_summary ?? report.growth_opportunity ?? "Your visual report summarises measured preferences, capabilities and development priorities."}</p>
                <span className="flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-report-sun"><Sparkles className="h-3.5 w-3.5" /> Systemise → Measure → Grow</span>
              </footer>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="no-print flex h-[94vh] w-[calc(100vw-2rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>A4 landscape PDF preview</DialogTitle>
            <DialogDescription>{pdfPreview?.pages.length ?? 0} landscape page · the preview matches the downloaded PDF</DialogDescription>
          </DialogHeader>
          <div className="w-full min-w-0 overflow-y-auto bg-muted p-4 md:p-8">
            <div className="mx-auto w-full max-w-[1123px] space-y-6">
              {pdfPreview?.pages.map((page, index) => (
                <figure key={index} className="space-y-2">
                  <img src={page} alt={`Landscape report preview page ${index + 1}`} className="aspect-[297/210] w-full border border-border bg-card object-contain shadow-sm" />
                  <figcaption className="text-center text-xs text-muted-foreground">Page {index + 1}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border bg-card px-6 py-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={downloadPreview} disabled={!pdfPreview}><Download className="mr-2 h-4 w-4" />Download landscape PDF</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
