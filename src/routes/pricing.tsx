import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Star, Building2, Gift, Flame, ShieldCheck, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — FACT 360°" }, { name: "description", content: "Transparent pricing for individual assessments and consultant plans." }] }),
  component: Pricing,
});

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/ assessment",
    desc: "A single department deep-dive.",
    icon: Sparkles,
    features: ["1 assessment", "AI insights", "Landscape one-pager PDF", "Email support", "Standard turnaround"],
    cta: "Choose Starter",
  },
  {
    name: "Growth",
    price: "₹1,500",
    period: "/ bundle",
    desc: "Most popular — full business 360°.",
    icon: Star,
    features: [
      "FACT 360° + Leadership 360°",
      "AI executive summary",
      "Landscape + detailed PDF",
      "Prioritized action plan",
      "Roadmap & re-assessment credit",
      "Priority support",
    ],
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Consultant",
    price: "Contact us",
    period: "",
    desc: "For coaches, advisors & firms.",
    icon: Building2,
    features: [
      "Unlimited assessments",
      "White-label reports",
      "Client workspace & seats",
      "Custom formula engine",
      "Dedicated success manager",
      "API & webhook access",
    ],
    cta: "Talk to Sales",
  },
];

function Pricing() {
  const { t } = useTranslation();
  const translatedPlans = plans.map((plan) => ({
    ...plan,
    name: t(`pricing.plans.${plan.name}.name`, { defaultValue: plan.name }),
    period: t(`pricing.plans.${plan.name}.period`, { defaultValue: plan.period }),
    desc: t(`pricing.plans.${plan.name}.desc`, { defaultValue: plan.desc }),
    cta: t(`pricing.plans.${plan.name}.cta`, { defaultValue: plan.cta }),
    features: plan.features.map((feature, index) => t(`pricing.plans.${plan.name}.features.${index}`, { defaultValue: feature })),
  }));
  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-page py-14 md:py-20 text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("pricing.eyebrow")}</div>
          <h1 className="mt-2 text-3xl md:text-5xl font-professional font-bold text-primary">{t("pricing.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>
      </section>

      <section className="container-page pt-10 pb-16">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {translatedPlans.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className={`relative rounded-2xl border p-7 flex flex-col ${p.featured ? "border-accent bg-gradient-to-b from-primary to-primary/95 text-primary-foreground shadow-2xl shadow-primary/25 scale-[1.02]" : "border-border bg-card"}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1 rounded-full">
                    {t("market.mostPopular")}
                  </div>
                )}
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${p.featured ? "bg-accent/20 text-accent" : "bg-accent/15 text-accent"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`mt-4 text-xl font-extrabold ${p.featured ? "text-primary-foreground" : "text-primary"}`}>{p.name}</h3>
                <p className={`text-sm mt-1 ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.desc}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${p.featured ? "text-accent" : "text-primary"}`}>{p.price}</span>
                  {p.period && <span className={`text-sm ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.period}</span>}
                </div>

                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-accent" : "text-success"}`} />
                      <span className={p.featured ? "text-primary-foreground/95" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/assessments" className="mt-7">
                  <Button className={`w-full ${p.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary hover:bg-primary/90"}`}>
                    {p.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Complete business program ───────── */}
      <section className="container-page pt-14">
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: title + price */}
            <div className="p-8 relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 text-white text-xs font-bold px-3 py-1">
                <Flame className="h-3.5 w-3.5" /> {t("pricing.offerBadge")}
              </div>
              <h2 className="mt-5 text-2xl md:text-3xl font-extrabold text-primary leading-tight">
                {t("pricing.offerTitle")}
              </h2>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-lg text-muted-foreground line-through">₹20,000</span>
                <span className="text-4xl md:text-5xl font-extrabold text-accent">₹9999</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t("pricing.offerMeta")}</div>
            </div>

            {/* Middle: Includes */}
            <div className="p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pricing.includes")}</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {Array.from({ length: 6 }).map((_, i) => t(`pricing.includesList.${i}`)).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Bonus */}
            <div className="p-8 bg-accent/5 relative">
              <div className="absolute top-6 right-6 text-accent"><Gift className="h-6 w-6" /></div>
              <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("pricing.bonus")}</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {Array.from({ length: 4 }).map((_, i) => t(`pricing.bonusList.${i}`)).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full-width CTA bar */}
          <Link to="/assessments" className="block">
            <div className="w-full bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground text-center py-4 font-bold text-base md:text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
              {t("pricing.enroll")} <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground border-t border-border">
            <ShieldCheck className="h-4 w-4 text-success" /> {t("pricing.guarantee")}
          </div>
        </div>
      </section>

      <section className="container-page pt-14 pb-4">
        {/* Comparison strip */}
        <div className="rounded-2xl border border-border overflow-hidden" data-aos="fade-up">
          <div className="grid grid-cols-4 bg-secondary/60 text-xs font-bold uppercase tracking-wider text-primary">
            <div className="p-4">What's included</div>
            <div className="p-4 text-center">Starter</div>
            <div className="p-4 text-center bg-accent/10">Growth</div>
            <div className="p-4 text-center">Consultant</div>
          </div>
          {([
            ["Assessments", "1", "2 (bundle)", "Unlimited"],
            ["AI executive summary", true, true, true],
            ["Landscape one-pager PDF", true, true, true],
            ["Full multi-page report", false, true, true],
            ["White-label & branding", false, false, true],
            ["Client workspace / seats", false, false, true],
            ["Priority support", false, true, "Dedicated CSM"],
          ] as (string | boolean)[][]).map((row) => {
            const cell = (v: string | boolean) =>
              v === true ? <Check className="h-4 w-4 text-success inline" /> :
              v === false ? <span className="text-muted-foreground/50">—</span> :
              v;
            return (
              <div key={String(row[0])} className="grid grid-cols-4 text-sm border-t border-border">
                <div className="p-4 font-semibold text-primary">{row[0]}</div>
                <div className="p-4 text-center text-muted-foreground">{cell(row[1])}</div>
                <div className="p-4 text-center bg-accent/5 text-primary font-semibold">{cell(row[2])}</div>
                <div className="p-4 text-center text-muted-foreground">{cell(row[3])}</div>
              </div>
            );
          })}
        </div>

        {/* FAQ mini */}
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {[
            ["Is there a free trial?", "Every assessment includes a free sample landscape report so you can preview the output before paying."],
            ["What payment methods do you accept?", "Razorpay is coming shortly. In the meantime, purchases are enabled in mock mode for your evaluation."],
            ["Can I white-label reports?", "Yes — on the Consultant plan every report can carry your logo, colors and cover page."],
            ["Do you offer refunds?", "If the report doesn't deliver value, request a refund within 7 days of delivery."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-xl border border-border p-5" data-aos="fade-up">
              <div className="font-bold text-primary">{q}</div>
              <div className="text-sm text-muted-foreground mt-1">{a}</div>
            </div>
          ))}
        </div>
      </section>

    </PublicLayout>
  );
}
