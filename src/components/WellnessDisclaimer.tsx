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
      className={`flex items-start gap-3 rounded-2xl border border-[#DDE5DF] bg-white p-4 shadow-sm dark:border-[#2F403A] dark:bg-[#21302B] sm:p-5 ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF3EE] text-[#2F7D68] dark:bg-[#17221F] dark:text-[#6FBF9E]"
      >
        <Stethoscope className="h-5 w-5" />
      </span>
      <div className="space-y-1">
        <h3 className="text-[15px] font-semibold leading-snug text-[#24332F] dark:text-[#F4F7F3]">
          A gentle reminder before you begin
        </h3>
        <p className="text-[14px] leading-relaxed text-[#66736D] dark:text-[#CBD6CF]">
          Calm Path offers general wellness practices like breathing, meditation and
          relaxation. It is not a substitute for medical care or psychotherapy. If you are in
          crisis or need clinical support, please reach out to a qualified professional or local
          emergency services.
        </p>
      </div>
    </motion.div>
  );
}

export default WellnessDisclaimer;
