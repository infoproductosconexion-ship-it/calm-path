import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};
    const completeInitialSession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => {
      completeInitialSession(data.session);
    }).catch(() => {
      completeInitialSession(null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });
    unsubscribe = () => data.subscription.unsubscribe();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
