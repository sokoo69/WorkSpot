import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");

export async function sendEmail({
  to,
  subject,
  html,
}: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  
  try {
    await resend.emails.send({
      from: 'WorkSpot <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
  } catch (error) {
    // Log but do NOT throw — an email failure should never block the actual booking/action from completing.
    console.error('Email send failed:', error);
  }
}
