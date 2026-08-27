# FACT 360 — Organisational Assessment Platform

A phased build. Each phase is shippable on its own; we do them in order so nothing is half-wired.

## Phase 1 — You Assessment (80 questions, auto report)

- Single flow of 80 questions, 15 per page, sticky sidebar progress (already in place).
- On submit: score all answers, generate the report automatically from responses via AI, store it, redirect to the report page.
- Report shows metric scores, strengths, gaps, recommended actions.

## Phase 2 — FACT 360 organisational flow

Flow: Director -> Departments -> Staff -> Admin

1. After payment, director fills company details (industry, size, departments, current level, objectives).
2. Director sees an overview of the FACT 360 process and confirms to start.
3. Director-level question set opens.
4. Director answers determine which departments participate (HR, Finance, Operations, Marketing, IT, other).
5. System generates a shareable assessment link per department. Anyone from that department can complete it (link-based access, no account needed).
6. Each department has its own question set = Level 1.
7. As each department submits, its data appears in the admin panel.
8. Respondents can attach supporting documents/policies where a question requires it.

New data: organisations, org_members, departments, department_assessments (with access token), plus attachments.

## Phase 3 — Configurable question types

Admin can pick a type per question:
multiple choice, true/false, short text, number, image upload, audio upload, document/PDF upload.

Storage bucket for uploads, with responses storing either a score, a text/number value, or file references.

## Phase 4 — Admin panel + AI analysis

- Admin views: companies, directors, managers, employees, departments, assessors, responses, uploaded files, department-wise results.
- Company config: organisation type, industry, size, departments, current maturity level (1-5), business position, objectives — fed into the AI prompt.
- AI produces a draft: metric scores, department-wise performance, strengths, gaps, improvement areas, recommendations, priority actions.
- Review workflow: draft -> admin edits/adds -> approve -> final report visible to the client.

## Phase 5 — Landing/CTA + pricing + theme

- Landing CTAs route into: assessment details -> payment -> assessment.
- Pricing: Rs.999 modules, Rs.9,999 for FACT 360.
- Visual pass: black + yellow theme, minimal layouts, fewer icons, one primary action per screen.

## Phase 6 — Report output & delivery

- PDF export of the final report (landscape one-pager + full report).
- Share link for the client.
- PPT generation and WhatsApp delivery: needs an external service — we scope this after Phase 5.

## Technical notes

- New tables: `organisations`, `departments`, `org_members`, `department_assessments`, `attachments`, `report_drafts`; `questions` gains `type` and `config`; `responses` gains `value_text`, `value_number`, `attachment_ids`.
- Department links use a signed token route (public, token-gated) so staff without accounts can respond.
- AI analysis runs server-side through the Lovable AI gateway; drafts are stored and versioned so admin edits don't overwrite the AI output.
- Uploads go to a private storage bucket; admin and the owning organisation can read them.

## Suggested start

Phase 1 and 2 together, since Phase 2 is the core of the product and Phase 1 is mostly finishing what exists.
