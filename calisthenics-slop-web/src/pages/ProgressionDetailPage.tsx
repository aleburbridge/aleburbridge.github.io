import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { LogWorkoutModal } from '../components/LogWorkoutModal';
import { beginnerGateDisplayString, gateDisplayString, logDisplayString, SERIES_NAMES } from '../types';

export function ProgressionDetailPage() {
  const { seriesId: seriesIdStr, progressionId } = useParams();
  const seriesId = Number(seriesIdStr);
  const app = useApp();
  const navigate = useNavigate();

  const progression = app.progressions.find(p => p.id === progressionId);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    if (!progression) return;
    const el = document.getElementById('mobile-title-slot');
    if (el) el.textContent = SERIES_NAMES[progression.series_id - 1].toUpperCase();
    return () => { if (el) el.textContent = 'SLOP TRACKER'; };
  }, [progression]);

  useEffect(() => {
    if (progression) app.loadLogs(progression.id);
  }, [progression?.id]);

  if (!progression) {
    return (
      <div className="page">
        <div className="page-inner">
          <span style={{ color: 'color-mix(in srgb, var(--ink) 40%, transparent)' }}>PROGRESSION NOT FOUND</span>
        </div>
      </div>
    );
  }

  const inBeginner = app.isBeginnerPhase(progression);
  const recentLogs = app.logs.slice(0, 5);

  return (
    <div className="page">
      <div className="page-inner">
        {/* Mobile back */}
        <div style={{ display: 'none' }} id="back-slot">
          <Link to={`/series/${seriesId}`} className="icon-btn">←</Link>
        </div>

        {/* Title block */}
        <div style={{
          background: inBeginner ? 'color-mix(in srgb, var(--red) 8%, var(--surface))' : 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: 16,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span className="prog-step-label" style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--red)' }}>STEP {progression.step_number}</span>
            {inBeginner && (
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, background: 'color-mix(in srgb, var(--red) 80%, transparent)', color: 'var(--bg)', borderRadius: 4, padding: '3px 6px' }}>
                BEGINNER UNLOCK
              </span>
            )}
          </div>
          <h1 className="prog-title" style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
            {progression.name.toUpperCase()}
          </h1>
          <div className="prog-gate-text" style={{ fontSize: 'var(--fs-md)', color: inBeginner ? 'var(--red)' : 'var(--ink)' }}>
            {inBeginner ? beginnerGateDisplayString(progression) : gateDisplayString(progression)}
          </div>
        </div>

        {/* Image */}
        <div className="prog-image-wrap">
          <img
            src={`${import.meta.env.BASE_URL}images/exercises/${progression.image_asset_name}.png`}
            alt={progression.name}
            className="prog-image"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Description */}
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label">DESCRIPTION</div>
          <p className="prog-desc-text" style={{ fontSize: 'var(--fs-md)', lineHeight: 1.7, color: 'var(--ink)' }}>{progression.description}</p>
        </div>

        {/* Gate info */}
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label prog-gate-label">{inBeginner ? 'BEGINNER STANDARD' : 'PROGRESSION GATE'}</div>
          <div className="prog-gate-val" style={{ fontSize: 'var(--fs-md)', color: inBeginner ? 'var(--red)' : 'var(--ink)', fontWeight: 700 }}>
            {inBeginner ? beginnerGateDisplayString(progression) : gateDisplayString(progression)}
          </div>
          {inBeginner && (
            <div className="prog-gate-hint" style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 55%, transparent)', marginTop: 4 }}>
              THEN: {gateDisplayString(progression)} TO ADVANCE
            </div>
          )}
        </div>

        {/* Recent sessions */}
        {recentLogs.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>RECENT SESSIONS</div>
              <Link
                to={`history`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--ink)' }}
              >
                📅 HISTORY
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentLogs.map(log => (
                <div key={log.id} className="log-row">
                  <span className="log-row-date">
                    {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </span>
                  <span className="log-row-val">{logDisplayString(log)}</span>
                  {log.notes && <span className="log-row-note">{log.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Link
            to={`history`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--ink)' }}
          >
            📅 VIEW HISTORY
          </Link>
        )}

        {/* Log button */}
        <button
          className="btn btn-danger"
          style={{ marginTop: 8, marginBottom: 16 }}
          onClick={() => setShowLog(true)}
        >
          LOG WORKOUT
        </button>
      </div>

      {showLog && (
        <LogWorkoutModal
          progression={progression}
          onClose={() => setShowLog(false)}
        />
      )}
    </div>
  );
}
