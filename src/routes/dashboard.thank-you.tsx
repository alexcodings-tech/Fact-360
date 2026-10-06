import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ensureMyReports, listMyAttempts } from "@/lib/assessments.functions";
import { WhatsAppModules } from "@/components/site/WhatsAppModules";

export const Route = createFileRoute("/dashboard/thank-you")({
  ssr: false,
  component: ThankYou,
});

function ThankYou() {
  const navigate = useNavigate();
  const ensure = useServerFn(ensureMyReports);
  const attemptsFn = useServerFn(listMyAttempts);
  const [state, setState] = useState<"working" | "done">("working");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let stopped = false;
    void ensure().catch(() => {});
    const startedAt = Date.now();

    // Check every few seconds whether the report is ready, then open it automatically.
    async function check() {
      if (stopped) return;
      try {
        const rows: any[] = (await attemptsFn()) as any[];
        const latest = rows.find((a) => a.status === "submitted");
        const rep = Array.isArray(latest?.report) ? latest?.report[0] : latest?.report;
        if (rep?.id) {
          stopped = true;
          navigate({ to: "/dashboard/report/$id", params: { id: latest.id } });
          return;
        }
      } catch { /* retry */ }
      if (Date.now() - startedAt > 180000) { setState("done"); return; }
      setTimeout(check, 4000);
    }
    setTimeout(check, 3000);
    return () => { stopped = true; };
  }, [ensure, attemptsFn, navigate]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="border-border/60 text-center">
        <CardContent className="p-10">
          <div className="mx-auto h-16 w-16 rounded-full bg-success/15 text-success grid place-items-center">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-primary">Thank you for completing the assessment</h1>
          <p className="mt-3 text-muted-foreground">
            {state === "working"
              ? "We are analysing your answers. Your report will open here automatically in about a minute."
              : "Your report is taking a little longer. It will appear in My Reports shortly."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
            {state === "working"
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing your report…</>
              : <><Clock className="h-4 w-4" /> Still preparing</>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2 justify-center">
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            <Link to="/dashboard/reports"><Button className="bg-primary hover:bg-primary/90">My Reports</Button></Link>
          </div>
        </CardContent>
      </Card>
      <WhatsAppModules className="mt-6" />
    </div>
  );
}
