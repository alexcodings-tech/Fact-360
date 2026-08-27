import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminGetOrganisation, adminGenerateDraft, adminSaveReport, adminApproveReport } from "@/lib/org.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, ArrowLeft, CheckCircle2, Paperclip } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/organisations/$id")({
  ssr: false,
  component: AdminOrganisation,
});

type Draft = any;

function List({ title, items, onChange }: { title: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-primary">{title}</label>
      <Textarea
        rows={Math.max(3, items.length)}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").filter(Boolean))}
        className="mt-1"
      />
    </div>
  );
}

function AdminOrganisation() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetOrganisation);
  const genFn = useServerFn(adminGenerateDraft);
  const saveFn = useServerFn(adminSaveReport);
  const approveFn = useServerFn(adminApproveReport);

  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-org", id], queryFn: () => getFn({ data: { id } }) });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [guidance, setGuidance] = useState("");

  const latest = (data as any)?.reports?.[0] ?? null;
  useEffect(() => { if (latest) setDraft(latest.edited ?? latest.ai_draft); }, [latest?.id]);

  const genMut = useMutation({
    mutationFn: () => genFn({ data: { id, guidance } }),
    onSuccess: () => { toast.success("AI draft generated."); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Draft failed"),
  });
  const saveMut = useMutation({
    mutationFn: () => saveFn({ data: { reportId: latest.id, edited: draft } }),
    onSuccess: () => { toast.success("Report saved."); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const approveMut = useMutation({
    mutationFn: () => approveFn({ data: { reportId: latest.id } }),
    onSuccess: () => { toast.success("Report approved and shared with the client."); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Approve failed"),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  const org: any = (data as any)?.organisation;
  if (!org) return <div className="p-8 text-center text-destructive">Not found.</div>;
  const responses: any[] = (data as any).responses ?? [];
  const deptById = new Map((org.org_departments ?? []).map((d: any) => [d.id, d]));

  return (
    <div className="space-y-5">
      <Link to="/admin/organisations" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Organisations</Link>
      <div>
        <h1 className="text-2xl font-bold text-primary">{org.name}</h1>
        <p className="text-sm text-muted-foreground">{org.industry ?? "—"} • {org.org_type ?? "—"} • {org.company_size ?? "—"} • Level {org.current_level} → {org.target_level}</p>
      </div>

      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Assessment data</TabsTrigger>
          <TabsTrigger value="report">AI analysis & report</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4 mt-4">
          <Card><CardContent className="p-5 grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs font-semibold text-muted-foreground">Director</span><div>{org.director_name ?? "—"} • {org.director_email ?? "—"} • {org.director_phone ?? "—"}</div></div>
            <div><span className="text-xs font-semibold text-muted-foreground">Business position</span><div>{org.business_position ?? "—"}</div></div>
            <div className="sm:col-span-2"><span className="text-xs font-semibold text-muted-foreground">Objectives</span><div>{org.objectives ?? "—"}</div></div>
          </CardContent></Card>

          {(org.org_departments ?? []).map((d: any) => (
            <Card key={d.id}><CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold text-primary flex-1">{d.name}</h3>
                <Badge variant="secondary" className="text-[10px]">{d.status}</Badge>
                {typeof d.score === "number" && <span className="text-xs text-muted-foreground">Score {d.score}%</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {d.respondent_name ?? "No respondent yet"} {d.respondent_role ? `• ${d.respondent_role}` : ""} {d.respondent_email ? `• ${d.respondent_email}` : ""}
              </div>
              <div className="mt-3 space-y-2">
                {responses.filter((r) => r.department_id === d.id).map((r, i) => (
                  <div key={i} className="rounded-md border border-border p-3 text-sm">
                    <div className="font-medium text-foreground">{r.question?.text}</div>
                    <div className="text-muted-foreground mt-1">{r.selected_label ?? r.value_text ?? (r.value_number !== null ? r.value_number : "—")}</div>
                    {(r.attachments ?? []).map((a: any) => (
                      <a key={a.path} href={a.url ?? "#"} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline">
                        <Paperclip className="h-3 w-3" /> {a.name}
                      </a>
                    ))}
                  </div>
                ))}
                {responses.filter((r) => r.department_id === d.id).length === 0 && <div className="text-xs text-muted-foreground">No responses yet.</div>}
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        <TabsContent value="report" className="space-y-4 mt-4">
          <Card><CardContent className="p-5 space-y-3">
            <label className="text-xs font-semibold">Guidance for the AI (optional)</label>
            <Input value={guidance} onChange={(e) => setGuidance(e.target.value)} placeholder="e.g. Focus on cash discipline and second-line leadership" />
            <Button disabled={genMut.isPending} onClick={() => genMut.mutate()}>
              {genMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />} Generate AI draft
            </Button>
            {latest && <div className="text-xs text-muted-foreground">Latest: v{latest.version} • {latest.status} • overall {latest.overall_score}%</div>}
          </CardContent></Card>

          {draft && latest && (
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-primary">Executive summary</label>
                <Textarea rows={5} value={draft.executive_summary ?? ""} onChange={(e) => setDraft({ ...draft, executive_summary: e.target.value })} className="mt-1" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {(draft.metric_scores ?? []).map((m: any, i: number) => (
                  <div key={i} className="rounded-md border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium flex-1">{m.area}</span>
                      <Input
                        type="number" className="w-20 h-8" value={m.score}
                        onChange={(e) => {
                          const next = [...draft.metric_scores];
                          next[i] = { ...m, score: Number(e.target.value) };
                          setDraft({ ...draft, metric_scores: next });
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2} className="mt-2 text-xs" value={m.comment ?? ""}
                      onChange={(e) => {
                        const next = [...draft.metric_scores];
                        next[i] = { ...m, comment: e.target.value };
                        setDraft({ ...draft, metric_scores: next });
                      }}
                    />
                  </div>
                ))}
              </div>

              <List title="Strengths" items={draft.strengths ?? []} onChange={(v) => setDraft({ ...draft, strengths: v })} />
              <List title="Gaps / weaknesses" items={draft.gaps ?? []} onChange={(v) => setDraft({ ...draft, gaps: v })} />
              <List title="Areas requiring improvement" items={draft.improvement_areas ?? []} onChange={(v) => setDraft({ ...draft, improvement_areas: v })} />
              <List title="Recommended improvements" items={draft.recommendations ?? []} onChange={(v) => setDraft({ ...draft, recommendations: v })} />
              <List title="Organisational development suggestions" items={draft.development_suggestions ?? []} onChange={(v) => setDraft({ ...draft, development_suggestions: v })} />

              <div>
                <label className="text-xs font-semibold text-primary">Priority actions</label>
                <div className="space-y-2 mt-1">
                  {(draft.priority_actions ?? []).map((p: any, i: number) => (
                    <div key={i} className="grid sm:grid-cols-4 gap-2">
                      {(["priority", "action", "owner", "timeframe"] as const).map((k) => (
                        <Input
                          key={k} value={p[k] ?? ""} placeholder={k}
                          onChange={(e) => {
                            const next = [...draft.priority_actions];
                            next[i] = { ...p, [k]: e.target.value };
                            setDraft({ ...draft, priority_actions: next });
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary">Maturity path</label>
                <Textarea rows={3} value={draft.maturity_path ?? ""} onChange={(e) => setDraft({ ...draft, maturity_path: e.target.value })} className="mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>Save edits</Button>
                <Button disabled={approveMut.isPending || latest.status === "approved"} onClick={() => approveMut.mutate()} className="bg-primary hover:bg-primary/90">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> {latest.status === "approved" ? "Approved" : "Approve & share"}
                </Button>
              </div>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
