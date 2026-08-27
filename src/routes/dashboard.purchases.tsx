import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listMyPurchases } from "@/lib/payments.functions";

export const Route = createFileRoute("/dashboard/purchases")({
  ssr: false,
  loader: async () => await listMyPurchases(),
  component: Purchases,
});

function Purchases() {
  const rows = Route.useLoaderData() as any[];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Purchase History</h1>
      <Card className="border-border/60">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No purchases yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr className="text-xs uppercase text-muted-foreground">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Assessment</th>
                  <th className="text-left p-3">Order ID</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-right p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-primary">{r.assessment?.name ?? "—"}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{r.order_id ?? "—"}</td>
                    <td className="p-3 text-right font-mono">₹{Number(r.amount).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <Badge className={r.status === "paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
