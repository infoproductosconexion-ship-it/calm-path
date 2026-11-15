import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home as HomeIcon,
  ClipboardList,
  Sparkles,
  LibraryBig,
  Leaf,
  UserRound,
  Sun,
  Moon,
  WifiOff,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import WellnessDisclaimer from './WellnessDisclaimer';
import PwaInstallPrompt from './PwaInstallPrompt';

/**
 * Ordered steps of the guided path. Used to render a small progress
 * indicator so people always know where they are in the flow:
 * Home -> Check-in -> Recommendation -> Guided session.
 */
const PATH_STEPS: { path: string; label: string; match: (pathname: string) => boolean }[] = [
  { path: '/', label: 'Home', match: (p) => p === '/' },
  { path: '/session', label: 'Session', match: (p) => p.startsWith('/session') },
];

const BOTTOM_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/check-in', label: 'Check-in', icon: ClipboardList, end: false },
  { to: '/recommendation', label: 'For you', icon: Sparkles, end: false },
  { to: '/library', label: 'Library', icon: LibraryBig, end: false },
];

/** Tracks navigator connectivity and reports it in a calm, consistent way. */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

/** The brand mark: a small cluster of breathing rings behind a leaf glyph. */
function BreathingMark() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden="true">
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute rounded-full border border-[#2F7D68]/35 dark:border-[#8FC6B4]/30"
          style={{ width: `${20 + ring * 8}px`, height: `${20 + ring * 8}px` }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  scale: [1, 1.18, 1],
                  opacity: [0.55, 0.15, 0.55],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: ring * 0.4,
                }
          }
        />
      ))}
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#2F7D68] text-white">
        <Leaf className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
    </span>
  );
}

/** Small step indicator shown under the header on the guided-path screens. */
function PathProgress({ pathname }: { pathname: string }) {
  const currentIndex = PATH_STEPS.findIndex((step) => step.match(pathname));
  if (currentIndex < 0) return null;

  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 pb-3"
      role="group"
      aria-label={`Step ${currentIndex + 1} of ${PATH_STEPS.length}: ${PATH_STEPS[currentIndex].label}`}
    >
      <ol className="flex items-center gap-2">
        {PATH_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step.path} className="flex flex-1 items-center gap-2">
              <span
                className={[
                  'h-1.5 flex-1 rounded-full transition-colors duration-200',
                  isDone || isCurrent
                    ? 'bg-[#2F7D68]'
                    : 'bg-[#DDE5DF] dark:bg-[#2A3B35]',
                ].join(' ')}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-medium text-[#66736D] dark:text-[#9FB0A8]">
        Step {currentIndex + 1} of {PATH_STEPS.length} · {PATH_STEPS[currentIndex].label}
      </p>
    </div>
  );
}

/** Calm theme toggle, mirrored on every page so it never feels relocated. */
function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5DF] bg-white text-[#24332F] transition-colors hover:bg-[#F7F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EF] dark:border-[#2A3B35] dark:bg-[#21302B] dark:text-[#F4F7F3] dark:focus-visible:ring-offset-[#17221F]"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
    </button>
  );
}

/** Non-blocking connectivity notice, shown in the normal page flow. */
function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-3xl px-4">
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#B94A48]/30 bg-[#B94A48]/10 px-4 py-3 text-sm font-medium text-[#8a3a38] dark:border-[#e08684]/30 dark:bg-[#B94A48]/15 dark:text-[#f4b9b7]">
          <WifiOff className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Sin conexión. Algunas acciones no están disponibles.</span>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const showProgress = useMemo(
    () => PATH_STEPS.some((step) => step.match(location.pathname)),
    [location.pathname],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#F7F4EF] font-sans text-[#24332F] antialiased dark:bg-[#17221F] dark:text-[#F4F7F3]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#2F7D68] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-[#DDE5DF] bg-[#F7F4EF]/90 backdrop-blur dark:border-[#2A3B35] dark:bg-[#17221F]/90">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EF] dark:focus-visible:ring-offset-[#17221F]"
          >
            <BreathingMark />
            <span className="flex flex-col leading-tight">
              <span
                className="text-lg font-bold tracking-tight text-[#24332F] dark:text-[#F4F7F3]"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                Calm Path
              </span>
              <span className="text-xs font-medium text-[#66736D] dark:text-[#9FB0A8]">
                Gentle steps to feel calmer
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#2F7D68]/20 dark:text-[#8FC6B4]'
                      : 'text-[#66736D] hover:bg-[#2F7D68]/5 hover:text-[#24332F] dark:text-[#9FB0A8] dark:hover:bg-white/5 dark:hover:text-[#F4F7F3]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/profile" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#DDE5DF] bg-white px-3 text-sm font-semibold text-[#24332F] transition-colors hover:bg-[#F7F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:border-[#2A3B35] dark:bg-[#21302B] dark:text-[#F4F7F3] dark:hover:bg-[#2A3B35]">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {showProgress && <PathProgress pathname={location.pathname} />}
      </header>

      <div className="pt-4">
        <OfflineBanner />
        <div className="mx-auto w-full max-w-3xl px-4">
          <PwaInstallPrompt />
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-2 focus:outline-none sm:pb-12"
      >
        {children ?? <Outlet />}

        <div className="mt-10">
          <WellnessDisclaimer />
        </div>
      </main>

      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DDE5DF] bg-white/95 backdrop-blur sm:hidden dark:border-[#2A3B35] dark:bg-[#21302B]/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 py-1.5">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex min-h-[48px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]',
                    isActive
                      ? 'text-[#2F7D68] dark:text-[#8FC6B4]'
                      : 'text-[#66736D] dark:text-[#9FB0A8]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
