import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from './AppShell';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

type Plan = 'monthly' | 'annual';

interface Subscription {
  status: string;
  plan: Plan;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const PLAN_COPY: Record<Plan, { name: string; price: string; interval: string; summary: string; savings?: string }> = {
  monthly: { name: 'Monthly', price: '$4.99', interval: 'Billed monthly', summary: 'Renews every month until canceled.' },
  annual: { name: 'Annual', price: '$39.99', interval: 'Billed annually', summary: 'Renews every year until canceled.', savings: 'Save compared with monthly billing.' },
};

export default function SubscriptionScreen() {
  const { user, loading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const selected = useMemo(() => PLAN_COPY[selectedPlan], [selectedPlan]);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    let mounted = true;
    void supabase
      .from('subscriptions')
      .select('status, plan, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setMessage('Your subscription status is not available yet. Please try again later.');
        } else {
          setSubscription(data as Subscription | null);
        }
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [authLoading, user]);

  async function startCheckout() {
    if (!user) {
      setMessage('Sign in before starting checkout.');
      return;
    }
    setPending(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { plan: selectedPlan },
    });
    setPending(false);
    if (error || !data?.url) {
      setMessage('Checkout is not configured yet. The payment provider must be connected before a purchase can start.');
      return;
    }
    window.location.assign(data.url as string);
  }

  async function restorePurchase() {
    if (!user) return;
    setPending(true);
    const { data, error } = await supabase.functions.invoke('restore-subscription');
    setPending(false);
    if (error) {
      setMessage('We could not restore your purchase. Please try again or contact support.');
      return;
    }
    setSubscription(data?.subscription ?? null);
    toast.success('Purchase status refreshed.');
  }

