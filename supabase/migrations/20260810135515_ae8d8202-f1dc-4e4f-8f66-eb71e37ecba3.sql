-- Question types + richer response values
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS required boolean NOT NULL DEFAULT true;

ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'individual';

ALTER TABLE public.responses
  ALTER COLUMN score DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS value_text text,
  ADD COLUMN IF NOT EXISTS value_number numeric,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Organisations (FACT 360 engagements)
CREATE TABLE IF NOT EXISTS public.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES public.assessments(id),
  name text NOT NULL,
  industry text,
  org_type text,
  company_size text,
  business_position text,
  objectives text,
  current_level integer NOT NULL DEFAULT 1,
  target_level integer NOT NULL DEFAULT 3,
  director_name text,
  director_email text,
  director_phone text,
  status text NOT NULL DEFAULT 'details',
  process_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Director manages own organisation" ON public.organisations FOR ALL TO authenticated
  USING (auth.uid() = director_id) WITH CHECK (auth.uid() = director_id);
CREATE POLICY "Admins manage organisations" ON public.organisations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER organisations_updated_at BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Department assessments (token based)
CREATE TABLE IF NOT EXISTS public.org_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  section_id uuid REFERENCES public.sections(id),
  access_token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  respondent_name text,
  respondent_email text,
  respondent_role text,
  status text NOT NULL DEFAULT 'pending',
  score numeric,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, key),
  UNIQUE (access_token)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_departments TO authenticated;
GRANT ALL ON public.org_departments TO service_role;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Director manages own departments" ON public.org_departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organisations o WHERE o.id = organisation_id AND o.director_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.organisations o WHERE o.id = organisation_id AND o.director_id = auth.uid()));
CREATE POLICY "Admins manage departments" ON public.org_departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER org_departments_updated_at BEFORE UPDATE ON public.org_departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Department responses (anonymous, token verified server-side)
CREATE TABLE IF NOT EXISTS public.department_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score integer,
  selected_label text,
  value_text text,
  value_number numeric,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, question_id)
);
GRANT SELECT ON public.department_responses TO authenticated;
GRANT ALL ON public.department_responses TO service_role;
ALTER TABLE public.department_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Director reads own department responses" ON public.department_responses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.org_departments d
    JOIN public.organisations o ON o.id = d.organisation_id
    WHERE d.id = department_id AND o.director_id = auth.uid()));
CREATE POLICY "Admins read department responses" ON public.department_responses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER department_responses_updated_at BEFORE UPDATE ON public.department_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI draft reports with admin review workflow
CREATE TABLE IF NOT EXISTS public.org_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  ai_draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  edited jsonb,
  metric_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  department_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall_score numeric,
  status text NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.org_reports TO authenticated;
GRANT ALL ON public.org_reports TO service_role;
ALTER TABLE public.org_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Director reads approved report" ON public.org_reports FOR SELECT TO authenticated
  USING (status = 'approved' AND EXISTS (
    SELECT 1 FROM public.organisations o WHERE o.id = organisation_id AND o.director_id = auth.uid()));
CREATE POLICY "Admins manage org reports" ON public.org_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER org_reports_updated_at BEFORE UPDATE ON public.org_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();