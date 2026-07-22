-- =============================================================
-- Calisthenics Slop — Supabase Schema
-- Run this entire file in the Supabase SQL editor (one paste).
-- =============================================================


-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE progressions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id       int  NOT NULL CHECK (series_id BETWEEN 1 AND 6),
    step_number     int  NOT NULL CHECK (step_number BETWEEN 1 AND 10),
    name            text NOT NULL,
    description     text NOT NULL DEFAULT '',
    gate_value      text NOT NULL,   -- display string e.g. '3x50' or '2 min'
    gate_sets       int,             -- null for timed holds
    gate_reps       int,             -- null for timed holds
    gate_seconds    int,             -- null for set/rep gates
    image_asset_name text NOT NULL DEFAULT '',
    UNIQUE (series_id, step_number)
);

CREATE TABLE workout_logs (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progression_id      uuid        NOT NULL REFERENCES progressions(id),
    logged_at           timestamptz NOT NULL DEFAULT now(),
    sets_completed      int,         -- null for timed holds
    reps_completed      int,         -- null for timed holds
    seconds_completed   int,         -- null for set/rep steps
    notes               text
);

CREATE TABLE user_progression_status (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    series_id       int         NOT NULL CHECK (series_id BETWEEN 1 AND 6),
    current_step    int         NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 10),
    unlocked_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, series_id)
);

-- Indexes for common query patterns
CREATE INDEX idx_workout_logs_user_progression ON workout_logs (user_id, progression_id, logged_at DESC);
CREATE INDEX idx_user_progression_status_user ON user_progression_status (user_id);


-- ── Row-Level Security ────────────────────────────────────────

ALTER TABLE progressions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progression_status   ENABLE ROW LEVEL SECURITY;

-- progressions: any authenticated user can read, nobody writes from client
CREATE POLICY "progressions_read" ON progressions
    FOR SELECT TO authenticated USING (true);

-- workout_logs: users own their rows
CREATE POLICY "workout_logs_select" ON workout_logs
    FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "workout_logs_insert" ON workout_logs
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "workout_logs_update" ON workout_logs
    FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "workout_logs_delete" ON workout_logs
    FOR DELETE TO authenticated USING (user_id = auth.uid());

-- user_progression_status: users own their rows
CREATE POLICY "ups_select" ON user_progression_status
    FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ups_insert" ON user_progression_status
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ups_update" ON user_progression_status
    FOR UPDATE TO authenticated USING (user_id = auth.uid());


-- ── Seed: 60 Progressions ────────────────────────────────────
-- series_id: 1=Push-up, 2=Squat, 3=Pull-up, 4=Leg Raise, 5=Bridge, 6=HS Push-up
-- gate_value is the Progression Standard (display string).
-- gate_sets / gate_reps: used by the app for gate check (set/rep steps).
-- gate_seconds: used for timed holds (HS Push-up steps 1-3).

INSERT INTO progressions (series_id, step_number, name, description, gate_value, gate_sets, gate_reps, gate_seconds, image_asset_name) VALUES

