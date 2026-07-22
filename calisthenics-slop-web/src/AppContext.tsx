import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Progression, UserProgressionStatus, WorkoutLog } from './types';
import { isTimedHold, isToday } from './types';

interface AppState {
  user: User | null;
  progressions: Progression[];
  userStatuses: UserProgressionStatus[];
  logs: WorkoutLog[];
  isLoadingData: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  signUpSuccess: boolean;
  justUnlocked: Progression | null;
}

interface AppActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  loadData: () => Promise<void>;
  loadLogs: (progressionId: string) => Promise<void>;
  saveWorkout: (progression: Progression, sets: number | null, reps: number | null, seconds: number | null, notes: string | null) => Promise<void>;
  dismissUnlocked: () => void;
  currentStep: (seriesId: number) => number;
  beginnerDone: (seriesId: number) => boolean;
  isMastered: (seriesId: number) => boolean;
  beginnerMetCount: (seriesId: number) => number;
  isBeginnerPhase: (p: Progression) => boolean;
  currentProgression: (seriesId: number) => Progression | undefined;
  progressionsFor: (seriesId: number) => Progression[];
}

const AppContext = createContext<AppState & AppActions>(null as never);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserProgressionStatus[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<Progression | null>(null);

  // Keep a ref for statuses so gate logic uses fresh values without stale closures
  const statusesRef = useRef(userStatuses);
  statusesRef.current = userStatuses;
  const progressionsRef = useRef(progressions);
  progressionsRef.current = progressions;
  const logsRef = useRef(logs);
  logsRef.current = logs;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setIsLoadingData(true);
    const [{ data: progs }, { data: statuses }] = await Promise.all([
      supabase.from('progressions').select('*').order('series_id').order('step_number'),
      supabase.from('user_progression_status').select('*').eq('user_id', u.id),
    ]);
    if (progs) setProgressions(progs);
    if (statuses) setUserStatuses(statuses);
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    if (user) loadData();
    else { setProgressions([]); setUserStatuses([]); setLogs([]); }
  }, [user, loadData]);

  const loadLogs = useCallback(async (progressionId: string) => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setLogs([]);
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', u.id)
      .eq('progression_id', progressionId)
      .order('logged_at', { ascending: false })
      .limit(50);
    if (data) setLogs(data);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────

  const statusFor = useCallback((seriesId: number) =>
    statusesRef.current.find(s => s.series_id === seriesId), []);

  const currentStep = useCallback((seriesId: number) =>
    statusFor(seriesId)?.current_step ?? 0, [statusFor]);

  const beginnerDone = useCallback((seriesId: number) =>
    statusFor(seriesId)?.beginner_done ?? false, [statusFor]);

  const isMastered = useCallback((seriesId: number) =>
    (statusFor(seriesId)?.current_step ?? 0) >= 11, [statusFor]);

  const beginnerMetCount = useCallback((seriesId: number) => {
    const s = statusFor(seriesId);
    if (!s) return 0;
    const raw = s.beginner_done ? s.current_step : Math.max(0, s.current_step - 1);
    return Math.min(raw, 10);
  }, [statusFor]);

  const isBeginnerPhase = useCallback((p: Progression) => {
    const step = currentStep(p.series_id);
    const done = beginnerDone(p.series_id);
    return (step === 0 && p.step_number === 1) || (step === p.step_number && !done);
  }, [currentStep, beginnerDone]);

  const currentProgression = useCallback((seriesId: number) => {
    const step = Math.min(currentStep(seriesId), 10);
    const ps = progressionsRef.current.filter(p => p.series_id === seriesId).sort((a, b) => a.step_number - b.step_number);
    if (step === 0) return ps[0];
    return ps.find(p => p.step_number === step);
  }, [currentStep]);

  const progressionsFor = useCallback((seriesId: number) =>
    progressionsRef.current.filter(p => p.series_id === seriesId).sort((a, b) => a.step_number - b.step_number),
  []);

  // ── Gate checks ────────────────────────────────────────────────

  function isBeginnerMet(p: Progression, todayLogs: WorkoutLog[]): boolean {
    if (p.beginner_seconds != null) {
      const best = Math.max(0, ...todayLogs.map(l => l.seconds_completed ?? 0));
      return best >= p.beginner_seconds;
    }
    if (p.beginner_sets != null && p.beginner_reps != null) {
      const qualifying = todayLogs.filter(l => (l.reps_completed ?? 0) >= p.beginner_reps!).length;
      return qualifying >= p.beginner_sets;
    }
    return true;
  }

  function isProgressionGateMet(p: Progression, todayLogs: WorkoutLog[]): boolean {
    if (isTimedHold(p)) {
      if (p.gate_seconds == null) return false;
      const best = Math.max(0, ...todayLogs.map(l => l.seconds_completed ?? 0));
      return best >= p.gate_seconds;
    }
    if (p.gate_sets == null || p.gate_reps == null) return false;
    const qualifying = todayLogs.filter(l => (l.reps_completed ?? 0) >= p.gate_reps!).length;
    return qualifying >= p.gate_sets;
  }

  // ── Local status updaters ──────────────────────────────────────

  function applyLocalStatus(userId: string, seriesId: number, step: number, bDone: boolean) {
    setUserStatuses(prev => {
      const idx = prev.findIndex(s => s.series_id === seriesId);
      const now = new Date().toISOString();
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], current_step: step, beginner_done: bDone, unlocked_at: now };
        return copy;
      }
      return [...prev, { id: crypto.randomUUID(), user_id: userId, series_id: seriesId, current_step: step, beginner_done: bDone, unlocked_at: now }];
    });
  }

  function applyLocalBeginnerDone(seriesId: number) {
    setUserStatuses(prev => {
      const idx = prev.findIndex(s => s.series_id === seriesId);
      if (idx < 0) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], beginner_done: true };
      return copy;
    });
  }

  // ── Save workout ───────────────────────────────────────────────

  const saveWorkout = useCallback(async (
    progression: Progression,
    sets: number | null,
    reps: number | null,
    seconds: number | null,
    notes: string | null,
  ) => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) throw new Error('Not authenticated');

    const { data: savedLog, error: logErr } = await supabase
      .from('workout_logs')
      .insert({ user_id: u.id, progression_id: progression.id, sets_completed: sets, reps_completed: reps, seconds_completed: seconds, notes: notes || null })
      .select()
      .single();
    if (logErr) throw logErr;

    setLogs(prev => [savedLog, ...prev]);

    const status = statusesRef.current.find(s => s.series_id === progression.series_id);
    const expectedStep = status == null ? 1 : status.current_step;
    if (progression.step_number !== expectedStep) return;

    // Fresh logs including the one just saved
    const allLogs = [savedLog, ...logsRef.current];
    const today = allLogs.filter(l => isToday(l.logged_at));

    if (status == null) {
      if (isBeginnerMet(progression, today)) {
        if (isProgressionGateMet(progression, today)) {
          const next = 2;
          await supabase.from('user_progression_status').upsert({ user_id: u.id, series_id: progression.series_id, current_step: next, beginner_done: false }, { onConflict: 'user_id,series_id' });
          applyLocalStatus(u.id, progression.series_id, next, false);
          setJustUnlocked(progressionsRef.current.find(p => p.series_id === progression.series_id && p.step_number === next) ?? null);
        } else {
          await supabase.from('user_progression_status').upsert({ user_id: u.id, series_id: progression.series_id, current_step: 1, beginner_done: true }, { onConflict: 'user_id,series_id' });
          applyLocalStatus(u.id, progression.series_id, 1, true);
        }
      }
    } else if (!status.beginner_done) {
      if (isBeginnerMet(progression, today)) {
        if (isProgressionGateMet(progression, today)) {
          const next = status.current_step + 1;
          if (next <= 10) {
            await supabase.from('user_progression_status').upsert({ user_id: u.id, series_id: progression.series_id, current_step: next, beginner_done: false }, { onConflict: 'user_id,series_id' });
            applyLocalStatus(u.id, progression.series_id, next, false);
            setJustUnlocked(progressionsRef.current.find(p => p.series_id === progression.series_id && p.step_number === next) ?? null);
          }
        } else {
          await supabase.from('user_progression_status').update({ beginner_done: true }).eq('user_id', u.id).eq('series_id', progression.series_id);
          applyLocalBeginnerDone(progression.series_id);
        }
      }
    } else {
      if (isProgressionGateMet(progression, today)) {
        const next = status.current_step + 1;
        if (next <= 11) {
          await supabase.from('user_progression_status').upsert({ user_id: u.id, series_id: progression.series_id, current_step: next, beginner_done: false }, { onConflict: 'user_id,series_id' });
          applyLocalStatus(u.id, progression.series_id, next, false);
          setJustUnlocked(progressionsRef.current.find(p => p.series_id === progression.series_id && p.step_number === next) ?? null);
        }
      }
    }
  }, []);

  // ── Auth ───────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    setSignUpSuccess(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoadingAuth(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); }
    else if (data.session) { /* signed in immediately */ }
    else { setSignUpSuccess(true); }
    setIsLoadingAuth(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserStatuses([]);
    setProgressions([]);
    setLogs([]);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);
  const dismissUnlocked = useCallback(() => setJustUnlocked(null), []);

  return (
    <AppContext.Provider value={{
      user, progressions, userStatuses, logs, isLoadingData, isLoadingAuth, authError, signUpSuccess, justUnlocked,
      signIn, signUp, signOut, clearAuthError, loadData, loadLogs, saveWorkout, dismissUnlocked,
      currentStep, beginnerDone, isMastered, beginnerMetCount, isBeginnerPhase, currentProgression, progressionsFor,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
