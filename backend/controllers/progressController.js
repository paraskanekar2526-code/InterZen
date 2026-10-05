const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const User = require("../models/User");
const UserCourse = require("../models/UserCourse");

/*
====================================================
GET OVERALL USER PROGRESS
GET /api/progress
====================================================
*/

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // =========================
    // DEMO MODE
    // =========================

    if (process.env.DEMO_MODE === "true") {
      return res.json({
        message: "Progress data fetched successfully (Demo Mode)",

        progress: {
          interviewsCompleted: 5,
          readinessScore: 78,
          resumeScore: 82,
          codingProblems: 12,
          practiceHours: 8.5,
          achievements: 4,
          totalQuestions: 25,
          completedModules: 4
        }
      });
    }

    // =========================
    // GET USER
    // =========================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // =========================
    // INTERVIEWS
    // =========================

    const interviews = await Interview.find({
      userId
    });

    const technicalInterviews = interviews.filter(
      (interview) => interview.type === "technical"
    );

    const communicationInterviews = interviews.filter(
      (interview) =>
        interview.type === "hr" ||
        interview.type === "group"
    );

    const technicalScore =
      technicalInterviews.length > 0
        ? Math.round(
            technicalInterviews.reduce(
              (total, interview) =>
                total + (interview.score || 0),
              0
            ) / technicalInterviews.length
          )
        : 0;

    const communicationScore =
      communicationInterviews.length > 0
        ? Math.round(
            communicationInterviews.reduce(
              (total, interview) =>
                total + (interview.score || 0),
              0
            ) / communicationInterviews.length
          )
        : 0;

    // =========================
    // RESUME
    // =========================

    const resumes = await Resume.find({
      userId
    }).sort({
      createdAt: -1
    });

    // =========================
    // INTERVIEW COUNT
    // =========================

    const interviewsCompleted = interviews.length;

    // =========================
    // READINESS SCORE
    // =========================

    let readinessScore = 0;

    if (interviews.length > 0) {
      const totalScore = interviews.reduce(
        (total, interview) =>
          total + (interview.score || 0),
        0
      );

      readinessScore = Math.round(
        totalScore / interviews.length
      );
    }

    // =========================
    // RESUME SCORE
    // =========================

    const resumeScore =
      resumes.length > 0
        ? resumes[0].score || 0
        : user.resumeScore || 0;

    // =========================
    // CODING PROBLEMS
    // =========================

    const codingInterviews = interviews.filter(
      (interview) => interview.type === "coding"
    );

    const codingProblems = codingInterviews.reduce(
      (total, interview) =>
        total + (interview.answeredQuestions || 0),
      0
    );

    // =========================
    // PRACTICE HOURS
    // =========================

    const totalDuration = interviews.reduce(
      (total, interview) =>
        total + (interview.duration || 0),
      0
    );

    const practiceHours = Number(
      (totalDuration / 60).toFixed(1)
    );

    // =========================
    // COMPLETED MODULES
    // =========================

    const completedModules = [
      interviewsCompleted > 0,
      resumeScore > 0,
      codingProblems > 0,

      interviews.some(
        (interview) => interview.type === "hr"
      ),

      interviews.some(
        (interview) => interview.type === "voice"
      ),

      interviews.some(
        (interview) => interview.type === "face"
      ),

      interviews.some(
        (interview) => interview.type === "group"
      )
    ].filter(Boolean).length;

    // =========================
    // RESPONSE
    // =========================

    res.json({
      message: "Progress data fetched successfully",

      progress: {
        interviewsCompleted,
        readinessScore,
        resumeScore,
        technicalScore,
        communicationScore,
        codingProblems,
        practiceHours,

        achievements:
          user.achievements || 0,

        totalQuestions:
          interviews.reduce(
            (total, interview) =>
              total +
              (interview.totalQuestions || 0),
            0
          ),

        completedModules
      }
    });

  } catch (error) {
    console.error(
      "Progress Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch progress data"
    });
  }
};


/*
====================================================
ENROLL IN COURSE
POST /api/progress/enroll
====================================================
*/

exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      courseId,
      courseTitle,
      category,
      totalLessons
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !courseId ||
      !courseTitle ||
      !category ||
      totalLessons === undefined
    ) {
      return res.status(400).json({
        message: "Course information is required"
      });
    }

    const numericTotalLessons = Number(totalLessons);

    if (
      Number.isNaN(numericTotalLessons) ||
      numericTotalLessons <= 0
    ) {
      return res.status(400).json({
        message: "Invalid total lessons"
      });
    }

    // =========================
    // GET USER
    // =========================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // =========================
    // CHECK EXISTING COURSE
    // =========================

    let userCourse = await UserCourse.findOne({
      userId,
      courseId: String(courseId)
    });

    if (userCourse) {
      return res.json({
        message: "Course already enrolled",
        course: userCourse
      });
    }

    // =========================
    // CREATE COURSE
    // =========================

    userCourse = await UserCourse.create({
      userId,

      courseId: String(courseId),

      courseTitle,

      category,

      totalLessons: numericTotalLessons,

      completedLessons: [],

      currentLesson: 0,

      progress: 0,

      quizCompleted: false,

      quizScore: 0,

      quizTotalQuestions: 0,

      quizPercentage: 0,

      enrolledAt: new Date(),

      completedAt: null
    });

    // =========================
    // RESPONSE
    // =========================

    res.status(201).json({
      message: "Course enrolled successfully",
      course: userCourse
    });

  } catch (error) {
    console.error(
      "Course Enrollment Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to enroll in course"
    });
  }
};


/*
====================================================
MARK LESSON COMPLETE
POST /api/progress/lesson-complete
====================================================
*/

exports.completeLesson = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      courseId,
      lessonIndex,
      totalLessons
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !courseId ||
      lessonIndex === undefined ||
      totalLessons === undefined
    ) {
      return res.status(400).json({
        message:
          "Course and lesson information is required"
      });
    }

    const numericLessonIndex = Number(
      lessonIndex
    );

    const numericTotalLessons = Number(
      totalLessons
    );

    if (
      Number.isNaN(numericLessonIndex) ||
      Number.isNaN(numericTotalLessons)
    ) {
      return res.status(400).json({
        message: "Invalid lesson information"
      });
    }

    // =========================
    // LESSON RANGE
    // =========================

    if (
      numericLessonIndex < 0 ||
      numericLessonIndex >= numericTotalLessons
    ) {
      return res.status(400).json({
        message: "Invalid lesson number"
      });
    }

    // =========================
    // FIND COURSE
    // =========================

    const userCourse =
      await UserCourse.findOne({
        userId,
        courseId: String(courseId)
      });

    if (!userCourse) {
      return res.status(404).json({
        message: "Course not enrolled"
      });
    }

    // =========================
    // ADD COMPLETED LESSON
    // =========================

    if (
      !userCourse.completedLessons.includes(
        numericLessonIndex
      )
    ) {
      userCourse.completedLessons.push(
        numericLessonIndex
      );
    }

    // =========================
    // CALCULATE PROGRESS
    // =========================

    const total =
      userCourse.totalLessons ||
      numericTotalLessons;

    userCourse.progress = Math.round(
      (userCourse.completedLessons.length /
        total) *
        100
    );

    // =========================
    // CURRENT LESSON
    // =========================

    if (
      numericLessonIndex <
      total - 1
    ) {
      userCourse.currentLesson =
        numericLessonIndex + 1;
    } else {
      userCourse.currentLesson =
        total - 1;
    }

    // =========================
    // COURSE COMPLETED
    // =========================

    if (
      userCourse.progress >= 100
    ) {
      userCourse.progress = 100;

      userCourse.completedAt =
        userCourse.completedAt ||
        new Date();
    }

    // =========================
    // SAVE
    // =========================

    await userCourse.save();

    // =========================
    // RESPONSE
    // =========================

    res.json({
      message:
        userCourse.progress >= 100
          ? "Course completed successfully"
          : "Lesson completed successfully",

      course: userCourse
    });

  } catch (error) {
    console.error(
      "Lesson Completion Error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to save lesson progress"
    });
  }
};


/*
====================================================
GET USER COURSES
GET /api/progress/courses
====================================================
*/

