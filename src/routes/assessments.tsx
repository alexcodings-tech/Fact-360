import { stockImages, assessmentImage } from "@/lib/stock-images";
const catBusiness = stockImages.catBusiness;
const catLeadership = stockImages.catLeadership;
const catHr = stockImages.catHr;
const catFinance = stockImages.catFinance;
const catSales = stockImages.catSales;
const catOperations = stockImages.catOperations;
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssessments } from "@/lib/assessments.functions";
import { byModuleOrder } from "@/data/assessments";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, FileText, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRequireAuthNav } from "@/hooks/use-protected-nav";
const CAT_IMG: Record<string, string> = {
  Business: catBusiness,
  Leadership: catLeadership,
  HR: catHr,
  Finance: catFinance,
  Sales: catSales,
  Operations: catOperations,
  Personality: catLeadership,
};



export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment Marketplace — FACT 360°" },
      { name: "description", content: "Browse our science-backed business assessments. 360° diagnostics for SMEs, leaders and consultants." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const { t } = useTranslation();
  const requireAuth = useRequireAuthNav();
  const fn = useServerFn(listAssessments);
  const { data = [], isLoading } = useQuery({ queryKey: ["catalog"], queryFn: () => fn() });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(data.map((a: any) => a.category)))], [data]);
  const filtered = data
    .filter((a: any) =>
      (cat === "All" || a.category === cat) &&
      (q === "" || a.name.toLowerCase().includes(q.toLowerCase()) || a.tagline?.toLowerCase().includes(q.toLowerCase())),
    )
    .sort(byModuleOrder);

  return (
    <PublicLayout>
      <section className="container-page py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">{t("assessmentsPage.title")}</h1>
          <p className="text-muted-foreground mt-3">{t("assessmentsPage.subtitle")}</p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("assessmentsPage.search")} className="pl-9 h-11" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`text-xs font-semibold px-3 py-2 rounded-md whitespace-nowrap ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                {c === "All" ? t("assessmentsPage.all") : t(`categories.${c}`, { defaultValue: c })}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">{t("assessmentsPage.loading")}</div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a: any) => {
              const imgSrc = assessmentImage(a.slug);
              return (
                <Card key={a.id} className="border-border/60 hover:shadow-lg transition-shadow group overflow-hidden flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={a.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                    {a.badge && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px]">{a.badge}</Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <Badge variant="secondary" className="text-[10px] self-start">{t(`categories.${a.category}`, { defaultValue: a.category })}</Badge>
                    <h3 className="mt-2 font-bold text-primary leading-snug line-clamp-2">{t(`catalog.${a.slug}.name`, { defaultValue: a.name })}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{t(`catalog.${a.slug}.tagline`, { defaultValue: a.tagline })}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration_min} {t("assessment.minutes")}</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> ₹{Number(a.price).toLocaleString()}</span>
                    </div>
                    <Link to="/auth" params={{ id: a.slug }} onClick={(e) => requireAuth(e)}>
                      <Button className="w-full mt-5 bg-primary group-hover:bg-primary/90">
                        {t("assessmentsPage.viewDetails")} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">{t("assessmentsPage.empty")}</div>
            )}
          </div>

        )}
      </section>
    </PublicLayout>
  );
}
