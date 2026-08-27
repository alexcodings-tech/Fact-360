
-- Rename & reprice assessments to match the 5-module structure
UPDATE public.assessments SET name = '360° Business Analysis', tagline = 'Complete end-to-end business architecture (Module 5)', description = 'A full 360° evaluation of your organization across Governance, People, Operations, Finance, Brand & Technology.', category = 'Business', price = 9999, badge = 'Most Popular' WHERE slug = 'org-360';

UPDATE public.assessments SET name = 'Personality Analysis (Know Yourself)', tagline = 'Module 1 — Understand your personality in depth', description = 'An 80-question personal assessment covering behavior, motivation and work style.', category = 'Personality', price = 999, badge = NULL WHERE slug = 'your-assessment-80';

UPDATE public.assessments SET name = 'DISC Profiling', tagline = 'Module 2 — Dominance · Influence · Steadiness · Conscientiousness', description = 'The classic DISC behavioral profile to understand how you communicate, decide and collaborate.', category = 'Personality', price = 999, badge = NULL WHERE slug = 'disc';

UPDATE public.assessments SET name = 'Leadership Assessment (Know Your Managers)', tagline = 'Module 3 — Manager-level leadership diagnostic', description = 'Evaluate leadership across delegation, decision-making, coaching, communication and accountability.', category = 'Leadership', price = 999, badge = NULL WHERE slug = 'leadership-manager';

-- Repurpose hospital-360 as Module 4 placeholder (same 80-question bank)
UPDATE public.assessments SET slug = 'module-4', name = 'Module 4 — Coming Soon', tagline = 'Module 4 — New assessment coming soon', description = 'A new assessment module — details coming soon.', category = 'Business', price = 999, badge = 'Coming Soon' WHERE slug = 'hospital-360';
