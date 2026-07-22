import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { SERIES_NAMES, beginnerGateDisplayString, gateDisplayString } from '../types';
import type { Progression } from '../types';

import cornerImages from 'virtual:corner-images';

export function SeriesDetailPage() {
  const { seriesId: seriesIdStr } = useParams();
  const seriesId = Number(seriesIdStr);
  const app = useApp();
  const cornerImg = useRef(cornerImages[Math.floor(Math.random() * cornerImages.length)]);

  const seriesName = SERIES_NAMES[seriesId - 1] ?? 'Unknown';
  const progressions = app.progressionsFor(seriesId);
  const currentStep = app.currentStep(seriesId);
  const bDone = app.beginnerDone(seriesId);

  useEffect(() => {
    // Update mobile header title
    const el = document.getElementById('mobile-title-slot');
    if (el) el.textContent = seriesName.toUpperCase();
    return () => { if (el) el.textContent = 'SLOP TRACKER'; };
  }, [seriesName]);

  if (progressions.length === 0) {
    return (
      <div className="page">
        <div className="page-inner">
          <span style={{ color: 'color-mix(in srgb, var(--ink) 60%, transparent)', fontSize: 'var(--fs-md)' }}>NO DATA</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner">
        {/* Desktop breadcrumb */}
        <div style={{ display: 'none' }} className="desktop-breadcrumb">
          <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>{seriesName.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {progressions.map(p => (
            <StepRow key={p.id} progression={p} currentStep={currentStep} beginnerDone={bDone} />
          ))}
        </div>
      </div>
      <img
        src={cornerImg.current}
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

function StepRow({ progression: p, currentStep, beginnerDone }: { progression: Progression; currentStep: number; beginnerDone: boolean }) {
  const inBeginner = (currentStep === 0 && p.step_number === 1) || (p.step_number === currentStep && currentStep > 0 && !beginnerDone);
  const isActive = p.step_number === currentStep && currentStep > 0 && beginnerDone;
  const isCompleted = currentStep > 0 && p.step_number < currentStep;
  const isLocked = currentStep === 0 ? p.step_number > 1 : p.step_number > currentStep;

  const statusColor = isLocked
    ? 'color-mix(in srgb, var(--ink) 30%, transparent)'
    : (inBeginner || isActive)
    ? 'var(--red)'
    : 'var(--ink)';

  const rowBg = inBeginner
    ? 'color-mix(in srgb, var(--red) 12%, var(--surface))'
    : isActive
    ? 'color-mix(in srgb, var(--red) 8%, var(--surface))'
    : 'var(--surface)';

  const indicatorBg = inBeginner
    ? 'color-mix(in srgb, var(--red) 50%, transparent)'
    : isActive
    ? 'var(--red)'
    : 'transparent';

  return (
    <Link
      to={`progression/${p.id}`}
      className={`step-row${isLocked ? ' locked' : ''}`}
      style={{ background: rowBg, opacity: isLocked ? 0.5 : 1 }}
    >
      <div className="step-row-indicator" style={{ background: indicatorBg }} />
      <div className="step-row-number" style={{ color: statusColor }}>
        {String(p.step_number).padStart(2, '0')}
      </div>
      <div className="step-row-info">
        <div className="step-row-name" style={{ color: statusColor, fontWeight: (inBeginner || isActive) ? 700 : 500 }}>
          {p.name.toUpperCase()}
        </div>
        {inBeginner ? (
          <div className="step-row-gate" style={{ color: 'color-mix(in srgb, var(--red) 80%, transparent)', fontWeight: 700 }}>
            {beginnerGateDisplayString(p)}
          </div>
        ) : !isLocked ? (
          <div className="step-row-gate" style={{ color: 'color-mix(in srgb, var(--ink) 50%, transparent)' }}>
            {gateDisplayString(p)}
          </div>
        ) : null}
      </div>
      <div className="step-row-icon">
        {isLocked && <span style={{ fontSize: 'var(--fs-md)', color: 'color-mix(in srgb, var(--ink) 45%, transparent)' }}>🔒</span>}
        {isCompleted && <span style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--ink)' }}>✓</span>}
        {inBeginner && <span style={{ fontSize: 'var(--fs-md)', color: 'color-mix(in srgb, var(--red) 85%, transparent)' }}>🔓</span>}
        {isActive && <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
      </div>
    </Link>
  );
}
