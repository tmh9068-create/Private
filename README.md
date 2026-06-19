# AI-Driven School 受講生ポータル（クローン）

[AI-Driven School 受講生ポータル](https://ai-driven-school-portal.com/) のクローン実装です。

## 機能

- **認証**: Auth.js v5 + Resend マジックリンク（ADS ブランドメール）
- **全33コンテンツページ**: 本番ポータルから抽出
- **Mux 動画**: 講義アーカイブ対応
- **進捗トラッキング**: ページ完了チェック
- **Google カレンダー**: スケジュール埋め込み（任意）
- **本番デプロイ**: Vercel + PostgreSQL + Prisma migrations

## クイックスタート

```bash
npm install
docker compose up -d          # PostgreSQL 起動
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

開発用ログイン: `/login` 画面下部の **開発太郎** ボタン

## 本番デプロイ

詳細は [DEPLOY.md](./DEPLOY.md) を参照してください。

```bash
# Vercel 環境変数（最低限）
AUTH_SECRET=...
AUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://...
AUTH_RESEND_KEY=re_...
AUTH_RESEND_FROM=noreply@your-domain.com
```

## ページ構成

| パス | 説明 |
|---|---|
| `/login` | マジックリンクログイン |
| `/` | ダッシュボード |
| `/schedule` | スケジュール |
| `/tasks` | 月次課題・進捗 |
| `/pages/[slug]` | コンテンツ（33件） |
| `/privacy` `/terms` | 法的ページ |
| `/api/health` | ヘルスチェック |

## ライセンス

Private
