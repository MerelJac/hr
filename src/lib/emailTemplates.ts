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
    Destination: { ToAddresses: [to], BccAddresses: ["mjacobs@calloneonline.com"],},
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
    process.env.APP_URL || "${process.env.APP_URL}";

  return sendEmail({
    to,
    subject: "Welcome to Ignite Appreciation!",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Ignite Appreciation 🔥</h2>
        <p>You have been invited to register!</p>
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
 * Recognition email
 */
export async function sendRecognitionEmail(to: string, recognitionId: string) {
  return sendEmail({
    to,
    subject: "Ignite Appreciation Recognition 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>You’ve been recognized! 🎉</h2>
        <p>Someone just celebrated your hard work through Ignite Appreciation.</p>
        <p>
          <a href="${process.env.APP_URL}/feed/appreciation/${recognitionId}" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
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
 * Redemption email
 */
export async function sendRedemptionNotificationEmail(to: string) {
  return sendEmail({
    to,
    subject: "Ignite Appreciation - someone has requested an reward. 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Someone wants to cash out! 🎉</h2>
        <p>Someone is trying to redeem their Ignite Appreciation Points.</p>
        <p>
          <a href="${process.env.APP_URL}/admin/rewards" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out in the 'Redemptions' tab.
            </a>
        </p>
        <p>Log in to view the details.</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "Someone wants to cash out! Someone is trying to redeem their Ignite Appreciation Points. Log in to view the details!",
  });
}



/**
 * Redemption email
 */
export async function sendRedemptionEmail(to: string) {
  return sendEmail({
    to,
    subject: "Ignite Appreciation - New Reward 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Rewards incoming!! 🎉</h2>
        <p>You're reward has been approved in Ignite Appreciation.</p>
        <p>
          <a href="${process.env.APP_URL}/rewards" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in to view the details and keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "You’re request has been rewarded! Log in to view the details!",
  });
}

/**
 * Birthday email
 */
export async function sendBirthdayEmail(to: string) {
  return sendEmail({
    to,
    subject: "Happy Birthday 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Happy Birthday! 🎉</h2>
        <p>You've been awarded some Ignite Appreciation to help celebrate your birthday.</p>
        <p>
          <a href="${process.env.APP_URL}/feed" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in to view the details and keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "Happy Birthday! You've been awarded some Ignite Appreciation to help celebrate your birthday. Log in to view the details!",
  });
}

/**
 * Work Anniversary email
 */
export async function sendWorkAnniversaryEmail(to: string) {
  return sendEmail({
    to,
    subject: "Happy Work Anniversary 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Happy Work Anniversary! 🎉</h2>
        <p>Thank you for all your time spent with Call One, Inc. Here are some points as a token of our appreciation!</p>
        <p>
          <a href="${process.env.APP_URL}/feed" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in to view the details and keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "Happy Work Anniversary! Thank you for all your time spent with Call One, Inc. Here are some points as a token of our appreciation! Log in to view the details!",
  });
}

/**
 * Monthly Points email
 */
export async function sendMonthlyPointsNotification(to: string) {
  return sendEmail({
    to,
    subject: "You've been allotted points! 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Your account has been granted more monthly points!🎉</h2>
        <p>Start sending some kudos! 🎉 Log in to keep the appreciation going!</p>
        <p>
          <a href="${process.env.APP_URL}/feed" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in to view to keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: "Your account has been granted more monthly points! Start sending some kudos! 🎉 Log in to keep the appreciation going!",
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

/**
 * Challenges Started email
 */
export async function sendNewChallengeAlert(to: string, challenge: string) {
  return sendEmail({
    to,
    subject: "Ignite needs your attention! 🎉",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>${challenge ?? "A new challenge"} has been posted! Time to submit your response! 🎉</h2>
        <p>Start sending some kudos! 🎉 Log in to keep the appreciation going!</p>
        <p>
          <a href="${process.env.APP_URL}/feed" style="background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
              Check it out!
            </a>
        </p>
        <p>Log in & click 'Challenges' to keep the appreciation going!</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Call One, Inc Team</p>
      </div>
    `,
    text: `${challenge ?? "A new challenge"} has been posted! Time to submit your response!  Start sending some kudos! 🎉 Log in & click 'Challenges' to keep the appreciation going!`,
  });
}
