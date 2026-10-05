const mongoose = require("mongoose");

const userCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // IMPORTANT:
    // Course IDs are strings such as:
    // "python-basics"
    // "dsa-basics"
    // "javascript-basics"
    courseId: {
      type: String,
      required: true,
      trim: true,
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    totalLessons: {
      type: Number,
      required: true,
      min: 0,
    },

    completedLessons: {
      type: [Number],
      default: [],
    },

    currentLesson: {
      type: Number,
      default: 0,
      min: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    quizCompleted: {
      type: Boolean,
      default: false,
    },

    quizScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    quizTotalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    quizPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
====================================================
INDEX
====================================================
*/

userCourseSchema.index(
  {
    userId: 1,
    courseId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "UserCourse",
  userCourseSchema
);