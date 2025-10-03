// lib/emailTemplates.ts

export function inviteTemplate(link: string) {
  return {
    subject: "You are invited to join our app!",
    html: `<p>Hello!</p>
           <p>You’ve been invited to join. Click <a href="${link}">here</a> to register.</p>`,
    text: `You’ve been invited to join. Open this link: ${link}`,
  };
}

export function resetPasswordTemplate(link: string) {
  return {
    subject: "Reset your password",
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${link}">Click here</a> to set a new password.</p>`,
    text: `Reset your password: ${link}`,
  };
}

export function recognitionTemplate(sender: string, message: string) {
  return {
    subject: `${sender} recognized you! 🎉`,
    html: `<p>${sender} says: "${message}"</p>
           <p>Check your dashboard to see more.</p>`,
    text: `${sender} recognized you! Message: "${message}"`,
  };
}

