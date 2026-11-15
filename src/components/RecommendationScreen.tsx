import { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Wind, Brain, Moon, Clock, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import AppShell from './AppShell';
import WellnessDisclaimer from './WellnessDisclaimer';

/** Shape of the data the Check-in screen may hand off via router state. */
interface CheckInState {
  mood?: string;
  energy?: string;
  sleepNeed?: string;
  minutes?: number | string;
  goal?: string;
}

type Category = 'Breathing' | 'Meditation' | 'Relaxation';

interface Practice {
  id: string;
  title: string;
  category: Category;
  duration: number;
  moodTags: string[];
  goalTags: string[];
  energyTags: string[];
  sleepTags: string[];
  description: string;
  reason: (state?: CheckInState) => string;
}

const INTENTION_TO_PRACTICE: Record<string, string> = {
  'calm-mind': 'steady-breath',
  'release-tension': 'release-relax',
  'slow-thoughts': 'quiet-the-loop',
  'prepare-sleep': 'drift-into-sleep',
  'short-pause': 'focused-pause',
};

const DURATION_OPTIONS = [3, 5, 10, 15] as const;

const ALTERNATIVE_IDS: Record<string, string[]> = {
  'calm-mind': ['gentle-unwind', 'focused-pause'],
  'release-tension': ['gentle-unwind'],
  'slow-thoughts': ['steady-breath', 'gentle-unwind'],
  'prepare-sleep': ['gentle-unwind'],
  'short-pause': ['gentle-unwind', 'steady-breath'],
};

function selectedDuration(state?: CheckInState): number {
  const parsed = typeof state?.minutes === 'string' ? Number(state.minutes) : state?.minutes;
  return DURATION_OPTIONS.includes(parsed as (typeof DURATION_OPTIONS)[number]) ? parsed as number : 3;
}

const CATEGORY_ICON: Record<Category, typeof Wind> = {
  Breathing: Wind,
  Meditation: Brain,
  Relaxation: Moon,
};

/** Small, self-contained practice library used to power the recommendation. */
const PRACTICES: Practice[] = [
  {
    id: 'steady-breath',
    title: 'Steady Breath',
    category: 'Breathing',
    duration: 3,
    moodTags: ['anxious', 'stressed', 'overwhelmed'],
    goalTags: ['calm-mind', 'short-pause'],
    energyTags: ['wired', 'steady'],
    sleepTags: ['none'],
    description:
      'A gentle breathing practice to help you slow down and create a little more space in your mind.',
    reason: (state) =>
      `Because you are feeling ${state?.mood ?? 'tense'} and want to ${state?.goal?.replaceAll('-', ' ') ?? 'feel calmer'}, this short breathing pattern gives you a steady reset.`,
  },
  {
    id: 'release-relax',
    title: 'Release & Relax',
    category: 'Relaxation',
    duration: 10,
    moodTags: ['stressed', 'overwhelmed', 'restless'],
    goalTags: ['release-tension', 'short-pause'],
    energyTags: ['steady', 'low'],
    sleepTags: ['none', 'tired'],
    description:
      'A body-based practice to help you notice tension and invite more ease.',
    reason: (state) =>
      `Your goal to ${state?.goal?.replaceAll('-', ' ') ?? 'release tension'} and ${state?.mood ?? 'tension'} make a body-based release a fitting next step.`,
  },
  {
    id: 'quiet-the-loop',
    title: 'Quiet the Loop',
    category: 'Meditation',
    duration: 5,
    moodTags: ['restless', 'anxious', 'stressed', 'overwhelmed'],
    goalTags: ['slow-thoughts', 'calm-mind'],
    energyTags: ['wired', 'steady'],
    sleepTags: ['none'],
    description:
      'A gentle practice for creating distance from busy or repetitive thoughts.',
    reason: (state) =>
      `Because you want to slow racing thoughts while feeling ${state?.mood ?? 'overwhelmed'}, this guided pause creates space without asking you to solve everything.`,
  },
  {
    id: 'gentle-unwind',
    title: 'Gentle Unwind',
    category: 'Breathing',
    duration: 5,
    moodTags: ['low', 'calm', 'stressed'],
    goalTags: ['short-pause', 'calm-mind'],
    energyTags: ['low', 'steady'],
    sleepTags: ['tired', 'none'],
    description:
      'A low-effort practice for gradually transitioning from activity toward rest.',
    reason: (state) =>
      `A gentle breath fits your ${state?.goal?.replaceAll('-', ' ') ?? 'short pause'} and the ${state?.energy ?? 'steady'} pace you described.`,
  },
  {
    id: 'drift-into-sleep',
    title: 'Drift Into Sleep',
    category: 'Relaxation',
    duration: 10,
    moodTags: ['tired', 'anxious', 'overwhelmed', 'restless'],
    goalTags: ['prepare-sleep'],
    energyTags: ['low', 'steady'],
    sleepTags: ['falling', 'waking', 'tired'],
    description:
      'A quiet practice to help your body and mind prepare for rest.',
    reason: (state) =>
      `Preparing for sleep while feeling ${state?.mood ?? 'restless'} calls for a quiet wind-down that matches your available time.`,
  },
  {
    id: 'focused-pause',
    title: 'Focused Pause',
    category: 'Meditation',
    duration: 3,
    moodTags: ['overwhelmed', 'stressed', 'low', 'calm'],
    goalTags: ['short-pause', 'calm-mind'],
    energyTags: ['low', 'steady'],
    sleepTags: ['none'],
    description:
      'A short reset to help you pause and return your attention to the present moment.',
    reason: (state) =>
      `A short grounding moment can meet your need to ${state?.goal?.replaceAll('-', ' ') ?? 'pause'} while you feel ${state?.mood ?? 'overwhelmed'}.`,
  },
];

/** Picks the practice that best fits the mood and the time available. */
function withSelectedDuration(practice: Practice, duration: number): Practice {
  return { ...practice, duration };
}

function pickPractice(state: CheckInState | undefined): Practice {
  const selectedId = INTENTION_TO_PRACTICE[state?.goal ?? ''] ?? 'steady-breath';
  const duration = selectedDuration(state);
  return withSelectedDuration(
    PRACTICES.find((practice) => practice.id === selectedId) ?? PRACTICES[0],
    duration,
  );
}

/** Refines the explanation with the energy and sleep answers, without replacing the primary practice. */
function buildReason(practice: Practice, state?: CheckInState): string {
  const parts: string[] = [practice.reason(state)];
  if (state?.energy === 'very-low' || state?.energy === 'tired') {
    parts.push('It is gentle and low-effort, so it can match your energy today.');
  }
  if (state?.mood === 'tired' || ['falling', 'waking', 'tired'].includes(state?.sleepNeed ?? '')) {
    parts.push('Its quiet pace can also support winding down toward rest.');
  }
  if (state?.energy === 'restless' && ['steady-breath', 'release-relax', 'focused-pause'].includes(practice.id)) {
    parts.push('It can also be a suitable fit for restless energy.');
  }
  return parts.join(' ');
}

function isSleepCompatible(practice: Practice, state?: CheckInState): boolean {
  const sleepNeed = state?.sleepNeed;
  if (!sleepNeed || sleepNeed === 'none') return true;
  return practice.sleepTags.includes(sleepNeed) || practice.id === 'gentle-unwind';
}

function getAlternativePractice(state: CheckInState | undefined, primary: Practice): Practice {
  const duration = selectedDuration(state);
  const candidates = ALTERNATIVE_IDS[state?.goal ?? ''] ?? [];
  const alternative = candidates
    .map((id) => PRACTICES.find((practice) => practice.id === id))
    .find((practice): practice is Practice => Boolean(practice) && practice.id !== primary.id && isSleepCompatible(practice, state));

  return alternative ? withSelectedDuration(alternative, duration) : primary;
}

export default function RecommendationScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const rawState = location.state as (CheckInState & { checkIn?: CheckInState }) | null;
  const checkInState = rawState?.checkIn ?? rawState ?? undefined;
  const hasCheckInData = Boolean(checkInState?.goal && checkInState?.minutes !== undefined && checkInState?.mood);

  const practice = useMemo(() => pickPractice(checkInState), [checkInState]);
  const [showAlternative, setShowAlternative] = useState(false);
  const displayedPractice = showAlternative
    ? getAlternativePractice(checkInState, practice)
    : practice;

  const CategoryIcon = CATEGORY_ICON[displayedPractice.category];

  const handleTryAnother = () => {
    setShowAlternative((current) => !current);
  };

  const handleStart = () => {
    navigate(`/session/${displayedPractice.id}`, {
      state: {
        title: displayedPractice.title,
        category: displayedPractice.category,
        duration: displayedPractice.duration,
        checkIn: checkInState,
        returnTo: '/recommendation',
      },
    });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-8">
        <Link
          to="/check-in"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full -ml-3 px-3 text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to check-in
        </Link>

        {!hasCheckInData && (
          <div className="mt-4 rounded-[24px] border border-line bg-surface px-5 py-4 text-sm text-muted">
            We don't have your check-in answers yet, so here is a general suggestion.{' '}
            <Link
              to="/check-in"
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              Complete the check-in
            </Link>{' '}
            for something tailored to you.
          </div>
        )}

        <section
          aria-labelledby="recommendation-heading"
          className="mt-6 flex flex-col items-center text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Your recommended practice
          </p>

          {/* Signature layered breath-ring visual */}
          <div className="relative mt-6 flex h-44 w-44 items-center justify-center" aria-hidden="true">
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute rounded-full border border-accent/40"
                style={{
                  width: `${100 + ring * 28}px`,
                  height: `${100 + ring * 28}px`,
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: [1, 1.08, 1],
                        opacity: [0.5, 0.9, 0.5],
                      }
                }
                transition={{
                  duration: 4 + ring,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: ring * 0.3,
                }}
              />
            ))}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-elevated shadow-sm">
              <CategoryIcon className="h-9 w-9 text-brand-ink" aria-hidden="true" />
            </div>
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-elevated px-4 py-1.5 text-sm font-semibold text-brand-ink">
            <CategoryIcon className="h-4 w-4" aria-hidden="true" />
            {displayedPractice.category}
          </span>

          <h1
            id="recommendation-heading"
            className="mt-3 font-display text-[32px] font-extrabold leading-tight text-ink"
          >
            {displayedPractice.title}
          </h1>

          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {displayedPractice.duration} min
          </span>

          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-muted">
            {displayedPractice.description}
          </p>

          <div className="mt-6 flex w-full items-start gap-3 rounded-[24px] border border-line bg-surface px-5 py-4 text-left">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink">
              {buildReason(displayedPractice, checkInState)}
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col items-stretch gap-3">
          <button
            type="button"
            onClick={handleStart}
            className="min-h-[52px] w-full rounded-full bg-accent px-6 py-3 text-base font-bold text-accent-ink shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app"
          >
            Start this session
          </button>

          <button
            type="button"
            onClick={handleTryAnother}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try a different suggestion
          </button>
        </div>

        <div className="mt-8">
          <WellnessDisclaimer />
        </div>
      </div>
    </AppShell>
  );
}
