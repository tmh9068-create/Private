-- RPC・トリガー（一括実行用）

CREATE OR REPLACE FUNCTION drill_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := split_part(COALESCE(NEW.email, 'user@local'), '@', 1);
  IF v_name = '' THEN v_name := 'user'; END IF;

  INSERT INTO drill_user_profiles (id, display_name)
  VALUES (NEW.id, v_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO drill_device_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'drill_handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS drill_on_auth_user_created ON auth.users;
CREATE TRIGGER drill_on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION drill_handle_new_user();

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

CREATE OR REPLACE FUNCTION drill_get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_xp', (SELECT COUNT(*) * 10 FROM drill_lesson_completions WHERE user_id = p_user_id),
    'lessons_completed', (SELECT COUNT(*) FROM drill_lesson_completions WHERE user_id = p_user_id),
    'current_streak', COALESCE((SELECT streak FROM drill_device_progress WHERE user_id = p_user_id), 0)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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

CREATE OR REPLACE FUNCTION drill_search_user_by_code(p_code TEXT)
RETURNS TABLE (id UUID, display_name TEXT, friend_code TEXT, avatar_icon TEXT) AS $$
  SELECT id, display_name, friend_code, avatar_icon
  FROM drill_user_profiles
  WHERE friend_code = upper(trim(p_code)) AND id != auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION drill_send_friend_request(p_to_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() = p_to_user_id THEN RAISE EXCEPTION 'Cannot add yourself'; END IF;
  INSERT INTO drill_friend_requests (from_user_id, to_user_id)
  VALUES (auth.uid(), p_to_user_id) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION drill_accept_friend_request(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
  v_from UUID;
  v_to UUID;
BEGIN
  SELECT from_user_id, to_user_id INTO v_from, v_to
  FROM drill_friend_requests
  WHERE id = p_request_id AND to_user_id = auth.uid() AND status = 'pending';

  IF v_from IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;

  UPDATE drill_friend_requests SET status = 'accepted' WHERE id = p_request_id;

  INSERT INTO drill_user_friends (user_id, friend_id) VALUES (v_from, v_to) ON CONFLICT DO NOTHING;
  INSERT INTO drill_user_friends (user_id, friend_id) VALUES (v_to, v_from) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION drill_get_pending_friend_requests()
RETURNS TABLE (
  id UUID, from_user_id UUID, display_name TEXT, avatar_icon TEXT, friend_code TEXT, created_at TIMESTAMPTZ
) AS $$
  SELECT r.id, r.from_user_id, p.display_name, p.avatar_icon, p.friend_code, r.created_at
  FROM drill_friend_requests r
  JOIN drill_user_profiles p ON p.id = r.from_user_id
  WHERE r.to_user_id = auth.uid() AND r.status = 'pending'
  ORDER BY r.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
