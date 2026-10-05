const Interview = require("../models/Interview");
const User = require("../models/User");

exports.saveInterviewResult = async (req, res) => {
  try {
    const {
      type,
      score,
      totalQuestions,
      answeredQuestions,
      duration
    } = req.body;

    // Validate interview type
    const validTypes = [
      "technical",
      "hr",
      "coding",
      "voice",
      "face",
      "group"
    ];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Valid interview type is required"
      });
    }

    // Demo Mode
    if (process.env.DEMO_MODE === "true") {
      return res.status(201).json({
        message: "Interview result saved successfully (Demo Mode)",
        result: {
          userId: req.user.userId,
          type,
          score: score || 0,
          totalQuestions: totalQuestions || 0,
          answeredQuestions: answeredQuestions || 0,
          duration: duration || 0
        }
      });
    }

    // Save to MongoDB
    const interview = await Interview.create({
      userId: req.user.userId,
      type,
      score: score || 0,
      totalQuestions: totalQuestions || 0,
      answeredQuestions: answeredQuestions || 0,
      duration: duration || 0
    });
    await User.findByIdAndUpdate(
       req.user.userId,
    {
      $inc: {
         interviewsCompleted: 1
        }
    },
     { new: true }
    );

    res.status(201).json({
      message: "Interview result saved successfully",
      result: interview
    });
  } catch (error) {
    console.error("Save Interview Error:", error.message);

    res.status(500).json({
      message: "Unable to save interview result"
    });
  }
};

exports.getInterviewResults = async (req, res) => {
  try {
    // Demo Mode
    if (process.env.DEMO_MODE === "true") {
      return res.json({
        message: "Interview results fetched successfully (Demo Mode)",
        results: []
      });
    }

    const results = await Interview.find({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    res.json({
      message: "Interview results fetched successfully",
      results
    });
  } catch (error) {
    console.error("Get Interview Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch interview results"
    });
  }
};

exports.testInterview = (req, res) => {
  res.json({
    message: "Interview controller working"
  });
};