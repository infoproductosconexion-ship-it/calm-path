import { motion, useReducedMotion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

interface WellnessDisclaimerProps {
  /**
   * "banner" renders the full notice with heading and body copy (used on
   * screens like Home or the recommendation result). "inline" renders a
   * compact one-line version suited to tight spaces like a session footer.
   */
  variant?: 'banner' | 'inline';
  className?: string;
}

/**
 * Visible safety notice shown across Calm Path: the app offers general
 * wellness practices and is not a substitute for medical care or
 * psychotherapy. Self-contained so any screen can mount it directly.
 */
function WellnessDisclaimer({ variant = 'banner', className = '' }: WellnessDisclaimerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (variant === 'inline') {
    return (
      <p
        role="note"
        className={`flex items-start gap-2 text-[13px] leading-relaxed text-[#24332F]/70 dark:text-[#F4F7F3]/70 ${className}`}
      >
        <Stethoscope
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2F7D68] dark:text-[#6FBF9E]"
        />
        <span>
          Calm Path is a wellness tool, not a substitute for medical care or psychotherapy.
        </span>
      </p>
    );
  }

  return (
    <motion.div
      role="note"
      aria-label="Wellness disclaimer"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`text-xs leading-relaxed text-[#8C97B4] ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <span>
        Calm Path offers wellness practices, not medical care. In a crisis, contact a professional or local emergency services.
      </span>
    </motion.div>
  );
}

export default WellnessDisclaimer;
