export interface DrillSeries {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface DrillCourse {
  id: string;
  series_id: string;
  title: string;
  description: string;
  icon: string;
  series_order: number;
  sort_order: number;
  is_active: boolean;
}

export interface DrillLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  quiz_path?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: "choice" | "multiple" | "text" | "ordering" | "diagram";
  question: string;
  options?: QuizOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  hint?: string;
  diagram?: string;
}

export interface QuizData {
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_icon: string | null;
  avatar_url: string | null;
  friend_code: string;
  friend_ranking_opt_in: boolean;
}

export interface UserProgress {
  user_id: string;
  current_course_id: string | null;
  current_lesson_index: number;
  streak: number;
  last_active_date: string | null;
}

export interface UserStats {
  total_xp: number;
  lessons_completed: number;
  courses_completed: number;
  series_completed: number;
  current_streak: number;
  longest_streak: number;
}

export interface FriendProfile {
  id: string;
  display_name: string | null;
  avatar_icon: string | null;
  friend_code: string;
  total_xp?: number;
  streak?: number;
}

export interface RankingEntry {
  rank: number;
  user_id: string;
  display_name: string | null;
  avatar_icon: string | null;
  total_xp: number;
  streak: number;
}
