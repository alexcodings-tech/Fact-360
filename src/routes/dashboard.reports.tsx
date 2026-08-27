import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText } from "lucide-react";
import { listMyAttempts } from "@/lib/assessments.functions";

export const Route = createFileRoute("/dashboard/reports")({
  ssr: false,
  loader: async () => {
    const attempts = await listMyAttempts();
    return attempts.filter((a: any) => a.status === "submitted");
  },
  component: Reports,
});

function Reports() {
  const reports = Route.useLoaderData() as any[];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Reports</h1>
      {reports.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">
            No reports yet. Complete an assessment to generate your first report.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => {
            const rep = Array.isArray(r.report) ? r.report[0] : r.report;
            const pending = !rep;
            const date = r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—";
            return (
              <Card key={r.id} className="border-border/60">
                <CardContent className="p-5">
                  <div className="h-24 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
                    <FileText className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="font-bold text-primary">{r.assessment?.name}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Completed {date}</span>
                    {pending
                      ? <Badge variant="secondary">Awaiting review</Badge>
                      : <Badge className="bg-success text-success-foreground">{rep?.overall_score ?? 0}%</Badge>}
                  </div>
                  {pending && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Thank you for completing the assessment — you will receive your report within 24 hours.
                    </p>
                  )}
                  <div className={`flex gap-2 mt-3 ${pending ? "hidden" : ""}`}>
                    <Link to={"/dashboard/report/$id" as any} params={{ id: r.id } as any} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm"><Eye className="h-4 w-4 mr-1" /> View</Button>
                    </Link>
                    <Link to={"/report/landscape/$id" as any} params={{ id: r.id } as any} target="_blank" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90" size="sm"><Download className="h-4 w-4 mr-1" /> PDF</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
