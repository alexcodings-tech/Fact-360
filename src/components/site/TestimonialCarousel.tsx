import { stockImages } from "@/lib/stock-images";
const aanya = stockImages.testiAanya;
const rahul = stockImages.testiRahul;
const priya = stockImages.testiPriya;
const vivek = stockImages.testiVivek;
const aishwarya = stockImages.testiAishwarya;
const sneha = stockImages.testiSneha;
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
type Item = { quote: string; name: string; role: string; photo: string };

const items: Item[] = [
  {
    quote:
      "FACT 360° gave us a single source of truth across leadership, finance and operations. The landscape report became our quarterly board artifact within a week.",
    name: "Aanya Mehta",
    role: "CEO · Northwind Industries",
    photo: aanya,
  },
  {
    quote:
      "The AI executive summary saved our consulting team days of drafting. Our clients get insight-rich reports that actually drive action.",
    name: "Rahul Iyer",
    role: "Managing Partner · Growth Labs",
    photo: rahul,
  },
  {
    quote:
      "For the first time, our department heads all see the same scorecard. The gap analysis paid for the platform ten times over in Q1.",
    name: "Priya Suresh",
    role: "COO · Erode Textile Group",
    photo: priya,
  },
  {
    quote:
      "The MBTI-backed personality report gave me a new lens on how I lead my team. Practical, specific and beautifully presented.",
    name: "Vivek Ramachandran",
    role: "Solopreneur · Pondicherry",
    photo: vivek,
  },
  {
    quote:
      "We onboarded our first three retainer clients using the FACT 360° discovery framework and proposal template.",
    name: "Aishwarya Nair",
    role: "Business Consultant · Kochi",
    photo: aishwarya,
  },
  {
    quote:
      "The dashboard and the action plan gave me the confidence to actually pull the trigger on hiring my first COO.",
    name: "Sneha Iyer",
    role: "Founder · Chennai",
    photo: sneha,
  },
];



export function TestimonialCarousel() {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const translatedItems = items.map((item, index) => ({
    ...item,
    quote: t(`testimonials.items.${index}.quote`, { defaultValue: item.quote }),
    role: t(`testimonials.items.${index}.role`, { defaultValue: item.role }),
  }));

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % translatedItems.length), 5000);
    return () => clearInterval(id);
  }, [translatedItems.length]);

  const prev = (i - 1 + translatedItems.length) % translatedItems.length;
  const next = (i + 1) % translatedItems.length;
  const current = translatedItems[i];
  const prevItem = translatedItems[prev];
  const nextItem = translatedItems[next];

  const go = (delta: number) =>
    setI((v) => (v + delta + translatedItems.length) % translatedItems.length);

  return (
    <div className="max-w-6xl mx-auto text-center">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
        {t("testimonials.eyebrow")}
      </div>
      <h2 className="mt-2 text-2xl md:text-3xl font-bold text-primary">
        {t("testimonials.title_pre")} <span className="italic text-accent font-serif">{t("testimonials.title_accent")}</span> {t("testimonials.title_post")}
      </h2>

      {/* progress dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {translatedItems.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Go to slide ${k + 1}`}
            className={`h-2 rounded-full transition-all ${
              k === i ? "w-8 bg-accent" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Cards */}
      <div className="relative mt-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.2fr_1fr] items-center gap-4">
          {/* previous - faded */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-left opacity-50 scale-95">
              <div className="flex items-center gap-3">
                <img src={prevItem.photo} alt={prevItem.name} loading="lazy" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                <div className="font-bold text-primary text-sm truncate">{prevItem.name}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 line-clamp-4">
                {prevItem.quote}
              </p>
            </div>
          </div>

          {/* current - highlighted */}
          <div className="relative">
            <div className="rounded-2xl bg-card shadow-2xl shadow-primary/10 border border-border p-8 md:p-10 text-center animate-fade-in" key={i}>
              <h3 className="text-xl md:text-2xl font-bold text-accent">{current.name}</h3>
              <div className="text-sm text-muted-foreground mt-1">{current.role}</div>
              <p className="mt-5 text-base md:text-lg text-primary leading-relaxed">
                &ldquo;{current.quote}&rdquo;
              </p>
            </div>

            {/* side arrows */}
            <button
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next testimonial"
              onClick={() => go(1)}
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Avatar photo */}
            <div className="mx-auto mt-6 h-16 w-16 rounded-full overflow-hidden ring-4 ring-accent/30 shadow-lg">
              <img src={current.photo} alt={current.name} width={64} height={64} className="h-full w-full object-cover" />
            </div>

            {/* stars */}
            <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-1.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
          </div>

          {/* next - faded */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-left opacity-50 scale-95">
              <div className="flex items-center gap-3">
                <img src={nextItem.photo} alt={nextItem.name} loading="lazy" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                <div className="font-bold text-primary text-sm truncate">{nextItem.name}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 line-clamp-4">
                {nextItem.quote}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
