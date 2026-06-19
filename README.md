# AI-Driven School 受講生ポータル（クローン）

[AI-Driven School 受講生ポータル](https://ai-driven-school-portal.com/) のクローン実装です。

## 機能

### Phase 1
- **認証**: Auth.js v5 + Resend マジックリンク
- **開発用ログイン**: 登録済みメールでワンクリックログイン（開発環境のみ）
- **ダッシュボード**: スケジュール・やるべきことの概要
- **サイドバーレイアウト**: ADS ポータル準拠のデザイン

### Phase 2
- **全33コンテンツページ**: 本番ポータルから抽出した HTML コンテンツ
- **Mux 動画プレイヤー**: 講義アーカイブ・埋め込み動画対応
- **進捗トラッキング**: ページ完了チェック（DB 保存）
- **Google カレンダー連携**: スケジュールページに iframe 埋め込み（任意）

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Auth.js v5 + Resend
- Prisma + SQLite（開発）/ PostgreSQL（本番想定）
- Tailwind CSS + Mux Player

## セットアップ

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

### 開発用ログイン

| メール | 用途 |
|---|---|
| `dev-fri@example.com` | 金曜クラス開発ユーザー |
| `dev-sat@example.com` | 土曜クラス開発ユーザー |

### 本番認証（Resend）

```env
AUTH_SECRET=長いランダム文字列
AUTH_URL=https://your-domain.com
AUTH_RESEND_KEY=re_xxxx
AUTH_RESEND_FROM=noreply@your-domain.com
DATABASE_URL=postgresql://...
```

### Google カレンダー（任意）

```env
NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL=https://calendar.google.com/calendar/embed?src=...
```

## ページ構成

| パス | 説明 |
|---|---|
| `/login` | マジックリンクログイン |
| `/` | ダッシュボード |
| `/schedule` | スケジュール + Googleカレンダー |
| `/tasks` | 月次課題・講義後タスク（進捗表示） |
| `/settings` | 設定 |
| `/pages/[slug]` | コンテンツページ（33件） |

## API

| エンドポイント | 説明 |
|---|---|
| `GET /api/progress` | ユーザーのページ進捗取得 |
| `POST /api/progress` | ページ完了状態を更新 |

## ライセンス

Private
