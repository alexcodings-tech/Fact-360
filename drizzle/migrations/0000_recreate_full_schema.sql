-- =========================================================
-- Consolidated schema for FACT 360 (roles, catalog, attempts, reports, orgs)
-- =========================================================

-- 1. Roles -------------------------------------------------
create type public.app_role as enum ('admin', 'consultant', 'client');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon, service_role;

create policy "Users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins see all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles ----------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, company text, title text, phone text, avatar_url text,
  email text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Admins read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, company, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'company', new.email)
  on conflict (id) do nothing;
  if lower(new.email) = 'admin@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'client') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- 3. Assessments -------------------------------------------
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, name text not null, tagline text, description text,
  category text not null, price numeric(10,2) not null default 0,
  duration_min int not null default 30, badge text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.assessments to anon, authenticated;
grant all on public.assessments to authenticated, service_role;
alter table public.assessments enable row level security;
create policy "Public read active assessments" on public.assessments for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage assessments" on public.assessments for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger assessments_updated_at before update on public.assessments
  for each row execute function public.update_updated_at_column();

-- 4. Sections ----------------------------------------------
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  slug text not null, name text not null,
  weight int not null default 10, order_index int not null default 0,
  audience text not null default 'individual',
  unique (assessment_id, slug)
);
grant select on public.sections to anon, authenticated;
grant all on public.sections to authenticated, service_role;
alter table public.sections enable row level security;
create policy "Public read sections" on public.sections for select using (true);
create policy "Admins manage sections" on public.sections for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 5. Questions ---------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  text text not null, options jsonb not null default '[]'::jsonb,
  order_index int not null default 0,
  dimension text, icon text, code text,
  type text not null default 'multiple_choice',
  config jsonb not null default '{}'::jsonb,
  required boolean not null default true
);
grant select on public.questions to anon, authenticated;
grant all on public.questions to authenticated, service_role;
alter table public.questions enable row level security;
create policy "Public read questions" on public.questions for select using (true);
create policy "Admins manage questions" on public.questions for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 6. Purchases ---------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  amount numeric(10,2) not null, currency text not null default 'INR',
  provider text not null default 'razorpay',
  order_id text, payment_id text, status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.purchases to authenticated;
grant all on public.purchases to service_role;
alter table public.purchases enable row level security;
create policy "Own purchases read" on public.purchases for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all purchases" on public.purchases for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own purchase insert" on public.purchases for insert to authenticated with check (auth.uid() = user_id);
create policy "Own purchase update" on public.purchases for update to authenticated using (auth.uid() = user_id);

-- 7. Attempts ----------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  status text not null default 'in_progress',
  progress int not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.attempts to authenticated;
grant all on public.attempts to service_role;
alter table public.attempts enable row level security;
create policy "Own attempts read" on public.attempts for select to authenticated using (auth.uid() = user_id);
create policy "Admins read attempts" on public.attempts for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own attempts insert" on public.attempts for insert to authenticated with check (auth.uid() = user_id);
create policy "Own attempts update" on public.attempts for update to authenticated using (auth.uid() = user_id);
create policy "Own attempts delete" on public.attempts for delete to authenticated using (auth.uid() = user_id);
create trigger attempts_updated_at before update on public.attempts
  for each row execute function public.update_updated_at_column();

-- 8. Responses ---------------------------------------------
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  score int, selected_label text,
  value_text text, value_number numeric,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);