exports.getUserCourses = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const courses =
      await UserCourse.find({
        userId
      }).sort({
        updatedAt: -1
      });

    res.json({
      message: "Courses fetched successfully",
      courses
    });

  } catch (error) {
    console.error(
      "User Courses Error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to fetch courses"
    });
  }
};


/*
====================================================
GET SINGLE COURSE PROGRESS
GET /api/progress/courses/:courseId
====================================================
*/

exports.getCourseProgress = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    /*
    IMPORTANT:
    courseId is a STRING.

    Example:
    python-basics
    dsa-basics
    javascript-basics

    DO NOT use Number() here.
    */

    const courseId =
      String(req.params.courseId);

    // =========================
    // FIND COURSE
    // =========================

    const course =
      await UserCourse.findOne({
        userId,
        courseId
      });

    if (!course) {
      return res.status(404).json({
        message:
          "Course progress not found"
      });
    }

    res.json({
      message:
        "Course progress fetched successfully",

      course
    });

  } catch (error) {
    console.error(
      "Course Progress Error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to fetch course progress"
    });
  }
};


/*
====================================================
SUBMIT COURSE QUIZ
POST /api/progress/quiz-submit
====================================================
*/

exports.submitCourseQuiz = async (
  req,
  res
) => {
  try {
    // ==========================================
    // GET USER
    // ==========================================

    const userId = req.user.userId;

    // ==========================================
    // GET QUIZ DATA
    // ==========================================

    const {
      courseId,
      score,
      totalQuestions
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !courseId ||
      score === undefined ||
      totalQuestions === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz information is required"
      });
    }

    // ==========================================
    // CONVERT NUMBERS
    // ==========================================

    const numericScore = Number(score);
    const numericTotal = Number(totalQuestions);

    if (
      Number.isNaN(numericScore) ||
      Number.isNaN(numericTotal)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quiz information"
      });
    }

    // ==========================================
    // VALIDATE TOTAL QUESTIONS
    // ==========================================

    if (numericTotal <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Total questions must be greater than zero"
      });
    }

    // ==========================================
    // VALIDATE SCORE
    // ==========================================

    if (
      numericScore < 0 ||
      numericScore > numericTotal
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quiz score"
      });
    }

    // ==========================================
    // FIND USER COURSE
    // ==========================================

    const userCourse =
      await UserCourse.findOne({
        userId,
        courseId: String(courseId)
      });

    if (!userCourse) {
      return res.status(404).json({
        success: false,
        message:
          "Course not enrolled"
      });
    }

    // ==========================================
    // CHECK COURSE COMPLETION
    // ==========================================

    if (
      Number(userCourse.progress) < 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete all course lessons before taking the final quiz."
      });
    }

    // ==========================================
    // CALCULATE QUIZ PERCENTAGE
    // ==========================================

    const quizPercentage =
      Math.round(
        (numericScore /
          numericTotal) *
          100
      );

    // ==========================================
    // CHECK PASS STATUS
    // ==========================================

    const passed =
      quizPercentage >= 60;

    // ==========================================
    // SAVE QUIZ RESULT
    // ==========================================

    userCourse.quizCompleted =
      true;

    userCourse.quizScore =
      numericScore;

    userCourse.quizTotalQuestions =
      numericTotal;

    userCourse.quizPercentage =
      quizPercentage;

    // ==========================================
    // SAVE COURSE COMPLETION DATE
    // ==========================================

    if (passed) {
      userCourse.completedAt =
        userCourse.completedAt ||
        new Date();
    }

    // ==========================================
    // SAVE DATABASE
    // ==========================================

    await userCourse.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      success: true,

      message:
        passed
          ? "Quiz passed successfully. Certificate unlocked."
          : "Quiz submitted successfully.",

      quiz: {
        score: numericScore,

        totalQuestions:
          numericTotal,

        percentage:
          quizPercentage,

        passed
      },

      certificate: {
        eligible: passed,

        courseId:
          userCourse.courseId,

        courseTitle:
          userCourse.courseTitle,

        percentage:
          quizPercentage
      },

      course: userCourse
    });

  } catch (error) {

    console.error(
      "Course Quiz Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save quiz result",
      error:
        error.message
    });
  }
};