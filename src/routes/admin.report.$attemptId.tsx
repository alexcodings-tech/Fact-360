import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetReport, adminSaveReport } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Send, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/report/$attemptId")({
  ssr: false,
  component: AdminReportReview,
});

type Action = { priority: string; title: string; outcome: string; timeframe: string };
type Cause = { symptom: string; cause: string };

function AdminReportReview() {
  const { attemptId } = Route.useParams();
  const getFn = useServerFn(adminGetReport);
  const saveFn = useServerFn(adminSaveReport);

  const { data: r, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-report", attemptId],
    queryFn: () => getFn({ data: { attemptId } }),
  });

  const [summary, setSummary] = useState("");
  const [growth, setGrowth] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [plan, setPlan] = useState<Action[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [overall, setOverall] = useState("");

  useEffect(() => {
    if (!r) return;
    setSummary((r as any).executive_summary ?? "");
    setGrowth((r as any).growth_opportunity ?? "");
    setStrengths(((r as any).strengths as string[]) ?? []);
    setGaps(((r as any).gaps as string[]) ?? []);
    setPlan((((r as any).action_plan as Action[]) ?? []).map((a) => ({ ...a })));
    setCauses((((r as any).root_causes as Cause[]) ?? []).map((c) => ({ ...c })));
    setOverall(String(Math.round(Number((r as any).overall_score ?? 0))));
  }, [r]);

  const mut = useMutation({
    mutationFn: (approve: boolean) =>
      saveFn({
        data: {
          attemptId,
          executive_summary: summary,
          growth_opportunity: growth,
          strengths: strengths.filter((s) => s.trim()),
          gaps: gaps.filter((s) => s.trim()),
          action_plan: plan.filter((a) => a.title.trim()),
          root_causes: causes.filter((c) => c.symptom.trim() || c.cause.trim()),
          overall_score: Number.isFinite(Number(overall)) ? Math.max(0, Math.min(100, Number(overall))) : undefined,
          approve,
        },
      }),
    onSuccess: (res: any) => {
      toast.success(res?.approved ? "Report approved and sent to the client." : "Changes saved.");
      refetch();
    },
    onError: (e: any) => toast.error(e.message ?? "Could not save"),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  if (error || !r) return <div className="p-8 text-center text-destructive">Report not available yet.</div>;

  const approved = (r as any).status === "approved";
  const a: any = (r as any).assessment;
  const user: any = (r as any).attempt?.user;

  const listEditor = (
    label: string,
    items: string[],
    set: (v: string[]) => void,
  ) => (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-2">
        <h2 className="font-bold text-primary">{label}</h2>
        {items.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Input value={s} onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button className="text-destructive p-2 rounded hover:bg-destructive/10" onClick={() => set(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => set([...items, ""])}>
          <Plus className="h-4 w-4 mr-1" /> Add point
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Overview
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{a?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.full_name ?? "—"}{user?.company ? ` · ${user.company}` : ""} · Overall {Math.round(Number((r as any).overall_score ?? 0))}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(r as any).type_code && (
            <Badge variant="outline" className="font-mono font-bold tracking-widest">
              Code: {(r as any).type_code}
            </Badge>
          )}
          <Badge className={approved ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
            {approved ? "Approved & sent" : "Pending review"}
          </Badge>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-2">
          <h2 className="font-bold text-primary">Overall Score (%)</h2>
          <Input type="number" min={0} max={100} className="max-w-[140px]" value={overall} onChange={(e) => setOverall(e.target.value)} />
        </CardContent>
      </Card>

      {((r as any).uploads ?? []).length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-2">
            <h2 className="font-bold text-primary">Client Uploaded Documents</h2>
            <ul className="space-y-1 text-sm">
              {((r as any).uploads as any[]).map((u, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <a href={u.url ?? "#"} target="_blank" rel="noreferrer" className="text-accent font-semibold underline">
                    {u.name ?? "Document"}
                  </a>
                  {u.question && <span className="text-xs text-muted-foreground">· {u.question}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-2">
          <h2 className="font-bold text-primary">Executive Summary</h2>
          <Textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </CardContent>
      </Card>

      {listEditor("Strengths", strengths, setStrengths)}
      {listEditor("Weaknesses / Gaps", gaps, setGaps)}

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-bold text-primary">Action Plan</h2>
          {plan.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-12 gap-2 items-start p-3 rounded-md bg-secondary/40">
              <Input className="sm:col-span-2" value={item.priority} placeholder="P1"
                onChange={(e) => setPlan(plan.map((x, j) => (j === i ? { ...x, priority: e.target.value } : x)))} />
              <Input className="sm:col-span-4" value={item.title} placeholder="Title"
                onChange={(e) => setPlan(plan.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <Input className="sm:col-span-4" value={item.outcome} placeholder="Outcome"
                onChange={(e) => setPlan(plan.map((x, j) => (j === i ? { ...x, outcome: e.target.value } : x)))} />
              <div className="sm:col-span-2 flex gap-2">
                <Input value={item.timeframe} placeholder="30 days"
                  onChange={(e) => setPlan(plan.map((x, j) => (j === i ? { ...x, timeframe: e.target.value } : x)))} />
                <button className="text-destructive p-2 rounded hover:bg-destructive/10" onClick={() => setPlan(plan.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setPlan([...plan, { priority: "P2", title: "", outcome: "", timeframe: "30 days" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add action
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-bold text-primary">Root Causes</h2>
          {causes.map((c, i) => (
            <div key={i} className="grid sm:grid-cols-12 gap-2 items-start p-3 rounded-md bg-secondary/40">
              <Input className="sm:col-span-5" value={c.symptom} placeholder="Symptom"
                onChange={(e) => setCauses(causes.map((x, j) => (j === i ? { ...x, symptom: e.target.value } : x)))} />
              <Input className="sm:col-span-6" value={c.cause} placeholder="Underlying cause"
                onChange={(e) => setCauses(causes.map((x, j) => (j === i ? { ...x, cause: e.target.value } : x)))} />
              <div className="sm:col-span-1 flex justify-end">
                <button className="text-destructive p-2 rounded hover:bg-destructive/10" onClick={() => setCauses(causes.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setCauses([...causes, { symptom: "", cause: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add root cause
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-2">
          <h2 className="font-bold text-primary">Growth Opportunity</h2>
          <Textarea rows={4} value={growth} onChange={(e) => setGrowth(e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-end sticky bottom-0 bg-background/90 backdrop-blur py-3">
        <Button variant="outline" disabled={mut.isPending} onClick={() => mut.mutate(false)}>
          <Save className="h-4 w-4 mr-1" /> Save changes
        </Button>
        <Button className="bg-primary hover:bg-primary/90" disabled={mut.isPending} onClick={() => mut.mutate(true)}>
          <Send className="h-4 w-4 mr-1" /> {approved ? "Re-send to client" : "Confirm & send to client"}
        </Button>
      </div>
    </div>
  );
}