grant select, insert, update, delete on public.responses to authenticated;
grant all on public.responses to service_role;
alter table public.responses enable row level security;
create policy "Own responses read" on public.responses for select to authenticated
  using (exists(select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "Admins read responses" on public.responses for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own responses write" on public.responses for insert to authenticated
  with check (exists(select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "Own responses update" on public.responses for update to authenticated
  using (exists(select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- 9. Reports -----------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  overall_score numeric(5,2) not null,
  section_scores jsonb not null default '{}'::jsonb,
  executive_summary text,
  strengths jsonb default '[]'::jsonb,
  gaps jsonb default '[]'::jsonb,
  action_plan jsonb default '[]'::jsonb,
  root_causes jsonb default '[]'::jsonb,
  growth_opportunity text,
  type_code text,
  dimension_scores jsonb,
  status text not null default 'pending_review',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "Own approved reports read" on public.reports for select to authenticated
  using (auth.uid() = user_id and status = 'approved');
create policy "Admins read reports" on public.reports for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own reports insert" on public.reports for insert to authenticated with check (auth.uid() = user_id);
create policy "Own reports delete" on public.reports for delete to authenticated using (auth.uid() = user_id);
create policy "Admins update reports" on public.reports for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role)) with check (has_role(auth.uid(), 'admin'::app_role));
create trigger update_reports_updated_at before update on public.reports
  for each row execute function public.update_updated_at_column();

-- 10. Organisations (FACT 360 engagements) -----------------
create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  director_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid references public.assessments(id),
  name text not null,
  industry text,
  org_type text,
  company_size text,
  business_position text,
  objectives text,
  current_level integer not null default 1,
  target_level integer not null default 3,
  director_name text,
  director_email text,
  director_phone text,
  status text not null default 'details',
  process_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organisations to authenticated;
grant all on public.organisations to service_role;
alter table public.organisations enable row level security;
create policy "Director manages own organisation" on public.organisations for all to authenticated
  using (auth.uid() = director_id) with check (auth.uid() = director_id);
create policy "Admins manage organisations" on public.organisations for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger organisations_updated_at before update on public.organisations
  for each row execute function public.update_updated_at_column();

-- 11. Department assessments (token based) -----------------
create table public.org_departments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  key text not null,
  name text not null,
  section_id uuid references public.sections(id),
  access_token text not null default replace(gen_random_uuid()::text, '-', ''),
  respondent_name text,
  respondent_email text,
  respondent_role text,
  status text not null default 'pending',
  score numeric,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, key),
  unique (access_token)
);
grant select, insert, update, delete on public.org_departments to authenticated;
grant all on public.org_departments to service_role;
alter table public.org_departments enable row level security;
create policy "Director manages own departments" on public.org_departments for all to authenticated
  using (exists (select 1 from public.organisations o where o.id = organisation_id and o.director_id = auth.uid()))
  with check (exists (select 1 from public.organisations o where o.id = organisation_id and o.director_id = auth.uid()));
create policy "Admins manage departments" on public.org_departments for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger org_departments_updated_at before update on public.org_departments
  for each row execute function public.update_updated_at_column();

-- 12. Department responses ---------------------------------
create table public.department_responses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.org_departments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  score integer,
  selected_label text,
  value_text text,
  value_number numeric,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, question_id)
);
grant select on public.department_responses to authenticated;
grant all on public.department_responses to service_role;
alter table public.department_responses enable row level security;
create policy "Director reads own department responses" on public.department_responses for select to authenticated
  using (exists (
    select 1 from public.org_departments d
    join public.organisations o on o.id = d.organisation_id
    where d.id = department_id and o.director_id = auth.uid()));
create policy "Admins read department responses" on public.department_responses for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create trigger department_responses_updated_at before update on public.department_responses
  for each row execute function public.update_updated_at_column();

-- 13. Org reports (AI draft + admin review) ----------------
create table public.org_reports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  version integer not null default 1,
  ai_draft jsonb not null default '{}'::jsonb,
  edited jsonb,
  metric_scores jsonb not null default '{}'::jsonb,
  department_scores jsonb not null default '{}'::jsonb,
  overall_score numeric,
  status text not null default 'draft',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.org_reports to authenticated;
grant all on public.org_reports to service_role;
alter table public.org_reports enable row level security;
create policy "Director reads approved report" on public.org_reports for select to authenticated
  using (status = 'approved' and exists (
    select 1 from public.organisations o where o.id = organisation_id and o.director_id = auth.uid()));
create policy "Admins manage org reports" on public.org_reports for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger org_reports_updated_at before update on public.org_reports
  for each row execute function public.update_updated_at_column();

