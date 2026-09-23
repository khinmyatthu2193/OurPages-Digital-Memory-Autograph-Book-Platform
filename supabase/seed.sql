insert into public.prompts (text, category)
values
  ('What is your favorite memory with me?', 'memory'),
  ('What is one thing you will always remember about me?', 'friendship'),
  ('What do you want to tell me before we graduate?', 'graduation'),
  ('What is one memory of us you will never forget?', 'graduation'),
  ('What will you miss the most?', 'graduation'),
  ('What is one thing you want me to remember?', 'graduation'),
  ('What was your favorite moment together?', 'graduation'),
  ('Leave a message for the next chapter of my life.', 'graduation'),
  ('If you could describe our years together in one sentence, what would it be?', 'graduation'),
  ('What do you hope for my future?', 'future'),
  ('What was our funniest moment together?', 'fun')
on conflict do nothing;
