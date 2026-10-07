const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const {
  sendVerificationOTP,
  sendPasswordResetOTP
} = require("../utils/emailService");

// ==========================================
// GOOGLE CLIENT
// ==========================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || ""
);

// ==========================================
// CREATE JWT TOKEN
// ==========================================

const createToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      userId: userId
    },
    process.env.JWT_SECRET || "interzen-demo-secret",
    {
      expiresIn: "7d"
    }
  );
};

// ==========================================
// GENERATE 6 DIGIT OTP
// ==========================================

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// ==========================================
// OTP EXPIRY
// ==========================================

const getOTPExpiry = () => {
  return new Date(
    Date.now() + 10 * 60 * 1000
  );
};

// ==========================================
// REGISTER
// ==========================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ------------------------------
    // FIND EXISTING USER
    // ------------------------------

    let user = await User.findOne({
      email: normalizedEmail
    });

    // ==========================================
    // EXISTING UNVERIFIED USER
    // ==========================================

    if (user && !user.emailVerified) {
      const verificationCode = generateOTP();

      user.name = name;

      user.password = await bcrypt.hash(password, 10);

      user.verificationCode = verificationCode;

      user.verificationCodeExpires = getOTPExpiry();

      await user.save();

      // ==========================================
      // COLLEGE DEMO MODE
      // ==========================================

      if (process.env.DEMO_MODE === "true") {
        console.log("==========================================");
        console.log("🎓 COLLEGE DEMO MODE");
        console.log("📧 Verification Email:", user.email);
        console.log("🔢 VERIFICATION OTP:", verificationCode);
        console.log("==========================================");

        return res.status(200).json({
          message: "Account exists but is not verified. A new demo OTP has been generated.",
          requiresVerification: true,
          demoMode: true,
          demoOtp: verificationCode,
          email: user.email
        });
      }

      // ==========================================
      // NORMAL EMAIL MODE
      // ==========================================

      await sendVerificationOTP(
        user.email,
        user.name,
        verificationCode
      );

      return res.status(200).json({
        message: "A new OTP has been sent to your email.",
        requiresVerification: true,
        demoMode: false,
        email: user.email
      });
    }

    // ==========================================
    // EXISTING VERIFIED USER
    // ==========================================

    if (user) {
      return res.status(400).json({
        message: "Email is already registered. Please login."
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // GENERATE VERIFICATION OTP
    // ==========================================

    const verificationCode = generateOTP();

    const verificationCodeExpires = getOTPExpiry();

    // ==========================================
    // CREATE USER
    // ==========================================

    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      emailVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    // ==========================================
    // COLLEGE DEMO MODE
    // ==========================================

    if (process.env.DEMO_MODE === "true") {
      console.log("==========================================");
      console.log("🎓 COLLEGE DEMO MODE");
      console.log("📧 Verification Email:", user.email);
      console.log("🔢 VERIFICATION OTP:", verificationCode);
      console.log("==========================================");

      return res.status(201).json({
        message: "Registration successful. Demo OTP generated.",
        requiresVerification: true,
        demoMode: true,
        demoOtp: verificationCode,
        email: user.email
      });
    }

    // ==========================================
    // NORMAL EMAIL MODE
    // ==========================================

    await sendVerificationOTP(
      user.email,
      user.name,
      verificationCode
    );

    return res.status(201).json({
      message: "Registration successful. OTP sent to your email.",
      requiresVerification: true,
      demoMode: false,
      email: user.email
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Registration failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
};

// ==========================================
// VERIFY EMAIL OTP
// ==========================================

exports.verifyEmail = async (
  req,
  res
) => {
  try {

    const {
      email,
      code
    } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message:
          "Email and OTP are required"
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const enteredCode =
      String(code).trim();
      console.log("========== OTP DEBUG ==========");
console.log("Verification Email:", normalizedEmail);
console.log("Entered OTP:", enteredCode);
console.log("================================");

    const user =
      await User.findOne({
        email: normalizedEmail
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    // Already verified
    if (user.emailVerified) {
      return res.status(200).json({
        message:
          "Email is already verified",
        alreadyVerified: true
      });
    }

    // ==========================================
    // CHECK OTP
    // ==========================================

    if (
      !user.verificationCode ||
      user.verificationCode !== enteredCode ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired OTP"
      });
    }

    // ==========================================
    // VERIFY USER
    // ==========================================

    user.emailVerified = true;

    user.verificationCode = null;

    user.verificationCodeExpires = null;

    await user.save();

    console.log(
      "Email verified:",
      user.email
    );

    return res.json({
      message:
        "Email verified successfully",
      verified: true
    });

  } catch (error) {

    console.error(
      "Verify Email Error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to verify email"
    });
  }
};

// ==========================================
// RESEND VERIFICATION OTP
// ==========================================

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Generate new OTP
    const verificationCode = generateOTP();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = getOTPExpiry();

    await user.save();

    // ==========================================
    // COLLEGE DEMO MODE
    // ==========================================

    if (process.env.DEMO_MODE === "true") {
      console.log("==========================================");
      console.log("🎓 COLLEGE DEMO MODE");
      console.log("📧 Verification Email:", user.email);
      console.log("🔢 NEW VERIFICATION OTP:", verificationCode);
      console.log("==========================================");

      return res.json({
        message: "New demo OTP generated successfully",
        demoMode: true,
        demoOtp: verificationCode,
        email: user.email
      });
    }

    // ==========================================
    // NORMAL EMAIL MODE
    // ==========================================

    await sendVerificationOTP(
      user.email,
      user.name,
      verificationCode
    );

    console.log(
      "New verification OTP sent to:",
      user.email
    );

    return res.json({
      message: "New OTP sent to your email",
      demoMode: false,
      email: user.email
    });

  } catch (error) {
    console.error(
      "Resend OTP Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to resend OTP"
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      console.log("❌ LOGIN: User not found:", normalizedEmail);

      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    console.log("✅ LOGIN: User found:", user.email);
    console.log("📧 Email verified:", user.emailVerified);
    console.log("🔐 Password exists:", !!user.password);

    // ==========================================
    // GOOGLE-ONLY ACCOUNT
    // ==========================================

    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google Login. Please continue with Google."
      });
    }

    // ==========================================
    // CHECK PASSWORD
    // ==========================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("🔑 Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // ==========================================
    // EMAIL VERIFICATION CHECK
    // ==========================================

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email using the OTP before logging in.",
        requiresVerification: true,
        email: user.email
      });
    }

    // ==========================================
    // CREATE JWT
    // ==========================================

    const token = createToken(user._id);

    return res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};

