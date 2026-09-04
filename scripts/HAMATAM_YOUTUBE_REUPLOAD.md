# HAMATAM YouTube 再公開ガイド

@hamatam（田村 洸樹）の旧チャンネルは現在 404 で、動画は YouTube 上から消えています。  
この手順では **新しい Google / YouTube アカウント** を作り、**ローカルに保存済みのバックアップ動画** を再アップロードして公開します。

## 前提

- バックアップ動画がローカルにあること（23本）
- 以前のダウンロード先の例:
  - `yt-dlp` 形式: `YYYYMMDD - タイトル [動画ID].mp4`
  - OpenUtils 形式: `{動画ID}.mp4`
- YouTube Data API の無料枠は **1日あたり約6本** が目安（クォータ 10,000 units）

## 1. 新しい YouTube アカウントを作成

Cloud Agent から Google アカウント作成はできないため、手元のブラウザで実施してください。

1. https://accounts.google.com/signup で新規 Google アカウントを作成
2. https://studio.youtube.com/ を開き、チャンネルを作成
3. チャンネル名の例: `HAMATAM archive` または `はまたむアーカイブ`
4. ハンドル（@xxx）を希望があれば設定

> 旧アカウント `tmh068@gmail.com` は復旧不可のため、**別アカウントでの再公開** が現実的なルートです。

## 2. Google Cloud で OAuth を設定

1. https://console.cloud.google.com/ でプロジェクトを作成
2. **API とサービス → ライブラリ** で **YouTube Data API v3** を有効化
3. **OAuth 同意画面** を設定
   - ユーザータイプ: 外部（テスト中は自分だけ）
   - スコープ: `https://www.googleapis.com/auth/youtube.upload`
   - **テストユーザー** に新しい Google アカウントのメールを追加
4. **認証情報 → OAuth クライアント ID → デスクトップアプリ** を作成
5. JSON をダウンロードし、次のパスに配置:

```bash
mkdir -p ~/.config/youtube-upload
cp ~/Downloads/client_secret_*.json ~/.config/youtube-upload/client_secrets.json
```

## 3. バックアップ動画を配置

ローカルのバックアップを1つのフォルダにまとめます。

```bash
# 例
export BACKUP_DIR=~/Videos/hamatam-backup
ls "$BACKUP_DIR"
```

対象動画 ID 一覧は `scripts/hamatam-video-urls-plain.txt`（23本）を参照。

## 4. マニフェスト生成

```bash
BACKUP_DIR=~/Videos/hamatam-backup \
  python3 scripts/prepare-hamatam-manifest.py "$BACKUP_DIR"
```

`scripts/hamatam-upload-manifest.json` に、ファイルパス・タイトル・元 URL が出力されます。  
タイトルはファイル名または `.info.json` から自動抽出します。不明な場合は `HAMATAM archive [動画ID]` になります。

## 5. OAuth 認証

ローカル PC（ブラウザあり）で実行:

```bash
./scripts/upload-hamatam-youtube.sh auth
```

表示された URL をブラウザで開き、**新しい YouTube アカウント** で許可してください。  
トークンは `~/.config/youtube-upload/token.json` に保存されます。

## 6. ドライラン

```bash
BACKUP_DIR=~/Videos/hamatam-backup \
  ./scripts/upload-hamatam-youtube.sh dry-run
```

アップロード対象とタイトルを確認します。

## 7. アップロード（公開）

最初は非公開で試す場合:

```bash
PRIVACY=private MAX_UPLOADS=1 BACKUP_DIR=~/Videos/hamatam-backup \
  ./scripts/upload-hamatam-youtube.sh upload
```

問題なければ公開で一括（1日6本ずつ）:

```bash
PRIVACY=public MAX_UPLOADS=6 BACKUP_DIR=~/Videos/hamatam-backup \
  ./scripts/upload-hamatam-youtube.sh upload
```

翌日以降、同じコマンドを繰り返すと `scripts/hamatam-upload-archive.txt` により未アップロード分だけ処理されます。

## 8. 確認

- YouTube Studio: https://studio.youtube.com/
- アップロード済み ID は `scripts/hamatam-upload-archive.txt` に記録

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `quotaExceeded` | 翌日まで待つか、Google Cloud でクォータ増加を申請 |
| `accessNotConfigured` | YouTube Data API v3 を有効化 |
| `invalid_grant` | `token.json` を削除して `auth` を再実行 |
| タイトルが ID のみ | `.info.json` を同フォルダに置くか、manifest を手編集 |
| OAuth 画面にアプリが出ない | テストユーザーに自分のメールを追加 |

## 関連スクリプト

| ファイル | 用途 |
|---------|------|
| `scripts/download-youtube-channel.sh` | 旧チャンネル一括ダウンロード（cookies 必要） |
| `scripts/download-openutils-cloud.sh` | クラウド向け一括ダウンロード |
| `scripts/prepare-hamatam-manifest.py` | バックアップ → manifest 生成 |
| `scripts/upload_hamatam_youtube.py` | YouTube API アップロード本体 |
| `scripts/upload-hamatam-youtube.sh` | 上記のラッパー |

## 注意事項

- 再アップロード動画の著作権・演奏権は権利者の許諾範囲内で公開してください
- 元の限定公開動画は、再公開時も **限定公開（unlisted）** にする選択肢があります: `PRIVACY=unlisted`
