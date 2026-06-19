import type { EmailConfig } from "next-auth/providers/email";

type SendParams = Parameters<NonNullable<EmailConfig["sendVerificationRequest"]>>[0];

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: SendParams) {
  const { host } = new URL(url);
  const from = provider.from as string;
  const apiKey = provider.apiKey as string;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `AI-Driven School 受講生ポータルへのログイン`,
      html: buildEmailHtml({ url, host }),
      text: `AI-Driven School 受講生ポータルにログインするには以下のリンクをクリックしてください。\n\n${url}\n\nこのメールに心当たりがない場合は無視してください。`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
  }
}

function buildEmailHtml({ url, host }: { url: string; host: string }) {
  return `
<body style="background:#f8fafb;margin:0;padding:20px;font-family:Inter,'Noto Sans JP',sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:28px 28px 12px;text-align:center;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;color:#0d6ca7;background:#0d6ca71a;display:inline-block;padding:4px 8px;border-radius:4px;">受講生ポータル</div>
        <h1 style="margin:16px 0 8px;font-size:20px;color:#1a2332;">本人確認</h1>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#5a6b7d;">${host} へのログインリクエストを受け付けました。<br>下のボタンをクリックしてポータルにアクセスしてください。</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 28px;text-align:center;">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#223a49,#0d6ca7);color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:12px 28px;border-radius:8px;">認証リンクを開く</a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 28px;font-size:12px;line-height:1.6;color:#8a96a5;text-align:center;">
        リンクの有効期限は24時間です。心当たりがない場合はこのメールを無視してください。
      </td>
    </tr>
  </table>
</body>`;
}
