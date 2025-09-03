
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthSession, User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  refreshSession: () => Promise<AuthSession | null>;
  waitForSession: (timeoutMs?: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const { data: { session: newSession } } = await supabase.auth.getSession();
    setSession(newSession);
    setUser(newSession?.user ?? null);
    if (newSession?.user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newSession.user.id)
        .single();
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
    return newSession;
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      await refreshSession();
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        setLoading(true);
        if (newSession?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshSession]);
  
  const waitForSession = useCallback(async (timeoutMs = 3000) => {
    // This is a helper for the login flow to ensure the onAuthStateChange listener has fired
    // before we attempt to redirect the user.
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (user && profile) return true; // Check for user and profile
      await new Promise(r => setTimeout(r, 150));
    }
    return !!(user && profile);
  }, [user, profile]);


  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    refreshSession,
    waitForSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