-- ── Push-ups (series 1) ──────────────────────────────────────
(1,  1, 'Wall Push-Ups',       'Stand facing a wall. Place hands shoulder-width on wall at chest height. Bend elbows to bring face close to wall, then push back.',         '3x50',  3, 50,  NULL, 'pushup_01'),
(1,  2, 'Incline Push-Ups',    'Hands on an elevated surface (chair or low table). Body straight, lower chest toward surface and push back.',                               '3x40',  3, 40,  NULL, 'pushup_02'),
(1,  3, 'Kneeling Push-Ups',   'Knees on floor, body straight from knees to shoulders. Lower chest to floor and push back.',                                               '3x30',  3, 30,  NULL, 'pushup_03'),
(1,  4, 'Half Push-Ups',       'Full push-up position. Lower body only halfway down, then push back. Partial range of motion.',                                            '2x25',  2, 25,  NULL, 'pushup_04'),
(1,  5, 'Full Push-Ups',       'Standard push-up. Body straight, lower chest to floor and push back. Full range of motion.',                                              '2x20',  2, 20,  NULL, 'pushup_05'),
(1,  6, 'Close Push-Ups',      'Push-up with hands close together (diamond-width or closer). Increases tricep demand.',                                                   '2x20',  2, 20,  NULL, 'pushup_06'),
(1,  7, 'Uneven Push-Ups',     'One hand on a basketball or similar object, one hand on floor. Alternate sides each set.',                                                 '2x20',  2, 20,  NULL, 'pushup_07'),
(1,  8, 'Half One-Arm Push-Ups','One-arm push-up position (other arm behind back). Lower halfway, push back. Partial range.',                                             '2x20',  2, 20,  NULL, 'pushup_08'),
(1,  9, 'Lever Push-Ups',      'One hand on a ball placed to the side. Push-up through the primary arm while the lever arm assists with balance.',                        '2x20',  2, 20,  NULL, 'pushup_09'),
(1, 10, 'One-Arm Push-Ups',    'Full one-arm push-up. Body straight, lower chest to floor and push back using a single arm. Alternate arms each set.',                   '1x100', 1, 100, NULL, 'pushup_10'),

-- ── Squats (series 2) ────────────────────────────────────────
(2,  1, 'Shoulderstand Squats','Lie on back, raise legs over head into a shoulderstand. Bend knees to chest and extend. Lower back supported.',                            '3x50',  3, 50,  NULL, 'squat_01'),
(2,  2, 'Jackknife Squats',    'Stand facing a support (table edge). Hold lightly for balance. Squat as deep as possible, using support to stay upright.',                 '3x40',  3, 40,  NULL, 'squat_02'),
(2,  3, 'Supported Squats',    'Hold a support at waist height. Squat to full depth, using support to maintain upright torso.',                                            '3x30',  3, 30,  NULL, 'squat_03'),
(2,  4, 'Half Squats',         'Freestanding squat, feet shoulder-width. Lower until thighs are parallel to floor. No support.',                                          '2x50',  2, 50,  NULL, 'squat_04'),
(2,  5, 'Full Squats',         'Freestanding squat to full depth — thighs past parallel, heels on floor.',                                                                '2x30',  2, 30,  NULL, 'squat_05'),
(2,  6, 'Close Squats',        'Full-depth squat with feet together.',                                                                                                    '2x20',  2, 20,  NULL, 'squat_06'),
(2,  7, 'Uneven Squats',       'One foot on a basketball or raised surface, one on floor. Full squat. Alternate sides each set.',                                          '2x20',  2, 20,  NULL, 'squat_07'),
(2,  8, 'Half One-Leg Squats', 'Stand on one leg, other leg extended forward. Lower halfway and push back up.',                                                           '2x20',  2, 20,  NULL, 'squat_08'),
(2,  9, 'Assisted One-Leg Squats','Pistol squat with one hand lightly touching a support for balance. Full depth.',                                                       '2x20',  2, 20,  NULL, 'squat_09'),
(2, 10, 'One-Leg Squats',      'Full pistol squat. Stand on one leg, extend the other forward, lower to full depth, stand back up. No support.',                         '2x50',  2, 50,  NULL, 'squat_10'),

