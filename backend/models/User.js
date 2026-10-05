
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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

    password: {
      type: String,
      required: true
    },

    role: {
  type: String,
  enum: ["student", "admin"],
  default: "student"
},

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

    // Existing achievement count
    achievements: {
      type: Number,
      default: 0
    },

    // Gamification points
    points: {
      type: Number,
      default: 0
    },

    // Gamification level
    level: {
      type: Number,
      default: 1
    },

    // Earned badges
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

    // Detailed achievement records
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

    resetCode: {
      type: String,
      default: null
    },

    resetCodeExpires: {
      type: Date,
      default: null
    },

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

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

