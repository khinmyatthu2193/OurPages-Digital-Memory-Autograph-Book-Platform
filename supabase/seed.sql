insert into public.prompts (text, category)
values
  ('What is your favorite memory with me?', 'memory'),
  ('What is one thing you will always remember about me?', 'friendship'),
  ('What do you want to tell me before we graduate?', 'graduation'),
  ('What do you hope for my future?', 'future'),
  ('What was our funniest moment together?', 'fun')
on conflict do nothing;
