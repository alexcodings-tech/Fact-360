WITH tf(oi, txt) AS (VALUES
 (1,'I make decisions using facts.'),(2,'I stay calm under pressure.'),(3,'I solve problems logically.'),(4,'I value fairness.'),(5,'I give honest feedback.'),(6,'I enjoy analyzing situations.'),(7,'I like objective discussions.'),(8,'I separate emotions from decisions.'),(9,'I challenge weak ideas.'),(10,'I focus on results.'),
 (11,'I think about people''s feelings.'),(12,'I value harmony.'),(13,'I enjoy helping others.'),(14,'I avoid hurting others.'),(15,'I consider personal values.'),(16,'I forgive easily.'),(17,'I encourage people.'),(18,'Others seek my support.'),(19,'Relationships matter to me.'),(20,'I enjoy making people feel included.')
)
UPDATE public.questions q SET text = tf.txt
FROM public.sections s, tf
WHERE q.section_id = s.id AND s.slug = 'tf' AND q.order_index = tf.oi;

WITH jp(oi, txt) AS (VALUES
 (1,'I plan my day.'),(2,'I finish work before relaxing.'),(3,'I keep things organized.'),(4,'I meet deadlines.'),(5,'I like knowing the plan.'),(6,'I enjoy checklists.'),(7,'I make decisions quickly.'),(8,'I like routines.'),(9,'I prepare in advance.'),(10,'I dislike unfinished work.'),
 (11,'I enjoy flexibility.'),(12,'I change plans easily.'),(13,'I like exploring options.'),(14,'I work without fixed plans.'),(15,'I enjoy surprises.'),(16,'I keep options open.')
)
UPDATE public.questions q SET text = jp.txt
FROM public.sections s, jp
WHERE q.section_id = s.id AND s.slug = 'jp' AND q.order_index = jp.oi;