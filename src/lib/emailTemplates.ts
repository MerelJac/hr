// lib/emailTemplates.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize once for all sends
const ses = new SESClient({
  region: process.env.SES_REGION!, // ← use SES_* to match Amplify env vars
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generic SES send helper
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const params = {
    Source: process.env.SES_FROM_ADDRESS!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text },
      },
    },
  };

  await ses.send(new SendEmailCommand(params));
  console.log(`✅ Email sent to ${to}`);
}

/**
 * Welcome email
 */
export async function sendWelcomeEmail(to: string) {
  const appUrl =
    process.env.APP_URL || "https://callone.igniteappreciation.com";

  return sendEmail({
    to,
    subject: "Welcome to Ignite Appreciation!",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Ignite Appreciation 🔥</h2>
        <p>Thanks for signing up — you’re officially part of the appreciation movement!</p>
        <p>We’re excited to have you on board.</p>
        <p>
          <a href="${appUrl}/register" 
             style="display:inline-block; background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
            Click here to get started
          </a>
        </p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: `Welcome to Ignite Appreciation! You're officially part of the appreciation movement 🔥
Get started here: ${appUrl}/register`,
  });
}

/**
 * Recognition / redemption email
 */
export async function sendRecognitionEmail(to: string) {
  return sendEmail({
    to,
    subject: "Ignite Appreciation Recognition 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>You’ve been recognized! 🎉</h2>
        <p>Someone just celebrated your hard work through Ignite Appreciation.</p>
        <p>
          <a href="https://callone.igniteappreciation.com/feed" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in to view the details and keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "You’ve been recognized! Someone celebrated your hard work through Ignite Appreciation. Log in to view the details!",
  });
}

/**
 * Forgot password email
 */
export async function sendForgotPasswordEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Reset your Ignite Appreciation password",
    html: `
        <div style="font-family:sans-serif; line-height:1.5; color:#333;">
          <h2>Password reset requested</h2>
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetUrl}" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Reset your password
            </a>
          </p>
          <p>If you didn’t request this, you can safely ignore it.</p>
          <br/>
          <p style="font-size:0.9rem; color:#888;">— Call One, Inc Team</p>
        </div>
      `,
    text: "Reset your password! Click the link to reset: " + resetUrl,
  });
}
