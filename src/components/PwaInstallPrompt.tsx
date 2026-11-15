import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, Share, X, WifiOff, PlusSquare } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely, resolving conflicting utilities.
 */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

/**
 * Minimal typing for the non-standard `beforeinstallprompt` event, which
 * TypeScript's DOM lib does not define.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

const IOS_TIP_DISMISSED_KEY = 'calm-path:ios-install-tip-dismissed';
const INSTALL_DISMISSED_KEY = 'calm-path:install-card-dismissed';

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac but has touch support.
  const isIpadOs = /macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document;
  return isIos || isIpadOs;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMatch = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
  const isIosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isStandaloneMatch || isIosStandalone;
}

/**
 * Offers an unobtrusive "install this app" prompt where the browser supports
 * it, a one-time tip for iOS (which has no install event), and a persistent
 * but non-blocking notice when the device goes offline. Renders nothing when
 * none of these states apply, so it never clutters a page unnecessarily.
 */
export default function PwaInstallPrompt() {
  const prefersReducedMotion = useReducedMotion();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installCardDismissed, setInstallCardDismissed] = useState(false);
  const [iosTipDismissed, setIosTipDismissed] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    try {
      setInstallCardDismissed(sessionStorage.getItem(INSTALL_DISMISSED_KEY) === '1');
      setIosTipDismissed(localStorage.getItem(IOS_TIP_DISMISSED_KEY) === '1' || !isIosDevice());
    } catch {
      // Storage may be unavailable (private mode); fall back to showing nothing extra.
      setIosTipDismissed(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setStandalone(true);
      toast.success('Calm Path is installed on your device.');
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        toast.success("You're all set. Calm Path is being added to your device.");
      }
    } catch {
      toast.error("We couldn't start the install. Please try again from your browser menu.");
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismissInstallCard = useCallback(() => {
    setInstallCardDismissed(true);
    try {
      sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    } catch {
      // Ignore storage failures; the dismissal simply won't persist.
    }
  }, []);

  const dismissIosTip = useCallback(() => {
    setIosTipDismissed(true);
    try {
      localStorage.setItem(IOS_TIP_DISMISSED_KEY, '1');
    } catch {
      // Ignore storage failures; the tip may reappear on next visit.
    }
  }, []);

  const showInstallCard = Boolean(deferredPrompt) && !installCardDismissed && !standalone;
  const showIosTip = isIosDevice() && !standalone && !iosTipDismissed;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

  const hasAnyContent = !isOnline || showInstallCard || showIosTip;
  if (!hasAnyContent) return null;

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <AnimatePresence initial={false}>
        {!isOnline && (
          <motion.div
            key="offline-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            role="status"
            className="flex items-center gap-3 rounded-2xl border border-[#DDE5DF] bg-[#FFFFFF] px-4 py-3 text-[#24332F] shadow-sm dark:border-[#2B3B35] dark:bg-[#21302B] dark:text-[#F4F7F3]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B94A48]/10 text-[#B94A48]">
              <WifiOff className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium leading-snug">
              Sin conexión. Algunas acciones no están disponibles.
            </p>
          </motion.div>
        )}

        {showInstallCard && (
          <motion.div
            key="install-card"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="relative flex items-start gap-3 rounded-2xl border border-[#DDE5DF] bg-[#F7F4EF] px-4 py-4 shadow-sm dark:border-[#2B3B35] dark:bg-[#21302B]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#2F7D68]/20">
              <Download className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-['DM_Sans',_sans-serif] text-base font-semibold leading-snug text-[#24332F] dark:text-[#F4F7F3]">
                Add Calm Path to your home screen
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#AEB9B3]">
                Get a quieter, faster way back to your practices, even with a weak connection.
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className={cn(
                  'mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2F7D68] px-4 text-sm font-semibold text-[#FFFFFF] transition-opacity',
                  'hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F7D68]',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {isInstalling ? 'Opening install…' : 'Install app'}
              </button>
            </div>
            <button
              type="button"
              onClick={dismissInstallCard}
              aria-label="Dismiss install suggestion"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#66736D] transition-colors hover:bg-[#24332F]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F7D68] dark:text-[#AEB9B3] dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {showIosTip && (
          <motion.div
            key="ios-tip"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
            className="relative flex items-start gap-3 rounded-2xl border border-[#DDE5DF] bg-[#F7F4EF] px-4 py-4 shadow-sm dark:border-[#2B3B35] dark:bg-[#21302B]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#2F7D68]/20">
              <PlusSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-['DM_Sans',_sans-serif] text-base font-semibold leading-snug text-[#24332F] dark:text-[#F4F7F3]">
                Add Calm Path to your home screen
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-sm leading-relaxed text-[#66736D] dark:text-[#AEB9B3]">
                <span>Tap</span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#DDE5DF] px-1.5 py-0.5 text-[#24332F] dark:border-[#2B3B35] dark:text-[#F4F7F3]">
                  <Share className="h-3.5 w-3.5" aria-hidden="true" />
                  Share
                </span>
                <span>and then "Add to Home Screen".</span>
              </p>
            </div>
            <button
              type="button"
              onClick={dismissIosTip}
              aria-label="Dismiss home screen tip"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#66736D] transition-colors hover:bg-[#24332F]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F7D68] dark:text-[#AEB9B3] dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
