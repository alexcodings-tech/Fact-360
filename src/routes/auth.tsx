import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/site/Logo";
import { ParticlesBg } from "@/components/site/ParticlesBg";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Sparkles, FileText } from "lucide-react";
import { SUPPORTED_LANGS, setLang } from "@/i18n";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Login / Sign Up — FACT 360°" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [signupLang, setSignupLang] = useState("en");

  async function routeAfterAuth(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (data ?? []).some((r: any) => r.role === "admin");
    const { data: prof } = await supabase.from("profiles").select("preferred_language").eq("id", userId).maybeSingle();
    if (prof?.preferred_language) setLang(prof.preferred_language);
    navigate({ to: isAdmin ? "/admin" : "/dashboard" });
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
      if (error) throw error;
      toast.success("Welcome back!");
      if (data.user) await routeAfterAuth(data.user.id);
    } catch (err: any) { toast.error(err.message ?? "Login failed"); } finally { setBusy(false); }
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: String(f.get("email")), password: String(f.get("password")),
        options: { data: { full_name: String(f.get("full_name")), company: String(f.get("company") ?? "") } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").update({
          title: String(f.get("title") ?? ""),
          phone: String(f.get("phone") ?? ""),
          company: String(f.get("company") ?? ""),
          preferred_language: signupLang,
        }).eq("id", data.user.id);
        setLang(signupLang);
      }
      toast.success("Account created!");
      if (data.user) await routeAfterAuth(data.user.id);
    } catch (err: any) { toast.error(err.message ?? "Signup failed"); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-12 overflow-hidden">
        <ParticlesBg color="rgba(212,175,55,0.55)" count={65} />
        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=60" alt="" className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <Link to="/" className="relative z-10"><Logo inverse /></Link>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight">Understand. Improve. Grow.</h1>
          <p className="mt-4 text-white/80 max-w-md">Discover your MBTI personality type with an AI report tailored to your designation.</p>
          <ul className="mt-8 space-y-3 max-w-md">
            {[{i:ShieldCheck,t:"80-item MBTI-style assessment"},{i:Sparkles,t:"AI report tailored to your role"},{i:FileText,t:"Available in 5 Indian languages"}].map((x)=>(
              <li key={x.t} className="flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-accent/25 text-accent"><x.i className="h-4 w-4" /></span>{x.t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 text-xs text-white/50">© 2026 FACT 360°</div>
      </div>

      <div className="flex items-center justify-center p-6 bg-gradient-to-b from-secondary/40 to-background relative">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=60" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.04]" />
        <div className="relative w-full max-w-md">
          <div className="lg:hidden mb-6"><Link to="/"><Logo /></Link></div>
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-6">
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={onLogin} className="grid gap-3 mt-4">
                  <div><label className="text-xs font-semibold">{t("auth.email")}</label><Input required name="email" type="email" placeholder="you@company.com" /></div>
                  <div><label className="text-xs font-semibold">{t("auth.password")}</label><Input required name="password" type="password" placeholder="••••••••" /></div>
                  <Button disabled={busy} className="bg-primary hover:bg-primary/90 mt-2">{busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}{t("auth.login")}</Button>
                </form>
                <p className="mt-3 text-[11px] text-muted-foreground text-center">Demo admin: <span className="font-mono text-primary">admin@gmail.com</span> / <span className="font-mono text-primary">admin12</span></p>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={onSignup} className="grid gap-3 mt-4">
                  <div><label className="text-xs font-semibold">{t("auth.full_name")}</label><Input required name="full_name" placeholder="Rajesh Kumar" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs font-semibold">{t("auth.designation")}</label><Input required name="title" placeholder="e.g. Founder" /></div>
                    <div><label className="text-xs font-semibold">{t("auth.company")}</label><Input name="company" placeholder="Your company" /></div>
                  </div>
                  <div><label className="text-xs font-semibold">{t("auth.phone")}</label><Input required name="phone" type="tel" placeholder="+91 90000 00000" /></div>
                  <div><label className="text-xs font-semibold">{t("auth.email")}</label><Input required name="email" type="email" /></div>
                  <div><label className="text-xs font-semibold">{t("auth.password")}</label><Input required name="password" type="password" minLength={6} /></div>
                  <div>
                    <label className="text-xs font-semibold">{t("auth.language")}</label>
                    <Select value={signupLang} onValueChange={setSignupLang}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SUPPORTED_LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">{busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}{t("auth.create_account")}</Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground text-center mt-4">By continuing you agree to our Terms & Privacy Policy.</p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground mt-4 inline-block">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
