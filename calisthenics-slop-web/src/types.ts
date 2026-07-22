export interface Progression {
  id: string;
  series_id: number;
  step_number: number;
  name: string;
  description: string;
  gate_value: string;
  gate_sets: number | null;
  gate_reps: number | null;
  gate_seconds: number | null;
  image_asset_name: string;
  beginner_sets: number | null;
  beginner_reps: number | null;
  beginner_seconds: number | null;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  progression_id: string;
  logged_at: string;
  sets_completed: number | null;
  reps_completed: number | null;
  seconds_completed: number | null;
  notes: string | null;
}

export interface UserProgressionStatus {
  id: string;
  user_id: string;
  series_id: number;
  current_step: number;
  beginner_done: boolean;
  unlocked_at: string;
}

export const SERIES_NAMES = ['Push-ups', 'Squats', 'Pull-ups', 'Leg Raises', 'Bridges', 'HS Push-ups'];

export const LOADING_MESSAGES = [
  'Sloppin it up...',
  'Getting sloppy...',
  'Assembling the slop...',
  'Ladling your gains...',
  'Warming up the trough...',
  'Nutritional content: unknown...',
  'Slopping with purpose...',
  "Today's slop is almost ready...",
  'Preparing your daily portion...',
  'The slop does not wait...',
];

export function gateDisplayString(p: Progression): string {
  if (p.gate_seconds != null) return formatSecondsGoal(p.gate_seconds, 'GOAL');
  if (p.gate_sets != null && p.gate_reps != null) return `GOAL: ${p.gate_sets}×${p.gate_reps}`;
  return p.gate_value;
}

export function beginnerGateDisplayString(p: Progression): string {
  if (p.beginner_seconds != null) return formatSecondsGoal(p.beginner_seconds, 'UNLOCK');
  if (p.beginner_sets != null && p.beginner_reps != null) return `UNLOCK: ${p.beginner_sets}×${p.beginner_reps}`;
  return 'UNLOCK';
}

function formatSecondsGoal(seconds: number, prefix: string): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${prefix}: ${m}M ${s}S HOLD`;
  if (m > 0) return `${prefix}: ${m} MIN HOLD`;
  return `${prefix}: ${seconds}S HOLD`;
}

export function isTimedHold(p: Progression): boolean {
  return p.gate_seconds != null;
}

export function logDisplayString(log: WorkoutLog): string {
  if (log.seconds_completed != null) {
    const m = Math.floor(log.seconds_completed / 60);
    const s = log.seconds_completed % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${log.seconds_completed}s`;
  }
  if (log.reps_completed != null) {
    if (log.sets_completed != null && log.sets_completed > 1) {
      return `${log.sets_completed} × ${log.reps_completed} reps`;
    }
    return `${log.reps_completed} reps`;
  }
  return '—';
}

// Returns the recommended reps/seconds for the next session: last value +30%, capped at the gate.
export function calcRecommended(lastValue: number, gateValue: number): number {
  return Math.min(Math.ceil(lastValue * 1.3), gateValue);
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}
