export type PortalPage = {
  slug: string;
  title: string;
  description: string;
  body: string;
};

export const portalPages: PortalPage[] = [
  {
    slug: "guide",
    title: "オンライン講義の受講準備",
    description: "講義を受ける前に確認しておく準備事項です。",
    body: `
      <p>オンライン講義をスムーズに受講するための準備手順をまとめています。</p>
      <ul>
        <li>Slack ワークスペースへの参加</li>
        <li>Cursor のインストール</li>
        <li>Gitea アカウントの確認</li>
        <li>安定したネットワーク環境の確保</li>
      </ul>
    `,
  },
  {
    slug: "caution",
    title: "受講上の注意",
    description: "受講にあたって守っていただきたいルールです。",
    body: `
      <p>受講生同士の学びを守るため、以下の点にご注意ください。</p>
      <ul>
        <li>講義内容の外部公開は禁止です</li>
        <li>録画・録音の無断共有は禁止です</li>
        <li>チーム活動では期限を守ってください</li>
      </ul>
    `,
  },
  {
    slug: "drill",
    title: "本気AIドリルの使い方",
    description: "毎日の学習ドリルの進め方です。",
    body: `
      <p>本気AIドリルは、毎日少しずつAIとプログラミングを学ぶためのドリルです。</p>
      <p>ホーム画面からシリーズを選び、レッスンを順番に進めてください。</p>
    `,
  },
  {
    slug: "team-guide",
    title: "チームとグループのガイドライン",
    description: "チーム活動の進め方とルールです。",
    body: `
      <p>チーム活動では、週次のグループセッションと月次課題の提出が中心になります。</p>
      <p>連絡は Slack を基本とし、議事録は共有ドキュメントに残してください。</p>
    `,
  },
  {
    slug: "archive-lecture",
    title: "講義アーカイブ",
    description: "過去の講義動画へアクセスできます。",
    body: `
      <p>各回の講義アーカイブは、講義終了後に順次公開されます。</p>
      <p>Phase 2 で Mux 動画プレイヤーを組み込み予定です。</p>
    `,
  },
  {
    slug: "slack-guide",
    title: "Slack利用ガイド",
    description: "Slack ワークスペースの使い方です。",
    body: `
      <p>質問は適切なチャンネルに投稿し、検索してから質問する習慣をつけましょう。</p>
    `,
  },
  {
    slug: "intro-diagram",
    title: "【1ヶ月目】自己紹介の図解を作ってみる",
    description: "第1ヶ月の月次課題です。",
    body: `<p>自己紹介を図解ツールで作成し、チームで共有しましょう。</p>`,
  },
  {
    slug: "personal-workspace-ui",
    title: "【3ヶ月目】ひな形を自分の画面に仕上げる",
    description: "第3ヶ月の月次課題です。",
    body: `<p>workspace-ui-kit をベースに、自分の業務向け画面を作り変えます。</p>`,
  },
  {
    slug: "personal-workspace-data",
    title: "【4ヶ月目】自分の画面に記憶を持たせる",
    description: "第4ヶ月の月次課題です。",
    body: `<p>データを画面に接続し、記憶を持つワークスペースを完成させます。</p>`,
  },
  {
    slug: "todo-1",
    title: "第1回講義が終わった方へ",
    description: "第1回講義後のやるべきことです。",
    body: `<p>Slack 自己紹介、図解ツールのセットアップ、チームチャンネルへの参加を行ってください。</p>`,
  },
];

export const portalPageMap = Object.fromEntries(
  portalPages.map((page) => [page.slug, page])
) as Record<string, PortalPage>;
