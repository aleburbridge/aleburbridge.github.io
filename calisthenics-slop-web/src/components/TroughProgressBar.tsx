interface Props {
  value: number; // 0–1
  color?: string;
}

export function TroughProgressBar({ value, color = 'var(--red)' }: Props) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div className="trough">
      <div className="trough-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
