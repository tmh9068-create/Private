import { readFileSync } from "fs";
import { join } from "path";

function loadLegalHtml(filename: string) {
  const filePath = join(process.cwd(), "src/lib/content", filename);
  return readFileSync(filePath, "utf-8");
}

export default function PrivacyPage() {
  const html = loadLegalHtml("privacy.html");

  return (
    <div className="min-h-dvh bg-page px-5 py-10">
      <article className="article mx-auto max-w-3xl rounded-section border border-bd bg-surface p-8 shadow-hover">
        <header className="mb-6">
          <h1 className="text-ui-xl font-bold text-txt">プライバシーポリシー</h1>
        </header>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
