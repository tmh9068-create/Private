-- 本気AIドリル マイグレーション（既存DBに安全に適用）

-- テーブル
CREATE TABLE IF NOT EXISTS drill_user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_icon TEXT DEFAULT 'maji-kun',
  avatar_url TEXT,
  friend_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  friend_ranking_opt_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drill_series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS drill_courses (
  id TEXT PRIMARY KEY,
  series_id TEXT REFERENCES drill_series(id),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  series_order INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS drill_lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES drill_courses(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  quiz_path TEXT
);

CREATE TABLE IF NOT EXISTS drill_device_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_course_id TEXT,
  current_lesson_index INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drill_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS drill_user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS drill_friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- 新規ユーザー自動作成
CREATE OR REPLACE FUNCTION drill_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO drill_user_profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO drill_device_progress (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS drill_on_auth_user_created ON auth.users;
CREATE TRIGGER drill_on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION drill_handle_new_user();

-- レッスン完了
CREATE OR REPLACE FUNCTION drill_complete_lesson(p_lesson_id TEXT, p_course_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_streak INT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO drill_lesson_completions (user_id, lesson_id)
  VALUES (v_user_id, p_lesson_id) ON CONFLICT DO NOTHING;

  SELECT last_active_date, streak INTO v_last_date, v_streak
  FROM drill_device_progress WHERE user_id = v_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN v_streak := 1;
  ELSIF v_last_date < v_today THEN v_streak := COALESCE(v_streak, 0) + 1;
  END IF;

  INSERT INTO drill_device_progress (user_id, current_course_id, streak, last_active_date)
  VALUES (v_user_id, p_course_id, v_streak, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    current_course_id = p_course_id, streak = v_streak,
    last_active_date = v_today, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー統計
CREATE OR REPLACE FUNCTION drill_get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_xp', (SELECT COUNT(*) * 10 FROM drill_lesson_completions WHERE user_id = p_user_id),
    'lessons_completed', (SELECT COUNT(*) FROM drill_lesson_completions WHERE user_id = p_user_id),
    'current_streak', COALESCE((SELECT streak FROM drill_device_progress WHERE user_id = p_user_id), 0)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- フレンド一覧
CREATE OR REPLACE FUNCTION drill_get_friends()
RETURNS TABLE (
  id UUID, display_name TEXT, avatar_icon TEXT, friend_code TEXT,
  streak INT, total_xp BIGINT
) AS $$
  SELECT p.id, p.display_name, p.avatar_icon, p.friend_code,
    COALESCE(d.streak, 0),
    (SELECT COUNT(*) * 10 FROM drill_lesson_completions c WHERE c.user_id = p.id)
  FROM drill_user_friends f
  JOIN drill_user_profiles p ON p.id = f.friend_id
  LEFT JOIN drill_device_progress d ON d.user_id = p.id
  WHERE f.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- フレンドコード検索
CREATE OR REPLACE FUNCTION drill_search_user_by_code(p_code TEXT)
RETURNS TABLE (id UUID, display_name TEXT, friend_code TEXT, avatar_icon TEXT) AS $$
  SELECT id, display_name, friend_code, avatar_icon
  FROM drill_user_profiles
  WHERE friend_code = upper(trim(p_code)) AND id != auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- フレンド申請送信
CREATE OR REPLACE FUNCTION drill_send_friend_request(p_to_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() = p_to_user_id THEN RAISE EXCEPTION 'Cannot add yourself'; END IF;
  INSERT INTO drill_friend_requests (from_user_id, to_user_id)
  VALUES (auth.uid(), p_to_user_id) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- フレンドランキング（週間=全フレンド+自分）
CREATE OR REPLACE FUNCTION drill_get_friend_ranking()
RETURNS TABLE (
  user_id UUID, display_name TEXT, avatar_icon TEXT,
  total_xp BIGINT, streak INT, rank BIGINT
) AS $$
  WITH ranked AS (
    SELECT p.id AS user_id, p.display_name, p.avatar_icon,
      (SELECT COUNT(*) * 10 FROM drill_lesson_completions c WHERE c.user_id = p.id) AS total_xp,
      COALESCE(d.streak, 0) AS streak
    FROM drill_user_profiles p
    LEFT JOIN drill_device_progress d ON d.user_id = p.id
    WHERE p.id = auth.uid()
       OR p.id IN (SELECT friend_id FROM drill_user_friends WHERE user_id = auth.uid())
  )
  SELECT *, ROW_NUMBER() OVER (ORDER BY total_xp DESC, streak DESC) AS rank FROM ranked;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE drill_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_device_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS drill_profiles_select ON drill_user_profiles;
DROP POLICY IF EXISTS drill_profiles_update ON drill_user_profiles;
DROP POLICY IF EXISTS drill_profiles_insert ON drill_user_profiles;
CREATE POLICY drill_profiles_select ON drill_user_profiles FOR SELECT USING (true);
CREATE POLICY drill_profiles_update ON drill_user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY drill_profiles_insert ON drill_user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS drill_progress_all ON drill_device_progress;
CREATE POLICY drill_progress_all ON drill_device_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS drill_completions_all ON drill_lesson_completions;
CREATE POLICY drill_completions_all ON drill_lesson_completions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS drill_friends_select ON drill_user_friends;
CREATE POLICY drill_friends_select ON drill_user_friends FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS drill_requests_all ON drill_friend_requests;
CREATE POLICY drill_requests_all ON drill_friend_requests FOR ALL
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS drill_series_read ON drill_series;
CREATE POLICY drill_series_read ON drill_series FOR SELECT USING (true);
DROP POLICY IF EXISTS drill_courses_read ON drill_courses;
CREATE POLICY drill_courses_read ON drill_courses FOR SELECT USING (true);
DROP POLICY IF EXISTS drill_lessons_read ON drill_lessons;
CREATE POLICY drill_lessons_read ON drill_lessons FOR SELECT USING (true);

-- シードデータ
INSERT INTO drill_series (id, title, description, icon, color, sort_order) VALUES
  ('git', 'Git入門', 'バージョン管理の基礎から実践まで', 'git-branch', '#f97316', 1),
  ('ai-basics', 'AI基礎', 'AIの仕組みと活用方法を学ぶ', 'brain', '#8b5cf6', 2),
  ('programming', 'プログラミング入門', 'コードの書き方と考え方を身につける', 'code', '#06b6d4', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO drill_courses (id, series_id, title, description, icon, series_order, sort_order) VALUES
  ('git-concept', 'git', 'Gitの概念', 'Gitとは何か、なぜ必要なのかを理解する', 'book-open', 1, 1),
  ('git-solo', 'git', '一人で使うGit', '基本操作をマスターする', 'user', 2, 2),
  ('ai-concept', 'ai-basics', 'AIの基本概念', '機械学習とディープラーニングの違い', 'lightbulb', 1, 1),
  ('ai-prompt', 'ai-basics', 'プロンプトエンジニアリング', '効果的なAIへの指示の出し方', 'message-square', 2, 2),
  ('prog-basics', 'programming', 'プログラミングの基礎', '変数、条件分岐、ループを学ぶ', 'terminal', 1, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO drill_lessons (id, course_id, title, description, sort_order, quiz_path) VALUES
  ('git-tour', 'git-concept', 'Gitツアー', 'Gitの世界を探検しよう', 1, 'git/01-tour'),
  ('git-what', 'git-concept', 'Gitとは', 'バージョン管理システムの基本', 2, 'git/02-what'),
  ('git-init', 'git-solo', 'リポジトリの作成', 'git init と git clone', 1, 'git/03-init'),
  ('git-commit', 'git-solo', 'コミット', '変更を記録する', 2, 'git/04-commit'),
  ('ai-what', 'ai-concept', 'AIとは何か', '人工知能の定義と歴史', 1, 'ai/01-what'),
  ('ai-ml', 'ai-concept', '機械学習の基礎', 'データから学ぶ仕組み', 2, 'ai/02-ml'),
  ('prompt-basics', 'ai-prompt', 'プロンプトの基本', '良い指示の出し方', 1, 'ai/03-prompt'),
  ('prog-variables', 'prog-basics', '変数と型', 'データの保存と操作', 1, 'prog/01-vars'),
  ('prog-conditions', 'prog-basics', '条件分岐', 'if文で分岐する', 2, 'prog/02-if')
ON CONFLICT (id) DO NOTHING;
