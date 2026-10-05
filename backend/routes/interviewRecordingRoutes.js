const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const InterviewRecording = require("../models/InterviewRecording");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// CREATE UPLOADS FOLDER
// =========================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

// =========================================
// MULTER STORAGE
// =========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname || ".webm");

    cb(null, uniqueName);
  }
});

// =========================================
// UPLOAD CONFIGURATION
// =========================================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/webm",
      "video/mp4",
      "video/ogg"
    ];

    if (
      allowedTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only WEBM, MP4 and OGG video files are allowed."
        )
      );
    }
  }
});

// =========================================
// GET ALL RECORDINGS
// GET /api/recordings
// =========================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId || req.user.id;

      const recordings =
        await InterviewRecording.find({
          user: userId
        }).sort({
          createdAt: -1
        });

      res.json({
        recordings
      });

    } catch (error) {
      console.error(
        "Get Recordings Error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load recordings"
      });
    }
  }
);

// =========================================
// CREATE RECORDING
// POST /api/recordings
// =========================================

router.post(
  "/",
  authMiddleware,
  upload.single("recording"),
  async (req, res) => {
    try {
      const userId =
        req.user.userId || req.user.id;

      const {
        interviewType,
        title,
        duration
      } = req.body;

      // Check uploaded file
      if (!req.file) {
        return res.status(400).json({
          message:
            "Recording file is required"
        });
      }

      // URL that will be stored in MongoDB
      const recordingUrl =
        `/uploads/${req.file.filename}`;

      const recording =
        await InterviewRecording.create({
          user: userId,

          interviewType:
            interviewType || "practice",

          title:
            title ||
            "Interview Recording",

          recordingUrl,

          duration:
            Number(duration) || 0
        });

      res.status(201).json({
        message:
          "Recording saved successfully",

        recording
      });

    } catch (error) {
      console.error(
        "Create Recording Error:",
        error
      );

      // Delete uploaded file if database save failed
      if (req.file) {
        const filePath =
          path.join(
            uploadDirectory,
            req.file.filename
          );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        message:
          "Unable to save recording"
      });
    }
  }
);

// =========================================
// GET SINGLE RECORDING
// GET /api/recordings/:id
// =========================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId || req.user.id;

      const recording =
        await InterviewRecording.findOne({
          _id: req.params.id,
          user: userId
        });

      if (!recording) {
        return res.status(404).json({
          message:
            "Recording not found"
        });
      }

      res.json({
        recording
      });

    } catch (error) {
      console.error(
        "Get Recording Error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load recording"
      });
    }
  }
);

// =========================================
// DELETE RECORDING
// DELETE /api/recordings/:id
// =========================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId =
        req.user.userId || req.user.id;

      const recording =
        await InterviewRecording.findOneAndDelete({
          _id: req.params.id,
          user: userId
        });

      if (!recording) {
        return res.status(404).json({
          message:
            "Recording not found"
        });
      }

      // Delete physical recording file
      if (recording.recordingUrl) {
        const filename =
          path.basename(
            recording.recordingUrl
          );

        const filePath =
          path.join(
            uploadDirectory,
            filename
          );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        message:
          "Recording deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete Recording Error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete recording"
      });
    }
  }
);

// =========================================
// MULTER ERROR HANDLER
// =========================================

router.use(
  (error, req, res, next) => {
    console.error(
      "Recording Upload Error:",
      error
    );

    if (
      error instanceof multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "Recording is too large. Maximum size is 50 MB."
        });
      }
    }

    res.status(400).json({
      message:
        error.message ||
        "Unable to upload recording"
    });
  }
);

module.exports = router;