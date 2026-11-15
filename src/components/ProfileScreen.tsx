import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock3, Heart, History, Loader2, LogOut, UserRound, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from './AppShell';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Profile { display_name: string; }
interface Progress { active_days: number; minutes_practiced: number; completed_sessions: number; }
interface SessionLog { id: string; activity_title: string; category: string; duration_seconds: number; completed_at: string; }
interface Favorite { id: string; activity_title: string; activity_slug: string; category: string; }

export default function ProfileScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth', { replace: true }); return; }
    let active = true;
    async function load() {
      setLoading(true); setError('');
      const [profileResult, progressResult, sessionsResult, favoritesResult] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
        supabase.from('user_progress').select('active_days, minutes_practiced, completed_sessions').maybeSingle(),
        supabase.from('session_logs').select('id, activity_title, category, duration_seconds, completed_at').order('completed_at', { ascending: false }).limit(20),
        supabase.from('favorites').select('id, activity_title, activity_slug, category').order('created_at', { ascending: false }),
      ]);
      if (!active) return;
      const firstError = profileResult.error || progressResult.error || sessionsResult.error || favoritesResult.error;
      if (firstError) setError('Your personal data is not available yet. Please try again.');
      setProfile(profileResult.data ?? null);
      setProgress(progressResult.data ?? null);
      setSessions(sessionsResult.data ?? []);
      setFavorites(favoritesResult.data ?? []);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [authLoading, navigate, user]);

  async function handleSignOut() {
    const result = await signOut();
    if (result.error) { toast.error('We could not sign you out. Please try again.'); return; }
    toast.success('You are signed out.');
    navigate('/');
  }

  if (authLoading || loading) return <AppShell><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#2F7D68]" aria-label="Loading profile" /></div></AppShell>;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Friend';
  return <AppShell>
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-[#66736D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]"><ArrowLeft className="h-4 w-4" /> Back home</Link>
        <button type="button" onClick={handleSignOut} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#8A3A38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B94A48]"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
      <section className="mt-6 rounded-3xl bg-[#2F7D68] p-6 text-white shadow-sm sm:p-8"><div className="flex items-center gap-3"><UserRound className="h-7 w-7 text-[#CDE9DC]" /><div><p className="text-sm text-[#CDE9DC]">Your Calm Path</p><h1 className="font-serif text-3xl font-semibold">Hi, {displayName}</h1></div></div><p className="mt-4 text-base leading-relaxed text-[#E4F3EB]">A private space for your practices, favorites and progress.</p></section>
      {error && <div role="alert" className="mt-4 rounded-2xl border border-[#B94A48]/30 bg-[#B94A48]/10 p-4 text-sm font-medium text-[#8A3A38]">Your personal data is not available yet. Please try again later.</div>}
      <section className="mt-6 rounded-2xl border border-[#2F7D68]/30 bg-[#2F7D68]/8 p-4 text-[#24332F] dark:bg-[#8FCBB4]/10 dark:text-[#F4F7F3]" aria-labelledby="subscription-summary-heading"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#2F7D68] dark:text-[#8FCBB4]" /><div className="min-w-0 flex-1"><h2 id="subscription-summary-heading" className="font-semibold">Premium subscription</h2><p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">Choose a monthly or annual plan, review renewal terms before payment, and manage access securely.</p><div className="mt-4 flex flex-wrap gap-3"><Link to="/subscription" className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#2F7D68] px-4 text-sm font-semibold text-white hover:bg-[#276B58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">View plans and status</Link><Link to="/subscription#restore" className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#2F7D68] px-4 text-sm font-semibold text-[#2F7D68] hover:bg-[#2F7D68]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FCBB4]">Restore a purchase</Link></div></div></div></section>
      <section aria-labelledby="progress-heading" className="mt-8"><h2 id="progress-heading" className="font-serif text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">Your progress</h2><div className="mt-4 grid grid-cols-3 gap-3">{[['Active days', progress?.active_days ?? 0, UserRound], ['Minutes', progress?.minutes_practiced ?? 0, Clock3], ['Completed', progress?.completed_sessions ?? 0, History]].map(([label, value, Icon]) => { const StatIcon = Icon as typeof Clock3; return <div key={String(label)} className="rounded-2xl border border-[#DDE5DF] bg-white p-4 dark:border-[#2E423B] dark:bg-[#21302B]"><StatIcon className="h-5 w-5 text-[#2F7D68] dark:text-[#8FCBB4]" /><p className="mt-3 text-2xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">{String(value)}</p><p className="mt-1 text-sm text-[#66736D] dark:text-[#C7D1CC]">{String(label)}</p></div>; })}</div></section>
      <section aria-labelledby="favorites-heading" className="mt-8"><div className="flex items-center gap-2"><Heart className="h-5 w-5 text-[#2F7D68]" /><h2 id="favorites-heading" className="font-serif text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">Favorites</h2></div>{favorites.length === 0 ? <p className="mt-3 rounded-2xl border border-[#DDE5DF] bg-white p-4 text-sm leading-relaxed text-[#66736D] dark:border-[#2E423B] dark:bg-[#21302B] dark:text-[#C7D1CC]">You have no favorites yet. Save a practice from the library when one feels right.</p> : <ul className="mt-4 grid gap-3 sm:grid-cols-2">{favorites.map((favorite) => <li key={favorite.id} className="rounded-2xl border border-[#DDE5DF] bg-white p-4 dark:border-[#2E423B] dark:bg-[#21302B]"><p className="font-semibold text-[#24332F] dark:text-[#F4F7F3]">{favorite.activity_title}</p><p className="mt-1 text-sm capitalize text-[#66736D] dark:text-[#C7D1CC]">{favorite.category}</p><Link to={`/session/${favorite.activity_slug}`} className="mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#2F7D68] dark:text-[#8FCBB4]">Start practice</Link></li>)}</ul>}</section>
      <section aria-labelledby="history-heading" className="mt-8"><div className="flex items-center gap-2"><History className="h-5 w-5 text-[#2F7D68]" /><h2 id="history-heading" className="font-serif text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">Session history</h2></div>{sessions.length === 0 ? <p className="mt-3 rounded-2xl border border-[#DDE5DF] bg-white p-4 text-sm leading-relaxed text-[#66736D] dark:border-[#2E423B] dark:bg-[#21302B] dark:text-[#C7D1CC]">Your completed sessions will appear here. Start a short practice to begin your history.</p> : <ul className="mt-4 space-y-3">{sessions.map((session) => <li key={session.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#DDE5DF] bg-white p-4 dark:border-[#2E423B] dark:bg-[#21302B]"><div className="min-w-0"><p className="truncate font-semibold text-[#24332F] dark:text-[#F4F7F3]">{session.activity_title}</p><p className="mt-1 text-sm text-[#66736D] dark:text-[#C7D1CC]">{Math.round(session.duration_seconds / 60)} min · {new Date(session.completed_at).toLocaleDateString()}</p></div><History className="h-5 w-5 shrink-0 text-[#2F7D68]" /></li>)}</ul>}</section>
    </div>
  </AppShell>;
}
