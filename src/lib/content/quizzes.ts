import type { QuizData } from "@/types";

const quizzes: Record<string, QuizData> = {
  "git-tour": {
    lessonId: "git-tour",
    title: "Gitツアー",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "Gitは何をするためのツールですか？",
        options: [
          { id: "a", text: "ファイルの変更履歴を管理する" },
          { id: "b", text: "ウェブサイトを公開する" },
          { id: "c", text: "画像を編集する" },
          { id: "d", text: "メールを送受信する" },
        ],
        correctAnswer: "a",
        explanation:
          "Gitはバージョン管理システムで、ファイルの変更履歴を記録・管理するためのツールです。",
      },
      {
        id: "q2",
        type: "choice",
        question: "Gitで変更を記録する操作は何ですか？",
        options: [
          { id: "a", text: "commit（コミット）" },
          { id: "b", text: "push（プッシュ）" },
          { id: "c", text: "pull（プル）" },
          { id: "d", text: "merge（マージ）" },
        ],
        correctAnswer: "a",
        explanation:
          "コミットは変更をローカルリポジトリに記録する操作です。",
      },
      {
        id: "q3",
        type: "choice",
        question: "リポジトリとは何ですか？",
        options: [
          { id: "a", text: "プロジェクトの変更履歴を保存する場所" },
          { id: "b", text: "プログラミング言語の一種" },
          { id: "c", text: "クラウドストレージサービス" },
          { id: "d", text: "テキストエディタ" },
        ],
        correctAnswer: "a",
        explanation:
          "リポジトリはプロジェクトのファイルと変更履歴を保存する場所です。",
      },
    ],
  },
  "git-what": {
    lessonId: "git-what",
    title: "Gitとは",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "バージョン管理システムの主な利点は何ですか？",
        options: [
          { id: "a", text: "過去の状態に戻せる" },
          { id: "b", text: "ファイルサイズが小さくなる" },
          { id: "c", text: "インターネットが不要になる" },
          { id: "d", text: "ウイルスを防げる" },
        ],
        correctAnswer: "a",
        explanation:
          "バージョン管理により、いつでも過去の状態に戻すことができます。",
      },
      {
        id: "q2",
        type: "choice",
        question: "GitHubは何ですか？",
        options: [
          { id: "a", text: "Gitリポジトリのホスティングサービス" },
          { id: "b", text: "Gitの別名" },
          { id: "c", text: "プログラミング言語" },
          { id: "d", text: "オペレーティングシステム" },
        ],
        correctAnswer: "a",
        explanation:
          "GitHubはGitリポジトリをクラウド上でホスト・共有するサービスです。",
      },
    ],
  },
  "git-init": {
    lessonId: "git-init",
    title: "リポジトリの作成",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "新しいGitリポジトリを作成するコマンドは？",
        options: [
          { id: "a", text: "git init" },
          { id: "b", text: "git start" },
          { id: "c", text: "git new" },
          { id: "d", text: "git create" },
        ],
        correctAnswer: "a",
        explanation: "`git init` で現在のディレクトリに新しいリポジトリを作成します。",
      },
    ],
  },
  "git-commit": {
    lessonId: "git-commit",
    title: "コミット",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "変更をステージングエリアに追加するコマンドは？",
        options: [
          { id: "a", text: "git add" },
          { id: "b", text: "git stage" },
          { id: "c", text: "git put" },
          { id: "d", text: "git save" },
        ],
        correctAnswer: "a",
        explanation: "`git add` で変更をステージングエリアに追加します。",
      },
      {
        id: "q2",
        type: "choice",
        question: "コミットメッセージを付けてコミットするコマンドは？",
        options: [
          { id: "a", text: "git commit -m \"メッセージ\"" },
          { id: "b", text: "git save -m \"メッセージ\"" },
          { id: "c", text: "git push -m \"メッセージ\"" },
          { id: "d", text: "git write -m \"メッセージ\"" },
        ],
        correctAnswer: "a",
        explanation: "`git commit -m` でメッセージ付きのコミットができます。",
      },
    ],
  },
  "ai-what": {
    lessonId: "ai-what",
    title: "AIとは何か",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "AI（人工知能）の定義として最も適切なものは？",
        options: [
          { id: "a", text: "人間の知能を模倣するコンピュータシステム" },
          { id: "b", text: "高速な計算機" },
          { id: "c", text: "インターネット上の検索エンジン" },
          { id: "d", text: "データベース管理システム" },
        ],
        correctAnswer: "a",
        explanation:
          "AIは人間の知能（学習、推論、問題解決など）をコンピュータで実現する技術です。",
      },
    ],
  },
  "ai-ml": {
    lessonId: "ai-ml",
    title: "機械学習の基礎",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "機械学習の特徴として正しいものは？",
        options: [
          { id: "a", text: "データからパターンを自動的に学習する" },
          { id: "b", text: "すべてのルールを人間が手動で設定する" },
          { id: "c", text: "インターネット接続が必須" },
          { id: "d", text: "画像のみを処理できる" },
        ],
        correctAnswer: "a",
        explanation:
          "機械学習はデータからパターンを見つけ、予測や分類を行う手法です。",
      },
    ],
  },
  "prompt-basics": {
    lessonId: "prompt-basics",
    title: "プロンプトの基本",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "効果的なプロンプトの特徴は？",
        options: [
          { id: "a", text: "具体的で明確な指示を含む" },
          { id: "b", text: "できるだけ短くする" },
          { id: "c", text: "専門用語を使わない" },
          { id: "d", text: "質問形式にしない" },
        ],
        correctAnswer: "a",
        explanation:
          "具体的で明確な指示を含むプロンプトほど、AIは期待通りの回答を生成できます。",
      },
    ],
  },
  "prog-variables": {
    lessonId: "prog-variables",
    title: "変数と型",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "変数の役割として正しいものは？",
        options: [
          { id: "a", text: "データを名前で保存する" },
          { id: "b", text: "プログラムを高速化する" },
          { id: "c", text: "エラーを防ぐ" },
          { id: "d", text: "画面を表示する" },
        ],
        correctAnswer: "a",
        explanation: "変数はデータに名前を付けて保存し、後から参照できるようにします。",
      },
    ],
  },
  "prog-conditions": {
    lessonId: "prog-conditions",
    title: "条件分岐",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "条件分岐の目的は？",
        options: [
          { id: "a", text: "条件に応じて異なる処理を実行する" },
          { id: "b", text: "プログラムを繰り返し実行する" },
          { id: "c", text: "変数を定義する" },
          { id: "d", text: "関数を呼び出す" },
        ],
        correctAnswer: "a",
        explanation:
          "条件分岐（if文など）により、状況に応じて異なる処理を実行できます。",
      },
    ],
  },
};

export function getQuiz(lessonId: string): QuizData | null {
  return quizzes[lessonId] ?? null;
}

export function getAllQuizLessonIds(): string[] {
  return Object.keys(quizzes);
}
