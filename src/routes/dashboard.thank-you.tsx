import { createFileRoute, Link } from "@tanstack/react-router";
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
  const ensure = useServerFn(ensureMyReports);
  const attemptsFn = useServerFn(listMyAttempts);
  const [state, setState] = useState<"working" | "done">("working");
  // Non-organisational modules release the report instantly; org-360 goes to admin review.
  const [readyAttemptId, setReadyAttemptId] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Never leave the user on an endless spinner: stop waiting after 25s and
    // show the review message. Generation continues on the server regardless.
    const stopWaiting = setTimeout(() => setState("done"), 25000);
    ensure()
      .catch(() => {})
      .then(async () => {
        clearTimeout(stopWaiting);
        try {
          const rows: any[] = (await attemptsFn()) as any[];
          const latest = rows.find((a) => a.status === "submitted");
          const rep = Array.isArray(latest?.report) ? latest?.report[0] : latest?.report;
          if (rep?.id) setReadyAttemptId(latest.id);
        } catch {
          /* leave in review state */
        }
        setState("done");
      });
  }, [ensure, attemptsFn]);

  const instant = !!readyAttemptId;

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
              ? "Your responses have been submitted successfully. We are analysing your answers now."
              : instant
                ? "Your responses have been analysed and your report is ready to view."
                : "Your responses have been submitted successfully. Our team is reviewing your results and you will receive your report within 24 hours."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
            {state === "working"
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing your answers… please keep this page open for a moment</>
              : instant
                ? <><CheckCircle2 className="h-4 w-4" /> Report generated</>
                : <><Clock className="h-4 w-4" /> Analysis complete — report sent for expert review</>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2 justify-center">
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            {instant ? (
              <Link to="/dashboard/report/$id" params={{ id: readyAttemptId! }}>
                <Button className="bg-primary hover:bg-primary/90">View My Report</Button>
              </Link>
            ) : (
              <Link to="/dashboard/reports"><Button className="bg-primary hover:bg-primary/90">My Reports</Button></Link>
            )}
          </div>
        </CardContent>
      </Card>
      <WhatsAppModules className="mt-6" />
    </div>
  );
}
