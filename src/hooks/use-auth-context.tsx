
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

const supabase = createClient();

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  waitForSession: (timeoutMs?: number) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if(error) {
        console.error("Error refreshing session:", error);
        setProfile(null);
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
    }

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
        const profileData = await getProfile(session.user);
        setProfile(profileData);
    } else {
        setProfile(null);
    }
    setLoading(false);
  }, [getProfile]);

  useEffect(() => {
    refreshSession(); // Initial session load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(true);
          const profileData = await getProfile(session.user);
          setProfile(profileData);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getProfile, refreshSession]);
  
  const waitForSession = useCallback(async (timeoutMs = 5000) => {
    if (session) return true;
    
    return new Promise<boolean>((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (supabase.auth.getSession()) {
                clearInterval(interval);
                resolve(true);
            } else if (Date.now() - startTime > timeoutMs) {
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
  }, [session]);

  const value = {
    user,
    session,
    profile,
    loading,
    refreshSession,
    waitForSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
