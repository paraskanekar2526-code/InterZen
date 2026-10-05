const express = require("express");
const multer = require("multer");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
saveResumeAnalysis,
getResumeAnalyses,
testResume,
} = require("../controllers/resumeController");

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.memoryStorage();

const upload = multer({
storage,

limits: {
fileSize: 5 * 1024 * 1024, // 5 MB
},

fileFilter: (req, file, cb) => {
const allowedMimeTypes = [
"application/pdf",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

```
if (allowedMimeTypes.includes(file.mimetype)) {
  cb(null, true);
} else {
  cb(
    new Error(
      "Only PDF and DOCX resume files are allowed."
    )
  );
}
```

},
});

// ======================================================
// TEST
// GET /api/resumes/
// ======================================================

router.get("/", testResume);

// ======================================================
// ANALYZE RESUME
// POST /api/resumes/analysis
// ======================================================

router.post(
"/analysis",
authMiddleware,
upload.single("resume"),
saveResumeAnalysis
);

// ======================================================
// GET USER RESUME ANALYSES
// GET /api/resumes/analyses
// ======================================================

router.get(
"/analyses",
authMiddleware,
getResumeAnalyses
);

// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use((error, req, res, next) => {
if (error instanceof multer.MulterError) {
if (error.code === "LIMIT_FILE_SIZE") {
return res.status(400).json({
message:
"Resume file is too large. Maximum size is 5 MB.",
});
}

```
return res.status(400).json({
  message: error.message,
});
```

}

if (error) {
return res.status(400).json({
message: error.message,
});
}

next();
});

module.exports = router;
