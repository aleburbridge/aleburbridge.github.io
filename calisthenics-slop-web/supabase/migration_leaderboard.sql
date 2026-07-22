-- Leaderboard RPC function
-- Run this in the Supabase SQL editor.
--
-- SECURITY DEFINER is required to bypass RLS on user_progression_status
-- and to read auth.users (which is in the auth schema).
-- auth.uid() still returns the calling user's ID inside SECURITY DEFINER functions,
-- so is_current_user is accurate.

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  display_name    text,
  total_score     int,
  series_1        int,
  series_2        int,
  series_3        int,
  series_4        int,
  series_5        int,
  series_6        int,
  is_current_user boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    split_part(u.email, '@', 1)                                                           AS display_name,
    COALESCE(SUM(LEAST(s.current_step, 10)), 0)::int                                      AS total_score,
    COALESCE(MAX(CASE WHEN s.series_id = 1 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_1,
    COALESCE(MAX(CASE WHEN s.series_id = 2 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_2,
    COALESCE(MAX(CASE WHEN s.series_id = 3 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_3,
    COALESCE(MAX(CASE WHEN s.series_id = 4 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_4,
    COALESCE(MAX(CASE WHEN s.series_id = 5 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_5,
    COALESCE(MAX(CASE WHEN s.series_id = 6 THEN LEAST(s.current_step, 10) END), 0)::int  AS series_6,
    (u.id = auth.uid())                                                                   AS is_current_user
  FROM auth.users u
  LEFT JOIN user_progression_status s ON s.user_id = u.id
  GROUP BY u.id, u.email
  HAVING COUNT(s.id) > 0
  ORDER BY total_score DESC, u.created_at ASC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
