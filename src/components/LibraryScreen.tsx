import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CloudRain,
  Focus,
  Headphones,
  Moon,
  PlayCircle,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react';
import AppShell from './AppShell';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: typeof Wind;
  route: string;
  featured?: boolean;
}

const categories = [
  { id: 'all', label: 'All practices', icon: Sparkles },
  { id: 'calm', label: 'Anxiety & calm', icon: CloudRain },
  { id: 'thoughts', label: 'Overthinking', icon: Brain },
  { id: 'breathing', label: 'Breathing', icon: Wind },
  { id: 'body', label: 'Body relaxation', icon: Zap },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'focus', label: 'Focus', icon: Focus },
  { id: 'sounds', label: 'Ambient sounds', icon: Headphones },
] as const;

const routines: LibraryItem[] = [
  { id: 'emergency-pause', title: 'Emergency Pause', description: 'A tiny reset for moments that feel too much.', duration: '3 min', category: 'calm', icon: CloudRain, route: '/session/steady-breath', featured: true },
  { id: 'mental-reset', title: 'Mental Reset', description: 'Create space when your thoughts keep looping.', duration: '5 min', category: 'thoughts', icon: Brain, route: '/session/quiet-the-loop', featured: true },
  { id: 'quiet-night', title: 'Quiet Night', description: 'Ease out of the day and move gently toward sleep.', duration: '6 min', category: 'sleep', icon: Moon, route: '/session/drift-into-sleep', featured: true },
  { id: 'calm-week', title: 'Calm Week', description: 'One simple practice each day for a steadier week.', duration: '7 days', category: 'all', icon: Sparkles, route: '/session/focused-pause', featured: true },
  { id: 'steady-breath', title: 'Steady Breath', description: 'A clear rhythm for a busy or restless moment.', duration: '3 min', category: 'breathing', icon: Wind, route: '/session/steady-breath' },
  { id: 'body-softening', title: 'Body Softening', description: 'Release tension from your shoulders, jaw and body.', duration: '6 min', category: 'body', icon: Zap, route: '/session/release-relax' },
  { id: 'focus-reset', title: 'Focus Reset', description: 'Return to one next step without forcing productivity.', duration: '5 min', category: 'focus', icon: Focus, route: '/session/focused-pause' },
  { id: 'rainy-room', title: 'Rainy Room', description: 'A gentle ambient soundscape for unwinding.', duration: '5 min', category: 'sounds', icon: Headphones, route: '/session/gentle-unwind' },
];

export default function LibraryScreen() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = useMemo(
    () => activeCategory === 'all' ? routines : routines.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  async function toggleFavorite(item: LibraryItem) {
    if (!user) { toast.info('Sign in to save favorites.'); return; }
    const { data: existing, error: readError } = await supabase.from('favorites').select('id').eq('activity_slug', item.route.split('/').pop() ?? item.id).maybeSingle();
    if (readError) { toast.error('Favorites are not available yet. Please try again.'); return; }
    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      if (error) toast.error('We could not remove that favorite.'); else toast.success('Removed from favorites.');
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, activity_slug: item.route.split('/').pop() ?? item.id, activity_title: item.title, category: item.category === 'breathing' ? 'breathing' : item.category === 'sleep' || item.category === 'body' ? 'relaxation' : 'meditation' });
      if (error) toast.error('We could not save that favorite.'); else toast.success('Saved to favorites.');
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2F7D68] dark:text-[#8FCBB4]">Example library</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#24332F] dark:text-[#F4F7F3]">Find the right kind of calm</h1>
          <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">Demo content to help you choose quickly. Start with a need, not a long list of sessions.</p>
        </header>

        <section aria-labelledby="routines-heading" className="mb-8 rounded-3xl bg-[#2F7D68] p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#CDE9DC]">Guided routines</p>
              <h2 id="routines-heading" className="mt-1 font-serif text-2xl font-semibold">Four simple ways in</h2>
            </div>
            <Sparkles className="h-7 w-7 shrink-0 text-[#CDE9DC]" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {routines.filter((item) => item.featured).map((item) => {
              const Icon = item.icon;
              return <Link key={item.id} to={item.route} className="group rounded-2xl bg-[#245f51] p-4 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <div className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-[#CDE9DC]" aria-hidden="true" /><span className="text-sm font-medium text-[#E4F3EB]">{item.duration}</span></div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">Open routine <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>;
            })}
          </div>
        </section>

        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="font-serif text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">Browse by need</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Practice categories">
            {categories.map((category) => { const Icon = category.icon; const selected = activeCategory === category.id; return <button key={category.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveCategory(category.id)} className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] ${selected ? 'border-[#2F7D68] bg-[#2F7D68] text-white' : 'border-[#DDE5DF] bg-white text-[#66736D] hover:border-[#2F7D68] dark:border-[#2E423B] dark:bg-[#21302B] dark:text-[#C7D1CC]'}`}><Icon className="h-4 w-4" aria-hidden="true" />{category.label}</button>; })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => { const Icon = item.icon; return <Link key={item.id} to={item.route} className="flex min-h-[150px] flex-col rounded-2xl border border-[#DDE5DF] bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:border-[#2E423B] dark:bg-[#21302B]"><div className="flex items-center justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:bg-[#8FCBB4]/15 dark:text-[#8FCBB4]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="text-sm font-medium text-[#66736D] dark:text-[#A9B7B0]">{item.duration}</span></div><h3 className="mt-4 text-base font-semibold text-[#24332F] dark:text-[#F4F7F3]">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">{item.description}</p><div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className="flex items-center gap-1 text-sm font-semibold text-[#2F7D68] dark:text-[#8FCBB4]"><PlayCircle className="h-4 w-4" aria-hidden="true" /> Try example</span><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void toggleFavorite(item); }} className="min-h-[40px] rounded-lg px-2 text-sm font-semibold text-[#2F7D68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FCBB4]">Save</button></div></Link>; })}
          </div>
        </section>

        <p className="mt-8 rounded-2xl border border-[#DDE5DF] bg-[#F7F4EF] p-4 text-sm leading-relaxed text-[#66736D] dark:border-[#2E423B] dark:bg-[#21302B] dark:text-[#C7D1CC]"><strong className="text-[#24332F] dark:text-[#F4F7F3]">Demo content:</strong> these routines are examples for the first CALM PATH experience and are not medical treatment.</p>
      </div>
    </AppShell>
  );
}
