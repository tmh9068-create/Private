# デプロイ手順

## 方法1: GitHub Pages（無料・恒久的）

`gh-pages` ブランチへのデプロイは **完了済み** です。あと1ステップで公開されます。

### 公開手順（1分）

1. リポジトリの **Settings → Pages** を開く  
   https://github.com/tmh9068-create/Private/settings/pages
2. **Build and deployment** で以下を設定:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **/ (root)**
3. **Save** をクリック

数分後、以下のURLでアクセスできます:

**https://tmh9068-create.github.io/Private/**

`main` ブランチへの push で GitHub Actions が自動的に `gh-pages` を更新します。

## 方法2: Vercel（推奨・本番用）

オリジナルサイト（drill.ma-ji.ai）と同じ Vercel でのホスティングです。

### A. Vercel ダッシュボードから（最も簡単）

1. [vercel.com](https://vercel.com) にログイン
2. **Add New Project** → GitHub リポジトリ `Private` を選択
3. ブランチ `main`（または `cursor/majiai-drill-clone-c6e4`）を選択
4. Framework Preset: **Next.js**（自動検出）
5. **Deploy** をクリック

### B. GitHub Actions から（CI/CD）

1. [Vercel](https://vercel.com/account/tokens) でトークンを作成
2. Vercel プロジェクト設定から `ORG_ID` と `PROJECT_ID` を取得
3. GitHub リポジトリの **Settings → Secrets** に以下を追加:

| Secret | 値 |
|--------|-----|
| `VERCEL_TOKEN` | Vercel API トークン |
| `VERCEL_ORG_ID` | Vercel チーム/ユーザー ID |
| `VERCEL_PROJECT_ID` | Vercel プロジェクト ID |

4. `main` ブランチに push すると自動デプロイされます

## 方法2: ローカルから Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 環境変数（Supabase 連携時）

Vercel ダッシュボードの **Settings → Environment Variables** に設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

未設定の場合はデモモードで動作します。

## デモモード

Supabase 未設定でも、任意のメールアドレスとパスワード（6文字以上）でログインできます。
進捗はブラウザの localStorage に保存されます。
