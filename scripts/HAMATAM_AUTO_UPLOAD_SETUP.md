# HAMATAM 自動アップロード セットアップ（5分）

対象アカウント: **hamatam2006@gmail.com** / **@hamatam2006**  
バックアップ: 23本（Google Drive 取得済み）

## ステップ 1: Google Cloud（カード登録が必要）

**必ず `hamatam2006@gmail.com` でログイン**してから進めてください。

1. https://console.cloud.google.com/ → 新規プロジェクト作成（例: `Hamatam Upload`）
2. カード登録 → **無料で利用開始**（トライアル中は自動課金なし）
3. YouTube Data API v3 を有効化  
   https://console.cloud.google.com/apis/library/youtube.googleapis.com
4. OAuth 同意画面  
   https://console.cloud.google.com/apis/credentials/consent
   - テストユーザー: `hamatam2006@gmail.com`
   - スコープ: `youtube.upload`
5. OAuth クライアント ID（**デスクトップアプリ**）を作成  
   https://console.cloud.google.com/apis/credentials
6. JSON をダウンロード → このチャットに添付、または下記パスに配置

```bash
mkdir -p ~/.config/youtube-upload
cp ~/Downloads/client_secret_*.json ~/.config/youtube-upload/client_secrets.json
```

## ステップ 2: OAuth 認証

### PC がある場合

```bash
./scripts/upload-hamatam-youtube.sh auth
```

ブラウザで `hamatam2006@gmail.com` を許可。

### スマホのみの場合

```bash
python3 scripts/upload_hamatam_youtube.py --auth-only --manual-auth
```

1. 表示された URL をスマホの Safari で開く
2. `hamatam2006@gmail.com` で許可
3. 「接続できない」画面でも **アドレスバーの URL 全体をコピー**
4. ターミナルに貼り付けて Enter

## ステップ 3: アップロード開始

```bash
# まず1本テスト（非公開）
PRIVACY=private MAX_UPLOADS=1 ./scripts/upload-hamatam-youtube.sh upload

# 問題なければ公開（1日6本ずつ、約4日で23本完了）
PRIVACY=public MAX_UPLOADS=6 ./scripts/upload-hamatam-youtube.sh upload
```

翌日以降、同じコマンドを繰り返すと未アップロード分だけ処理されます。

## 料金について

| 項目 | 費用 |
|------|------|
| Google Cloud トライアル | 無料（カードは本人確認のみ） |
| YouTube API（1日6本） | 無料枠内 |
| 動画ストレージ | 無料 |

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `access_denied` | OAuth 同意画面のテストユーザーに `hamatam2006@gmail.com` を追加 |
| `quotaExceeded` | 翌日まで待つ（1日6本制限） |
| 別アカウントで設定した | `hamatam2006@gmail.com` で Cloud をやり直す |

## 最短ルート（まとめ）

1. `hamatam2006@gmail.com` で Cloud セットアップ + JSON ダウンロード
2. JSON を Cursor に添付
3. 認証 → テスト1本 → 公開アップロード開始