// ==========================================
// GOOGLE LOGIN
// ==========================================

exports.googleLogin = async (
  req,
  res
) => {

  try {

    const {
      credential
    } = req.body;

    if (!credential) {
      return res.status(400).json({
        message:
          "Google credential is required"
      });
    }

    // ==========================================
    // CHECK GOOGLE CLIENT ID
    // ==========================================

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message:
          "Google Login is not configured."
      });
    }

    // ==========================================
    // VERIFY GOOGLE TOKEN
    // ==========================================

    const ticket =
      await googleClient.verifyIdToken({

        idToken:
          credential,

        audience:
          process.env.GOOGLE_CLIENT_ID
      });

    const payload =
      ticket.getPayload();

    const googleEmail =
      payload.email;

    const googleName =
      payload.name ||
      "InterZen Student";

    const googleId =
      payload.sub;

    if (!googleEmail || !googleId) {
      return res.status(400).json({
        message:
          "Unable to get Google account information"
      });
    }

    const normalizedEmail =
      googleEmail.toLowerCase().trim();

    // ==========================================
    // FIND USER
    // ==========================================

    let user =
      await User.findOne({
        email: normalizedEmail
      });

    // ==========================================
    // CREATE GOOGLE USER
    // ==========================================

    if (!user) {

      user =
        await User.create({

          name:
            googleName,

          email:
            normalizedEmail,

          password:
            null,

          role:
            "student",

          emailVerified:
            true,

          verificationCode:
            null,

          verificationCodeExpires:
            null
        });

    } else {

      user.emailVerified = true;

      if (!user.name) {
        user.name =
          googleName;
      }

      await user.save();
    }

    // ==========================================
    // CREATE JWT
    // ==========================================

    const token =
      createToken(user._id);

    return res.json({

      message:
        "Google login successful",

      token,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        emailVerified:
          true
      }
    });

  } catch (error) {

    console.error(
      "Google Login Error:",
      error
    );

    return res.status(401).json({
      message:
        "Google login failed"
    });
  }
};

