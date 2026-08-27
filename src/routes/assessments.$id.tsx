import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAssessmentBySlug, startAttempt } from "@/lib/assessments.functions";
import { mockRazorpayCheckout } from "@/lib/payments.functions";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, Clock, FileText, Layers, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { SUPPORTED_LANGS, setLang } from "@/i18n";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/assessments/$id")({
  head: () => ({ meta: [{ title: "Assessment — FACT 360°" }] }),
  component: Detail,
});

function Detail() {
  const { id: slug } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const get = useServerFn(getAssessmentBySlug);
  const pay = useServerFn(mockRazorpayCheckout);
  const start = useServerFn(startAttempt);
  const [busy, setBusy] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const { data: a, isLoading, error } = useQuery({
    queryKey: ["assessment", slug],
    queryFn: () => get({ data: { slug } }),
  });

  async function buyNow(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.info("Please sign in to continue.");
      navigate({ to: "/auth" });
      return;
    }
    const f = new FormData(e.currentTarget);
    const profile = {
      full_name: String(f.get("full_name") ?? ""),
      title: String(f.get("title") ?? ""),
      company: String(f.get("company") ?? ""),
      phone: String(f.get("phone") ?? ""),
      email: String(f.get("email") ?? ""),
      preferred_language: preferredLanguage,
    };
    setBusy(true);
    try {
      await pay({ data: { slug, profile } });
      setLang(preferredLanguage);
      toast.success("Payment successful (mock Razorpay). Starting assessment…");
      const { attemptId } = await start({ data: { slug } });
      navigate({ to: "/dashboard/take/$id", params: { id: attemptId } });
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <PublicLayout><div className="container-page py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div></PublicLayout>;
  if (error || !a) return <PublicLayout><div className="container-page py-20 text-center">
    <h1 className="text-2xl font-bold">Assessment not found</h1>
    <Link to="/assessments" className="text-accent mt-4 inline-block">← Back to Marketplace</Link>
  </div></PublicLayout>;

  const totalQuestions = a.sections.reduce((s: number, sec: any) => s + sec.questions.length, 0);

  return (
    <PublicLayout>
      <div className="container-page py-8">
        <Link to="/assessments" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Assessments
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{a.category}</Badge>
              {a.badge && <Badge className="bg-accent text-accent-foreground">{a.badge}</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{a.name}</h1>
            <p className="text-accent font-semibold mt-1">{a.tagline}</p>
            <p className="text-muted-foreground mt-4 leading-relaxed">{a.description}</p>

            <Card className="mt-6 border-border/60">
              <CardContent className="p-6">
                <h2 className="font-bold text-primary">What you'll get</h2>
                <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                  {["Detailed health scorecard","Category-wise performance","AI-powered insights & recommendations","Action plan with improvement roadmap","Professional PDF report","Landscape one-page executive summary"].map((b) => (
                    <li key={b} className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5" /><span>{b}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6 border-border/60">
              <CardContent className="p-6">
                <h2 className="font-bold text-primary mb-4">Assessment Sections</h2>
                <div className="space-y-3">
                  {a.sections.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-start gap-3 p-3 rounded-md bg-secondary/40">
                      <div className="h-7 w-7 rounded bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-primary">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.questions.length} questions • Weight {s.weight}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border/60 sticky top-20">
              <CardContent className="p-6">
                <form onSubmit={buyNow} className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">₹{Number(a.price).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">One-time payment • Lifetime access to report</p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {a.duration_min} minutes</div>
                    <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-accent" /> {a.sections.length} sections</div>
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /> {totalQuestions} questions</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Razorpay Checkout (mock)</div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/35 p-4 space-y-3">
                    <div className="font-bold text-primary text-sm">{t("assessment.purchaseProfile")}</div>
                    <div className="grid gap-2">
                      <div><Label className="text-xs">{t("auth.full_name")}</Label><Input required name="full_name" placeholder="Rajesh Kumar" /></div>
                      <div><Label className="text-xs">{t("auth.designation")}</Label><Input required name="title" placeholder="Founder" /></div>
                      <div><Label className="text-xs">{t("auth.company")}</Label><Input required name="company" placeholder="Company name" /></div>
                      <div><Label className="text-xs">{t("auth.phone")}</Label><Input required name="phone" type="tel" placeholder="+91 90000 00000" /></div>
                      <div><Label className="text-xs">{t("auth.email")}</Label><Input required name="email" type="email" placeholder="you@company.com" /></div>
                      <div>
                        <Label className="text-xs">{t("auth.language")}</Label>
                        <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{SUPPORTED_LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={busy} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 text-base font-semibold">
                    {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} {t("assessment.buyNow")}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Razorpay live integration is queued. Until then payment is mocked and you can start the assessment immediately.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
