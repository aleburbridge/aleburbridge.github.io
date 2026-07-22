import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { SERIES_NAMES } from '../types';

const DISPLAY_NAMES: Record<string, string> = {
  aleburbridge:       'Alex',
  coltonwallacelaird: 'Coltan',
  ldudesbears:        'Logan',
};

interface LeaderboardEntry {
  display_name: string;
  total_score: number;
  series_1: number;
  series_2: number;
  series_3: number;
  series_4: number;
  series_5: number;
  series_6: number;
  is_current_user: boolean;
  weekly_sets: number;
}

function SeriesDots({ steps }: { steps: number[] }) {
  return (
    <div className="leaderboard-series">
      {steps.map((step, i) => {
        const mastered = step >= 10;
        const started = step > 0;
        return (
          <div
            key={i}
            className="leaderboard-dot"
            style={{
              background: mastered ? 'var(--gold)' : started ? 'var(--red)' : 'transparent',
              border: started ? 'none' : '1.5px solid color-mix(in srgb, var(--ink) 25%, transparent)',
            }}
            title={`${SERIES_NAMES[i]}: ${Math.min(step, 10)}/10`}
          />
        );
      })}
    </div>
  );
}

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    supabase.rpc('get_leaderboard').then(({ data, error }) => {
      if (error) setFailed(true);
      else if (data) setRows(data as LeaderboardEntry[]);
      setLoading(false);
    });
  }, []);

  if (failed || (!loading && rows.length === 0)) return null;

  return (
    <div>
      <div className="section-label" style={{ fontSize: 'var(--fs-md)' }}>LEADERBOARD</div>
      {loading ? (
        <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 50%, transparent)', padding: '10px 0' }}>
          Loading rankings...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => {
            const steps = [row.series_1, row.series_2, row.series_3, row.series_4, row.series_5, row.series_6];
            return (
              <div key={i} className={`leaderboard-row${row.is_current_user ? ' is-me' : ''}`}>
                <span className={`leaderboard-rank${i < 3 ? ' top3' : ''}`}>#{i + 1}</span>
                <span className="leaderboard-name">
                  {DISPLAY_NAMES[row.display_name] ?? row.display_name}
                  {row.weekly_sets > 0 && (
                    <span style={{ fontWeight: 400, color: 'color-mix(in srgb, var(--ink) 45%, transparent)', fontSize: 'var(--fs-sm)', marginLeft: 6 }}>
                      ({row.weekly_sets} set{row.weekly_sets !== 1 ? 's' : ''} this week)
                    </span>
                  )}
                </span>
                <SeriesDots steps={steps} />
                <span className="leaderboard-score">
                  {row.total_score}
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 45%, transparent)', fontWeight: 400 }}>/60</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
