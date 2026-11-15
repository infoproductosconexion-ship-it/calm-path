import { Link } from 'react-router-dom';
import { BedDouble, Brain, Feather, Focus, Moon, Wind } from 'lucide-react';

/**
 * "Sparks": short sessions shown as circles with their own thick coloured
 * ring. One colour per circle — never the same accent repeated — so the row
 * reads as a varied, friendly palette instead of a single-brand list.
 * Every ring colour is a static class so Tailwind can compile it.
 */
interface Spark {
  id: string;
  label: string;
  duration: string;
  to: string;
  icon: typeof Wind;
  ring: string;
}

const SPARKS: Spark[] = [
  { id: 'steady-breath', label: 'Steady Breath', duration: '3 min', to: '/session/steady-breath', icon: Wind, ring: 'border-spark-coral bg-spark-coral/12 text-spark-coral' },
  { id: 'quiet-the-loop', label: 'Quiet the Loop', duration: '5 min', to: '/session/quiet-the-loop', icon: Brain, ring: 'border-spark-teal bg-spark-teal/12 text-spark-teal' },
  { id: 'release-relax', label: 'Release & Relax', duration: '10 min', to: '/session/release-relax', icon: Moon, ring: 'border-spark-mustard bg-spark-mustard/12 text-spark-mustard' },
  { id: 'focused-pause', label: 'Focused Pause', duration: '3 min', to: '/session/focused-pause', icon: Focus, ring: 'border-spark-pink bg-spark-pink/12 text-spark-pink' },
  { id: 'gentle-unwind', label: 'Gentle Unwind', duration: '5 min', to: '/session/gentle-unwind', icon: Feather, ring: 'border-spark-lavender bg-spark-lavender/12 text-spark-lavender' },
  { id: 'drift-into-sleep', label: 'Drift Into Sleep', duration: '10 min', to: '/session/drift-into-sleep', icon: BedDouble, ring: 'border-spark-orange bg-spark-orange/12 text-spark-orange' },
];

export default function Sparks() {
  return (
    <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SPARKS.map((spark) => {
        const Icon = spark.icon;
        return (
          <li key={spark.id} className="w-[86px] shrink-0 snap-start">
            <Link
              to={spark.to}
              className="group flex min-h-[44px] flex-col items-center gap-2 rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] transition-transform duration-200 group-hover:scale-105 ${spark.ring}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-tight text-ink">{spark.label}</span>
              <span className="text-xs font-medium text-muted">{spark.duration}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
