-- ============================================
-- Life Optimize - Supabase Schema
-- Run this in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query > Paste & Run)
-- ============================================

-- Weigh-ins
CREATE TABLE weigh_ins (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight REAL NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Food log
CREATE TABLE food_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal TEXT NOT NULL,
  description TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workouts
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  kids_play INTEGER DEFAULT 0,
  stairs INTEGER DEFAULT 0,
  extra_walking INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Body measurements
CREATE TABLE measurements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight REAL,
  waist REAL,
  chest REAL,
  hips REAL,
  l_bicep REAL,
  r_bicep REAL,
  l_thigh REAL,
  r_thigh REAL,
  body_fat REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sleep log
CREATE TABLE sleep_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TEXT DEFAULT '',
  wake_time TEXT DEFAULT '',
  hours REAL DEFAULT 0,
  quality INTEGER DEFAULT 3,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mood log
CREATE TABLE mood_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER DEFAULT 3,
  stress INTEGER DEFAULT 5,
  gratitude JSONB DEFAULT '[]',
  mindfulness INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Energy log
CREATE TABLE energy_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy JSONB DEFAULT '{}',
  focus_min INTEGER DEFAULT 0,
  productivity INTEGER DEFAULT 5,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fasting log
CREATE TABLE fasting_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  target_hours REAL DEFAULT 16,
  active BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily checklist (date-keyed, JSONB for checked items)
CREATE TABLE daily_checklist (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, date)
);

-- Daily hydration (date-keyed, integer oz)
CREATE TABLE daily_hydration (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  oz INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Daily habits log (date-keyed, JSONB for checked habits)
CREATE TABLE daily_habits_log (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, date)
);

-- Daily supplements log (date-keyed, JSONB for checked supplements)
CREATE TABLE daily_supplements_log (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, date)
);

-- Habits config (user's custom habit list)
CREATE TABLE habits_config (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'star',
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, key)
);

-- Supplements config (user's supplement list)
CREATE TABLE supplements_config (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  time TEXT DEFAULT 'anytime',
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, key)
);

-- ============================================
-- Row Level Security (RLS)
-- Each user can only access their own data
-- ============================================

ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_hydration ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_supplements_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements_config ENABLE ROW LEVEL SECURITY;

-- Policy: users can do everything with their own rows
CREATE POLICY "Users manage own data" ON weigh_ins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON food_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON measurements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON sleep_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON mood_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON energy_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON fasting_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON daily_checklist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON daily_hydration FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON daily_habits_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON daily_supplements_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON habits_config FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON supplements_config FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
