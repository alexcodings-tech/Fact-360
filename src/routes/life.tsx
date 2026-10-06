import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { startAttempt } from "@/lib/assessments.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/life")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Start L.I.F.E.™ Assessment — FACT 360°" },
      { name: "description", content: "Enter your details and start the L.I.F.E.™ assessment instantly." },
      { property: "og:title", content: "Start L.I.F.E.™ Assessment — FACT 360°" },
      { property: "og:description", content: "Lens for Individual Focus & Effectiveness — start in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LifeStart,
});

const INDUSTRIES = ["IT / Software", "Manufacturing", "Retail", "Healthcare", "Education", "Finance / Banking", "Real Estate", "Hospitality", "Logistics", "Consulting", "Government", "Other"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(120),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  email: z.string().trim().email("Enter a valid email").max(180),
  industry: z.string().trim().min(2, "Enter your industry").max(120),
  title: z.string().trim().min(2, "Enter your designation").max(120),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function LifeStart() {
  const navigate = useNavigate();
  const start = useServerFn(startAttempt);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const v = parsed.data;
    setBusy(true);
    try {
      // Returning users: sign in. New users: create the account (no email confirmation).
      let userId: string | undefined;
      const signIn = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      if (signIn.data.user) userId = signIn.data.user.id;
      else {
        const up = await supabase.auth.signUp({
          email: v.email, password: v.password,
          options: { data: { full_name: v.full_name, company: "" } },
        });
        if (up.error) {
          throw new Error(/already/i.test(up.error.message)
            ? "This email is already registered. Please enter the password you used before."
            : up.error.message);
        }
        if (!up.data.session) throw new Error("Could not start your session. Please try again.");
        userId = up.data.user?.id;
      }
      if (!userId) throw new Error("Could not sign you in.");
      await supabase.from("profiles").update({
        full_name: v.full_name, phone: v.phone, email: v.email, industry: v.industry, title: v.title,
      }).eq("id", userId);
      const { attemptId } = await start({ data: { slug: "your-assessment-80" } });
      navigate({ to: "/dashboard/take/$id", params: { id: attemptId } });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card shadow-xl p-6">
          <h1 className="text-2xl font-bold text-primary">L.I.F.E.™ Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1">Lens for Individual Focus &amp; Effectiveness. Tell us a little about you to begin.</p>
          <form onSubmit={onSubmit} className="grid gap-3 mt-5">
            <div><label className="text-xs font-semibold">Full name</label><Input required name="full_name" placeholder="Rajesh Kumar" /></div>
            <div><label className="text-xs font-semibold">Phone number</label><Input required name="phone" type="tel" placeholder="+91 90000 00000" /></div>
            <div><label className="text-xs font-semibold">Email</label><Input required name="email" type="email" placeholder="you@company.com" /></div>
            <div>
              <label className="text-xs font-semibold">Industry</label>
              <Input required name="industry" list="life-industries" placeholder="Type or pick" />
              <datalist id="life-industries">{INDUSTRIES.map((i) => <option key={i} value={i} />)}</datalist>
            </div>
            <div><label className="text-xs font-semibold">Designation</label><Input required name="title" placeholder="e.g. Sales Manager" /></div>
            <div>
              <label className="text-xs font-semibold">Create a password</label>
              <Input required name="password" type="password" minLength={6} placeholder="At least 6 characters" />
              <p className="text-[11px] text-muted-foreground mt-1">Use it with your email to see your report again later.</p>
            </div>
            <Button disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2 h-11 font-semibold">
              {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Start Assessment
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
