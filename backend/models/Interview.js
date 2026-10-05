const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    type: {
      type: String,
      enum: [
        "technical",
        "hr",
        "coding",
        "voice",
        "face",
        "group"
      ],
      required: true
    },

    score: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      default: 0
    },

    answeredQuestions: {
      type: Number,
      default: 0
    },

    duration: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Interview ||
  mongoose.model("Interview", interviewSchema);