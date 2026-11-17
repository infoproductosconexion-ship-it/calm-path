import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { Play, Pause, Square, ArrowLeft, CheckCircle2, Wind, Moon, Sparkles, Heart, RotateCcw } from 'lucide-react';
import AppShell from './AppShell';
import WellnessDisclaimer from './WellnessDisclaimer';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  PRACTICES,
  PRACTICE_ALIASES,
  DURATION_OPTIONS,
  type PracticeType,
} from '../lib/practices';

const FEELINGS = ['Much calmer', 'A little better', 'About the same', 'More restless', "I'm not sure"] as const;

type Feeling = (typeof FEELINGS)[number];

interface StoredSession {
  practiceId: string;
  title: string;
  durationMinutes: number;
  feeling: Feeling | null;
  completedAt: string;
}

const SESSIONS_KEY = 'calm-path:completed-sessions';
const FAVORITES_KEY = 'calm-path:favorites';
// Pilot audio (narration and music mixed) embedded from Google Drive.
const STEADY_BREATH_AUDIO_URL = 'https://drive.google.com/file/d/1vX1LIIkqDpw71UAwulmtTFT-NtQczRL7/preview';
const STEADY_BREATH_IMAGE = 'https://placehold.co/1200x1600/718b83/e9e0c9?text=Calm+water+and+distant+misty+hills';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveCompletedSession(entry: StoredSession) {
  try {
    const list = readJson<StoredSession[]>(SESSIONS_KEY, []);
    list.unshift(entry);
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    /* storage unavailable; session state still lives in memory */
  }
}

function updateLastSessionFeeling(feeling: Feeling) {
  try {
    const list = readJson<StoredSession[]>(SESSIONS_KEY, []);
    if (list.length > 0) {
      list[0] = { ...list[0], feeling };
      window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
    }
  } catch {
    /* storage unavailable */
  }
}

const typeIcon: Record<PracticeType, ReactNode> = {
  breathing: <Wind size={18} aria-hidden="true" />,
  meditation: <Sparkles size={18} aria-hidden="true" />,
  relaxation: <Moon size={18} aria-hidden="true" />,
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function scaleForLabel(label: string, reduced: boolean) {
  const l = label.toLowerCase();
  if (reduced) return 1;
  if (l.includes('breathe') || l.includes('arrive') || l.includes('pause')) return 1.15;
  if (l.includes('rest') || l.includes('close') || l.includes('rain') || l.includes('release')) return 0.85;
  return 1;
}

type Status = 'ready' | 'running' | 'paused' | 'completed';

interface SessionStep {
  label: string;
  text: string;
  seconds: number;
}

/** Splits the total session time across the stages so the session never exceeds the selected duration. */
function distributeSeconds(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  let remainder = total - base * count;
  return Array.from({ length: count }, () => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return base + extra;
  });
}

