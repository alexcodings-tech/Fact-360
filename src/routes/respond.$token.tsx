import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  getDepartmentByToken,
  saveDepartmentAnswer,
  uploadDepartmentFile,
  submitDepartment,
} from "@/lib/org.functions";
import { QuestionField, type QuestionValue } from "@/components/assessment/QuestionField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/site/Logo";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/respond/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Department Assessment — FACT 360°" },
      { name: "description", content: "Complete your department's FACT 360° organisational assessment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Respond,
});

const PAGE_SIZE = 10;

function Respond() {
  const { token } = Route.useParams();
  const loadFn = useServerFn(getDepartmentByToken);
  const saveFn = useServerFn(saveDepartmentAnswer);
  const uploadFn = useServerFn(uploadDepartmentFile);
  const submitFn = useServerFn(submitDepartment);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dept", token],
    queryFn: () => loadFn({ data: { token } }),
    retry: false,
  });

  const [answers, setAnswers] = useState<Record<string, QuestionValue>>({});
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!data) return;
    const map: Record<string, QuestionValue> = {};
    for (const r of data.responses as any[]) {
      map[r.question_id] = {
        score: r.score,
        selectedLabel: r.selected_label,
        valueText: r.value_text,
        valueNumber: r.value_number,
        attachments: r.attachments ?? [],
      };
    }
    setAnswers(map);
    setName((data.department as any).respondent_name ?? "");
    setEmail((data.department as any).respondent_email ?? "");
    setRole((data.department as any).respondent_role ?? "");
  }, [data]);

  const questions = (data?.questions ?? []) as any[];
  const pages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const slice = useMemo(() => questions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [questions, page]);
  const answered = Object.values(answers).filter(
    (a) => a.selectedLabel || a.valueText || a.valueNumber !== null && a.valueNumber !== undefined || (a.attachments ?? []).length,
  ).length;
  const progress = questions.length ? Math.round((answered / questions.length) * 100) : 0;

  const submitMut = useMutation({
    mutationFn: () => submitFn({ data: { token, respondentName: name, respondentEmail: email, respondentRole: role } }),
    onSuccess: () => { toast.success("Assessment submitted. Thank you!"); refetch(); },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit"),
  });

  async function change(qid: string, v: QuestionValue) {
    setAnswers((prev) => ({ ...prev, [qid]: v }));
    try {
      await saveFn({
        data: {
          token,
          questionId: qid,
          score: v.score ?? null,
          selectedLabel: v.selectedLabel ?? null,
          valueText: v.valueText ?? null,
          valueNumber: v.valueNumber ?? null,
        },
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save answer");
    }
  }

  async function upload(qid: string, file: File) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const res: any = await uploadFn({ data: { token, questionId: qid, filename: file.name, contentType: file.type || "application/octet-stream", base64 } });
      setAnswers((prev) => ({ ...prev, [qid]: { ...prev[qid], attachments: res.attachments } }));
      toast.success("File attached");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    }
  }

  if (isLoading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error || !data) return <div className="min-h-screen grid place-items-center px-6 text-center text-destructive">This assessment link is not valid or has expired.</div>;

  const dept: any = data.department;

  if (dept.status === "submitted") {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <Card className="max-w-md w-full"><CardContent className="p-8 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
          <h1 className="text-xl font-bold text-primary">Assessment submitted</h1>
          <p className="text-sm text-muted-foreground">Thank you. The {dept.name} assessment for {dept.organisation?.name} has been received.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b bg-background sticky top-0 z-20">
        <div className="container-page py-3 flex items-center justify-between gap-4">
          <Logo />
          <div className="text-right">
            <div className="text-sm font-semibold text-primary">{dept.name}</div>
            <div className="text-xs text-muted-foreground">{dept.organisation?.name}</div>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <main className="container-page py-6 max-w-3xl space-y-4">
        <Card><CardContent className="p-5 grid sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-semibold">Your name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
          <div><label className="text-xs font-semibold">Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
          <div><label className="text-xs font-semibold">Role</label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. HR Manager" /></div>
          <p className="sm:col-span-3 text-xs text-muted-foreground">If the designated person is unavailable, another staff member from this department may complete it — just enter your own details above.</p>
        </CardContent></Card>

        <Card><CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">Page {page + 1} of {pages}</span>
            <span className="text-muted-foreground">{answered}/{questions.length} answered</span>
          </div>
          {slice.map((q, i) => (
            <QuestionField
              key={q.id}
              question={q}
              index={page * PAGE_SIZE + i}
              value={answers[q.id]}
              onChange={(v) => change(q.id, v)}
              onUpload={(f) => upload(q.id, f)}
            />
          ))}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" disabled={page === 0} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0 }); }}>Previous</Button>
            {page < pages - 1 ? (
              <Button onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0 }); }}>Next</Button>
            ) : (
              <Button
                disabled={submitMut.isPending || name.trim().length < 2}
                onClick={() => submitMut.mutate()}
                className="bg-primary hover:bg-primary/90"
              >
                {submitMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Submit assessment
              </Button>
            )}
          </div>
        </CardContent></Card>
      </main>
    </div>
  );
}
