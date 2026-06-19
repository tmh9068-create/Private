# デプロイ手順（AI-Driven School 受講生ポータル）

## 前提

本番環境では以下が必須です。

| サービス | 用途 |
|---|---|
| **Vercel** | ホスティング |
| **PostgreSQL**（Neon / Vercel Postgres 等） | データベース |
| **Resend** | マジックリンクメール送信 |
| **Mux**（任意） | 講義動画配信 |

---

## 1. データベース（PostgreSQL）

### ローカル開発（Docker）

```bash
npm run setup
# または手動:
docker compose up -d
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
```

### 本番（Neon 推奨）

1. [Neon](https://neon.tech) でプロジェクトを作成
2. 接続文字列をコピー
3. Vercel の環境変数 `DATABASE_URL` に設定

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## 2. Resend（メール認証）

1. [Resend](https://resend.com) でアカウント作成
2. 送信ドメインを認証
3. API キーを発行

Vercel 環境変数:

```env
AUTH_RESEND_KEY=re_xxxxxxxx
AUTH_RESEND_FROM=noreply@your-domain.com
```

---

## 3. Vercel デプロイ

### A. ダッシュボードから（推奨）

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub リポジトリ `Private` を選択
3. 環境変数を設定（下記参照）
4. **Deploy**

### B. GitHub Actions（CI/CD）

GitHub Secrets に設定:

| Secret | 値 |
|---|---|
| `VERCEL_TOKEN` | Vercel API トークン |
| `VERCEL_ORG_ID` | Vercel 組織 ID |
| `VERCEL_PROJECT_ID` | プロジェクト ID |

`main` ブランチへの push で自動デプロイされます（`.github/workflows/deploy-vercel.yml`）。

---

## 4. 環境変数一覧

| 変数 | 必須 | 説明 |
|---|---|---|
| `AUTH_SECRET` | ✅ | ランダムな長い文字列（`openssl rand -base64 32`） |
| `AUTH_URL` | △ | 本番 URL。Vercel では未設定でも `VERCEL_URL` から自動検出 |
| `DATABASE_URL` | ✅ | PostgreSQL 接続文字列 |
| `AUTH_RESEND_KEY` | ✅ | Resend API キー |
| `AUTH_RESEND_FROM` | ✅ | 送信元メール（認証済みドメイン） |
| `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL` | 任意 | Google カレンダー埋め込み URL |
| `MUX_PLAYBACK_IDS` | 任意 | 講義動画 ID（カンマ区切り） |

### Mux 動画 ID の設定例

```env
MUX_PLAYBACK_IDS=, , , XP8bQlNaacRPgGCgB9CXlgvWnDaMiqgzzGqnNFXyBAU
```

講義回数順にカンマ区切り。未設定の回は「準備中」と表示されます。

---

## 5. デプロイ後の初期設定

`prisma/seed.ts` に受講生のメールアドレスを追加するか、環境変数 `SEED_EMAILS` で指定:

```json
[
  {
    "email": "student@example.com",
    "name": "受講生太郎",
    "classKey": "fri",
    "team": "bat",
    "term": 1,
    "cohortId": "t1-fri",
    "cohortName": "金曜クラス"
  }
]
```

### ローカル / CLI

```bash
DATABASE_URL="postgresql://..." npm run bootstrap:production
```

### GitHub Actions（手動）

GitHub Secrets に `DATABASE_URL` と `SEED_EMAILS`（JSON 配列）を設定後、  
**Actions → Seed Database → Run workflow** を実行。

---

## 6. ヘルスチェック

```
GET /api/health
→ { "status": "ok", "service": "student-portal" }
```

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| マジックリンクが届かない | `AUTH_RESEND_KEY` / `AUTH_RESEND_FROM` を確認 |
| ログイン後にエラー | `DATABASE_URL` と `prisma migrate deploy` を確認 |
| ビルド失敗 | Vercel の Build Command が `npm run vercel-build` か確認 |
