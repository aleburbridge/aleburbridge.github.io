import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../AppContext';
import { SERIES_NAMES } from '../types';

const COLORS = ['#CC2200', '#FF6644', '#B8922A', '#FFCC00', '#FF8800', '#EDE0C4', '#FFFFFF'];

export function ConfettiOverlay() {
  const { justUnlocked, dismissUnlocked } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!justUnlocked || firedRef.current || !canvasRef.current) return;
    firedRef.current = true;

    const shoot = confetti.create(canvasRef.current, { resize: true });

    const burstLeft = () => shoot({
      angle: 65,
      spread: 58,
      particleCount: 130,
      origin: { x: 0, y: 0.72 },
      colors: COLORS,
      startVelocity: 65,
      gravity: 0.85,
      scalar: 1.1,
      ticks: 320,
    });

    const burstRight = () => shoot({
      angle: 115,
      spread: 58,
      particleCount: 130,
      origin: { x: 1, y: 0.72 },
      colors: COLORS,
      startVelocity: 65,
      gravity: 0.85,
      scalar: 1.1,
      ticks: 320,
    });

    const rainDown = () => shoot({
      particleCount: 80,
      spread: 120,
      origin: { x: 0.5, y: -0.05 },
      colors: COLORS,
      startVelocity: 18,
      gravity: 0.55,
      scalar: 0.95,
      drift: 0,
      ticks: 420,
    });

    // Opening volley
    burstLeft(); burstRight();
    // Second wave
    setTimeout(() => { burstLeft(); burstRight(); }, 450);
    // Rain from top
    setTimeout(rainDown, 750);
    // Third wave
    setTimeout(() => { burstLeft(); burstRight(); }, 1100);
    // Second rain
    setTimeout(rainDown, 1450);

    return () => { firedRef.current = false; };
  }, [justUnlocked]);

  if (!justUnlocked) return null;

  return (
    <>
      {/* Canvas sits above the overlay so confetti falls in front of everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 501,
        }}
      />
      <div className="confetti-overlay" onClick={dismissUnlocked}>
        <div className="confetti-unlocked">UNLOCKED</div>
        <div className="confetti-card">
          <div className="confetti-step">
            STEP {justUnlocked.step_number}: {SERIES_NAMES[justUnlocked.series_id - 1].toUpperCase()}
          </div>
          <div className="confetti-name">{justUnlocked.name.toUpperCase()}</div>
        </div>
        <img src={`${import.meta.env.BASE_URL}cathappy.gif`} alt="happy cat" className="confetti-cat" />
        <div className="confetti-tap">Tap to continue</div>
      </div>
    </>
  );
}
