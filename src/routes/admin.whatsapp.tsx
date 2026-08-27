import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListContacts } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Copy, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FACT360_WHATSAPP } from "@/components/site/WhatsAppModules";

export const Route = createFileRoute("/admin/whatsapp")({
  ssr: false,
  head: () => ({ meta: [{ title: "WhatsApp Clients — FACT 360° Admin" }] }),
  component: AdminWhatsApp,
});

const DEFAULT_MESSAGE = `Hello {name}, this is FACT 360°.

Here are our assessment modules — description and benefits:

• M1 – Personality Analysis (Know Yourself) – ₹999
  Understand your natural style, strengths and blind spots.
• M2 – DISC Profiling – ₹999
  Know how you communicate, decide and handle pressure.
• M3 – Leadership Assessment (Know Your Managers) – ₹999
  Measure managerial capability and readiness to lead.
• M4 – Team & Culture Assessment – ₹999
  See how your team collaborates and where friction sits.
• M5 – 360° Business Analysis (end-to-end) – ₹9,999
  Full organisational diagnostic with AI report and action plan.
• Combo M1–M4 – ₹2,999

Reply here and we'll help you get started.
— FACT 360° | +91 76038 38929`;

function normalisePhone(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

function AdminWhatsApp() {
  const listFn = useServerFn(adminListContacts);
  const { data: contacts = [], isLoading } = useQuery({ queryKey: ["admin-contacts"], queryFn: () => listFn() });

  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (contacts as any[]).filter((c) => !!normalisePhone(c.phone));
    if (!q) return list;
    return list.filter((c) => `${c.email} ${c.full_name} ${c.company} ${c.phone}`.toLowerCase().includes(q));
  }, [contacts, search]);

  const missing = (contacts as any[]).filter((c) => !normalisePhone(c.phone)).length;

  function buildText(c: any) {
    return message.replaceAll("{name}", c.full_name || "there");
  }

  function openChat(c: any) {
    const phone = normalisePhone(c.phone);
    if (!phone) return toast.error("This client has no phone number saved");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildText(c))}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-accent" /> WhatsApp Clients
        </h1>
        <p className="text-sm text-muted-foreground">
          Send module descriptions and benefits straight to a client's WhatsApp. Sender number: +91 76038 38929.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 border-border/60">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold">Message template</label>
              <p className="text-xs text-muted-foreground mb-1">
                Use <code>{"{name}"}</code> to insert the client's name automatically.
              </p>
              <Textarea rows={18} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  toast.success("Message copied");
                }}
              >
                <Copy className="h-4 w-4 mr-1" /> Copy message
              </Button>
              <Button asChild className="bg-success text-success-foreground hover:bg-success/90">
                <a
                  href={`https://wa.me/${FACT360_WHATSAPP}?text=${encodeURIComponent(message.replaceAll("{name}", "there"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="h-4 w-4 mr-1" /> Test on sender number
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-primary">Clients</h2>
              <Badge variant="secondary">{filtered.length} with phone</Badge>
            </div>
            <Input
              className="mt-3"
              placeholder="Search name, phone or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {missing > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {missing} client{missing === 1 ? "" : "s"} have no phone number saved in their profile.
              </p>
            )}
            <div className="mt-3 max-h-[460px] overflow-y-auto divide-y divide-border">
              {isLoading && (
                <div className="py-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </div>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="py-6 text-sm text-muted-foreground text-center">No clients with a phone number.</div>
              )}
              {filtered.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-primary truncate">{c.full_name || c.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.phone}</div>
                  </div>
                  <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => openChat(c)}>
                    <MessageCircle className="h-4 w-4 mr-1" /> Send
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
