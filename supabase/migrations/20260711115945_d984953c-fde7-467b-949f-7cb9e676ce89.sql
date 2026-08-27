-- Remove old MBTI assessment; keep the 5 requested new ones.
delete from public.assessments where slug = 'fact360-mbti';