-- ── Pull-ups (series 3) ──────────────────────────────────────
(3,  1, 'Vertical Pulls',      'Bar set high (arms fully extended overhead while standing). Lean back slightly, pull chest to bar from standing position.',               '3x40',  3, 40,  NULL, 'pullup_01'),
(3,  2, 'Horizontal Pulls',    'Bar set at hip height. Hang under bar with heels on floor, body angled. Pull chest to bar.',                                              '3x30',  3, 30,  NULL, 'pullup_02'),
(3,  3, 'Jackknife Pull-Ups',  'Hang from bar, knees tucked, one foot on chair or support. Use legs lightly for assistance. Full pull-up motion.',                        '3x20',  3, 20,  NULL, 'pullup_03'),
(3,  4, 'Half Pull-Ups',       'Hang from bar at arms-length. Pull up until arms are at 90 degrees, lower back down. Half range of motion.',                              '2x15',  2, 15,  NULL, 'pullup_04'),
(3,  5, 'Full Pull-Ups',       'Standard pull-up. Hang at arm''s length, pull until chin clears bar, lower under control.',                                               '2x10',  2, 10,  NULL, 'pullup_05'),
(3,  6, 'Close Pull-Ups',      'Pull-up with hands 6 inches apart or less. Same motion as full pull-up.',                                                                 '2x10',  2, 10,  NULL, 'pullup_06'),
(3,  7, 'Uneven Pull-Ups',     'One hand on bar, other gripping a towel or ball hanging from bar. Pull up with primary arm doing most work.',                             '2x9',   2,  9,  NULL, 'pullup_07'),
(3,  8, 'Half One-Arm Pull-Ups','Hang from bar with one arm. Pull until arm reaches 90 degrees, lower back to hang. Alternate arms each set.',                           '2x8',   2,  8,  NULL, 'pullup_08'),
(3,  9, 'Assisted One-Arm Pull-Ups','One hand on bar, other gripping a towel hanging from bar for minimal help. Full range of motion.',                                  '2x7',   2,  7,  NULL, 'pullup_09'),
(3, 10, 'One-Arm Pull-Ups',    'Full one-arm pull-up. Hang at arm''s length, pull until chin clears bar, lower under control. No assist.',                                '2x6',   2,  6,  NULL, 'pullup_10'),

-- ── Leg Raises (series 4) ────────────────────────────────────
(4,  1, 'Knee Tucks',          'Lie on back, hands at sides. Draw both knees to chest, hold briefly, lower.',                                                             '3x40',  3, 40,  NULL, 'legraise_01'),
(4,  2, 'Flat Knee Raises',    'Lie flat. Raise bent knees until thighs are vertical, lower without touching floor.',                                                     '3x35',  3, 35,  NULL, 'legraise_02'),
(4,  3, 'Flat Bent Leg Raises','Lie flat. Raise bent legs until thighs pass vertical, lower under control.',                                                              '3x30',  3, 30,  NULL, 'legraise_03'),
(4,  4, 'Flat Frog Raises',    'Lie flat, knees bent and feet together. Raise legs together in a frog-like arc to vertical, lower.',                                      '3x25',  3, 25,  NULL, 'legraise_04'),
(4,  5, 'Flat Straight Leg Raises','Lie flat, legs straight. Raise both legs to 90 degrees, lower without touching floor.',                                               '2x20',  2, 20,  NULL, 'legraise_05'),
(4,  6, 'Hanging Knee Raises', 'Hang from bar. Draw knees to chest, lower under control.',                                                                                '2x15',  2, 15,  NULL, 'legraise_06'),
(4,  7, 'Hanging Bent Leg Raises','Hang from bar. Raise bent legs until thighs are parallel to floor, lower.',                                                           '2x15',  2, 15,  NULL, 'legraise_07'),
(4,  8, 'Hanging Frog Raises', 'Hang from bar, feet together. Raise bent legs up together to waist height or above, lower.',                                              '2x15',  2, 15,  NULL, 'legraise_08'),
(4,  9, 'Partial Straight Leg Raises','Hang from bar. Raise straight legs to 45 degrees, hold briefly, lower.',                                                          '2x15',  2, 15,  NULL, 'legraise_09'),
(4, 10, 'Hanging Straight Leg Raises','Hang from bar. Raise straight legs until toes touch bar (or as high as possible). Lower under control.',                          '2x30',  2, 30,  NULL, 'legraise_10'),

