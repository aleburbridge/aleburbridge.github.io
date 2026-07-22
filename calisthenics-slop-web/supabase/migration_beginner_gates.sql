-- =============================================================
-- Migration: Beginner Gates
-- Run in Supabase SQL Editor after schema.sql
-- =============================================================

-- 1. Add beginner standard columns to progressions
ALTER TABLE progressions
    ADD COLUMN IF NOT EXISTS beginner_sets     INT,
    ADD COLUMN IF NOT EXISTS beginner_reps     INT,
    ADD COLUMN IF NOT EXISTS beginner_seconds  INT;

-- 2. Add beginner_done tracking to user_progression_status
ALTER TABLE user_progression_status
    ADD COLUMN IF NOT EXISTS beginner_done BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Seed beginner standards (source: Convict Conditioning overview chart)

-- ── Push-ups (series 1) ──────────────────────────────────────
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=1 AND step_number=1;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=1 AND step_number=2;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=1 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=1 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=1 AND step_number=10;

-- ── Squats (series 2) ────────────────────────────────────────
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=2 AND step_number=1;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=2 AND step_number=2;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=2 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=2 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=2 AND step_number=10;

-- ── Pull-ups (series 3) ──────────────────────────────────────
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=3 AND step_number=1;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=3 AND step_number=2;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=3 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=3 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=3 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=3 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=3 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=4   WHERE series_id=3 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=3   WHERE series_id=3 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=1   WHERE series_id=3 AND step_number=10;

-- ── Leg Raises (series 4) ────────────────────────────────────
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=4 AND step_number=1;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=4 AND step_number=2;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=4 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=4 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=4 AND step_number=10;

-- ── Bridges (series 5) ───────────────────────────────────────
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=5 AND step_number=1;
UPDATE progressions SET beginner_sets=1, beginner_reps=10  WHERE series_id=5 AND step_number=2;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=5 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=5 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=8   WHERE series_id=5 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=6   WHERE series_id=5 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=3   WHERE series_id=5 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=2   WHERE series_id=5 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=1   WHERE series_id=5 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=1   WHERE series_id=5 AND step_number=10;

-- ── Handstand Push-ups (series 6) ────────────────────────────
-- Steps 1-3 are timed holds; beginner standard is also timed
UPDATE progressions SET beginner_seconds=30  WHERE series_id=6 AND step_number=1;
UPDATE progressions SET beginner_seconds=10  WHERE series_id=6 AND step_number=2;
UPDATE progressions SET beginner_seconds=30  WHERE series_id=6 AND step_number=3;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=6 AND step_number=4;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=6 AND step_number=5;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=6 AND step_number=6;
UPDATE progressions SET beginner_sets=1, beginner_reps=5   WHERE series_id=6 AND step_number=7;
UPDATE progressions SET beginner_sets=1, beginner_reps=4   WHERE series_id=6 AND step_number=8;
UPDATE progressions SET beginner_sets=1, beginner_reps=3   WHERE series_id=6 AND step_number=9;
UPDATE progressions SET beginner_sets=1, beginner_reps=1   WHERE series_id=6 AND step_number=10;

-- 4. OPTIONAL: Delete auto-created UPS rows so users start fresh at 0/10.
--    Uncomment if you want a clean slate (wipes all progression history).
-- DELETE FROM user_progression_status;
