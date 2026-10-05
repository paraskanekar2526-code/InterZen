
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ==============================
// CREATE JWT TOKEN
// ==============================

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


// ==============================
// REGISTER
// ==============================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    // ==============================
    // DEMO MODE
    // ==============================

    if (process.env.DEMO_MODE === "true") {
      const user = {
        id: "demo-user-id",
        name,
        email,
        role: "student",
        emailVerified: true
      };

      const token = createToken(user.id);

      return res.status(201).json({
        message: "Registration successful",
        token,
        user
      });
    }

    // ==============================
    // NORMAL REGISTRATION
    // ==============================

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,

      verificationCode,

      verificationCodeExpires: new Date(
        Date.now() + 10 * 60 * 1000
      ),

      emailVerified: false
    });

    // ==============================
    // VERIFICATION CODE
    // ==============================

    console.log(
      "=========================================="
    );

    console.log(
      "InterZen Email Verification Code:",
      verificationCode
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Code expires in: 10 minutes"
    );

    console.log(
      "=========================================="
    );

    const token = createToken(user._id);

    return res.status(201).json({
      message:
        "Registration successful. Verification code generated.",

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
    console.error(
      "Register Error:",
      error.message
    );

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


// ==============================
// LOGIN
// ==============================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // ==============================
    // DEMO MODE
    // ==============================

    if (process.env.DEMO_MODE === "true") {
      const user = {
        id: "demo-user-id",
        name: "Demo Student",
        email,
        role: "student",
        emailVerified: true
      };

      const token = createToken(user.id);

      return res.json({
        message: "Login successful",
        token,
        user
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Email verification check
    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in."
      });
    }

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
    console.error(
      "Login Error:",
      error.message
    );

    return res.status(500).json({
      message: "Login failed"
    });
  }
};


// ==============================
// TEST AUTH
// ==============================

exports.testAuth = (req, res) => {
  res.json({
    message: "Auth route working successfully"
  });
};


// ==============================
// FORGOT PASSWORD
// ==============================

exports.forgotPassword = async (req, res) => {
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

    // Generate reset code
    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    user.resetCode = resetCode;

    user.resetCodeExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    // Show reset code in backend terminal
    console.log(
      "=========================================="
    );

    console.log(
      "InterZen Password Reset Code:",
      resetCode
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Code expires in: 10 minutes"
    );

    console.log(
      "=========================================="
    );

    return res.json({
      message:
        "Password reset code generated successfully"
    });

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to process password reset"
    });
  }
};


// ==============================
// VERIFY RESET CODE
// ==============================

exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message:
          "Email and verification code are required"
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

    if (
      !user.resetCode ||
      user.resetCode !== code ||
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
        "Verification code is valid"
    });

  } catch (error) {
    console.error(
      "Verify Code Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to verify code"
    });
  }
};


// ==============================
// RESET PASSWORD
// ==============================

exports.resetPassword = async (req, res) => {
  try {
    const {
      email,
      code,
      newPassword
    } = req.body;

    if (!email || !code || !newPassword) {
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

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (
      !user.resetCode ||
      user.resetCode !== code ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code"
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

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
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to reset password"
    });
  }
};


// ==============================
// VERIFY ACCOUNT EMAIL
// ==============================

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message:
          "Email and verification code are required"
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

    if (user.emailVerified) {
      return res.json({
        message:
          "Email is already verified"
      });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code"
      });
    }

    // Mark email as verified
    user.emailVerified = true;

    // Remove verification code
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    return res.json({
      message:
        "Email verified successfully"
    });

  } catch (error) {
    console.error(
      "Email Verification Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to verify email"
    });
  }
};


// ==============================
// RESEND EMAIL VERIFICATION CODE
// ==============================

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

    if (user.emailVerified) {
      return res.status(400).json({
        message:
          "Email is already verified"
      });
    }

    // Generate new verification code
    const verificationCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    user.verificationCode = verificationCode;

    user.verificationCodeExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    // Show new code in backend terminal
    console.log(
      "=========================================="
    );

    console.log(
      "InterZen New Email Verification Code:",
      verificationCode
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Code expires in: 10 minutes"
    );

    console.log(
      "=========================================="
    );

    return res.json({
      message:
        "New verification code generated successfully"
    });

  } catch (error) {
    console.error(
      "Resend Verification Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to resend verification code"
    });
  }
};
