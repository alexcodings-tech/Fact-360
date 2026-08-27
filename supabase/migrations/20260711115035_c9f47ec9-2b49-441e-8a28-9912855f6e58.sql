
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
  INSERT INTO public.assessments (slug, name, tagline, description, category, price, duration_min, badge, is_active)
  VALUES ('fact360-mbti','FACT 360° Personality Assessment',
    'Discover your 4-letter personality type across 4 pillars',
    '80-item assessment mapping Energy, Information, Decision-making and Lifestyle preferences into a tailored AI report.',
    'Personality', 999, 20, 'Most Popular', true)
  ON CONFLICT (slug) DO UPDATE SET is_active = true
  RETURNING id INTO aid;

  DELETE FROM public.questions WHERE section_id IN (SELECT id FROM public.sections WHERE assessment_id = aid);
  DELETE FROM public.sections WHERE assessment_id = aid;

  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES (aid,'ei','Energy & Interaction (E/I)',25,1) RETURNING id INTO sec_a;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES (aid,'sn','Information & Learning (S/N)',25,2) RETURNING id INTO sec_b;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES (aid,'tf','Decision Making (T/F)',25,3) RETURNING id INTO sec_c;
  INSERT INTO public.sections (assessment_id, slug, name, weight, order_index) VALUES (aid,'jp','Lifestyle & Planning (J/P)',25,4) RETURNING id INTO sec_d;

  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_a,'I enjoy meeting new people.',opts,1,'E'),(sec_a,'I like talking with different people.',opts,2,'E'),
    (sec_a,'I feel energetic after social events.',opts,3,'E'),(sec_a,'I usually start conversations.',opts,4,'E'),
    (sec_a,'I enjoy working in teams.',opts,5,'E'),(sec_a,'I speak my ideas openly.',opts,6,'E'),
    (sec_a,'I enjoy busy environments.',opts,7,'E'),(sec_a,'I make friends easily.',opts,8,'E'),
    (sec_a,'I enjoy networking.',opts,9,'E'),(sec_a,'I like group activities.',opts,10,'E'),
    (sec_a,'I enjoy spending time alone.',opts,11,'I'),(sec_a,'I think before I speak.',opts,12,'I'),
    (sec_a,'I like quiet places.',opts,13,'I'),(sec_a,'I keep many thoughts to myself.',opts,14,'I'),
    (sec_a,'Too much social activity tires me.',opts,15,'I'),(sec_a,'I prefer a few close friends.',opts,16,'I'),
    (sec_a,'I enjoy working alone.',opts,17,'I'),(sec_a,'I need quiet time to recharge.',opts,18,'I'),
    (sec_a,'I observe more than I talk.',opts,19,'I'),(sec_a,'I enjoy reading or reflecting alone.',opts,20,'I');

  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_b,'I notice small details.',opts,1,'S'),(sec_b,'I trust facts.',opts,2,'S'),
    (sec_b,'I learn best through experience.',opts,3,'S'),(sec_b,'I like clear instructions.',opts,4,'S'),
    (sec_b,'I prefer practical ideas.',opts,5,'S'),(sec_b,'I rely on proven methods.',opts,6,'S'),
    (sec_b,'I notice changes quickly.',opts,7,'S'),(sec_b,'I enjoy solving real problems.',opts,8,'S'),
    (sec_b,'I remember facts easily.',opts,9,'S'),(sec_b,'I focus on what is happening now.',opts,10,'S'),
    (sec_b,'I enjoy imagining possibilities.',opts,11,'N'),(sec_b,'I think about the future.',opts,12,'N'),
    (sec_b,'I enjoy creative ideas.',opts,13,'N'),(sec_b,'I like trying new methods.',opts,14,'N'),
    (sec_b,'I enjoy learning theories.',opts,15,'N'),(sec_b,'I see the big picture.',opts,16,'N'),
    (sec_b,'I enjoy brainstorming.',opts,17,'N'),(sec_b,'I often ask ''What if?''',opts,18,'N'),
    (sec_b,'I connect ideas easily.',opts,19,'N'),(sec_b,'I enjoy innovation.',opts,20,'N');

  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_c,'I make decisions using logic.',opts,1,'T'),(sec_c,'I value fairness.',opts,2,'T'),
    (sec_c,'I focus on results.',opts,3,'T'),(sec_c,'I prefer honest feedback.',opts,4,'T'),
    (sec_c,'I analyze problems objectively.',opts,5,'T'),(sec_c,'I follow rules.',opts,6,'T'),
    (sec_c,'I make hard decisions when needed.',opts,7,'T'),(sec_c,'I evaluate ideas critically.',opts,8,'T'),
    (sec_c,'I prefer facts over emotions.',opts,9,'T'),(sec_c,'I like clear systems.',opts,10,'T'),
    (sec_c,'I care about others'' feelings.',opts,11,'F'),(sec_c,'I make decisions that consider people.',opts,12,'F'),
    (sec_c,'I value harmony.',opts,13,'F'),(sec_c,'I listen with empathy.',opts,14,'F'),
    (sec_c,'I help others feel supported.',opts,15,'F'),(sec_c,'I try to understand emotions.',opts,16,'F'),
    (sec_c,'I dislike conflict.',opts,17,'F'),(sec_c,'I express appreciation often.',opts,18,'F'),
    (sec_c,'I focus on relationships.',opts,19,'F'),(sec_c,'I offer kind feedback.',opts,20,'F');

  INSERT INTO public.questions (section_id, text, options, order_index, dimension) VALUES
    (sec_d,'I like planning ahead.',opts,1,'J'),(sec_d,'I prefer schedules.',opts,2,'J'),
    (sec_d,'I finish tasks on time.',opts,3,'J'),(sec_d,'I like clear goals.',opts,4,'J'),
    (sec_d,'I organize my day.',opts,5,'J'),(sec_d,'I prefer decisions over open options.',opts,6,'J'),
    (sec_d,'I feel calm when things are structured.',opts,7,'J'),(sec_d,'I follow through on commitments.',opts,8,'J'),
    (sec_d,'I like routines.',opts,9,'J'),(sec_d,'I prepare in advance.',opts,10,'J'),
    (sec_d,'I enjoy flexibility.',opts,11,'P'),(sec_d,'I adapt easily.',opts,12,'P'),
    (sec_d,'I like exploring options.',opts,13,'P'),(sec_d,'I don''t mind last-minute changes.',opts,14,'P'),
    (sec_d,'I enjoy trying new things.',opts,15,'P'),(sec_d,'I like open-ended tasks.',opts,16,'P'),
    (sec_d,'I prefer freedom over structure.',opts,17,'P'),(sec_d,'I make quick shifts.',opts,18,'P'),
    (sec_d,'I enjoy spontaneous activities.',opts,19,'P'),(sec_d,'I like variety in my work.',opts,20,'P');
