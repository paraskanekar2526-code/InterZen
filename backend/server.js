require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const internhelpRoutes = require("./routes/internhelpRoutes");
const interviewScheduleRoutes = require("./routes/interviewScheduleRoutes");
const interviewRecordingRoutes = require("./routes/interviewRecordingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://interzen-frontend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.options("*", cors());

app.use(express.json());

// Serve uploaded recordings
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==============================
// CONNECT MONGODB
// ==============================

connectDB();

// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
  res.json({
    message: "InterZen Backend API is running 🚀"
  });
});

// ==============================
// HEALTH CHECK
// ==============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "InterZen",
    mode:
      process.env.DEMO_MODE === "true"
        ? "Demo Mode"
        : "Production Mode"
  });
});

// ==============================
// API ROUTES
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/resumes", resumeRoutes);

app.use("/api/interviews", interviewRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/internhelp", internhelpRoutes);

app.use("/api/schedules", interviewScheduleRoutes);
app.use("/api/admin", adminRoutes);

app.use(
  "/api/recordings",
  interviewRecordingRoutes
);

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(
    `InterZen backend running on http://localhost:${PORT}`
  );
});