-- ── Bridges (series 5) ───────────────────────────────────────
(5,  1, 'Short Bridges',       'Lie on back, knees bent, feet flat. Push hips up until body forms a straight line from knees to shoulders. Lower.',                       '3x50',  3, 50,  NULL, 'bridge_01'),
(5,  2, 'Straight Bridges',    'Sit on floor, legs straight, hands beside hips. Push hips up until body is straight from heels to shoulders. Lower.',                    '3x40',  3, 40,  NULL, 'bridge_02'),
(5,  3, 'Angled Bridges',      'Feet elevated on a chair or surface, hands on floor behind you. Push up into a full plank-like bridge at an angle.',                      '3x30',  3, 30,  NULL, 'bridge_03'),
(5,  4, 'Head Bridges',        'Lie on back. Push up into a bridge using hands and feet, then place crown of head on floor. Full arch.',                                  '2x25',  2, 25,  NULL, 'bridge_04'),
(5,  5, 'Half Bridges',        'Stand facing away from a wall. Reach back and touch wall, walking hands down partway into a partial back-bend.',                          '2x20',  2, 20,  NULL, 'bridge_05'),
(5,  6, 'Full Bridges',        'Lie on back. Push up into a full back-bend bridge from the floor, arms and legs straight.',                                               '2x15',  2, 15,  NULL, 'bridge_06'),
(5,  7, 'Wall Walking Bridges (Down)','Stand with back to wall. Lean back and walk hands down the wall into a bridge position.',                                           '2x10',  2, 10,  NULL, 'bridge_07'),
(5,  8, 'Wall Walking Bridges (Up)', 'From a bridge at the base of a wall, walk hands up the wall to standing.',                                                          '2x8',   2,  8,  NULL, 'bridge_08'),
(5,  9, 'Closing Bridges',     'Stand, perform a full back-bend to bridge, then push back up to standing. No wall.',                                                      '2x6',   2,  6,  NULL, 'bridge_09'),
(5, 10, 'Stand-to-Stand Bridges','From standing, drop into a full bridge and return to standing in one fluid motion. No wall, no floor push-off.',                       '2x10',  2, 10,  NULL, 'bridge_10'),

-- ── Handstand Push-ups (series 6) ────────────────────────────
-- Steps 1-3 are timed holds: gate_seconds used, gate_sets/gate_reps are null.
(6,  1, 'Wall Headstands',         'Face wall, place head and hands in a triangle on floor, kick up into an inverted headstand against wall. Hold.',                      '2 min', NULL, NULL, 120, 'hspu_01'),
(6,  2, 'Crow Stands',             'Squat, place hands on floor, balance knees on back of upper arms. Lean forward until feet lift off. Hold.',                           '1 min', NULL, NULL,  60, 'hspu_02'),
(6,  3, 'Wall Handstands',         'Kick up into a full handstand with back against wall. Arms straight, hold the position.',                                             '2 min', NULL, NULL, 120, 'hspu_03'),
(6,  4, 'Half Handstand Push-Ups', 'Handstand against wall. Bend elbows, lower head halfway to floor, push back up.',                                                    '2x20',  2, 20,  NULL, 'hspu_04'),
(6,  5, 'Handstand Push-Ups',      'Handstand against wall. Bend elbows, lower head to floor (or touch), push back to full extension.',                                   '2x15',  2, 15,  NULL, 'hspu_05'),
(6,  6, 'Close Handstand Push-Ups','Handstand against wall with hands closer together. Full head-to-floor range of motion.',                                              '2x12',  2, 12,  NULL, 'hspu_06'),
(6,  7, 'Uneven Handstand Push-Ups','Handstand against wall, one hand on a book or small platform. Full range. Alternate sides.',                                         '2x10',  2, 10,  NULL, 'hspu_07'),
(6,  8, 'Half One-Arm Handstand Push-Ups','Handstand against wall on one arm. Lower halfway, push back up. Partial range.',                                               '2x8',   2,  8,  NULL, 'hspu_08'),
(6,  9, 'Lever Handstand Push-Ups','Handstand on one hand against wall, other arm extended to the side on a ball. Full range of motion.',                                 '2x6',   2,  6,  NULL, 'hspu_09'),
(6, 10, 'One-Arm Handstand Push-Ups','Full one-arm handstand push-up against wall. Lower head to floor, push to full extension. Alternate arms.',                        '1x5',   1,  5,  NULL, 'hspu_10');
