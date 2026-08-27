import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListOrganisations } from "@/lib/org.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/organisations/")({
  ssr: false,
  component: AdminOrganisations,
});

function AdminOrganisations() {
  const fn = useServerFn(adminListOrganisations);
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-orgs"], queryFn: () => fn() });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Organisations</h1>
        <p className="text-sm text-muted-foreground">FACT 360° organisational assessments, department progress and AI reports.</p>
      </div>

      <div className="grid gap-3">
        {(data as any[]).map((o) => {
          const submitted = (o.org_departments ?? []).filter((d: any) => d.status === "submitted").length;
          return (
            <Card key={o.id}><CardContent className="p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold text-primary">{o.name}</div>
                <div className="text-xs text-muted-foreground">{o.industry ?? "—"} • {o.company_size ?? "—"} • Level {o.current_level}</div>
              </div>
              <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
              <span className="text-xs text-muted-foreground">{submitted}/{(o.org_departments ?? []).length} submitted</span>
              <Link to="/admin/organisations/$id" params={{ id: o.id }}>
                <Button size="sm" variant="outline">Open</Button>
              </Link>
            </CardContent></Card>
          );
        })}
        {(data as any[]).length === 0 && <div className="text-center py-10 text-muted-foreground">No organisations yet.</div>}
      </div>
    </div>
  );
}
