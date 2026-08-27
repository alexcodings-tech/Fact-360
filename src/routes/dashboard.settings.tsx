import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/settings")({
  component: () => (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          {[
            { l: "Email notifications", d: "Receive updates about your assessments and reports." },
            { l: "Weekly digest", d: "Summary of your improvement progress." },
            { l: "Two-factor auth", d: "Extra security for your account." },
          ].map((x, i) => (
            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
              <div><div className="font-semibold text-sm">{x.l}</div><div className="text-xs text-muted-foreground">{x.d}</div></div>
              <Switch defaultChecked={i < 2} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  ),
});
