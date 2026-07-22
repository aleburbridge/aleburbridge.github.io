import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { logDisplayString } from '../types';
import type { WorkoutLog } from '../types';

export function CalendarHistoryPage() {
  const { progressionId } = useParams();
  const app = useApp();

  const progression = app.progressions.find(p => p.id === progressionId);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (progression) app.loadLogs(progression.id);
  }, [progression?.id]);

  useEffect(() => {
    if (!progression) return;
    const el = document.getElementById('mobile-title-slot');
    if (el) el.textContent = `${progression.name.toUpperCase()} HISTORY`;
    return () => { if (el) el.textContent = 'SLOP TRACKER'; };
  }, [progression]);

  // Build a map: "YYYY-MM-DD" -> WorkoutLog[]
  const logsByDay: Record<string, WorkoutLog[]> = {};
  for (const log of app.logs) {
    const d = new Date(log.logged_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!logsByDay[key]) logsByDay[key] = [];
    logsByDay[key].push(log);
  }

  // Days in month grid (Mon-first, nullable padding)
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDay + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTitle = displayedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  function advanceMonth(delta: number) {
    setDisplayedMonth(new Date(year, month + delta, 1));
    setSelectedDate(null);
  }

  function dayKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  const selectedLogs = selectedDate ? (logsByDay[selectedDate] ?? []) : [];

  return (
    <div className="page">
      <div className="page-inner">
        {/* Month nav */}
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => advanceMonth(-1)}>‹</button>
          <span className="cal-month">{monthTitle}</span>
          <button className="icon-btn" onClick={() => advanceMonth(1)}>›</button>
        </div>

        {/* Day headers */}
        <div className="cal-day-headers" style={{ marginTop: 0 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="cal-day-header">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="cal-cell empty" />;
            const key = dayKey(day);
            const hasLog = !!(logsByDay[key]?.length);
            const isSelected = selectedDate === key;
            const isToday = key === todayKey;
            return (
              <div
                key={i}
                className={`cal-cell${isSelected ? ' selected' : ''}`}
                onClick={() => {
                  if (hasLog) setSelectedDate(isSelected ? null : key);
                }}
              >
                <span className={`cal-day-num${isToday ? ' today' : ''}`}>{day}</span>
                {hasLog ? <span className="cal-dot" /> : <span style={{ height: 5 }} />}
              </div>
            );
          })}
        </div>

        {/* Selected logs */}
        {selectedDate && selectedLogs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="section-label">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedLogs.map(log => (
                <div key={log.id} className="log-row">
                  <span className="log-row-val">{logDisplayString(log)}</span>
                  {log.notes && <span className="log-row-note">{log.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
