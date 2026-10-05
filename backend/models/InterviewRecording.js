
const mongoose = require("mongoose");

const interviewRecordingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    interviewType: {
      type: String,
      enum: [
        "technical",
        "hr",
        "face",
        "voice",
        "group",
        "coding",
        "practice",
        "mock"
      ],
      default: "practice"
    },

    title: {
      type: String,
      default: "Interview Recording",
      trim: true
    },

    recordingUrl: {
      type: String,
      required: true
    },

    duration: {
      type: Number,
      default: 0,
      min: 0
    },

    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.InterviewRecording ||
  mongoose.model(
    "InterviewRecording",
    interviewRecordingSchema
  );
