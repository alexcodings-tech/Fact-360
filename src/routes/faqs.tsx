import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faqs")({
  head: () => ({ meta: [{ title: "FAQs — FACT 360°" }] }),
  component: FAQs,
});

const faqs = [
  { q: "How long does an assessment take?", a: "Most assessments take 40–60 minutes. You can save your progress and resume later." },
  { q: "Who answers the questions?", a: "Depending on the assessment, the CEO, managers, and/or department heads. You can invite team members from the dashboard." },
  { q: "How is scoring done?", a: "Each question has a weight. The formula engine computes section, category and overall scores. AI then interprets the results." },
  { q: "Can I get a PDF report?", a: "Yes — every report includes a downloadable landscape one-pager and a detailed multi-page PDF." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. Reports are scoped to your account only." },
  { q: "Do you offer consultant plans?", a: "Yes. White-label reports and unlimited assessments are available on the Consultant plan." },
];

function FAQs() {
  return (
    <PublicLayout>
      <section className="container-page py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  );
}
