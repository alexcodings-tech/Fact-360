import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReport } from "@/lib/assessments.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Target, Loader2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPersonalityProfile, ROLE_THEME } from "@/data/personality-profiles";
import { WhatsAppModules } from "@/components/site/WhatsAppModules";
import { RadarScore } from "@/components/charts/RadarScore";
import {
  toPoles, behaviourMetrics, clamp, bandLabel,
  TemperamentDonut, MeterRow, DimensionRing,
} from "@/components/report/PersonalityVisuals";

export const Route = createFileRoute("/dashboard/report/$id")({
  ssr: false,
  component: Report,
});

function SectionBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-primary">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1.5 h-3 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Report() {
  const { id: attemptId } = Route.useParams();
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const { exportPagesToPdf } = await import("@/lib/pdf-export");
      await exportPagesToPdf(printRef.current, "FACT360-Report", "portrait");
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setExporting(false);
    }
  };

  const fn = useServerFn(getReport);
  const { data: r, isLoading, error } = useQuery({ queryKey: ["report", attemptId], queryFn: () => fn({ data: { attemptId } }) });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  if (error || !r) {
    // The report is generated immediately but only released after our team reviews it.
    return (
      <div className="max-w-2xl mx-auto py-10 text-center">
        <div className="rounded-2xl border border-border bg-card p-10">
          <h1 className="text-2xl font-bold text-primary">Thank you for completing the assessment</h1>
          <p className="mt-3 text-muted-foreground">
            Your report is being reviewed by our team. You will receive it within 24 hours.
          </p>
          <Link to="/dashboard/reports"><Button className="mt-6 bg-primary hover:bg-primary/90">Back to Reports</Button></Link>
        </div>
      </div>
    );
  }

  const a: any = r.assessment;
  const strengths = (r.strengths as string[]) ?? [];
  const gaps = (r.gaps as string[]) ?? [];
  const actionPlan = (r.action_plan as { priority: string; title: string; outcome: string; timeframe: string }[]) ?? [];
  const sectionScores = ((r as any).section_scores ?? {}) as Record<string, { name: string; score: number; weight: number }>;
  const sections = Object.values(sectionScores);
  const overall = (r as any).overall_score ?? 0;
  const dim = (r as any).dimension_scores as any;
  const POLE_LABELS: Record<string, string> = {
    E: "Outgoing & Interactive", I: "Reflective & Independent",
    S: "Practical & Detail-focused", N: "Big-picture & Innovative",
    T: "Logical & Objective", F: "People-centred & Empathetic",
    J: "Structured & Planned", P: "Flexible & Adaptive",
  };
  const dimRows = dim
    ? [
        { title: "Energy & Interaction", left: "E", right: "I", leftSum: dim.EI?.sumE, rightSum: dim.EI?.sumI, leftPct: dim.EI?.ePct, leader: dim.EI?.leader },
        { title: "Information & Learning", left: "S", right: "N", leftSum: dim.SN?.sumS, rightSum: dim.SN?.sumN, leftPct: dim.SN?.sPct, leader: dim.SN?.leader },
        { title: "Decision Making", left: "T", right: "F", leftSum: dim.TF?.sumT, rightSum: dim.TF?.sumF, leftPct: dim.TF?.tPct, leader: dim.TF?.leader },
        { title: "Lifestyle & Planning", left: "J", right: "P", leftSum: dim.JP?.sumJ, rightSum: dim.JP?.sumP, leftPct: dim.JP?.jPct, leader: dim.JP?.leader },
      ].filter((d) => typeof d.leftPct === "number")
    : [];

  const profile = getPersonalityProfile((r as any).type_code);
  const theme = profile ? ROLE_THEME[profile.role] : null;

  // ---- Visual pages (1–5): every value derived from the real answers ----
  const poles = toPoles(dim);
  const behaviour = poles ? behaviourMetrics(poles) : [];
  const snapshotRadar = poles
    ? [
        { area: "Strategic", value: clamp((poles.N + poles.T) / 2) },
        { area: "Analytical", value: clamp((poles.T + poles.J) / 2) },
        { area: "Adaptive", value: clamp((poles.P + poles.N) / 2) },
        { area: "Social", value: clamp((poles.E + poles.F) / 2) },
        { area: "Structured", value: clamp((poles.J + poles.S) / 2) },
        { area: "Reflective", value: clamp((poles.I + poles.N) / 2) },
      ]
    : [];
  const rankedBehaviour = [...behaviour].sort((a, b) => b.value - a.value);
  const strengthTitles = (profile?.strengths ?? strengths).slice(0, 6);
  const strengthCards = strengthTitles.map((title, i) => ({
    title,
    value: rankedBehaviour[i % (rankedBehaviour.length || 1)]?.value ?? overall,
    note: `Supported by your ${rankedBehaviour[i % (rankedBehaviour.length || 1)]?.label ?? "overall"} profile.`,
  }));
  const growthBars = [...behaviour].sort((a, b) => a.value - b.value).slice(0, 4);




  return (
    <div className="space-y-4" ref={printRef}>
      <style>{`
        @media print {
          /* margin:0 removes the browser's date/title/URL header & footer */
          @page { size: A4 portrait; margin: 0; }
          html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
          html, body, * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, nav[role="navigation"] { display: none !important; }
          /* neutralise app-shell layout so every page flows into the print stream */
          body * { position: static !important; }
          .print-page {
            break-after: page; page-break-after: always;
            padding: 16mm 14mm 18mm 14mm;
            box-sizing: border-box;
            width: 100%;
          }
          .print-page:last-of-type { break-after: auto; page-break-after: auto; }
          .print-page > * { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>



      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link to="/dashboard/reports" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to Reports</Link>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mt-1">{a?.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={"/report/landscape/$id" as any} params={{ id: attemptId } as any}>
              <FileText className="h-4 w-4 mr-1" /> Landscape view
            </Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleDownload} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            {exporting ? "Preparing PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {poles && (
        <>
          {/* Visual Page 1 — Personality overview */}
          <section className="print-page space-y-4">
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground p-8">
                  <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
                  <div className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                  <div className="relative">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-bold">Personality Overview</p>
                    <h2 className="mt-2 text-3xl font-extrabold">{profile?.name ?? "Your Personality Profile"}</h2>
                    <p className="mt-1 text-sm text-primary-foreground/80">{profile?.traits.join("  •  ")}</p>
                    <div className="mt-6 flex flex-wrap items-end gap-8">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-accent font-bold">Overall Indicator</div>
                        <div className="text-6xl font-extrabold text-accent leading-none">{overall}%</div>
                      </div>
                      {profile && (
                        <div className="max-w-md text-sm text-primary-foreground/85 leading-relaxed">{profile.summary}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-4 gap-4 justify-items-center">
                  <DimensionRing label="Energy & Interaction" pole={poles.E >= poles.I ? "E" : "I"} value={Math.max(poles.E, poles.I)} />
                  <DimensionRing label="Information & Learning" pole={poles.S >= poles.N ? "S" : "N"} value={Math.max(poles.S, poles.N)} />
                  <DimensionRing label="Decision Making" pole={poles.T >= poles.F ? "T" : "F"} value={Math.max(poles.T, poles.F)} />
                  <DimensionRing label="Lifestyle & Planning" pole={poles.J >= poles.P ? "J" : "P"} value={Math.max(poles.J, poles.P)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-bold text-primary">Dimension Balance</h3>
                <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  <MeterRow label={poles.E >= poles.I ? "Extraversion" : "Introversion"} value={Math.max(poles.E, poles.I)} />
                  <MeterRow label={poles.S >= poles.N ? "Sensing" : "iNtuition"} value={Math.max(poles.S, poles.N)} tone="accent" />
                  <MeterRow label={poles.T >= poles.F ? "Thinking" : "Feeling"} value={Math.max(poles.T, poles.F)} />
                  <MeterRow label={poles.J >= poles.P ? "Judging" : "Perceiving"} value={Math.max(poles.J, poles.P)} tone="accent" />
                </div>
              </CardContent>
            </Card>
          </section>


          {/* Visual Page 2 — Personality snapshot + work-style distribution */}
          <section className="print-page space-y-4">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h2 className="font-bold text-primary">Personality Snapshot</h2>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <RadarScore data={snapshotRadar} height={280} color="var(--color-primary)" />
                  <div className="space-y-2.5">
                    {snapshotRadar.map((x) => <MeterRow key={x.area} label={x.area} value={x.value} />)}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="font-bold text-primary">Work-style Distribution</h3>
                <TemperamentDonut poles={poles} height={240} />
              </CardContent>
            </Card>
          </section>

          {/* Visual Page 3 — Strengths + Growth areas */}
          <section className="print-page space-y-4">
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h2 className="font-bold text-primary">Strength Profile</h2>
                  <div className="mt-4 space-y-3">
                    {strengthCards.map((s) => (
                      <div key={s.title} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">{s.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{bandLabel(s.value)}</span>
                        </div>
                        <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${s.value}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-snug">{s.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h2 className="font-bold text-primary">Growth Areas</h2>
                  <div className="mt-4 space-y-3">
                    {growthBars.map((g) => <MeterRow key={g.label} label={g.label} value={g.value} tone="rose" note={`${bandLabel(g.value)} today`} />)}
                  </div>
                  <div className="mt-6 grid grid-cols-5 items-center gap-1 text-center">
                    <div className="rounded-lg bg-secondary p-2 text-[10px] font-semibold text-primary">CURRENT</div>
                    <div className="text-accent font-bold">→</div>
                    <div className="rounded-lg bg-accent/20 p-2 text-[10px] font-semibold text-primary">DEVELOP</div>
                    <div className="text-accent font-bold">→</div>
                    <div className="rounded-lg bg-primary p-2 text-[10px] font-semibold text-primary-foreground">IMPROVE</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>


          {/* Visual Page 5 — Behaviour & working style */}
          <section className="print-page space-y-4">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h2 className="font-bold text-primary">Behaviour & Working Style</h2>
                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {behaviour.slice(0, Math.ceil(behaviour.length / 2)).map((b) => <MeterRow key={b.label} label={b.label} value={b.value} />)}
                  </div>
                  <div className="space-y-3">
                    {behaviour.slice(Math.ceil(behaviour.length / 2)).map((b) => <MeterRow key={b.label} label={b.label} value={b.value} />)}
                  </div>
                </div>
                {profile && (
                  <div className="mt-5 grid sm:grid-cols-3 gap-3 text-xs">
                    <div><div className="font-bold text-primary uppercase text-[10px]">Communication</div><p className="text-muted-foreground">{profile.communication}</p></div>
                    <div><div className="font-bold text-primary uppercase text-[10px]">Workplace</div><p className="text-muted-foreground">{profile.workplace}</p></div>
                    <div><div className="font-bold text-primary uppercase text-[10px]">Leadership</div><p className="text-muted-foreground">{profile.leadership}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}


      {/* Page 1 — Overall score + executive summary */}
      <section className="print-page space-y-4">
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold text-primary">{a?.name}</h1>
        </div>

        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-8 flex flex-col items-center justify-center text-center">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
                <div className="text-xs uppercase tracking-[0.25em] text-accent font-bold">Overall Score</div>
                <div className="mt-2 text-6xl md:text-7xl font-extrabold tracking-tight text-accent drop-shadow-sm">{overall}%</div>
                <div className="mt-1 text-sm text-primary-foreground/80">across {sections.length} sections</div>
              </div>
              <div className="md:col-span-3 p-6 md:p-8 grid gap-4">
                {sections.length ? sections.map((s) => (
                  <SectionBar key={s.name} label={s.name} value={s.score} />
                )) : <div className="text-sm text-muted-foreground">No section scores available.</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        {dimRows.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h2 className="font-bold text-primary">Your dominant style in each section</h2>
              <div className="mt-4 grid gap-4">
                {dimRows.map((d) => {
                  const leaderKey = d.leader === "balanced" ? null : (d.leader as string);
                  return (
                    <div key={d.title}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                        <span className="font-semibold text-primary">{d.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {POLE_LABELS[d.left]} {d.leftSum} pts · {POLE_LABELS[d.right]} {d.rightSum} pts
                        </span>
                      </div>
                      <div className="mt-1 flex h-2.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${d.leftPct}%` }} />
                        <div className="h-full bg-accent" style={{ width: `${100 - (d.leftPct as number)}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-foreground/80">
                        {leaderKey
                          ? <>Dominant: <span className="font-semibold">{POLE_LABELS[leaderKey]}</span> ({leaderKey === d.left ? d.leftPct : 100 - (d.leftPct as number)}%)</>
                          : "Balanced — both styles are equally strong."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Page 2 — Summary, strengths & weaknesses */}
      <section className="print-page space-y-4">
        <Card className="border-indigo-200 bg-indigo-50/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-indigo-700"><Sparkles className="h-5 w-5" /><h2 className="font-bold">Executive Summary</h2></div>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{r.executive_summary}</p>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600" /><h2 className="font-bold text-emerald-700">Strengths</h2></div>
            <ul className="mt-3 space-y-2 text-sm">
              {strengths.length ? strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-600">●</span>{s}</li>) : <li className="text-muted-foreground">—</li>}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-600" /><h2 className="font-bold text-rose-700">Growth Areas</h2></div>
            <ul className="mt-3 space-y-2 text-sm">
              {gaps.length ? gaps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-rose-600">●</span>{s}</li>) : <li className="text-muted-foreground">—</li>}
            </ul>
          </CardContent>
        </Card>
        </div>
      </section>

      {/* Page 3 — Your FACT 360 personality profile */}
      {profile && (
        <section className="print-page space-y-4">
          <Card className={`${theme?.ring} ${theme?.bg}`}>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme?.chip}`}>{profile.role}</span>
                <h2 className={`text-xl font-bold ${theme?.text}`}>{profile.name}</h2>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{profile.traits.join(" • ")}</div>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{profile.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/70">
              <CardContent className="p-6">
                <h3 className="font-bold text-emerald-700">Profile Strengths</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {profile.strengths.map((s) => <li key={s} className="flex gap-2"><span className="text-emerald-600">✔</span>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/70">
              <CardContent className="p-6">
                <h3 className="font-bold text-amber-700">Potential Weaknesses</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {profile.weaknesses.map((s) => <li key={s} className="flex gap-2"><span className="text-amber-600">!</span>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Communication", value: profile.communication, cls: "border-sky-200 bg-sky-50/70 text-sky-700" },
              { label: "Workplace Style", value: profile.workplace, cls: "border-violet-200 bg-violet-50/70 text-violet-700" },
              { label: "Leadership", value: profile.leadership, cls: "border-teal-200 bg-teal-50/70 text-teal-700" },
            ].map((b) => (
              <Card key={b.label} className={b.cls.split(" ").slice(0, 2).join(" ")}>
                <CardContent className="p-5">
                  <h3 className={`font-bold text-sm ${b.cls.split(" ")[2]}`}>{b.label}</h3>
                  <p className="mt-2 text-sm text-foreground/80">{b.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </section>
      )}

      {/* Page 4 — Development focus, workplace insight & growth opportunity */}
      {profile && (
        <section className="print-page space-y-4 pt-6 print:pt-12">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-indigo-200 bg-indigo-50/70">
              <CardContent className="p-6">
                <h3 className="font-bold text-indigo-700">Development Focus</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {profile.development.map((s) => <li key={s} className="flex gap-2"><span className="text-indigo-600">→</span>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-bold text-accent">FACT 360 Workplace Insight</h3>
                <p className="mt-3 text-sm"><span className="font-semibold text-accent">Best contribution:</span> {profile.bestContribution}</p>
                <p className="mt-2 text-sm"><span className="font-semibold text-accent">Watch area:</span> {profile.watchArea}</p>
              </CardContent>
            </Card>
          </div>

          {r.growth_opportunity && (
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h2 className="font-bold text-primary">Growth Opportunity</h2>
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
                  <p className="text-lg">{r.growth_opportunity}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}


      {/* Page 5 — Action plan */}
      <section className="print-page">
        <Card className="border-sky-200 bg-sky-50/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><Target className="h-5 w-5 text-sky-600" /><h2 className="font-bold text-sky-700">Action Plan</h2></div>
            <div className="mt-4 grid gap-3">
              {actionPlan.map((x, i) => (
                <div key={i} className="rounded-md border border-sky-200 bg-white p-4 flex items-start gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${x.priority === "P1" ? "bg-rose-100 text-rose-700" : x.priority === "P2" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{x.priority}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-primary">{x.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{x.outcome}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{x.timeframe}</div>
                </div>
              ))}
              {actionPlan.length === 0 && <div className="text-sm text-muted-foreground">No action plan generated.</div>}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Growth opportunity only gets its own page when there is no profile page 4 */}
      {!profile && r.growth_opportunity && (
        <section className="print-page">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h2 className="font-bold text-primary">Growth Opportunity</h2>
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
                <p className="text-lg">{r.growth_opportunity}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}


      <WhatsAppModules />
    </div>
  );
}
