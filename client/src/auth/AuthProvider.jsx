import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context.js';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      async register({ email, password, displayName, username }) {
        if (!supabase) throw new Error('Supabase is not configured');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName, username } },
        });
        if (error) throw error;
        return data;
      },
      async login({ email, password }) {
        if (!supabase) throw new Error('Supabase is not configured');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      },
      async logout() {
        if (!supabase) throw new Error('Supabase is not configured');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
