import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Tanush <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Shared layout ─────────────────────────────────────────────────────────────

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tanush Jewelry</title>
</head>
<body style="margin:0;padding:0;background:#faf9f6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e3db;border-radius:4px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-family:'Georgia',serif;font-size:11px;letter-spacing:0.3em;color:#c9a84c;text-transform:uppercase;">Tanush</p>
            <p style="margin:6px 0 0;font-family:'Georgia',serif;font-size:22px;font-style:italic;color:#ffffff;letter-spacing:0.05em;">Jewelry Atelier</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #e8e3db;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;letter-spacing:0.1em;">© ${new Date().getFullYear()} TANUSH JEWELRY ATELIER</p>
            <p style="margin:6px 0 0;font-size:11px;color:#bbb;">This is an automated message. Please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function goldButton(href: string, label: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr>
      <td style="background:#c9a84c;border-radius:3px;">
        <a href="${href}" style="display:inline-block;padding:14px 36px;font-size:12px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

// ── 1. Welcome email (sent after successful sign-up) ─────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(" ")[0];
  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a84c;">Welcome</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1a1a;font-weight:400;">Welcome, ${firstName}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Your account has been created. You now have access to our exclusive collections, early previews, and a curated world of timeless jewellery.
    </p>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Explore pieces crafted to illuminate your unique radiance.
    </p>
    ${goldButton(`${APP_URL}/collections`, "Explore Collections")}
  `);

  return resend.emails.send({ from: FROM, to: [to], subject: "Welcome to Tanush Jewelry", html });
}

// ── 2. Login notification (sent on every successful sign-in) ─────────────────

export async function sendLoginNotificationEmail(to: string, name: string) {
  const firstName = name?.split(" ")[0] ?? "there";
  const time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a84c;">Security Notice</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1a1a;font-weight:400;">New Sign-In Detected</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Hello ${firstName}, a new sign-in to your Tanush account was detected at:
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 20px;background:#faf9f6;border-left:3px solid #c9a84c;border-radius:2px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;font-weight:600;">${time} (IST)</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b6b6b;font-family:Arial,sans-serif;">
      If this was you, no action is needed. If you did not sign in, please reset your password immediately.
    </p>
  `);

  return resend.emails.send({ from: FROM, to: [to], subject: "New sign-in to your Tanush account", html });
}

// ── 3. Password reset email ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const firstName = name?.split(" ")[0] ?? "there";
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a84c;">Password Reset</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1a1a;font-weight:400;">Reset Your Password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Hello ${firstName}, we received a request to reset the password for your Tanush account.
      Click the button below to choose a new password.
    </p>
    ${goldButton(resetUrl, "Reset Password")}
    <p style="margin:28px 0 0;font-size:13px;line-height:1.7;color:#999;font-family:Arial,sans-serif;">
      This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#bbb;font-family:Arial,sans-serif;word-break:break-all;">
      Or copy this link: ${resetUrl}
    </p>
  `);

  return resend.emails.send({ from: FROM, to: [to], subject: "Reset your Tanush password", html });
}

// ── 4. Return request approved ────────────────────────────────────────────────

export async function sendReturnApprovedEmail(to: string, name: string, orderNumber: string, returnWaybill: string) {
  const firstName = name?.split(" ")[0] ?? "there";
  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a84c;">Return Approved</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1a1a;font-weight:400;">Your Return is Approved</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Hello ${firstName}, your return request for order <strong>${orderNumber}</strong> has been approved.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 20px;background:#faf9f6;border-left:3px solid #c9a84c;border-radius:2px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Return Waybill / Tracking</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a1a;">${returnWaybill}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Our courier will schedule a pickup from your address. Please keep the item(s) securely packed and ready for pickup. You will receive a refund once we inspect the returned item(s).
    </p>
    ${goldButton(`${APP_URL}/orders`, "View My Orders")}
  `);
  return resend.emails.send({ from: FROM, to: [to], subject: `Return approved — Order ${orderNumber}`, html });
}

// ── 5. Return request rejected ────────────────────────────────────────────────

export async function sendReturnRejectedEmail(to: string, name: string, orderNumber: string, adminNote: string) {
  const firstName = name?.split(" ")[0] ?? "there";
  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#b71c1c;">Return Request</p>
    <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1a1a;font-weight:400;">Return Not Approved</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      Hello ${firstName}, unfortunately your return request for order <strong>${orderNumber}</strong> could not be approved.
    </p>
    ${adminNote ? `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 20px;background:#fce4ec;border-left:3px solid #b71c1c;border-radius:2px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Reason</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#4a4a4a;">${adminNote}</p>
        </td>
      </tr>
    </table>` : ""}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4a4a4a;font-family:Arial,sans-serif;">
      If you have further questions, please contact our support team.
    </p>
    ${goldButton(`${APP_URL}/orders`, "View My Orders")}
  `);
  return resend.emails.send({ from: FROM, to: [to], subject: `Return request update — Order ${orderNumber}`, html });
}
