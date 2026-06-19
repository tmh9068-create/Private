-- 本気AIドリル Supabase スキーマ
-- https://drill.ma-ji.ai/ と同じデータベース構造

-- ユーザープロフィール
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_icon TEXT,
  avatar_url TEXT,
  friend_code TEXT UNIQUE NOT NULL,
  friend_ranking_opt_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 学習シリーズ
CREATE TABLE IF NOT EXISTS drill_series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- コース
CREATE TABLE IF NOT EXISTS drill_courses (
  id TEXT PRIMARY KEY,
  series_id TEXT REFERENCES drill_series(id),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  series_order INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- レッスン
CREATE TABLE IF NOT EXISTS drill_lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES drill_courses(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  quiz_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ユーザー進捗
CREATE TABLE IF NOT EXISTS drill_device_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_course_id TEXT,
  current_lesson_index INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- レッスン完了記録
CREATE TABLE IF NOT EXISTS drill_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- フレンド関係
CREATE TABLE IF NOT EXISTS user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- フレンド申請
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- シリーズテスト
CREATE TABLE IF NOT EXISTS drill_series_tests (
  id TEXT PRIMARY KEY,
  series_id TEXT REFERENCES drill_series(id),
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- シリーズテスト合格記録
CREATE TABLE IF NOT EXISTS drill_series_test_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT REFERENCES drill_series_tests(id),
  score INT,
  passed_at TIMESTAMPTZ DEFAULT now()
);

-- コース評価
CREATE TABLE IF NOT EXISTS course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 問題報告
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT,
  question_id TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- フレンドコード自動生成
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := upper(substr(md5(random()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_friend_code
  BEFORE INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION generate_friend_code();

-- レッスン完了 RPC
CREATE OR REPLACE FUNCTION complete_lesson(p_lesson_id TEXT, p_course_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_streak INT;
BEGIN
  INSERT INTO drill_lesson_completions (user_id, lesson_id)
  VALUES (v_user_id, p_lesson_id)
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  SELECT last_active_date, streak INTO v_last_date, v_streak
  FROM drill_device_progress WHERE user_id = v_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_streak := 1;
  ELSIF v_last_date < v_today THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  END IF;

  INSERT INTO drill_device_progress (user_id, current_course_id, streak, last_active_date)
  VALUES (v_user_id, p_course_id, v_streak, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    current_course_id = p_course_id,
    streak = v_streak,
    last_active_date = v_today,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー統計 RPC
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_xp', (SELECT COUNT(*) * 10 FROM drill_lesson_completions WHERE user_id = p_user_id),
    'lessons_completed', (SELECT COUNT(*) FROM drill_lesson_completions WHERE user_id = p_user_id),
    'current_streak', COALESCE((SELECT streak FROM drill_device_progress WHERE user_id = p_user_id), 0)
  ) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS ポリシー
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_device_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view public profiles" ON user_profiles FOR SELECT USING (true);

CREATE POLICY "Users manage own progress" ON drill_device_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own completions" ON drill_lesson_completions FOR ALL USING (auth.uid() = user_id);
