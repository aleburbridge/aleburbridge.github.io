import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useApp } from '../AppContext';
import { calcRecommended, isTimedHold, SERIES_NAMES } from '../types';
import type { Progression } from '../types';

interface Rec {
  seriesId: number;
  progression: Progression;
  reps: number | null;   // null when no previous log exists yet
  secs: number | null;
  pctChange: number | null; // % change from last session, null if no prior log
}

export function TodayWorkout() {
  const app = useApp();
  const [rec, setRec] = useState<Rec | null>(null);

  useEffect(() => {
    if (app.progressions.length === 0) return;

    async function load() {
      // 1. Find the most recently worked series
      const { data: lastLogs } = await supabase
        .from('workout_logs')
        .select('logged_at, progressions(series_id)')
        .order('logged_at', { ascending: false })
        .limit(1);

      if (!lastLogs || lastLogs.length === 0) return;

      const lastEntry = lastLogs[0] as unknown as { logged_at: string; progressions: { series_id: number } | null };
      const lastSeriesId = lastEntry.progressions?.series_id;
      if (!lastSeriesId) return;

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      // 2. Check if the last-worked series is still in progress today
      //    (i.e. has today's logs but hasn't hit gate_sets yet)
      const lastProgression = app.currentProgression(lastSeriesId);
      let seriesIsCompleteOrOldDay = true;

      if (lastProgression && !app.isMastered(lastSeriesId)) {
        const { data: todayLogsForLast } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('progression_id', lastProgression.id)
          .gte('logged_at', todayMidnight.toISOString());

        const todayCount = todayLogsForLast?.length ?? 0;
        const gateSets = lastProgression.gate_sets ?? 3;

        if (todayCount > 0 && todayCount < gateSets) {
          // In progress today — keep showing the same series
          seriesIsCompleteOrOldDay = false;
        }
      }

      // 3. Determine which series to show
      const targetSeriesId = seriesIsCompleteOrOldDay
        ? (lastSeriesId % 6) + 1   // rotate to next
        : lastSeriesId;            // stay on current

      const targetProgression = app.currentProgression(targetSeriesId);
      if (!targetProgression) return;
      if (app.isMastered(targetSeriesId)) return;

      // 4. Get the last log for that progression from any previous day
      const { data: prevLogs } = await supabase
        .from('workout_logs')
        .select('reps_completed, seconds_completed')
        .eq('progression_id', targetProgression.id)
        .lt('logged_at', todayMidnight.toISOString())
        .order('logged_at', { ascending: false })
        .limit(1);

      const prevLog = prevLogs?.[0] ?? null;

      // 5. Compute recommendation and % change
      let reps: number | null = null;
      let secs: number | null = null;
      let pctChange: number | null = null;

      if (isTimedHold(targetProgression)) {
        const gate = targetProgression.gate_seconds;
        if (gate != null) {
          const prev = prevLog?.seconds_completed ?? null;
          secs = prev ? calcRecommended(prev, gate) : (targetProgression.beginner_seconds ?? gate);
          if (prev && secs) pctChange = Math.round(((secs - prev) / prev) * 100);
        }
      } else {
        const gate = targetProgression.gate_reps;
        if (gate != null) {
          const prev = prevLog?.reps_completed ?? null;
          reps = prev ? calcRecommended(prev, gate) : (targetProgression.beginner_reps ?? gate);
          if (prev && reps) pctChange = Math.round(((reps - prev) / prev) * 100);
        }
      }

      setRec({ seriesId: targetSeriesId, progression: targetProgression, reps, secs, pctChange });
    }

    load();
  }, [app.progressions]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rec) return null;

  const seriesName = SERIES_NAMES[rec.seriesId - 1];
  const pctLabel = rec.pctChange != null
    ? `${rec.pctChange > 0 ? '+' : ''}${rec.pctChange}% from last session`
    : null;

  return (
    <Link
      to={`/series/${rec.seriesId}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background: 'var(--ink)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--gold)', marginBottom: 3 }}>
            TODAY'S WORKOUT
          </div>
          <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--bg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {rec.progression.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--bg) 60%, transparent)', marginTop: 2 }}>
            {seriesName.toUpperCase()} · STEP {rec.progression.step_number}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--bg)', lineHeight: 1 }}>
            {rec.secs != null ? `3 × ${rec.secs}S` : `3 × ${rec.reps}`}
          </div>
          {pctLabel && (
            <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--gold) 80%, transparent)', marginTop: 3 }}>
              {pctLabel}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
