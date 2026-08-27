import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useTranslation } from "react-i18next";
import { Layers, Sparkles, FileText, ListChecks } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Layers, title: "6 Architecture Pillars", desc: "Structured 360° view of your business" },
  { icon: Sparkles, title: "AI Executive Summary", desc: "Board-ready narrative in plain English" },
  { icon: FileText, title: "Landscape One-Pager", desc: "Everything on a single shareable page" },
  { icon: ListChecks, title: "Action Plan & Roadmap", desc: "Prioritized steps ranked by impact" },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
     

      <div className="container-page py-14 md:py-16 grid gap-10 md:grid-cols-4">
        <div>
          <Logo inverse size="lg" variant="legacy" />
          <p className="mt-4 text-base text-white/80 max-w-xs leading-relaxed">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">{t("footer.product")}</h4>
          <ul className="space-y-3 text-base text-white/80">
            <li><Link to="/assessments" className="hover:text-accent">{t("nav.assessments")}</Link></li>
            <li><Link to="/sample-reports" className="hover:text-accent">{t("nav.sampleReports")}</Link></li>
            <li><Link to="/pricing" className="hover:text-accent">{t("nav.pricing")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">{t("footer.company")}</h4>
          <ul className="space-y-3 text-base text-white/80">
            <li><Link to="/about" className="hover:text-accent">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:text-accent">{t("nav.contact")}</Link></li>
            <li><Link to="/faqs" className="hover:text-accent">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-lg">{t("footer.getInTouch")}</h4>
          <p className="text-base text-white/80 leading-relaxed">FACT 360° Erode<br />Tamil Nadu, India</p>
          <p className="text-base text-white/80 mt-3">hello@fact360.com</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/60">
        © 2026 FACT 360°. All rights reserved.
      </div>
    </footer>
  );
}

