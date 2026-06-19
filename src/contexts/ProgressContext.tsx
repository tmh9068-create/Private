"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressState {
  completedLessonIds: string[];
  currentCourseId: string | null;
  currentLessonIndex: number;
  streak: number;
  totalXp: number;
}

interface ProgressContextValue extends ProgressState {
  loading: boolean;
  completeLesson: (lessonId: string, courseId: string, xp?: number) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const DEMO_PROGRESS_KEY = "majiai_demo_progress";

const defaultProgress: ProgressState = {
  completedLessonIds: [],
  currentCourseId: null,
  currentLessonIndex: 0,
  streak: 0,
  totalXp: 0,
};

function loadDemoProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress;
  const stored = localStorage.getItem(DEMO_PROGRESS_KEY);
  if (!stored) return defaultProgress;
  try {
    return JSON.parse(stored) as ProgressState;
  } catch {
    return defaultProgress;
  }
}

function saveDemoProgress(progress: ProgressState) {
  localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(progress));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setProgress(defaultProgress);
      setLoading(false);
      return;
    }

    if (isDemo || !isSupabaseConfigured() || !supabase) {
      setProgress(loadDemoProgress());
      setLoading(false);
      return;
    }

    const { data: deviceProgress } = await supabase
      .from("drill_device_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: completions } = await supabase
      .from("drill_lesson_completions")
      .select("lesson_id")
      .eq("user_id", user.id);

    const { data: stats } = await supabase.rpc("get_user_stats", {
      p_user_id: user.id,
    });

    setProgress({
      completedLessonIds: completions?.map((c) => c.lesson_id) ?? [],
      currentCourseId: deviceProgress?.current_course_id ?? null,
      currentLessonIndex: deviceProgress?.current_lesson_index ?? 0,
      streak: deviceProgress?.streak ?? 0,
      totalXp: stats?.total_xp ?? 0,
    });
    setLoading(false);
  }, [user, isDemo, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeLesson = useCallback(
    async (lessonId: string, courseId: string, xp = 10) => {
      if (!user) return;

      if (isDemo || !isSupabaseConfigured() || !supabase) {
        const current = loadDemoProgress();
        const newStreak =
          current.completedLessonIds.includes(lessonId)
            ? current.streak
            : current.streak + 1;

        const updated: ProgressState = {
          ...current,
          completedLessonIds: current.completedLessonIds.includes(lessonId)
            ? current.completedLessonIds
            : [...current.completedLessonIds, lessonId],
          currentCourseId: courseId,
          streak: newStreak,
          totalXp: current.totalXp + xp,
        };
        saveDemoProgress(updated);
        setProgress(updated);
        return;
      }

      await supabase.rpc("complete_lesson", {
        p_lesson_id: lessonId,
        p_course_id: courseId,
      });
      await refresh();
    },
    [user, isDemo, supabase, refresh]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds]
  );

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        loading,
        completeLesson,
        isLessonCompleted,
        refresh,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return context;
}
