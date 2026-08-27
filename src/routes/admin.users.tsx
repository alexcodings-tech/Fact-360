import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers, adminListAttempts, adminGrantAdmin } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  component: AdminUsers,
});

function AdminUsers() {
  const usersFn = useServerFn(adminListUsers);
  const attemptsFn = useServerFn(adminListAttempts);
  const grantFn = useServerFn(adminGrantAdmin);

  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => usersFn() });
  const { data: attempts = [], refetch } = useQuery({ queryKey: ["admin-attempts"], queryFn: () => attemptsFn() });

  const grant = useMutation({
    mutationFn: (user_id: string) => grantFn({ data: { user_id } }),
    onSuccess: () => toast.success("Admin role granted."),
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Users & Records</h1>
        <p className="text-sm text-muted-foreground">View users, their assessment records and download scorecards.</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-bold text-primary mb-3">All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b">
                  <th className="text-left py-2">Name</th><th className="text-left py-2">Designation</th><th className="text-left py-2">Company</th><th className="text-left py-2">Joined</th><th className="text-left py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="py-2 font-medium">{u.full_name ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{u.title ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{u.company ?? "—"}</td>
                    <td className="py-2 text-xs text-muted-foreground">{format(new Date(u.created_at), "d MMM yyyy")}</td>
                    <td className="py-2">
                      <Button size="sm" variant="outline" onClick={() => grant.mutate(u.id)}>
                        <ShieldCheck className="h-3 w-3 mr-1" /> Make Admin
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <h2 className="font-bold text-primary mb-3">Assessment Records ({attempts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Assessment</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Code</th>
                  <th className="text-left py-2">Submitted</th>
                  <th className="text-left py-2">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((a: any) => {
                  const score = a.report?.[0]?.overall_score;
                  return (
                    <tr key={a.id}>
                      <td className="py-2 font-medium">
                        {a.user?.full_name ?? "—"}
                        <div className="text-xs text-muted-foreground">{a.user?.title ?? ""}{a.user?.phone ? ` · ${a.user.phone}` : ""}</div>
                      </td>
                      <td className="py-2">{a.assessment?.name}</td>
                      <td className="py-2"><Badge variant="secondary" className={a.status === "submitted" ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}>{a.status}</Badge></td>
                      <td className="py-2 font-bold text-primary">{score != null ? `${Math.round(Number(score))}%` : "—"}</td>
                      <td className="py-2 font-mono font-bold text-accent">{a.report?.[0]?.type_code ?? "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground">{a.submitted_at ? format(new Date(a.submitted_at), "d MMM yyyy") : "—"}</td>
                      <td className="py-2">
                        {a.status === "submitted" && (
                          <Link to="/report/landscape/$id" params={{ id: a.id }} target="_blank">
                            <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" /> Download</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {attempts.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
