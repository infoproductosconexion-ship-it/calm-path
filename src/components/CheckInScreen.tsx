import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  X,
  Check,
  Brain,
  Wind,
  Zap,
  Feather,
  Moon,
  Clock,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Sunrise,
  CheckCircle2,
  BedDouble,
  PauseCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

/**
 * Check-in · focus mode.
 *
 * Night theme only (#141B2E), no AppShell chrome: minimal top bar (back,
 * "n of 5", close), five thin progress segments and full-width option rows.
 * Selecting an option auto-advances (~500 ms) with a gentle slide/fade.
 * Question ids, option ids and order are unchanged; only the step-1 title
 * and subtitle copy were updated per the redesign.
 */

type LucideIcon = typeof Wind;

interface Option {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Step {
  key: 'mood' | 'goal' | 'minutes' | 'energy' | 'sleepNeed';
  title: string;
  subtitle: string;
  options: Option[];
}

const STEPS: Step[] = [
  {
    key: 'mood',
    title: 'How are you feeling tonight?',
    subtitle: 'Choose what feels closest.',
    options: [
      { id: 'racing', label: 'My thoughts are racing', icon: Brain },
      { id: 'anxious', label: 'Anxious or on edge', icon: Wind },
      { id: 'stressed', label: 'Stressed and tense', icon: Zap },
      { id: 'calm', label: 'Calm, but I want to unwind', icon: Feather },
      { id: 'tired', label: 'Tired and ready for sleep', icon: Moon },
    ],
  },
  {
    key: 'goal',
    title: 'What would feel most helpful right now?',
    subtitle: 'Choose whatever feels closest to what you need.',
    options: [
      { id: 'calm-mind', label: 'Calm my mind', icon: Wind },
      { id: 'release-tension', label: 'Release tension', icon: Zap },
      { id: 'slow-thoughts', label: 'Slow down my thoughts', icon: Brain },
      { id: 'prepare-sleep', label: 'Prepare for sleep', icon: BedDouble },
      { id: 'short-pause', label: 'Take a short pause', icon: PauseCircle },
    ],
  },
  {
    key: 'minutes',
    title: 'How much time do you have?',
    subtitle: 'We will match the practice to the time you can give yourself.',
    options: [
      { id: '3', label: '3 minutes', icon: Clock },
      { id: '5', label: '5 minutes', icon: Clock },
      { id: '10', label: '10 minutes', icon: Clock },
      { id: '15', label: '15 minutes', icon: Clock },
    ],
  },
  {
    key: 'energy',
    title: 'How is your energy right now?',
    subtitle: 'This helps us pick a practice that matches your pace.',
    options: [
      { id: 'very-low', label: 'Very low', icon: BatteryLow },
      { id: 'tired', label: 'A little tired', icon: BatteryMedium },
      { id: 'balanced', label: 'Balanced', icon: BatteryMedium },
      { id: 'restless', label: 'Restless', icon: BatteryFull },
      { id: 'full', label: 'Full of energy', icon: BatteryFull },
    ],
  },
  {
    key: 'sleepNeed',
    title: 'What’s going on with your sleep?',
    subtitle: 'Be honest, there’s no wrong answer here.',
    options: [
      { id: 'falling', label: 'Falling asleep is hard', icon: Moon },
      { id: 'waking', label: 'I wake up during the night', icon: Clock },
      { id: 'tired', label: 'I wake up tired', icon: Sunrise },
      { id: 'none', label: 'Sleep isn’t the main issue', icon: CheckCircle2 },
    ],
  },
];

const AUTO_ADVANCE_MS = 500;

export default function CheckInScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const advanceTimer = useRef<number>(0);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  async function finishCheckIn(finalAnswers: Record<string, string>) {
    setIsSubmitting(true);
    if (user) {
      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        mood: finalAnswers.mood,
        energy: finalAnswers.energy,
        sleep_need: finalAnswers.sleepNeed,
      });
      if (error) {
        setIsSubmitting(false);
        toast.error('Your check-in is not available yet. Please try again.');
        return;
      }
    }
    setIsSubmitting(false);
    navigate('/recommendation', {
      state: { ...finalAnswers, minutes: Number(finalAnswers.minutes) },
    });
  }

  function selectOption(key: string, value: string) {
    if (isSubmitting) return;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      if (isLastStep) {
        void finishCheckIn(next);
      } else {
        setDirection(1);
        setStepIndex((i) => i + 1);
      }
    }, AUTO_ADVANCE_MS);
  }

  function handleBack() {
    window.clearTimeout(advanceTimer.current);
    if (stepIndex === 0) {
      navigate('/');
    } else {
      setDirection(-1);
      setStepIndex((i) => i - 1);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#141B2E] font-sans text-[#F2EDE4]">
      {/* Minimal focus top bar */}
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-5 pt-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label={stepIndex === 0 ? 'Back to home' : 'Previous question'}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#A9A6C2] transition-colors duration-500 ease-in-out hover:text-[#F2EDE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9BFF0]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#A9A6C2]">
          {stepIndex + 1} of {STEPS.length}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Close check-in and return home"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#A9A6C2] transition-colors duration-500 ease-in-out hover:text-[#F2EDE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9BFF0]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {/* Progress segments */}
      <div
        className="mx-auto mt-4 flex w-full max-w-xl gap-1.5 px-5"
        role="progressbar"
        aria-label={`Question ${stepIndex + 1} of ${STEPS.length}`}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={stepIndex + 1}
      >
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ease-in-out ${
              i <= stepIndex ? 'bg-[#C9BFF0]' : 'bg-[#2E3350]'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Question + options, one step at a time */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-10">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.section
            key={step.key}
            custom={direction}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
            transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: 'easeInOut' }}
            className="mt-10 flex flex-1 flex-col"
            aria-labelledby="checkin-question"
          >
            <h1
              id="checkin-question"
              className="font-question text-[32px] font-medium leading-[1.2] text-[#F2EDE4]"
            >
              {step.title}
            </h1>
            <p className="mt-2 text-sm text-[#A9A6C2]">{step.subtitle}</p>

            <div
              role="radiogroup"
              aria-label={step.title}
              className="mt-8 flex flex-col gap-2.5"
            >
              {step.options.map((option) => {
                const Icon = option.icon;
                const selected = answers[step.key] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => selectOption(step.key, option.id)}
                    className={`flex min-h-[60px] w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9BFF0] ${
                      selected
                        ? 'border-[#C9BFF0] bg-[#332B55]'
                        : 'border-[#2E3350] bg-[#2A2347] hover:border-[#C9BFF0]/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[#C9BFF0]" aria-hidden="true" />
                    <span className="flex-1 text-[15px] leading-snug text-[#F2EDE4]">
                      {option.label}
                    </span>
                    {selected && (
                      <Check className="h-5 w-5 shrink-0 text-[#C9BFF0]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-auto pt-10 text-center text-xs text-[#6F6C8C]">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Finding your practice…
                </span>
              ) : (
                'Tap an option to continue'
              )}
            </p>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
