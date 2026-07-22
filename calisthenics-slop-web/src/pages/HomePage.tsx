import { useApp } from '../AppContext';
import { SeriesCardLink } from '../components/SeriesCardLink';
import { Leaderboard } from '../components/Leaderboard';
import { TodayWorkout } from '../components/TodayWorkout';
import { LOADING_MESSAGES } from '../types';
import { useState } from 'react';

export function HomePage() {
  const app = useApp();
  const [loadMsg] = useState(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

  if (app.isLoadingData && app.progressions.length === 0) {
    return (
      <div className="loading-screen" style={{ minHeight: 'calc(100vh - 52px)', flex: 1 }}>
        <span className="loading-text">{loadMsg.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner" style={{ maxWidth: 900, width: '100%' }}>
        <TodayWorkout />
        <div className="home-grid">
          {[1, 2, 3, 4, 5, 6].map(id => (
            <SeriesCardLink key={id} seriesId={id} />
          ))}
        </div>
        <Leaderboard />
      </div>
      <img
        src={`${import.meta.env.BASE_URL}images/Itadori.Yuuji.600.3250261.png`}
        alt=""
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          height: 320,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}
