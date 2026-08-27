import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  ssr: false,
  component: Profile,
});

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ full_name: "", title: "", company: "", phone: "", email: "" });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      setEmail(u.user.email ?? "");
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, title, company, phone, email")
        .eq("id", u.user.id)
        .maybeSingle();
      setForm({
        full_name: p?.full_name ?? "",
        title: p?.title ?? "",
        company: p?.company ?? "",
        phone: p?.phone ?? "",
        email: p?.email ?? u.user.email ?? "",
      });
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update(form).eq("id", u.user.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const initials = (form.full_name || email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Profile</h1>
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-accent text-accent-foreground">
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm text-muted-foreground">{email}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Full Name</label>
                  <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Designation</label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Company</label>
                  <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Phone <span className="text-destructive">*</span></label>
                  <Input value={form.phone} placeholder="+91 98765 43210" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Contact Email <span className="text-destructive">*</span></label>
                  <Input value={form.email} placeholder="you@company.com" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your phone number and email are required before starting an assessment — we use them to share your
                report and for follow-up support.
              </p>
              <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
