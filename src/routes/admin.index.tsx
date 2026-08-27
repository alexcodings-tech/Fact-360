import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats, adminListAttempts } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, FileText, IndianRupee } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminOverview,
});

function AdminOverview() {
  const statsFn = useServerFn(adminStats);
  const listFn = useServerFn(adminListAttempts);
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => statsFn() });
  const { data: attempts = [] } = useQuery({ queryKey: ["admin-attempts"], queryFn: () => listFn() });

  const kpis = [
    { label: "Total Users", value: stats?.users ?? 0, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Attempts", value: stats?.attempts ?? 0, icon: ClipboardList, color: "bg-accent/15 text-accent" },
    { label: "Reports", value: stats?.reports ?? 0, icon: FileText, color: "bg-success/15 text-success" },
    { label: "Revenue (₹)", value: `₹${Number(stats?.revenue ?? 0).toLocaleString()}`, icon: IndianRupee, color: "bg-warning/15 text-warning-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Overview</h1>
        <p className="text-sm text-muted-foreground">Live platform activity across users, assessments and reports.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${k.color}`}><k.icon className="h-6 w-6" /></div>
              <div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-bold text-primary">{k.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-bold text-primary mb-3">Recent Attempts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Assessment</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Report</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.slice(0, 25).map((a: any) => {
                  const score = a.report?.[0]?.overall_score;
                  return (
                    <tr key={a.id}>
                      <td className="py-2 font-medium">{a.user?.full_name ?? "—"}<div className="text-xs text-muted-foreground">{a.user?.company ?? ""}</div></td>
                      <td className="py-2">{a.assessment?.name}</td>
                      <td className="py-2"><Badge variant={a.status === "submitted" ? "default" : "secondary"} className={a.status === "submitted" ? "bg-success text-success-foreground" : ""}>{a.status}</Badge></td>
                      <td className="py-2 font-bold text-primary">{score != null ? `${Math.round(Number(score))}%` : "—"}</td>
                      <td className="py-2">
                        {a.report?.[0]
                          ? <Badge variant="secondary" className={a.report[0].status === "approved" ? "bg-success text-success-foreground" : "bg-warning/20 text-warning-foreground"}>{a.report[0].status === "approved" ? "Sent" : "Pending review"}</Badge>
                          : a.status === "submitted"
                            ? <span className="text-xs text-muted-foreground">Generating…</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{format(new Date(a.created_at), "d MMM yyyy")}</td>
                      <td className="py-2">
                        {a.status === "submitted" && a.report?.[0] && (
                          <Link to="/admin/report/$attemptId" params={{ attemptId: a.id }} className="text-xs text-accent font-semibold">
                            {a.report[0].status === "approved" ? "View report" : "Review & send"}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {attempts.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No attempts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
