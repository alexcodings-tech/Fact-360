import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const FACT360_WHATSAPP = "917603838929";

const MODULE_PITCH = `Hi FACT 360° team, I'd like details about your other assessment modules.

Please send me the description and benefits of:
• M1 – Personality Analysis (Know Yourself) – ₹999
• M2 – DISC Profiling – ₹999
• M3 – Leadership Assessment (Know Your Managers) – ₹999
• M4 – Team & Culture Assessment – ₹999
• M5 – 360° Business Analysis (complete end-to-end) – ₹9,999
• Combo of M1–M4 – ₹2,999

Thank you!`;

export function whatsappModulesLink(message: string = MODULE_PITCH) {
  return `https://wa.me/${FACT360_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppModules({ className = "" }: { className?: string }) {
  return (
    <div className={`no-print rounded-xl border border-border bg-card p-5 text-left ${className}`}>
      <h3 className="font-bold text-primary">Want the other modules?</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Message us on WhatsApp and we'll send the description and benefits of every FACT 360° module
        straight to your chat — no email needed.
      </p>
      <Button asChild className="mt-4 bg-success text-success-foreground hover:bg-success/90">
        <a href={whatsappModulesLink()} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 mr-1" /> Send on WhatsApp
        </a>
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">+91 76038 38929</p>
    </div>
  );
}
