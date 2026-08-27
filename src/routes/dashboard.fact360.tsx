import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  saveOrganisation, getMyOrganisation, confirmProcess, openDepartments, DEPARTMENT_CATALOG,
} from "@/lib/org.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy, CheckCircle2, ArrowRight, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/fact360")({
  ssr: false,
  head: () => ({ meta: [{ title: "FACT 360° Organisational Assessment" }] }),
  component: Fact360,
});

const STEPS = [
  "Company details",
  "Review & confirm the process",
  "Director questionnaire",
  "Department assessments",
  "Admin review & final report",
];

function Fact360() {
  const loadFn = useServerFn(getMyOrganisation);
  const saveFn = useServerFn(saveOrganisation);
  const confirmFn = useServerFn(confirmProcess);
  const openFn = useServerFn(openDepartments);

  const { data: org, isLoading, refetch } = useQuery({ queryKey: ["my-org"], queryFn: () => loadFn() });
  const [selected, setSelected] = useState<string[]>(DEPARTMENT_CATALOG.map((d) => d.key));
  const [viewStep, setViewStep] = useState<number | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: any) => saveFn({ data: v }),
    onSuccess: () => { toast.success("Company details saved."); setViewStep(null); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Could not save"),
  });
  const confirmMut = useMutation({
    mutationFn: () => confirmFn(),
    onSuccess: () => { toast.success("Process confirmed. Director questions are now open."); setViewStep(null); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const openMut = useMutation({
    mutationFn: () => openFn({ data: { keys: selected } }),
    onSuccess: () => { toast.success("Department links generated."); setViewStep(null); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  const departments = ((org as any)?.org_departments ?? []) as any[];
  const director = departments.find((d) => d.key === "director");
  const others = departments.filter((d) => d.key !== "director");
  const stepIndex = !org ? 0 : !(org as any).process_confirmed_at ? 1 : director?.status !== "submitted" ? 2 : others.length === 0 ? 3 : (org as any).report ? 4 : 3;
  const view = viewStep ?? stepIndex;
  const goto = (i: number) => { setViewStep(i); window.scrollTo({ top: 0 }); };


  function submitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    saveMut.mutate({
      name: String(f.get("name")),
      industry: String(f.get("industry") ?? ""),
      org_type: String(f.get("org_type") ?? ""),
      company_size: String(f.get("company_size") ?? ""),
      business_position: String(f.get("business_position") ?? ""),
      objectives: String(f.get("objectives") ?? ""),
      current_level: Number(f.get("current_level") ?? 1),
      target_level: Number(f.get("target_level") ?? 3),
      director_name: String(f.get("director_name") ?? ""),
      director_email: String(f.get("director_email") ?? ""),
      director_phone: String(f.get("director_phone") ?? ""),
    });
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/respond/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">FACT 360° Organisational Assessment</h1>
        <p className="text-sm text-muted-foreground">Director → Departments → Admin report</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const isView = i === view;
          const reachable = i <= stepIndex;
          return (
            <button
              key={s}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && goto(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isView ? "border-primary bg-primary text-primary-foreground" : done ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground"} ${reachable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
            >
              {done && !isView ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>} {s}
            </button>
          );
        })}
      </div>

      {/* Step 1 — company details */}
      {view === 0 && (
      <Card><CardContent className="p-6">

        <h2 className="font-bold text-primary">Company details</h2>
        <form onSubmit={submitDetails} className="grid sm:grid-cols-2 gap-3 mt-4">
          <div><label className="text-xs font-semibold">Company name</label><Input required name="name" defaultValue={(org as any)?.name ?? ""} /></div>
          <div><label className="text-xs font-semibold">Industry</label><Input name="industry" defaultValue={(org as any)?.industry ?? ""} placeholder="e.g. Manufacturing" /></div>
          <div><label className="text-xs font-semibold">Type of organisation</label><Input name="org_type" defaultValue={(org as any)?.org_type ?? ""} placeholder="e.g. Private Limited" /></div>
          <div><label className="text-xs font-semibold">Company size</label><Input name="company_size" defaultValue={(org as any)?.company_size ?? ""} placeholder="e.g. 120 employees" /></div>
          <div><label className="text-xs font-semibold">Current level (1-5)</label><Input type="number" min={1} max={5} name="current_level" defaultValue={(org as any)?.current_level ?? 1} /></div>
          <div><label className="text-xs font-semibold">Target level (1-5)</label><Input type="number" min={1} max={5} name="target_level" defaultValue={(org as any)?.target_level ?? 3} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-semibold">Business position</label><Textarea name="business_position" rows={2} defaultValue={(org as any)?.business_position ?? ""} /></div>
          <div className="sm:col-span-2"><label className="text-xs font-semibold">Key objectives</label><Textarea name="objectives" rows={2} defaultValue={(org as any)?.objectives ?? ""} /></div>
          <div><label className="text-xs font-semibold">Director name</label><Input name="director_name" defaultValue={(org as any)?.director_name ?? ""} /></div>
          <div><label className="text-xs font-semibold">Director email</label><Input name="director_email" defaultValue={(org as any)?.director_email ?? ""} /></div>
          <div><label className="text-xs font-semibold">Director phone</label><Input name="director_phone" defaultValue={(org as any)?.director_phone ?? ""} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="submit" disabled={saveMut.isPending}>Save details</Button>
            {org && <Button type="button" variant="outline" onClick={() => goto(1)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>}
          </div>
        </form>
      </CardContent></Card>
      )}

      {/* Step 2 — process confirmation */}
      {view === 1 && org && (
        <Card><CardContent className="p-6">

          <h2 className="font-bold text-primary">How the FACT 360° assessment works</h2>
          <ol className="mt-3 space-y-2 text-sm text-foreground/80 list-decimal pl-5">
            <li>You (the director) answer the leadership questionnaire covering strategy, finance, people and governance.</li>
            <li>Based on your answers you select the departments that will take part.</li>
            <li>Each department gets its own private link and question set — HR, Finance, Operations, Marketing, IT and Quality.</li>
            <li>Departments can upload supporting policies and documents with their answers.</li>
            <li>Our analysts and AI review every response and produce your final organisational report.</li>
          </ol>
          {(org as any).process_confirmed_at ? (
            <div className="mt-4 flex items-center gap-3">
              <Badge className="bg-success/15 text-success">Confirmed</Badge>
              <Button size="sm" variant="outline" onClick={() => goto(2)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          ) : (
            <Button className="mt-4" disabled={confirmMut.isPending} onClick={() => confirmMut.mutate()}>
              I confirm — start the assessment <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardContent></Card>
      )}

      {/* Step 3 — director questionnaire */}
      {view === 2 && org && (org as any).process_confirmed_at && director && (
        <Card><CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-primary">Director questionnaire</h2>
            <p className="text-sm text-muted-foreground">Status: {director.status === "submitted" ? "Submitted" : director.status === "in_progress" ? "In progress" : "Not started"}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/respond/$token" params={{ token: director.access_token }}>
              <Button variant={director.status === "submitted" ? "outline" : "default"}>
                {director.status === "submitted" ? "Review answers" : "Answer director questions"}
              </Button>
            </Link>
            {director.status === "submitted" && (
              <Button onClick={() => goto(3)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            )}
          </div>
        </CardContent></Card>
      )}

      {/* Step 4 — departments */}
      {view === 3 && org && director?.status === "submitted" && (
        <Card><CardContent className="p-6 space-y-4">
          <div>
            <h2 className="font-bold text-primary">Department assessments</h2>
            <p className="text-sm text-muted-foreground">Choose the departments that should take part, then share each private link.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            {DEPARTMENT_CATALOG.map((d) => (
              <label key={d.key} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <Checkbox
                  checked={selected.includes(d.key)}
                  onCheckedChange={(c) => setSelected((prev) => (c ? [...new Set([...prev, d.key])] : prev.filter((k) => k !== d.key)))}
                />
                {d.name}
              </label>
            ))}
          </div>
          <Button disabled={openMut.isPending || selected.length === 0} onClick={() => openMut.mutate()}>
            {openMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Generate department links
          </Button>

          {others.length > 0 && (
            <div className="space-y-2 pt-2">
              {others.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
                  <span className="font-medium text-sm text-primary flex-1">{d.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{d.status}</Badge>
                  {typeof d.score === "number" && <span className="text-xs text-muted-foreground">{d.score}%</span>}
                  <Button size="sm" variant="outline" onClick={() => copyLink(d.access_token)}><Copy className="h-3.5 w-3.5 mr-1" /> Copy link</Button>
                </div>
              ))}
            </div>
          )}
          {(org as any)?.report && (
            <Button variant="outline" onClick={() => goto(4)}>View final report <ArrowRight className="h-4 w-4 ml-1" /></Button>
          )}
        </CardContent></Card>
      )}

      {/* Step 5 — final report */}
      {view === 4 && (org as any)?.report && (
        <Card><CardContent className="p-6" id="final-report">
          <div className="flex flex-wrap items-start gap-3 print:hidden">
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-bold text-primary">Final organisational report</h2>
              <p className="text-sm text-muted-foreground mt-1">Approved on {new Date((org as any).report.approved_at).toLocaleDateString()}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
            </Button>
            <Button
              size="sm"
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
              onClick={() => {
                const rep: any = (org as any).report;
                const c: any = rep.edited ?? rep.ai_draft ?? {};
                const text = [
                  `FACT 360° report — ${(org as any).name}`,
                  `Overall score: ${rep.overall_score}%`,
                  "",
                  (c.executive_summary ?? "").slice(0, 600),
                  "",
                  `Full report: ${window.location.origin}/dashboard/fact360`,
                ].join("\n");
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share on WhatsApp
            </Button>
          </div>

          {(() => {
            const rep: any = (org as any).report;
            const c: any = rep.edited ?? rep.ai_draft ?? {};
            const metrics: Record<string, number> = rep.metric_scores ?? {};
            const depts: Record<string, number> = rep.department_scores ?? {};
            return (
              <div className="mt-4 space-y-5 text-sm">
                <div className="text-xs text-muted-foreground">Overall score: {rep.overall_score}%</div>
                <p className="whitespace-pre-line">{c.executive_summary}</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(metrics).map(([area, score]) => (
                    <div key={area}>
                      <div className="flex justify-between text-xs font-semibold text-primary"><span>{area}</span><span>{score}%</span></div>
                      <div className="mt-1 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${score}%` }} /></div>
                    </div>
                  ))}
                </div>

                {Object.keys(depts).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary">Department performance</h3>
                    <div className="mt-2 grid sm:grid-cols-2 gap-2">
                      {Object.entries(depts).map(([d, s]) => (
                        <div key={d} className="flex justify-between rounded-md border border-border px-3 py-2 text-xs"><span>{d}</span><span className="font-semibold">{s}%</span></div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-primary">Strengths</h3>
                    <ul className="mt-2 space-y-1">{(c.strengths ?? []).map((s: string, i: number) => <li key={i} className="flex gap-2"><span className="text-success">●</span>{s}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Gaps &amp; weaknesses</h3>
                    <ul className="mt-2 space-y-1">{(c.gaps ?? []).map((s: string, i: number) => <li key={i} className="flex gap-2"><span className="text-destructive">●</span>{s}</li>)}</ul>
                  </div>
                </div>

                {(c.recommendations ?? []).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary">Recommended improvements</h3>
                    <ul className="mt-2 space-y-1 list-disc pl-5">{c.recommendations.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}

                {(c.priority_actions ?? []).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary">Priority actions</h3>
                    <div className="mt-2 grid gap-2">
                      {c.priority_actions.map((p: any, i: number) => (
                        <div key={i} className="rounded-md border border-border p-3 flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary">{p.priority}</span>
                          <span className="flex-1 min-w-[180px]">{p.action}</span>
                          <span className="text-xs text-muted-foreground">{p.owner} • {p.timeframe}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c.maturity_path && (
                  <div className="rounded-xl bg-primary text-primary-foreground p-5">
                    <div className="text-xs uppercase tracking-wider text-accent font-semibold">Maturity path</div>
                    <p className="mt-1">{c.maturity_path}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent></Card>
      )}
    </div>
  );
}
