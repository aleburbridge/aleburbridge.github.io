import { useEffect, useRef, useState } from 'react';
import { useApp } from '../AppContext';
import type { Progression } from '../types';
import { beginnerGateDisplayString, calcRecommended, gateDisplayString, isTimedHold, isToday } from '../types';

interface Props {
  progression: Progression;
  onClose: () => void;
}

export function LogWorkoutModal({ progression, onClose }: Props) {
  const app = useApp();

  const inBeginner = app.isBeginnerPhase(progression);
  const step = app.currentStep(progression.series_id);
  const isLocked = step === 0 ? progression.step_number > 1 : progression.step_number > step;

  const modeLabel = isLocked ? 'PRACTICE LOG' : inBeginner ? 'BEGINNER UNLOCK' : 'LOG WORKOUT';
  const saveLabel = isLocked ? 'SAVE PRACTICE LOG' : inBeginner ? 'ATTEMPT UNLOCK' : 'SAVE';

  // ── Recommendation ────────────────────────────────────────────────
  // Most recent log from a previous day (not today)
  const lastPrevLog = app.logs.find(l => !isToday(l.logged_at));
  const isMastered = app.isMastered(progression.series_id);

  const recReps = (() => {
    if (isMastered || isTimedHold(progression) || !lastPrevLog?.reps_completed) return null;
    const gate = inBeginner ? progression.beginner_reps : progression.gate_reps;
    if (!gate) return null;
    return calcRecommended(lastPrevLog.reps_completed, gate);
  })();

  const recSecs = (() => {
    if (isMastered || !isTimedHold(progression) || !lastPrevLog?.seconds_completed) return null;
    const gate = inBeginner ? progression.beginner_seconds : progression.gate_seconds;
    if (!gate) return null;
    return calcRecommended(lastPrevLog.seconds_completed, gate);
  })();

  // ── Reps ──────────────────────────────────────────────────────────
  const [reps, setReps] = useState(1);
  const [repsTouched, setRepsTouched] = useState(false);

  // Seed slider to last set's reps once logs arrive (only if user hasn't touched slider)
  const lastLogReps = app.logs[0]?.reps_completed ?? null;
  useEffect(() => {
    if (repsTouched || lastLogReps == null) return;
    setReps(lastLogReps);
  }, [lastLogReps]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer ─────────────────────────────────────────────────────────
  const [accumulated, setAccumulated] = useState(0);
  const [running, setRunning] = useState(false);
  const [manualSecs, setManualSecs] = useState('');
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [displaySecs, setDisplaySecs] = useState(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      setDisplaySecs(accumulated + Math.floor((Date.now() - startRef.current) / 1000));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, accumulated]);

  const currentSeconds = running
    ? accumulated + Math.floor((Date.now() - startRef.current) / 1000)
    : accumulated;

  function startTimer() { startRef.current = Date.now(); setRunning(true); }
  function pauseTimer() {
    if (!running) return;
    setAccumulated(a => a + Math.floor((Date.now() - startRef.current) / 1000));
    setRunning(false);
  }
  function resetTimer() {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setAccumulated(0);
    setDisplaySecs(0);
    setManualSecs('');
  }

  const timerSecs = isTimedHold(progression) ? currentSeconds : displaySecs;
  const mm = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const ss = String(timerSecs % 60).padStart(2, '0');

  // ── Save ──────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (isTimedHold(progression)) {
        pauseTimer();
        await app.saveWorkout(progression, null, null, accumulated + (running ? Math.floor((Date.now() - startRef.current) / 1000) : 0), null);
      } else {
        await app.saveWorkout(progression, 1, reps, null, null);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    setSaving(false);
  }

  // ── Gate hint ─────────────────────────────────────────────────────
  const targetSets = inBeginner ? progression.beginner_sets : progression.gate_sets;
  const targetReps = inBeginner ? progression.beginner_reps : progression.gate_reps;
  const targetSecs = inBeginner ? progression.beginner_seconds : progression.gate_seconds;

  const repsMet = targetReps != null && reps >= targetReps;
  const secsMet = targetSecs != null && currentSeconds >= targetSecs;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">LOG</span>
          <button
            style={{ fontFamily: 'var(--mono)', fontSize: 'var(--fs-sm)', color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={onClose}
          >
            CANCEL
          </button>
        </div>

        {/* Title block */}
        <div style={{
          background: inBeginner ? 'color-mix(in srgb, var(--red) 8%, var(--surface))' : 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: 16,
          margin: 16,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: isLocked ? 'color-mix(in srgb, var(--ink) 55%, transparent)' : inBeginner ? 'var(--red)' : 'color-mix(in srgb, var(--ink) 65%, transparent)' }}>
              {modeLabel}
            </span>
            {isLocked && (
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, background: 'color-mix(in srgb, var(--ink) 65%, transparent)', color: 'var(--bg)', borderRadius: 4, padding: '3px 6px' }}>
                LOCKED
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: isLocked ? 'color-mix(in srgb, var(--ink) 65%, transparent)' : 'var(--ink)' }}>
            {progression.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: isLocked ? 'color-mix(in srgb, var(--ink) 60%, transparent)' : 'var(--red)', marginTop: 4 }}>
            {inBeginner ? beginnerGateDisplayString(progression) : gateDisplayString(progression)}
          </div>
        </div>

        {/* Input */}
        {isTimedHold(progression) ? (
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="stopwatch-display" style={{ color: running ? 'var(--red)' : 'var(--ink)' }}>
                {mm}:{ss}
              </div>
              <div className="stopwatch-controls" style={{ marginTop: 8 }}>
                <button
                  className="stopwatch-btn stopwatch-btn-main"
                  style={{ background: running ? 'var(--ink)' : 'var(--red)' }}
                  onClick={() => running ? pauseTimer() : startTimer()}
                >
                  {running ? 'STOP' : accumulated > 0 ? 'RESUME' : 'START'}
                </button>
                <div style={{ width: 1.5, background: 'var(--ink)', flexShrink: 0 }} />
                <button className="stopwatch-btn stopwatch-btn-reset" onClick={resetTimer}>RESET</button>
              </div>
            </div>

            {recSecs != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'color-mix(in srgb, var(--gold) 18%, var(--surface))', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--gold)', fontWeight: 700 }}>REC</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink)' }}>
                  {recSecs}S HOLD — +30% from last session
                </span>
              </div>
            )}

            <div>
              <label className="field-label">OR ENTER SECONDS MANUALLY</label>
              <input
                className="field-input"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 120"
                value={manualSecs}
                onChange={e => {
                  setManualSecs(e.target.value);
                  const n = parseInt(e.target.value);
                  if (!isNaN(n)) setAccumulated(n);
                }}
              />
            </div>

            {!isLocked && targetSecs != null && (
              <div className="gate-hint">
                <div className="gate-hint-bar" style={{ background: secsMet ? 'var(--red)' : 'color-mix(in srgb, var(--ink) 20%, transparent)' }} />
                <div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 75%, transparent)' }}>
                    {inBeginner ? 'UNLOCK' : 'TARGET'}: {targetSecs}S HOLD
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: secsMet ? 'var(--red)' : 'color-mix(in srgb, var(--ink) 60%, transparent)' }}>
                    {secsMet ? (inBeginner ? 'BEGINNER STANDARD MET' : 'PROGRESSION STANDARD MET') : `${targetSecs - currentSeconds}S TO GO`}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>REPS — THIS SET</span>
                <span className="rep-display">{reps}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={reps}
                onChange={e => { setRepsTouched(true); setReps(Number(e.target.value)); }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 55%, transparent)' }}>1</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 55%, transparent)' }}>50</span>
              </div>
            </div>

            {recReps != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'color-mix(in srgb, var(--gold) 18%, var(--surface))', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--gold)', fontWeight: 700 }}>REC</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink)' }}>
                  {recReps} REPS — +30% from last session
                </span>
              </div>
            )}

            {!isLocked && targetSets != null && targetReps != null && (
              <div className="gate-hint">
                <div className="gate-hint-bar" style={{ background: repsMet ? 'var(--red)' : 'color-mix(in srgb, var(--ink) 20%, transparent)' }} />
                <div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink) 75%, transparent)' }}>
                    {inBeginner ? 'UNLOCK' : 'TARGET'}: {targetReps} REPS/SET — NEED {targetSets} SETS TODAY
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: repsMet ? 'var(--red)' : 'color-mix(in srgb, var(--ink) 60%, transparent)' }}>
                    {repsMet ? 'THIS SET QUALIFIES' : `${targetReps - reps} REPS TO QUALIFY`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isLocked && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '12px 16px 0', color: 'color-mix(in srgb, var(--ink) 55%, transparent)', fontSize: 'var(--fs-sm)' }}>
            <span>🔒</span>
            <span>PRACTICE LOG — UNLOCK BY COMPLETING YOUR CURRENT STEP FIRST</span>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--red)', fontSize: 'var(--fs-sm)', padding: '12px 16px 0' }}>
            {error.toUpperCase()}
          </div>
        )}

        <div style={{ padding: '24px 16px 0' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'SAVING...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
