const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProgress,
  enrollCourse,
  completeLesson,
  getUserCourses,
  getCourseProgress,
  submitCourseQuiz
} = require("../controllers/progressController");

router.get("/", authMiddleware, getProgress);

router.get("/courses", authMiddleware, getUserCourses);

router.get("/courses/:courseId", authMiddleware, getCourseProgress);

router.post("/enroll", authMiddleware, enrollCourse);

router.post("/lesson-complete", authMiddleware, completeLesson);

router.post("/quiz-submit", authMiddleware, submitCourseQuiz);

module.exports = router;