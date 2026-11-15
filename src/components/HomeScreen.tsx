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
        className="absolute inset-0 rounded-full border border-[#2F7D68]/25 dark:border-[#8fc7b4]/20"
        animate={reduceMotion ? {} : { scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
        transition={ringTransition(0)}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-4 rounded-full border border-[#2F7D68]/35 dark:border-[#8fc7b4]/30"
        animate={reduceMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.6, 0.25, 0.6] }}
        transition={ringTransition(0.4)}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-9 rounded-full bg-[#2F7D68]/10 dark:bg-[#8fc7b4]/10"
        animate={reduceMotion ? {} : { scale: [1, 1.08, 1] }}
        transition={ringTransition(0.8)}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#2F7D68] text-white shadow-sm sm:h-24 sm:w-24">
        <Leaf className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true" />
      </div>
    </div>
  );
}

const steps = [
  {
    icon: ClipboardList,
    title: 'Share how you feel',
    description: 'A two-minute check-in about your mood, energy and what is on your mind right now.',
  },
  {
    icon: Compass,
    title: 'Get a gentle match',
    description: 'Calm Path suggests one short breathing, meditation or relaxation practice built for this moment.',
  },
  {
    icon: PlayCircle,
    title: 'Begin right away',
    description: 'Follow a guided session with clear timing, no scrolling through endless options.',
  },
];

export default function HomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <BreathRings />
        <div className="flex flex-col gap-3">
          <h1
            className="text-[28px] font-semibold leading-tight text-[#24332F] dark:text-[#F4F7F3] sm:text-[32px]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            What can you do right now to feel calmer?
          </h1>
          <p className="mx-auto max-w-[42ch] text-base leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">
            Calm Path turns that question into one short, personal practice — chosen for how you feel today,
            not a library to search through.
          </p>
        </div>

        <Link
          to="/check-in"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2F7D68] px-6 py-3 text-base font-semibold text-white shadow-sm transition-transform duration-200 hover:bg-[#276b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F7D68] active:scale-[0.98] dark:hover:bg-[#368d75]"
        >
          Start my check-in
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-[#66736D] dark:text-[#C7D1CC]">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Takes about 2 minutes, start to finish.
        </p>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-5" aria-labelledby="how-it-works-heading">
        <h2
          id="how-it-works-heading"
          className="text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          How Calm Path works
        </h2>
        <ol className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex items-start gap-4 rounded-2xl border border-[#DDE5DF] bg-white p-4 shadow-sm dark:border-[#2E423B] dark:bg-[#21302B] sm:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#8fc7b4]/15 dark:text-[#8fc7b4]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#2F7D68] dark:text-[#8fc7b4]">
                      Step {index + 1}
                    </span>
                    <h3 className="truncate text-base font-semibold text-[#24332F] dark:text-[#F4F7F3]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">
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
        className="flex flex-col gap-3 rounded-2xl bg-[#2F7D68]/8 p-5 dark:bg-[#8fc7b4]/10 sm:p-6"
        aria-labelledby="practices-heading"
      >
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-[#2F7D68] dark:text-[#8fc7b4]" aria-hidden="true" />
          <h2
            id="practices-heading"
            className="text-lg font-semibold text-[#24332F] dark:text-[#F4F7F3]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Short practices, built for busy days
          </h2>
        </div>
        <p className="max-w-[60ch] text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">
          Breathing exercises, calming meditations and gentle relaxation sessions, each with a clear duration so you
          always know what you are starting — and when it ends.
        </p>
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#2F7D68] dark:text-[#8fc7b4]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          No account needed to try your first session.
        </div>
      </section>

      <section className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm dark:border-[#2E423B] dark:bg-[#21302B]" aria-labelledby="library-link-heading">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#8FC7B4]/15 dark:text-[#8FC7B4]"><LibraryBig className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="library-link-heading" className="font-serif text-lg font-semibold text-[#24332F] dark:text-[#F4F7F3]">Need a different starting point?</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">Browse example routines by anxiety, overthinking, sleep, focus and more.</p>
            <Link to="/library" className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-[#2F7D68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FC7B4]">Explore the example library <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <PwaInstallPrompt />

      <WellnessDisclaimer />
    </div>
  );
}
