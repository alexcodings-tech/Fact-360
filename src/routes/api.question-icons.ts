import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText } from "ai";

// Allowlist of lucide-react icons we can render on the take page.
const ALLOWED_ICONS = [
  "Target", "TrendingUp", "Users", "Handshake", "Briefcase", "DollarSign",
  "BarChart3", "PieChart", "LineChart", "ClipboardList", "CheckCircle2",
  "MessageSquare", "Lightbulb", "Compass", "Rocket", "Shield", "Award",
  "Heart", "Brain", "Building2", "Settings", "Zap", "Clock", "Calendar",
  "Book", "Search", "Flag", "Star", "Gauge", "GitBranch", "Layers",
  "Network", "Scale", "Sparkles", "Wrench", "Eye", "MapPin", "Filter",
  "Megaphone", "Puzzle",
] as const;

export const Route = createFileRoute("/api/question-icons")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          items: { id: string; text: string }[];
        };
        const items = (body.items ?? []).slice(0, 30);
        if (items.length === 0) return Response.json({ icons: [] });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const list = items.map((q, i) => `${i + 1}. ${q.text.replace(/\s+/g, " ").slice(0, 200)}`).join("\n");

        const prompt = `You will receive a numbered list of assessment questions.
For each, pick ONE icon name that best symbolizes the question topic.
You MUST pick from this allowlist exactly (case-sensitive):
${ALLOWED_ICONS.join(", ")}

Reply with ONLY a JSON array of objects with shape {"n": <number>, "icon": "<IconName>"} — no prose, no markdown, no code fences.

Questions:
${list}`;

        let icons: { id: string; icon: string }[] = [];
        try {
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            prompt,
          });
          const jsonStr = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          const parsed = JSON.parse(jsonStr) as { n: number; icon: string }[];
          const allowed = new Set<string>(ALLOWED_ICONS);
          icons = parsed
            .map((p) => {
              const item = items[p.n - 1];
              if (!item) return null;
              const icon = allowed.has(p.icon) ? p.icon : "Sparkles";
              return { id: item.id, icon };
            })
            .filter(Boolean) as { id: string; icon: string }[];
        } catch (e) {
          icons = items.map((it) => ({ id: it.id, icon: "Sparkles" }));
        }

        // Cache in DB (best-effort)
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await Promise.all(
            icons.map((row) =>
              supabaseAdmin.from("questions").update({ icon: row.icon }).eq("id", row.id),
            ),
          );
        } catch {
          // ignore cache failures
        }

        return Response.json({ icons });
      },
    },
  },
});
