
-- 1) Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

-- 2) Extend questions with MBTI dimension pole
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS dimension text;

-- 3) Extend reports with MBTI-specific fields
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS type_code text,
  ADD COLUMN IF NOT EXISTS dimension_scores jsonb;

-- 4) Deactivate existing assessments so marketplace shows only MBTI
UPDATE public.assessments SET is_active = false;

-- 5) Seed FACT 360° MBTI (idempotent via slug)
DO $$
DECLARE
  aid uuid;
  sec_a uuid; sec_b uuid; sec_c uuid; sec_d uuid;
  opts jsonb := '[
    {"label":"Strongly Disagree","score":1},
    {"label":"Disagree","score":2},
    {"label":"Not Sure","score":3},
    {"label":"Agree","score":4},
    {"label":"Strongly Agree","score":5}
  ]'::jsonb;
BEGIN
  -- Upsert assessment
  INSERT INTO public.assessments (slug, name, tagline, description, category, price, duration_min, badge, is_active)
  VALUES (
    'fact360-mbti',
    'FACT 360° Personality Assessment',
    'Discover your 4-letter personality type across 4 pillars',
    '80-item MBTI-style assessment that maps your Energy, Information, Decision-making, and Lifestyle preferences into a personalised type code with an AI-generated report tailored to your role.',
    'Personality',
    999,
    20,
    'Most Popular',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_min = EXCLUDED.duration_min,
    badge = EXCLUDED.badge,
    is_active = true
  RETURNING id INTO aid;

  -- Clean prior sections/questions for this assessment
  DELETE FROM public.questions WHERE section_id IN (SELECT id FROM public.sections WHERE assessment_id = aid);
  DELETE FROM public.sections WHERE assessment_id = aid;

  -- Sections
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES
    (aid, 'ei', 'Energy & Interaction (E/I)', 25, 1) RETURNING id INTO sec_a;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES
    (aid, 'sn', 'Information & Learning (S/N)', 25, 2) RETURNING id INTO sec_b;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES
    (aid, 'tf', 'Decision Making (T/F)', 25, 3) RETURNING id INTO sec_c;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES
    (aid, 'jp', 'Lifestyle & Planning (J/P)', 25, 4) RETURNING id INTO sec_d;

  -- Section A: E (1-10) / I (11-20)
  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_a, 'I enjoy meeting new people.', opts, 1, 'E'),
    (sec_a, 'I like talking with different people.', opts, 2, 'E'),
    (sec_a, 'I feel energetic after social events.', opts, 3, 'E'),
    (sec_a, 'I usually start conversations.', opts, 4, 'E'),
    (sec_a, 'I enjoy working in teams.', opts, 5, 'E'),
    (sec_a, 'I speak my ideas openly.', opts, 6, 'E'),
    (sec_a, 'I enjoy busy environments.', opts, 7, 'E'),
    (sec_a, 'I make friends easily.', opts, 8, 'E'),
    (sec_a, 'I enjoy networking.', opts, 9, 'E'),
    (sec_a, 'I like group activities.', opts, 10, 'E'),
    (sec_a, 'I enjoy spending time alone.', opts, 11, 'I'),
    (sec_a, 'I think before I speak.', opts, 12, 'I'),
    (sec_a, 'I like quiet places.', opts, 13, 'I'),
    (sec_a, 'I keep many thoughts to myself.', opts, 14, 'I'),
    (sec_a, 'Too much social activity tires me.', opts, 15, 'I'),
    (sec_a, 'I prefer a few close friends.', opts, 16, 'I'),
    (sec_a, 'I enjoy working alone.', opts, 17, 'I'),
    (sec_a, 'I need quiet time to recharge.', opts, 18, 'I'),
    (sec_a, 'I observe more than I talk.', opts, 19, 'I'),
    (sec_a, 'I enjoy reading or reflecting alone.', opts, 20, 'I');

  -- Section B: S (21-30) / N (31-40)
  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_b, 'I notice small details.', opts, 1, 'S'),
    (sec_b, 'I trust facts.', opts, 2, 'S'),
    (sec_b, 'I learn best through experience.', opts, 3, 'S'),
    (sec_b, 'I like clear instructions.', opts, 4, 'S'),
    (sec_b, 'I prefer practical ideas.', opts, 5, 'S'),
    (sec_b, 'I rely on proven methods.', opts, 6, 'S'),
    (sec_b, 'I notice changes quickly.', opts, 7, 'S'),
    (sec_b, 'I enjoy solving real problems.', opts, 8, 'S'),
    (sec_b, 'I remember facts easily.', opts, 9, 'S'),
    (sec_b, 'I focus on what is happening now.', opts, 10, 'S'),
    (sec_b, 'I enjoy imagining possibilities.', opts, 11, 'N'),
    (sec_b, 'I think about the future.', opts, 12, 'N'),
    (sec_b, 'I enjoy creative ideas.', opts, 13, 'N'),
    (sec_b, 'I like trying new methods.', opts, 14, 'N'),
    (sec_b, 'I enjoy learning theories.', opts, 15, 'N'),
    (sec_b, 'I see the big picture.', opts, 16, 'N'),
    (sec_b, 'I enjoy brainstorming.', opts, 17, 'N'),
    (sec_b, 'I often ask ''What if?''', opts, 18, 'N'),
    (sec_b, 'I connect ideas easily.', opts, 19, 'N'),
    (sec_b, 'I enjoy innovation.', opts, 20, 'N');

  -- Section C: T (41-50) / F (51-60)
  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_c, 'I make decisions using facts.', opts, 1, 'T'),
    (sec_c, 'I stay calm under pressure.', opts, 2, 'T'),
    (sec_c, 'I solve problems logically.', opts, 3, 'T'),
    (sec_c, 'I value fairness.', opts, 4, 'T'),
    (sec_c, 'I give honest feedback.', opts, 5, 'T'),
    (sec_c, 'I enjoy analyzing situations.', opts, 6, 'T'),
    (sec_c, 'I like objective discussions.', opts, 7, 'T'),
    (sec_c, 'I separate emotions from decisions.', opts, 8, 'T'),
    (sec_c, 'I challenge weak ideas.', opts, 9, 'T'),
    (sec_c, 'I focus on results.', opts, 10, 'T'),
    (sec_c, 'I think about people''s feelings.', opts, 11, 'F'),
    (sec_c, 'I value harmony.', opts, 12, 'F'),
    (sec_c, 'I enjoy helping others.', opts, 13, 'F'),
    (sec_c, 'I avoid hurting others.', opts, 14, 'F'),
    (sec_c, 'I consider personal values.', opts, 15, 'F'),
    (sec_c, 'I forgive easily.', opts, 16, 'F'),
    (sec_c, 'I encourage people.', opts, 17, 'F'),
    (sec_c, 'Others seek my support.', opts, 18, 'F'),
    (sec_c, 'Relationships matter to me.', opts, 19, 'F'),
    (sec_c, 'I enjoy making people feel included.', opts, 20, 'F');

  -- Section D: J (61-70) / P (71-80)
  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_d, 'I plan my day.', opts, 1, 'J'),
    (sec_d, 'I finish work before relaxing.', opts, 2, 'J'),
    (sec_d, 'I keep things organized.', opts, 3, 'J'),
    (sec_d, 'I meet deadlines.', opts, 4, 'J'),
    (sec_d, 'I like knowing the plan.', opts, 5, 'J'),
    (sec_d, 'I enjoy checklists.', opts, 6, 'J'),
    (sec_d, 'I make decisions quickly.', opts, 7, 'J'),
    (sec_d, 'I like routines.', opts, 8, 'J'),
    (sec_d, 'I prepare in advance.', opts, 9, 'J'),
    (sec_d, 'I dislike unfinished work.', opts, 10, 'J'),
    (sec_d, 'I enjoy flexibility.', opts, 11, 'P'),
    (sec_d, 'I change plans easily.', opts, 12, 'P'),
    (sec_d, 'I like exploring options.', opts, 13, 'P'),
    (sec_d, 'I work without fixed plans.', opts, 14, 'P'),
    (sec_d, 'I enjoy surprises.', opts, 15, 'P'),
    (sec_d, 'I keep options open.', opts, 16, 'P'),
    (sec_d, 'I decide at the last minute.', opts, 17, 'P'),
    (sec_d, 'I adapt quickly.', opts, 18, 'P'),
    (sec_d, 'I enjoy spontaneous activities.', opts, 19, 'P'),
    (sec_d, 'I like variety in my work.', opts, 20, 'P');
END $$;
