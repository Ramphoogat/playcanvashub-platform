import { secret } from "encore.dev/config";

const emailApiKey = secret("EmailAPIKey");
const fromEmail = secret("FromEmail");

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // TODO: Implement with your preferred email service (SendGrid, Mailgun, etc.)
  // For now, just log the verification link
  const verificationUrl = `https://app.playcanvashub.com/verify-email?token=${token}`;
  console.log(`Verification email for ${email}: ${verificationUrl}`);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // TODO: Implement with your preferred email service
  const resetUrl = `https://app.playcanvashub.com/reset-password?token=${token}`;
  console.log(`Password reset email for ${email}: ${resetUrl}`);
}
