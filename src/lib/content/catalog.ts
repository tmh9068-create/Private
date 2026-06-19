import type { DrillSeries, DrillCourse, DrillLesson } from "@/types";

export const SERIES: DrillSeries[] = [
  {
    id: "git",
    title: "Git入門",
    description: "バージョン管理の基礎から実践まで",
    icon: "git-branch",
    color: "#f97316",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "ai-basics",
    title: "AI基礎",
    description: "AIの仕組みと活用方法を学ぶ",
    icon: "brain",
    color: "#8b5cf6",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "programming",
    title: "プログラミング入門",
    description: "コードの書き方と考え方を身につける",
    icon: "code",
    color: "#06b6d4",
    sort_order: 3,
    is_active: true,
  },
];

export const COURSES: DrillCourse[] = [
  {
    id: "git-concept",
    series_id: "git",
    title: "Gitの概念",
    description: "Gitとは何か、なぜ必要なのかを理解する",
    icon: "book-open",
    series_order: 1,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "git-solo",
    series_id: "git",
    title: "一人で使うGit",
    description: "基本操作をマスターする",
    icon: "user",
    series_order: 2,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "ai-concept",
    series_id: "ai-basics",
    title: "AIの基本概念",
    description: "機械学習とディープラーニングの違い",
    icon: "lightbulb",
    series_order: 1,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "ai-prompt",
    series_id: "ai-basics",
    title: "プロンプトエンジニアリング",
    description: "効果的なAIへの指示の出し方",
    icon: "message-square",
    series_order: 2,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "prog-basics",
    series_id: "programming",
    title: "プログラミングの基礎",
    description: "変数、条件分岐、ループを学ぶ",
    icon: "terminal",
    series_order: 1,
    sort_order: 1,
    is_active: true,
  },
];

export const LESSONS: DrillLesson[] = [
  {
    id: "git-tour",
    course_id: "git-concept",
    title: "Gitツアー",
    description: "Gitの世界を探検しよう",
    sort_order: 1,
    is_active: true,
    quiz_path: "git/01-git-concept/lessons/01-tour",
  },
  {
    id: "git-what",
    course_id: "git-concept",
    title: "Gitとは",
    description: "バージョン管理システムの基本",
    sort_order: 2,
    is_active: true,
    quiz_path: "git/01-git-concept/lessons/02-what",
  },
  {
    id: "git-init",
    course_id: "git-solo",
    title: "リポジトリの作成",
    description: "git init と git clone",
    sort_order: 1,
    is_active: true,
    quiz_path: "git/02-git-solo/lessons/01-init",
  },
  {
    id: "git-commit",
    course_id: "git-solo",
    title: "コミット",
    description: "変更を記録する",
    sort_order: 2,
    is_active: true,
    quiz_path: "git/02-git-solo/lessons/02-commit",
  },
  {
    id: "ai-what",
    course_id: "ai-concept",
    title: "AIとは何か",
    description: "人工知能の定義と歴史",
    sort_order: 1,
    is_active: true,
    quiz_path: "ai/01-ai-concept/lessons/01-what",
  },
  {
    id: "ai-ml",
    course_id: "ai-concept",
    title: "機械学習の基礎",
    description: "データから学ぶ仕組み",
    sort_order: 2,
    is_active: true,
    quiz_path: "ai/01-ai-concept/lessons/02-ml",
  },
  {
    id: "prompt-basics",
    course_id: "ai-prompt",
    title: "プロンプトの基本",
    description: "良い指示の出し方",
    sort_order: 1,
    is_active: true,
    quiz_path: "ai/02-ai-prompt/lessons/01-basics",
  },
  {
    id: "prog-variables",
    course_id: "prog-basics",
    title: "変数と型",
    description: "データの保存と操作",
    sort_order: 1,
    is_active: true,
    quiz_path: "programming/01-basics/lessons/01-variables",
  },
  {
    id: "prog-conditions",
    course_id: "prog-basics",
    title: "条件分岐",
    description: "if文で分岐する",
    sort_order: 2,
    is_active: true,
    quiz_path: "programming/01-basics/lessons/02-conditions",
  },
];

export function getSeries(id: string) {
  return SERIES.find((s) => s.id === id);
}

export function getCoursesBySeries(seriesId: string) {
  return COURSES.filter((c) => c.series_id === seriesId && c.is_active).sort(
    (a, b) => a.series_order - b.series_order
  );
}

export function getLessonsByCourse(courseId: string) {
  return LESSONS.filter((l) => l.course_id === courseId && l.is_active).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}
