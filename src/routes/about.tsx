import { stockImages } from "@/lib/stock-images";
const journeyImg = stockImages.aboutHero;
const ctaAnalytics = stockImages.ctaAnalytics;
const journeyCollab = stockImages.journeyCollab;
const heroBusiness = stockImages.heroBusiness;
const catLeadership = stockImages.catLeadership;
const catOperations = stockImages.catOperations;
const catFinance = stockImages.catFinance;
const catHr = stockImages.catHr;
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Sparkles, Target, Users, Zap, FileText } from "lucide-react";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { ParticlesBg } from "@/components/site/ParticlesBg";
import { FloatingBeliefs } from "@/components/site/FloatingBeliefs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Typed from "typed.js";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — FACT 360°" }, { name: "description", content: "Learn about FACT 360° — the 360° Business Assessment & Advisory Platform helping SMEs grow with clarity." }] }),
  component: About,
});

const DELIVER_ITEMS = [
  {
    title: "Board-ready landscape one-pager",
    desc: "A single shareable link capturing scorecard, radar, strengths, gaps, executive summary and action plan — all on one landscape page.",
    icon: Target,
    image: heroBusiness,
  },
  {
    title: "AI executive summary",
    desc: "A plain-English narrative your board can read in minutes — no dashboards to decode, no jargon to translate.",
    icon: Sparkles,
    image: catLeadership,
  },
  {
    title: "Multi-page detail report",
    desc: "Section-by-section breakdown with root causes, benchmarks and the reasoning behind every score.",
    icon: FileText,
    image: catFinance,
  },
  {
    title: "Prioritized action plan",
    desc: "Every recommendation ranked by impact, effort and timeframe so leadership knows exactly where to start.",
    icon: Zap,
    image: catOperations,
  },
  {
    title: "Multi-stakeholder invites",
    desc: "CEOs, managers and department heads answer online — you get one consolidated 360° view of the business.",
    icon: Users,
    image: catHr,
  },
  {
    title: "Quarterly re-assessment",
    desc: "Track compounding progress against a locked baseline and prove ROI to your board every quarter.",
    icon: Compass,
    image: journeyCollab,
  },
];

const STEPS = [
  { n: "01", title: "Assess", desc: "Your team answers a structured questionnaire covering every business pillar.", image: catHr },
  { n: "02", title: "Diagnose", desc: "Our formula engine and AI narrative reveal your true strengths and gaps.", image: catFinance },
  { n: "03", title: "Recommend", desc: "You receive ranked, impact-weighted actions that leadership can own today.", image: catLeadership },
  { n: "04", title: "Transform", desc: "Execute the roadmap with quarterly milestone check-ins and support.", image: catOperations },

];


