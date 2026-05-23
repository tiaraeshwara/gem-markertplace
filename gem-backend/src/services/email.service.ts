import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to,
    subject,
    html,
  });
};

export const emailService = {
  async sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${config.clientUrl}/auth/verify-email?token=${token}`;
    await sendEmail(
      email,
      "Verify your GemVault account",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to GemVault, ${name}!</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${verifyUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
          Verify Email
        </a>
        <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
      `,
    );
  },

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${config.clientUrl}/auth/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Reset your GemVault password",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Password Reset</h2>
        <p>Hi ${name}, you requested a password reset.</p>
        <a href="${resetUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
          Reset Password
        </a>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
      `,
    );
  },
};