-- 14. Seed: 5 module assessments, each with the 80-question bank
DO $$
DECLARE
  rec record;
  aid uuid; sid uuid;
  opts jsonb := '[
    {"label":"Strongly Disagree","score":1},
    {"label":"Disagree","score":2},
    {"label":"Not Sure","score":3},
    {"label":"Agree","score":4},
    {"label":"Strongly Agree","score":5}
  ]'::jsonb;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('your-assessment-80','L.I.F.E.™ (Lens for Individual Focus & Effectiveness)','Module 1 — Lens for Individual Focus & Effectiveness','An 80-question personal assessment covering behavior, motivation and work style. Get a detailed personality report you can share with your manager or coach.','Personality',999::numeric,20,'Most Popular'),
      ('disc','DISC Profiling','Module 2 — Dominance · Influence · Steadiness · Conscientiousness','The classic DISC behavioral profile to understand how you communicate, decide and collaborate.','Personality',999::numeric,20,NULL::text),
      ('leadership-manager','Leadership Assessment (Know Your Managers)','Module 3 — Manager-level leadership diagnostic','Evaluate manager-level leadership across delegation, decision-making, coaching, communication and accountability. Includes strengths, gaps and a development roadmap.','Leadership',999::numeric,30,NULL::text),
      ('module-4','Module 4 — Coming Soon','Module 4 — New assessment coming soon','A new assessment module — details coming soon. Preview available with the standard 80-question bank.','Business',999::numeric,20,'Coming Soon'),
      ('org-360','360° Business Analysis','Complete end-to-end business architecture (Module 5)','A full 360° evaluation of your organization across Governance, People, Operations, Finance, Brand & Technology. Fill the questionnaire and receive a company-level report.','Business',9999::numeric,60,'Most Popular')
    ) AS t(slug,name,tagline,description,category,price,duration_min,badge)
  LOOP
    INSERT INTO public.assessments (slug,name,tagline,description,category,price,duration_min,badge,is_active)
    VALUES (rec.slug,rec.name,rec.tagline,rec.description,rec.category,rec.price,rec.duration_min,rec.badge,true)
    ON CONFLICT (slug) DO UPDATE SET
      name=EXCLUDED.name, tagline=EXCLUDED.tagline, description=EXCLUDED.description,
      category=EXCLUDED.category, price=EXCLUDED.price, duration_min=EXCLUDED.duration_min,
      badge=EXCLUDED.badge, is_active=true
    RETURNING id INTO aid;

    DELETE FROM public.questions WHERE section_id IN (SELECT id FROM public.sections WHERE assessment_id = aid);
    DELETE FROM public.sections WHERE assessment_id = aid;

    INSERT INTO public.sections (assessment_id,slug,name,weight,order_index) VALUES (aid,'ei','Energy & Interaction',25,1) RETURNING id INTO sid;
    INSERT INTO public.questions (section_id,text,options,order_index,dimension,code)
    SELECT sid,t.txt,opts,t.oi,t.dim,t.code FROM (VALUES
      (1,'I enjoy meeting new people.','E','E1'),(2,'I like talking with different people.','E','E2'),
      (3,'I feel energetic after social events.','E','E3'),(4,'I usually start conversations.','E','E4'),
      (5,'I enjoy working in teams.','E','E5'),(6,'I speak my ideas openly.','E','E6'),
      (7,'I enjoy busy environments.','E','E7'),(8,'I make friends easily.','E','E8'),
      (9,'I enjoy networking.','E','E9'),(10,'I like group activities.','E','E10'),
      (11,'I enjoy spending time alone.','I','I1'),(12,'I think before I speak.','I','I2'),
      (13,'I like quiet places.','I','I3'),(14,'I keep many thoughts to myself.','I','I4'),
      (15,'Too much social activity tires me.','I','I5'),(16,'I prefer a few close friends.','I','I6'),
      (17,'I enjoy working alone.','I','I7'),(18,'I need quiet time to recharge.','I','I8'),
      (19,'I observe more than I talk.','I','I9'),(20,'I enjoy reading or reflecting alone.','I','I10')
    ) AS t(oi,txt,dim,code);

    INSERT INTO public.sections (assessment_id,slug,name,weight,order_index) VALUES (aid,'sn','Information & Learning',25,2) RETURNING id INTO sid;
    INSERT INTO public.questions (section_id,text,options,order_index,dimension,code)
    SELECT sid,t.txt,opts,t.oi,t.dim,t.code FROM (VALUES
      (1,'I notice small details.','S','S1'),(2,'I trust facts.','S','S2'),
      (3,'I learn best through experience.','S','S3'),(4,'I like clear instructions.','S','S4'),
      (5,'I prefer practical ideas.','S','S5'),(6,'I rely on proven methods.','S','S6'),
      (7,'I notice changes quickly.','S','S7'),(8,'I enjoy solving real problems.','S','S8'),
      (9,'I remember facts easily.','S','S9'),(10,'I focus on what is happening now.','S','S10'),
      (11,'I enjoy imagining possibilities.','N','N1'),(12,'I think about the future.','N','N2'),
      (13,'I enjoy creative ideas.','N','N3'),(14,'I like trying new methods.','N','N4'),
      (15,'I enjoy learning theories.','N','N5'),(16,'I see the big picture.','N','N6'),
      (17,'I enjoy brainstorming.','N','N7'),(18,'I often ask ''What if?''','N','N8'),
      (19,'I connect ideas easily.','N','N9'),(20,'I enjoy innovation.','N','N10')
    ) AS t(oi,txt,dim,code);

    INSERT INTO public.sections (assessment_id,slug,name,weight,order_index) VALUES (aid,'tf','Decision Making',25,3) RETURNING id INTO sid;
    INSERT INTO public.questions (section_id,text,options,order_index,dimension,code)
    SELECT sid,t.txt,opts,t.oi,t.dim,t.code FROM (VALUES
      (1,'I make decisions using facts.','T','T1'),(2,'I stay calm under pressure.','T','T2'),
      (3,'I solve problems logically.','T','T3'),(4,'I value fairness.','T','T4'),
      (5,'I give honest feedback.','T','T5'),(6,'I enjoy analyzing situations.','T','T6'),
      (7,'I like objective discussions.','T','T7'),(8,'I separate emotions from decisions.','T','T8'),
      (9,'I challenge weak ideas.','T','T9'),(10,'I focus on results.','T','T10'),
      (11,'I think about people''s feelings.','F','F1'),(12,'I value harmony.','F','F2'),
      (13,'I enjoy helping others.','F','F3'),(14,'I avoid hurting others.','F','F4'),
      (15,'I consider personal values.','F','F5'),(16,'I forgive easily.','F','F6'),
      (17,'I encourage people.','F','F7'),(18,'Others seek my support.','F','F8'),
      (19,'Relationships matter to me.','F','F9'),(20,'I enjoy making people feel included.','F','F10')
    ) AS t(oi,txt,dim,code);

    INSERT INTO public.sections (assessment_id,slug,name,weight,order_index) VALUES (aid,'jp','Lifestyle & Planning',25,4) RETURNING id INTO sid;
    INSERT INTO public.questions (section_id,text,options,order_index,dimension,code)
    SELECT sid,t.txt,opts,t.oi,t.dim,t.code FROM (VALUES
      (1,'I plan my day.','J','J1'),(2,'I finish work before relaxing.','J','J2'),
      (3,'I keep things organized.','J','J3'),(4,'I meet deadlines.','J','J4'),
      (5,'I like knowing the plan.','J','J5'),(6,'I enjoy checklists.','J','J6'),
      (7,'I make decisions quickly.','J','J7'),(8,'I like routines.','J','J8'),
      (9,'I prepare in advance.','J','J9'),(10,'I dislike unfinished work.','J','J10'),
      (11,'I enjoy flexibility.','P','P1'),(12,'I change plans easily.','P','P2'),
      (13,'I like exploring options.','P','P3'),(14,'I work without fixed plans.','P','P4'),
      (15,'I enjoy surprises.','P','P5'),(16,'I keep options open.','P','P6'),
      (17,'I decide at the last minute.','P','P7'),(18,'I adapt quickly.','P','P8'),
      (19,'I enjoy spontaneous activities.','P','P9'),(20,'I like variety in my work.','P','P10')
    ) AS t(oi,txt,dim,code);
  END LOOP;
END $$;