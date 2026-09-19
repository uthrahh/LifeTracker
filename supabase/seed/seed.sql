-- Dev/staging seed data only. Never run against production.

insert into quotes (text, author, is_default) values
  ('If you show up everyday, the results don''t have a choice.', null, true),
  ('The future starts today, not tomorrow.', null, true),
  ('You become what you believe.', null, true),
  ('Seize the day.', null, true);

insert into categories (user_id, name, color, is_default) values
  (null, 'Self-care', '#E8A87C', true),
  (null, 'Fitness', '#6FCF97', true),
  (null, 'Academics', '#6FA8DC', true),
  (null, 'Career', '#9B8CD8', true);

insert into feature_flags (key, enabled, description) values
  ('environments.all', true, 'All 5 environments (free tier defaults to Fields only)'),
  ('ai.goal_breakdown', true, 'AI goal breakdown assistant'),
  ('calendar.advanced_sync', true, 'Advanced Google Calendar sync'),
  ('notes.unlimited', true, 'Unlimited notes (free tier capped at 50)'),
  ('insights.advanced', true, 'Advanced goal insights');

insert into productivity_guides (slug, title, summary, body, category, sort_order) values
  ('breaking-down-a-large-goal', 'How to break down a large goal', 'Turn one big ambition into a few concrete milestones.',
    '{"steps":["Name the goal in one sentence.","List 3-5 milestones that would each take a few weeks.","Pick the first milestone and add one task to it."]}', 'goals', 1),
  ('choosing-todays-priorities', 'How to choose today''s priorities', 'Pick what actually matters before the day fills up.',
    '{"steps":["Look at what''s overdue first.","Pick up to 3 priorities, not 10.","Everything else can wait for tomorrow."]}', 'daily', 2),
  ('recovering-after-missing-days', 'How to recover after missing several days', 'Falling behind is normal. Here''s how to restart without guilt.',
    '{"steps":["Open Reset Day.","Move what still matters to today or later.","Delete what doesn''t matter anymore.","Start fresh — the streak isn''t the point."]}', 'habits', 3),
  ('avoiding-overplanning', 'How to avoid overplanning', 'Planning can become its own form of procrastination.',
    '{"steps":["If a task takes 2 minutes, just do it instead of scheduling it.","Cap tomorrow at 3 priorities.","Leave room — not every hour needs a plan."]}', 'planning', 4),
  ('estimating-task-duration', 'How to estimate task duration', 'Most tasks take longer than expected — plan for that.',
    '{"steps":["Guess a duration, then add 25%.","Break anything over 90 minutes into two tasks.","Track a few real durations to calibrate."]}', 'tasks', 5),
  ('building-sustainable-habits', 'How to build sustainable habits', 'Consistency beats intensity.',
    '{"steps":["Start smaller than feels necessary.","Attach it to something you already do.","Use a flexible frequency if daily feels rigid."]}', 'habits', 6),
  ('reducing-task-friction', 'How to reduce task friction', 'Make the next step obvious, not effortful.',
    '{"steps":["Write tasks as actions, not topics (''Draft intro'' not ''Essay'').","Keep the first step tiny.","Prep what you need the night before."]}', 'tasks', 7),
  ('planning-tomorrow-in-two-minutes', 'How to plan tomorrow in 2 minutes', 'A lightweight nightly ritual.',
    '{"steps":["Ask: what''s important tomorrow?","Add 1-3 priorities.","Close the app."]}', 'planning', 8),
  ('handling-an-overwhelming-task-list', 'How to handle an overwhelming task list', 'You don''t have to do it all today.',
    '{"steps":["Use Reset Day.","Move, delete, or convert old items into a goal.","Keep only what''s realistic for today."]}', 'daily', 9),
  ('using-the-focus-timer', 'How to use the focus timer', 'Get the most out of focused sessions.',
    '{"steps":["Link a task before you start.","Use 25-minute sessions to start.","Take the break — it''s part of the method."]}', 'focus', 10),
  ('reviewing-weekly-progress', 'How to review weekly progress', 'A 5-minute look back that shapes next week.',
    '{"steps":["Open Weekly Review.","Answer: what moved forward, what needs attention, what can wait.","Carry 1-3 things into next week''s plan."]}', 'planning', 11);
