import nodemailer from "nodemailer";

export async function sendAdminRedemptionEmail(
  userEmail: string,
  itemLabel: string,
  deliverEmail?: string,
  amount?: number
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false, // TODO: upgrade later with STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Rewards Bot" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Reward Redemption Request: ${itemLabel}`,
    text: `User ${userEmail} has redeemed: ${itemLabel}.
Deliver to: ${deliverEmail || userEmail}.`,
    html: `<p><b>User:</b> ${userEmail}</p>
            <p><b>Amount:</b> $${amount}</p>
           <p><b>Reward:</b> ${itemLabel}</p>
           <p><b>Deliver to:</b> ${deliverEmail || userEmail}</p>`,
  });

  console.log("Admin email sent:", info.messageId);
}
