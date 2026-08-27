import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import sampleFact360 from "@/assets/sample-fact-360.jpg";
import sampleLeadership360 from "@/assets/sample-leadership-360.jpg";

export const Route = createFileRoute("/sample-reports")({
  head: () => ({
    meta: [
      { title: "Sample Reports — FACT 360°" },
      { name: "description", content: "Preview the FACT 360° and Leadership advisory reports." },
    ],
  }),
  component: SampleReports,
});

const samples = [
  {
    id: "fact-360",
    name: "FACT 360° Business Architecture",
    desc: "Complete business health scorecard, radar view, root-cause analysis and director's conclusion.",
    pages: "1-page landscape + 18-page detail",
    img: sampleFact360,
  },
  {
    id: "leadership-360",
    name: "360° Leadership & Personality",
    desc: "Leadership profile, signature traits, shadow risks and next-level mandate.",
    pages: "1-page landscape + 12-page detail",
    img: sampleLeadership360,
  },
];

function SampleReports() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<null | { src: string; name: string }>(null);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-secondary/40 to-background">
        <div className="container-page py-14 md:py-16 text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">
            {t("sampleReports.eyebrow")}
          </div>
          <h1 className="mt-2 text-3xl md:text-5xl font-professional font-bold text-primary">
            {t("sampleReports.title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("sampleReports.subtitle")}</p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {samples.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
              data-aos="fade-up"
            >
              <button
                type="button"
                onClick={() => setPreview({ src: s.img, name: s.name })}
                className="relative h-48 overflow-hidden group cursor-zoom-in"
                aria-label={`Preview ${s.name}`}
              >
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              </button>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-primary text-lg">
                  {t(`sampleReports.samples.${s.id}.name`, { defaultValue: s.name })}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t(`sampleReports.samples.${s.id}.desc`, { defaultValue: s.desc })}
                </p>
                <p className="text-xs text-accent font-semibold mt-2">
                  {t(`sampleReports.samples.${s.id}.pages`, { defaultValue: s.pages })}
                </p>
                <div className="mt-auto pt-4">
                  <Button
                    onClick={() => setPreview({ src: s.img, name: s.name })}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Eye className="h-4 w-4 mr-1" />{" "}
                    {t("sampleReports.viewLandscape", { defaultValue: "View Report" })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-3 border-b space-y-0">
            <DialogTitle className="text-left text-primary">{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="bg-secondary/30 max-h-[80vh] overflow-auto">
              <img src={preview.src} alt={preview.name} className="w-full h-auto block" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
