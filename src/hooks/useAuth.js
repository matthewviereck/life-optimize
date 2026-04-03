import { useState, useEffect, createContext, useContext, createElement } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured' } };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error && error.message === 'Invalid login credentials') {
      // Try signing up if login fails (first-time use)
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return { error: signUpError };
      // Try signing in again after signup
      const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
      return { error: retryError };
    }
    return { error };
  }

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  return createElement(AuthContext.Provider, {
    value: { user, loading, signIn, signOut, isConfigured: isSupabaseConfigured() }
  }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
