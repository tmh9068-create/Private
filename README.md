# AI-Driven School 受講生ポータル（クローン）

[AI-Driven School 受講生ポータル](https://ai-driven-school-portal.com/) の Phase 1 実装です。

## 機能（Phase 1）

- **認証**: Auth.js v5 + Resend マジックリンク
- **開発用ログイン**: 登録済みメールでワンクリックログイン（開発環境のみ）
- **ダッシュボード**: スケジュール・やるべきことの概要
- **スケジュール**: 講義・GS・提出期限一覧
- **課題**: 月次課題一覧
- **コンテンツページ**: `/pages/*` ガイド・課題ページ（10ページ）
- **設定**: アカウント情報表示

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Auth.js v5 + Resend
- Prisma + SQLite（開発）/ PostgreSQL（本番想定）
- Tailwind CSS

## セットアップ

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 開発用ログイン

`npm run dev` 中は `/login` 画面下部の **開発用ログイン** ボタンからログインできます。

| メール | 用途 |
|---|---|
| `dev-fri@example.com` | 金曜クラス開発ユーザー |
| `dev-sat@example.com` | 土曜クラス開発ユーザー |

本番メールは `prisma/seed.ts` に追加して `npm run db:seed` を実行してください。

### 本番認証（Resend）

`.env` に以下を設定:

```env
AUTH_SECRET=長いランダム文字列
AUTH_URL=https://your-domain.com
AUTH_RESEND_KEY=re_xxxx
AUTH_RESEND_FROM=noreply@your-domain.com
DATABASE_URL=postgresql://...
```

## ページ構成

| パス | 説明 |
|---|---|
| `/login` | マジックリンクログイン |
| `/` | ダッシュボード |
| `/schedule` | スケジュール |
| `/tasks` | 月次課題 |
| `/settings` | 設定 |
| `/pages/[slug]` | コンテンツページ |

## Phase 2 予定

- 残り28コンテンツページの追加
- Mux 動画プレイヤー
- カレンダー連携（Google Calendar）
- 進捗トラッキング

## ライセンス

Private
