
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

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, company text, title text, phone text, avatar_url text,
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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, company)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'company')
  on conflict (id) do nothing;
  if lower(new.email) = 'admin@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'client') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

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
create trigger assessments_updated_at before update on public.assessments for each row execute function public.update_updated_at_column();

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  slug text not null, name text not null,
  weight int not null default 10, order_index int not null default 0,
  unique (assessment_id, slug)
);
grant select on public.sections to anon, authenticated;
grant all on public.sections to authenticated, service_role;
alter table public.sections enable row level security;
create policy "Public read sections" on public.sections for select using (true);
create policy "Admins manage sections" on public.sections for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  text text not null, options jsonb not null default '[]'::jsonb,
  order_index int not null default 0,
  dimension text,
  icon text
);
grant select on public.questions to anon, authenticated;
grant all on public.questions to authenticated, service_role;
alter table public.questions enable row level security;
create policy "Public read questions" on public.questions for select using (true);
create policy "Admins manage questions" on public.questions for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

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
create trigger attempts_updated_at before update on public.attempts for each row execute function public.update_updated_at_column();

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  score int not null, selected_label text,
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
  created_at timestamptz not null default now()
);
grant select, insert, update on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "Own reports read" on public.reports for select to authenticated using (auth.uid() = user_id);
create policy "Admins read reports" on public.reports for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Own reports insert" on public.reports for insert to authenticated with check (auth.uid() = user_id);
