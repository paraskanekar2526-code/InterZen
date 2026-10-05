const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  saveInterviewResult,
  getInterviewResults,
  testInterview
} = require("../controllers/interviewController");

// Test
router.get("/", testInterview);

// Save interview result
router.post(
  "/result",
  authMiddleware,
  saveInterviewResult
);

// Get user's interview results
router.get(
  "/results",
  authMiddleware,
  getInterviewResults
);

module.exports = router;