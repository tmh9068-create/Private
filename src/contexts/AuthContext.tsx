"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_KEY = "majiai_demo_user";

function createDemoUser(email: string): User {
  return {
    id: "demo-user-id",
    email,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

function createDemoProfile(): UserProfile {
  return {
    id: "demo-user-id",
    display_name: "デモユーザー",
    avatar_icon: "maji-kun",
    avatar_url: null,
    friend_code: "DEMO01",
    friend_ranking_opt_in: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    if (isDemo || !supabase) {
      setProfile(createDemoProfile());
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data as UserProfile);
    }
  }, [user, isDemo, supabase]);

  useEffect(() => {
    const init = async () => {
      if (!isSupabaseConfigured()) {
        const stored = localStorage.getItem(DEMO_USER_KEY);
        if (stored) {
          setUser(createDemoUser(stored));
          setProfile(createDemoProfile());
          setIsDemo(true);
        }
        setLoading(false);
        return;
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    };

    init();
  }, [supabase]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        if (password.length < 6) {
          return { error: new Error("パスワードは6文字以上で入力してください") };
        }
        localStorage.setItem(DEMO_USER_KEY, email);
        setUser(createDemoUser(email));
        setProfile(createDemoProfile());
        setIsDemo(true);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        if (password.length < 6) {
          return { error: new Error("パスワードは6文字以上で入力してください") };
        }
        localStorage.setItem(DEMO_USER_KEY, email);
        setUser(createDemoUser(email));
        setProfile(createDemoProfile());
        setIsDemo(true);
        return { error: null };
      }

      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (isDemo || !supabase) {
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setProfile(null);
      setIsDemo(false);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase, isDemo]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: null };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: null };
      }
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error ? new Error(error.message) : null };
    },
    [supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
