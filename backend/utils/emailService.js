
const nodemailer = require("nodemailer");

// ==========================================
// EMAIL CONFIG
// ==========================================

console.log("======================================");
console.log("📧 EMAIL SERVICE STARTING");
console.log("======================================");

console.log(
  "📧 EMAIL_USER:",
  process.env.EMAIL_USER || "NOT SET"
);

console.log(
  "🔐 EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD
    ? "SET"
    : "NOT SET"
);

// ==========================================
// GMAIL SMTP TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

// ==========================================
// VERIFY TRANSPORTER
// ==========================================

async function verifyEmailTransporter() {
  try {

    await transporter.verify();

    console.log(
      "✅ EMAIL TRANSPORTER READY"
    );

    console.log(
      "📧 Email account:",
      process.env.EMAIL_USER
    );

    return true;

  } catch (error) {

    console.error(
      "❌ EMAIL TRANSPORTER ERROR"
    );

    console.error(
      error.message
    );

    return false;
  }
}

verifyEmailTransporter();

// ==========================================
// SEND EMAIL
// ==========================================

async function sendEmail(
  to,
  subject,
  html
) {

  console.log("");
  console.log(
    "======================================"
  );

  console.log(
    "📨 SEND EMAIL STARTED"
  );

  console.log(
    "📧 From:",
    process.env.EMAIL_USER
  );

  console.log(
    "📩 To:",
    to
  );

  console.log(
    "📝 Subject:",
    subject
  );

  console.log(
    "======================================"
  );

  try {

    const info =
      await transporter.sendMail({

        from:
          `"InterZen" <${process.env.EMAIL_USER}>`,

        to: to,

        subject: subject,

        html: html

      });

    console.log("");
    console.log(
      "✅ EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "📨 Message ID:",
      info.messageId
    );

    console.log(
      "📬 Server response:",
      info.response
    );

    return info;

  } catch (error) {

    console.error("");
    console.error(
      "❌ EMAIL SENDING FAILED"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Command:",
      error.command
    );

    throw error;
  }
}

// ==========================================
// VERIFICATION OTP
// ==========================================

async function sendVerificationOTP(
  to,
  name,
  code
) {

  console.log("");
  console.log(
    "🔐 VERIFICATION OTP FUNCTION CALLED"
  );

  console.log(
    "📩 Recipient:",
    to
  );

  console.log(
    "👤 Name:",
    name
  );

  console.log(
    "🔢 OTP:",
    code
  );

  return sendEmail(

    to,

    "InterZen - Email Verification OTP",

    `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
      ">

        <h2>
          Welcome to InterZen, ${name}!
        </h2>

        <p>
          Thank you for registering with InterZen.
        </p>

        <p>
          Your email verification OTP is:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          background: #f3f4f6;
          text-align: center;
          margin: 20px 0;
        ">

          ${code}

        </div>

        <p>
          This OTP is valid for
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not create this account,
          you can safely ignore this email.
        </p>

        <p>
          Regards,<br>
          <strong>InterZen Team</strong>
        </p>

      </div>
    `
  );
}

// ==========================================
// PASSWORD RESET OTP
// ==========================================

async function sendPasswordResetOTP(
  to,
  name,
  code
) {

  console.log("");
  console.log(
    "🔑 PASSWORD RESET OTP FUNCTION CALLED"
  );

  console.log(
    "📩 Recipient:",
    to
  );

  console.log(
    "👤 Name:",
    name
  );

  console.log(
    "🔢 OTP:",
    code
  );

  return sendEmail(

    to,

    "InterZen - Password Reset OTP",

    `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
      ">

        <h2>
          InterZen Password Reset
        </h2>

        <p>
          Hello ${name},
        </p>

        <p>
          Your password reset OTP is:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          background: #f3f4f6;
          text-align: center;
          margin: 20px 0;
        ">

          ${code}

        </div>

        <p>
          This OTP is valid for
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset,
          please ignore this email.
        </p>

        <p>
          Regards,<br>
          <strong>InterZen Team</strong>
        </p>

      </div>
    `
  );
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  sendEmail,
  sendVerificationOTP,
  sendPasswordResetOTP
};
