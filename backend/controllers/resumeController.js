const Resume = require("../models/Resume");
const User = require("../models/User");

// =====================================================
// SAVE RESUME ANALYSIS
// POST /api/resumes/analysis
// =====================================================

exports.saveResumeAnalysis = async (req, res) => {
  try {
    const {
      filename,
      score,
      skills,
      missingSkills,
      suggestions
    } = req.body;

    if (!filename || !filename.trim()) {
      return res.status(400).json({
        message: "Resume filename is required."
      });
    }

    const resumeData = {
      userId: req.user.userId,
      filename: filename.trim(),
      score: Number(score) || 0,
      skills: Array.isArray(skills) ? skills : [],
      missingSkills: Array.isArray(missingSkills)
        ? missingSkills
        : [],
      suggestions: Array.isArray(suggestions)
        ? suggestions
        : []
    };

    // =================================================
    // DEMO MODE
    // =================================================

    if (process.env.DEMO_MODE === "true") {
      return res.status(201).json({
        message:
          "Resume analysis saved successfully (Demo Mode).",
        resume: resumeData
      });
    }

    // =================================================
    // SAVE TO MONGODB
    // =================================================

    const resume = await Resume.create(resumeData);

    // Update user's resume score
    await User.findByIdAndUpdate(
      req.user.userId,
      {
        resumeScore: Number(score) || 0
      },
      {
        new: true
      }
    );

    return res.status(201).json({
      message: "Resume analysis saved successfully.",
      resume
    });
  } catch (error) {
    console.error(
      "Save Resume Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to save resume analysis.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
};


// =====================================================
// GET USER RESUME ANALYSES
// GET /api/resumes/analyses
// =====================================================

exports.getResumeAnalyses = async (req, res) => {
  try {
    // =================================================
    // DEMO MODE
    // =================================================

    if (process.env.DEMO_MODE === "true") {
      return res.status(200).json({
        message:
          "Resume analyses fetched successfully (Demo Mode).",
        resumes: []
      });
    }

    // =================================================
    // FETCH FROM MONGODB
    // =================================================

    const resumes = await Resume.find({
      userId: req.user.userId
    }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      message: "Resume analyses fetched successfully.",
      resumes
    });
  } catch (error) {
    console.error(
      "Get Resume Error:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch resume analyses.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
};


// =====================================================
// TEST RESUME ROUTE
// GET /api/resumes
// =====================================================

exports.testResume = (req, res) => {
  return res.status(200).json({
    message: "Resume controller working."
  });
};