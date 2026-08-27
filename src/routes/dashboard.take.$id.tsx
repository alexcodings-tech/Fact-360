import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAttempt, saveResponse, submitAndGenerateReport, markAttemptSubmitted } from "@/lib/assessments.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard/take/$id")({
  ssr: false,
  component: Take,
});

type Opt = { label: string; score: number };

const PAGE_SIZE = 15;

// Gamified Likert scale: extremes (1 & 5) are the largest circles, 2 & 4 are
// smaller, 3 (neutral) is the smallest. No emojis — colour + size carry meaning.
const SCALE_BY_SCORE: Record<number, { size: string; color: string; selected: string }> = {
  5:   { size: "h-14 w-14 sm:h-16 sm:w-16", color: "border-emerald-400 text-emerald-600", selected: "bg-emerald-500 border-emerald-500 text-white" },
  4:   { size: "h-11 w-11 sm:h-12 sm:w-12", color: "border-lime-400 text-lime-600", selected: "bg-lime-500 border-lime-500 text-white" },
  3:   { size: "h-8 w-8 sm:h-9 sm:w-9", color: "border-muted-foreground/40 text-muted-foreground", selected: "bg-muted-foreground border-muted-foreground text-white" },
  2:   { size: "h-11 w-11 sm:h-12 sm:w-12", color: "border-orange-400 text-orange-600", selected: "bg-orange-500 border-orange-500 text-white" },
  1:   { size: "h-14 w-14 sm:h-16 sm:w-16", color: "border-red-400 text-red-600", selected: "bg-red-500 border-red-500 text-white" },
};
const scaleFor = (score: number) => {
  const norm = score > 5 || score === 0 ? Math.round(score / 25) + 1 : score;
  return SCALE_BY_SCORE[norm] ?? SCALE_BY_SCORE[3];
};