function About() {
  const { t } = useTranslation();
  const typedEl = useRef<HTMLSpanElement>(null);
  const [activeDeliver, setActiveDeliver] = useState(0);

  useEffect(() => {
    if (!typedEl.current) return;
    const t = new Typed(typedEl.current, {
      strings: [
        "Business Architecture.",
        "Leadership Effectiveness.",
        "People & Culture.",
        "Operational Excellence.",
        "Growth Readiness.",
      ],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
    });
    return () => t.destroy();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveDeliver((v) => (v + 1) % DELIVER_ITEMS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <PublicLayout>
      {/* Hero with typed.js */}
      <section className="bg-gradient-to-br from-secondary via-background to-background">
        <div className="container-page py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7" data-aos="fade-right">
            <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("about.eyebrow")}</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-primary leading-tight">
              {t("about.title_pre")} {" "}
              <span ref={typedEl} className="text-accent" />
            </h1>
            <p className="mt-5 text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              {t("about.intro")}
            </p>
          </div>
          <div className="lg:col-span-5" data-aos="fade-left">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border">
              <img src={journeyImg} alt="Team reviewing assessment insights" className="w-full h-72 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact numbers */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-14 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: 850, s: "+", l: "Reports delivered" },
            { v: 12, s: "+", l: "Assessments" },
            { v: 98, s: "%", l: "Client satisfaction" },
            { v: 6, s: "", l: "Business pillars" },
          ].map((s) => (
            <div key={s.l} data-aos="zoom-in">
              <AnimatedCounter value={s.v} suffix={s.s} className="text-2xl md:text-3xl font-bold text-accent" />
              <div className="text-xs uppercase tracking-wider text-primary-foreground/70 mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Deliver — single large card, image alternates side, auto-rotates */}
      <section className="bg-background">
        <div className="container-page py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
            <div className="text-sm font-bold uppercase tracking-widest text-accent">What We Deliver</div>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-primary leading-tight">
              Institutional-grade diagnostics, founder-friendly delivery.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Six things every FACT 360° engagement ships — no matter which assessment you choose.
            </p>
          </div>

          {(() => {
            const item = DELIVER_ITEMS[activeDeliver];
            const Icon = item.icon;
            const imageLeft = activeDeliver % 2 === 1;
            return (
              <div
                key={activeDeliver}
                className="mx-auto max-w-6xl rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden grid lg:grid-cols-2 animate-fade-in"
              >
                <div className={`relative min-h-[320px] lg:min-h-[420px] ${imageLeft ? "" : "lg:order-2"}`}>
                  <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                </div>
                <div className={`p-8 md:p-12 flex flex-col justify-center ${imageLeft ? "" : "lg:order-1"}`}>
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-2xl md:text-3xl font-extrabold text-primary leading-tight">{item.title}</h3>
                  <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{item.desc}</p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {DELIVER_ITEMS.map((d, k) => (
                      <button
                        key={d.title}
                        onClick={() => setActiveDeliver(k)}
                        aria-label={d.title}
                        className={`h-2 rounded-full transition-all ${k === activeDeliver ? "w-10 bg-accent" : "w-2 bg-border hover:bg-accent/40"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {activeDeliver + 1} of {DELIVER_ITEMS.length} · auto-advances
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Principles */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/60 via-background to-secondary/40">
        <ParticlesBg color="rgba(212, 175, 55, 0.45)" count={45} />
        <div
          className="relative mx-auto w-full max-w-[1280px]"
          style={{ height: 470, paddingTop: 30, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}
        >
          <div className="text-center max-w-2xl mx-auto px-4" data-aos="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{t("about.believe_title")}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t("about.believe_subtitle")}</p>
          </div>

          <FloatingBeliefs
            items={[
              { t: t("about.p1_t"), d: t("about.p1_d") },
              { t: t("about.p2_t"), d: t("about.p2_d") },
              { t: t("about.p3_t"), d: t("about.p3_d") },
              { t: t("about.p4_t"), d: t("about.p4_d") },
              { t: t("about.p5_t"), d: t("about.p5_d") },
              { t: t("about.p6_t"), d: t("about.p6_d") },
            ]}
          />
        </div>
      </section>

      {/* Our 5-step method — arrows + real images + text */}
      <section className="bg-background">
        <div className="container-page py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
            <div className="text-sm font-bold uppercase tracking-widest text-accent">Our 5-step method</div>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-primary leading-tight">
              Assess. Diagnose. Recommend. Transform. Grow.
            </h2>
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex flex-col lg:flex-row items-center flex-1 gap-2">
                  <div
                    className="flex-1 w-full rounded-2xl border border-border bg-card hover:border-accent transition-all overflow-hidden shadow-sm hover:shadow-lg"
                    data-aos="fade-up"
                    data-aos-delay={i * 80}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                      <div className="absolute top-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground font-extrabold text-sm shadow-lg">
                        {s.n}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="font-bold text-primary text-lg">{s.title}</div>
                      <div className="text-base text-muted-foreground mt-2 leading-relaxed">{s.desc}</div>
                    </div>
                  </div>

                  {i < STEPS.length - 1 && (
                    <ArrowRight className="hidden lg:block h-8 w-8 text-accent shrink-0" strokeWidth={2.5} />
                  )}
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="lg:hidden h-8 w-8 text-accent shrink-0 rotate-90" strokeWidth={2.5} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — realistic bg */}
      <section className="relative overflow-hidden">
        <img src={ctaAnalytics} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="container-page relative py-16 md:py-20 text-primary-foreground flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold">{t("about.cta_title")}</h3>
            <p className="text-primary-foreground/85 mt-2">{t("about.cta_subtitle")}</p>
          </div>
          <Link to="/assessments">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">{t("hero.cta_explore")} <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
