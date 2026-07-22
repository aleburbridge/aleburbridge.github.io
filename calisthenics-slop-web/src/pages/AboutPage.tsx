import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const COLORS = ['#CC2200', '#FF6644', '#B8922A', '#FFCC00', '#FF8800', '#EDE0C4', '#FFFFFF'];

function testConfetti() {
  const base = { colors: COLORS, startVelocity: 65, gravity: 0.85, scalar: 1.1, ticks: 320 };
  const left  = { ...base, angle:  65, spread: 58, particleCount: 130, origin: { x: 0, y: 0.72 } };
  const right = { ...base, angle: 115, spread: 58, particleCount: 130, origin: { x: 1, y: 0.72 } };
  const rain  = { colors: COLORS, particleCount: 80, spread: 120, origin: { x: 0.5, y: -0.05 }, startVelocity: 18, gravity: 0.55, scalar: 0.95, ticks: 420 };

  confetti(left);  confetti(right);
  setTimeout(() => { confetti(left); confetti(right); }, 450);
  setTimeout(() => confetti(rain), 750);
  setTimeout(() => { confetti(left); confetti(right); }, 1100);
  setTimeout(() => confetti(rain), 1450);
}

export function AboutPage() {
  useEffect(() => {
    const el = document.getElementById('mobile-title-slot');
    if (el) el.textContent = 'ABOUT';
    return () => { if (el) el.textContent = 'SLOP TRACKER'; };
  }, []);

  return (
    <div className="page">
      <div className="page-inner">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 4 }}>CALISTHENICS SLOP</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'color-mix(in srgb, var(--ink))' }}>WEB EDITION — 1.0</div>
        </div>

        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--ink)' }}>This app is powered by AI vibe coded slop.</p>
          <hr style={{ border: 'none', borderTop: '1px solid color-mix(in srgb, var(--ink) 20%, transparent)' }} />
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'color-mix(in srgb, var(--ink) 65%, transparent)' }}>
            BASED ON CONVICT CONDITIONING
          </div>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--ink)', lineHeight: 1.6 }}>
            This is all pretty much directly taken from the Copyrighted book by Paul Wade 'Convict Conditioning' (2011) and I am knowingly and intentionally plaigarizing that book's contents with the intention of stealing revenue from the author this is all true and legally binding and I am admitting this of my own free will.
          </p>
        </div>

        <p className="about-footer" style={{ fontWeight: 700 }}  onClick={testConfetti}>
          This is the water, and this is the well. Drink full and descend. The horse is the white of the eyes, and dark within.
        </p>

        <img src={`${import.meta.env.BASE_URL}images/corner/toji.png`} alt="" className="about-toji" onClick={testConfetti} />
      </div>
    </div>
  );
}
