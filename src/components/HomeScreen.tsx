import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BrandMark, { BrandBadge } from './BrandMark';
import PwaInstallPrompt from './PwaInstallPrompt';

/**
 * Home / wind-down screen.
 *
 * Signature visual: three concentric breath rings around a crescent-moon mark.
 * The rhythm is fixed at 4 seconds of expansion (inhale) and 6 seconds of
 * contraction (exhale), looped continuously, and the label below the symbol
 * alternates in sync with it.
 */
const INHALE_SECONDS = 4;
const EXHALE_SECONDS = 6;
const BREATH_CYCLE_SECONDS = INHALE_SECONDS + EXHALE_SECONDS;
const INHALE_RATIO = INHALE_SECONDS / BREATH_CYCLE_SECONDS;

/** One amplitude per ring so all three stay in sync while feeling layered. */
const RINGS = [
  { inset: 0, amplitude: 1.06, opacity: 0.9, borderClass: 'border-[#9B8CD9]/45' },
  { inset: 22, amplitude: 1.09, opacity: 0.75, borderClass: 'border-[#8FA8D9]/35' },
  { inset: 44, amplitude: 1.12, opacity: 0.6, borderClass: 'border-[#D9A441]/30' },
] as const;

const STEPS = [
  { title: 'Tell us how tonight feels', description: 'A quick, gentle check-in.' },
  { title: 'Get one calming practice', description: 'Breathing, meditation or body relaxation.' },
  { title: 'Drift off', description: 'Clear timing, nothing to scroll.' },
] as const;

/** Alternates 'in' (4s) and 'out' (6s) forever, matching the ring animation. */
function useBreathPhase(): 'in' | 'out' {
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    let exhaleTimer = 0;
    let cycleTimer = 0;

    const startCycle = () => {
      setPhase('in');
      exhaleTimer = window.setTimeout(() => setPhase('out'), INHALE_SECONDS * 1000);
      cycleTimer = window.setTimeout(startCycle, BREATH_CYCLE_SECONDS * 1000);
    };

    startCycle();
    return () => {
      window.clearTimeout(exhaleTimer);
      window.clearTimeout(cycleTimer);
    };
  }, []);

  return phase;
}

function BreathRings() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64"
      aria-hidden="true"
    >
      {RINGS.map((ring) => (
        <motion.span
          key={ring.inset}
          className={`absolute rounded-full border ${ring.borderClass}`}
          style={{ inset: ring.inset }}
          initial={false}
          animate={
            reduceMotion
              ? { scale: 1, opacity: ring.opacity }
              : {
                  scale: [1, ring.amplitude, 1],
                  opacity: [ring.opacity, ring.opacity * 0.5, ring.opacity],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: BREATH_CYCLE_SECONDS,
                  times: [0, INHALE_RATIO, 1],
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}

      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#1A1536] shadow-[0_12px_32px_rgba(8,14,30,0.55)] ring-1 ring-[#9B8CD9]/35">
        <BrandMark className="h-20 w-20" />
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const phase = useBreathPhase();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1B2A4A] via-[#16213E] to-[#0E1730] font-sans text-[#F4F6FB]">
      <div className="relative mx-auto flex w-full max-w-2xl flex-col px-5 pb-14 pt-6 sm:px-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(155,140,217,0.22),transparent_65%)]"
          aria-hidden="true"
        />

        <header className="relative flex items-center gap-2.5">
          <BrandBadge className="h-10 w-10" markClassName="h-8 w-8" />
          <span className="text-sm font-semibold tracking-wide text-[#E6E1FA]">Calm Path</span>
        </header>

        {/* Hero: breathing symbol, title, subtitle and the single primary action */}
        <section className="relative mt-10 flex flex-col items-center text-center">
          <BreathRings />

          <p className="mt-5 text-sm font-medium tracking-[0.16em] text-[#C9C4E8]">
            {phase === 'in' ? 'breathe in' : 'breathe out'}
          </p>

          <h1 className="mt-6 font-title text-[32px] font-semibold leading-[1.15] text-[#F4F6FB] sm:text-[40px]">
            Ready to wind down for sleep?
          </h1>

          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-[#C9C4E8]">
            One short practice, chosen for how you feel tonight.
          </p>

          <Link
            to="/check-in"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#9B8CD9] px-7 py-3.5 text-base font-bold text-[#16213E] transition-colors duration-200 hover:bg-[#A99BDF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6E1FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16213E] active:scale-[0.99]"
          >
            Start wind-down
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          <p className="mt-3 text-sm text-[#8C97B4]">About 2 minutes · No account needed</p>
        </section>

        {/* How it works: numbered list separated by thin rules, no boxes */}
        <section className="relative mt-14" aria-labelledby="how-it-works-heading">
          <h2
            id="how-it-works-heading"
            className="font-[var(--font-title)] text-2xl font-semibold text-[#F4F6FB]"
          >
            How to fix it
          </h2>
          <ol className="mt-4 divide-y divide-white/10 border-t border-white/10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4 py-4">
                <span className="mt-0.5 text-sm font-semibold tabular-nums text-[#D9A441]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#F4F6FB]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#A9B2C9]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Library: a single thin row, no card */}
        <Link
          to="/library"
          className="relative mt-10 flex min-h-[64px] items-center justify-between gap-4 border-t border-white/10 py-4 transition-colors duration-200 hover:text-[#C9C4E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B8CD9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16213E]"
        >
          <span className="min-w-0">
            <span className="block text-base font-semibold text-[#F4F6FB]">Browse the library</span>
            <span className="mt-0.5 block text-sm text-[#A9B2C9]">
              Sleep, anxiety, overthinking
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#C9C4E8]" aria-hidden="true" />
        </Link>

        <div className="relative mt-10">
          <PwaInstallPrompt />
        </div>

        <p className="relative mt-8 border-t border-white/10 pt-4 text-xs leading-relaxed text-[#8C97B4]">
          Calm Path offers wellness practices, not medical care. In a crisis, contact a professional
          or local emergency services.
        </p>
      </div>
    </div>
  );
}