  async function manageSubscription() {
    if (!user) return;
    setPending(true);
    const { data, error } = await supabase.functions.invoke('create-customer-portal-session');
    setPending(false);
    if (error || !data?.url) {
      setMessage('Subscription management is not configured yet.');
      return;
    }
    window.location.assign(data.url as string);
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <Link to="/profile" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-semibold text-[#66736D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#C7D1CC]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to profile</Link>
        <header className="mt-6"><p className="text-sm font-semibold uppercase tracking-wide text-[#2F7D68] dark:text-[#8FCBB4]">Premium access</p><h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#24332F] dark:text-[#F4F7F3]">Choose the pace that fits you</h1><p className="mt-3 max-w-[58ch] text-base leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">Unlock premium practices while keeping your plan, price, renewal and cancellation terms clear before you pay. Prices are in USD.</p></header>

        {isActive && subscription && <section className="mt-6 rounded-2xl border border-[#2F7D68]/30 bg-[#2F7D68]/8 p-5 dark:bg-[#8FCBB4]/10" aria-labelledby="subscription-status"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#2F7D68] dark:text-[#8FCBB4]" /><div className="min-w-0"><h2 id="subscription-status" className="font-semibold text-[#24332F] dark:text-[#F4F7F3]">Your subscription is active</h2><p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">{PLAN_COPY[subscription.plan].name} plan · {subscription.cancel_at_period_end ? 'Access ends at the current period end.' : 'Renews automatically.'}</p>{subscription.current_period_end && <p className="mt-2 text-sm font-semibold text-[#24332F] dark:text-[#F4F7F3]">{subscription.cancel_at_period_end ? 'Access until' : 'Next renewal'}: {new Date(subscription.current_period_end).toLocaleDateString()}</p>}<div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void manageSubscription()} disabled={pending} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#2F7D68] px-4 text-sm font-semibold text-[#2F7D68] hover:bg-[#2F7D68]/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} Manage or cancel plan</button><button id="restore" type="button" onClick={() => void restorePurchase()} disabled={pending || !user} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#2F7D68] hover:bg-[#2F7D68]/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FCBB4]"><RefreshCw className="h-4 w-4" /> Restore purchase</button></div></div></div></section>}

        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Subscription plans">
          {(Object.keys(PLAN_COPY) as Plan[]).map((plan) => { const copy = PLAN_COPY[plan]; const chosen = selectedPlan === plan; return <button key={plan} type="button" onClick={() => setSelectedPlan(plan)} aria-pressed={chosen} className={`relative rounded-2xl border-2 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] ${chosen ? 'border-[#2F7D68] bg-[#2F7D68]/8 dark:bg-[#8FCBB4]/10' : 'border-[#DDE5DF] bg-white hover:border-[#2F7D68]/50 dark:border-[#2E423B] dark:bg-[#21302B]'}`}><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold text-[#24332F] dark:text-[#F4F7F3]">{copy.name}</p><p className="mt-2 text-base font-semibold text-[#2F7D68] dark:text-[#8FCBB4]">{copy.price}</p></div>{chosen && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F7D68] text-white"><Check className="h-4 w-4" /></span>}</div><p className="mt-3 text-sm font-medium text-[#66736D] dark:text-[#C7D1CC]">{copy.interval}</p><p className="mt-2 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">{copy.summary}</p>{copy.savings && <p className="mt-3 text-sm font-semibold text-[#2F7D68] dark:text-[#8FCBB4]">{copy.savings}</p>}</button>; })}
        </section>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-5 dark:border-[#2E423B] dark:bg-[#21302B]"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#2F7D68] dark:text-[#8FCBB4]" /><div><h2 className="font-semibold text-[#24332F] dark:text-[#F4F7F3]">Before payment</h2><p className="mt-1 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">You will review the exact price, billing interval, renewal date and cancellation terms in the secure checkout before confirming payment. Calm Path does not collect card details.</p></div></div></div>

        {message && <p role="alert" className="mt-4 rounded-2xl border border-[#B94A48]/30 bg-[#B94A48]/10 p-4 text-sm font-medium leading-relaxed text-[#8A3A38]">{message}</p>}
        <div className="mt-6 flex flex-col gap-3"><button type="button" onClick={() => setShowConfirmation(true)} disabled={pending || isActive || loading} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#2F7D68] px-6 text-base font-semibold text-white hover:bg-[#276B58] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">{pending && <Loader2 className="h-5 w-5 animate-spin" />}Continue to secure checkout</button><button type="button" onClick={() => void restorePurchase()} disabled={pending || !user} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#2F7D68] hover:bg-[#2F7D68]/5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68] dark:text-[#8FCBB4]"><RefreshCw className="h-4 w-4" /> Restore purchase</button></div>

        {showConfirmation && <div className="mt-6 rounded-2xl border-2 border-[#2F7D68] bg-white p-5 shadow-sm dark:bg-[#21302B]" role="dialog" aria-labelledby="confirm-payment-title"><h2 id="confirm-payment-title" className="font-serif text-xl font-semibold text-[#24332F] dark:text-[#F4F7F3]">Review before checkout</h2><p className="mt-3 text-base leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">You selected the <strong className="text-[#24332F] dark:text-[#F4F7F3]">{selected.name}</strong> plan at <strong className="text-[#24332F] dark:text-[#F4F7F3]">{selected.price} USD</strong>, {selected.interval.toLowerCase()}. It renews automatically until canceled. The secure checkout will show the final renewal date and cancellation terms before payment is submitted.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row-reverse"><button type="button" onClick={() => { setShowConfirmation(false); void startCheckout(); }} className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#2F7D68] px-4 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">Open secure checkout</button><button type="button" onClick={() => setShowConfirmation(false)} className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#DDE5DF] px-4 text-base font-semibold text-[#24332F] dark:border-[#33443D] dark:text-[#F4F7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D68]">Not yet</button></div></div>}
        <p className="mt-6 text-sm leading-relaxed text-[#66736D] dark:text-[#C7D1CC]">Plans renew automatically unless canceled through the secure subscription portal before the next renewal. Monthly: $4.99 USD/month. Annual: $39.99 USD/year. No payment is simulated.</p>
      </div>
    </AppShell>
  );
}
