import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  House,
  Mail,
  Settings,
  SquareCheck,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string }[];
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "トップ", icon: House },
  { href: "/schedule", label: "スケジュール", icon: Calendar },
  {
    href: "/tasks",
    label: "やるべきこと",
    icon: SquareCheck,
    children: [
      { href: "/tasks", label: "月次課題" },
      { href: "/pages/archive-lecture", label: "アーカイブ" },
    ],
  },
];

export const supportNavItems: NavItem[] = [
  {
    href: "/pages/guide",
    label: "設定マニュアル",
    icon: BookOpen,
    children: [
      { href: "/pages/guide", label: "受講ガイド" },
      { href: "/pages/caution", label: "受講上の注意" },
      {
        href: "https://tayori.com/form/59d283f664136f1bf4525b0a7eef7d3814bcdd72",
        label: "運営へのお問い合わせ",
      },
    ],
  },
];

export const footerNavItems = [
  { href: "/settings", label: "設定", icon: Settings },
  { href: "mailto:support@example.com", label: "ログアウト", icon: Mail },
];

export const dashboardQuickLinks = [
  {
    href: "/pages/todo-1",
    label: "第1回講義が終わった方へ",
    icon: "check" as const,
  },
  {
    href: "/pages/intro-diagram",
    label: "【1ヶ月目】自己紹介の図解を作ってみる",
    icon: "palette" as const,
  },
  {
    href: "/pages/personal-workspace-ui",
    label: "【3ヶ月目】ひな形を自分の画面に仕上げる",
    icon: "monitor" as const,
  },
  {
    href: "/pages/archive-lecture",
    label: "講義アーカイブ",
    icon: "video" as const,
  },
  {
    href: "/pages/drill",
    label: "本気AIドリルの使い方",
    icon: "gamepad" as const,
  },
  {
    href: "/pages/slack-guide",
    label: "Slack利用ガイド",
    icon: "message" as const,
  },
];

export const scheduleEvents = [
  { date: "2026-04-10", label: "第1回講義", done: true },
  { date: "2026-04-17", label: "グループセッション", done: true },
  { date: "2026-04-24", label: "第2回講義", done: true },
  { date: "2026-05-01", label: "マコなり社長質問コーナー配信", done: true },
  { date: "2026-05-08", label: "月次課題 提出期限", done: true },
  { date: "2026-05-15", label: "第3回講義", done: true },
  { date: "2026-05-22", label: "グループセッション", done: true },
  { date: "2026-05-29", label: "第4回講義", done: true },
  { date: "2026-06-05", label: "月次課題 提出期限", done: true },
  { date: "2026-06-12", label: "マコなり社長質問コーナー配信", done: true },
  { date: "2026-06-19", label: "第5回講義", done: true },
  { date: "2026-06-20", label: "第8回講義", done: false },
  { date: "2026-06-26", label: "グループセッション", done: false },
  { date: "2026-06-27", label: "マコなり社長質問コーナー配信", done: false },
  { date: "2026-07-04", label: "月次課題 提出期限", done: false },
  { date: "2026-07-11", label: "第9回講義", done: false },
  { date: "2026-08-01", label: "卒業制作 提出期限", done: false },
  { date: "2026-08-15", label: "卒業制作発表会", done: false },
];
