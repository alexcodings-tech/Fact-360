import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAssessments, adminCreateAssessment } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/assessments")({
  ssr: false,
  component: AdminAssessments,
});

function AdminAssessments() {
  const listFn = useServerFn(adminListAssessments);
  const createFn = useServerFn(adminCreateAssessment);

  const { data: list = [], refetch } = useQuery({ queryKey: ["admin-assessments"], queryFn: () => listFn() });
  const [adding, setAdding] = useState(false);

  const mut = useMutation({
    mutationFn: (v: any) => createFn({ data: v }),
    onSuccess: () => { toast.success("Assessment created."); setAdding(false); refetch(); },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    mut.mutate({
      slug: String(f.get("slug")),
      name: String(f.get("name")),
      tagline: String(f.get("tagline") ?? ""),
      category: String(f.get("category")),
      price: Number(f.get("price")),
      duration_min: Number(f.get("duration")),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Assessments</h1>
          <p className="text-sm text-muted-foreground">Manage the assessment catalog and questionnaires.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-1" /> New Assessment
        </Button>
      </div>

      {adding && (
        <Card className="border-accent/40">
          <CardContent className="p-6">
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold">Slug</label><Input required name="slug" placeholder="my-assessment" /></div>
              <div><label className="text-xs font-semibold">Name</label><Input required name="name" placeholder="My Assessment" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-semibold">Tagline</label><Input name="tagline" placeholder="Short tagline" /></div>
              <div><label className="text-xs font-semibold">Category</label><Input required name="category" placeholder="Business" /></div>
              <div><label className="text-xs font-semibold">Price (₹)</label><Input required type="number" name="price" defaultValue={500} /></div>
              <div><label className="text-xs font-semibold">Duration (min)</label><Input required type="number" name="duration" defaultValue={30} /></div>
              <div className="sm:col-span-2 flex gap-2 justify-end mt-2">
                <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={mut.isPending} className="bg-primary hover:bg-primary/90">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((a: any) => (
          <Card key={a.id} className="border-border/60">
            <CardContent className="p-5">
              <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
              <h3 className="mt-2 font-bold text-primary">{a.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{a.sections?.length ?? 0} sections • ₹{Number(a.price).toLocaleString()} • {a.duration_min} min</p>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">No assessments yet.</div>}
      </div>
    </div>
  );
}
