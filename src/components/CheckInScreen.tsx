import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Wind,
  Zap,
  Feather,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Moon,
  Clock,
  Sunrise,
  CheckCircle2,
  Brain,
  BedDouble,
  PauseCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import AppShell from './AppShell';
import WellnessDisclaimer from './WellnessDisclaimer';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

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
    title: 'How are you feeling right now?',
    subtitle: 'Choose the feeling that is closest to this moment.',
    options: [
      { id: 'anxious', label: 'Anxious or on edge', icon: Wind },
      { id: 'stressed', label: 'Stressed and tense', icon: Zap },
      { id: 'racing', label: 'My thoughts are racing', icon: Brain },
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

export default function CheckInScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function selectOption(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    if (user) {
      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        mood: answers.mood,
        energy: answers.energy,
        sleep_need: answers.sleepNeed,
      });
      if (error) {
        setIsSubmitting(false);
        toast.error('Your check-in is not available yet. Please try again.');
        return;
      }
    }
    setIsSubmitting(false);
    toast.success('Check-in complete. Finding a practice for you…');
    navigate('/recommendation', {
      state: { ...answers, minutes: Number(answers.minutes) },
    });
  }

  function handleNext() {
    if (!answers[step.key]) {
      setErrors((prev) => ({
        ...prev,
        [step.key]: 'Please choose one option to continue.',
      }));
      return;
    }
    if (isLastStep) {
      void handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-[#2F7D68] dark:text-[#6fc2a9]">
            Step {stepIndex + 1} of {STEPS.length} — {step.title}
          </p>
          <div className="flex gap-2" role="presentation">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                  i <= stepIndex
                    ? 'bg-[#2F7D68]'
                    : 'bg-[#DDE5DF] dark:bg-[#2b3a35]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-[#21302B] sm:p-6">
          <h1 className="font-serif text-xl font-semibold leading-snug text-[#24332F] dark:text-[#F4F7F3] sm:text-2xl">
            {step.title}
          </h1>
          <p className="mt-1 mb-5 text-base text-[#66736D] dark:text-[#a9b6b0]">
            {step.subtitle}
          </p>

          <div
            role="radiogroup"
            aria-label={step.title}
            aria-invalid={Boolean(errors[step.key])}
            aria-describedby={errors[step.key] ? `${step.key}-error` : undefined}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
                  className={`flex min-h-[64px] items-center gap-3 rounded-[20px] border-2 px-4 py-3 text-left text-base font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#21302B] ${
                    selected
                      ? 'scale-[1.02] border-transparent bg-[#2F7D68] text-white shadow-sm'
                      : 'border-[#DDE5DF] bg-white text-[#24332F] hover:border-[#2F7D68]/50 hover:bg-[#F7F4EF] dark:border-[#33443d] dark:bg-[#1c2a25] dark:text-[#F4F7F3] dark:hover:bg-[#223029]'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 flex-shrink-0 ${
                      selected ? 'text-white' : 'text-[#2F7D68] dark:text-[#6fc2a9]'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="leading-snug">{option.label}</span>
                </button>
              );
            })}
          </div>

          {errors[step.key] && (
            <p
              id={`${step.key}-error`}
              role="alert"
              className="mt-3 text-sm font-medium text-[#B94A48]"
            >
              {errors[step.key]}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0 || isSubmitting}
              className="flex h-11 items-center gap-1.5 rounded-lg border border-[#DDE5DF] bg-white px-4 text-base font-semibold text-[#24332F] transition-colors duration-200 hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#33443d] dark:bg-[#1c2a25] dark:text-[#F4F7F3] dark:hover:bg-[#223029]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2F7D68] px-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#276a58] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Finding your practice…
                </>
              ) : isLastStep ? (
                <>
                  Get my recommendation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <WellnessDisclaimer />
        </div>
      </div>
    </AppShell>
  );
}
