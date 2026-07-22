import { Link, useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { TroughProgressBar } from './TroughProgressBar';
import { SERIES_NAMES } from '../types';

interface Props {
  seriesId: number;
  compact?: boolean;
}

export function SeriesCardLink({ seriesId, compact }: Props) {
  const app = useApp();
  const params = useParams();
  const isActive = params.seriesId === String(seriesId);

  const name = SERIES_NAMES[seriesId - 1];
  const displayStep = app.beginnerMetCount(seriesId);
  const mastered = app.isMastered(seriesId);
  const isUnstarted = displayStep === 0;
  const inBeginner = !isUnstarted && !mastered && !app.beginnerDone(seriesId);
  const currentProg = app.currentProgression(seriesId);

  //const phaseLabel = isUnstarted || mastered ? null : inBeginner ? 'BEGINNER' : 'INTERMEDIATE';

  const accentColor = mastered
    ? 'var(--gold)'
    : isUnstarted
    ? 'color-mix(in srgb, var(--ink) 30%, transparent)'
    : 'var(--red)';

  return (
    <Link
      to={`/series/${seriesId}`}
      className={`series-card${mastered ? ' mastered' : ''}${isActive ? ' sidebar-series-active' : ''}`}
    >
      <div className="series-card-body">
        <span className="series-step-count" style={{ color: accentColor }}>
          {displayStep}/10
        </span>
        <div className="series-info">
          <div className="series-name-row">
            <span className="series-name">{name.toUpperCase()}</span>
            {/* {phaseLabel && (
              <span className="phase-badge">({phaseLabel})</span>
            )} */}
          </div>
          <div className="series-prog-name" style={{ color: isUnstarted ? 'color-mix(in srgb, var(--ink) 40%, transparent)' : 'var(--ink)' }}>
            {currentProg?.name ?? '—'}
          </div>
          {isUnstarted && !compact && (
            <div className="series-unlock-hint">BEGINNER UNLOCK REQUIRED</div>
          )}
        </div>
      </div>
      <div className="series-card-trough">
        <TroughProgressBar value={displayStep / 10} color={accentColor} />
      </div>
    </Link>
  );
}
