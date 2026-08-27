import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { ParticlesBg } from "@/components/site/ParticlesBg";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — FACT 360°" }, { name: "description", content: "Get in touch with the FACT 360° team." }] }),
  component: Contact,
});

function Contact() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=70"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/60" />
        <ParticlesBg color="rgba(212, 175, 55, 0.6)" count={70} />
        <div className="container-page relative py-14 md:py-20 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-accent">{t("contact.eyebrow")}</div>
          <h1 className="mt-2 text-3xl md:text-5xl font-professional font-bold">{t("contact.title")}</h1>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <section className="container-page py-14 md:py-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8" data-aos="fade-right">
          <h2 className="text-xl font-bold text-primary">{t("contact.form_title")}</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); toast.success(t("contact.thanks")); (e.target as HTMLFormElement).reset(); }}
            className="grid gap-4 mt-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold">{t("auth.full_name")}</label><Input required placeholder="Your name" /></div>
              <div><label className="text-xs font-semibold">{t("auth.email")}</label><Input required type="email" placeholder="you@company.com" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold">{t("auth.company")}</label><Input placeholder="Your company" /></div>
              <div><label className="text-xs font-semibold">{t("auth.phone")}</label><Input placeholder="+91 ..." /></div>
            </div>
            <div><label className="text-xs font-semibold">{t("contact.subject")}</label><Input placeholder={t("contact.subjectPlaceholder")} /></div>
            <div><label className="text-xs font-semibold">{t("contact.message")}</label><Textarea rows={6} placeholder={t("contact.messagePlaceholder")} /></div>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">{t("contact.send")}</Button>
          </form>
        </div>

        <div className="grid gap-3" data-aos="fade-left">
            {[
             { icon: MapPin, t: t("contact.office"), d: "FACT 360°, Erode, Tamil Nadu, India" },
             { icon: Mail, t: t("auth.email"), d: "hello@fact360.com" },
             { icon: Phone, t: t("auth.phone"), d: "+91 98765 43210" },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-border p-4 flex items-start gap-3 bg-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                <c.icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold text-sm text-primary">{c.t}</div>
                <div className="text-sm text-muted-foreground">{c.d}</div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-border p-4 bg-secondary/50">
            <div className="font-semibold text-sm text-primary">{t("contact.officeHours")}</div>
            <div className="text-sm text-muted-foreground">{t("contact.officeHoursText")}</div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