// ==========================================
// TEST AUTH
// ==========================================

exports.testAuth =
  (req, res) => {

    res.json({
      message:
        "Auth route working successfully"
    });
  };

// ==========================================
// FORGOT PASSWORD
// ==========================================

// ==========================================
// FORGOT PASSWORD
// ==========================================

exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ==========================================
    // GENERATE RESET OTP
    // ==========================================

    const resetCode = generateOTP();

    user.resetCode = resetCode;

    user.resetCodeExpires =
      getOTPExpiry();

    await user.save();


    // ==========================================
    // COLLEGE DEMO MODE
    // ==========================================

    if (
      process.env.DEMO_MODE === "true"
    ) {

      console.log(
        "=========================================="
      );

      console.log(
        "🎓 COLLEGE DEMO MODE"
      );

      console.log(
        "📧 Reset Email:",
        user.email
      );

      console.log(
        "🔢 RESET OTP:",
        resetCode
      );

      console.log(
        "=========================================="
      );


      return res.json({

        message:
          "Password reset code generated successfully",

        demoMode: true,

        demoOtp:
          resetCode

      });

    }


    // ==========================================
    // REAL EMAIL MODE
    // ==========================================

    await sendPasswordResetOTP(
      user.email,
      user.name,
      resetCode
    );

    console.log(
      "Password reset OTP sent to:",
      user.email
    );


    return res.json({

      message:
        "Password reset OTP sent successfully",

      demoMode: false

    });


  } catch (error) {

    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({

      message:
        "Unable to process password reset"

    });

  }

};

// ==========================================
// VERIFY RESET CODE
// ==========================================

// ==========================================
// VERIFY RESET CODE
// ==========================================

exports.verifyResetCode = async (req, res) => {

  try {

    const {
      email,
      code
    } = req.body;


    if (!email || !code) {

      return res.status(400).json({

        message:
          "Email and verification code are required"

      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const enteredCode =
      String(code).trim();


    const user =
      await User.findOne({
        email: normalizedEmail
      });


    if (!user) {

      return res.status(404).json({

        message:
          "User not found"

      });

    }


    // ==========================================
    // CHECK OTP
    // ==========================================

    if (
      !user.resetCode ||
      user.resetCode !== enteredCode ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < new Date()
    ) {

      return res.status(400).json({

        message:
          "Invalid or expired verification code"

      });

    }


    return res.json({

      message:
        "Verification code is valid",

      verified: true

    });


  } catch (error) {

    console.error(
      "Verify Reset Code Error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to verify code"

    });

  }

};

// ==========================================
// RESET PASSWORD
// ==========================================

// ==========================================
// RESET PASSWORD
// ==========================================

exports.resetPassword = async (req, res) => {

  try {

    const {
      email,
      code,
      newPassword
    } = req.body;


    if (
      !email ||
      !code ||
      !newPassword
    ) {

      return res.status(400).json({

        message:
          "Email, verification code and new password are required"

      });

    }


    if (newPassword.length < 6) {

      return res.status(400).json({

        message:
          "New password must be at least 6 characters"

      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const enteredCode =
      String(code).trim();


    const user =
      await User.findOne({
        email: normalizedEmail
      });


    if (!user) {

      return res.status(404).json({

        message:
          "User not found"

      });

    }


    // ==========================================
    // VERIFY RESET OTP
    // ==========================================

    if (
      !user.resetCode ||
      user.resetCode !== enteredCode ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < new Date()
    ) {

      return res.status(400).json({

        message:
          "Invalid or expired verification code"

      });

    }


    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    user.password =
      await bcrypt.hash(
        newPassword,
        10
      );


    // ==========================================
    // CLEAR RESET OTP
    // ==========================================

    user.resetCode = null;

    user.resetCodeExpires = null;


    await user.save();


    return res.json({

      message:
        "Password reset successfully"

    });


  } catch (error) {

    console.error(
      "Reset Password Error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to reset password"

    });

  }

};