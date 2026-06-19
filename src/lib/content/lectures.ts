export type LectureVideo = {
  id: number;
  title: string;
  date: string;
  playbackId?: string;
  description?: string;
};

export const lectureVideos: LectureVideo[] = [
  {
    id: 1,
    title: "第1回講義",
    date: "2026-04-10",
    description: "プログラム導入・AI開発の全体像",
  },
  {
    id: 2,
    title: "第2回講義",
    date: "2026-04-24",
    description: "Cursor と開発環境のセットアップ",
  },
  {
    id: 3,
    title: "第3回講義",
    date: "2026-05-15",
    description: "図解ツールとスキルの作り方",
  },
  {
    id: 4,
    title: "第4回講義",
    date: "2026-06-05",
    description: "自動化ツールの設計",
    playbackId: "XP8bQlNaacRPgGCgB9CXlgvWnDaMiqgzzGqnNFXyBAU",
  },
];
