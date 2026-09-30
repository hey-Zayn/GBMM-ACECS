import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BRAND_NAME = 'ACECS';
const BRAND_PRIMARY = '#3b79fd';
const BRAND_BACKGROUND = '#ebecf0';
const BRAND_CARD = '#f8f8fa';
const BRAND_FOREGROUND = '#030507';
const BRAND_MUTED = '#667085';
const BRAND_BORDER = '#e0e2e6';
const LOGO_CID = 'acecs-logo@acecs';
const LOGO_SVG = fs.readFileSync(
  fileURLToPath(new URL('../../../images/logo.svg', import.meta.url)),
  'utf8'
);

export function createOtpEmail({ code, purpose }) {
  const action = purpose === 'account creation' ? 'create your account' : 'sign in';
  const subject = `Your ${BRAND_NAME} verification code`;

  return {
    subject,
    text: `Your ${BRAND_NAME} verification code is ${code}. Use it to ${action}. This code expires in 10 minutes.`,
    attachments: [{ filename: 'acecs-logo.svg', content: LOGO_SVG, contentType: 'image/svg+xml', cid: LOGO_CID }],
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:${BRAND_BACKGROUND};font-family:Arial,Helvetica,sans-serif;color:${BRAND_FOREGROUND};">
    <div style="padding:40px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:${BRAND_CARD};border:1px solid ${BRAND_BORDER};border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:${BRAND_PRIMARY};padding:24px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <td><img src="cid:${LOGO_CID}" alt="${BRAND_NAME}" width="42" height="42" style="display:block;border-radius:10px;" /></td>
                <td style="padding-left:12px;font-size:22px;font-weight:700;letter-spacing:.02em;color:#ffffff;">${BRAND_NAME}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;">Verify your email</p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${BRAND_MUTED};">Use the code below to ${action}. It will expire in 10 minutes.</p>
            <div style="margin:0 0 28px;padding:18px;text-align:center;background:#ffffff;border:1px solid ${BRAND_BORDER};border-radius:12px;">
              <span style="font-size:34px;font-weight:700;letter-spacing:10px;color:${BRAND_PRIMARY};">${code}</span>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND_MUTED};">If you did not request this code, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid ${BRAND_BORDER};font-size:12px;color:${BRAND_MUTED};">© 2026 ${BRAND_NAME}. All rights reserved.</td>
        </tr>
      </table>
    </div>
  </body>
</html>`,
  };
}
