import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Leaf,
  Wind,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Compass,
  PlayCircle,
  Clock,
  LibraryBig,
} from 'lucide-react';
import WellnessDisclaimer from './WellnessDisclaimer';
import PwaInstallPrompt from './PwaInstallPrompt';

/**
 * Signature visual: layered "leaf and breath" rings that expand gently,
 * echoing the slow inhale/exhale rhythm the whole app is built around.
 * Animation respects prefers-reduced-motion.
 */
function BreathRings() {
  const reduceMotion = useReducedMotion();

  const ringTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration: 4.2,
          delay,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        };

  return (
    <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-accent/45"
        animate={reduceMotion ? {} : { scale: [1, 1.18, 1], opacity: [0.6, 0.18, 0.6] }}
        transition={ringTransition(0)}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-4 rounded-full border border-accent/30"
        animate={reduceMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 0.3, 0.7] }}
        transition={ringTransition(0.4)}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-9 rounded-full bg-elevated/60"
        animate={reduceMotion ? {} : { scale: [1, 1.08, 1] }}
        transition={ringTransition(0.8)}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-elevated text-brand-ink shadow-sm sm:h-24 sm:w-24">
        <Leaf className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />
      </div>
    </div>
  );
}

const steps = [
  {
    icon: ClipboardList,
    color: 'spark-coral',
    title: 'Share how you feel',
    description: 'A two-minute check-in about your mood, energy and what is on your mind right now.',
  },
  {
    icon: Compass,
    color: 'spark-teal',
    title: 'Get a gentle match',
    description: 'Calm Path suggests one short breathing, meditation or relaxation practice built for this moment.',
  },
  {
    icon: PlayCircle,
    color: 'spark-lavender',
    title: 'Begin right away',
    description: 'Follow a guided session with clear timing, no scrolling through endless options.',
  },
] as const;

const STEP_TONES: Record<string, string> = {
  'spark-coral': 'bg-spark-coral/15 text-spark-coral',
  'spark-teal': 'bg-spark-teal/15 text-spark-teal',
  'spark-lavender': 'bg-spark-lavender/15 text-spark-lavender',
};

export default function HomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <BreathRings />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[30px] font-extrabold leading-tight text-ink sm:text-[36px]">
            What can you do right now to feel calmer?
          </h1>
          <p className="mx-auto max-w-[42ch] text-base leading-relaxed text-muted">
            Calm Path turns that question into one short, personal practice — chosen for how you feel today,
            not a library to search through.
          </p>
        </div>

        <Link
          to="/check-in"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-bold text-accent-ink shadow-sm transition-transform duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]"
        >
          Start my check-in
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Takes about 2 minutes, start to finish.
        </p>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-5" aria-labelledby="how-it-works-heading">
        <h2
          id="how-it-works-heading"
          className="font-display text-xl font-bold text-ink"
        >
          How Calm Path works
        </h2>
        <ol className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex items-start gap-4 rounded-[28px] border border-line bg-surface p-5 shadow-sm sm:p-6"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${STEP_TONES[step.color]}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-accent">
                      Step {index + 1}
                    </span>
                    <h3 className="truncate text-base font-bold text-ink">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Reassurance / what you'll find */}
      <section
        className="flex flex-col gap-3 rounded-[28px] bg-elevated p-6 text-brand-ink sm:p-7"
        aria-labelledby="practices-heading"
      >
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2
            id="practices-heading"
            className="font-display text-lg font-bold"
          >
            Short practices, built for busy days
          </h2>
        </div>
        <p className="max-w-[60ch] text-sm leading-relaxed text-brand-ink/80">
          Breathing exercises, calming meditations and gentle relaxation sessions, each with a clear duration so you
          always know what you are starting — and when it ends.
        </p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          No account needed to try your first session.
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-surface p-6 shadow-sm" aria-labelledby="library-link-heading">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-spark-teal/15 text-spark-teal"><LibraryBig className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="library-link-heading" className="font-display text-lg font-bold text-ink">Need a different starting point?</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Browse example routines by anxiety, overthinking, sleep, focus and more.</p>
            <Link to="/library" className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full text-sm font-bold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Explore the example library <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <PwaInstallPrompt />

      <WellnessDisclaimer />
    </div>
  );
}
