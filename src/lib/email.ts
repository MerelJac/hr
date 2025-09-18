// lib/email.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.AWS_REGION });

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string; // fallback plain-text version
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const from = process.env.EMAIL_FROM as string; // e.g. "no-reply@yourdomain.com"

  const command = new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
      },
    },
  });

  return ses.send(command);
}
