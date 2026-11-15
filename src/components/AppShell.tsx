import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home as HomeIcon,
  ClipboardList,
  Sparkles,
  LibraryBig,
  UserRound,
  Sun,
  Moon,
  WifiOff,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import PwaInstallPrompt from './PwaInstallPrompt';
import { BrandBadge } from './BrandMark';

/**
 * Ordered steps of the guided path. Used to render a small progress
 * indicator so people always know where they are in the flow:
 * Home -> Check-in -> Recommendation -> Guided session.
 */
const PATH_STEPS: { path: string; label: string; match: (pathname: string) => boolean }[] = [
  { path: '/', label: 'Home', match: (p) => p === '/' },
  { path: '/session', label: 'Session', match: (p) => p.startsWith('/session') },
];

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/check-in', label: 'Check-in', icon: ClipboardList, end: false },
  { to: '/recommendation', label: 'For you', icon: Sparkles, end: false },
  { to: '/library', label: 'Library', icon: LibraryBig, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
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
                  isDone || isCurrent ? 'bg-accent' : 'bg-line',
                ].join(' ')}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-medium text-muted">
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app"
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
        <div className="mb-4 flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-ink">
          <WifiOff className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
          <span>No connection. Some actions are not available right now.</span>
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
    <div className="flex min-h-dvh flex-col bg-app font-sans text-ink antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-app/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app"
          >
            <BrandBadge className="h-11 w-11" markClassName="h-8 w-8" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-ink">
                Calm Path
              </span>
              <span className="text-xs font-medium text-muted">
                Gentle steps to feel calmer
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-accent text-accent-ink'
                      : 'text-muted hover:bg-surface hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
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
        className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-2 focus:outline-none lg:pb-14"
      >
        {children ?? <Outlet />}

      </main>

      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between gap-1 rounded-[28px] border border-line bg-surface/95 p-1.5 shadow-[0_12px_32px_rgba(8,14,30,0.45)] backdrop-blur">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-[22px] px-1 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isActive ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink',
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
