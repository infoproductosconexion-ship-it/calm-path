/**
 * Official CALM PATH brand mark.
 *
 * The approved logo is a cream crescent moon with a small gold dot inside,
 * framed by an eight-petal lotus outline (lines only, no fill) on midnight
 * navy. This file is the single source of truth for the logo: the header, the
 * home hero and the favicon/PWA icon all use this same complete version, so
 * the lotus frame can never disappear again.
 */

export const BRAND_NAVY = '#1A1536';
export const BRAND_CREAM = '#F6F0E3';
export const BRAND_GOLD = '#E3B23C';

/** One lotus petal, drawn pointing up from the centre (32, 32) of the 64 box. */
const PETAL = 'M32 17.5 C37 14.5 38 9.5 32 3 C26 9.5 27 14.5 32 17.5 Z';
const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

/** Crescent moon: outer circle minus an offset circle, horns pointing right. */
const MOON = 'M36.03 20.7 A12 12 0 1 0 36.03 43.3 A11.4 11.4 0 0 1 36.03 20.7 Z';

interface BrandMarkProps {
  /** Size and layout classes, e.g. "h-8 w-8". */
  className?: string;
  /** Accessible name. Leave empty when the mark sits next to the brand name. */
  title?: string;
}

/** The logo itself, with a transparent background. */
export default function BrandMark({ className = 'h-9 w-9', title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      {...(title
        ? { role: 'img' as const, 'aria-label': title }
        : { 'aria-hidden': true, focusable: false })}
    >
      <g
        fill="none"
        stroke={BRAND_CREAM}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PETAL_ANGLES.map((angle) => (
          <path key={angle} d={PETAL} transform={`rotate(${angle} 32 32)`} />
        ))}
      </g>
      <path d={MOON} fill={BRAND_CREAM} />
      <circle cx="40.5" cy="26" r="2.8" fill={BRAND_GOLD} />
    </svg>
  );
}

interface BrandBadgeProps {
  /** Tile size and extra classes, e.g. "h-11 w-11". */
  className?: string;
  /** Size of the mark inside the tile. */
  markClassName?: string;
}

/**
 * The logo on its midnight-navy tile. Used wherever the mark sits on a
 * surface of the app (header, home header) so the cream petals keep their
 * contrast in both the night and the light theme.
 */
export function BrandBadge({ className = 'h-11 w-11', markClassName = 'h-8 w-8' }: BrandBadgeProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl ${className}`}
      style={{ backgroundColor: BRAND_NAVY, boxShadow: 'inset 0 0 0 1px rgba(246,240,227,0.14)' }}
    >
      <BrandMark className={markClassName} />
    </span>
  );
}
