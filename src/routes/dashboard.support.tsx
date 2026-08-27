import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/dashboard/support")({
  component: () => (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Support</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { i: Mail, t: "Email", d: "support@fact360.com" },
          { i: MessageCircle, t: "Chat", d: "Mon–Fri, 9am–6pm" },
          { i: LifeBuoy, t: "Help Center", d: "Browse guides & FAQs" },
        ].map((c) => (
          <Card key={c.t} className="border-border/60">
            <CardContent className="p-5">
              <c.i className="h-6 w-6 text-accent" />
              <div className="font-bold text-primary mt-2">{c.t}</div>
              <div className="text-sm text-muted-foreground">{c.d}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),
});
