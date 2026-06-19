# 本気AIドリル クローン

[本気AIドリル](https://drill.ma-ji.ai/) と同じUI・機能を持つ学習プラットフォームのクローン実装です。

## 機能

- **認証**: ログイン、新規登録、パスワードリセット
- **学習**: シリーズ → コース → レッスン → クイズの階層構造
- **ゲーミフィケーション**: XP、ストリーク、進捗バー
- **ソーシャル**: フレンド追加、フレンドランキング
- **プロフィール**: アイコン選択、フレンドコード

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (認証 + PostgreSQL)
- **デプロイ**: Vercel 対応

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

### デモモード

Supabase の環境変数を設定しない場合、**デモモード**で動作します。
任意のメールアドレスとパスワード（6文字以上）でログインでき、進捗は localStorage に保存されます。

### Supabase 連携（本番用）

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `supabase/schema.sql` を SQL Editor で実行
3. `.env.local` に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## ページ構成

| パス | 説明 |
|------|------|
| `/login` | ログイン |
| `/signup` | 新規登録 |
| `/forgot-password` | パスワードリセット |
| `/home` | ホーム（シリーズ一覧） |
| `/series/[id]` | シリーズ詳細（コース・レッスン） |
| `/drill` | クイズ画面 |
| `/lesson-complete` | レッスン完了 |
| `/friends` | フレンド一覧 |
| `/add-friend` | フレンド追加 |
| `/ranking` | フレンドランキング |
| `/profile` | プロフィール |
| `/settings` | 設定 |

## 学習コンテンツ

`src/lib/content/` にシリーズ・コース・レッスン・クイズデータを定義しています。

- Git入門（2コース、4レッスン）
- AI基礎（2コース、3レッスン）
- プログラミング入門（1コース、2レッスン）

## ライセンス

Private
