import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import AppShell from './AppShell';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    setPending(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'sign-up' && !result.data.session) {
      toast.success('Account created. Check your email to confirm it, then sign in.');
      setMode('sign-in');
      return;
    }
    toast.success(mode === 'sign-in' ? 'Welcome back.' : 'Your account is ready.');
    navigate('/profile');
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-[#66736D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back home
        </Link>
        <section className="mt-6 rounded-3xl border border-[#DDE5DF] bg-white p-6 shadow-sm dark:border-[#2E423B] dark:bg-[#21302B] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2F7D68]/10 text-[#2F7D68] dark:text-[#8FCBB4]">
              {mode === 'sign-in' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
              <p className="mt-1 text-sm text-[#66736D] dark:text-[#C7D1CC]">Save your calm practices and see your progress.</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === 'sign-up' && <div><label htmlFor="display-name" className="block text-sm font-semibold text-[#24332F] dark:text-[#F4F7F3]">Name</label><input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required className="mt-2 h-11 w-full rounded-xl border border-[#DDE5DF] bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:border-[#33443D] dark:bg-[#1C2A25]" /></div>}
            <div><label htmlFor="email" className="block text-sm font-semibold text-[#24332F] dark:text-[#F4F7F3]">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 h-11 w-full rounded-xl border border-[#DDE5DF] bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:border-[#33443D] dark:bg-[#1C2A25]" /></div>
            <div><label htmlFor="password" className="block text-sm font-semibold text-[#24332F] dark:text-[#F4F7F3]">Password</label><input id="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required className="mt-2 h-11 w-full rounded-xl border border-[#DDE5DF] bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:border-[#33443D] dark:bg-[#1C2A25]" /></div>
            {error && <p role="alert" className="rounded-xl bg-[#B94A48]/10 px-3 py-2 text-sm font-medium text-[#8A3A38]">We couldn&apos;t complete that request. Check your details and try again.</p>}
            <button type="submit" disabled={pending} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2F7D68] px-4 text-base font-semibold text-white transition-colors hover:bg-[#276B58] disabled:cursor-not-allowed disabled:opacity-70">
              {pending && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}{mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }} className="mt-5 min-h-[44px] w-full rounded-lg text-sm font-semibold text-[#2F7D68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FCBB4]">
            {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
