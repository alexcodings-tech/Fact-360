import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getAssessment, type Assessment } from "@/data/assessments";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GaugeScore } from "@/components/charts/GaugeScore";
import { RadarScore } from "@/components/charts/RadarScore";
import { ScoreBar } from "@/components/charts/ScoreBar";
import { Download, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { SAMPLE_FACT_SCORES } from "@/data/assessments";

export const Route = createFileRoute("/report/$id")({
  loader: ({ params }): Assessment => {
    const a = getAssessment(params.id);
    if (!a) throw notFound();
    return a;
  },
  notFoundComponent: () => <PublicLayout><div className="p-10 text-center">Report not found.</div></PublicLayout>,
  component: PublicReport,
});

function PublicReport() {
  const a = Route.useLoaderData() as Assessment;
  const radar = [
    { area: "Governance", value: SAMPLE_FACT_SCORES.governance },
    { area: "People", value: SAMPLE_FACT_SCORES.people },
    { area: "Operations", value: SAMPLE_FACT_SCORES.operations },
    { area: "Financial", value: SAMPLE_FACT_SCORES.financial },
    { area: "Brand", value: SAMPLE_FACT_SCORES.brand },
    { area: "Technology", value: SAMPLE_FACT_SCORES.technology },
  ];
  return (
    <PublicLayout>
      <section className="container-page py-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">Sample Advisory Report</p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{a.name}</h1>
          </div>
          <Link to="/report/landscape/$id" params={{ id: a.id }} target="_blank">
            <Button className="bg-primary hover:bg-primary/90"><Download className="h-4 w-4 mr-1" /> Landscape PDF</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h2 className="font-bold text-primary">Overall Score</h2>
              <div className="flex justify-center mt-3"><GaugeScore value={46} size={220} label="Level 2" sublabel="Market Accepted" /></div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h2 className="font-bold text-primary">FACT 360° Radar</h2>
              <RadarScore data={radar} height={260} color="var(--color-destructive)" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5 text-accent" /><h2 className="font-bold">AI Executive Summary</h2></div>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
              This business has built strong distribution and brand foundations but is constrained by financial indiscipline,
              owner dependency and underutilized capacity. With focused execution on cash discipline, leadership and
              process systems, it can scale 2–2.5x within 18 months without major capital investment.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/60"><CardContent className="p-6">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-success" /> Strengths</h3>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• Strong dealer network across AP & Karnataka</li>
              <li>• Diversified own-brand + job-work mix</li>
              <li>• ₹3 Cr CapEx already invested</li>
              <li>• Brand acceptance in shirts & copper sets</li>
            </ul>
          </CardContent></Card>
          <Card className="border-border/60"><CardContent className="p-6">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-destructive" /> Concerns</h3>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• No budgeting or cash flow discipline</li>
              <li>• 90% owner dependency in decisions</li>
              <li>• No second-line leadership</li>
              <li>• 60% production capacity unused</li>
            </ul>
          </CardContent></Card>
        </div>

        <Card className="border-border/60"><CardContent className="p-6">
          <h2 className="font-bold text-primary">Score Breakdown</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {radar.map((r) => <ScoreBar key={r.area} label={r.area} value={r.value} />)}
          </div>
        </CardContent></Card>
      </section>
    </PublicLayout>
  );
}
