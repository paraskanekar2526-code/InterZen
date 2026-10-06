const express = require("express");

const router = express.Router();

const {
  register,
  login,
  googleLogin,
  testAuth,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyEmail,
  resendVerification
} = require("../controllers/authController");

// ==========================================
// AUTH
// ==========================================

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.get("/", testAuth);

// ==========================================
// PASSWORD RESET
// ==========================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-code",
  verifyResetCode
);

router.post(
  "/reset-password",
  resetPassword
);

// ==========================================
// EMAIL VERIFICATION
// ==========================================

router.post(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerification
);

module.exports = router;