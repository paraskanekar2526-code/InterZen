const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Password is optional because
    // Google Login users do not need one.
    password: {
      type: String,
      required: false,
      default: null
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    // ==========================================
    // PERFORMANCE / DASHBOARD
    // ==========================================

    resumeScore: {
      type: Number,
      default: 0
    },

    readinessScore: {
      type: Number,
      default: 0
    },

    interviewsCompleted: {
      type: Number,
      default: 0
    },

    codingProblems: {
      type: Number,
      default: 0
    },

    practiceHours: {
      type: Number,
      default: 0
    },

    // ==========================================
    // GAMIFICATION
    // ==========================================

    achievements: {
      type: Number,
      default: 0
    },

    points: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    },

    // ==========================================
    // EARNED BADGES
    // ==========================================

    badges: [
      {
        name: {
          type: String
        },

        description: {
          type: String
        },

        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ==========================================
    // DETAILED ACHIEVEMENTS
    // ==========================================

    achievementList: [
      {
        title: {
          type: String
        },

        description: {
          type: String
        },

        points: {
          type: Number,
          default: 0
        },

        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ==========================================
    // PASSWORD RESET OTP
    // ==========================================

    resetCode: {
      type: String,
      default: null
    },

    resetCodeExpires: {
      type: Date,
      default: null
    },

    // ==========================================
    // EMAIL VERIFICATION OTP
    // ==========================================

    emailVerified: {
      type: Boolean,
      default: false
    },

    verificationCode: {
      type: String,
      default: null
    },

    verificationCodeExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODEL
// ==========================================

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);