import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-ui-xl font-bold text-txt">設定</h1>
        <p className="mt-1 text-ui-base text-txt-sub">アカウント情報の確認</p>
      </header>

      <div className="rounded-section border border-bd bg-surface p-5 shadow-hover">
        <dl className="space-y-4 text-ui-sm">
          <div>
            <dt className="text-txt-dim">名前</dt>
            <dd className="mt-0.5 font-medium text-txt">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-txt-dim">メールアドレス</dt>
            <dd className="mt-0.5 font-medium text-txt">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-txt-dim">クラス</dt>
            <dd className="mt-0.5 font-medium text-txt">
              第{user?.term ?? 1}期 {user?.cohortName}
            </dd>
          </div>
          <div>
            <dt className="text-txt-dim">チーム</dt>
            <dd className="mt-0.5 font-medium uppercase text-txt">{user?.team}</dd>
          </div>
          <div>
            <dt className="text-txt-dim">ADSメール</dt>
            <dd className="mt-0.5 font-medium text-txt">{user?.secondaryEmail}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
