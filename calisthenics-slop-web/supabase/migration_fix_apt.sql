-- =============================================================
-- Migration: Fix APT
-- Run in Supabase SQL Editor after schema.sql (and migration_beginner_gates.sql)
-- =============================================================
-- Adds series 7 "Fix APT" — alternates daily between two exercises
-- (Dead Bugs / Posterior Tilt Plank) rather than progressing through steps.
-- The app treats series 7 specially: it is never gated, never "mastered",
-- and doesn't write to user_progression_status.

-- 1. Widen the series_id range to allow series 7
ALTER TABLE progressions
    DROP CONSTRAINT IF EXISTS progressions_series_id_check,
    ADD CONSTRAINT progressions_series_id_check CHECK (series_id BETWEEN 1 AND 7);

ALTER TABLE user_progression_status
    DROP CONSTRAINT IF EXISTS user_progression_status_series_id_check,
    ADD CONSTRAINT user_progression_status_series_id_check CHECK (series_id BETWEEN 1 AND 7);

-- 2. Seed the two Fix APT exercises
INSERT INTO progressions (series_id, step_number, name, description, gate_value, gate_sets, gate_reps, gate_seconds, image_asset_name)
VALUES
(7, 1, 'Dead Bugs',            'Lie on back, arms up and knees bent at 90 degrees. Slowly lower opposite arm and leg toward the floor while keeping lower back pressed down, then return. Alternate sides.', '2x10',  2, 10,  NULL, 'fixapt_01'),
(7, 2, 'Posterior Tilt Plank', 'Forearm plank position. Actively tuck the pelvis under (posterior pelvic tilt) and squeeze glutes to flatten the lower back, holding the tilt for the full duration.',        '2x30S', NULL, NULL, 30,   'fixapt_02')
ON CONFLICT (series_id, step_number) DO NOTHING;