async function celebrate(power: "small" | "page" | "final") {
  if (typeof window === "undefined") return;
  const confetti = (await import("canvas-confetti")).default;
  const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#facc15"];
  if (power === "small") {
    confetti({ particleCount: 140, spread: 100, startVelocity: 55, scalar: 1.5, ticks: 220, gravity: 0.9, colors: COLORS, origin: { y: 0.7 } });
    confetti({ particleCount: 60, spread: 140, startVelocity: 35, scalar: 2.2, ticks: 200, colors: COLORS, origin: { y: 0.6 } });
    return;
  }
  if (power === "page") {
    confetti({ particleCount: 320, spread: 130, startVelocity: 65, scalar: 1.8, ticks: 260, colors: COLORS, origin: { y: 0.65 } });
    setTimeout(() => confetti({ particleCount: 180, angle: 60, spread: 90, startVelocity: 70, scalar: 1.6, colors: COLORS, origin: { x: 0, y: 0.8 } }), 180);
    setTimeout(() => confetti({ particleCount: 180, angle: 120, spread: 90, startVelocity: 70, scalar: 1.6, colors: COLORS, origin: { x: 1, y: 0.8 } }), 320);
    return;
  }
  const end = Date.now() + 3500;
  (function frame() {
    confetti({ particleCount: 14, angle: 60, spread: 90, startVelocity: 65, scalar: 1.6, colors: COLORS, origin: { x: 0, y: 0.75 } });
    confetti({ particleCount: 14, angle: 120, spread: 90, startVelocity: 65, scalar: 1.6, colors: COLORS, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 400, spread: 160, startVelocity: 70, scalar: 2, ticks: 320, colors: COLORS, origin: { y: 0.5 } });
}



function Take() {
  const { id: attemptId } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const get = useServerFn(getAttempt);
  const save = useServerFn(saveResponse);
  const submit = useServerFn(submitAndGenerateReport);
  const markSubmitted = useServerFn(markAttemptSubmitted);

  const { data, isLoading, error } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => get({ data: { attemptId } }),
  });

  const [answers, setAnswers] = useState<Record<string, { score: number; label: string }>>({});
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [iconByQ, setIconByQ] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.responses) {
      const a: Record<string, { score: number; label: string }> = {};
      for (const r of data.responses) a[r.question_id] = { score: r.score ?? 3, label: r.selected_label ?? "" };
      setAnswers(a);
    }
  }, [data]);

  const all = useMemo(() => {
    if (!data) return [] as any[];
    const flat = data.assessment.sections.flatMap((s: any) =>
      s.questions.map((q: any) => ({ ...q, sectionName: s.name, sectionId: s.id })),
    );
    let seed = 0;
    for (let i = 0; i < attemptId.length; i++) seed = (seed * 31 + attemptId.charCodeAt(i)) >>> 0;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
    const arr = [...flat];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data, attemptId]);

  // Seed icons from the DB cache once questions are loaded.
  useEffect(() => {
    if (all.length === 0) return;
    setIconByQ((prev) => {
      const next = { ...prev };
      for (const q of all) if (q.icon && !next[q.id]) next[q.id] = q.icon as string;
      return next;
    });
  }, [all]);

  // Fetch AI-generated icons for all questions missing one.
  useEffect(() => {
    if (all.length === 0) return;
    const missing = all.filter((q: any) => !iconByQ[q.id]);
    if (missing.length === 0) return;
    const items = missing.slice(0, 30).map((q: any) => ({ id: q.id, text: q.text }));
    fetch("/api/question-icons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => (r.ok ? r.json() : { icons: [] }))
      .then((res: { icons: { id: string; icon: string }[] }) => {
        if (!res?.icons?.length) return;
        setIconByQ((prev) => {
          const next = { ...prev };
          for (const row of res.icons) if (!next[row.id]) next[row.id] = row.icon;
          return next;
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);

  const saveMut = useMutation({ mutationFn: (v: any) => save({ data: v }) });
  const submitMut = useMutation({
    mutationFn: async () => {
      // Mark submitted first (fast) so the client is never stuck on a spinner,
      // then kick off AI report generation in the background for the admin review queue.
      await markSubmitted({ data: { attemptId } });
      void submit({ data: { attemptId } }).catch(() => {});
      return { ok: true };
    },
    onSuccess: () => navigate({ to: "/dashboard/thank-you" }),
    onError: (e: any) => toast.error(e.message ?? "Submission failed"),
  });


  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  if (error || !data) return <div className="p-8 text-center text-destructive">Could not load assessment.</div>;
  if (data.status === "submitted") {
    return (
      <div className="p-8 text-center">
        <p>This assessment has already been submitted.</p>
        <Link to="/dashboard/thank-you"><Button className="mt-4">View Status</Button></Link>
      </div>
    );
  }
  if (all.length === 0) return <div className="p-8 text-center">No questions configured.</div>;

  const total = all.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const pageQs = all.slice(start, start + PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / total) * 100;
  const pageAnswered = pageQs.every((q) => answers[q.id]);
  const isLastPage = page === totalPages - 1;

  function pick(q: any, o: Opt) {
    const label = t(`assessment.likert.${o.score}`, { defaultValue: o.label });
    const isNew = !answers[q.id];
    const nextAnswers: Record<string, { score: number; label: string }> = { ...answers, [q.id]: { score: o.score, label } };
    setAnswers(nextAnswers);
    saveMut.mutate({ attemptId, questionId: q.id, score: o.score, selectedLabel: label });
    if (!isNew) return;
    const doneOnPage = pageQs.filter((x: any) => nextAnswers[x.id]).length;
    if (doneOnPage === pageQs.length) {
      void celebrate("page");
      toast.success(`Page ${page + 1} complete! 🎉`);
    } else if (doneOnPage % 5 === 0) {
      void celebrate("small");
      toast.success(`${doneOnPage} answered — keep going!`);
    }
  }

  async function next() {
    if (!pageAnswered) { toast.error("Please answer all questions on this page."); return; }
    if (!isLastPage) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (answeredCount < total) { toast.error("Please answer all questions before submitting."); return; }
    setSubmitting(true);
    void celebrate("final");
    toast.info("Generating your AI-powered report…");
    submitMut.mutate();
  }


  const sectionsOnPage = Array.from(new Set(pageQs.map((q: any) => q.sectionName)));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link to="/dashboard/assessments" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to My Assessments
      </Link>

      <div className="grid gap-4 md:grid-cols-[280px_1fr] items-start">
        <aside className="md:sticky md:top-4 md:self-start">
          <Card className="border-border/60">
            <CardContent className="p-4 md:p-5 space-y-3">
              <h1 className="text-lg font-bold text-primary leading-tight">{data.assessment.name}</h1>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
                <div className="text-2xl font-extrabold text-primary tabular-nums transition-all">{answeredCount * 10} XP</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Level {Math.floor(answeredCount / 10) + 1}</div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Page {page + 1} of {totalPages}</span>
                <span>{answeredCount}/{total}</span>
              </div>
              <Progress value={progress} className="h-2 transition-all duration-500" />
              {sectionsOnPage.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">On this page</div>
                  <ul className="space-y-1 text-sm text-foreground/80">
                    {sectionsOnPage.map((s) => (
                      <li key={s} className="flex gap-2"><span className="text-primary">•</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button size="sm" onClick={next} disabled={submitting || submitMut.isPending} className="bg-primary hover:bg-primary/90">
                  {(submitting || submitMut.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  {isLastPage ? "Submit & Generate Report" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-4 min-w-0">
          <Card className="border-border/60">
            <CardContent className="p-5 md:p-6 space-y-6 divide-y divide-border/60">
              {pageQs.map((q: any, i: number) => {
                const iconName = iconByQ[q.id];
                const QIcon = (iconName && (LucideIcons as any)[iconName]) || Sparkles;
                const answered = !!answers[q.id];
                return (
                  <div key={q.id} className={`${i === 0 ? "" : "pt-6"} transition-colors ${answered ? "opacity-100" : ""}`}>
                    <h2 className="text-base md:text-lg font-semibold text-primary flex items-start gap-2">
                      <span className={`inline-flex items-center justify-center rounded-md p-1.5 shrink-0 mt-0.5 transition-all duration-300 ${answered ? "bg-primary text-primary-foreground scale-105" : "bg-primary/10 text-primary"}`}>
                        <QIcon className="h-4 w-4" />
                      </span>
                      <span>Q{start + i + 1}. {q.text}</span>
                    </h2>

                    <div className="mt-5 flex items-center justify-center gap-3 sm:gap-6">
                      {(q.options as Opt[]).map((o) => {
                        const cfg = scaleFor(o.score);
                        const selected = answers[q.id]?.score === o.score;
                        const label = t(`assessment.likert.${o.score}`, { defaultValue: o.label });
                        return (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => pick(q, o)}
                            title={label}
                            aria-label={label}
                            aria-pressed={selected}
                            className="group flex flex-col items-center gap-2 focus:outline-none"
                          >
                            <span
                              className={`rounded-full border-2 transition-all duration-200 ease-out group-hover:scale-110 group-active:scale-95 ${cfg.size} ${
                                selected ? `${cfg.selected} scale-110 shadow-lg animate-in zoom-in-50` : `bg-background ${cfg.color}`
                              }`}
                            />
                            <span className={`text-[10px] sm:text-[11px] leading-tight text-center max-w-[72px] transition-colors ${selected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );

              })}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button onClick={next} disabled={submitting || submitMut.isPending} className="bg-primary hover:bg-primary/90">
              {(submitting || submitMut.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {isLastPage ? "Submit & Generate Report" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
