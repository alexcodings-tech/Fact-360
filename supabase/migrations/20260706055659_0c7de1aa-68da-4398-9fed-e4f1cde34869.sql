DO $$ DECLARE aid uuid; sid uuid; BEGIN
SELECT id INTO aid FROM public.assessments WHERE slug='fact-360';
IF aid IS NULL THEN
  INSERT INTO public.assessments(slug,name,tagline,description,category,price,duration_min,badge,is_active)
  VALUES('fact-360','FACT 360° MBTI Personality','Discover your MBTI personality type','80-item MBTI-style assessment with AI-generated report tailored to your designation.','Leadership',999,20,'Most Popular',true)
  RETURNING id INTO aid;
ELSE
  UPDATE public.assessments SET name='FACT 360° MBTI Personality', tagline='Discover your MBTI personality type', description='80-item MBTI-style assessment with AI-generated report tailored to your designation.', duration_min=20 WHERE id=aid;
END IF;
DELETE FROM public.sections WHERE assessment_id=aid;

INSERT INTO public.sections(assessment_id,slug,name,weight,order_index) VALUES(aid,'a','Energy & Interaction',25,0) RETURNING id INTO sid;
INSERT INTO public.questions(section_id,text,options,order_index,dimension) VALUES
(sid,'I enjoy meeting new people.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,0,'E'),
(sid,'I like talking with different people.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,1,'E'),
(sid,'I feel energetic after social events.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,2,'E'),
(sid,'I usually start conversations.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,3,'E'),
(sid,'I enjoy working in teams.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,4,'E'),
(sid,'I speak my ideas openly.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,5,'E'),
(sid,'I enjoy busy environments.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,6,'E'),
(sid,'I make friends easily.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,7,'E'),
(sid,'I enjoy networking.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,8,'E'),
(sid,'I like group activities.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,9,'E'),
(sid,'I enjoy spending time alone.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,10,'I'),
(sid,'I think before I speak.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,11,'I'),
(sid,'I like quiet places.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,12,'I'),
(sid,'I keep many thoughts to myself.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,13,'I'),
(sid,'Too much social activity tires me.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,14,'I'),
(sid,'I prefer a few close friends.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,15,'I'),
(sid,'I enjoy working alone.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,16,'I'),
(sid,'I need quiet time to recharge.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,17,'I'),
(sid,'I observe more than I talk.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,18,'I'),
(sid,'I enjoy reading or reflecting alone.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,19,'I');

INSERT INTO public.sections(assessment_id,slug,name,weight,order_index) VALUES(aid,'b','Information & Learning',25,1) RETURNING id INTO sid;
INSERT INTO public.questions(section_id,text,options,order_index,dimension) VALUES
(sid,'I notice small details.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,0,'S'),
(sid,'I trust facts.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,1,'S'),
(sid,'I learn best through experience.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,2,'S'),
(sid,'I like clear instructions.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,3,'S'),
(sid,'I prefer practical ideas.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,4,'S'),
(sid,'I rely on proven methods.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,5,'S'),
(sid,'I notice changes quickly.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,6,'S'),
(sid,'I enjoy solving real problems.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,7,'S'),
(sid,'I remember facts easily.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,8,'S'),
(sid,'I focus on what is happening now.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,9,'S'),
(sid,'I enjoy imagining possibilities.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,10,'N'),
(sid,'I think about the future.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,11,'N'),
(sid,'I enjoy creative ideas.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,12,'N'),
(sid,'I like trying new methods.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,13,'N'),
(sid,'I enjoy learning theories.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,14,'N'),
(sid,'I see the big picture.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,15,'N'),
(sid,'I enjoy brainstorming.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,16,'N'),
(sid,'I often ask ''What if?''','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,17,'N'),
(sid,'I connect ideas easily.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,18,'N'),
(sid,'I enjoy innovation.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,19,'N');

INSERT INTO public.sections(assessment_id,slug,name,weight,order_index) VALUES(aid,'c','Decision Making',25,2) RETURNING id INTO sid;
INSERT INTO public.questions(section_id,text,options,order_index,dimension) VALUES
(sid,'I make decisions using facts.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,0,'T'),
(sid,'I stay calm under pressure.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,1,'T'),
(sid,'I solve problems logically.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,2,'T'),
(sid,'I value fairness.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,3,'T'),
(sid,'I give honest feedback.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,4,'T'),
(sid,'I enjoy analyzing situations.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,5,'T'),
(sid,'I like objective discussions.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,6,'T'),
(sid,'I separate emotions from decisions.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,7,'T'),
(sid,'I challenge weak ideas.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,8,'T'),
(sid,'I focus on results.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,9,'T'),
(sid,'I think about people''s feelings.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,10,'F'),
(sid,'I value harmony.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,11,'F'),
(sid,'I enjoy helping others.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,12,'F'),
(sid,'I avoid hurting others.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,13,'F'),
(sid,'I consider personal values.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,14,'F'),
(sid,'I forgive easily.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,15,'F'),
(sid,'I encourage people.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,16,'F'),
(sid,'Others seek my support.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,17,'F'),
(sid,'Relationships matter to me.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,18,'F'),
(sid,'I enjoy making people feel included.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,19,'F');

INSERT INTO public.sections(assessment_id,slug,name,weight,order_index) VALUES(aid,'d','Lifestyle & Planning',25,3) RETURNING id INTO sid;
INSERT INTO public.questions(section_id,text,options,order_index,dimension) VALUES
(sid,'I plan my day.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,0,'J'),
(sid,'I finish work before relaxing.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,1,'J'),
(sid,'I keep things organized.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,2,'J'),
(sid,'I meet deadlines.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,3,'J'),
(sid,'I like knowing the plan.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,4,'J'),
(sid,'I enjoy checklists.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,5,'J'),
(sid,'I make decisions quickly.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,6,'J'),
(sid,'I like routines.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,7,'J'),
(sid,'I prepare in advance.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,8,'J'),
(sid,'I dislike unfinished work.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,9,'J'),
(sid,'I enjoy flexibility.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,10,'P'),
(sid,'I change plans easily.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,11,'P'),
(sid,'I like exploring options.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,12,'P'),
(sid,'I work without fixed plans.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,13,'P'),
(sid,'I enjoy surprises.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,14,'P'),
(sid,'I keep options open.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,15,'P'),
(sid,'I decide at the last minute.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,16,'P'),
(sid,'I adapt quickly.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,17,'P'),
(sid,'I enjoy spontaneous activities.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,18,'P'),
(sid,'I like variety in my work.','[{"label":"Strongly Disagree","score":1},{"label":"Disagree","score":2},{"label":"Not Sure","score":3},{"label":"Agree","score":4},{"label":"Strongly Agree","score":5}]'::jsonb,19,'P');
END $$;