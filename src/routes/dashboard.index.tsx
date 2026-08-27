import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyAttempts } from "@/lib/assessments.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, Clock, FileText, Plus } from "lucide-react";
import { GaugeScore } from "@/components/charts/GaugeScore";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/")({
  ssr: false,
  component: DashboardHome,
});

function DashboardHome() {
  const fn = useServerFn(listMyAttempts);
  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ["my-attempts"],
    queryFn: () => fn(),
  });

  const completed = attempts.filter((a: any) => a.status === "submitted");
  const inProgress = attempts.filter((a: any) => a.status === "in_progress");
  const avg = completed.length
    ? Math.round(completed.reduce((s: number, a: any) => s + Number(a.report?.[0]?.overall_score ?? 0), 0) / completed.length)
    : 0;

  const kpis = [
    { label: "Total Assessments", value: attempts.length, icon: ClipboardCheck, color: "bg-primary/10 text-primary" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "bg-success/15 text-success" },
    { label: "In Progress", value: inProgress.length, icon: Clock, color: "bg-warning/15 text-warning-foreground" },
    { label: "Reports Generated", value: completed.length, icon: FileText, color: "bg-accent/20 text-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${k.color}`}><k.icon className="h-6 w-6" /></div>
              <div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-bold text-primary">{String(k.value).padStart(2, "0")}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary">Your Assessments</h2>
              <Link to="/dashboard/assessments" className="text-xs text-accent font-semibold">View All</Link>
            </div>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">You haven't started any assessments yet.</p>
                <Link to="/assessments"><Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />Browse Marketplace</Button></Link>
              </div>
            ) : (
              <div className="divide-y">
                {attempts.slice(0, 6).map((a: any) => {
                  const score = a.report?.[0]?.overall_score;
                  return (
                    <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
                          <ClipboardCheck className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate text-primary">{a.assessment?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.status === "submitted" && a.submitted_at
                              ? `Completed on ${format(new Date(a.submitted_at), "d MMM yyyy")}`
                              : a.status === "in_progress" ? "In Progress" : a.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {score != null && (
                          <Badge className={Number(score) >= 75 ? "bg-success text-success-foreground" : "bg-secondary"}>{Math.round(Number(score))}%</Badge>
                        )}
                        {a.status === "submitted" ? (
                          <Link to="/dashboard/report/$id" params={{ id: a.id }}>
                            <Button size="sm" variant="outline">View Report</Button>
                          </Link>
                        ) : (
                          <Link to="/dashboard/take/$id" params={{ id: a.id }}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">Continue</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <h2 className="font-bold text-primary mb-3">Average Score</h2>
            <div className="flex justify-center">
              <GaugeScore value={avg} size={200} label={avg >= 75 ? "Strong" : avg >= 50 ? "Fair" : "Needs Work"} sublabel={`${completed.length} reports`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link to="/assessments"><Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" /> Add Assessment</Button></Link>
      </div>
    </div>
  );
}
