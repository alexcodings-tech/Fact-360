import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function PublicNav() {
  const { t } = useTranslation();
  const links: { to: string; label: string }[] = [
    { to: "/", label: t("nav.home") },
    { to: "/assessments", label: t("nav.assessments") },
    { to: "/sample-reports", label: t("nav.sampleReports") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-3">
        <Link to="/"><Logo size="lg" /></Link>
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to as any}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors [&.active]:text-primary"
              activeOptions={{ exact: l.to === "/" }}>{l.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <Link to="/auth"><Button variant="ghost" size="sm">{t("nav.login")}</Button></Link>
          <Link to="/auth"><Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">{t("nav.signup")}</Button></Link>
        </div>
        <Sheet>
          <SheetTrigger className="md:hidden p-2"><Menu className="h-5 w-5" /></SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to as any} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">{l.label}</Link>
              ))}
              <div className="mt-3 px-3"><LanguageSwitcher /></div>
              <Link to="/auth" className="mt-4"><Button className="w-full" variant="outline">{t("nav.login")}</Button></Link>
              <Link to="/auth"><Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{t("nav.signup")}</Button></Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