function GuidedSessionScreen() {
  const { practiceId } = useParams<{ practiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { checkIn?: unknown; duration?: number; title?: string } | null;
  const returnState = routeState?.checkIn;
  const isSteadyBreathRoute = practiceId ? (PRACTICE_ALIASES[practiceId] ?? practiceId) === 'steady-breath' : false;
  const reducedMotion = useReducedMotion();
  const { user } = useAuth();

  const normalizedId = practiceId ? PRACTICE_ALIASES[practiceId] ?? practiceId : undefined;
  const practice = useMemo(
    () => PRACTICES.find((p) => p.id === normalizedId),
    [normalizedId],
  );

  const durationMinutes = useMemo(() => {
    const requested = routeState?.duration;
    if (DURATION_OPTIONS.includes(requested as (typeof DURATION_OPTIONS)[number])) {
      return requested as number;
    }
    // Direct opens of the three-minute Steady Breath link should stay on its pilot session.
    return isSteadyBreathRoute ? 3 : 5;
  }, [isSteadyBreathRoute, routeState]);

  const steps: SessionStep[] = useMemo(() => {
    if (!practice) return [];
    const stages = practice.stages[durationMinutes] ?? [];
    const seconds = distributeSeconds(durationMinutes * 60, stages.length);
    return stages.map((stage, index) => ({
      label: stage.label,
      text: stage.text,
      seconds: seconds[index] ?? 0,
    }));
  }, [practice, durationMinutes]);

  const totalSeconds = useMemo(
    () => steps.reduce((sum, step) => sum + step.seconds, 0),
    [steps],
  );

  const [status, setStatus] = useState<Status>('ready');
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const durationKey = `${normalizedId ?? ''}:${durationMinutes}`;
  const previousDurationKey = useRef(durationKey);
  const [confirmingExit, setConfirmingExit] = useState(false);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [savedFavorite, setSavedFavorite] = useState(false);
  const hasSavedRef = useRef(false);
  const isSteadyBreathPilot = practice?.id === 'steady-breath' && durationMinutes === 3;
  const pilotAudioStartedRef = useRef(false);

  useEffect(() => {
    if (previousDurationKey.current === durationKey) return;
    previousDurationKey.current = durationKey;
    setStatus('ready');
    setStepIndex(0);
    setSecondsLeft(totalSeconds);
    setConfirmingExit(false);
    hasSavedRef.current = false;
  }, [durationKey, totalSeconds]);
  const sessionTitle = isSteadyBreathPilot ? 'Steady Breath' : practice?.title;

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!isSteadyBreathPilot || !pilotAudioStartedRef.current || status !== 'running' || steps.length === 0) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((left) => {
        if (left <= 1) {
          window.clearInterval(interval);
          setStatus('completed');
          return 0;
        }
        return left - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status, steps.length, isSteadyBreathPilot]);

  useEffect(() => {
    if (status !== 'running' || !currentStep) return undefined;
    const elapsedBefore = steps.slice(0, stepIndex).reduce((sum, s) => sum + s.seconds, 0);
    const stepEndsAt = totalSeconds - elapsedBefore - currentStep.seconds;
    if (secondsLeft <= stepEndsAt) {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
      return undefined;
    }
    const timeout = window.setTimeout(
      () => setStepIndex((i) => Math.min(i + 1, steps.length - 1)),
      (secondsLeft - stepEndsAt) * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [status, stepIndex, secondsLeft, currentStep, steps, totalSeconds]);

  useEffect(() => {
    if (status === 'completed' && !hasSavedRef.current && practice) {
      hasSavedRef.current = true;
      saveCompletedSession({
        practiceId: practice.id,
        title: practice.title,
        durationMinutes,
        feeling: null,
        completedAt: new Date().toISOString(),
      });
      toast.success('Session complete. Nice job taking this time for yourself.');
      if (user) {
        void supabase.from('session_logs').insert({
          user_id: user.id,
          activity_slug: practice.id,
          activity_title: practice.title,
          category: practice.type,
          duration_seconds: totalSeconds,
          completed: true,
          started_at: new Date(Date.now() - totalSeconds * 1000).toISOString(),
          completed_at: new Date().toISOString(),
        });
      }
    }
  }, [status, practice, durationMinutes, totalSeconds, user]);

  if (!practice) {
    return (
      <AppShell>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <h1 className="font-serif text-2xl font-semibold text-[#24332F]">Practice not found</h1>
          <p className="text-base text-[#66736D]">
            We couldn&apos;t find that session. Let&apos;s get you to a practice that fits how you feel right now.
          </p>
          <Link
            to="/recommendation"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#2F7D68] px-6 text-base font-semibold text-white transition-colors hover:bg-[#28715c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] focus-visible:ring-offset-2"
          >
            Back to recommendations
          </Link>
        </div>
      </AppShell>
    );
  }

  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 0;
  const scale = status === 'running' && currentStep ? scaleForLabel(currentStep.label, Boolean(reducedMotion)) : 1;
  const ringTransition = { duration: reducedMotion ? 0.4 : 4, ease: 'easeInOut' as const };

  function handleStart() {
    setStatus('running');
  }

  function handlePilotAudioPlay() {
    if (!isSteadyBreathPilot || pilotAudioStartedRef.current) return;
    pilotAudioStartedRef.current = true;
    setStatus('running');
  }
  function handlePauseResume() {
    setStatus(status === 'running' ? 'paused' : 'running');
  }
  function handleExitConfirmed() {
    // Leaving early never counts as completed: nothing is saved.
    setConfirmingExit(false);
    navigate('/recommendation', { state: returnState });
  }
  function handleFeeling(next: Feeling) {
    setFeeling(next);
    updateLastSessionFeeling(next);
  }
  function handleSaveFavorite() {
    if (!practice) return;
    if (user) {
      void supabase.from('favorites').insert({
        user_id: user.id,
        activity_slug: practice.id,
        activity_title: practice.title,
        category: practice.type,
      });
    }
    try {
      const list = readJson<string[]>(FAVORITES_KEY, []);
      if (!list.includes(practice.id)) {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...list, practice.id]));
      }
    } catch {
      /* storage unavailable */
    }
    setSavedFavorite(true);
    toast.success('Saved to favorites.');
  }
  function handleRepeat() {
    pilotAudioStartedRef.current = false;
    setStatus('ready');
    setStepIndex(0);
    setSecondsLeft(totalSeconds);
    setFeeling(null);
    setSavedFavorite(false);
    hasSavedRef.current = false;
  }
  function handleBackToRecommendation() {
    navigate('/recommendation', { state: returnState });
  }

  function handlePilotEndSession() {
    // Leaving the pilot never counts as completed: nothing is saved.
    navigate('/library');
  }

  return (
    <AppShell>
      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[28px] bg-[#17221F] text-[#F4F7F3] shadow-xl sm:my-5 sm:min-h-[calc(100vh-7rem)]">
        <div className="relative min-h-[calc(100vh-9rem)] overflow-hidden sm:min-h-[calc(100vh-7rem)]">
          {isSteadyBreathPilot && (
            <>
              <img src={STEADY_BREATH_IMAGE} alt="Still water beneath distant, misty hills in warm, muted light" className="absolute inset-0 h-full w-full object-cover" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#14231f]/75 via-[#1b2b27]/35 to-[#14231f]/95" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-2xl px-4 py-5 sm:px-8 sm:py-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => (isSteadyBreathPilot ? handlePilotEndSession() : status === 'running' || status === 'paused' ? setConfirmingExit(true) : handleBackToRecommendation())}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-medium text-[#F4F7F3]/80 transition-colors hover:text-[#8CC7A5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5]"
            aria-label="Back to recommendation"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#21302B] px-3 py-1 text-xs font-medium text-[#8CC7A5]">
            {typeIcon[practice.type]}
            {practice.type === 'breathing' ? 'Breathing' : practice.type === 'meditation' ? 'Meditation' : 'Relaxation'}
            <span aria-hidden="true">·</span>
            {durationMinutes} min
          </span>
        </div>

        <div aria-live="polite" className="sr-only">
          {status === 'running' && currentStep ? `${isSteadyBreathPilot ? '' : `${currentStep.label}. ${currentStep.text} `}Time remaining ${formatTime(secondsLeft)}.` : status === 'completed' ? 'Session complete.' : ''}
        </div>

        {status !== 'completed' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="font-serif text-2xl font-semibold leading-tight text-white">{sessionTitle}</h1>
              <span className="inline-flex min-h-9 items-center rounded-full border border-white/35 bg-[#17221F]/45 px-3 text-sm font-semibold text-white">{durationMinutes} min</span>
            </div>
            {!isSteadyBreathPilot && <p className="mt-2 text-base leading-relaxed text-white/85">{practice.description}</p>}

            {!isSteadyBreathPilot && <div className="relative mx-auto my-8 flex h-64 w-64 items-center justify-center">
              {[0.55, 0.78, 1].map((factor, idx) => (
                <motion.div
                  key={idx}
                  className="absolute rounded-full border border-[#8CC7A5]/40 bg-[#8CC7A5]/10"
                  style={{ width: `${factor * 100}%`, height: `${factor * 100}%` }}
                  animate={{ scale }}
                  transition={{ ...ringTransition, delay: idx * 0.05 }}
                />
              ))}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-3xl font-semibold tabular-nums text-[#F4F7F3]">{formatTime(secondsLeft)}</span>
                <span className="mt-1 text-sm font-medium text-[#8CC7A5]">
                  {status === 'ready' ? 'Ready when you are' : status === 'paused' ? 'Paused' : currentStep?.label}
                </span>
              </div>
            </div>}

            {isSteadyBreathPilot && (
              <div className="my-5">
                <iframe
                  src={STEADY_BREATH_AUDIO_URL}
                  title="Steady Breath audio player"
                  allow="autoplay"
                  onLoad={handlePilotAudioPlay}
                  className="h-[200px] w-full rounded-2xl border-0"
                />
                <p className="mt-2 text-center text-sm text-white/80">Press play on the player to hear the audio.</p>
              </div>
            )}

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25" aria-label={`Session progress ${progressPercent}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
              <div
                className="h-full rounded-full bg-[#8CC7A5] transition-[width] duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {status !== 'ready' && currentStep && !isSteadyBreathPilot && (
              <div className="mt-5 rounded-2xl border border-white/25 bg-[#17221F]/65 p-5 text-center backdrop-blur-md" aria-label={`Stage ${stepIndex + 1} of ${steps.length}: ${currentStep.label}`}>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#F0D9A7]">{currentStep.label}</p>
                  <p className="text-sm font-medium text-white/85">Stage {stepIndex + 1} of {steps.length}</p>
                </div>
                <p className="mt-3 text-base leading-relaxed text-white">{currentStep.text}</p>
              </div>
            )}

            {practice.id === 'drift-into-sleep' && (
              <div className="mt-4 rounded-2xl border border-[#8CC7A5]/25 bg-[#21302B] p-4" aria-label="Soft Rain sound therapy placeholder">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#F4F7F3]">Soft Rain</p>
                  <span className="rounded-full bg-[#8CC7A5]/15 px-2.5 py-1 text-xs font-medium text-[#8CC7A5]">Audio coming soon</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#F4F7F3]/70">
                  A calming sound layer to support relaxation and create a steady environment for rest.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {status === 'ready' && !isSteadyBreathPilot && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#8CC7A5] px-6 text-base font-semibold text-[#17221F] transition-colors hover:bg-[#7bb996] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17221F]"
                >
                  <Play size={20} aria-hidden="true" />
                  Start session
                </button>
              )}

              {isSteadyBreathPilot && (
                <button
                  type="button"
                  onClick={handlePilotEndSession}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#F4F7F3]/30 bg-[#17221F]/45 px-4 text-base font-medium text-[#F4F7F3] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5]"
                >
                  <Square size={18} aria-hidden="true" />
                  End session
                </button>
              )}

              {(status === 'running' || status === 'paused') && !isSteadyBreathPilot && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#8CC7A5] px-4 text-base font-semibold text-[#17221F] transition-colors hover:bg-[#7bb996] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17221F]"
                  >
                    {status === 'running' ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
                    {status === 'running' ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingExit(true)}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#F4F7F3]/20 px-4 text-base font-medium text-[#F4F7F3] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5]"
                  >
                    <Square size={18} aria-hidden="true" />
                    End session
                  </button>
                </div>
              )}

              {confirmingExit && !isSteadyBreathPilot && (
                <div className="rounded-2xl border border-[#F4F7F3]/15 bg-[#21302B] p-4">
                  <p className="text-sm text-[#F4F7F3]/80">End this session early? It won&apos;t count as a completed session.</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmingExit(false)}
                      className="min-h-[44px] flex-1 rounded-lg border border-[#F4F7F3]/20 text-sm font-medium text-[#F4F7F3] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5]"
                    >
                      Keep going
                    </button>
                    <button
                      type="button"
                      onClick={handleExitConfirmed}
                      className="min-h-[44px] flex-1 rounded-lg bg-[#B94A48] text-sm font-semibold text-white transition-colors hover:bg-[#a43f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B94A48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#21302B]"
                    >
                      End session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {status === 'completed' && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-[#17221F]/70 px-6 py-10 text-center shadow-lg backdrop-blur-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8CC7A5]/20">
              <CheckCircle2 size={32} className="text-[#8CC7A5]" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#F4F7F3]">Practice complete</h1>
            <p className="text-base leading-relaxed text-[#F4F7F3]/80">
              You made space for yourself today.
            </p>
            <p className="text-sm text-[#F4F7F3]/80">
              {practice.title} · {durationMinutes} min
            </p>

            <fieldset className="mt-2 w-full text-left">
              <legend className="mb-2 text-sm font-semibold text-[#F4F7F3]">How do you feel now?</legend>
              <div className="grid gap-2">
                {FEELINGS.map((option) => {
                  const selected = feeling === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleFeeling(option)}
                      className={`flex min-h-[44px] items-center rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5] ${
                        selected
                          ? 'border-[#8CC7A5] bg-[#8CC7A5]/15 text-[#F4F7F3]'
                          : 'border-[#F4F7F3]/15 text-[#F4F7F3]/80 hover:bg-white/5'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-2 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleSaveFavorite}
                disabled={savedFavorite}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/10 px-6 text-base font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D9A7]"
              >
                <Heart size={18} aria-hidden="true" fill={savedFavorite ? 'currentColor' : 'none'} />
                {savedFavorite ? 'Saved to favorites' : 'Save to favorites'}
              </button>
              <button
                type="button"
                onClick={handleRepeat}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#D7C79C] px-6 text-base font-semibold text-[#17221F] transition-colors hover:bg-[#e5d8b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D9A7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#21302B]"
              >
                <RotateCcw size={18} aria-hidden="true" />
                Repeat this session
              </button>
              <button
                type="button"
                onClick={handleBackToRecommendation}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#F4F7F3]/20 px-6 text-base font-medium text-[#F4F7F3] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8CC7A5]"
              >
                Back to recommendation
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <WellnessDisclaimer />
        </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default GuidedSessionScreen;
