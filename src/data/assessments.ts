export type Category = "Business" | "Leadership" | "HR" | "Finance" | "Sales" | "Operations" | "Personality";

export type Question = {
  id: string;
  text: string;
  options: { label: string; score: number }[];
};

export type Section = {
  id: string;
  name: string;
  weight: number;
  questions: Question[];
};

export type Assessment = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  price: number;
  durationMin: number;
  sections: Section[];
  totalQuestions: number;
  badge?: string;
};

// The full question bank lives in the database. This static catalog powers the
// marketplace/home cards only; slugs must match the seeded rows in `public.assessments`.
// All modules currently share the same 80-question bank on the backend.
export const ASSESSMENTS: Assessment[] = [
  {
    id: "your-assessment-80",
    name: "Personality Analysis (Know Yourself)",
    tagline: "Module 1 — Understand your personality in depth",
    description:
      "An 80-question personal assessment covering behavior, motivation and work style. Get a detailed personality report you can share with your manager or coach.",
    category: "Personality",
    price: 999,
    durationMin: 40,
    badge: "Most Popular",
    totalQuestions: 80,
    sections: [],
  },
  {
    id: "disc",
    name: "DISC Profiling",
    tagline: "Module 2 — Dominance · Influence · Steadiness · Conscientiousness",
    description:
      "The classic DISC behavioral profile. Understand how you communicate, decide and collaborate — and how to work better with different DISC styles.",
    category: "Personality",
    price: 999,
    durationMin: 25,
    totalQuestions: 80,
    sections: [],
  },
  {
    id: "leadership-manager",
    name: "Leadership Assessment (Know Your Managers)",
    tagline: "Module 3 — Manager-level leadership diagnostic",
    description:
      "Evaluate manager-level leadership across delegation, decision-making, coaching, communication and accountability. Includes strengths, gaps and a development roadmap.",
    category: "Leadership",
    price: 999,
    durationMin: 45,
    totalQuestions: 80,
    sections: [],
  },
  {
    id: "module-4",
    name: "Module 4 — Coming Soon",
    tagline: "Module 4 — New assessment coming soon",
    description:
      "A new assessment module — details coming soon. Preview available with the standard 80-question bank.",
    category: "Business",
    price: 999,
    durationMin: 40,
    badge: "Coming Soon",
    totalQuestions: 80,
    sections: [],
  },
  {
    id: "org-360",
    name: "360° Business Analysis",
    tagline: "Module 5 — Complete end-to-end business architecture",
    description:
      "A full 360° evaluation of your organization across Governance, People, Operations, Finance, Brand & Technology. Fill the questionnaire and receive a company-level report.",
    category: "Business",
    price: 9999,
    durationMin: 60,
    totalQuestions: 80,
    sections: [],
  },
];

// Back-compat helpers for sample/preview report pages.
export const getAssessment = (id: string): Assessment | undefined =>
  ASSESSMENTS.find((a) => a.id === id);

export const SAMPLE_FACT_SCORES = {
  overall: 72,
  governance: 78,
  people: 68,
  operations: 74,
  financial: 70,
  brand: 65,
  technology: 76,
};

export const SAMPLE_LEADERSHIP_SCORES = {
  overall: 3.8,
  vision: 4.2,
  execution: 3.6,
  people: 3.9,
  communication: 3.7,
  accountability: 3.6,
};

// Canonical module ordering (M1 → M5). Used to sort DB-driven catalog lists.
export const MODULE_ORDER = ["your-assessment-80", "disc", "leadership-manager", "module-4", "org-360"];
export const moduleRank = (slug?: string | null) => {
  const i = MODULE_ORDER.indexOf(slug ?? "");
  return i === -1 ? 999 : i;
};
export const byModuleOrder = (a: { slug?: string | null }, b: { slug?: string | null }) =>
  moduleRank(a.slug) - moduleRank(b.slug);
