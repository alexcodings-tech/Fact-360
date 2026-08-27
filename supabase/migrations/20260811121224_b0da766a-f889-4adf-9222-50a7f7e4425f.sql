INSERT INTO public.purchases (user_id, assessment_id, amount, currency, provider, order_id, payment_id, status, created_at)
SELECT DISTINCT ON (a.user_id, a.assessment_id)
  a.user_id, a.assessment_id, s.price, 'INR', 'razorpay',
  'order_mock_' || substr(replace(gen_random_uuid()::text,'-',''),1,8),
  'pay_mock_' || substr(replace(gen_random_uuid()::text,'-',''),1,8),
  'paid', a.created_at
FROM public.attempts a
JOIN public.assessments s ON s.id = a.assessment_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.purchases p
  WHERE p.user_id = a.user_id AND p.assessment_id = a.assessment_id AND p.status = 'paid'
);