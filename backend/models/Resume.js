const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    filename: {
      type: String,
      required: true
    },

    score: {
      type: Number,
      default: 0
    },

    skills: {
      type: [String],
      default: []
    },

    missingSkills: {
      type: [String],
      default: []
    },

    suggestions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resume", resumeSchema);