import { stockImages, assessmentImage } from "@/lib/stock-images";
const catBusiness = stockImages.catBusiness;
const catLeadership = stockImages.catLeadership;
const catHr = stockImages.catHr;
const catFinance = stockImages.catFinance;
const catSales = stockImages.catSales;
const catOperations = stockImages.catOperations;
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyAttempts, startAttempt, listAssessments } from "@/lib/assessments.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { byModuleOrder } from "@/data/assessments";
import { useContactDetailsGate } from "@/components/dashboard/ContactDetailsGate";
const CAT_IMG: Record<string, string> = {
  Business: catBusiness,
  Leadership: catLeadership,
  HR: catHr,
  Finance: catFinance,
  Sales: catSales,
  Operations: catOperations,
  Personality: catLeadership,
};

export const Route = createFileRoute("/dashboard/assessments")({
  ssr: false,
  component: MyAssessments,
});


function MyAssessments() {
  const fn = useServerFn(listMyAttempts);
  const list = useServerFn(listAssessments);
  const startFn = useServerFn(startAttempt);
  const navigate = useNavigate();
  const { hasContactDetails, contactDialog } = useContactDetailsGate();

  const { data: attempts = [] } = useQuery({ queryKey: ["my-attempts"], queryFn: () => fn() });
  const { data: catalog = [] } = useQuery({ queryKey: ["catalog"], queryFn: () => list() });

  async function startOrResume(slug: string) {
    try {
      if (!(await hasContactDetails())) return;
      const { attemptId } = await startFn({ data: { slug } });
      navigate({ to: "/dashboard/take/$id", params: { id: attemptId } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not start assessment");
    }
  }

  return (
    <div className="space-y-6">
      {contactDialog}
      <div>
        <h1 className="text-2xl font-bold text-primary">My Assessments</h1>
        <p className="text-sm text-muted-foreground">Track, continue or start your assessments.</p>
      </div>

      {attempts.length > 0 && (
        <div>
          <h2 className="font-semibold text-primary mb-3">In Progress & Completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.map((a: any) => {
              const completed = a.status === "submitted";
              const img = assessmentImage(a.assessment?.slug);
              return (
                <Card key={a.id} className="border-border/60 overflow-hidden flex flex-col">
                  <div className="relative h-32 overflow-hidden">
                    <img src={img} alt={a.assessment?.name ?? ""} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="text-[10px]">{a.assessment?.category}</Badge>
                    <h3 className="mt-2 font-bold text-primary leading-tight">{a.assessment?.name}</h3>
                    <div className="mt-3 text-xs">
                      Status:{" "}
                      <span className={completed ? "text-success font-semibold" : "text-accent font-semibold"}>
                        {completed ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {completed ? (
                        <Link to="/dashboard/report/$id" params={{ id: a.id }} className="flex-1">
                          <Button className="w-full" variant="outline">View Report</Button>
                        </Link>
                      ) : (
                        <Link to="/dashboard/take/$id" params={{ id: a.id }} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90">Continue</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-primary mb-3">Browse Catalog</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...catalog].sort(byModuleOrder).map((a: any) => {
            const img = assessmentImage(a.slug);
            return (
              <Card key={a.id} className="border-border/60 overflow-hidden flex flex-col">
                <div className="relative h-32 overflow-hidden">
                  <img src={img} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                  <h3 className="mt-2 font-bold text-primary leading-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{a.tagline}</p>
                  <div className="mt-4 flex gap-2">
                    {a.slug === "org-360" ? (
                      <Link to="/dashboard/fact360" className="flex-1">
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Open 360° Business Analysis</Button>
                      </Link>
                    ) : (
                      <Button onClick={() => startOrResume(a.slug)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
