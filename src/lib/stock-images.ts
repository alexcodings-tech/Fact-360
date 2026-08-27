// Curated Unsplash photo URLs (real photographs, not AI generated).
// Centralized so every page uses the same imagery.

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const stockImages = {
  heroBusiness: u("photo-1521737604893-d14cc237f11d", 1600),
  aboutHero: u("photo-1552664730-d307ca884978", 1600),
  ctaAnalytics: u("photo-1551288049-bebda4e38f71", 1400),
  journeyCollab: u("photo-1543269865-cbf427effbad", 1400),

  catBusiness: u("photo-1517245386807-bb43f82c33c4"),
  catLeadership: u("photo-1573497019940-1c28c88b4f3e"),
  catHr: u("photo-1573496359142-b8d87734a5a2"),
  catFinance: u("photo-1554224155-6726b3ff858f"),
  catSales: u("photo-1556742049-0cfed4f6a45d"),
  catOperations: u("photo-1553413077-190dd305871c"),

  // Per-assessment covers (matched to slug in src/data/assessments.ts + DB)
  assessmentImages: {
    "org-360": u("photo-1521737604893-d14cc237f11d", 1400), // Module 5 — 360° business analysis
    "your-assessment-80": u("photo-1499750310107-5fef28a66643", 1400), // Module 1 — personality
    "disc": u("photo-1454165804606-c3d57bc86b40", 1400), // Module 2 — DISC quadrants
    "leadership-manager": u("photo-1552581234-26160f608093", 1400), // Module 3 — leadership
    "module-4": u("photo-1553877522-43269d4ea984", 1400), // Module 4 — coming soon
  } as Record<string, string>,

  testiAanya: u("photo-1544005313-94ddf0286df2", 400),
  testiRahul: u("photo-1507003211169-0a1dd7228f2d", 400),
  testiPriya: u("photo-1580489944761-15a19d654956", 400),
  testiVivek: u("photo-1519085360753-af0119f7cbe7", 400),
  testiAishwarya: u("photo-1487412720507-e7ab37603c6f", 400),
  testiSneha: u("photo-1573496359142-b8d87734a5a2", 400),
};

export const assessmentImage = (slug?: string | null) =>
  (slug && stockImages.assessmentImages[slug]) || stockImages.catBusiness;
