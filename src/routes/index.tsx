import { stockImages, assessmentImage } from "@/lib/stock-images";
const heroBusiness = stockImages.heroBusiness;
const catBusiness = stockImages.catBusiness;
const catLeadership = stockImages.catLeadership;
const catHr = stockImages.catHr;
const catFinance = stockImages.catFinance;
const catSales = stockImages.catSales;
const catOperations = stockImages.catOperations;
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ShieldCheck, Lightbulb, FileText, ArrowRight, Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ASSESSMENTS } from "@/data/assessments";
import { useRequireAuthNav } from "@/hooks/use-protected-nav";
import heroBg from "@/assets/hero-fact360.png";
import handshakeImg from "@/assets/hero-handshake.png";
// why-fact360 assets intentionally not imported — section is commented out

import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { TestimonialCarousel } from "@/components/site/TestimonialCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FACT 360° - 360° Business Assessment & Advisory Platform" },
      { name: "description", content: "Understand. Improve. Grow. Science-backed assessments, AI-powered insights and professional advisory reports for sustainable business growth." },
    ],
  }),
  component: Home,
});

const TRUSTED = [
  "Entrepreneur India", "BG Business Connect", "CEO Insights", "Industry Era",
  "Business Standard", "Forbes India", "YourStory", "Inc42", "The Economic Times",
  "Mint", "Business Today", "Fortune India", "ET Now", "CNBC TV18", "Outlook Business",
];

const CAT_IMG: Record<string, string> = {
  Business: catBusiness,
  Leadership: catLeadership,
  HR: catHr,
  Finance: catFinance,
  Sales: catSales,
  Operations: catOperations,
};

