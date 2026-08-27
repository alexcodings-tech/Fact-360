import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyActionPlan } from "@/lib/assessments.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/action-plan")({
  ssr: false,
  component: ActionPlan,
});

const PRIORITY_STYLE: Record<string, string> = {
  P1: "bg-destructive/10 text-destructive",
  P2: "bg-accent/20 text-accent-foreground",
  P3: "bg-secondary text-muted-foreground",
};

function ActionPlan() {
  const fn = useServerFn(getMyActionPlan);
  const { data, isLoading } = useQuery({ queryKey: ["my-action-plan"], queryFn: () => fn() });

  if (isLoading) {
    return <div className="p-10 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  }

  const report: any = data;
  const actions: any[] = Array.isArray(report?.action_plan) ? report.action_plan : [];
  const gaps: string[] = Array.isArray(report?.gaps) ? report.gaps : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Action Plan</h1>
        <p className="text-sm text-muted-foreground">
          Your prioritized improvement roadmap, generated from your latest report.
        </p>
      </div>

      {!report || actions.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-10 text-center space-y-3 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto text-accent" />
            <p>Complete an assessment to see your prioritized action plan here.</p>
            <Link to="/dashboard/assessments"><Button className="mt-2">Browse assessments</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/60">
            <CardContent className="p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[180px]">
                <div className="text-xs text-muted-foreground">Based on</div>
                <div className="font-semibold text-primary">{report.assessment?.name ?? "Latest assessment"}</div>
              </div>
              <Badge className="bg-success text-success-foreground">Overall {report.overall_score}%</Badge>
              <Link to="/dashboard/report/$id" params={{ id: report.attempt_id }}>
                <Button variant="outline" size="sm">View full report</Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {actions.map((a, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-5 flex flex-wrap gap-3 items-start">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded ${PRIORITY_STYLE[a.priority] ?? PRIORITY_STYLE.P3}`}>
                    {a.priority ?? "P3"}
                  </span>
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-primary">{a.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{a.outcome}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.timeframe}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {gaps.length > 0 && (
            <Card className="border-border/60">
              <CardContent className="p-5">
                <h2 className="font-semibold text-primary flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Why these actions
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm list-disc pl-5">
                  {gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
                {report.growth_opportunity && (
                  <p className="mt-4 text-sm text-foreground/80">{report.growth_opportunity}</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
