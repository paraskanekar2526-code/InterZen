const User = require("../models/User");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "name email resumeScore readinessScore interviewsCompleted codingProblems practiceHours achievements"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const interviewsCompleted = await Interview.countDocuments({
      userId: userId
    });
    const latestResume = await Resume.findOne({
      userId: userId
    }).sort({ createdAt: -1 });

    const resumeScore = latestResume
      ? latestResume.score
     : 0;
    const interviews = await Interview.find({
      userId: userId
    }).select("score duration");

    const readinessScore =
       interviews.length > 0
       ? Math.round(
          interviews.reduce(
          (total, interview) => total + (interview.score || 0),
          0
        ) / interviews.length
      )
      : 0;
    const practiceMinutes = Math.round(
      interviews.reduce(
      (total, interview) =>
      total + (interview.duration || 0),
      0
      )
    );

    const codingInterviews = await Interview.find({
      userId: userId,
      type: "coding"
    }).select("answeredQuestions");

    const codingProblems = codingInterviews.reduce(
      (total, interview) =>
      total + (interview.answeredQuestions || 0),
      0
    );

    res.json({
      message: "Dashboard data fetched successfully",
      userId: userId,

      user: {
        name: user.name,
        email: user.email
      },

      stats: {
        interviewsCompleted: interviewsCompleted,
        resumeScore: resumeScore,
        readinessScore: readinessScore,
        codingProblems: codingProblems,
        practiceHours: practiceMinutes,
        achievements: user.achievements || 0
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch dashboard data"
    });
  }
};