END $$;

-- Now seed 5 new assessment cards, each with its own copy of the 80 questions
DO $$
DECLARE
  src_id uuid; new_id uuid; new_sec_id uuid;
  sec record; spec record;
BEGIN
  SELECT id INTO src_id FROM public.assessments WHERE slug = 'fact360-mbti';
  IF src_id IS NULL THEN RETURN; END IF;

  FOR spec IN
    SELECT * FROM (VALUES
      ('org-360','Organizational Assessment','Complete end-to-end organizational diagnostic',
       'A full 80-question diagnostic covering leadership, people, operations and culture. Delivers a company-level report with prioritised actions.',
       'Business',999::numeric,60,NULL::text),
      ('hospital-360','Hospital / Healthcare 360°','Assessment tailored for hospitals and clinics',
       'Industry-specific 80-question assessment for hospitals and healthcare organizations. Report highlights patient experience, clinical operations and staff wellbeing.',
       'Business',999::numeric,60,'Industry'),
      ('your-assessment-80','Your Assessment (80 Q)','Personal 80-question professional profile',
       '80 questions across four pillars, mapped to your role for a tailored AI report and action plan.',
       'Personality',999::numeric,20,NULL),
      ('leadership-manager','Leadership Assessment — Manager Level','Middle-manager leadership diagnostic',
       'Focused 80-question leadership assessment for team leads and managers, with AI-generated coaching plan.',
       'Leadership',999::numeric,30,NULL),
      ('disc','DISC Assessment','Behavioural style profile (D / I / S / C)',
       'Classic DISC behavioural assessment mapped to your work style, communication preferences and team fit.',
       'Personality',999::numeric,20,'Popular')
    ) AS t(slug,name,tagline,description,category,price,duration_min,badge)
  LOOP
    INSERT INTO public.assessments (slug,name,tagline,description,category,price,duration_min,badge,is_active)
    VALUES (spec.slug,spec.name,spec.tagline,spec.description,spec.category,spec.price,spec.duration_min,spec.badge,true)
    ON CONFLICT (slug) DO UPDATE SET
      name=EXCLUDED.name,tagline=EXCLUDED.tagline,description=EXCLUDED.description,
      category=EXCLUDED.category,price=EXCLUDED.price,duration_min=EXCLUDED.duration_min,
      badge=EXCLUDED.badge,is_active=true
    RETURNING id INTO new_id;

    DELETE FROM public.questions WHERE section_id IN (SELECT id FROM public.sections WHERE assessment_id=new_id);
    DELETE FROM public.sections WHERE assessment_id=new_id;

    FOR sec IN SELECT id,slug,name,weight,order_index FROM public.sections WHERE assessment_id=src_id ORDER BY order_index LOOP
      INSERT INTO public.sections (assessment_id,slug,name,weight,order_index)
      VALUES (new_id,sec.slug,sec.name,sec.weight,sec.order_index)
      RETURNING id INTO new_sec_id;

      INSERT INTO public.questions (section_id,text,options,order_index,dimension)
      SELECT new_sec_id,q.text,q.options,q.order_index,q.dimension
      FROM public.questions q WHERE q.section_id=sec.id;
    END LOOP;
  END LOOP;
END $$;
