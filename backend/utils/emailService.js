
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "InterZen <onboarding@resend.dev>";

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  console.log("📨 Sending email through Resend:", { to, subject });

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("❌ Resend email error:", error.message);
    throw new Error(`Resend email failed: ${error.message}`);
  }

  console.log("✅ Resend accepted email:", data?.id);
  return data;
}

async function sendVerificationOTP(to, name, code) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to InterZen, ${name}!</h2>
      <p>Use this OTP to verify your email address:</p>
      <h1 style="letter-spacing: 6px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this code, you can ignore this email.</p>
    </div>
  `;

  return sendEmail(to, "InterZen - Email Verification OTP", html);
}

async function sendPasswordResetOTP(to, name, code) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset</h2>
      <p>Hello ${name},</p>
      <p>Use this OTP to reset your InterZen password:</p>
      <h1 style="letter-spacing: 6px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request a password reset, ignore this email.</p>
    </div>
  `;

  return sendEmail(to, "InterZen - Password Reset OTP", html);
}

module.exports = {
  sendEmail,
  sendVerificationOTP,
  sendPasswordResetOTP,
};