function Home() {
  const { t } = useTranslation();
  const requireAuth = useRequireAuthNav();
  return (
    <PublicLayout>
      {/* ───────── HERO — fits initial viewport ───────── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-white/0" />

        <div className="relative py-10 md:py-14 w-full px-0">
          <div className="max-w-2xl md:ml-[50px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> {t("hero.eyebrow")}
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-professional font-bold leading-tight text-primary">
              {t("hero.title_line1")}
              <span className="block text-accent">{t("hero.title_line2")}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-primary/85 max-w-xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 max-w-xl">
              {[
                { icon: ShieldCheck, t: t("hero.feature_science") },
                { icon: Sparkles, t: t("hero.feature_ai") },
                { icon: Lightbulb, t: t("hero.feature_actions") },
                { icon: FileText, t: t("hero.feature_reports") },
              ].map((f) => (
                <li key={f.t} className="flex items-center gap-2 text-sm text-primary">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/20">
                    <f.icon className="h-3.5 w-3.5 text-accent" />
                  </span>
                  <span className="min-w-0">{f.t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/assessments">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/30">
                  {t("hero.cta_explore")} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sample-reports">
                <Button variant="outline" className="bg-white/80 backdrop-blur border-primary/30 text-primary hover:bg-black">{t("hero.cta_sample")}</Button>
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 max-w-md gap-6">
              {[
                { v: 12, s: "+", l: t("hero.stat_assessments") },
                { v: 850, s: "+", l: t("hero.stat_reports") },
                { v: 98, s: "%", l: t("hero.stat_csat") },
              ].map((s) => (
                <div key={s.l}>
                  <AnimatedCounter value={s.v} suffix={s.s} className="text-2xl md:text-3xl font-extrabold text-primary" />
                  <div className="text-xs uppercase tracking-wider text-primary/70 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TRUSTED BY MARQUEE ───────── */}
      <section className="bg-primary text-primary-foreground py-6 border-y border-accent/20">
        <div className="container-page">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-accent font-bold mb-4">
            {t("hero.trusted")}
          </p>
        </div>
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track flex gap-12 w-max whitespace-nowrap">
            {[...TRUSTED, ...TRUSTED].map((b, i) => (
              <span key={i} className="text-sm font-semibold opacity-80 flex items-center gap-12">
                {b}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FACT 360° section hidden per request — kept for future re-enable */}

      {/* ───────── FEATURED ASSESSMENTS (asymmetric with real photos) ───────── */}
      <section className="bg-secondary/40">
        <div className="container-page py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("market.eyebrow")}</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-primary">
                {t("market.title")}
              </h2>
              <p className="text-muted-foreground mt-2">{t("market.subtitle")}</p>
            </div>
            <Link to="/assessments">
              <Button variant="outline" className="border-primary/30">{t("market.viewAll")} <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>

          {ASSESSMENTS.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-5 items-stretch">
              {/* Featured card */}
              <div className="rounded-2xl bg-primary text-primary-foreground overflow-hidden relative shadow-xl shadow-primary/20 flex flex-col">
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={assessmentImage(ASSESSMENTS[0].id)}
                    alt={ASSESSMENTS[0].name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-accent text-accent-foreground px-2 py-1 rounded">{t("market.mostPopular")}</span>
                </div>
                <div className="p-6 md:p-7 flex-1 flex flex-col">
                  <h3 className="text-2xl font-extrabold leading-tight">{t(`catalog.${ASSESSMENTS[0].id}.name`, { defaultValue: ASSESSMENTS[0].name })}</h3>
                  <p className="mt-1.5 text-sm text-primary-foreground/80 leading-snug">{t(`catalog.${ASSESSMENTS[0].id}.tagline`, { defaultValue: ASSESSMENTS[0].tagline })}</p>
                  <ul className="mt-4 space-y-2 text-sm text-primary-foreground/90">
                    <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span><span>360° coverage across Governance, People, Operations, Finance, Brand & Technology</span></li>
                    <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span><span>AI-generated company report with benchmarks and gap analysis</span></li>
                    <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span><span>Actionable 90-day roadmap and priority interventions</span></li>
                    <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span><span>Downloadable PDF report — shareable with your leadership team</span></li>
                  </ul>
                  <div className="mt-auto pt-5 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-accent">₹{ASSESSMENTS[0].price.toLocaleString()}</div>
                        <div className="text-[11px] text-primary-foreground/70">{ASSESSMENTS[0].durationMin} {t("assessment.minutes")} · {ASSESSMENTS[0].totalQuestions} {t("assessment.questions")}</div>
                    </div>
                    <Link to="/assessments/$id" params={{ id: ASSESSMENTS[0].id }} onClick={(e) => requireAuth(e)}>
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">{t("market.start")} <ArrowRight className="ml-1 h-3 w-3" /></Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sub cards - 2x2 grid */}
              <div className="grid sm:grid-cols-2 gap-5">
                {ASSESSMENTS.slice(1, 5).map((a) => (
                  <Link
                    key={a.id}
                    to="/assessments/$id"
                    params={{ id: a.id }}
                    onClick={(e) => requireAuth(e)}
                    className="group rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={assessmentImage(a.id)}
                        alt={a.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{t(`categories.${a.category}`, { defaultValue: a.category })}</span>
                      <h3 className="mt-1 font-bold text-primary text-sm leading-tight line-clamp-2">{t(`catalog.${a.id}.name`, { defaultValue: a.name })}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 flex-1">{t(`catalog.${a.id}.tagline`, { defaultValue: a.tagline })}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/70">
                        <div className="text-[11px] text-muted-foreground">{a.durationMin} {t("assessment.minutes")}</div>
                        <div className="font-bold text-primary text-sm">₹{a.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ───────── SUCCESS STORIES — with handshake background ───────── */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={handshakeImg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95" />
        <div className="container-page relative py-16 md:py-24">
          <TestimonialCarousel />
        </div>
      </section>

      {/* ───────── CTA — full-cover section (image 90% visible) ───────── */}
      <section className="relative overflow-hidden">
        <img
          src={heroBusiness}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/70" />

        <div className="container-page relative py-20 md:py-28 text-primary-foreground text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/25 text-accent px-3 py-1 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> {t("cta.badge")}
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight max-w-4xl mx-auto">
            {t("cta.title")} <span className="text-accent">{t("cta.title_accent")}</span>
          </h2>
          <p className="mt-4 text-white/95 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/95 max-w-2xl mx-auto">
            {[t("cta.f1"), t("cta.f2"), t("cta.f3"), t("cta.f4")].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> {x}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/assessments/$id" params={{ id: "fact-360" }} onClick={(e) => requireAuth(e)}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                {t("cta.start")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>

            <Link to="/pricing">
              <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-white hover:text-primary">
                {t("cta.pricing")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
