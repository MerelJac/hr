// lib/emailTemplates.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize once for all sends
const ses = new SESClient({
  region: process.env.AWS_REGION!, // ← use AWS_* to match Amplify env vars
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
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
  return sendEmail({
    to,
    subject: "Welcome to Ignite Appreciation!",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Ignite Appreciation 🔥</h2>
        <p>Thanks for signing up — you’re officially part of the appreciation movement!</p>
        <p>We’re excited to have you on board.</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text:
      "Welcome to Ignite Appreciation! You're officially part of the appreciation movement 🔥",
  });
}

/**
 * Recognition / redemption email
 */
export async function sendRecognitionEmail(to: string) {
  return sendEmail({
    to,
    subject: "Your Ignite Appreciation Recognition 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>You’ve been recognized! 🎉</h2>
        <p>Someone just celebrated your hard work through Ignite Appreciation.</p>
        <p>Log in to view the details and keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text:
      "You’ve been recognized! Someone celebrated your hard work through Ignite Appreciation. Log in to view the details!",
  });
}
