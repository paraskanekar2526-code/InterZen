import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import React, { useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import certificateTemplate from "./assets/interzen-certificate-template.png";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import EmotionDetection from "./components/EmotionDetection";

const API_URL = "http://localhost:5000/api";



/* =========================
   API HELPERS
========================= */

const getToken = () => {
  return localStorage.getItem("token");
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};


async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}),

      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

async function uploadRecording(
  recordingBlob,
  interviewType,
  title,
  duration
) {
  const token =
    localStorage.getItem("token");

  const formData = new FormData();

  formData.append(
    "recording",
    recordingBlob,
    "interview-recording.webm"
  );

  formData.append(
    "interviewType",
    interviewType || "face"
  );

  formData.append(
    "title",
    title || "Face-Cam Interview"
  );

  formData.append(
    "duration",
    String(duration || 0)
  );

  const response = await fetch(
    `${API_URL}/recordings`,
    {
      method: "POST",

      headers: {
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {})
      },

      body: formData
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Recording upload failed with status ${response.status}`
    );
  }

  return data;
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">IZ</span>
          <span>InterZen</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/interview">Interview</Link>
          <Link to="/coding">Coding</Link>
          <Link to="/internhelp">InternHelp</Link>
          <Link to="/learning">Learning</Link>
          <Link to="/career">Career Guidance</Link>
          <Link to="/readiness">Readiness</Link>
          <Link to="/placement">Placement Recommendations</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/about">About</Link>

          {user ? (
            <button className="nav-button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* =========================
   FOOTER
========================= */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <h3>InterZen</h3>
          <p>
            AI-Powered Interview Preparation & Career Guidance Platform.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/resume">Resume Analyzer</Link>
          <Link to="/interview">Interview Practice</Link>
        </div>

        <div>
          <h4>Features</h4>
          <Link to="/coding">Coding Interview</Link>
          <Link to="/internhelp">InternHelp</Link>
          <Link to="/voice">Voice Assistant</Link>
          <Link to="/face">Face Interview</Link>
          <Link to="/emotion">Emotion Detection</Link>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 InterZen. All rights reserved.
      </div>
    </footer>
  );
}

/* =========================
   LAYOUT
========================= */

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   HOME
========================= */

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="badge">🚀 AI-Powered Career Platform</div>

          <h1>
            Prepare Smarter.
            <br />
            <span>Interview Better.</span>
          </h1>

          <p>
            InterZen helps students prepare for technical, HR, coding,
            voice and face-to-face interviews with AI-powered tools.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              Get Started
            </Link>

            <Link to="/about" className="secondary-button">
              Learn More
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="ai-circle">🤖</div>
          <h3>Meet InternHelp</h3>
          <p>
            Your AI career assistant for interview preparation,
            learning and guidance.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>Everything You Need for Interview Preparation</h2>
          <p>
            Practice, analyze and improve your interview performance.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon="📄"
            title="Resume Analyzer"
            text="Analyze your resume and receive AI-powered suggestions."
            link="/resume"
          />

          <FeatureCard
            icon="🧠"
            title="AI Question Generator"
            text="Generate technical and HR interview questions."
            link="/questions"
          />

          <FeatureCard
            icon="💻"
            title="Coding Interview"
            text="Practice coding problems and improve problem-solving skills."
            link="/coding"
          />

          <FeatureCard
            icon="🎤"
            title="Voice Interview"
            text="Practice speaking with an AI-powered voice assistant."
            link="/voice"
          />

          <FeatureCard
            icon="📹"
            title="Face Interview"
            text="Practice face-to-face interview sessions."
            link="/face"
          />

          <FeatureCard
            icon="🤖"
            title="InternHelp"
            text="Get instant AI assistance throughout your preparation."
            link="/internhelp"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================
   FEATURE CARD
========================= */

function FeatureCard({ icon, title, text, link }) {
  return (
    <Link to={link} className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span>Explore →</span>
    </Link>
  );
}

/* =========================
   LOGIN / REGISTER
========================= */

function Auth({ mode = "login" }) {
  const navigate = useNavigate();

  const isLogin = mode === "login";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      /*
        ==============================
        REGISTER
        ==============================
      */

      if (!isLogin) {
        // Remove any old login information
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");

        const data = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password
          })
        });

        /*
          IMPORTANT:
          Do NOT store token during registration.

          User must verify email first.
        */

        localStorage.setItem(
          "interzen_verification_email",
          form.email
        );

        // Go to email verification page
        navigate("/verify-email");

        return;
      }

      /*
        ==============================
        LOGIN
        ==============================
      */

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      /*
        Login is allowed only after
        successful email verification.
      */

      if (!data.token) {
        throw new Error(
          "Login successful, but no authentication token was received."
        );
      }

      // Save login token
      localStorage.setItem(
        "token",
        data.token
      );

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user || {})
      );

      localStorage.setItem(
        "userName",
        data.user?.name ||
        data.user?.username ||
        data.name ||
        data.username ||
        ""
      );

      // Remove old verification data
      localStorage.removeItem(
        "interzen_verification_email"
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(
        isLogin
          ? "Login Error:"
          : "Registration Error:",
        err
      );

      setError(
        err.message ||
        (
          isLogin
            ? "Unable to login."
            : "Unable to create account."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          IZ
        </div>

        <h2>
          {isLogin
            ? "Welcome Back"
            : "Create Your Account"}
        </h2>

        <p>
          {isLogin
            ? "Login to continue your interview preparation."
            : "Join InterZen and start preparing for your career."}
        </p>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <Link
            to={
              isLogin
                ? "/register"
                : "/login"
            }
          >
            {isLogin
              ? " Register"
              : " Login"}
          </Link>

        </p>

      </div>
    </div>
  );
}


function QuickCard({ icon, title, text, link }) {
  return (
    <Link to={link} className="quick-card">
      <div className="quick-card-icon">
        {icon}
      </div>

      <div className="quick-card-content">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <span className="quick-card-arrow">
        →
      </span>
    </Link>
  );
}
/* =========================
   DASHBOARD
========================= */
function Dashboard() {
  const [dashboardData, setDashboardData] = React.useState(null);
  const [progressData, setProgressData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const user = getUser();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboardResponse = await apiRequest("/dashboard");
      const progressResponse = await apiRequest("/progress");

      setDashboardData(dashboardResponse);
      setProgressData(progressResponse);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your dashboard...</h2>
          <p>Preparing your InterZen learning overview.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to load Dashboard</h2>
          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={loadDashboardData}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats =
    dashboardData && dashboardData.stats
      ? dashboardData.stats
      : {};

  const progress =
    progressData && progressData.progress
      ? progressData.progress
      : {};

  const readinessScore = progress.readinessScore || 0;

  return (
    <div className="page-container dashboard-page">

      {/* Welcome Header */}
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-label">WELCOME BACK 👋</p>

          <h1>
            Hello, {user && user.name ? user.name : "Student"}!
          </h1>

          <p className="dashboard-subtitle">
            Continue your interview preparation journey with InterZen.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadDashboardData}
        >
          🔄 Refresh
        </button>
      </section>

      {/* Readiness Hero */}
      <section className="readiness-card">

        <div className="readiness-content">
          <p className="small-label">
            PLACEMENT READINESS
          </p>

          <h2>
            {readinessScore}%
          </h2>

          <p>
            Your current interview preparation score
          </p>

          <div className="readiness-bar">
            <div
              className="readiness-fill"
              style={{
                width: readinessScore + "%"
              }}
            ></div>
          </div>

          <span>
            Keep practicing to improve your readiness!
          </span>
        </div>

        <div className="readiness-circle">
          <div>
            <strong>{readinessScore}</strong>
            <span>/100</span>
          </div>
        </div>

      </section>

      {/* Statistics */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Your Progress</h2>
            <p>Track your preparation performance</p>
          </div>
        </div>

        <div className="stats-grid">

          <StatCard
            icon="🎤"
            title="Interviews"
            value={stats.interviewsCompleted || 0}
            subtitle="Completed"
          />

          <StatCard
            icon="📄"
            title="Resume Score"
            value={(stats.resumeScore || 0) + "%"}
            subtitle="Resume strength"
          />

          <StatCard
            icon="💻"
            title="Coding Problem"
            value={stats.codingProblems || 0}
            subtitle="Problems practiced"
          />

          <StatCard
            icon="⏱️"
            title="Practice"
            value={(stats.practiceHours || 0) + "min"}
            subtitle="Total practice"
          />

        </div>
      </section>

      {/* Preparation Progress */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Preparation Progress 📈</h2>
            <p>See how you're performing across important areas</p>
          </div>
        </div>

        <div className="progress-card">

          <div className="progress-item">
            <div className="progress-info">
              <span>Interview Practice</span>
              <strong>
                {Math.min(
                  (progress.interviewsCompleted || 0) * 10,
                  100
                )}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width:
                    Math.min(
                      (progress.interviewsCompleted || 0) * 10,
                      100
                    ) + "%"
                }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-info">
              <span>Resume Preparation</span>
              <strong>
                {progress.resumeScore || 0}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width:
                    (progress.resumeScore || 0) + "%"
                }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-info">
              <span>Coding Practice</span>
              <strong>
                {Math.min(
                  (progress.codingProblems || 0) * 5,
                  100
                )}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width:
                    Math.min(
                      (progress.codingProblems || 0) * 5,
                      100
                    ) + "%"
                }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-info">
              <span>Overall Readiness</span>
              <strong>
                {readinessScore}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: readinessScore + "%"
                }}
              ></div>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Quick Practice ⚡</h2>
            <p>Start preparing with one click</p>
          </div>
        </div>

        <div className="quick-grid">

          <QuickCard
            icon="📄"
            title="Analyze Resume"
            text="Check your resume score and skills"
            link="/resume"
          />

          <QuickCard
            icon="🧠"
            title="AI Questions"
            text="Practice AI-generated interview questions"
            link="/questions"
          />

          <QuickCard
            icon="💻"
            title="Coding Interview"
            text="Solve coding problems"
            link="/coding"
          />

          <QuickCard
            icon="🎤"
            title="Technical Interview"
            text="Practice technical questions"
            link="/technical-interview"
          />

          <QuickCard
            icon="👔"
            title="HR Interview"
            text="Improve your HR interview skills"
            link="/hr-interview"
          />

          <QuickCard
            icon="🤖"
            title="InternHelp"
            text="Ask your AI preparation assistant"
            link="/internhelp"
          />

        </div>
      </section>

      {/* Achievements + Tips */}
      <section className="dashboard-bottom-grid">

        <div className="achievement-card">

          <div className="card-title">
            <div>
              <h2>Achievements 🏆</h2>
              <p>Your preparation milestones</p>
            </div>

            <span className="achievement-count">
              {progress.achievements || 0}
            </span>
          </div>

          <div className="achievement-list">

            <div className="achievement-item">
              <span>🎯</span>
              <div>
                <strong>Interview Explorer</strong>
                <p>Complete your first interview</p>
              </div>
            </div>

            <div className="achievement-item">
              <span>💻</span>
              <div>
                <strong>Code Practice</strong>
                <p>Practice coding problems</p>
              </div>
            </div>

            <div className="achievement-item">
              <span>📄</span>
              <div>
                <strong>Resume Ready</strong>
                <p>Analyze and improve your resume</p>
              </div>
            </div>

          </div>

        </div>

        <div className="tips-card">

          <div className="card-title">
            <div>
              <h2>Today's Tip 💡</h2>
              <p>Improve your interview performance</p>
            </div>
          </div>

          <div className="tip-content">
            <div className="tip-icon">💡</div>

            <div>
              <h3>Practice your answers aloud</h3>

              <p>
                Speaking your answers helps improve confidence,
                communication and interview fluency. Try the
                Voice Interview module today.
              </p>

              <Link
                to="/voice"
                className="tip-link"
              >
                Try Voice Interview →
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* Modules */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>InterZen Modules 🚀</h2>
            <p>Explore your complete preparation toolkit</p>
          </div>
        </div>

        <div className="module-grid">

          <Link to="/resume" className="module-card">
            <span>📄</span>
            <strong>Resume Analyzer</strong>
            <small>Improve your resume</small>
          </Link>

          <Link to="/technical-interview" className="module-card">
            <span>🧑‍💻</span>
            <strong>Technical Interview</strong>
            <small>Practice technical questions</small>
          </Link>

          <Link to="/hr-interview" className="module-card">
            <span>👔</span>
            <strong>HR Interview</strong>
            <small>Prepare for HR rounds</small>
          </Link>

          <Link to="/coding" className="module-card">
            <span>💻</span>
            <strong>Coding Interview</strong>
            <small>Practice programming</small>
          </Link>

          <Link to="/voice" className="module-card">
            <span>🎙️</span>
            <strong>Voice Interview</strong>
            <small>Practice speaking</small>
          </Link>

          <Link to="/face" className="module-card">
            <span>📹</span>
            <strong>Face Interview</strong>
            <small>Practice with camera</small>
          </Link>

        </div>

      </section>

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

/* =========================
   QUICK CARD
========================= */

function ResumeAnalyzer() {
const [file, setFile] = React.useState(null);

const [filename, setFilename] = React.useState("");

const [score, setScore] = React.useState(null);

const [skills, setSkills] = React.useState([]);

const [missingSkills, setMissingSkills] =
React.useState([]);

const [suggestions, setSuggestions] =
React.useState([]);

const [loading, setLoading] =
React.useState(false);

const [saved, setSaved] =
React.useState(false);

const [error, setError] =
React.useState("");

const [resumeHistory, setResumeHistory] =
React.useState([]);

// ==================================================
// HANDLE FILE SELECTION
// ==================================================

const handleFileChange = (event) => {
const selectedFile =
event.target.files?.[0];


setError("");
setSaved(false);

if (!selectedFile) {
  setFile(null);
  setFilename("");
  return;
}

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

if (
  !allowedTypes.includes(
    selectedFile.type
  )
) {
  setFile(null);
  setFilename("");

  setError(
    "Please select a PDF or DOCX resume."
  );

  return;
}

const maxSize =
  5 * 1024 * 1024;

if (selectedFile.size > maxSize) {
  setFile(null);
  setFilename("");

  setError(
    "Resume file must be smaller than 5 MB."
  );

  return;
}

setFile(selectedFile);
setFilename(selectedFile.name);


};

// ==================================================
// ANALYZE RESUME
// ==================================================

const analyzeResume = async () => {
if (!file) {
setError(
"Please select your resume first."
);


  return;
}

setLoading(true);
setError("");
setSaved(false);

try {
  const formData =
    new FormData();

  formData.append(
    "resume",
    file
  );

  const token =
    localStorage.getItem("token");

  const response =
    await fetch(
      "http://localhost:5000/api/resumes/analysis",
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to analyze resume."
    );
  }

  const resume =
    data.resume || {};

  setScore(
    Number(resume.score) || 0
  );

  setSkills(
    Array.isArray(resume.skills)
      ? resume.skills
      : []
  );

  setMissingSkills(
    Array.isArray(
      resume.missingSkills
    )
      ? resume.missingSkills
      : []
  );

  setSuggestions(
    Array.isArray(
      resume.suggestions
    )
      ? resume.suggestions
      : []
  );

  setSaved(true);

  // Refresh user's resume history
  loadResumeHistory();

} catch (error) {
  console.error(
    "Resume Analysis Error:",
    error
  );

  setError(
    error.message ||
      "Unable to analyze resume."
  );
} finally {
  setLoading(false);
}


};

// ==================================================
// LOAD RESUME HISTORY
// ==================================================

const loadResumeHistory =
async () => {
try {
const data =
await apiRequest(
"/resumes/analyses"
);


    setResumeHistory(
      Array.isArray(data.resumes)
        ? data.resumes
        : []
    );
  } catch (error) {
    console.error(
      "Resume History Error:",
      error
    );
  }
};


// ==================================================
// LOAD HISTORY WHEN PAGE OPENS
// ==================================================

React.useEffect(() => {
loadResumeHistory();
}, []);

// ==================================================
// OPEN RESUME BUILDER
// ==================================================

const openResumeBuilder = () => {
window.open(
"https://rxresu.me/",
"_blank",
"noopener,noreferrer"
);
};

// ==================================================
// RESET ANALYSIS
// ==================================================

const resetResume = () => {
setFile(null);
setFilename("");
setScore(null);
setSkills([]);
setMissingSkills([]);
setSuggestions([]);
setSaved(false);
setError("");

const input =
  document.getElementById(
    "resume-file-input"
  );

if (input) {
  input.value = "";
}

};

// ==================================================
// UI
// ==================================================

return ( <div className="page-container">


  {/* ============================================
      HEADER
  ============================================ */}

  <div className="page-header">

    <span className="badge">
      AI Resume Analyzer
    </span>

    <h1>
      Analyze Your{" "}
      <span>Resume</span> 📄
    </h1>

    <p>
      Upload your original resume and let
      InterZen analyze your skills,
      missing skills and improvement areas.
    </p>

  </div>

  {/* ============================================
      UPLOAD CARD
  ============================================ */}

  <div className="resume-upload-card">

    <div className="upload-icon">
      📄
    </div>

    <h2>
      Upload Your Resume
    </h2>

    <p>
      Supported formats: PDF and DOCX
      · Maximum size: 5 MB
    </p>

    <input
      id="resume-file-input"
      type="file"
      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      onChange={handleFileChange}
      className="input-field"
    />

    {filename && (
      <div
        className="info-box"
        style={{
          marginTop: "15px",
        }}
      >
        <strong>
          Selected Resume
        </strong>

        <p>
          📄 {filename}
        </p>
      </div>
    )}

    {error && (
      <div
        className="error-box"
        style={{
          marginTop: "15px",
        }}
      >
        {error}
      </div>
    )}

    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "18px",
      }}
    >

      <button
        className="primary-btn"
        onClick={analyzeResume}
        disabled={
          loading || !file
        }
      >
        {loading
          ? "🤖 Analyzing Resume..."
          : "Analyze Resume"}
      </button>

      {file && !loading && (
        <button
          className="secondary-btn"
          onClick={resetResume}
        >
          Choose Another Resume
        </button>
      )}

    </div>

    {saved && (
      <div
        className="success-box"
        style={{
          marginTop: "15px",
        }}
      >
        Resume analyzed and saved
        successfully! ✅
      </div>
    )}

  </div>

  {/* ============================================
      NO RESUME / RESUME BUILDER
  ============================================ */}

  <div
    className="analysis-card"
    style={{
      marginTop: "25px",
    }}
  >

    <h2>
      Don't Have a Resume? 📝
    </h2>

    <p>
      Create a professional resume first,
      then upload it here for InterZen
      analysis.
    </p>

    <button
      className="primary-btn"
      onClick={
        openResumeBuilder
      }
    >
      Create Resume with
      Open-Source Resume Builder ↗
    </button>

    <p
      style={{
        marginTop: "10px",
        fontSize: "13px",
        opacity: 0.75,
      }}
    >
      Opens Reactive Resume in a new tab.
    </p>

  </div>

  {/* ============================================
      RESULTS
  ============================================ */}

  {score !== null && (
    <div
      className="resume-results"
      style={{
        marginTop: "25px",
      }}
    >

      {/* SCORE */}

      <div className="score-card">

        <div className="score-circle">

          <strong>
            {score}
          </strong>

          <span>
            /100
          </span>

        </div>

        <h2>
          Resume Score
        </h2>

        <p>
          Your original resume has been
          analyzed by InterZen.
        </p>

      </div>

      {/* DETECTED SKILLS */}

      <div className="analysis-card">

        <h2>
          Detected Skills 🧠
        </h2>

        {skills.length > 0 ? (
          <div className="tag-list">

            {skills.map(
              (skill, index) => (
                <span
                  className="skill-tag"
                  key={index}
                >
                  {skill}
                </span>
              )
            )}

          </div>
        ) : (
          <p>
            No specific skills were
            detected in the resume.
          </p>
        )}

      </div>

      {/* MISSING SKILLS */}

      <div className="analysis-card">

        <h2>
          Missing / Underrepresented
          Skills 🎯
        </h2>

        {missingSkills.length > 0 ? (
          <div className="tag-list">

            {missingSkills.map(
              (skill, index) => (
                <span
                  className="missing-tag"
                  key={index}
                >
                  {skill}
                </span>
              )
            )}

          </div>
        ) : (
          <p>
            No major missing skills were
            identified.
          </p>
        )}

      </div>

      {/* SUGGESTIONS */}

      <div className="analysis-card">

        <h2>
          AI Suggestions 💡
        </h2>

        {suggestions.length > 0 ? (
          <ul className="suggestion-list">

            {suggestions.map(
              (
                suggestion,
                index
              ) => (
                <li key={index}>
                  💡 {suggestion}
                </li>
              )
            )}

          </ul>
        ) : (
          <p>
            No suggestions available.
          </p>
        )}

      </div>

    </div>
  )}

  {/* ============================================
      RESUME HISTORY
  ============================================ */}

  {resumeHistory.length > 0 && (
    <div
      className="analysis-card"
      style={{
        marginTop: "25px",
      }}
    >

      <h2>
        Previous Resume Analyses 📚
      </h2>

      <div className="resume-history-list">

        {resumeHistory.map(
          (resume, index) => (
            <div
              key={
                resume._id ||
                index
              }
              className="answer-review"
            >

              <strong>
                📄 {resume.filename}
              </strong>

              <p>
                Score:{" "}
                <strong>
                  {resume.score}/100
                </strong>
              </p>

              {resume.createdAt && (
                <p>
                  Analyzed on:{" "}
                  {new Date(
                    resume.createdAt
                  ).toLocaleDateString()}
                </p>
              )}

            </div>
          )
        )}

      </div>

    </div>
  )}

</div>

);
}


/* =========================
   QUESTION GENERATOR
========================= */

function QuestionGenerator() {
  const [category, setCategory] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [domain, setDomain] = useState("JavaScript");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const questionBank = {
    technical: {
      easy: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyperlink Text Management Language",
            "Home Tool Markup Language"
          ],
          answer: "Hyper Text Markup Language"
        },
        {
          question: "Which language is used to style web pages?",
          options: ["HTML", "CSS", "SQL", "Python"],
          answer: "CSS"
        },
        {
          question: "Which keyword declares a variable in JavaScript?",
          options: ["var", "define", "variable", "declare"],
          answer: "var"
        }
      ],
      medium: [
        {
          question: "Which data structure follows LIFO?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          answer: "Stack"
        },
        {
          question: "Which protocol is commonly used for secure web communication?",
          options: ["HTTP", "FTP", "HTTPS", "SMTP"],
          answer: "HTTPS"
        },
        {
          question: "What does API stand for?",
          options: [
            "Application Programming Interface",
            "Advanced Programming Internet",
            "Application Process Integration",
            "Automated Programming Interface"
          ],
          answer: "Application Programming Interface"
        },
        {
          question: "Which database is a NoSQL database?",
          options: ["MySQL", "MongoDB", "Oracle", "PostgreSQL"],
          answer: "MongoDB"
        },
        {
          question: "Which JavaScript framework is used for building user interfaces?",
          options: ["React", "Express", "MongoDB", "Node"],
          answer: "React"
        }
      ],
      hard: [
        {
          question: "Which algorithm is commonly used for shortest path in a graph with non-negative edge weights?",
          options: [
            "Dijkstra's Algorithm",
            "Bubble Sort",
            "Binary Search",
            "DFS only"
          ],
          answer: "Dijkstra's Algorithm"
        },
        {
          question: "Which concept allows an object to take multiple forms?",
          options: [
            "Encapsulation",
            "Inheritance",
            "Polymorphism",
            "Abstraction"
          ],
          answer: "Polymorphism"
        },
        {
          question: "What is the average time complexity of hash table lookup?",
          options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
          answer: "O(1)"
        }
      ]
    },

    hr: {
      easy: [
        {
          question: "Which is the best way to introduce yourself in an interview?",
          options: [
            "Give a concise professional introduction",
            "Talk only about hobbies",
            "Read your entire resume",
            "Give personal family details"
          ],
          answer: "Give a concise professional introduction"
        },
        {
          question: "What should you do before an interview?",
          options: [
            "Research the company",
            "Ignore the job description",
            "Arrive late",
            "Avoid preparing questions"
          ],
          answer: "Research the company"
        }
      ],
      medium: [
        {
          question: "How should you answer 'Tell me about yourself'?",
          options: [
            "Give a focused summary of your education, skills and goals",
            "Tell your complete life story",
            "Only mention your hobbies",
            "Give a one-word answer"
          ],
          answer: "Give a focused summary of your education, skills and goals"
        },
        {
          question: "What is an appropriate response to a weakness question?",
          options: [
            "Mention a genuine weakness and explain how you are improving",
            "Say you have no weaknesses",
            "Blame your previous teachers",
            "Avoid answering"
          ],
          answer: "Mention a genuine weakness and explain how you are improving"
        },
        {
          question: "What is important during teamwork?",
          options: [
            "Communication and cooperation",
            "Ignoring teammates",
            "Doing everything alone",
            "Avoiding responsibility"
          ],
          answer: "Communication and cooperation"
        }
      ],
      hard: [
        {
          question: "If you disagree with your manager, what is the professional approach?",
          options: [
            "Discuss the issue respectfully using facts",
            "Argue publicly",
            "Ignore the manager",
            "Immediately resign"
          ],
          answer: "Discuss the issue respectfully using facts"
        },
        {
          question: "How should you handle a difficult interview question?",
          options: [
            "Think carefully and answer honestly",
            "Invent information",
            "Refuse every question",
            "Change the topic"
          ],
          answer: "Think carefully and answer honestly"
        }
      ]
    },

    coding: {
      easy: [
        {
          question: "Which loop is commonly used when the number of iterations is known?",
          options: ["for", "while", "do-while", "switch"],
          answer: "for"
        },
        {
          question: "Which symbol is used for strict equality in JavaScript?",
          options: ["=", "==", "===", "!="],
          answer: "==="
        }
      ],
      medium: [
        {
          question: "What is the time complexity of binary search on a sorted array?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          answer: "O(log n)"
        },
        {
          question: "Which data structure is suitable for implementing a queue?",
          options: ["Array", "Stack only", "Tree only", "Graph only"],
          answer: "Array"
        },
        {
          question: "Which sorting algorithm has average O(n log n) complexity?",
          options: ["Bubble Sort", "Merge Sort", "Linear Search", "Selection only"],
          answer: "Merge Sort"
        }
      ],
      hard: [
        {
          question: "Which traversal of a Binary Search Tree produces sorted order?",
          options: ["Preorder", "Postorder", "Inorder", "Level order"],
          answer: "Inorder"
        },
        {
          question: "Which technique is commonly used to solve overlapping subproblems?",
          options: [
            "Dynamic Programming",
            "Linear Search",
            "Bubble Sort",
            "Random Guessing"
          ],
          answer: "Dynamic Programming"
        }
      ]
    }
  };

  const generateQuestions = async () => {
  setLoading(true);
  setScore(null);
  setAnswers([]);
  setSelectedAnswer("");
  setCurrentQuestion(0);

  try {
    const response = await fetch(
      "http://localhost:5000/api/internhelp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Generate ${questionCount} multiple-choice interview questions.

Category: ${category}
Technology/Domain: ${domain}
Difficulty: ${difficulty}

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Correct option"
  }
]

Do not include markdown.
Do not include explanations.
Make sure there are exactly 4 options for every question.
Make sure the answer exactly matches one of the options.`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate questions");
    }

    let generatedQuestions = data.reply || data.response || data.message;

    if (typeof generatedQuestions !== "string") {
      generatedQuestions = JSON.stringify(generatedQuestions);
    }

    generatedQuestions = generatedQuestions
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedQuestions = JSON.parse(generatedQuestions);

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("Invalid question format received from AI");
    }

    setQuestions(parsedQuestions);
  } catch (error) {
    console.error("AI Question Generation Error:", error);

    // Fallback to existing question bank
    const selectedBank =
      questionBank[category]?.[difficulty] || [];

    const shuffled = [...selectedBank].sort(
      () => Math.random() - 0.5
    );

    const count = Number(questionCount);

    const generated = shuffled.slice(0, count);

    setQuestions(generated);

    alert(
      "AI generation failed, so default questions are being used."
    );
  } finally {
    setLoading(false);
  }
};
  const submitAnswer = () => {
    if (!selectedAnswer) {
      return;
    }

    const question = questions[currentQuestion];

    const newAnswer = {
      question: question.question,
      selected: selectedAnswer,
      correct: question.answer,
      isCorrect: selectedAnswer === question.answer
    };

    const updatedAnswers = [...answers, newAnswer];

    setAnswers(updatedAnswers);
    setSelectedAnswer("");

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctAnswers = updatedAnswers.filter(
        (item) => item.isCorrect
      ).length;

      const finalScore = Math.round(
        (correctAnswers / questions.length) * 100
      );

      setScore(finalScore);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setScore(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">AI Question Generator</span>

        <h1>
          Generate Interview <span>Questions</span> 🧠
        </h1>

        <p>
          Practice technical, HR and coding questions with
          different difficulty levels.
        </p>
      </div>

      {questions.length === 0 && score === null && (
        <div className="generator-card">
          <h2>Question Settings</h2>

          <div className="form-grid">
  <div>
    <label>Category</label>

    <select
      className="input-field"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="technical">Technical</option>
      <option value="hr">HR</option>
      <option value="coding">Coding</option>
    </select>
  </div>

  <div>
    <label>Technology / Domain</label>

    <input
      type="text"
      className="input-field"
      value={domain}
      onChange={(e) => setDomain(e.target.value)}
      placeholder="e.g. JavaScript, Python, React"
    />
  </div>

  <div>
    <label>Difficulty</label>
              <select
                className="input-field"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label>Number of Questions</label>

              <select
                className="input-field"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(e.target.value)
                }
              >
                <option value="3">3 Questions</option>
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
              </select>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading
              ? "Generating Questions..."
              : "Generate Questions 🚀"}
          </button>
        </div>
      )}

      {questions.length > 0 && score === null && (
        <div className="quiz-card">
          <div className="quiz-top">
            <span>
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </span>

            <span className="badge">
              {difficulty.toUpperCase()}
            </span>
          </div>

          <h2>
            {questions[currentQuestion].question}
          </h2>

          <div className="options-list">
            {questions[currentQuestion].options.map(
              (option, index) => (
                <button
                  key={index}
                  className={
                    selectedAnswer === option
                      ? "option-btn selected"
                      : "option-btn"
                  }
                  onClick={() =>
                    setSelectedAnswer(option)
                  }
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              )
            )}
          </div>

          <button
            className="primary-btn"
            onClick={submitAnswer}
            disabled={!selectedAnswer}
          >
            {currentQuestion + 1 === questions.length
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      )}

      {score !== null && (
        <div className="quiz-result">
          <div className="score-card">
            <div className="score-circle">
              <strong>{score}</strong>
              <span>/100</span>
            </div>

            <h2>Quiz Completed! 🎉</h2>

            <p>
              You answered{" "}
              {
                answers.filter(
                  (answer) => answer.isCorrect
                ).length
              }{" "}
              out of {questions.length} questions correctly.
            </p>
          </div>

          <div className="analysis-card">
            <h2>Answer Review</h2>

            {answers.map((answer, index) => (
              <div
                className="answer-review"
                key={index}
              >
                <strong>
                  {index + 1}. {answer.question}
                </strong>

                <p>
                  Your answer: {answer.selected}
                </p>

                <p>
                  Correct answer: {answer.correct}
                </p>

                <span>
                  {answer.isCorrect
                    ? "✅ Correct"
                    : "❌ Incorrect"}
                </span>
              </div>
            ))}
          </div>

          <button
            className="primary-btn"
            onClick={resetQuiz}
          >
            Generate New Questions
          </button>
        </div>
      )}
    </div>
  );
}
/* =========================
   TECHNICAL INTERVIEW
========================= */

function TechnicalInterview() {
  const [topic, setTopic] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [startTime, setStartTime] = useState(null);

  const topics = {
    javascript: "JavaScript",
    react: "React",
    node: "Node.js",
    database: "Database",
    networking: "Computer Networking",
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSaveMessage("");
      setScore(null);
      setResults([]);
      setAnswer("");
      setCurrentQuestion(0);
      setStartTime(Date.now());

      const count = Number(questionCount);

      const prompt = `
You are a technical interviewer for an interview preparation platform.

Generate exactly ${count} technical interview questions.

Technology:
${topics[topic]}

Difficulty:
${difficulty}

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside JSON.

Required format:
[
  {
    "question": "Question text"
  }
]

Rules:
- Questions must be relevant to ${topics[topic]}.
- Questions must match ${difficulty} difficulty.
- Avoid duplicate questions.
- Questions should test actual technical understanding.
- Do not provide answers.
`;

      const response = await fetch(
        "http://localhost:5000/api/internhelp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate interview questions."
        );
      }

      let rawText =
        data.reply ||
        data.response ||
        data.message ||
        "";

      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let generatedQuestions;

      try {
        generatedQuestions = JSON.parse(rawText);
      } catch (parseError) {
        const startIndex = rawText.indexOf("[");
        const endIndex = rawText.lastIndexOf("]");

        if (startIndex !== -1 && endIndex !== -1) {
          generatedQuestions = JSON.parse(
            rawText.substring(startIndex, endIndex + 1)
          );
        } else {
          throw new Error("Invalid AI question format.");
        }
      }

      if (!Array.isArray(generatedQuestions)) {
        throw new Error("AI did not return a valid question list.");
      }

      const validQuestions = generatedQuestions
        .filter(
          (item) =>
            item &&
            typeof item.question === "string" &&
            item.question.trim()
        )
        .slice(0, count);

      if (validQuestions.length === 0) {
        throw new Error(
          "No valid technical questions were generated."
        );
      }

      setQuestions(validQuestions);
      setStarted(true);
    } catch (error) {
      console.error(
        "Technical Interview Generation Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to start technical interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswerWithAI = async (
    question,
    userAnswer
  ) => {
    const prompt = `
You are evaluating a technical interview answer.

Technology:
${topics[topic]}

Difficulty:
${difficulty}

Question:
${question}

Candidate Answer:
${userAnswer}

Evaluate the candidate's answer.

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "feedback": "Short feedback",
  "strength": "Main strength",
  "improvement": "Main area to improve"
}

Rules:
- score must be between 0 and 10.
- 0 means completely incorrect or irrelevant.
- 10 means an excellent technically correct answer.
- Evaluate technical correctness, completeness and clarity.
- Do not give high marks just because the answer is long.
- Keep feedback concise.
`;

    const response = await fetch(
      "http://localhost:5000/api/internhelp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "AI evaluation failed."
      );
    }

    let rawText =
      data.reply ||
      data.response ||
      data.message ||
      "";

    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let evaluation;

    try {
      evaluation = JSON.parse(rawText);
    } catch (parseError) {
      const startIndex = rawText.indexOf("{");
      const endIndex = rawText.lastIndexOf("}");

      if (startIndex !== -1 && endIndex !== -1) {
        evaluation = JSON.parse(
          rawText.substring(startIndex, endIndex + 1)
        );
      } else {
        throw new Error("Invalid AI evaluation format.");
      }
    }

    const numericScore = Math.max(
      0,
      Math.min(10, Number(evaluation.score) || 0)
    );

    return {
      score: numericScore,
      maxScore: 10,
      feedback:
        evaluation.feedback ||
        "No feedback available.",
      strength:
        evaluation.strength ||
        "Answer attempted.",
      improvement:
        evaluation.improvement ||
        "Continue improving your technical explanation.",
    };
  };

  const submitAnswer = async () => {
    if (!answer.trim() || evaluating) {
      return;
    }

    try {
      setEvaluating(true);
      setErrorMessage("");

      const question = questions[currentQuestion];

      const evaluation = await evaluateAnswerWithAI(
        question.question,
        answer.trim()
      );

      const newResult = {
        question: question.question,
        answer: answer.trim(),
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        feedback: evaluation.feedback,
        strength: evaluation.strength,
        improvement: evaluation.improvement,
      };

      const updatedResults = [
        ...results,
        newResult,
      ];

      setResults(updatedResults);
      setAnswer("");

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const totalScore = updatedResults.reduce(
          (total, item) =>
            total + Number(item.score || 0),
          0
        );

        const maximumScore =
          updatedResults.length * 10;

        const finalScore =
          maximumScore > 0
            ? Math.round(
                (totalScore / maximumScore) * 100
              )
            : 0;

        setScore(finalScore);

        await saveInterview(
          finalScore,
          updatedResults
        );
      }
    } catch (error) {
      console.error(
        "Technical Answer Evaluation Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to evaluate your answer."
      );
    } finally {
      setEvaluating(false);
    }
  };

  const saveInterview = async (
    finalScore,
    interviewResults
  ) => {
    try {
      setSaving(true);
      setSaveMessage("");

      await apiRequest("/interviews/result", {
        method: "POST",
        body: JSON.stringify({
          type: "technical",
          score: finalScore,
          totalQuestions: interviewResults.length,
          answeredQuestions: interviewResults.length,
          duration: startTime
            ? (Date.now() - startTime) / 60000
            : 0,
        }),
      });
      

      setSaveMessage(
        "Interview result saved successfully! ✅"
      );
    } catch (error) {
      console.error(
        "Technical Interview Save Error:",
        error
      );

      setSaveMessage(
        "Interview completed, but result could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const restartInterview = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswer("");
    setResults([]);
    setScore(null);
    setSaveMessage("");
    setErrorMessage("");
    setStartTime(null);
  };

  if (!started) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            Technical Interview
          </span>

          <h1>
            Practice Your{" "}
            <span>Technical Skills</span> 💻
          </h1>

          <p>
            Take an AI-powered technical interview and
            receive instant feedback on every answer.
          </p>
        </div>

        <div className="generator-card">
          <h2>Interview Setup</h2>

          <div className="form-grid">
            <div>
              <label>Technology</label>

              <select
                className="input-field"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
              >
                <option value="javascript">
                  JavaScript
                </option>

                <option value="react">
                  React
                </option>

                <option value="node">
                  Node.js
                </option>

                <option value="database">
                  Database
                </option>

                <option value="networking">
                  Computer Networking
                </option>
              </select>
            </div>

            <div>
              <label>Difficulty</label>

              <select
                className="input-field"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>
            </div>

            <div>
              <label>Questions</label>

              <select
                className="input-field"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(e.target.value)
                }
              >
                <option value="3">
                  3 Questions
                </option>

                <option value="5">
                  5 Questions
                </option>

                <option value="10">
                  10 Questions
                </option>
              </select>
            </div>
          </div>

          <div className="info-box">
            <strong>How it works</strong>

            <p>
              InternHelp will generate technical questions
              based on your selected technology and
              difficulty. Your answers will then be
              evaluated using AI.
            </p>
          </div>

          {errorMessage && (
            <div
              className="error-box"
              style={{ marginBottom: "15px" }}
            >
              {errorMessage}
            </div>
          )}

          <button
            className="primary-btn"
            onClick={startInterview}
            disabled={loading}
          >
            {loading
              ? "🤖 Generating Interview..."
              : "Start Technical Interview 🚀"}
          </button>
        </div>
      </div>
    );
  }

  if (score === null) {
    const current = questions[currentQuestion];

    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            Technical Interview
          </span>

          <h1>
            Question {currentQuestion + 1} of{" "}
            {questions.length}
          </h1>

          <p>
            Topic:{" "}
            {topics[topic]}
            {" • "}
            Difficulty:{" "}
            {difficulty.charAt(0).toUpperCase() +
              difficulty.slice(1)}
          </p>
        </div>

        <div className="interview-question-card">
          <div className="question-number">
            Question {currentQuestion + 1}
          </div>

          <h2>{current.question}</h2>

          <textarea
            className="answer-box"
            placeholder="Explain your answer clearly..."
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            rows="8"
            disabled={evaluating}
          />

          {errorMessage && (
            <div
              className="error-box"
              style={{ marginTop: "12px" }}
            >
              {errorMessage}
            </div>
          )}

          <div className="interview-actions">
            <span>
              {answer.length} characters
            </span>

            <button
              className="primary-btn"
              onClick={submitAnswer}
              disabled={
                !answer.trim() ||
                evaluating ||
                saving
              }
            >
              {evaluating
                ? "🤖 Evaluating..."
                : currentQuestion + 1 ===
                  questions.length
                ? "Finish Interview"
                : "Submit Answer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          Interview Completed
        </span>

        <h1>
          Technical Interview{" "}
          <span>Results</span> 🎯
        </h1>

        <p>
          Here is your AI-powered performance summary.
        </p>
      </div>

      <div className="score-card">
        <div className="score-circle">
          <strong>{score}</strong>
          <span>/100</span>
        </div>

        <h2>
          Your Technical Interview Score
        </h2>

        <p>
          {score >= 80
            ? "Excellent technical performance! Keep practicing advanced concepts."
            : score >= 60
            ? "Good attempt! Continue improving your technical knowledge."
            : "Keep practicing. Review the topics and try the interview again."}
        </p>
      </div>

      {saveMessage && (
        <div className="success-box">
          {saving
            ? "Saving interview result..."
            : saveMessage}
        </div>
      )}

      <div className="analysis-card">
        <h2>AI Question Review</h2>

        {results.map((result, index) => (
          <div
            className="answer-review"
            key={index}
          >
            <strong>
              {index + 1}. {result.question}
            </strong>

            <p>
              <strong>Your Answer:</strong>{" "}
              {result.answer}
            </p>

            <p>
              <strong>AI Feedback:</strong>{" "}
              {result.feedback}
            </p>

            <p>
              <strong>Strength:</strong>{" "}
              {result.strength}
            </p>

            <p>
              <strong>Improve:</strong>{" "}
              {result.improvement}
            </p>

            <span>
              Score: {result.score}/10
            </span>
          </div>
        ))}
      </div>

      <button
        className="primary-btn"
        onClick={restartInterview}
      >
        Start New Interview
      </button>
    </div>
  );
}
/* =========================
   HR INTERVIEW
========================= */

function HRInterview() {
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");

  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const questionBank = {
    easy: [
      {
        question: "Tell me about yourself.",
        keywords: ["education", "skills", "project", "goal"]
      },
      {
        question: "What are your strengths?",
        keywords: ["communication", "teamwork", "learning", "problem"]
      },
      {
        question: "Why do you want to join our company?",
        keywords: ["company", "career", "growth", "skills"]
      },
      {
        question: "What are your career goals?",
        keywords: ["career", "growth", "skills", "future"]
      },
      {
        question: "Why should we hire you?",
        keywords: ["skills", "experience", "value", "learn"]
      }
    ],

    medium: [
      {
        question: "Tell me about a challenging project you worked on.",
        keywords: ["challenge", "project", "solution", "result"]
      },
      {
        question: "What is your biggest weakness and how are you improving it?",
        keywords: ["weakness", "improve", "practice", "learning"]
      },
      {
        question: "How do you handle pressure or deadlines?",
        keywords: ["pressure", "priority", "planning", "deadline"]
      },
      {
        question: "Describe a situation where you worked as part of a team.",
        keywords: ["team", "communication", "responsibility", "result"]
      },
      {
        question: "Where do you see yourself in five years?",
        keywords: ["career", "growth", "skills", "experience"]
      }
    ],

    hard: [
      {
        question: "Describe a failure and explain what you learned from it.",
        keywords: ["failure", "mistake", "learn", "improve"]
      },
      {
        question: "How would you handle a disagreement with a teammate?",
        keywords: ["communication", "listen", "solution", "team"]
      },
      {
        question: "Tell me about a time you received negative feedback.",
        keywords: ["feedback", "listen", "improve", "action"]
      },
      {
        question: "How would you prioritize multiple urgent tasks?",
        keywords: ["priority", "deadline", "important", "planning"]
      },
      {
        question: "Why should we select you over other candidates?",
        keywords: ["skills", "value", "learning", "contribution"]
      }
    ]
  };

  const evaluateAnswer = (userAnswer, keywords) => {
    const text = userAnswer.toLowerCase();

    const matchedKeywords = keywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length >= 3) {
      return 10;
    }

    if (matchedKeywords.length === 2) {
      return 7;
    }

    if (matchedKeywords.length === 1) {
      return 4;
    }

    if (text.trim().length >= 40) {
      return 5;
    }

    return 0;
  };

  const startInterview = () => {
    setLoading(true);
    setSaveMessage("");
    setScore(null);
    setResults([]);
    setAnswer("");
    setCurrentQuestion(0);

    setTimeout(() => {
      const selectedQuestions = [
        ...questionBank[difficulty]
      ].sort(() => Math.random() - 0.5);

      const count = Number(questionCount);

      setQuestions(selectedQuestions.slice(0, count));
      setStarted(true);
      setLoading(false);
    }, 700);
  };

  const submitAnswer = () => {
    if (!answer.trim()) {
      return;
    }

    const question = questions[currentQuestion];

    const questionScore = evaluateAnswer(
      answer,
      question.keywords
    );

    const newResult = {
      question: question.question,
      answer: answer,
      score: questionScore,
      maxScore: 10
    };

    const updatedResults = [
      ...results,
      newResult
    ];

    setResults(updatedResults);
    setAnswer("");

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalScore = updatedResults.reduce(
        (total, item) => total + item.score,
        0
      );

      const maximumScore = questions.length * 10;

      const finalScore = Math.round(
        (totalScore / maximumScore) * 100
      );

      setScore(finalScore);

      saveInterview(finalScore, updatedResults);
    }
  };

  const saveInterview = async (
    finalScore,
    interviewResults
  ) => {
    try {
      setSaving(true);
      setSaveMessage("");

      await apiRequest("/interviews/result", {
        method: "POST",
        body: JSON.stringify({
          type: "hr",
          score: finalScore,
          totalQuestions: interviewResults.length,
          answeredQuestions: interviewResults.length,
          duration: interviewResults.length
        })
      });

      setSaveMessage(
        "HR interview result saved successfully! ✅"
      );
    } catch (error) {
      console.error(
        "HR Interview Save Error:",
        error
      );

      setSaveMessage(
        "Interview completed, but result could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  const restartInterview = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswer("");
    setResults([]);
    setScore(null);
    setSaveMessage("");
  };

  if (!started) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            HR Interview
          </span>

          <h1>
            Practice Your <span>HR Interview</span> 💼
          </h1>

          <p>
            Practice common HR questions and improve your
            communication and confidence.
          </p>
        </div>

        <div className="generator-card">
          <h2>Interview Setup</h2>

          <div className="form-grid">
            <div>
              <label>Difficulty</label>

              <select
                className="input-field"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>
            </div>

            <div>
              <label>Questions</label>

              <select
                className="input-field"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(e.target.value)
                }
              >
                <option value="3">
                  3 Questions
                </option>

                <option value="5">
                  5 Questions
                </option>
              </select>
            </div>
          </div>

          <div className="info-box">
            <strong>How it works</strong>

            <p>
              You will receive one HR question at a time.
              Type your answer and submit it. InterZen will
              evaluate your answer in Demo Mode and generate
              a final performance score.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={startInterview}
            disabled={loading}
          >
            {loading
              ? "Preparing Interview..."
              : "Start HR Interview 🚀"}
          </button>
        </div>
      </div>
    );
  }

  if (score === null) {
    const current = questions[currentQuestion];

    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            HR Interview
          </span>

          <h1>
            Question{" "}
            {currentQuestion + 1} of {questions.length}
          </h1>

          <p>
            Difficulty:{" "}
            {difficulty.charAt(0).toUpperCase() +
              difficulty.slice(1)}
          </p>
        </div>

        <div className="interview-question-card">
          <div className="question-number">
            Question {currentQuestion + 1}
          </div>

          <h2>{current.question}</h2>

          <textarea
            className="answer-box"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            rows="8"
          />

          <div className="interview-actions">
            <span>
              {answer.length} characters
            </span>

            <button
              className="primary-btn"
              onClick={submitAnswer}
              disabled={!answer.trim() || saving}
            >
              {currentQuestion + 1 === questions.length
                ? "Finish Interview"
                : "Submit Answer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          Interview Completed
        </span>

        <h1>
          HR Interview <span>Results</span> 🎯
        </h1>

        <p>
          Here is your HR interview performance summary.
        </p>
      </div>

      <div className="score-card">
        <div className="score-circle">
          <strong>{score}</strong>
          <span>/100</span>
        </div>

        <h2>Your HR Interview Score</h2>

        <p>
          {score >= 80
            ? "Excellent communication! Keep practicing."
            : score >= 60
            ? "Good attempt! Continue improving your answers."
            : "Keep practicing and work on structuring your answers."}
        </p>
      </div>

      {saveMessage && (
        <div className="success-box">
          {saveMessage}
        </div>
      )}

      <div className="analysis-card">
        <h2>Answer Review</h2>

        {results.map((result, index) => (
          <div
            className="answer-review"
            key={index}
          >
            <strong>
              {index + 1}. {result.question}
            </strong>

            <p>
              <strong>Your Answer:</strong>{" "}
              {result.answer}
            </p>

            <span>
              Score: {result.score}/10
            </span>
          </div>
        ))}
      </div>

      <button
        className="primary-btn"
        onClick={restartInterview}
      >
        Start New HR Interview
      </button>
    </div>
  );
}
/* =========================
   INTERVIEW PRACTICE
========================= */

function InterviewPractice() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🎤 Interview Practice</h1>
          <p>Select an interview type to begin.</p>
        </div>
      </div>

      <div className="practice-grid">
        <PracticeCard
          icon="💻"
          title="Technical Interview"
          text="Practice technical interview questions."
          link="/interview/technical"
        />

        <PracticeCard
          icon="👔"
          title="HR Interview"
          text="Practice common HR interview questions."
          link="/interview/hr"
        />

        <PracticeCard
          icon="💻"
          title="Coding Interview"
          text="Solve coding interview problems."
          link="/coding"
        />

        <PracticeCard
          icon="🎤"
          title="Voice Interview"
          text="Practice speaking with AI."
          link="/voice"
        />

        <PracticeCard
          icon="📹"
          title="Face Interview"
          text="Practice face-to-face interviews."
          link="/face"
        />

        <PracticeCard
          icon="👥"
          title="Group Discussion"
          text="Practice GD sessions."
          link="/group"
        />
      </div>
    </div>
  );
}

/* =========================
   PRACTICE CARD
========================= */

function PracticeCard({ icon, title, text, link }) {
  return (
    <Link to={link} className="practice-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span>Start →</span>
    </Link>
  );
}

/* =========================
   CODING INTERVIEW
========================= */


/* =========================
   CODING INTERVIEW
========================= */

function CodingInterview() {
  const [difficulty, setDifficulty] = useState("easy");
  const [problemCount, setProblemCount] = useState("3");

  const [started, setStarted] = useState(false);
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);

  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [output, setOutput] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [startTime, setStartTime] = useState(null);

  /*
  ============================================================
  DEMO CODING PROBLEM BANK
  ============================================================
  */

  const problemBank = {
    easy: [
      {
        title: "Sum of Two Numbers",
        description:
          "Write a function that returns the sum of two numbers.",
        starterCode: `function sum(a, b) {
  // Write your code here
}`,
        functionName: "sum",
        testCases: [
          { input: "5, 10", expected: "15" },
          { input: "-2, 7", expected: "5" },
          { input: "0, 8", expected: "8" },
        ],
      },

      {
        title: "Check Even Number",
        description:
          "Write a function that checks whether a number is even.",
        starterCode: `function isEven(n) {
  // Write your code here
}`,
        functionName: "isEven",
        testCases: [
          { input: "4", expected: "true" },
          { input: "7", expected: "false" },
          { input: "10", expected: "true" },
        ],
      },

      {
        title: "Find Maximum",
        description:
          "Write a function that returns the maximum of two numbers.",
        starterCode: `function findMax(a, b) {
  // Write your code here
}`,
        functionName: "findMax",
        testCases: [
          { input: "5, 10", expected: "10" },
          { input: "20, 8", expected: "20" },
          { input: "-2, -5", expected: "-2" },
        ],
      },

      {
        title: "Count Characters",
        description:
          "Write a function that returns the number of characters in a string.",
        starterCode: `function countCharacters(str) {
  // Write your code here
}`,
        functionName: "countCharacters",
        testCases: [
          { input: '"hello"', expected: "5" },
          { input: '"InterZen"', expected: "8" },
          { input: '""', expected: "0" },
        ],
      },

      {
        title: "Find Minimum",
        description:
          "Write a function that returns the smaller of two numbers.",
        starterCode: `function findMin(a, b) {
  // Write your code here
}`,
        functionName: "findMin",
        testCases: [
          { input: "5, 10", expected: "5" },
          { input: "20, 8", expected: "8" },
          { input: "-2, -5", expected: "-5" },
        ],
      },
    ],

    medium: [
      {
        title: "Reverse a String",
        description:
          "Write a function that takes a string and returns the string in reverse order.",
        starterCode: `function reverseString(str) {
  // Write your code here
}`,
        functionName: "reverseString",
        testCases: [
          { input: '"hello"', expected: "olleh" },
          { input: '"InterZen"', expected: "nezretnI" },
          { input: '"coding"', expected: "gnidoc" },
        ],
      },

      {
        title: "Find Largest Array Element",
        description:
          "Write a function that finds the largest number in an array.",
        starterCode: `function findLargest(arr) {
  // Write your code here
}`,
        functionName: "findLargest",
        testCases: [
          { input: "[2, 8, 4]", expected: "8" },
          { input: "[10, 3, 7]", expected: "10" },
          { input: "[-5, -2, -10]", expected: "-2" },
        ],
      },

      {
        title: "Count Vowels",
        description:
          "Write a function that counts the number of vowels in a string.",
        starterCode: `function countVowels(str) {
  // Write your code here
}`,
        functionName: "countVowels",
        testCases: [
          { input: '"hello"', expected: "2" },
          { input: '"javascript"', expected: "3" },
          { input: '"InterZen"', expected: "3" },
        ],
      },

      {
        title: "Sum Array",
        description:
          "Write a function that returns the sum of all numbers in an array.",
        starterCode: `function sumArray(arr) {
  // Write your code here
}`,
        functionName: "sumArray",
        testCases: [
          { input: "[1, 2, 3]", expected: "6" },
          { input: "[10, 20, 30]", expected: "60" },
          { input: "[-5, 5, 10]", expected: "10" },
        ],
      },

      {
        title: "Count Positive Numbers",
        description:
          "Write a function that counts how many positive numbers exist in an array.",
        starterCode: `function countPositive(arr) {
  // Write your code here
}`,
        functionName: "countPositive",
        testCases: [
          { input: "[1, -2, 3, -4]", expected: "2" },
          { input: "[5, 6, 7]", expected: "3" },
          { input: "[-1, -2, -3]", expected: "0" },
        ],
      },
    ],

    hard: [
      {
        title: "Remove Duplicates",
        description:
          "Write a function that removes duplicate values from an array.",
        starterCode: `function removeDuplicates(arr) {
  // Write your code here
}`,
        functionName: "removeDuplicates",
        testCases: [
          {
            input: "[1, 2, 2, 3]",
            expected: "[1,2,3]",
          },
          {
            input: "[4, 4, 5, 6, 6]",
            expected: "[4,5,6]",
          },
          {
            input: "[1, 1, 1, 2, 2]",
            expected: "[1,2]",
          },
        ],
      },

      {
        title: "Two Sum",
        description:
          "Given an array and a target, return the indices of two numbers whose sum equals the target.",
        starterCode: `function twoSum(nums, target) {
  // Write your code here
}`,
        functionName: "twoSum",
        testCases: [
          {
            input: "[2,7,11,15], 9",
            expected: "[0,1]",
          },
          {
            input: "[3,2,4], 6",
            expected: "[1,2]",
          },
          {
            input: "[3,3], 6",
            expected: "[0,1]",
          },
        ],
      },

      {
        title: "Palindrome Check",
        description:
          "Write a function that determines whether a string is a palindrome.",
        starterCode: `function isPalindrome(str) {
  // Write your code here
}`,
        functionName: "isPalindrome",
        testCases: [
          {
            input: '"madam"',
            expected: "true",
          },
          {
            input: '"hello"',
            expected: "false",
          },
          {
            input: '"racecar"',
            expected: "true",
          },
        ],
      },

      {
        title: "Find Missing Number",
        description:
          "Given an array containing numbers from 1 to n with one number missing, return the missing number.",
        starterCode: `function findMissingNumber(arr) {
  // Write your code here
}`,
        functionName: "findMissingNumber",
        testCases: [
          {
            input: "[1,2,3,5]",
            expected: "4",
          },
          {
            input: "[1,2,4,5]",
            expected: "3",
          },
          {
            input: "[1,3,4,5]",
            expected: "2",
          },
        ],
      },

      {
        title: "Second Largest Number",
        description:
          "Write a function that returns the second largest number in an array.",
        starterCode: `function secondLargest(arr) {
  // Write your code here
}`,
        functionName: "secondLargest",
        testCases: [
          {
            input: "[10, 5, 8, 20]",
            expected: "10",
          },
          {
            input: "[3, 7, 2, 9]",
            expected: "7",
          },
          {
            input: "[15, 20, 10, 5]",
            expected: "15",
          },
        ],
      },
    ],
  };

  /*
  ============================================================
  SELECT RANDOM PROBLEMS
  ============================================================
  */

  const generateCodingProblems = () => {
    const availableProblems = [...problemBank[difficulty]];

    const shuffled = availableProblems.sort(
      () => Math.random() - 0.5
    );

    return shuffled.slice(0, Number(problemCount));
  };

  /*
  ============================================================
  START CODING INTERVIEW
  ============================================================
  */

  const startCoding = () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSaveMessage("");
      setOutput("");
      setResults([]);
      setScore(null);
      setCurrentProblem(0);
      setCode("");
      setTimeLeft(15 * 60);
      setStarted(false);

      const generatedProblems =
        generateCodingProblems();

      if (!generatedProblems.length) {
        throw new Error(
          "Unable to generate coding problems."
        );
      }

      setProblems(generatedProblems);

      setCode(
        generatedProblems[0].starterCode || ""
      );

      setStartTime(Date.now());

      setStarted(true);
    } catch (error) {
      console.error(
        "Coding Generation Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to start coding interview."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  TIMER
  ============================================================
  */

  React.useEffect(() => {
    if (!started || score !== null) {
      return;
    }

    if (timeLeft <= 0) {
      setOutput(
        "⏰ Time is up! Please submit your current solution."
      );

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [started, score, timeLeft]);

  /*
  ============================================================
  PARSE TEST ARGUMENTS
  ============================================================
  */

  const parseTestArguments = (input) => {
    if (typeof input !== "string") {
      return [input];
    }

    const values = input
      .split(/,(?![^\[]*\])/)
      .map((value) => value.trim());

    return values.map((value) => {
      if (
        value.startsWith("[") &&
        value.endsWith("]")
      ) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      if (
        (value.startsWith('"') &&
          value.endsWith('"')) ||
        (value.startsWith("'") &&
          value.endsWith("'"))
      ) {
        return value.slice(1, -1);
      }

      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      if (value === "null") {
        return null;
      }

      if (value !== "" && !isNaN(value)) {
        return Number(value);
      }

      return value;
    });
  };

  /*
  ============================================================
  NORMALIZE OUTPUT
  ============================================================
  */

  const normalizeOutput = (value) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value)
        .replace(/\s/g, "")
        .toLowerCase();
    }

    if (
      value !== null &&
      typeof value === "object"
    ) {
      return JSON.stringify(value)
        .replace(/\s/g, "")
        .toLowerCase();
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  /*
  ============================================================
  EXECUTE CODE
  ============================================================
  */

  const executeCode = () => {
    if (!code.trim()) {
      throw new Error(
        "Please write your code first."
      );
    }

    const problem =
      problems[currentProblem];

    if (!problem) {
      throw new Error(
        "No coding problem selected."
      );
    }

    const functionName =
      problem.functionName;

    if (!functionName) {
      throw new Error(
        "Required function name is missing."
      );
    }

    let userFunction;

    try {
      userFunction = new Function(`
        ${code}

        if (typeof ${functionName} !== "function") {
          throw new Error(
            "Required function ${functionName} was not found."
          );
        }

        return ${functionName};
      `)();
    } catch (error) {
      throw new Error(
        `Code Error: ${error.message}`
      );
    }

    const testResults = [];

    problem.testCases.forEach(
      (testCase, index) => {
        try {
          const args =
            parseTestArguments(
              testCase.input
            );

          const actual =
            userFunction(...args);

          const passed =
            normalizeOutput(actual) ===
            normalizeOutput(
              testCase.expected
            );

          testResults.push({
            index: index + 1,
            passed,
            input: testCase.input,
            expected: testCase.expected,
            actual,
          });
        } catch (error) {
          testResults.push({
            index: index + 1,
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual:
              `Error: ${error.message}`,
          });
        }
      }
    );

    return testResults;
  };

  /*
  ============================================================
  RUN CODE
  ============================================================
  */

  const runCode = () => {
    try {
      setRunning(true);
      setOutput("");

      const testResults =
        executeCode();

      const passedCount =
        testResults.filter(
          (test) => test.passed
        ).length;

      let resultText =
        "🧪 Test Results\n\n";

      testResults.forEach(
        (test) => {
          resultText +=
            `${test.passed ? "✅" : "❌"} Test Case ${test.index}\n` +
            `Input: ${test.input}\n` +
            `Expected: ${test.expected}\n` +
            `Actual: ${test.actual}\n\n`;
        }
      );

      resultText +=
        `📊 Passed: ${passedCount}/${testResults.length}`;

      setOutput(resultText);
    } catch (error) {
      setOutput(
        `❌ Code Error\n\n${error.message}`
      );
    } finally {
      setRunning(false);
    }
  };

  /*
  ============================================================
  DEMO AI EVALUATION
  ============================================================
  */

  const evaluateCodingAnswer = (
    problem,
    candidateCode,
    testResults
  ) => {
    const passedCount =
      testResults.filter(
        (test) => test.passed
      ).length;

    const totalTests =
      testResults.length;

    let score = 0;

    if (totalTests > 0) {
      score = Math.round(
        (passedCount / totalTests) * 10
      );
    }

    let feedback =
      "Keep practicing your coding logic.";

    let strength =
      "You attempted the coding problem.";

    let improvement =
      "Review the failing test cases and improve the algorithm.";

    let complexity =
      "Complexity depends on the implemented solution.";

    if (
      passedCount === totalTests
    ) {
      feedback =
        "All test cases passed successfully. The solution produces the expected results.";

      strength =
        "Strong functional correctness and good understanding of the problem.";

      improvement =
        "Continue improving code readability and consider optimizing time and space complexity.";

      complexity =
        "Review the number of iterations and data structures used to determine the exact complexity.";
    } else if (
      passedCount > 0
    ) {
      feedback =
        "The solution passed some test cases but failed others. Review edge cases and input handling.";

      strength =
        "The basic problem-solving approach is partially correct.";

      improvement =
        "Focus on the failing test cases and verify the logic for different inputs.";

      complexity =
        "Analyze the loops and operations in the solution to improve efficiency.";
    } else {
      feedback =
        "The solution did not pass the provided test cases.";

      strength =
        "You made an attempt and submitted a complete solution.";

      improvement =
        "Review the problem requirements and work through the test cases step by step.";

      complexity =
        "Focus on correctness first, then analyze time and space complexity.";
    }

    return {
      score,
      feedback,
      strength,
      improvement,
      complexity,
    };
  };

  /*
  ============================================================
  SUBMIT CURRENT PROBLEM
  ============================================================
  */

  const submitProblem = async () => {
    if (!code.trim()) {
      setOutput(
        "❌ Please write your solution before submitting."
      );
      return;
    }

    const problem =
      problems[currentProblem];

    if (!problem) {
      setOutput(
        "❌ No coding problem selected."
      );
      return;
    }

    try {
      setEvaluating(true);

      setOutput(
        "🤖 Running tests and evaluating your solution..."
      );

      const testResults =
        executeCode();

      const passedCount =
        testResults.filter(
          (test) => test.passed
        ).length;

      const totalTests =
        testResults.length;

      const evaluation =
        evaluateCodingAnswer(
          problem,
          code,
          testResults
        );

      const problemResult = {
        question: problem.title,
        description:
          problem.description,
        difficulty,
        code,
        passed:
          passedCount === totalTests,
        score: evaluation.score,
        passedTests: passedCount,
        totalTests,
        feedback:
          evaluation.feedback,
        strength:
          evaluation.strength,
        improvement:
          evaluation.improvement,
        complexity:
          evaluation.complexity,
      };

      const updatedResults = [
        ...results,
        problemResult,
      ];

      setResults(updatedResults);

      setOutput(
        `🧪 Tests Passed: ${passedCount}/${totalTests}\n\n` +
        `🤖 Score: ${evaluation.score}/10\n\n` +
        `💬 ${evaluation.feedback}\n\n` +
        `💪 Strength: ${evaluation.strength}\n\n` +
        `📈 Improve: ${evaluation.improvement}\n\n` +
        `⚙️ Complexity: ${evaluation.complexity}`
      );

      if (
        currentProblem <
        problems.length - 1
      ) {
        const nextIndex =
          currentProblem + 1;

        const nextProblem =
          problems[nextIndex];

        setCurrentProblem(
          nextIndex
        );

        setCode(
          nextProblem.starterCode || ""
        );
      } else {
        const finalScore =
          Math.round(
            updatedResults.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.score || 0
                ),
              0
            ) /
              updatedResults.length
          );

        setScore(finalScore);

        await saveCodingResult(
          finalScore,
          updatedResults
        );
      }
    } catch (error) {
      console.error(
        "Coding Evaluation Error:",
        error
      );

      setOutput(
        `❌ Evaluation Error\n\n${error.message}`
      );
    } finally {
      setEvaluating(false);
    }
  };

  /*
  ============================================================
  SAVE RESULT
  ============================================================
  */

  const saveCodingResult = async (
    finalScore,
    codingResults
  ) => {
    try {
      setSaving(true);

      await apiRequest(
        "/interviews/result",
        {
          method: "POST",

          body: JSON.stringify({
            type: "coding",
            score: finalScore,
            totalQuestions:
              codingResults.length,
            answeredQuestions:
              codingResults.length,
            duration: startTime
              ? Math.round(
                  (Date.now() -
                    startTime) /
                    60000
                )
              : 0,
          }),
        }
      );

      setSaveMessage(
        "Coding interview result saved successfully! ✅"
      );
    } catch (error) {
      console.error(
        "Coding Save Error:",
        error
      );

      setSaveMessage(
        "Coding interview completed, but the result could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  RESTART
  ============================================================
  */

  const restartCoding = () => {
    setStarted(false);
    setProblems([]);
    setCurrentProblem(0);
    setCode("");
    setResults([]);
    setScore(null);
    setOutput("");
    setSaveMessage("");
    setErrorMessage("");
    setTimeLeft(15 * 60);
    setStartTime(null);
  };

  /*
  ============================================================
  SETUP SCREEN
  ============================================================
  */

  if (!started) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            Coding Interview
          </span>

          <h1>
            Test Your{" "}
            <span>Coding Skills</span>{" "}
            👨‍💻
          </h1>

          <p>
            Solve coding problems, run test
            cases and receive technical
            feedback.
          </p>
        </div>

        <div className="generator-card">
          <h2>
            Coding Interview Setup
          </h2>

          <div className="form-grid">
            <div>
              <label>
                Difficulty
              </label>

              <select
                className="input-field"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
              >
                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>
              </select>
            </div>

            <div>
              <label>
                Problems
              </label>

              <select
                className="input-field"
                value={problemCount}
                onChange={(e) =>
                  setProblemCount(
                    e.target.value
                  )
                }
              >
                <option value="3">
                  3 Problems
                </option>

                <option value="5">
                  5 Problems
                </option>
              </select>
            </div>
          </div>

          <div className="info-box">
            <strong>
              💻 Demo Coding Environment
            </strong>

            <p>
              Coding Interview currently
              works in Demo Mode. Problems
              are generated from the
              InterZen coding problem bank.
              Your JavaScript code is tested
              locally and scored automatically.
            </p>
          </div>

          {errorMessage && (
            <div className="error-box">
              {errorMessage}
            </div>
          )}

          <button
            className="primary-btn"
            onClick={startCoding}
            disabled={loading}
          >
            {loading
              ? "Preparing Coding Interview..."
              : "Start Coding Interview 🚀"}
          </button>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  INTERVIEW SCREEN
  ============================================================
  */

  if (score === null) {
    const problem =
      problems[currentProblem];

    if (!problem) {
      return (
        <div className="page-container">
          <div className="error-box">
            No coding problem is available.
          </div>

          <button
            className="primary-btn"
            onClick={restartCoding}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            Coding Interview
          </span>

          <h1>
            Problem{" "}
            {currentProblem + 1} of{" "}
            {problems.length}
          </h1>

          <div className="info-box">
            <strong>
              ⏱️ Time Remaining
            </strong>

            <p>
              {Math.floor(
                timeLeft / 60
              )}
              :
              {String(
                timeLeft % 60
              ).padStart(2, "0")}
            </p>
          </div>

          <p>
            Difficulty:{" "}
            {difficulty
              .charAt(0)
              .toUpperCase() +
              difficulty.slice(1)}
          </p>
        </div>

        <div className="coding-layout">
          <div className="coding-problem-card">
            <span className="question-number">
              Problem{" "}
              {currentProblem + 1}
            </span>

            <h2>
              {problem.title}
            </h2>

            <p>
              {problem.description}
            </p>

            <h3>
              Test Cases
            </h3>

            <ul>
              {problem.testCases?.map(
                (testCase, index) => (
                  <li key={index}>
                    Input:{" "}
                    {testCase.input}
                    {" → "}
                    Expected Output:{" "}
                    {testCase.expected}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="code-editor-card">
            <h2>
              JavaScript Code Editor
            </h2>

            <textarea
              className="code-editor"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                )
              }
              spellCheck="false"
              disabled={
                evaluating ||
                saving
              }
            />

            <div className="code-actions">
              <button
                className="secondary-btn"
                onClick={runCode}
                disabled={
                  running ||
                  evaluating
                }
              >
                {running
                  ? "Running..."
                  : "▶ Run Code"}
              </button>

              <button
                className="primary-btn"
                onClick={
                  submitProblem
                }
                disabled={
                  running ||
                  evaluating ||
                  saving
                }
              >
                {evaluating
                  ? "🤖 Evaluating..."
                  : currentProblem + 1 ===
                    problems.length
                  ? "Submit Final Problem"
                  : "Submit Problem"}
              </button>
            </div>

            {output && (
              <div className="code-output">
                <h3>
                  Output
                </h3>

                <pre>
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  RESULTS
  ============================================================
  */

  const totalTests =
    results.reduce(
      (total, item) =>
        total +
        (item.totalTests || 0),
      0
    );

  const passedTests =
    results.reduce(
      (total, item) =>
        total +
        (item.passedTests || 0),
      0
    );

  const passedQuestions =
    results.filter(
      (item) => item.passed
    ).length;

  const accuracy =
    totalTests > 0
      ? Math.round(
          (passedTests /
            totalTests) *
            100
        )
      : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          Coding Completed
        </span>

        <h1>
          Coding Interview{" "}
          <span>Results</span>{" "}
          🎯
        </h1>

        <p>
          Review your coding
          performance.
        </p>
      </div>

      <div className="score-card">
        <div className="score-circle">
          <strong>
            {score}
          </strong>

          <span>
            /10
          </span>
        </div>

        <h2>
          Your Coding Score
        </h2>

        <p>
          {score >= 8
            ? "Excellent coding performance! 🚀"
            : score >= 6
            ? "Good attempt! Keep practicing."
            : "Keep practicing coding problems and improve your logic."}
        </p>
      </div>

      {saveMessage && (
        <div className="success-box">
          {saving
            ? "Saving coding result..."
            : saveMessage}
        </div>
      )}

      <div className="info-grid">
        <div className="info-box">
          <strong>
            📝 Problems Attempted
          </strong>

          <p>
            {results.length}
          </p>
        </div>

        <div className="info-box">
          <strong>
            ✅ Problems Passed
          </strong>

          <p>
            {passedQuestions}/
            {results.length}
          </p>
        </div>

        <div className="info-box">
          <strong>
            🧪 Tests Passed
          </strong>

          <p>
            {passedTests}/
            {totalTests}
          </p>
        </div>

        <div className="info-box">
          <strong>
            🎯 Accuracy
          </strong>

          <p>
            {accuracy}%
          </p>
        </div>
      </div>

      <div className="analysis-card">
        <h2>
          📊 Question-wise Performance
        </h2>

        {results.map(
          (result, index) => (
            <div
              className="answer-review"
              key={index}
            >
              <strong>
                {index + 1}.{" "}
                {result.question}
              </strong>

              <p>
                Result:{" "}
                {result.passed
                  ? "Passed ✅"
                  : "Needs Improvement ❌"}
              </p>

              <p>
                Difficulty:{" "}
                {result.difficulty}
              </p>

              <p>
                Tests Passed:{" "}
                {result.passedTests ||
                  0}
                /
                {result.totalTests ||
                  0}
              </p>

              <p>
                <strong>
                  Feedback:
                </strong>{" "}
                {result.feedback}
              </p>

              <p>
                <strong>
                  Strength:
                </strong>{" "}
                {result.strength}
              </p>

              <p>
                <strong>
                  Improvement:
                </strong>{" "}
                {result.improvement}
              </p>

              <p>
                <strong>
                  Complexity:
                </strong>{" "}
                {result.complexity}
              </p>

              <span>
                Score:{" "}
                {result.score}/10
              </span>
            </div>
          )
        )}
      </div>

      <button
        className="primary-btn"
        onClick={
          restartCoding
        }
      >
        🔄 Start New Coding Interview
      </button>
    </div>
  );
}



/* =========================
   INTERNHELP
========================= */

function InternHelp() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! I'm InternHelp 🤖 Your InterZen AI assistant. I can help you with interviews, coding, resumes, career guidance and study questions."
    }
  ]);

  const [loading, setLoading] = useState(false);

  const getResponse = (userMessage) => {
    const text = userMessage.toLowerCase();

    if (
      text.includes("resume") ||
      text.includes("cv")
    ) {
      return (
        "For a strong resume, focus on a clear professional summary, " +
        "technical skills, projects, internships and measurable achievements. " +
        "You can also use the Resume Analyzer in InterZen."
      );
    }

    if (
      text.includes("interview") ||
      text.includes("technical")
    ) {
      return (
        "For technical interviews, revise data structures, algorithms, " +
        "DBMS, operating systems, networking and your project. " +
        "Practice explaining your answers clearly instead of only memorizing them."
      );
    }

    if (
      text.includes("hr") ||
      text.includes("tell me about yourself")
    ) {
      return (
        "For HR interviews, keep your answers structured and concise. " +
        "Prepare your introduction, strengths, weaknesses, career goals, " +
        "project explanation and common behavioral questions."
      );
    }

    if (
      text.includes("coding") ||
      text.includes("programming") ||
      text.includes("code")
    ) {
      return (
        "For coding preparation, practice arrays, strings, searching, " +
        "sorting, recursion, linked lists and basic dynamic programming. " +
        "First understand the problem, then explain your approach and complexity."
      );
    }

    if (
      text.includes("career") ||
      text.includes("job") ||
      text.includes("placement")
    ) {
      return (
        "For placement preparation, build strong fundamentals, maintain a " +
        "good resume, practice coding and interviews, and work on projects " +
        "that demonstrate practical skills."
      );
    }

    if (
      text.includes("react") ||
      text.includes("javascript")
    ) {
      return (
        "For React and JavaScript preparation, focus on components, props, " +
        "state, hooks, events, arrays, functions, promises, async operations " +
        "and API integration."
      );
    }

    if (
      text.includes("mongodb") ||
      text.includes("database") ||
      text.includes("dbms")
    ) {
      return (
        "For DBMS preparation, study SQL, keys, normalization, joins, " +
        "transactions, indexing and database relationships. MongoDB is a " +
        "NoSQL document database."
      );
    }

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {
      return (
        "Hello! 👋 I'm InternHelp. Ask me anything about interview " +
        "preparation, coding, resumes, projects or careers."
      );
    }

    if (
      text.includes("thank")
    ) {
      return (
        "You're welcome! 😊 Keep practicing and use InterZen regularly " +
        "to improve your interview readiness."
      );
    }

    return (
      "That's a good question! 🤖 In Demo Mode, I can currently help with " +
      "interviews, HR preparation, coding, resumes, databases, React, " +
      "JavaScript and career preparation. Try asking me about one of these topics."
    );
  };

  const sendMessage = () => {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    apiRequest("/internhelp", {
      method: "POST",
      body: JSON.stringify({
        message: userMessage
      })
    })
    .then((data) => {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: data.reply
        }
      ]);
    })
    .catch((error) => {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            "❌ InternHelp could not process your message."
        }
      ]);

      console.error(
        "InternHelp Error:",
        error
      );
    })
    .finally(() => {
      setLoading(false);
    });
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text:
          "Chat cleared! 👋 I'm InternHelp. How can I help you today?"
      }
    ]);
  };

  const quickQuestion = (question) => {
    setMessage(question);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          InternHelp AI Assistant
        </span>

        <h1>
          Meet <span>InternHelp</span> 🤖
        </h1>

        <p>
          Your personal AI assistant for interview preparation,
          coding, resumes and career guidance.
        </p>
      </div>

      <div className="chat-layout">
        <div className="chat-card">
          <div className="chat-header">
            <div>
              <h2>
                🤖 InternHelp
              </h2>

              <span className="online-status">
                ● Online
              </span>
            </div>

            <button
              className="secondary-btn"
              onClick={clearChat}
            >
              Clear Chat
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={
                  item.sender === "user"
                    ? "chat-message user-message"
                    : "chat-message bot-message"
                }
              >
                <div className="chat-avatar">
                  {item.sender === "user"
                    ? "👤"
                    : "🤖"}
                </div>

                <div className="chat-bubble">
                  <ReactMarkdown>
                    {item.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message">
                <div className="chat-avatar">
                  🤖
                </div>

                <div className="chat-bubble typing">
                  InternHelp is typing...
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask InternHelp anything..."
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              rows="2"
            />

            <button
              className="primary-btn"
              onClick={sendMessage}
              disabled={
                !message.trim() || loading
              }
            >
              Send 🚀
            </button>
          </div>
        </div>

        <div className="chat-sidebar">
          <div className="quick-question-card">
            <h3>
              Quick Questions
            </h3>

            <button
              onClick={() =>
                quickQuestion(
                  "How can I prepare for a technical interview?"
                )
              }
            >
              💻 Technical Interview
            </button>

            <button
              onClick={() =>
                quickQuestion(
                  "How can I improve my resume?"
                )
              }
            >
              📄 Resume Tips
            </button>

            <button
              onClick={() =>
                quickQuestion(
                  "How should I prepare for an HR interview?"
                )
              }
            >
              💼 HR Interview
            </button>

            <button
              onClick={() =>
                quickQuestion(
                  "How can I improve my coding skills?"
                )
              }
            >
              👨‍💻 Coding Practice
            </button>

            <button
              onClick={() =>
                quickQuestion(
                  "What should I do for placement preparation?"
                )
              }
            >
              🎯 Placement Preparation
            </button>

            <button
              onClick={() =>
                quickQuestion(
                  "How should I learn React and JavaScript?"
                )
              }
            >
              ⚛️ React & JavaScript
            </button>
          </div>

          <div className="info-box">
            <strong>Demo Mode 🤖</strong>

            <p>
              InternHelp is currently running with built-in
              AI-style responses. A real AI API can be connected
              later without changing the chat interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
/* =========================
   VOICE ASSISTANT
========================= */

function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(
    "Hi! I'm InternHelp. Click the microphone and ask me something."
  );
  const [speaking, setSpeaking] = useState(false);

  const recognitionSupported =
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window;

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeaking(true);
    };

    speech.onend = () => {
      setSpeaking(false);
    };

    speech.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };

  const getAssistantResponse = (text) => {
    const question = text.toLowerCase();

    if (
      question.includes("resume") ||
      question.includes("cv")
    ) {
      return (
        "To improve your resume, add your technical skills, " +
        "projects, internships, certifications and measurable achievements. " +
        "Keep it clear and preferably one page for fresher applications."
      );
    }

    if (
      question.includes("technical interview") ||
      question.includes("technical")
    ) {
      return (
        "For technical interviews, prepare programming, data structures, " +
        "DBMS, operating systems, computer networks and your projects. " +
        "Practice explaining your approach clearly."
      );
    }

    if (
      question.includes("hr") ||
      question.includes("human resource")
    ) {
      return (
        "For an HR interview, prepare your self introduction, strengths, " +
        "weaknesses, career goals, project explanation and common behavioral questions."
      );
    }

    if (
      question.includes("coding") ||
      question.includes("programming") ||
      question.includes("code")
    ) {
      return (
        "For coding preparation, practice arrays, strings, sorting, searching, " +
        "linked lists, recursion and basic dynamic programming. " +
        "Focus on understanding the problem before writing code."
      );
    }

    if (
      question.includes("career") ||
      question.includes("job") ||
      question.includes("placement")
    ) {
      return (
        "For placement preparation, improve your programming fundamentals, " +
        "build practical projects, maintain a good resume and practice technical " +
        "and HR interviews regularly."
      );
    }

    if (
      question.includes("react") ||
      question.includes("javascript")
    ) {
      return (
        "For React and JavaScript, learn components, props, state, hooks, " +
        "events, arrays, functions, promises, async operations and API integration."
      );
    }

    if (
      question.includes("hello") ||
      question.includes("hi") ||
      question.includes("hey")
    ) {
      return (
        "Hello! I'm InternHelp. How can I help you with your interview preparation?"
      );
    }

    return (
      "I understood your question. In Demo Mode, I can currently help with " +
      "resumes, technical interviews, HR interviews, coding, React, JavaScript " +
      "and placement preparation."
    );
  };

  const startListening = () => {
    if (!recognitionSupported) {
      setResponse(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("Listening...");
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setTranscript(spokenText);

      const assistantResponse =
        getAssistantResponse(spokenText);

      setResponse(assistantResponse);

      speak(assistantResponse);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setResponse(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      } else {
        setResponse(
          "Sorry, I could not understand that. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const askExample = (question) => {
    setTranscript(question);

    const assistantResponse =
      getAssistantResponse(question);

    setResponse(assistantResponse);

    speak(assistantResponse);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          Voice Assistant
        </span>

        <h1>
          Talk to <span>InternHelp</span> 🎙️
        </h1>

        <p>
          Ask your interview and career questions using your voice.
        </p>
      </div>

      <div className="voice-assistant-card">
        <div className="voice-icon">
          {listening ? "🎙️" : "🤖"}
        </div>

        <h2>
          {listening
            ? "Listening..."
            : speaking
            ? "InternHelp is speaking..."
            : "InternHelp is ready"}
        </h2>

        <p className="voice-status">
          {listening
            ? "Speak your question clearly."
            : "Click the microphone to start a voice conversation."}
        </p>

        <button
          className={
            listening
              ? "voice-btn listening-btn"
              : "voice-btn"
          }
          onClick={startListening}
          disabled={listening}
        >
          {listening
            ? "🎙️ Listening..."
            : "🎤 Start Speaking"}
        </button>

        {speaking && (
          <button
            className="secondary-btn"
            onClick={stopSpeaking}
          >
            🔇 Stop Speaking
          </button>
        )}

        <div className="voice-section">
          <h3>
            You said
          </h3>

          <div className="voice-text-box">
            {transcript || "Your spoken question will appear here."}
          </div>
        </div>

        <div className="voice-section">
          <h3>
            🤖 InternHelp
          </h3>

          <div className="assistant-response-box">
            {response}
          </div>
        </div>
      </div>

      <div className="voice-examples">
        <h2>
          Try Asking
        </h2>

        <div className="example-grid">
          <button
            onClick={() =>
              askExample(
                "How can I prepare for a technical interview?"
              )
            }
          >
            💻 Technical Interview
          </button>

          <button
            onClick={() =>
              askExample(
                "How can I improve my resume?"
              )
            }
          >
            📄 Resume Tips
          </button>

          <button
            onClick={() =>
              askExample(
                "How should I prepare for HR interviews?"
              )
            }
          >
            💼 HR Preparation
          </button>

          <button
            onClick={() =>
              askExample(
                "How can I improve my coding skills?"
              )
            }
          >
            👨‍💻 Coding Practice
          </button>

          <button
            onClick={() =>
              askExample(
                "What should I do for placement preparation?"
              )
            }
          >
            🎯 Placement
          </button>

          <button
            onClick={() =>
              askExample(
                "How should I learn React and JavaScript?"
              )
            }
          >
            ⚛️ React & JavaScript
          </button>
        </div>
      </div>

      <div className="info-box">
        <strong>Demo Voice Assistant 🎙️</strong>

        <p>
          This version uses your browser's built-in speech
          recognition and text-to-speech. No AI API key is required.
        </p>
      </div>
    </div>
  );
}
/* =========================
   FACE INTERVIEW
========================= */


function FaceInterview() {
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const emotionIntervalRef = React.useRef(null);
  // Recording refs
  const mediaRecorderRef = React.useRef(null);
  const recordedChunksRef = React.useRef([]);
  const recordingStartTimeRef = React.useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

// Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);

  const [emotionModelsLoaded, setEmotionModelsLoaded] = useState(false);

  const [currentEmotion, setCurrentEmotion] =
    useState("neutral");

  const [emotionConfidence, setEmotionConfidence] =
    useState(0);

  const [emotionCounts, setEmotionCounts] =
    useState({
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      neutral: 0,
    });

  const [emotionSamples, setEmotionSamples] =
    useState(0);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [time, setTime] = useState(0);
  const [faceDetected, setFaceDetected] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const [voiceEnabled, setVoiceEnabled] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  

  const [recordingSaved, setRecordingSaved] =
    useState(false);

  const questions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths and weaknesses?",
    "Tell me about one of your academic projects.",
    "Where do you see yourself in five years.",
  ];

  // =========================================================
  // LOAD FACE-API MODELS
  // =========================================================

  React.useEffect(() => {
    const loadEmotionModels = async () => {
      try {
        console.log(
          "Loading emotion detection models..."
        );

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models"
        );

        await faceapi.nets.faceExpressionNet.loadFromUri(
          "/models"
        );

        setEmotionModelsLoaded(true);

        console.log(
          "Face emotion models loaded successfully."
        );
      } catch (error) {
        console.error(
          "Emotion model loading error:",
          error
        );

        setEmotionModelsLoaded(false);

        setMessage(
          "Emotion detection models could not be loaded. Camera interview will still work."
        );
      }
    };

    loadEmotionModels();
  }, []);

  // =========================================================
  // VOICE ANSWER
  // =========================================================

  const startVoiceAnswer = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);

      setMessage(
        "🎤 Listening... Please speak your answer."
      );
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setAnswer((previous) =>
        previous
          ? previous + " " + spokenText
          : spokenText
      );

      setMessage(
        "✅ Voice answer converted to text."
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech Recognition Error:",
        event.error
      );

      setMessage(
        "❌ Could not understand your voice. Please try again."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // =========================================================
  // START CAMERA
  // =========================================================

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(
          "Camera access is not supported by this browser."
        );

        return;
      }

      setMessage("Starting camera...");

      /*
        IMPORTANT:
        Audio is now TRUE because the interview
        recording should contain microphone audio.
      */

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      setCameraOn(true);

      setFaceDetected(false);

      setMessage(
        "Camera and microphone started successfully. Looking for your face..."
      );
    } catch (error) {
      console.error(
        "Camera Error:",
        error
      );

      setCameraOn(false);
      setFaceDetected(false);

      setMessage(
        `Camera could not start: ${error.name}. Please check your camera and microphone permissions.`
      );
    }
  };
  // =========================================================
// START VIDEO RECORDING
// =========================================================

const startRecording = () => {
  try {
    if (!streamRef.current) {
      setMessage(
        "Camera is not available. Please start the camera first."
      );
      return;
    }

    if (
      typeof MediaRecorder === "undefined"
    ) {
      setMessage(
        "Video recording is not supported in this browser."
      );
      return;
    }

    recordedChunksRef.current = [];

    let mimeType = "video/webm";

    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9"
      )
    ) {
      mimeType =
        "video/webm;codecs=vp9";
    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8"
      )
    ) {
      mimeType =
        "video/webm;codecs=vp8";
    }

    const recorder =
      new MediaRecorder(
        streamRef.current,
        {
          mimeType
        }
      );

    mediaRecorderRef.current =
      recorder;

    recorder.ondataavailable = (
      event
    ) => {
      if (
        event.data &&
        event.data.size > 0
      ) {
        recordedChunksRef.current.push(
          event.data
        );
      }
    };

    recorder.onstop = async () => {
      try {
        const blob =
          new Blob(
            recordedChunksRef.current,
            {
              type: mimeType
            }
          );

        console.log(
          "Recording created:",
          blob.size,
          "bytes"
        );

        setRecordingBlob(blob);

        const recordingDuration =
          recordingStartTimeRef.current
            ? Math.floor(
                (Date.now() -
                  recordingStartTimeRef.current) /
                  1000
              )
            : 0;

        setMessage(
          "Uploading interview recording..."
        );

        await uploadRecording(
          blob,
          "face",
          "Face-Cam Interview",
          recordingDuration
        );

        setMessage(
          "Interview recording uploaded successfully."
        );

        console.log(
          "Recording uploaded successfully."
        );

      } catch (error) {
        console.error(
          "Recording Upload Error:",
          error
        );

        setMessage(
          "Interview completed, but recording upload failed."
        );
      }
    };

    recorder.onerror = (
      event
    ) => {
      console.error(
        "MediaRecorder Error:",
        event
      );

      setIsRecording(false);

      setMessage(
        "Unable to record the interview."
      );
    };

    recorder.start(1000);

    recordingStartTimeRef.current =
      Date.now();

    setIsRecording(true);

    console.log(
      "Interview recording started."
    );

  } catch (error) {
    console.error(
      "Start Recording Error:",
      error
    );

    setIsRecording(false);

    setMessage(
      "Could not start video recording."
    );
  }
};

  // =========================================================
  // CONNECT CAMERA STREAM TO VIDEO
  // =========================================================

  React.useEffect(() => {
    if (
      cameraOn &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((error) => {
          console.error(
            "Video Play Error:",
            error
          );
        });
    }
  }, [cameraOn]);

  // =========================================================
  // EMOTION DETECTION
  // =========================================================

  React.useEffect(() => {
    if (
      !cameraOn ||
      !emotionModelsLoaded
    ) {
      return;
    }

    if (!videoRef.current) {
      return;
    }

    if (emotionIntervalRef.current) {
      return;
    }

    console.log(
      "Starting emotion detection..."
    );

    const detectEmotion = async () => {
      try {
        const video =
          videoRef.current;

        if (!video) {
          return;
        }

        if (video.readyState < 2) {
          return;
        }

        const detection =
          await faceapi
            .detectSingleFace(
              video,
              new faceapi.TinyFaceDetectorOptions(
                {
                  inputSize: 224,
                  scoreThreshold: 0.3,
                }
              )
            )
            .withFaceExpressions();

        if (!detection) {
          setFaceDetected(false);
          return;
        }

        setFaceDetected(true);

        const expressions =
          detection.expressions;

        let dominantEmotion =
          "neutral";

        let highestScore = 0;

        Object.entries(
          expressions
        ).forEach(
          ([emotion, value]) => {
            const expressionScore =
              Number(value) || 0;

            if (
              expressionScore >
              highestScore
            ) {
              highestScore =
                expressionScore;

              dominantEmotion =
                emotion;
            }
          }
        );

        console.log(
          "Emotion:",
          dominantEmotion,
          "Confidence:",
          highestScore
        );

        setCurrentEmotion(
          dominantEmotion
        );

        setEmotionConfidence(
          highestScore
        );

        setEmotionCounts(
          (previous) => ({
            ...previous,
            [dominantEmotion]:
              (previous[
                dominantEmotion
              ] || 0) + 1,
          })
        );

        setEmotionSamples(
          (previous) =>
            previous + 1
        );
      } catch (error) {
        console.error(
          "Emotion detection error:",
          error
        );
      }
    };

    detectEmotion();

    emotionIntervalRef.current =
      setInterval(
        detectEmotion,
        700
      );

    return () => {
      if (
        emotionIntervalRef.current
      ) {
        clearInterval(
          emotionIntervalRef.current
        );

        emotionIntervalRef.current =
          null;
      }
    };
  }, [
    cameraOn,
    emotionModelsLoaded,
  ]);

  // =========================================================
  // STOP RECORDING AND SAVE
  // =========================================================

 // =========================================================
// STOP VIDEO RECORDING
// =========================================================

const stopRecording = () => {
  try {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();

      console.log(
        "Interview recording stopped."
      );
    }

    setIsRecording(false);

  } catch (error) {
    console.error(
      "Stop Recording Error:",
      error
    );

    setIsRecording(false);
  }
};

  // =========================================================
  // STOP CAMERA
  // =========================================================

  const stopCamera = () => {
    if (
  mediaRecorderRef.current &&
  mediaRecorderRef.current.state !== "inactive"
) {
  mediaRecorderRef.current.stop();
}

setIsRecording(false);
    if (
      emotionIntervalRef.current
    ) {
      clearInterval(
        emotionIntervalRef.current
      );

      emotionIntervalRef.current =
        null;
    }

    if (mediaRecorderRef.current) {
      try {
        if (
          mediaRecorderRef.current
            .state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error(
          "Stop Recording Error:",
          error
        );
      }

      mediaRecorderRef.current =
        null;

      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraOn(false);
    setFaceDetected(false);

    setMessage(
      "Camera stopped."
    );
  };

  // =========================================================
  // START INTERVIEW
  // =========================================================

 // =========================================================
// START INTERVIEW
// =========================================================

const startInterview = () => {
  if (!cameraOn) {
    setMessage(
      "Please start the camera before starting the interview."
    );
    return;
  }

  console.log("Starting Face-Cam Interview...");

  // Reset interview
  setQuestionIndex(0);
  setAnswer("");
  setAnswers([]);
  setTime(0);
  setScore(0);
  setCompleted(false);

  // Reset emotion analysis
  setCurrentEmotion("neutral");
  setEmotionConfidence(0);

  setEmotionCounts({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0,
  });

  setEmotionSamples(0);

  // IMPORTANT:
  // Start interview mode
  setInterviewStarted(true);

  // Start recording
  if (!isRecording) {
    startRecording();
  }

  setMessage(
    "Interview started. Please answer the question."
  );

  console.log(
    "Current question:",
    questions[0]
  );
};

  // =========================================================
  // CALCULATE ANSWER SCORE
  // =========================================================

  const calculateScore = (
    answerText
  ) => {
    const words =
      answerText
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (
      words.length === 0
    ) {
      return 0;
    }

    if (
      words.length < 10
    ) {
      return 40;
    }

    if (
      words.length < 20
    ) {
      return 65;
    }

    if (
      words.length < 35
    ) {
      return 80;
    }

    return 90;
  };

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  const submitAnswer =
    async () => {
      if (!answer.trim()) {
        setMessage(
          "Please enter your answer before continuing."
        );

        return;
      }

      const currentScore =
        calculateScore(answer);

      const newAnswer = {
        question:
          questions[
            questionIndex
          ],

        answer:
          answer.trim(),

        score:
          currentScore,
      };

      const updatedAnswers = [
        ...answers,
        newAnswer,
      ];

      setAnswers(
        updatedAnswers
      );

      // More questions remaining
      if (
        questionIndex <
        questions.length - 1
      ) {
        setQuestionIndex(
          questionIndex + 1
        );

        setAnswer("");

        setMessage(
          "Answer submitted. Move to the next question."
        );

        return;
      }

      // =====================================================
      // FINAL INTERVIEW SCORE
      // =====================================================

      const totalScore =
        updatedAnswers.reduce(
          (
            total,
            item
          ) =>
            total +
            item.score,
          0
        );

      const finalScore =
        Math.round(
          totalScore /
            updatedAnswers.length
        );

      setScore(finalScore);
setCompleted(true);
setInterviewStarted(false);

// Stop video recording
stopRecording();

      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      /*
        Stop and save the actual
        Face-Cam recording.
      */

      setMessage(
        "Interview completed. Saving your recording..."
      );

      await stopRecordingAndSave();

      // =====================================================
      // SAVE INTERVIEW RESULT
      // =====================================================

      try {
        await apiRequest(
          "/interviews/result",
          {
            method: "POST",

            body: JSON.stringify({
              type: "face",

              score:
                finalScore,

              totalQuestions:
                questions.length,

              answeredQuestions:
                updatedAnswers.length,

              duration:
                Math.ceil(
                  time / 60
                ),
            }),
          }
        );

        if (
          recordingSaved
        ) {
          setMessage(
            "Interview completed and result saved successfully. Recording saved too. ✅"
          );
        } else {
          setMessage(
            "Interview completed and result saved successfully. Recording could not be saved."
          );
        }
      } catch (error) {
        console.error(
          "Save Face Interview Error:",
          error
        );

        setMessage(
          "Interview completed. Result could not be saved."
        );
      }
    };

  // =========================================================
  // RESTART INTERVIEW
  // =========================================================

  const restartInterview =
    () => {
      setQuestionIndex(0);
      setAnswer("");
      setAnswers([]);
      setTime(0);
      setScore(0);

      setCompleted(false);
      setInterviewStarted(false);

      setCurrentEmotion(
        "neutral"
      );

      setEmotionConfidence(
        0
      );

      setEmotionCounts({
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0,
      });

      setEmotionSamples(0);

      setRecordingSaved(
        false
      );

      setMessage("");
    };

  // =========================================================
  // INTERVIEW TIMER
  // =========================================================

  React.useEffect(() => {
    if (
      interviewStarted
    ) {
      timerRef.current =
        setInterval(() => {
          setTime(
            (previous) =>
              previous + 1
          );
        }, 1000);
    }

    return () => {
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, [
    interviewStarted,
  ]);

  // =========================================================
  // COMPONENT CLEANUP
  // =========================================================

  React.useEffect(() => {
    return () => {
      if (
        emotionIntervalRef.current
      ) {
        clearInterval(
          emotionIntervalRef.current
        );

        emotionIntervalRef.current =
          null;
      }

      if (
        mediaRecorderRef.current
      ) {
        try {
          if (
            mediaRecorderRef.current
              .state !==
            "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }
        } catch (
          error
        ) {
          console.error(
            "Recorder cleanup error:",
            error
          );
        }
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

        streamRef.current =
          null;
      }

      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, []);

  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const formatTime =
    () => {
      const minutes =
        Math.floor(
          time / 60
        );

      const seconds =
        time % 60;

      return (
        String(
          minutes
        ).padStart(
          2,
          "0"
        ) +
        ":" +
        String(
          seconds
        ).padStart(
          2,
          "0"
        )
      );
    };

  // =========================================================
  // OVERALL DOMINANT EMOTION
  // =========================================================

  const getOverallEmotion =
    () => {
      if (
        emotionSamples ===
        0
      ) {
        return "neutral";
      }

      let dominantEmotion =
        "neutral";

      let highestCount =
        0;

      Object.entries(
        emotionCounts
      ).forEach(
        ([
          emotion,
          count,
        ]) => {
          if (
            count >
            highestCount
          ) {
            highestCount =
              count;

            dominantEmotion =
              emotion;
          }
        }
      );

      return dominantEmotion;
    };

  const overallEmotion =
    getOverallEmotion();

  const getEmotionLabel =
    (emotion) => {
      const labels = {
        happy: "😊 Happy",
        sad: "😢 Sad",
        angry: "😡 Angry",
        fearful: "😨 Fearful",
        disgusted:
          "🤢 Disgusted",
        surprised:
          "😲 Surprised",
        neutral: "😐 Neutral",
      };

      return (
        labels[emotion] ||
        "😐 Neutral"
      );
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="page-container">

      <div className="page-header">

        <span className="badge">
          Face-Cam Interview
        </span>

        <h1>
          Practice with{" "}
          <span>
            Face-Cam
          </span>{" "}
          📷
        </h1>

        <p>
          Improve your interview
          confidence with a live
          camera interview
          simulation.
        </p>

      </div>

      <div className="face-interview-grid">

        {/* CAMERA CARD */}

        <div className="camera-card">

          <div className="camera-header">

            <div>

              <h2>
                📷 Camera Preview
              </h2>

              <span className="camera-status">
  {cameraOn
    ? "● Camera Active"
    : "○ Camera Off"}

  {isRecording && (
    <span style={{ marginLeft: "10px" }}>
      🔴 Recording
    </span>
  )}
</span>

            </div>

            <div className="face-status">
              {faceDetected
                ? "😊 Face Present"
                : "👤 Face Not Detected"}
            </div>

          </div>

          {/* RECORDING STATUS */}

          {isRecording && (
            <div
              className="info-box"
              style={{
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              🔴 Recording in progress...
            </div>
          )}

          {recordingSaved && (
            <div
              className="info-box"
              style={{
                color: "#16a34a",
                fontWeight: "600",
              }}
            >
              ✅ Interview recording saved successfully.
            </div>
          )}

          {/* LIVE EMOTION */}

          {cameraOn && (
            <div className="face-emotion-status">

              <div className="face-emotion-current">

                <span className="face-emotion-label">
                  Current Emotion
                </span>

                <strong>
                  {getEmotionLabel(
                    currentEmotion
                  )}
                </strong>

              </div>

              <div className="face-emotion-confidence">

                Confidence:{" "}
                {Math.round(
                  emotionConfidence *
                    100
                )}
                %

              </div>

              {!emotionModelsLoaded && (
                <div className="face-emotion-loading">
                  Loading emotion detection...
                </div>
              )}

              {emotionModelsLoaded &&
                emotionSamples ===
                  0 && (
                  <div className="face-emotion-loading">
                    Looking for your face...
                  </div>
                )}

            </div>
          )}

          {/* VIDEO */}

          <div className="video-container">

            {cameraOn ? (

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  objectFit:
                    "cover",
                  display:
                    "block",
                  backgroundColor:
                    "#000",
                }}
              />

            ) : (

              <div className="camera-placeholder">

                <div className="camera-placeholder-icon">
                  📷
                </div>

                <h3>
                  Camera is Off
                </h3>

                <p>
                  Start your camera
                  to begin the
                  interview.
                </p>

              </div>

            )}

          </div>

          {/* CAMERA CONTROLS */}

          <div className="camera-controls">

            {!cameraOn ? (

              <button
                className="primary-btn"
                onClick={
                  startCamera
                }
              >
                📷 Start Camera
              </button>

            ) : (

              <button
                className="secondary-btn"
                onClick={
                  stopCamera
                }
                disabled={
                  interviewStarted
                }
              >
                ⏹ Stop Camera
              </button>

            )}

            {!interviewStarted &&
              !completed && (

                <button
                  className="primary-btn"
                  onClick={
                    startInterview
                  }
                  disabled={
                    !cameraOn
                  }
                >
                  ▶ Start Interview
                </button>

              )}

          </div>

          {message && (
            <div className="info-box">
              {message}
            </div>
          )}

        </div>

        {/* EMOTION STATISTICS */}

        {cameraOn &&
          emotionModelsLoaded && (

            <div className="face-emotion-stats">

              <div className="face-emotion-stats-header">

                <h3>
                  🎭 Emotion Analysis
                </h3>

                <span>
                  Samples:{" "}
                  {emotionSamples}
                </span>

              </div>

              <div className="face-emotion-grid">

                <div>
                  😊 Happy
                  <strong>
                    {
                      emotionCounts.happy
                    }
                  </strong>
                </div>

                <div>
                  😐 Neutral
                  <strong>
                    {
                      emotionCounts.neutral
                    }
                  </strong>
                </div>

                <div>
                  😢 Sad
                  <strong>
                    {
                      emotionCounts.sad
                    }
                  </strong>
                </div>

                <div>
                  😨 Fearful
                  <strong>
                    {
                      emotionCounts.fearful
                    }
                  </strong>
                </div>

                <div>
                  😡 Angry
                  <strong>
                    {
                      emotionCounts.angry
                    }
                  </strong>
                </div>

                <div>
                  😲 Surprised
                  <strong>
                    {
                      emotionCounts.surprised
                    }
                  </strong>
                </div>

                <div>
                  🤢 Disgusted
                  <strong>
                    {
                      emotionCounts.disgusted
                    }
                  </strong>
                </div>

              </div>

            </div>

          )}

        {/* INTERVIEW CARD */}

        <div className="interview-card">

          {completed ? (

            <div className="interview-result">

              <div className="result-icon">
                🎉
              </div>

              <h2>
                Interview Completed!
              </h2>

              <div className="final-score">
                {score}%
              </div>

              <p>
                Your Face-Cam
                interview performance
                score
              </p>

              <div className="result-stats">

                <div>
                  <strong>
                    {
                      questions.length
                    }
                  </strong>

                  <span>
                    Questions
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      answers.length
                    }
                  </strong>

                  <span>
                    Answered
                  </span>
                </div>

                <div>
                  <strong>
                    {formatTime()}
                  </strong>

                  <span>
                    Duration
                  </span>
                </div>

              </div>

              {/* FINAL EMOTION RESULT */}

              <div className="face-emotion-result">

                <h3>
                  🎭 Emotion Analysis
                  Result
                </h3>

                {emotionSamples >
                0 ? (

                  <>

                    <div className="emotion-result-main">

                      <span>
                        Overall Detected
                        Emotion
                      </span>

                      <strong>
                        {getEmotionLabel(
                          overallEmotion
                        )}
                      </strong>

                    </div>

                    <div className="emotion-result-confidence">

                      <span>
                        Total Emotion
                        Samples
                      </span>

                      <strong>
                        {
                          emotionSamples
                        }
                      </strong>

                    </div>

                    <div className="face-emotion-grid">

                      <div>
                        😊 Happy
                        <strong>
                          {
                            emotionCounts.happy
                          }
                        </strong>
                      </div>

                      <div>
                        😐 Neutral
                        <strong>
                          {
                            emotionCounts.neutral
                          }
                        </strong>
                      </div>

                      <div>
                        😢 Sad
                        <strong>
                          {
                            emotionCounts.sad
                          }
                        </strong>
                      </div>

                      <div>
                        😨 Fearful
                        <strong>
                          {
                            emotionCounts.fearful
                          }
                        </strong>
                      </div>

                      <div>
                        😡 Angry
                        <strong>
                          {
                            emotionCounts.angry
                          }
                        </strong>
                      </div>

                      <div>
                        😲 Surprised
                        <strong>
                          {
                            emotionCounts.surprised
                          }
                        </strong>
                      </div>

                      <div>
                        🤢 Disgusted
                        <strong>
                          {
                            emotionCounts.disgusted
                          }
                        </strong>
                      </div>

                    </div>

                  </>

                ) : (

                  <p>
                    No emotion samples
                    were detected during
                    this interview.
                  </p>

                )}

              </div>

              {recordingSaved && (
                <div className="info-box">
                  🎥 Your Face-Cam interview
                  recording has been saved.
                </div>
              )}

              <button
                className="primary-btn"
                onClick={
                  restartInterview
                }
              >
                🔄 Practice Again
              </button>

            </div>

          ) : interviewStarted ? (

            <>

              <div className="interview-top-bar">

                <span>
                  Question{" "}
                  {questionIndex +
                    1}{" "}
                  of{" "}
                  {
                    questions.length
                  }
                </span>

                <span>
                  ⏱{" "}
                  {formatTime()}
                </span>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      (
                        ((questionIndex +
                          1) /
                          questions.length) *
                        100
                      ) +
                      "%",
                  }}
                />

              </div>

              <div className="question-section">

  <span className="question-label">
    Interview Question
  </span>

  <h2>
    {questions[questionIndex]}
  </h2>

</div>

              <div className="answer-section">

                <label>
                  Your Answer
                </label>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    startVoiceAnswer
                  }
                  disabled={
                    isListening
                  }
                >
                  {isListening
                    ? "🎤 Listening..."
                    : "🎤 Answer by Voice"}
                </button>

                <textarea
                  value={
                    answer
                  }
                  onChange={(
                    event
                  ) =>
                    setAnswer(
                      event.target
                        .value
                    )
                  }
                  placeholder="Type your answer here..."
                  rows="8"
                />

                <p className="answer-tip">
                  💡 Tip: Give a
                  clear answer with
                  examples from your
                  studies, projects
                  or experience.
                </p>

              </div>

              <button
                className="primary-btn full-width"
                onClick={
                  submitAnswer
                }
              >
                {questionIndex ===
                questions.length -
                  1
                  ? "🏁 Finish Interview"
                  : "Next Question →"}
              </button>

            </>

          ) : (

            <div className="interview-start">

              <div className="start-icon">
                🎤
              </div>

              <h2>
                Ready for your
                interview?
              </h2>

              <p>
                You will be asked{" "}
                {
                  questions.length
                }{" "}
                HR-style interview
                questions.
              </p>

              <div className="interview-features">

                <div>
                  📷
                  <span>
                    Camera Preview
                  </span>
                </div>

                <div>
                  🎥
                  <span>
                    Interview Recording
                  </span>
                </div>

                <div>
                  ⏱️
                  <span>
                    Live Timer
                  </span>
                </div>

                <div>
                  📊
                  <span>
                    Performance Score
                  </span>
                </div>

                <div>
                  😊
                  <span>
                    Emotion Detection
                  </span>
                </div>

              </div>

              <p className="small-text">
                Start the camera first,
                then click "Start
                Interview".
              </p>

            </div>

          )}

        </div>

      </div>

      {/* INFORMATION BOX */}

      <div className="info-box">

        <strong>
          🎭 AI Emotion Detection &
          Interview Recording
        </strong>

        <p>
          InterZen uses your browser
          camera with face-api.js to
          detect facial expressions
          during the Face-Cam
          interview. The system also
          records the interview using
          the browser MediaRecorder
          API and saves the recording
          through the InterZen backend.
        </p>

      </div>

    </div>
  );
}

/* =========================
   GROUP DISCUSSION
========================= */

function GroupDiscussion() {
  const timerRef = React.useRef(null);

  const topics = {
    easy: [
      "Is online education better than classroom education?",
      "Should college students do internships?",
      "Is social media useful for students?"
    ],
    medium: [
      "Will Artificial Intelligence replace human jobs?",
      "Is work from home better than office work?",
      "Should coding be compulsory for all students?"
    ],
    hard: [
      "Can AI development happen without affecting employment?",
      "Should companies prioritize skills over college degrees?",
      "Does technology improve society or create more problems?"
    ]
  };

  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [response, setResponse] = useState("");
  const [time, setTime] = useState(120);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [isListening, setIsListening] = useState(false);
const startVoiceDiscussion = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setFeedback([
      {
        title: "Voice Support",
        score: 0,
        text:
          "Voice recognition is not supported. Please use Google Chrome."
      }
    ]);
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const spokenText =
      event.results[0][0].transcript;

    setResponse((previous) =>
      previous
        ? previous + " " + spokenText
        : spokenText
    );
  };

  recognition.onerror = (event) => {
    console.error(
      "GD Speech Error:",
      event.error
    );
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};
  const selectTopic = (level) => {
    setDifficulty(level);

    const list = topics[level];
    const randomTopic =
      list[Math.floor(Math.random() * list.length)];

    setTopic(randomTopic);
    setStarted(false);
    setSubmitted(false);
    setResponse("");
    setTime(120);
    setScore(0);
    setFeedback([]);
  };

  const startDiscussion = () => {
    if (!topic) {
      selectTopic(difficulty);
    }

    setStarted(true);
    setSubmitted(false);
    setResponse("");
    setTime(120);
    setScore(0);
    setFeedback([]);
  };

  React.useEffect(() => {
    if (started && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((previous) => previous - 1);
      }, 1000);
    }

    if (started && time === 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [started, time]);

  const evaluateResponseWithAI = async (text) => {
  const prompt = `
You are an expert Group Discussion interviewer.

Evaluate the following candidate contribution.

Discussion Topic:
${topic}

Difficulty:
${difficulty}

Candidate Contribution:
${text}

Evaluate the candidate on these five criteria:

1. Communication
2. Relevance
3. Structure
4. Reasoning
5. Participation

Give each criterion a score from 0 to 100.

Also provide:
- overall score from 0 to 100
- short feedback for each criterion

Return ONLY valid JSON in exactly this format:

{
  "overallScore": 0,
  "feedback": [
    {
      "title": "Communication",
      "score": 0,
      "text": "Short feedback"
    },
    {
      "title": "Relevance",
      "score": 0,
      "text": "Short feedback"
    },
    {
      "title": "Structure",
      "score": 0,
      "text": "Short feedback"
    },
    {
      "title": "Reasoning",
      "score": 0,
      "text": "Short feedback"
    },
    {
      "title": "Participation",
      "score": 0,
      "text": "Short feedback"
    }
  ]
}

Rules:
- Scores must be between 0 and 100.
- Evaluate the actual quality of the contribution, not just its length.
- Check whether the response directly addresses the topic.
- Check whether the candidate gives logical reasons.
- Check whether examples or supporting points are used where appropriate.
- Check clarity and organization.
- Keep feedback concise.
- Do not add markdown or text outside the JSON.
`;

  const response = await fetch(
    "http://localhost:5000/api/internhelp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to evaluate GD contribution."
    );
  }

  let rawText =
    data.reply ||
    data.response ||
    data.message ||
    "";

  rawText = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let evaluation;

  try {
    evaluation = JSON.parse(rawText);
  } catch (parseError) {
    const startIndex = rawText.indexOf("{");
    const endIndex = rawText.lastIndexOf("}");

    if (
      startIndex !== -1 &&
      endIndex !== -1
    ) {
      evaluation = JSON.parse(
        rawText.substring(
          startIndex,
          endIndex + 1
        )
      );
    } else {
      throw new Error(
        "Invalid AI evaluation format."
      );
    }
  }

  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Number(evaluation.overallScore) || 0
    )
  );

  const feedbackItems = Array.isArray(
    evaluation.feedback
  )
    ? evaluation.feedback
    : [];

  const cleanedFeedback =
    feedbackItems.map((item) => ({
      title: item.title || "Evaluation",
      score: Math.max(
        0,
        Math.min(
          100,
          Number(item.score) || 0
        )
      ),
      text:
        item.text ||
        "No additional feedback available.",
    }));

  return {
    finalScore: overallScore,
    feedback: cleanedFeedback,
  };
};
  const submitResponse = async () => {
  if (!response.trim()) {
    return;
  }

  try {
    setIsListening(false);
    setSubmitted(false);
    setFeedback([]);

    const result =
      await evaluateResponseWithAI(
        response.trim()
      );

    setScore(result.finalScore);
    setFeedback(result.feedback);
    setSubmitted(true);
    setStarted(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await apiRequest(
        "/interviews/result",
        {
          method: "POST",
          body: JSON.stringify({
            type: "group",
            score: result.finalScore,
            totalQuestions: 1,
            answeredQuestions: 1,
            duration: Math.ceil(
              (120 - time) / 60
            ),
          }),
        }
      );
    } catch (saveError) {
      console.error(
        "Save GD Result Error:",
        saveError
      );
    }
  } catch (error) {
    console.error(
      "AI GD Evaluation Error:",
      error
    );

    setFeedback([
      {
        title: "AI Evaluation",
        score: 0,
        text:
          error.message ||
          "Unable to evaluate your contribution. Please try again.",
      },
    ]);

    setSubmitted(false);
  }
};

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  };

  const resetDiscussion = () => {
    setTopic("");
    setStarted(false);
    setSubmitted(false);
    setResponse("");
    setTime(120);
    setScore(0);
    setFeedback([]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="badge">
          Group Discussion
        </span>

        <h1>
          Practice <span>Group Discussions</span> 🗣️
        </h1>

        <p>
          Improve your communication, confidence,
          reasoning and participation skills.
        </p>
      </div>

      {!started && !submitted && (
        <div className="gd-setup-card">
          <div className="setup-icon">
            🗣️
          </div>

          <h2>
            Start a GD Practice Session
          </h2>

          <p>
            Select a difficulty level and get a random
            discussion topic.
          </p>

          <div className="difficulty-section">
            <h3>
              Select Difficulty
            </h3>

            <div className="difficulty-buttons">
              <button
                className={
                  difficulty === "easy"
                    ? "difficulty-btn active"
                    : "difficulty-btn"
                }
                onClick={() =>
                  selectTopic("easy")
                }
              >
                🟢 Easy
              </button>

              <button
                className={
                  difficulty === "medium"
                    ? "difficulty-btn active"
                    : "difficulty-btn"
                }
                onClick={() =>
                  selectTopic("medium")
                }
              >
                🟡 Medium
              </button>

              <button
                className={
                  difficulty === "hard"
                    ? "difficulty-btn active"
                    : "difficulty-btn"
                }
                onClick={() =>
                  selectTopic("hard")
                }
              >
                🔴 Hard
              </button>
            </div>
          </div>

          <div className="topic-preview">
            <span>
              Discussion Topic
            </span>

            <h3>
              {topic ||
                "Click a difficulty level to generate a topic."}
            </h3>
          </div>

          <button
            className="primary-btn"
            onClick={startDiscussion}
          >
            🚀 Start Discussion
          </button>
        </div>
      )}

      {started && (
        <div className="gd-session">
          <div className="gd-session-header">
            <div>
              <span className="badge">
                {difficulty.toUpperCase()}
              </span>

              <h2>
                Group Discussion
              </h2>
            </div>

            <div className="gd-timer">
              ⏱️ {formatTime()}
            </div>
          </div>

          <div className="gd-topic-card">
            <span>
              Your Topic
            </span>

            <h2>
              {topic}
            </h2>
          </div>

          <div className="gd-instructions">
            <h3>
              💡 Discussion Tips
            </h3>

            <ul>
              <li>
                Clearly state your opinion.
              </li>

              <li>
                Give reasons to support your points.
              </li>

              <li>
                Use examples where possible.
              </li>

              <li>
                Respect different opinions.
              </li>

              <li>
                End with a short conclusion.
              </li>
            </ul>
          </div>

          <div className="gd-response-card">
            <label>
              Your Contribution
            </label>
          <button
  type="button"
  className="secondary-btn"
  onClick={startVoiceDiscussion}
  disabled={isListening}
>
  {isListening
    ? "🎤 Listening..."
    : "🎤 Speak Your Point"}
</button>
            <textarea
              value={response}
              onChange={(event) =>
                setResponse(event.target.value)
              }
              placeholder={
                "Imagine other participants are discussing this topic. " +
                "Write the points you would contribute to the discussion..."
              }
              rows="10"
            />

            <div className="word-count">
              Words:{" "}
              {
                response
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length
              }
            </div>

            <button
              className="primary-btn"
              onClick={submitResponse}
              disabled={!response.trim()}
            >
              🏁 Submit Contribution
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="gd-result-card">
          <div className="result-icon">
            🎉
          </div>

          <h2>
            GD Practice Completed!
          </h2>

          <div className="gd-final-score">
            {score}%
          </div>

          <p>
            Your AI Group Discussion Score
          </p>

          <div className="gd-feedback-grid">
            {feedback.map((item, index) => (
              <div
                className="gd-feedback-item"
                key={index}
              >
                <div className="feedback-title">
                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.score}%
                  </span>
                </div>

                <div className="feedback-progress">
                  <div
                    style={{
                      width:
                        item.score + "%"
                    }}
                  />
                </div>

                <p>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="gd-response-review">
            <h3>
              Your Contribution
            </h3>

            <p>
              {response}
            </p>
          </div>

          <div className="result-actions">
            <button
              className="primary-btn"
              onClick={resetDiscussion}
            >
              🔄 Practice Again
            </button>
          </div>
        </div>
      )}

      <div className="info-box">
        <strong>
  AI GD Evaluation 🤖
</strong>

<p>
  InternHelp evaluates your contribution using
  communication, relevance, structure, reasoning and
  participation. Voice input is also supported through
  your browser's speech recognition.
</p>
      </div>
    </div>
  );
}
/* =========================
   ABOUT
========================= */

function About() {
  return (
    <div className="page">
      <div className="about-card">
        <h1>About InterZen</h1>

        <p>
          InterZen is an AI-powered interview preparation and career
          guidance platform designed for students and job seekers.
        </p>

        <p>
          The platform combines resume analysis, technical interviews,
          HR interviews, coding practice, voice assistance, face
          interviews and AI-based career guidance.
        </p>

        <h2>Our AI Assistant</h2>

        <p>
          <strong>InternHelp</strong> provides interactive assistance
          throughout the interview preparation journey.
        </p>
      </div>
    </div>
  );
}

/* =========================
   CONTACT
========================= */

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page">
      <div className="contact-card">
        <h1>Contact Us</h1>

        <p>
          Have questions about InterZen? Send us a message.
        </p>

        {submitted && (
          <div className="success-box">
            Message submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            required
          />

          <input
            type="email"
            placeholder="Your Email"
            required
          />

          <textarea
            rows="6"
            placeholder="Your Message"
            required
          />

          <button className="primary-button">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   GLOBAL STYLES
========================= */

function Styles() {
  useEffect(() => {
    const styleId = "interzen-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Arial, Helvetica, sans-serif;
        background: #f5f7fb;
        color: #172033;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      button,
      input,
      textarea,
      select {
        font: inherit;
      }

      .navbar {
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .nav-container {
        max-width: 1200px;
        margin: auto;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 22px;
        font-weight: 800;
        color: #2563eb;
      }

      .logo-icon,
      .auth-logo {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: #2563eb;
        color: white;
        font-weight: 800;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }

      .nav-links a {
        color: #475569;
        font-size: 14px;
        font-weight: 600;
      }

      .nav-links a:hover {
        color: #2563eb;
      }

      .nav-button {
        border: 0;
        border-radius: 8px;
        padding: 9px 16px;
        background: #2563eb;
        color: white !important;
        cursor: pointer;
      }

      main {
        min-height: calc(100vh - 150px);
      }

      .hero {
        max-width: 1200px;
        margin: auto;
        padding: 90px 24px;
        display: grid;
        grid-template-columns: 1.3fr 0.7fr;
        gap: 60px;
        align-items: center;
      }

      .badge {
        display: inline-block;
        background: #dbeafe;
        color: #1d4ed8;
        padding: 8px 14px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 20px;
      }

      .hero h1 {
        font-size: 58px;
        line-height: 1.05;
        margin-bottom: 24px;
      }

      .hero h1 span {
        color: #2563eb;
      }

      .hero p {
        font-size: 18px;
        line-height: 1.7;
        color: #64748b;
        max-width: 650px;
      }

      .hero-buttons {
        margin-top: 30px;
        display: flex;
        gap: 14px;
      }

      .primary-button,
      .secondary-button {
        display: inline-block;
        border-radius: 9px;
        padding: 12px 20px;
        border: none;
        cursor: pointer;
        font-weight: 700;
      }

      .primary-button {
        background: #2563eb;
        color: white;
      }

      .primary-button:hover {
        background: #1d4ed8;
      }

      .secondary-button {
        background: white;
        border: 1px solid #cbd5e1;
        color: #334155;
      }

      .full-width {
        width: 100%;
      }

      .hero-card {
        background: white;
        border-radius: 24px;
        padding: 45px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
      }

      .ai-circle {
        width: 110px;
        height: 110px;
        margin: auto auto 25px;
        border-radius: 50%;
        background: #dbeafe;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 55px;
      }

      .section {
        max-width: 1200px;
        margin: auto;
        padding: 60px 24px;
      }

      .section-title {
        text-align: center;
        margin-bottom: 35px;
      }

      .section-title h2 {
        font-size: 34px;
        margin-bottom: 10px;
      }

      .section-title p {
        color: #64748b;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      .feature-card,
      .practice-card,
      .quick-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 25px;
        transition: 0.2s;
      }

      .feature-card:hover,
      .practice-card:hover,
      .quick-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }

      .feature-icon {
        font-size: 35px;
        margin-bottom: 15px;
      }

      .feature-card h3,
      .practice-card h3 {
        margin-bottom: 10px;
      }

      .feature-card p,
      .practice-card p {
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 15px;
      }

      .feature-card span,
      .practice-card span {
        color: #2563eb;
        font-weight: 700;
      }

      .page {
        max-width: 1200px;
        margin: auto;
        padding: 45px 24px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 35px;
      }

      .page-header h1 {
        font-size: 34px;
        margin-bottom: 8px;
      }

      .page-header p {
        color: #64748b;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      .stat-card {
        background: white;
        padding: 25px;
        border-radius: 16px;
        border: 1px solid #e5e7eb;
        display: flex;
        gap: 18px;
        align-items: center;
      }

      .stat-icon {
        font-size: 30px;
      }

      .stat-card p {
        color: #64748b;
        margin-bottom: 5px;
      }

      .stat-card h2 {
        font-size: 30px;
      }

      .dashboard-section {
        margin-top: 40px;
      }

      .dashboard-section h2 {
        margin-bottom: 20px;
      }

      .quick-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
      }

      .quick-card {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .quick-card span:first-child {
        font-size: 25px;
      }

      .quick-card h3 {
        flex: 1;
        font-size: 15px;
      }

      .auth-page {
        min-height: calc(100vh - 150px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
      }

      .auth-card {
        width: 100%;
        max-width: 430px;
        background: white;
        padding: 35px;
        border-radius: 20px;
        box-shadow: 0 15px 50px rgba(15, 23, 42, 0.1);
      }

      .auth-logo {
        margin: auto auto 20px;
        width: 55px;
        height: 55px;
        font-size: 20px;
      }

      .auth-card h2 {
        text-align: center;
        margin-bottom: 8px;
      }

      .auth-card > p {
        text-align: center;
        color: #64748b;
        margin-bottom: 25px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 13px 15px;
        border: 1px solid #cbd5e1;
        border-radius: 9px;
        outline: none;
        background: white;
      }

      input:focus,
      textarea:focus,
      select:focus {
        border-color: #2563eb;
      }

      .auth-switch {
        margin-top: 20px;
        font-size: 14px;
      }

      .auth-switch a {
        color: #2563eb;
        font-weight: 700;
      }

      .error-box,
      .success-box {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
      }

      .error-box {
        background: #fee2e2;
        color: #b91c1c;
      }

      .success-box {
        background: #dcfce7;
        color: #166534;
      }

      .tool-card,
      .result-card,
      .interview-card,
      .contact-card,
      .about-card,
      .face-card,
      .voice-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 30px;
        margin-bottom: 25px;
      }

      .tool-card {
        display: flex;
        gap: 15px;
        align-items: center;
      }

      .tool-card input,
      .tool-card select {
        flex: 1;
      }

      .result-card {
        max-width: 800px;
      }

      .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: #dbeafe;
        color: #1d4ed8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: 800;
        margin: 25px auto;
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0 25px;
      }

      .tag-list span {
        background: #dcfce7;
        color: #166534;
        padding: 7px 12px;
        border-radius: 20px;
        font-size: 13px;
      }

      .tag-list.warning span {
        background: #fef3c7;
        color: #92400e;
      }

      .question-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .question-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 18px;
        display: flex;
        gap: 15px;
      }

      .question-card span {
        width: 30px;
        height: 30px;
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .practice-grid,
      .coding-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      .coding-card {
        background: white;
        border: 1px solid #e5e7eb;
        padding: 25px;
        border-radius: 16px;
      }

      .coding-card h2 {
        margin: 12px 0;
      }

      .coding-card p {
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .difficulty {
        background: #dcfce7;
        color: #166534;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
      }

      .interview-card {
        max-width: 850px;
        margin: 30px auto;
      }

      .interview-card h1 {
        margin: 25px 0;
        font-size: 28px;
      }

      .progress-text {
        color: #64748b;
        font-weight: 700;
      }

      .progress-bar {
        height: 8px;
        background: #e2e8f0;
        border-radius: 20px;
        overflow: hidden;
        margin-top: 12px;
      }

      .progress-bar div {
        height: 100%;
        background: #2563eb;
      }

      .center {
        text-align: center;
        margin: 50px auto;
      }

      .success-icon {
        font-size: 60px;
      }

      .big-score {
        font-size: 65px;
        color: #2563eb;
        font-weight: 800;
        margin: 20px;
      }

      .chat-card {
        max-width: 800px;
        margin: auto;
        background: white;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }

      .chat-header {
        padding: 20px;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .ai-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 25px;
      }

      .chat-header span {
        font-size: 13px;
        opacity: 0.8;
      }

      .chat-messages {
        height: 450px;
        padding: 20px;
        overflow-y: auto;
      }

      .message {
        max-width: 75%;
        padding: 12px 15px;
        margin-bottom: 12px;
        border-radius: 12px;
        line-height: 1.5;
      }

      .bot-message {
        background: #f1f5f9;
      }

      .user-message {
        background: #dbeafe;
        margin-left: auto;
      }

      .chat-input {
        display: flex;
        gap: 10px;
        padding: 15px;
        border-top: 1px solid #e5e7eb;
      }

      .chat-input input {
        flex: 1;
      }

      .chat-input button {
        background: #2563eb;
        color: white;
        border: 0;
        border-radius: 8px;
        padding: 0 20px;
        cursor: pointer;
      }

      .voice-card {
        max-width: 700px;
        text-align: center;
        margin: 40px auto;
      }

      .voice-icon {
        font-size: 80px;
        margin-bottom: 20px;
      }

      .voice-button {
        margin-top: 25px;
        border: 0;
        border-radius: 50%;
        width: 180px;
        height: 180px;
        background: #2563eb;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      .voice-result {
        margin-top: 30px;
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
      }

      .face-card {
        max-width: 850px;
        margin: auto;
        text-align: center;
      }

      .video-container {
        background: #0f172a;
        min-height: 400px;
        border-radius: 15px;
        margin: 25px 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .video-container video {
        width: 100%;
        max-height: 500px;
      }

      .camera-placeholder {
        color: white;
        font-size: 50px;
      }

      .camera-placeholder p {
        font-size: 16px;
        color: #cbd5e1;
      }

      .topic-box {
        margin-top: 25px;
        padding: 25px;
        background: #eff6ff;
        border-radius: 12px;
      }

      .contact-card,
      .about-card {
        max-width: 800px;
        margin: auto;
      }

      .contact-card h1,
      .about-card h1 {
        margin-bottom: 15px;
      }

      .about-card p {
        color: #475569;
        line-height: 1.8;
        margin: 15px 0;
      }

      .about-card h2 {
        margin-top: 30px;
      }

      .footer {
        background: #0f172a;
        color: white;
        margin-top: 50px;
      }

      .footer-container {
        max-width: 1200px;
        margin: auto;
        padding: 50px 24px;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 40px;
      }

      .footer h3,
      .footer h4 {
        margin-bottom: 15px;
      }

      .footer p {
        color: #94a3b8;
        line-height: 1.6;
      }

      .footer a {
        display: block;
        color: #cbd5e1;
        margin-bottom: 10px;
      }

      .footer-bottom {
        text-align: center;
        padding: 18px;
        border-top: 1px solid #334155;
        color: #94a3b8;
        font-size: 13px;
      }

      .loading {
        background: white;
        padding: 40px;
        text-align: center;
        border-radius: 15px;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 200;
      }

      .modal {
        background: white;
        width: 100%;
        max-width: 650px;
        padding: 30px;
        border-radius: 18px;
        position: relative;
      }

      .modal textarea {
        margin: 20px 0;
      }

      .close-button {
        position: absolute;
        right: 15px;
        top: 10px;
        border: 0;
        background: transparent;
        font-size: 30px;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .feature-grid,
        .practice-grid,
        .coding-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .quick-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .footer-container {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 600px) {
        .nav-container {
          flex-direction: column;
        }

        .nav-links {
          justify-content: center;
        }

        .hero {
          padding: 50px 20px;
        }

        .hero h1 {
          font-size: 40px;
        }

        .feature-grid,
        .practice-grid,
        .coding-grid,
        .stats-grid,
        .quick-grid {
          grid-template-columns: 1fr;
        }

        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .tool-card {
          flex-direction: column;
          align-items: stretch;
        }

        .footer-container {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(styleId);

      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
}

/* =========================
   APP
========================= */
function CareerGuidance() {
  const [career, setCareer] = React.useState(
    "Software Developer"
  );

  const [experience, setExperience] =
    React.useState("Beginner");

  const [interests, setInterests] =
    React.useState("");

  const [recommendations, setRecommendations] =
    React.useState(null);

  const [loading, setLoading] =
    React.useState(false);

  const [errorMessage, setErrorMessage] =
    React.useState("");

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setRecommendations(null);

      const selectedInterests =
        interests.trim() ||
        "Programming, problem solving and computer science";

      const prompt = `
You are InternHelp, the AI career guidance assistant inside InterZen.

Create a practical career preparation roadmap for a college student preparing for internships and placements.

Career Goal:
${career}

Experience Level:
${experience}

Interests / Skills:
${selectedInterests}

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add explanations outside JSON.

Return EXACTLY this structure:

{
  "skills": [
    "skill 1",
    "skill 2",
    "skill 3",
    "skill 4",
    "skill 5"
  ],
  "learn": [
    "topic 1",
    "topic 2",
    "topic 3",
    "topic 4",
    "topic 5"
  ],
  "modules": [
    "module 1",
    "module 2",
    "module 3",
    "module 4"
  ],
  "roadmap": [
    {
      "title": "Step 1",
      "description": "What the student should do."
    },
    {
      "title": "Step 2",
      "description": "What the student should do."
    },
    {
      "title": "Step 3",
      "description": "What the student should do."
    },
    {
      "title": "Step 4",
      "description": "What the student should do."
    },
    {
      "title": "Step 5",
      "description": "What the student should do."
    }
  ]
}

Rules:

- Recommendations must match the selected career.
- Recommendations must match the experience level.
- Consider the student's interests and skills.
- Make the roadmap practical for a college student.
- Focus on internship and placement preparation.
- Include technical skills, interview preparation and practical projects.
- Do not assume the student already knows a technology unless it appears in the interests.
- Keep each explanation concise.
- Do not provide unrealistic senior-level requirements.
`;

      const response = await fetch(
        "http://localhost:5000/api/internhelp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: prompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate career roadmap."
        );
      }

      let reply =
        data.reply ||
        data.response ||
        data.message ||
        "";

      if (!reply) {
        throw new Error(
          "InternHelp returned an empty response."
        );
      }

      /*
        Remove Markdown code fences if AI
        accidentally returns them.
      */

      reply = reply
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(reply);
      } catch (parseError) {
        /*
          Try extracting the JSON object
          from additional AI text.
        */

        const startIndex =
          reply.indexOf("{");

        const endIndex =
          reply.lastIndexOf("}");

        if (
          startIndex !== -1 &&
          endIndex !== -1 &&
          endIndex > startIndex
        ) {
          const jsonText =
            reply.substring(
              startIndex,
              endIndex + 1
            );

          parsed = JSON.parse(jsonText);
        } else {
          throw new Error(
            "InternHelp returned an invalid career guidance format."
          );
        }
      }

      /*
        Validate AI response.
      */

      if (
        !parsed ||
        !Array.isArray(parsed.skills) ||
        !Array.isArray(parsed.learn) ||
        !Array.isArray(parsed.modules) ||
        !Array.isArray(parsed.roadmap)
      ) {
        throw new Error(
          "InternHelp returned incomplete career guidance."
        );
      }

      /*
        Validate roadmap objects.
      */

      const validRoadmap =
        parsed.roadmap.filter(
          (step) =>
            step &&
            typeof step.title ===
              "string" &&
            typeof step.description ===
              "string"
        );

      if (validRoadmap.length === 0) {
        throw new Error(
          "No valid career roadmap was generated."
        );
      }

      /*
        Clean arrays so the UI never receives
        undefined values.
      */

      const cleanedRecommendations = {
        skills: parsed.skills
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim()
          )
          .slice(0, 5),

        learn: parsed.learn
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim()
          )
          .slice(0, 5),

        modules: parsed.modules
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim()
          )
          .slice(0, 4),

        roadmap: validRoadmap
          .slice(0, 5),
      };

      setRecommendations(
        cleanedRecommendations
      );

    } catch (error) {
      console.error(
        "Career Guidance Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to generate AI career roadmap. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetRecommendations = () => {
    setRecommendations(null);
    setErrorMessage("");
  };

  return (
    <div className="page-container career-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="career-header">

        <p className="dashboard-label">
          AI CAREER GUIDANCE
        </p>

        <h1>
          Build Your Career Roadmap 🚀
        </h1>

        <p>
          Tell InternHelp your career goal and
          get a personalized preparation roadmap.
        </p>

      </div>


      {/* =========================================
          CAREER FORM
      ========================================= */}

      <div className="career-form-card">

        <h2>
          Choose Your Career Goal
        </h2>

        <div className="career-form-grid">

          {/* Career */}

          <div>

            <label>
              Career Path
            </label>

            <select
              value={career}
              onChange={(e) => {
                setCareer(e.target.value);
                resetRecommendations();
              }}
            >

              <option>
                Software Developer
              </option>

              <option>
                Data Analyst
              </option>

              <option>
                AI / ML Engineer
              </option>

              <option>
                Cybersecurity Analyst
              </option>

              <option>
                Web Developer
              </option>

              <option>
                Full Stack Developer
              </option>

              <option>
                Cloud / DevOps Engineer
              </option>

            </select>

          </div>


          {/* Experience */}

          <div>

            <label>
              Experience Level
            </label>

            <select
              value={experience}
              onChange={(e) => {
                setExperience(e.target.value);
                resetRecommendations();
              }}
            >

              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>

            </select>

          </div>


          {/* Interests */}

          <div>

            <label>
              Interests / Skills
            </label>

            <input
              type="text"
              value={interests}
              onChange={(e) => {
                setInterests(e.target.value);
                resetRecommendations();
              }}
              placeholder="e.g. Python, AI, React, Data Science"
            />

          </div>

        </div>


        {/* =========================================
            ERROR
        ========================================= */}

        {errorMessage && (

          <div
            className="error-box"
            style={{
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            {errorMessage}
          </div>

        )}


        {/* =========================================
            GENERATE BUTTON
        ========================================= */}

        <button
          className="primary-btn"
          onClick={
            generateRecommendations
          }
          disabled={loading}
        >

          {loading
            ? "🤖 InternHelp is generating..."
            : "✨ Generate Career Roadmap"}

        </button>

      </div>


      {/* =========================================
          RESULTS
      ========================================= */}

      {recommendations && (

        <div className="career-results">

          {/* RESULT HEADER */}

          <div className="career-result-header">

            <div>

              <p className="small-label">
                RECOMMENDED PATH
              </p>

              <h2>
                {career}
              </h2>

              <p>
                Experience level:{" "}
                <strong>
                  {experience}
                </strong>
              </p>

              {interests && (
                <p>
                  Interests:{" "}
                  <strong>
                    {interests}
                  </strong>
                </p>
              )}

            </div>

            <div className="career-badge">
              🎯 Career Track
            </div>

          </div>


          {/* =========================================
              SKILLS + LEARN
          ========================================= */}

          <div className="career-grid">


            {/* IMPORTANT SKILLS */}

            <div className="career-result-card">

              <h3>
                🧠 Important Skills
              </h3>

              <div className="skill-list">

                {recommendations.skills.map(
                  (skill, index) => (

                    <span key={index}>
                      {skill}
                    </span>

                  )
                )}

              </div>

            </div>


            {/* SKILLS TO LEARN */}

            <div className="career-result-card">

              <h3>
                📚 Skills To Learn
              </h3>

              <ul>

                {recommendations.learn.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>

            </div>

          </div>


          {/* =========================================
              INTERZEN MODULES
          ========================================= */}

          <div className="career-result-card">

            <h3>
              🚀 Recommended InterZen Modules
            </h3>

            <div className="recommended-modules">

              {recommendations.modules.map(
                (module, index) => (

                  <div
                    className="recommended-module"
                    key={index}
                  >

                    <span>
                      ✓
                    </span>

                    <strong>
                      {module}
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>


          {/* =========================================
              ROADMAP
          ========================================= */}

          <div className="career-roadmap">

            <h3>
              🗺️ Your Preparation Roadmap
            </h3>

            <div className="roadmap">

              {recommendations.roadmap.map(
                (step, index) => (

                  <div
                    className="roadmap-step"
                    key={index}
                  >

                    <div className="roadmap-number">
                      {index + 1}
                    </div>

                    <div>

                      <strong>
                        {step.title}
                      </strong>

                      <p>
                        {step.description}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* =========================================
              ACTIONS
          ========================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >

            <button
              className="primary-btn"
              onClick={
                generateRecommendations
              }
              disabled={loading}
            >

              {loading
                ? "🤖 Generating..."
                : "🔄 Generate Again"}

            </button>

            <button
              className="secondary-btn"
              onClick={
                resetRecommendations
              }
            >
              ✕ Clear Results
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
function PlacementRecommendations() {
  const [career, setCareer] = React.useState("Software Developer");
  const [experience, setExperience] = React.useState("Beginner");
  const [skills, setSkills] = React.useState("");
  const [education, setEducation] = React.useState("B.Sc. Computer Science");

  const [recommendations, setRecommendations] =
    React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] =
    React.useState("");

  const generateRecommendations = async () => {
    setLoading(true);
    setErrorMessage("");
    setRecommendations(null);

    try {
      const prompt = `
You are InternHelp, the AI placement recommendation assistant inside InterZen.

Generate personalized placement and job-role recommendations for a college student.

Student Information:

Career Goal:
${career}

Experience Level:
${experience}

Education:
${education}

Current Skills:
${skills || "Not specified"}

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations outside JSON.

Use EXACTLY this structure:

{
  "profileSummary": "Short summary of the student's current placement profile.",
  "overallMatch": 75,
  "recommendations": [
    {
      "role": "Software Developer",
      "companyType": "IT Services / Product Company",
      "matchPercentage": 85,
      "requiredSkills": [
        "JavaScript",
        "React",
        "Node.js",
        "Git",
        "SQL"
      ],
      "matchedSkills": [
        "JavaScript"
      ],
      "missingSkills": [
        "React",
        "Node.js",
        "SQL"
      ],
      "eligibility": "Suitable for B.Sc. Computer Science students with programming knowledge.",
      "preparation": [
        "Practice JavaScript fundamentals",
        "Build React projects",
        "Practice SQL",
        "Prepare coding problems",
        "Practice technical interviews"
      ],
      "reason": "Why this role is suitable for the student."
    }
  ],
  "topSkillsToImprove": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5"
  ],
  "placementPlan": [
    {
      "step": 1,
      "title": "Build Technical Foundation",
      "description": "What the student should do."
    },
    {
      "step": 2,
      "title": "Improve Coding",
      "description": "What the student should do."
    },
    {
      "step": 3,
      "title": "Build Projects",
      "description": "What the student should do."
    },
    {
      "step": 4,
      "title": "Prepare for Interviews",
      "description": "What the student should do."
    },
    {
      "step": 5,
      "title": "Apply for Placements",
      "description": "What the student should do."
    }
  ]
}

Rules:

- Generate 4 different suitable job-role recommendations.
- Match recommendations with the student's career goal, education, experience and skills.
- matchPercentage must be between 0 and 100.
- overallMatch must be between 0 and 100.
- Do not give every role the same match percentage.
- requiredSkills must contain realistic skills for that role.
- matchedSkills must contain only skills that the student already has.
- missingSkills must contain skills that the student should learn.
- Give practical preparation steps.
- Recommendations should be realistic for a college student preparing for internships and placements.
- Do not guarantee employment.
- Do not invent specific live job openings.
- companyType should describe the type of company rather than inventing a current vacancy.
- Keep each recommendation concise.
`;

      const response = await fetch(
        "http://localhost:5000/api/internhelp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate placement recommendations."
        );
      }

      let reply =
        data.reply ||
        data.response ||
        data.message ||
        "";

      reply = reply
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(reply);
      } catch (parseError) {
        console.error(
          "Initial JSON parsing failed:",
          parseError
        );

        const startIndex = reply.indexOf("{");
        const endIndex = reply.lastIndexOf("}");

        if (
          startIndex !== -1 &&
          endIndex !== -1
        ) {
          parsed = JSON.parse(
            reply.substring(
              startIndex,
              endIndex + 1
            )
          );
        } else {
          throw new Error(
            "InternHelp returned an invalid placement recommendation format."
          );
        }
      }

      if (
        !parsed ||
        !Array.isArray(parsed.recommendations)
      ) {
        throw new Error(
          "Invalid placement recommendation data."
        );
      }

      const cleanedRecommendations =
        parsed.recommendations
          .filter(
            (item) =>
              item &&
              typeof item.role === "string"
          )
          .map((item) => ({
            role: item.role || "Recommended Role",

            companyType:
              item.companyType ||
              "IT Company",

            matchPercentage: Math.max(
              0,
              Math.min(
                100,
                Number(
                  item.matchPercentage
                ) || 0
              )
            ),

            requiredSkills:
              Array.isArray(
                item.requiredSkills
              )
                ? item.requiredSkills
                : [],

            matchedSkills:
              Array.isArray(
                item.matchedSkills
              )
                ? item.matchedSkills
                : [],

            missingSkills:
              Array.isArray(
                item.missingSkills
              )
                ? item.missingSkills
                : [],

            eligibility:
              item.eligibility ||
              "Check the employer's eligibility requirements.",

            preparation:
              Array.isArray(
                item.preparation
              )
                ? item.preparation
                : [],

            reason:
              item.reason ||
              "This role matches your selected career interests.",
          }))
          .slice(0, 4);

      if (
        cleanedRecommendations.length === 0
      ) {
        throw new Error(
          "No placement recommendations were generated."
        );
      }

      setRecommendations({
        profileSummary:
          parsed.profileSummary ||
          "Your placement profile has been analyzed.",

        overallMatch: Math.max(
          0,
          Math.min(
            100,
            Number(parsed.overallMatch) || 0
          )
        ),

        recommendations:
          cleanedRecommendations,

        topSkillsToImprove:
          Array.isArray(
            parsed.topSkillsToImprove
          )
            ? parsed.topSkillsToImprove
            : [],

        placementPlan:
          Array.isArray(
            parsed.placementPlan
          )
            ? parsed.placementPlan
            : [],
      });
    } catch (error) {
      console.error(
        "Placement Recommendation Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to generate placement recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  const getMatchClass = (percentage) => {
    if (percentage >= 80) {
      return "high-match";
    }

    if (percentage >= 60) {
      return "medium-match";
    }

    return "low-match";
  };

  return (
    <div className="page-container placement-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="career-header">

        <p className="dashboard-label">
          AI PLACEMENT RECOMMENDATIONS
        </p>

        <h1>
          Find Your{" "}
          <span>Placement Path</span> 🎯
        </h1>

        <p>
          Tell InternHelp about your career goal and
          current skills to discover suitable job roles
          and prepare for placements.
        </p>

      </div>


      {/* =====================================================
          PROFILE FORM
      ===================================================== */}

      <div className="career-form-card">

        <h2>
          Student Placement Profile
        </h2>

        <div className="career-form-grid">

          {/* Career */}

          <div>

            <label>
              Career Goal
            </label>

            <select
              value={career}
              onChange={(e) =>
                setCareer(e.target.value)
              }
            >

              <option>
                Software Developer
              </option>

              <option>
                Frontend Developer
              </option>

              <option>
                Backend Developer
              </option>

              <option>
                Full Stack Developer
              </option>

              <option>
                Data Analyst
              </option>

              <option>
                AI / ML Engineer
              </option>

              <option>
                Cybersecurity Analyst
              </option>

              <option>
                Cloud Engineer
              </option>

            </select>

          </div>


          {/* Experience */}

          <div>

            <label>
              Experience Level
            </label>

            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
            >

              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>

            </select>

          </div>


          {/* Education */}

          <div>

            <label>
              Education
            </label>

            <select
              value={education}
              onChange={(e) =>
                setEducation(e.target.value)
              }
            >

              <option>
                B.Sc. Computer Science
              </option>

              <option>
                B.Sc. Information Technology
              </option>

              <option>
                BCA
              </option>

              <option>
                B.Tech Computer Science
              </option>

              <option>
                B.Tech Information Technology
              </option>

            </select>

          </div>


          {/* Skills */}

          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >

            <label>
              Current Skills
            </label>

            <input
              type="text"
              value={skills}
              onChange={(e) =>
                setSkills(e.target.value)
              }
              placeholder="e.g. Python, JavaScript, React, MongoDB, SQL, Git"
            />

            <small
              style={{
                display: "block",
                marginTop: "6px",
                opacity: 0.7,
              }}
            >
              Enter your current technical skills
              separated by commas.
            </small>

          </div>

        </div>


        {/* Information */}

        <div className="info-box">

          <strong>
            🎯 How Placement Recommendations Work
          </strong>

          <p>
            InternHelp analyzes your career goal,
            education, experience and skills to
            suggest suitable job roles, identify
            missing skills and create a preparation
            plan.
          </p>

        </div>


        {/* Error */}

        {errorMessage && (

          <div
            className="error-box"
            style={{
              marginBottom: "15px",
            }}
          >
            {errorMessage}
          </div>

        )}


        {/* Generate */}

        <button
          className="primary-btn"
          onClick={generateRecommendations}
          disabled={loading}
        >

          {loading
            ? "🤖 Analyzing Placement Profile..."
            : "✨ Generate Placement Recommendations"}

        </button>

      </div>


      {/* =====================================================
          RESULTS
      ===================================================== */}

      {recommendations && (

        <div className="placement-results">

          {/* =================================================
              OVERALL PROFILE
          ================================================= */}

          <div className="readiness-main-card">

            <div className="readiness-score-section">

              <div className="score-ring">

                <div className="score-ring-inner">

                  <strong>
                    {recommendations.overallMatch}%
                  </strong>

                  <span>
                    Match
                  </span>

                </div>

              </div>


              <div>

                <p className="small-label">
                  PLACEMENT PROFILE
                </p>

                <h2>
                  Your Placement Profile
                </h2>

                <p>
                  {recommendations.profileSummary}
                </p>

                <div className="score-status">
                  🎯 Career: {career}
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              JOB ROLE RECOMMENDATIONS
          ================================================= */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <h2>
                  Recommended Job Roles 💼
                </h2>

                <p>
                  Roles that match your current
                  profile and career goal.
                </p>

              </div>

            </div>


            <div className="career-grid">

              {recommendations.recommendations.map(
                (recommendation, index) => (

                  <div
                    className="career-result-card placement-role-card"
                    key={index}
                  >

                    {/* Role Header */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-start",
                        gap: "15px",
                      }}
                    >

                      <div>

                        <p className="small-label">
                          JOB ROLE
                        </p>

                        <h3>
                          {recommendation.role}
                        </h3>

                      </div>


                      <span
                        className={`career-badge ${getMatchClass(
                          recommendation.matchPercentage
                        )}`}
                      >
                        {recommendation.matchPercentage}%
                        Match
                      </span>

                    </div>


                    {/* Company Type */}

                    <p>

                      🏢{" "}

                      <strong>
                        Company Type:
                      </strong>{" "}

                      {recommendation.companyType}

                    </p>


                    {/* Reason */}

                    <div className="info-box">

                      <strong>
                        Why this role?
                      </strong>

                      <p>
                        {recommendation.reason}
                      </p>

                    </div>


                    {/* Required Skills */}

                    <h4>
                      🧠 Required Skills
                    </h4>

                    <div className="skill-list">

                      {recommendation.requiredSkills.map(
                        (skill, skillIndex) => (

                          <span
                            key={skillIndex}
                          >
                            {skill}
                          </span>

                        )
                      )}

                    </div>


                    {/* Matched Skills */}

                    <h4
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      ✅ Your Matched Skills
                    </h4>

                    <div className="skill-list">

                      {recommendation.matchedSkills.length >
                      0 ? (

                        recommendation.matchedSkills.map(
                          (
                            skill,
                            skillIndex
                          ) => (

                            <span
                              key={skillIndex}
                            >
                              {skill}
                            </span>

                          )
                        )

                      ) : (

                        <p>
                          No matching skills identified
                          yet.
                        </p>

                      )}

                    </div>


                    {/* Missing Skills */}

                    <h4
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      📚 Skills to Improve
                    </h4>

                    <div className="skill-list">

                      {recommendation.missingSkills.length >
                      0 ? (

                        recommendation.missingSkills.map(
                          (
                            skill,
                            skillIndex
                          ) => (

                            <span
                              key={skillIndex}
                            >
                              {skill}
                            </span>

                          )
                        )

                      ) : (

                        <p>
                          No major skill gaps identified.
                        </p>

                      )}

                    </div>


                    {/* Eligibility */}

                    <h4
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      🎓 Eligibility
                    </h4>

                    <p>
                      {recommendation.eligibility}
                    </p>


                    {/* Preparation */}

                    <h4
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      🚀 Preparation
                    </h4>

                    <ul>

                      {recommendation.preparation.map(
                        (
                          item,
                          preparationIndex
                        ) => (

                          <li
                            key={
                              preparationIndex
                            }
                          >
                            {item}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =================================================
              SKILLS TO IMPROVE
          ================================================= */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <h2>
                  Top Skills to Improve 📚
                </h2>

                <p>
                  Focus on these skills to improve
                  your placement profile.
                </p>

              </div>

            </div>


            <div className="skill-list">

              {recommendations.topSkillsToImprove.map(
                (skill, index) => (

                  <span key={index}>
                    {skill}
                  </span>

                )
              )}

            </div>

          </section>


          {/* =================================================
              PLACEMENT PLAN
          ================================================= */}

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <h2>
                  Your Placement Preparation Plan 🗺️
                </h2>

                <p>
                  Follow these steps to prepare for
                  internships and placements.
                </p>

              </div>

            </div>


            <div className="roadmap">

              {recommendations.placementPlan.map(
                (step, index) => (

                  <div
                    className="roadmap-step"
                    key={index}
                  >

                    <div className="roadmap-number">
                      {step.step || index + 1}
                    </div>

                    <div>

                      <strong>
                        {step.title}
                      </strong>

                      <p>
                        {step.description}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =================================================
              DISCLAIMER
          ================================================= */}

          <div className="info-box">

            <strong>
              ℹ️ Placement Information
            </strong>

            <p>
              These recommendations are generated by
              InternHelp for preparation purposes. They
              are not guarantees of employment or current
              job openings. Always verify the eligibility
              requirements and application details with
              the relevant employer or placement cell.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}


function LearningResources() {
  const [myCourses, setMyCourses] = React.useState([]);
  const [category, setCategory] = React.useState("All");
  const [selectedResource, setSelectedResource] = React.useState(null);

  const [showInternalLessons, setShowInternalLessons] =
    React.useState(false);

  const [currentLesson, setCurrentLesson] =
    React.useState(0);

  const [completedLessons, setCompletedLessons] =
    React.useState([]);

  const [courseProgress, setCourseProgress] =
    React.useState(0);

  const [overallLearningProgress, setOverallLearningProgress] =
    React.useState(0);

  const [loadingCourse, setLoadingCourse] =
    React.useState(false);

  const [courseMessage, setCourseMessage] =
    React.useState("");

  const [quizStarted, setQuizStarted] =
    React.useState(false);

  const [quizQuestions, setQuizQuestions] =
    React.useState([]);

  const [quizAnswers, setQuizAnswers] =
    React.useState({});

  const [quizCurrentQuestion, setQuizCurrentQuestion] =
    React.useState(0);

  const [quizScore, setQuizScore] =
    React.useState(0);
  const [quizTotalQuestions, setQuizTotalQuestions] =
  React.useState(0);

  const [quizCompleted, setQuizCompleted] =
    React.useState(false);

  const [quizLoading, setQuizLoading] =
    React.useState(false);

  /*
  ====================================================
  COURSE DATA

  IMPORTANT:
  id MUST remain a NUMBER.
  MongoDB UserCourse.courseId expects Number.
  ====================================================
  */

  const resources = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      category: "Programming",
      icon: "💻",
      duration: "25 min",
      level: "Beginner",
      description:
        "Learn JavaScript basics, variables, functions, arrays and modern syntax.",

      externalTutorial: {
        name: "MDN JavaScript Guide",
        description:
          "Free official JavaScript documentation and beginner learning resources.",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
      },

      lessons: [
        {
          title: "Introduction to JavaScript",
          content:
            "JavaScript is a programming language used to make websites interactive. It can run inside browsers and also on servers using Node.js.",
          points: [
            "JavaScript adds interactivity to websites.",
            "JavaScript is dynamically typed.",
            "JavaScript supports object-oriented programming.",
            "JavaScript can be used for frontend and backend development."
          ],
          example:
            'console.log("Hello, InterZen!");',
          tip:
            "Understand the difference between JavaScript and Java."
        },

        {
          title: "Variables and Data Types",
          content:
            "Variables store values used by a program. JavaScript commonly uses let and const.",
          points: [
            "let can be reassigned.",
            "const cannot be reassigned.",
            "Common types include string, number and boolean.",
            "Objects and arrays are important data structures."
          ],
          example:
            'let name = "Paras";\nconst age = 21;\nlet student = true;',
          tip:
            "Be prepared to explain var, let and const."
        },

        {
          title: "Conditions",
          content:
            "Conditional statements allow JavaScript programs to make decisions.",
          points: [
            "if executes code when a condition is true.",
            "else provides an alternative.",
            "else if handles additional conditions.",
            "Comparison operators are commonly used."
          ],
          example:
            'let marks = 75;\n\nif (marks >= 40) {\n  console.log("Pass");\n} else {\n  console.log("Fail");\n}',
          tip:
            "Know the difference between == and ===."
        },

        {
          title: "Functions",
          content:
            "Functions are reusable blocks of code that perform a particular task.",
          points: [
            "Functions reduce code duplication.",
            "Functions can accept parameters.",
            "Functions can return values.",
            "Arrow functions provide shorter syntax."
          ],
          example:
            'function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(10, 20));',
          tip:
            "Understand parameters, return values and scope."
        },

        {
          title: "Arrays and Objects",
          content:
            "Arrays store ordered collections while objects store key-value pairs.",
          points: [
            "Arrays use indexes.",
            "Objects use properties.",
            "Arrays support map, filter and reduce.",
            "Objects can represent real-world entities."
          ],
          example:
            'const student = {\n  name: "Paras",\n  age: 21\n};\n\nconst numbers = [10, 20, 30];',
          tip:
            "Practice map, filter and reduce."
        }
      ]
    },

    {
      id: 2,
      title: "React JS Complete Basics",
      category: "Programming",
      icon: "⚛️",
      duration: "40 min",
      level: "Beginner",
      description:
        "Learn React components, JSX, props, state and hooks.",

      externalTutorial: {
        name: "React Official Tutorial",
        description:
          "Free official React documentation and learning material.",
        url: "https://react.dev/learn"
      },

      lessons: [
        {
          title: "Introduction to React",
          content:
            "React is a JavaScript library for building user interfaces using reusable components.",
          points: [
            "React uses components.",
            "React applications commonly use JSX.",
            "Components are reusable.",
            "React updates the user interface efficiently."
          ],
          example:
            'function App() {\n  return <h1>Hello React</h1>;\n}',
          tip:
            "Understand why React uses reusable components."
        },

        {
          title: "Components and JSX",
          content:
            "Components are reusable UI building blocks and JSX allows HTML-like syntax inside JavaScript.",
          points: [
            "Components can be functional.",
            "JSX describes UI.",
            "Components normally return JSX.",
            "Components can be reused."
          ],
          example:
            'function Welcome() {\n  return <h2>Welcome to InterZen</h2>;\n}',
          tip:
            "Know the difference between JSX and HTML."
        },

        {
          title: "Props",
          content:
            "Props allow a parent component to pass information to a child component.",
          points: [
            "Props are read-only.",
            "Props make components reusable.",
            "Props are passed through attributes.",
            "Child components receive props."
          ],
          example:
            'function User({ name }) {\n  return <h2>Hello {name}</h2>;\n}',
          tip:
            "Understand props versus state."
        },

        {
          title: "State",
          content:
            "State stores information that can change during the lifetime of a component.",
          points: [
            "useState is commonly used for state.",
            "Updating state causes a re-render.",
            "State can control UI behavior.",
            "State should be updated using its setter."
          ],
          example:
            'const [count, setCount] = useState(0);',
          tip:
            "Understand how state updates cause re-rendering."
        },

        {
          title: "useEffect",
          content:
            "useEffect is used for side effects such as API calls and subscriptions.",
          points: [
            "useEffect runs after rendering.",
            "The dependency array controls execution.",
            "API calls can be made inside useEffect.",
            "Cleanup functions can prevent unwanted effects."
          ],
          example:
            'React.useEffect(() => {\n  console.log("Loaded");\n}, []);',
          tip:
            "Understand the dependency array."
        }
      ]
    },

    {
      id: 3,
      title: "Data Structures & Algorithms",
      category: "DSA",
      icon: "🧠",
      duration: "35 min",
      level: "Intermediate",
      description:
        "Learn arrays, stacks, queues, searching, sorting and complexity.",

      externalTutorial: {
        name: "GeeksforGeeks DSA",
        description:
          "Free DSA tutorials, examples and practice problems.",
        url: "https://www.geeksforgeeks.org/data-structures/"
      },

      lessons: [
        {
          title: "Introduction to Data Structures",
          content:
            "Data structures organize and store data so that it can be accessed efficiently.",
          points: [
            "Arrays store ordered data.",
            "Stacks follow LIFO.",
            "Queues follow FIFO.",
            "Linked lists contain connected nodes."
          ],
          example:
            'const numbers = [10, 20, 30, 40];',
          tip:
            "Understand why a particular data structure is selected."
        },

        {
          title: "Arrays",
          content:
            "Arrays store elements that can be accessed using indexes.",
          points: [
            "Array indexing normally starts from zero.",
            "Arrays support sequential access.",
            "Searching can be linear or binary.",
            "Insertion and deletion can be expensive."
          ],
          example:
            'const arr = [10, 20, 30];\nconsole.log(arr[1]);',
          tip:
            "Know basic array time complexity."
        },

        {
          title: "Stacks and Queues",
          content:
            "Stacks follow Last In First Out while queues follow First In First Out.",
          points: [
            "Stacks use push and pop.",
            "Queues use enqueue and dequeue.",
            "Stacks are useful for undo operations.",
            "Queues are useful for scheduling."
          ],
          example:
            'const stack = [];\nstack.push(10);\nstack.push(20);\nconsole.log(stack.pop());',
          tip:
            "Know real-world applications."
        },

        {
          title: "Searching",
          content:
            "Searching algorithms find a target value in a collection.",
          points: [
            "Linear search checks elements sequentially.",
            "Binary search requires sorted data.",
            "Binary search repeatedly divides the search range.",
            "Choosing the right algorithm improves performance."
          ],
          example:
            'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}',
          tip:
            "Know when binary search can be used."
        },

        {
          title: "Time Complexity",
          content:
            "Time complexity describes how algorithm running time changes as input size increases.",
          points: [
            "O(1) is constant time.",
            "O(n) is linear time.",
            "O(log n) is common in binary search.",
            "O(n²) commonly occurs with nested loops."
          ],
          example:
            'for (let i = 0; i < n; i++) {\n  console.log(i);\n}',
          tip:
            "Mention time and space complexity in interviews."
        }
      ]
    },

    {
      id: 4,
      title: "How to Crack HR Interviews",
      category: "HR Interview",
      icon: "👔",
      duration: "20 min",
      level: "Beginner",
      description:
        "Learn how to answer common HR questions and present yourself confidently.",

      externalTutorial: {
        name: "Indeed Career Guide",
        description:
          "Free interview preparation and career resources.",
        url: "https://www.indeed.com/career-advice/interviewing"
      },

      lessons: [
        {
          title: "Tell Me About Yourself",
          content:
            "The introduction is normally one of the first questions in an HR interview.",
          points: [
            "Start with education.",
            "Mention relevant skills.",
            "Mention projects or internships.",
            "Connect your background with the role."
          ],
          example:
            "Education → Skills → Project → Internship → Career Goal",
          tip:
            "Keep your introduction focused and relevant."
        },

        {
          title: "Strengths and Weaknesses",
          content:
            "Interviewers may ask about strengths and weaknesses to understand self-awareness.",
          points: [
            "Choose genuine strengths.",
            "Give supporting examples.",
            "Mention a manageable weakness.",
            "Explain how you are improving."
          ],
          example:
            "Strength: Problem solving\nWeakness: Public speaking\nAction: Regular practice",
          tip:
            "Do not say that you have no weaknesses."
        },

        {
          title: "Why Should We Hire You?",
          content:
            "This question allows you to connect your skills with the position.",
          points: [
            "Mention relevant skills.",
            "Discuss projects.",
            "Show willingness to learn.",
            "Explain how you can contribute."
          ],
          example:
            "Skills + Projects + Learning Ability + Contribution",
          tip:
            "Use evidence instead of unsupported claims."
        }
      ]
    },

    {
      id: 5,
      title: "Build a Strong Resume",
      category: "Resume",
      icon: "📄",
      duration: "18 min",
      level: "Beginner",
      description:
        "Learn how to create an effective and ATS-friendly resume.",

      externalTutorial: {
        name: "Canva Resume Guide",
        description:
          "Free resume-building resources and templates.",
        url: "https://www.canva.com/resumes/"
      },

      lessons: [
        {
          title: "Resume Structure",
          content:
            "A resume should clearly present education, skills, projects and experience.",
          points: [
            "Use clear sections.",
            "Keep formatting consistent.",
            "Prioritize relevant information.",
            "Avoid unnecessary information."
          ],
          example:
            "Name → Summary → Skills → Education → Projects → Experience",
          tip:
            "Keep the resume easy to scan."
        },

        {
          title: "Technical Skills",
          content:
            "Technical skills should match the jobs you are applying for.",
          points: [
            "Mention programming languages.",
            "Mention frameworks.",
            "Mention databases.",
            "Mention relevant tools."
          ],
          example:
            "JavaScript | React | Node.js | MongoDB | Git",
          tip:
            "Only list technologies you can explain in an interview."
        },

        {
          title: "ATS Optimization",
          content:
            "Applicant Tracking Systems can scan resumes for relevant keywords.",
          points: [
            "Use standard headings.",
            "Include job-related keywords.",
            "Avoid excessive graphics.",
            "Use readable formatting."
          ],
          example:
            "Job Description → Keywords → Relevant Resume Content",
          tip:
            "Make your resume readable by both software and humans."
        }
      ]
    },

    {
      id: 6,
      title: "AI & Machine Learning Basics",
      category: "AI/ML",
      icon: "🤖",
      duration: "30 min",
      level: "Intermediate",
      description:
        "Understand AI, machine learning, datasets, models and algorithms.",

      externalTutorial: {
        name: "Google Machine Learning Crash Course",
        description:
          "Free machine learning course from Google.",
        url: "https://developers.google.com/machine-learning/crash-course"
      },

      lessons: [
        {
          title: "Introduction to AI",
          content:
            "Artificial intelligence focuses on systems that perform tasks requiring aspects of human intelligence.",
          points: [
            "AI contains multiple subfields.",
            "Machine learning is a part of AI.",
            "AI can support prediction.",
            "AI can automate tasks."
          ],
          example:
            "Input Data → AI Model → Prediction",
          tip:
            "Know AI versus machine learning versus deep learning."
        },

        {
          title: "Machine Learning",
          content:
            "Machine learning allows systems to learn patterns from data.",
          points: [
            "Models learn from data.",
            "Training data builds models.",
            "Testing evaluates performance.",
            "Different algorithms solve different problems."
          ],
          example:
            "Training Data → Model → Testing → Prediction",
          tip:
            "Understand supervised and unsupervised learning."
        },

        {
          title: "Supervised Learning",
          content:
            "Supervised learning uses labeled data.",
          points: [
            "Classification predicts categories.",
            "Regression predicts numerical values.",
            "Training data contains labels.",
            "Models can be evaluated using metrics."
          ],
          example:
            "Email → Features → Model → Spam / Not Spam",
          tip:
            "Know examples of classification and regression."
        },

        {
          title: "Unsupervised Learning",
          content:
            "Unsupervised learning identifies patterns without predefined labels.",
          points: [
            "Clustering groups similar data.",
            "There are no predefined output labels.",
            "It can discover hidden patterns.",
            "K-means is a common algorithm."
          ],
          example:
            "Customer Data → Clustering → Customer Groups",
          tip:
            "Understand when labeled data is unavailable."
        }
      ]
    },

    {
      id: 7,
      title: "Cybersecurity Fundamentals",
      category: "Cybersecurity",
      icon: "🔐",
      duration: "28 min",
      level: "Beginner",
      description:
        "Learn cybersecurity fundamentals, threats, authentication and security practices.",

      externalTutorial: {
        name: "Cisco Introduction to Cybersecurity",
        description:
          "Free introductory cybersecurity learning material.",
        url: "https://www.netacad.com/courses/introduction-to-cybersecurity"
      },

      lessons: [
        {
          title: "Introduction to Cybersecurity",
          content:
            "Cybersecurity protects systems, networks and information from unauthorized access and attacks.",
          points: [
            "Confidentiality protects information.",
            "Integrity protects information from unauthorized modification.",
            "Availability keeps systems accessible."
          ],
          example:
            "CIA Triad → Confidentiality + Integrity + Availability",
          tip:
            "The CIA triad is a fundamental cybersecurity topic."
        },

        {
          title: "Common Cyber Threats",
          content:
            "Cyber threats target systems, applications and users.",
          points: [
            "Phishing targets users.",
            "Malware can compromise systems.",
            "Ransomware can encrypt data.",
            "Social engineering manipulates people."
          ],
          example:
            "Phishing Email → User Clicks Link → Credential Theft",
          tip:
            "Understand phishing, malware and social engineering."
        },

        {
          title: "Authentication and Authorization",
          content:
            "Authentication verifies identity while authorization determines what an authenticated user can access.",
          points: [
            "Passwords are authentication credentials.",
            "JWT can support authentication.",
            "Roles can control authorization.",
            "MFA improves account security."
          ],
          example:
            "Login → Authentication → JWT → Authorization",
          tip:
            "Know authentication versus authorization."
        },

        {
          title: "Web Application Security",
          content:
            "Web applications must protect user input, authentication systems and sensitive information.",
          points: [
            "Validate user input.",
            "Use secure authentication.",
            "Protect sensitive information.",
            "Prevent common attacks."
          ],
          example:
            "Browser → HTTPS → Express API → MongoDB",
          tip:
            "Understand SQL injection, XSS and CSRF conceptually."
        }
      ]
    },

    {
      id: 8,
      title: "Communication Skills for Interviews",
      category: "Communication",
      icon: "🎤",
      duration: "22 min",
      level: "Beginner",
      description:
        "Improve communication, confidence, body language and interview presentation.",

      externalTutorial: {
        name: "British Council LearnEnglish",
        description:
          "Free English communication and learning resources.",
        url: "https://learnenglish.britishcouncil.org/"
      },

      lessons: [
        {
          title: "Effective Communication",
          content:
            "Effective communication involves expressing ideas clearly while listening and responding appropriately.",
          points: [
            "Speak clearly.",
            "Use simple language.",
            "Listen carefully.",
            "Stay relevant."
          ],
          example:
            "Listen → Understand → Organize → Answer",
          tip:
            "Avoid unnecessarily complicated language."
        },

        {
          title: "Body Language",
          content:
            "Body language can influence how confidently a candidate presents themselves.",
          points: [
            "Maintain appropriate eye contact.",
            "Use good posture.",
            "Avoid distracting movements.",
            "Use natural facial expressions."
          ],
          example:
            "Eye Contact + Posture + Facial Expression",
          tip:
            "Practice interviews using InterZen Face-Cam Interview."
        },

        {
          title: "Speaking Confidence",
          content:
            "Confidence improves with preparation and repeated practice.",
          points: [
            "Prepare common questions.",
            "Practice speaking aloud.",
            "Record yourself.",
            "Review and improve."
          ],
          example:
            "Practice → Record → Review → Improve",
          tip:
            "Use the Voice Interview module for speaking practice."
        }
      ]
    },
{
id: 9,
title: "Python Basics",
category: "Programming",
icon: "🐍",
duration: "35 min",
level: "Beginner",
description:
"Learn Python fundamentals including syntax, variables, data types, conditions, loops and functions.",

externalTutorial: {
name: "Python Official Tutorial",
description:
"Free Python tutorial from the official Python documentation.",
url: "https://docs.python.org/3/tutorial/"
},

lessons: [
{
title: "Introduction to Python",
content:
"Python is a high-level, interpreted programming language known for its simple syntax and wide range of applications.",


  points: [
    "Python is easy to read and learn.",
    "Python uses indentation to define code blocks.",
    "Python is widely used in web development, automation and AI.",
    "Python programs are executed by the Python interpreter."
  ],

  example:
    'print("Hello, World!")',

  tip:
    "Understand Python syntax and how a basic Python program is executed."
},

{
  title: "Variables and Data Types",
  content:
    "Variables are used to store data in Python. Python automatically determines the data type of a value.",

  points: [
    "Variables store values.",
    "Python supports integers and floating-point numbers.",
    "Strings store text.",
    "Boolean values represent True or False."
  ],

  example:
    'name = "Paras"\nage = 21\nis_student = True',

  tip:
    "Learn the difference between int, float, string and boolean values."
},

{
  title: "Conditional Statements",
  content:
    "Conditional statements allow a Python program to make decisions based on conditions.",

  points: [
    "The if statement checks a condition.",
    "elif allows additional conditions.",
    "else executes when previous conditions are false.",
    "Comparison operators are commonly used with conditions."
  ],

  example:
    'age = 18\n\nif age >= 18:\n    print("Eligible")\nelse:\n    print("Not Eligible")',

  tip:
    "Remember that Python uses indentation instead of braces."
},

{
  title: "Loops",
  content:
    "Loops allow Python programs to repeatedly execute a block of code.",

  points: [
    "for loops are commonly used to iterate over sequences.",
    "while loops repeat while a condition remains true.",
    "The range() function is useful with for loops.",
    "break can stop a loop."
  ],

  example:
    'for i in range(1, 6):\n    print(i)',

  tip:
    "Practice for loops with range() before moving to while loops."
},

{
  title: "Functions",
  content:
    "Functions are reusable blocks of code that perform a specific task.",

  points: [
    "Functions are defined using the def keyword.",
    "Functions can accept parameters.",
    "Functions can return values.",
    "Functions reduce code repetition."
  ],

  example:
    'def add(a, b):\n    return a + b\n\nresult = add(10, 20)\nprint(result)',

  tip:
    "Understand parameters, return values and function calls."
}


]
},

    {
      id: 10,
      title: "Common Technical Interview Questions",
      category: "Technical",
      icon: "🧑‍💻",
      duration: "32 min",
      level: "Intermediate",
      description:
        "Practice frequently asked technical interview questions across important CS topics.",

      externalTutorial: {
        name: "GeeksforGeeks Interview Preparation",
        description:
          "Free technical interview preparation resources.",
        url: "https://www.geeksforgeeks.org/interview-preparation-for-software-developers/"
      },

      lessons: [
        {
          title: "Programming Fundamentals",
          content:
            "Programming fundamentals form the foundation of technical interviews.",
          points: [
            "Variables store data.",
            "Conditions control decisions.",
            "Loops repeat operations.",
            "Functions organize reusable logic."
          ],
          example:
            'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
          tip:
            "Be comfortable writing basic programs."
        },

        {
          title: "Object-Oriented Programming",
          content:
            "OOP organizes software around objects and classes.",
          points: [
            "Encapsulation hides implementation details.",
            "Inheritance supports reuse.",
            "Polymorphism supports different implementations.",
            "Abstraction focuses on essential behavior."
          ],
          example:
            'class Student {\n  constructor(name) {\n    this.name = name;\n  }\n}',
          tip:
            "Know the four major OOP concepts."
        },

        {
          title: "Database Concepts",
          content:
            "Databases store and manage application data.",
          points: [
            "SQL databases use tables.",
            "MongoDB is a document database.",
            "Indexes improve query performance.",
            "Database design affects performance."
          ],
          example:
            'users.find({ email: "student@example.com" });',
          tip:
            "Be able to explain why MongoDB is used in InterZen."
        },

        {
          title: "APIs and HTTP",
          content:
            "APIs allow different software systems to communicate.",
          points: [
            "GET retrieves data.",
            "POST creates data.",
            "PUT/PATCH updates data.",
            "DELETE removes data."
          ],
          example:
            'fetch("/api/progress/courses");',
          tip:
            "Know common HTTP status codes."
        }
      ]
    }
  ];

  /*
  ====================================================
  CATEGORIES
  ====================================================
  */

  const categories = [
    "All",
    "Programming",
    "DSA",
    "Technical",
    "HR Interview",
    "Resume",
    "AI/ML",
    "Cybersecurity",
    "Communication"
  ];

  /*
  ====================================================
  FILTER COURSES
  ====================================================
  */

  const filteredResources =
    category === "All"
      ? resources
      : resources.filter(
          (resource) =>
            resource.category === category
        );

  /*
  ====================================================
  LOAD OVERALL PROGRESS
  ====================================================
  */

  const loadOverallLearningProgress = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/progress/courses",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load learning progress"
        );
      }

      const courses =
        data.courses || [];

      if (courses.length === 0) {
        setOverallLearningProgress(0);
        return;
      }

      const totalProgress =
        courses.reduce(
          (total, course) =>
            total +
            Number(course.progress || 0),
          0
        );

      const averageProgress =
        Math.round(
          totalProgress /
            courses.length
        );

      setOverallLearningProgress(
        averageProgress
      );

    } catch (error) {
      console.error(
        "Overall Learning Progress Error:",
        error
      );
    }
  };

  /*
  ====================================================
  LOAD MY COURSES
  ====================================================
  */

  const loadMyCourses = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/progress/courses",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load enrolled courses"
        );
      }

      setMyCourses(
        data.courses || []
      );

    } catch (error) {
      console.error(
        "My Courses Error:",
        error
      );
    }
  };

  /*
  ====================================================
  INITIAL LOAD
  ====================================================
  */

  React.useEffect(() => {
    loadOverallLearningProgress();
    loadMyCourses();
  }, []);

  /*
  ====================================================
  OPEN COURSE
  ====================================================
  */

  const openCourse = async (resource) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setCourseMessage(
          "Please login first."
        );
        return;
      }

      setLoadingCourse(true);
      setCourseMessage("");

      /*
      IMPORTANT:
      resource.id is NUMBER.
      */

      setSelectedResource(resource);
      setCurrentLesson(0);
      setCompletedLessons([]);
      setCourseProgress(0);

      setShowInternalLessons(false);

      setQuizStarted(false);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizCurrentQuestion(0);
      setQuizScore(0);
      setQuizCompleted(false);

      const response =
        await fetch(
          "http://localhost:5000/api/progress/enroll",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              courseId: Number(resource.id),
              courseTitle:
                resource.title,
              category:
                resource.category,
              totalLessons:
                resource.lessons.length
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to open course"
        );
      }

      const savedCourse =
        data.course || {};

      const savedCompletedLessons =
        Array.isArray(
          savedCourse.completedLessons
        )
          ? savedCourse.completedLessons.map(
              Number
            )
          : [];

      setCompletedLessons(
        savedCompletedLessons
      );

      setCurrentLesson(
        Number(
          savedCourse.currentLesson || 0
        )
      );

      setCourseProgress(
        Number(
          savedCourse.progress || 0
        )
      );

      setQuizCompleted(
        savedCourse.quizCompleted === true
      );

      setQuizScore(
        Number(
          savedCourse.quizScore || 0
        )
      );
      setQuizTotalQuestions(
  Number(
    savedCourse.quizTotalQuestions || 0
  )
);

    } catch (error) {
      console.error(
        "Course Loading Error:",
        error
      );

      setCourseMessage(
        error.message ||
          "Unable to load course."
      );

    } finally {
      setLoadingCourse(false);
    }
  };

  /*
  ====================================================
  OPEN EXTERNAL TUTORIAL
  ====================================================
  */

  const openExternalTutorial = () => {
    if (
      selectedResource &&
      selectedResource.externalTutorial &&
      selectedResource.externalTutorial.url
    ) {
      window.open(
        selectedResource.externalTutorial.url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  /*
  ====================================================
  START INTERNAL LESSONS
  ====================================================
  */

  const startInternalLessons = () => {
    setShowInternalLessons(true);
    setCurrentLesson(0);
    setCourseMessage("");
  };

  /*
  ====================================================
  CHECK LESSON
  ====================================================
  */

  const isLessonCompleted = (
    lessonIndex
  ) => {
    return completedLessons.includes(
      Number(lessonIndex)
    );
  };

  /*
  ====================================================
  MARK LESSON COMPLETE
  ====================================================
  */

  const markLessonComplete = async () => {
    if (!selectedResource) {
      return;
    }

    try {
      setLoadingCourse(true);
      setCourseMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setCourseMessage(
          "Please login to continue."
        );
        return;
      }

      const response =
        await fetch(
          "http://localhost:5000/api/progress/lesson-complete",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              courseId:
                Number(selectedResource.id),

              lessonIndex:
                Number(currentLesson),

              totalLessons:
                selectedResource.lessons.length
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save lesson progress"
        );
      }

      const updatedCompletedLessons =
        data.course?.completedLessons || [];

      const updatedProgress =
        Number(
          data.course?.progress || 0
        );

      setCompletedLessons(
        updatedCompletedLessons.map(
          Number
        )
      );

      setCourseProgress(
        updatedProgress
      );

      if (
        updatedProgress === 100
      ) {
        setCourseMessage(
          "🎓 Congratulations! You completed all lessons."
        );
      } else {
        setCourseMessage(
          "✅ Lesson completed successfully!"
        );
      }

      await loadMyCourses();
      await loadOverallLearningProgress();

    } catch (error) {
      console.error(
        "Mark Lesson Complete Error:",
        error
      );

      setCourseMessage(
        error.message ||
          "Unable to save lesson progress."
      );

    } finally {
      setLoadingCourse(false);
    }
  };

  /*
  ====================================================
  LESSON NAVIGATION
  ====================================================
  */

  const selectLesson = (index) => {
    setCurrentLesson(index);
    setCourseMessage("");
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(
        currentLesson - 1
      );
      setCourseMessage("");
    }
  };

  const nextLesson = () => {
    if (
      selectedResource &&
      currentLesson <
        selectedResource.lessons.length - 1
    ) {
      setCurrentLesson(
        currentLesson + 1
      );
      setCourseMessage("");
    }
  };
/*
====================================================
DOWNLOAD COURSE CERTIFICATE
====================================================
*/

const downloadCertificate = async () => {
  try {
    if (!selectedResource) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setCourseMessage(
        "Please login to download your certificate."
      );
      return;
    }

    if (Number(courseProgress) !== 100) {
      setCourseMessage(
        "Please complete all course lessons first."
      );
      return;
    }

    if (!quizCompleted) {
      setCourseMessage(
        "Please complete the final quiz first."
      );
      return;
    }

    /*
    ==================================================
    USER
    ==================================================
    */

    const user = getUser();

    const studentName =
      user?.name ||
      user?.username ||
      "InterZen Student";

    /*
    ==================================================
    PDF SETUP
    ==================================================
    */

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    /*
    ==================================================
    ADD CERTIFICATE TEMPLATE
    ==================================================
    */

    pdf.addImage(
      certificateTemplate,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );

    /*
    ==================================================
    COMMON TEXT SETTINGS
    ==================================================
    */

    pdf.setTextColor(
      15,
      23,
      42
    );

    /*
    ==================================================
    1. STUDENT NAME
    ==================================================
    */

    pdf.setFont(
      "times",
      "bold"
    );

    pdf.setFontSize(25);

    pdf.text(
      studentName,
      pageWidth / 2,
      75.5,
      {
        align: "center"
      }
    );

    /*
    ==================================================
    2. COURSE NAME
    ==================================================
    */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(15);

    pdf.setTextColor(
      20,
      55,
      100
    );

    pdf.text(
      selectedResource.title,
      pageWidth / 2,
      98.5,
      {
        align: "center"
      }
    );

    /*
    ==================================================
    3. COURSE PROGRESS
    ==================================================
    */

    pdf.setFont(
      "times",
      "normal"
    );

    pdf.setFontSize(10.5);

    pdf.setTextColor(
      15,
      23,
      42
    );

    pdf.text(
      "Course Progress: 100% Completed",
      pageWidth / 2,
      110.5,
      {
        align: "center"
      }
    );

    /*
    ==================================================
    4. CENTER COMPLETION DATE
    ==================================================
    */

    const completionDate =
      new Date().toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "numeric",
          year: "numeric"
        }
      );

    pdf.setFont(
      "times",
      "normal"
    );

    pdf.setFontSize(15);

    pdf.text(
      `Completion Date: ${completionDate}`,
      pageWidth / 2,
      131.5,
      {
        align: "center"
      }
    );

    /*
    ==================================================
    5. BOTTOM-RIGHT DATE
    ==================================================
    */

    pdf.setFont(
      "times",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.text(
      completionDate,
      220,
      170,
      {
        align: "center"
      }
    );

    /*
    ==================================================
    6. DOWNLOAD
    ==================================================
    */

    const safeCourseName =
      selectedResource.title
        .replace(
          /[^a-z0-9]/gi,
          "_"
        );

    pdf.save(
      `InterZen_Certificate_${safeCourseName}.pdf`
    );

    setCourseMessage(
      "🎓 Certificate downloaded successfully!"
    );

  } catch (error) {

    console.error(
      "Certificate Download Error:",
      error
    );

    setCourseMessage(
      "Unable to generate certificate."
    );
  }
};
  /*
  ====================================================
  START AI QUIZ
  ====================================================
  */

  const startCourseQuiz = async () => {
    if (
      !selectedResource ||
      Number(courseProgress) !== 100
    ) {
      setCourseMessage(
        "Please complete all lessons before starting the final quiz."
      );
      return;
    }

    try {
      setQuizLoading(true);
      setCourseMessage("");

      const response =
        await fetch(
          "http://localhost:5000/api/internhelp",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              message: `
Create exactly 5 multiple-choice questions for the course "${selectedResource.title}".

Return ONLY valid JSON.

Format:
[
  {
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Exact correct option"
  }
]

Rules:
- Exactly 5 questions.
- Exactly 4 options per question.
- answer must exactly match one option.
- No markdown.
- No explanation.
- No extra text.
`
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to generate quiz"
        );
      }

      let rawReply =
        data.reply ||
        data.response ||
        data.message ||
        "";

      if (!rawReply) {
        throw new Error(
          "AI returned an empty quiz."
        );
      }

      rawReply =
        rawReply
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

      const startIndex =
        rawReply.indexOf("[");

      const endIndex =
        rawReply.lastIndexOf("]");

      if (
        startIndex === -1 ||
        endIndex === -1
      ) {
        throw new Error(
          "AI did not return valid quiz JSON."
        );
      }

      rawReply =
        rawReply.slice(
          startIndex,
          endIndex + 1
        );

      const parsedQuestions =
        JSON.parse(rawReply);

      if (
        !Array.isArray(
          parsedQuestions
        ) ||
        parsedQuestions.length !== 5
      ) {
        throw new Error(
          "AI did not generate exactly 5 questions."
        );
      }

      const valid =
        parsedQuestions.every(
          (question) =>
            question &&
            typeof question.question ===
              "string" &&
            Array.isArray(
              question.options
            ) &&
            question.options.length ===
              4 &&
            question.options.every(
              (option) =>
                typeof option ===
                  "string" &&
                option.trim() !== ""
            ) &&
            typeof question.answer ===
              "string" &&
            question.options.includes(
              question.answer
            )
        );

      if (!valid) {
        throw new Error(
          "AI returned an invalid quiz structure."
        );
      }

      setQuizQuestions(
        parsedQuestions
      );

      setQuizAnswers({});
      setQuizCurrentQuestion(0);
      setQuizScore(0);
      setQuizTotalQuestions(
  parsedQuestions.length
);
      setQuizCompleted(false);
      setQuizStarted(true);

    } catch (error) {
      console.error(
        "Course Quiz Error:",
        error
      );

      setCourseMessage(
        error.message ||
          "Unable to generate quiz."
      );

    } finally {
      setQuizLoading(false);
    }
  };

  /*
  ====================================================
  QUIZ FUNCTIONS
  ====================================================
  */

  const selectQuizAnswer = (
    answer
  ) => {
    setQuizAnswers(
      (previous) => ({
        ...previous,
        [quizCurrentQuestion]:
          answer
      })
    );
  };

  const nextQuizQuestion = () => {
    if (
      quizCurrentQuestion <
      quizQuestions.length - 1
    ) {
      setQuizCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  const previousQuizQuestion = () => {
    if (
      quizCurrentQuestion > 0
    ) {
      setQuizCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  /*
  ====================================================
  SUBMIT QUIZ
  ====================================================
  */

  const submitCourseQuiz = async () => {
    if (
      !selectedResource ||
      quizQuestions.length === 0
    ) {
      return;
    }

    try {
      setQuizLoading(true);

      let score = 0;

      quizQuestions.forEach(
        (question, index) => {
          if (
            quizAnswers[index] ===
            question.answer
          ) {
            score++;
          }
        }
      );

      const token =
        localStorage.getItem("token");

      if (!token) {
        setCourseMessage(
          "Please login to continue."
        );
        return;
      }

      const response =
        await fetch(
          "http://localhost:5000/api/progress/quiz-submit",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              courseId:
                Number(
                  selectedResource.id
                ),

              score,

              totalQuestions:
                quizQuestions.length
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save quiz result"
        );
      }

      setQuizScore(score);
      setQuizTotalQuestions(
  quizQuestions.length
);
      setQuizCompleted(true);
      setQuizStarted(false);

      setCourseMessage(
        `🎉 Quiz completed! Your score is ${
          data.quiz?.percentage ??
          Math.round(
            (score /
              quizQuestions.length) *
              100
          )
        }%.`
      );

      await loadMyCourses();
      await loadOverallLearningProgress();

    } catch (error) {
      console.error(
        "Submit Course Quiz Error:",
        error
      );

      setCourseMessage(
        error.message ||
          "Unable to save quiz result."
      );

    } finally {
      setQuizLoading(false);
    }
  };

  /*
  ====================================================
  COURSE DETAILS PAGE
  ====================================================
  */

  if (selectedResource) {
    const currentLessonData =
      selectedResource.lessons[
        currentLesson
      ] ||
      selectedResource.lessons[0];

    const isCompleted =
      isLessonCompleted(
        currentLesson
      );

    const isLastLesson =
      currentLesson ===
      selectedResource.lessons.length - 1;

    return (
      <div
        className="page-container learning-page"
      >

        {/* BACK */}

        <button
          className="resource-btn"
          onClick={() => {
            setSelectedResource(null);
            setShowInternalLessons(false);
            setCourseMessage("");
          }}
          style={{
            marginBottom: "20px"
          }}
        >
          ← Back to Learning Center
        </button>

        {/* COURSE HEADER */}

        <div className="career-result-card">

          <div
            className="resource-thumbnail"
            style={{
              marginBottom: "20px"
            }}
          >
            <span>
              {selectedResource.icon}
            </span>
          </div>

          <span className="resource-category">
            {selectedResource.category}
          </span>

          <h1>
            {selectedResource.title}
          </h1>

          <p>
            {selectedResource.description}
          </p>

          <div className="resource-meta">
            <span>
              ⏱️ {selectedResource.duration}
            </span>

            <span>
              📊 {selectedResource.level}
            </span>

            <span>
              📚{" "}
              {
                selectedResource.lessons.length
              } Lessons
            </span>
          </div>

          {/* PROGRESS */}

          <div
            style={{
              marginTop: "25px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px"
              }}
            >
              <strong>
                Course Progress
              </strong>

              <span>
                {courseProgress}%
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width:
                    `${courseProgress}%`,
                  height: "100%",
                  background:
                    "#6366f1",
                  borderRadius:
                    "20px",
                  transition:
                    "width 0.3s ease"
                }}
              />
            </div>
          </div>

        </div>

        {/* MESSAGE */}

        {courseMessage && (
          <div
            style={{
              marginTop: "15px",
              padding:
                "14px 18px",
              borderRadius: "10px",
              background:
                "#eff6ff",
              color:
                "#1d4ed8",
              border:
                "1px solid #bfdbfe"
            }}
          >
            {courseMessage}
          </div>
        )}

        {/* =================================================
            STEP 1 - EXTERNAL TUTORIAL
        ================================================= */}

        {!showInternalLessons && (
          <div
            className="career-result-card"
            style={{
              marginTop: "25px"
            }}
          >

            <div
              style={{
                textAlign: "center",
                padding: "20px"
              }}
            >

              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "10px"
                }}
              >
                🌐
              </div>

              <h2>
                Start With External Tutorial
              </h2>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                Before starting the InterZen
                lessons, learn the basics using
                this free external tutorial.
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "12px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5e7eb"
                }}
              >

                <h3>
                  {
                    selectedResource
                      .externalTutorial
                      .name
                  }
                </h3>

                <p>
                  {
                    selectedResource
                      .externalTutorial
                      .description
                  }
                </p>

                <button
                  onClick={
                    openExternalTutorial
                  }
                  style={{
                    padding:
                      "12px 22px",
                    border: "none",
                    borderRadius:
                      "8px",
                    background:
                      "#2563eb",
                    color:
                      "#ffffff",
                    cursor:
                      "pointer",
                    fontWeight:
                      "600"
                  }}
                >
                  🌐 Open Free Tutorial
                </button>

              </div>

              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  borderRadius: "10px",
                  background:
                    "#fefce8",
                  border:
                    "1px solid #fde68a",
                  color:
                    "#854d0e"
                }}
              >
                💡 After reviewing the
                external tutorial, come back here
                and start the InterZen lessons.
              </div>

              <button
                onClick={
                  startInternalLessons
                }
                style={{
                  marginTop: "20px",
                  padding:
                    "12px 24px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#16a34a",
                  color:
                    "#ffffff",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600"
                }}
              >
                📚 Start InterZen Lessons →
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            STEP 2 - INTERNAL LESSONS
        ================================================= */}

        {showInternalLessons && (
          <>
            <div
              className="career-result-card"
              style={{
                marginTop: "25px"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "15px",
                  flexWrap: "wrap"
                }}
              >

                <div>
                  <span className="dashboard-label">
                    INTERZEN INTERNAL LESSON
                  </span>

                  <h1>
                    Lesson{" "}
                    {currentLesson + 1}
                    {" "}of{" "}
                    {
                      selectedResource
                        .lessons.length
                    }
                  </h1>
                </div>

                <button
                  onClick={() =>
                    setShowInternalLessons(
                      false
                    )
                  }
                  className="resource-btn"
                >
                  ← External Tutorial
                </button>

              </div>

              <div
                style={{
                  marginTop: "25px",
                  padding: "25px",
                  borderRadius: "12px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5e7eb"
                }}
              >

                <h2>
                  📖{" "}
                  {
                    currentLessonData.title
                  }
                </h2>

                <p
                  style={{
                    marginTop: "15px",
                    lineHeight: "1.8"
                  }}
                >
                  {
                    currentLessonData.content
                  }
                </p>

                <h3
                  style={{
                    marginTop: "25px"
                  }}
                >
                  💡 Key Points
                </h3>

                <ul
                  style={{
                    lineHeight: "2"
                  }}
                >
                  {
                    currentLessonData.points.map(
                      (point, index) => (
                        <li
                          key={index}
                        >
                          {point}
                        </li>
                      )
                    )
                  }
                </ul>

                <h3
                  style={{
                    marginTop: "25px"
                  }}
                >
                  💻 Example
                </h3>

                <pre
                  style={{
                    marginTop: "10px",
                    padding: "18px",
                    borderRadius: "10px",
                    background:
                      "#111827",
                    color:
                      "#ffffff",
                    overflowX:
                      "auto",
                    whiteSpace:
                      "pre-wrap",
                    lineHeight:
                      "1.6"
                  }}
                >
                  {
                    currentLessonData.example
                  }
                </pre>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    borderRadius: "10px",
                    background:
                      "#eef2ff",
                    border:
                      "1px solid #c7d2fe"
                  }}
                >
                  <strong>
                    🎯 Interview Tip
                  </strong>

                  <p>
                    {
                      currentLessonData.tip
                    }
                  </p>
                </div>

              </div>

              {/* LESSON BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "25px"
                }}
              >

                <button
                  className="resource-btn"
                  onClick={
                    previousLesson
                  }
                  disabled={
                    currentLesson === 0
                  }
                >
                  ← Previous
                </button>

                {!isCompleted ? (
                  <button
                    className="primary-btn"
                    onClick={
                      markLessonComplete
                    }
                    disabled={
                      loadingCourse
                    }
                  >
                    {loadingCourse
                      ? "Saving..."
                      : "✓ Mark Lesson Complete"}
                  </button>
                ) : (
                  <button
                    className="primary-btn"
                    disabled
                  >
                    ✓ Lesson Completed
                  </button>
                )}

                <button
                  className="resource-btn"
                  onClick={
                    nextLesson
                  }
                  disabled={
                    isLastLesson
                  }
                >
                  Next →
                </button>

              </div>

            </div>

            {/* LESSON LIST */}

            <div
              className="career-result-card"
              style={{
                marginTop: "25px"
              }}
            >

              <h2>
                📚 Course Lessons
              </h2>

              <div
                className="recommended-modules"
                style={{
                  marginTop: "20px"
                }}
              >

                {
                  selectedResource.lessons.map(
                    (
                      lesson,
                      index
                    ) => {

                      const completed =
                        isLessonCompleted(
                          index
                        );

                      const current =
                        index ===
                        currentLesson;

                      return (
                        <div
                          key={index}
                          onClick={() =>
                            selectLesson(
                              index
                            )
                          }
                          className="recommended-module"
                          style={{
                            cursor:
                              "pointer",

                            border:
                              current
                                ? "2px solid #6366f1"
                                : "1px solid #e5e7eb",

                            background:
                              completed
                                ? "#f0fdf4"
                                : "#ffffff"
                          }}
                        >

                          <span
                            style={{
                              minWidth:
                                "40px",
                              height:
                                "40px",
                              borderRadius:
                                "50%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                completed
                                  ? "#dcfce7"
                                  : "#eef2ff",
                              color:
                                completed
                                  ? "#15803d"
                                  : "#4f46e5",
                              fontWeight:
                                "bold"
                            }}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </span>

                          <div>
                            <strong>
                              {
                                lesson.title
                              }
                            </strong>

                            <p
                              style={{
                                margin:
                                  "5px 0 0",
                                color:
                                  "#64748b"
                              }}
                            >
                              {completed
                                ? "Completed"
                                : current
                                ? "Currently learning"
                                : "Not completed"}
                            </p>
                          </div>

                        </div>
                      );
                    }
                  )
                }

              </div>

            </div>

            {/* =================================================
                FINAL QUIZ
            ================================================= */}

            {Number(courseProgress) === 100 && (
              <div
                className="career-result-card"
                style={{
                  marginTop: "25px"
                }}
              >

                {!quizStarted &&
                !quizCompleted ? (
                  <div
                    style={{
                      textAlign:
                        "center"
                    }}
                  >

                    <h2>
                      🎓 Course Lessons Completed!
                    </h2>

                    <p>
                      You have completed
                      all lessons.
                      Take the final AI quiz
                      to test your knowledge.
                    </p>

                    <button
                      onClick={
                        startCourseQuiz
                      }
                      disabled={
                        quizLoading
                      }
                      style={{
                        marginTop:
                          "15px",
                        padding:
                          "12px 22px",
                        border: "none",
                        borderRadius:
                          "8px",
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        cursor:
                          "pointer",
                        fontWeight:
                          "600"
                      }}
                    >
                      {quizLoading
                        ? "⏳ Generating Quiz..."
                        : "📝 Start Final Quiz"}
                    </button>

                  </div>
                ) : null}

                {/* QUIZ */}

                {quizStarted &&
                quizQuestions.length >
                  0 && (
                  <div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "20px"
                      }}
                    >

                      <h2>
                        📝 Final Course Quiz
                      </h2>

                      <span>
                        Question{" "}
                        {quizCurrentQuestion +
                          1}{" "}
                        /{" "}
                        {
                          quizQuestions.length
                        }
                      </span>

                    </div>

                    <div
                      style={{
                        height:
                          "8px",
                        background:
                          "#e5e7eb",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden",
                        marginBottom:
                          "25px"
                      }}
                    >
                      <div
                        style={{
                          width:
                            `${
                              ((quizCurrentQuestion +
                                1) /
                                quizQuestions.length) *
                              100
                            }%`,
                          height:
                            "100%",
                          background:
                            "#2563eb"
                        }}
                      />
                    </div>

                    <div
                      style={{
                        padding:
                          "20px",
                        borderRadius:
                          "12px",
                        background:
                          "#f8fafc"
                      }}
                    >

                      <h3>
                        {
                          quizQuestions[
                            quizCurrentQuestion
                          ].question
                        }
                      </h3>

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "12px",
                          marginTop:
                            "20px"
                        }}
                      >

                        {
                          quizQuestions[
                            quizCurrentQuestion
                          ].options.map(
                            (
                              option,
                              index
                            ) => {

                              const selected =
                                quizAnswers[
                                  quizCurrentQuestion
                                ] ===
                                option;

                              return (
                                <button
                                  key={
                                    index
                                  }
                                  onClick={() =>
                                    selectQuizAnswer(
                                      option
                                    )
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    padding:
                                      "14px",
                                    textAlign:
                                      "left",
                                    borderRadius:
                                      "10px",
                                    border:
                                      selected
                                        ? "2px solid #2563eb"
                                        : "1px solid #d1d5db",
                                    background:
                                      selected
                                        ? "#eff6ff"
                                        : "#ffffff",
                                    cursor:
                                      "pointer",
                                    fontWeight:
                                      selected
                                        ? "600"
                                        : "400"
                                  }}
                                >
                                  <strong>
                                    {String.fromCharCode(
                                      65 +
                                        index
                                    )}.
                                  </strong>{" "}
                                  {option}
                                </button>
                              );
                            }
                          )
                        }

                      </div>

                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        marginTop:
                          "20px"
                      }}
                    >

                      <button
                        onClick={
                          previousQuizQuestion
                        }
                        disabled={
                          quizCurrentQuestion ===
                          0
                        }
                        className="resource-btn"
                      >
                        ← Previous
                      </button>

                      {quizCurrentQuestion <
                      quizQuestions.length -
                        1 ? (
                        <button
                          onClick={
                            nextQuizQuestion
                          }
                          disabled={
                            quizAnswers[
                              quizCurrentQuestion
                            ] ===
                            undefined
                          }
                          className="primary-btn"
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          onClick={
                            submitCourseQuiz
                          }
                          disabled={
                            quizAnswers[
                              quizCurrentQuestion
                            ] ===
                            undefined ||
                            quizLoading
                          }
                          style={{
                            padding:
                              "10px 20px",
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            background:
                              "#16a34a",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600"
                          }}
                        >
                          {quizLoading
                            ? "Saving..."
                            : "✅ Submit Quiz"}
                        </button>
                      )}

                    </div>

                  </div>
                )}

                {/* QUIZ RESULT */}

{quizCompleted && (
  <div
    style={{
      textAlign: "center",
      padding: "20px"
    }}
  >

    <div
      style={{
        fontSize: "65px",
        marginBottom: "10px"
      }}
    >
      🎓
    </div>

    <h2>
      Course Completed!
    </h2>

    <p
      style={{
        color: "#64748b",
        lineHeight: "1.7",
        marginTop: "10px"
      }}
    >
      Congratulations! You have successfully
      completed the lessons and final quiz.
    </p>

    {/* SCORE */}

    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "12px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0"
      }}
    >

      <div
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#15803d"
        }}
      >
        {quizScore} / {quizQuestions.length}
      </div>

      <p
        style={{
          margin: "8px 0 0",
          color: "#166534"
        }}
      >
        Quiz Score:{" "}
        <strong>
          {quizQuestions.length > 0
            ? Math.round(
                (quizScore /
                  quizQuestions.length) *
                  100
              )
            : 0}
          %
        </strong>
      </p>

    </div>

    {/* CERTIFICATE */}

    <div
      style={{
        marginTop: "25px",
        padding: "25px",
        borderRadius: "12px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe"
      }}
    >

      <h3
        style={{
          marginBottom: "10px"
        }}
      >
        🎓 Your Certificate is Ready!
      </h3>

      <p
        style={{
          color: "#475569",
          lineHeight: "1.6"
        }}
      >
        You have successfully completed{" "}
        <strong>
          {selectedResource.title}
        </strong>
        .
        <br />
        Download your InterZen course certificate
        below.
      </p>

      <button
        onClick={downloadCertificate}
        style={{
          marginTop: "15px",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          background: "#10b981",
          color: "#ffffff",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "15px"
        }}
      >
        🎓 Download Certificate
      </button>

    </div>

    {/* RETAKE */}

    <button
      onClick={() => {
        setQuizStarted(false);
        setQuizCompleted(false);
        setQuizAnswers({});
        setQuizCurrentQuestion(0);
        setQuizScore(0);
      }}
      className="resource-btn"
      style={{
        marginTop: "20px"
      }}
    >
      🔄 Retake Quiz
    </button>

  </div>
)}

              </div>
            )}

          </>
        )}

      </div>
    );
  }

  /*
  ====================================================
  LEARNING CENTER
  ====================================================
  */

  return (
    <div
      className="page-container learning-page"
    >

      {/* HEADER */}

      <div className="learning-header">

        <p className="dashboard-label">
          LEARNING CENTER
        </p>

        <h1>
          Learn. Practice. Get Interview Ready. 🎓
        </h1>

        <p>
          Explore structured courses,
          free external tutorials and
          InterZen internal lessons.
        </p>

      </div>

      {/* MY COURSES */}

      {myCourses.length > 0 && (
        <section
          style={{
            marginBottom: "30px"
          }}
        >

          <h2>
            📚 My Courses
          </h2>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap:
                "20px",
              marginTop:
                "15px"
            }}
          >

            {myCourses.map(
              (course) => {

                /*
                IMPORTANT:
                Backend courseId is NUMBER.
                */

                const courseId =
                  Number(
                    course.courseId
                  );

                const resource =
                  resources.find(
                    (item) =>
                      Number(item.id) ===
                      courseId
                  );

                return (
                  <div
                    key={
                      course._id ||
                      course.courseId
                    }
                    style={{
                      padding:
                        "20px",
                      borderRadius:
                        "16px",
                      border:
                        "1px solid #ddd",
                      background:
                        "#fff",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.08)"
                    }}
                  >

                    <h3>
                      {
                        course.courseTitle
                      }
                    </h3>

                    <p
                      style={{
                        color:
                          "#666"
                      }}
                    >
                      {
                        course.category
                      }
                    </p>

                    <div
                      style={{
                        height:
                          "8px",
                        background:
                          "#eee",
                        borderRadius:
                          "10px",
                        overflow:
                          "hidden",
                        marginTop:
                          "12px"
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${Number(course.progress || 0)}%`,
                          height:
                            "100%",
                          background:
                            "#4f46e5"
                        }}
                      />

                    </div>

                    <strong>
                      {
                        Number(
                          course.progress ||
                            0
                        )
                      }%
                      {" "}completed
                    </strong>

                    <button
                      onClick={() => {

                        if (!resource) {
                          setCourseMessage(
                            "Course resource not found."
                          );
                          return;
                        }

                        openCourse(
                          resource
                        );
                      }}
                      style={{
                        width:
                          "100%",
                        marginTop:
                          "15px",
                        padding:
                          "10px",
                        border:
                          "none",
                        borderRadius:
                          "8px",
                        background:
                          "#4f46e5",
                        color:
                          "#fff",
                        cursor:
                          "pointer"
                      }}
                    >
                      Continue Course
                    </button>

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}

      {/* CATEGORIES */}

      <div
        className="learning-categories"
      >

        {categories.map(
          (item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() =>
                setCategory(
                  item
                )
              }
            >
              {item}
            </button>
          )
        )}

      </div>

      {/* RESULT INFORMATION */}

      <div
        className="learning-result-info"
      >

        <h2>
          {category === "All"
            ? "All Learning Resources"
            : `${category} Resources`}
        </h2>

        <span>
          {
            filteredResources.length
          } courses
        </span>

      </div>

      {/* COURSE GRID */}

      <div
        className="resource-grid"
      >

        {filteredResources.map(
          (resource) => (

            <div
              className="resource-card"
              key={
                resource.id
              }
            >

              <div
                className="resource-thumbnail"
              >

                <span>
                  {
                    resource.icon
                  }
                </span>

                <div
                  className="play-button"
                >
                  ▶
                </div>

              </div>

              <div
                className="resource-content"
              >

                <span
                  className="resource-category"
                >
                  {
                    resource.category
                  }
                </span>

                <h3>
                  {
                    resource.title
                  }
                </h3>

                <p>
                  {
                    resource.description
                  }
                </p>

                <div
                  className="resource-meta"
                >

                  <span>
                    ⏱️{" "}
                    {
                      resource.duration
                    }
                  </span>

                  <span>
                    📊{" "}
                    {
                      resource.level
                    }
                  </span>

                  <span>
                    📚{" "}
                    {
                      resource.lessons
                        .length
                    }
                  </span>

                </div>

                <button
                  className="resource-btn"
                  onClick={() =>
                    openCourse(
                      resource
                    )
                  }
                >
                  ▶ View Course
                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* OVERALL PROGRESS */}

      <div
        className="learning-progress-card"
      >

        <div>

          <p
            className="small-label"
          >
            YOUR LEARNING PROGRESS
          </p>

          <h2>
            Keep Learning 🚀
          </h2>

          <p>
            Complete learning resources
            to strengthen your interview
            preparation.
          </p>

        </div>

        <div
          className="learning-progress-circle"
        >

          <strong>
            {
              overallLearningProgress
            }%
          </strong>

          <span>
            Complete
          </span>

        </div>

      </div>

    </div>
  );
}



function PlacementReadiness() {
  const [score, setScore] = React.useState(0);
  const [readinessData, setReadinessData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const loadReadinessData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await apiRequest("/progress");

        const progress = data.progress || {};

        setReadinessData(progress);

        setScore(
          Math.min(
            100,
            Math.max(
              0,
              Number(progress.readinessScore) || 0
            )
          )
        );
      } catch (error) {
        console.error(
          "Readiness Data Error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load placement readiness data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReadinessData();
  }, []);

  /*
   * =========================================================
   * SKILL SCORES
   * =========================================================
   */

  const technicalScore = readinessData
    ? Math.min(
        100,
        Math.max(
          0,
          Number(readinessData.technicalScore) || 0
        )
      )
    : 0;

  const communicationScore = readinessData
    ? Math.min(
        100,
        Math.max(
          0,
          Number(readinessData.communicationScore) || 0
        )
      )
    : 0;

  const resumeScore = readinessData
    ? Math.min(
        100,
        Math.max(
          0,
          Number(readinessData.resumeScore) || 0
        )
      )
    : 0;

  /*
   * Coding score
   *
   * The backend currently provides codingProblems as
   * a count rather than a percentage.
   *
   * We convert completed coding problems into a
   * simple readiness percentage:
   *
   * 0 problems  = 0%
   * 1 problem   = 10%
   * ...
   * 10 problems = 100%
   */

  const codingProblems = readinessData
    ? Number(readinessData.codingProblems) || 0
    : 0;

  const codingScore = Math.min(
    100,
    codingProblems * 10
  );

  const skills = [
    {
      name: "Technical Interview",
      score: technicalScore,
      icon: "🧑‍💻"
    },
    {
      name: "Communication",
      score: communicationScore,
      icon: "🗣️"
    },
    {
      name: "Resume",
      score: resumeScore,
      icon: "📄"
    },
    {
      name: "Coding",
      score: codingScore,
      icon: "💻"
    }
  ];

  /*
   * =========================================================
   * READINESS STATUS
   * =========================================================
   */

  const getReadinessStatus = () => {
    if (score >= 80) {
      return {
        icon: "🟢",
        title: "Strong Preparation",
        description:
          "You are making strong progress toward placement readiness."
      };
    }

    if (score >= 60) {
      return {
        icon: "🟡",
        title: "Good Progress",
        description:
          "You have made good progress, but some areas need more practice."
      };
    }

    if (score >= 40) {
      return {
        icon: "🟠",
        title: "Needs More Practice",
        description:
          "Continue practicing interviews, coding and communication skills."
      };
    }

    return {
      icon: "🔴",
      title: "Getting Started",
      description:
        "Build your preparation gradually through interviews, coding and resume improvement."
    };
  };

  const readinessStatus =
    getReadinessStatus();

  /*
   * =========================================================
   * FIND NEXT IMPROVEMENT AREA
   * =========================================================
   */

  const getLowestSkill = () => {
    if (!skills.length) {
      return null;
    }

    return skills.reduce(
      (lowest, current) =>
        current.score < lowest.score
          ? current
          : lowest,
      skills[0]
    );
  };

  const lowestSkill =
    getLowestSkill();

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {
    return (
      <div className="page-container readiness-page">

        <div className="page-header">
          <span className="badge">
            Placement Readiness
          </span>

          <h1>
            Your Placement Readiness 🎯
          </h1>

          <p>
            Loading your preparation data...
          </p>
        </div>

        <div className="info-box">
          Loading placement readiness...
        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * MAIN PAGE
   * =========================================================
   */

  return (
    <div className="page-container readiness-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="readiness-header">

        <p className="dashboard-label">
          PLACEMENT READINESS
        </p>

        <h1>
          Your Placement Readiness 🎯
        </h1>

        <p>
          Track your interview preparation and
          build the skills needed for your career.
        </p>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorMessage && (
        <div
          className="error-box"
          style={{
            marginBottom: "20px"
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* =====================================================
          MAIN SCORE
      ===================================================== */}

      <section className="readiness-main-card">

        <div className="readiness-score-section">

          <div className="score-ring">

            <div className="score-ring-inner">

              <strong>
                {score}%
              </strong>

              <span>
                Ready
              </span>

            </div>

          </div>

          <div>

            <p className="small-label">
              OVERALL SCORE
            </p>

            <h2>
              Placement Readiness
            </h2>

            <p>
              {readinessStatus.description}
            </p>

            <div className="score-status">
              {readinessStatus.icon}{" "}
              {readinessStatus.title}
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SKILL PERFORMANCE
      ===================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Skill Performance 📊
            </h2>

            <p>
              Your performance across important
              placement preparation areas.
            </p>

          </div>

        </div>

        <div className="readiness-skill-grid">

          {skills.map(
            (skill, index) => (

              <div
                className="readiness-skill-card"
                key={index}
              >

                <div className="skill-card-top">

                  <div className="skill-icon">
                    {skill.icon}
                  </div>

                  <div>

                    <h3>
                      {skill.name}
                    </h3>

                    <span>
                      {skill.score}%
                    </span>

                  </div>

                </div>

                <div className="skill-progress-track">

                  <div
                    className="skill-progress-fill"
                    style={{
                      width:
                        skill.score + "%"
                    }}
                  />

                </div>

                <p>

                  {skill.score >= 80
                    ? "Strong performance"
                    : skill.score >= 60
                    ? "Needs more practice"
                    : "Needs improvement"}

                </p>

              </div>

            )
          )}

        </div>

      </section>

      {/* =====================================================
          NEXT IMPROVEMENT
      ===================================================== */}

      <section className="improvement-card">

        <div className="improvement-icon">
          🚀
        </div>

        <div>

          <p className="small-label">
            NEXT GOAL
          </p>

          <h2>
            Improve Your{" "}
            {lowestSkill
              ? lowestSkill.name
              : "Preparation"}
          </h2>

          <p>

            {lowestSkill
              ? `Your current ${lowestSkill.name.toLowerCase()} score is ${lowestSkill.score}%. Focus on this area to improve your overall placement readiness.`
              : "Continue practicing regularly to improve your placement readiness."}

          </p>

          <div className="improvement-progress">

            <div
              style={{
                width:
                  (lowestSkill
                    ? lowestSkill.score
                    : 0) + "%"
              }}
            />

          </div>

          <span>
            {lowestSkill
              ? `${lowestSkill.score} / 100`
              : "0 / 100"}
          </span>

        </div>

      </section>

      {/* =====================================================
          PREPARATION AREAS
      ===================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Preparation Areas 📚
            </h2>

            <p>
              Continue working on these areas
              throughout your placement preparation.
            </p>

          </div>

        </div>

        <div className="readiness-skill-grid">

          <div className="readiness-skill-card">

            <div className="skill-card-top">

              <div className="skill-icon">
                🧑‍💻
              </div>

              <div>

                <h3>
                  Technical Interviews
                </h3>

                <span>
                  Practice
                </span>

              </div>

            </div>

            <p>
              Practice technical questions and
              improve your ability to explain concepts
              clearly.
            </p>

          </div>

          <div className="readiness-skill-card">

            <div className="skill-card-top">

              <div className="skill-icon">
                🗣️
              </div>

              <div>

                <h3>
                  Communication
                </h3>

                <span>
                  Practice
                </span>

              </div>

            </div>

            <p>
              Improve how clearly and confidently
              you communicate your answers.
            </p>

          </div>

          <div className="readiness-skill-card">

            <div className="skill-card-top">

              <div className="skill-icon">
                📄
              </div>

              <div>

                <h3>
                  Resume
                </h3>

                <span>
                  Review
                </span>

              </div>

            </div>

            <p>
              Keep your resume updated and make sure
              your skills and projects are clearly presented.
            </p>

          </div>

          <div className="readiness-skill-card">

            <div className="skill-card-top">

              <div className="skill-icon">
                💻
              </div>

              <div>

                <h3>
                  Coding
                </h3>

                <span>
                  Practice
                </span>

              </div>

            </div>

            <p>
              Solve coding problems regularly to
              strengthen your problem-solving skills.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <div className="info-box">

        <strong>
          📊 How Placement Readiness Works
        </strong>

        <p>
          Your readiness score is based on the
          preparation data available in InterZen,
          including technical interview performance,
          communication, resume preparation and
          coding practice.
        </p>

      </div>

    </div>
  );
}


function Notifications() {
  const notifications = [
    {
      icon: "🎯",
      title: "Placement Readiness Updated",
      text: "Your current readiness score is 78%. Keep practicing to reach 90%.",
      time: "Today",
      unread: true
    },
    {
      icon: "🏆",
      title: "Achievement Unlocked",
      text: "You unlocked the Code Warrior achievement.",
      time: "Today",
      unread: true
    },
    {
      icon: "💻",
      title: "Coding Practice Reminder",
      text: "Try solving 2 coding problems today to improve your coding score.",
      time: "Yesterday",
      unread: false
    },
    {
      icon: "📄",
      title: "Resume Improvement",
      text: "Your resume score is 82%. Check the suggested improvements.",
      time: "2 days ago",
      unread: false
    },
    {
      icon: "🎤",
      title: "Interview Practice",
      text: "Complete a technical or HR interview to improve your readiness.",
      time: "3 days ago",
      unread: false
    },
    {
      icon: "📚",
      title: "New Learning Recommendation",
      text: "Practice JavaScript and React interview questions.",
      time: "4 days ago",
      unread: false
    }
  ];

  return (
    <div className="page-container notifications-page">

      <div className="notifications-header">
        <p className="dashboard-label">ACTIVITY CENTER</p>
        <h1>Notifications 🔔</h1>
        <p>
          Stay updated with your InterZen preparation journey.
        </p>
      </div>

      <div className="notification-summary">
        <div>
          <strong>2</strong>
          <span>Unread Notifications</span>
        </div>

        <div>
          <strong>6</strong>
          <span>Total Activities</span>
        </div>

        <div>
          <strong>🔥 5</strong>
          <span>Day Practice Streak</span>
        </div>
      </div>

      <section className="notification-list">

        {notifications.map((notification, index) => (

          <div
            className={
              notification.unread
                ? "notification-card unread"
                : "notification-card"
            }
            key={index}
          >

            <div className="notification-icon">
              {notification.icon}
            </div>

            <div className="notification-content">
              <div className="notification-title-row">
                <h3>{notification.title}</h3>

                {notification.unread && (
                  <span className="unread-dot"></span>
                )}
              </div>

              <p>{notification.text}</p>

              <span className="notification-time">
                {notification.time}
              </span>
            </div>

          </div>

        ))}

      </section>

    </div>
  );
}

function AdminPanel() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  /*
  ====================================================
  LOAD USERS
  ====================================================
  */

  const loadAdminUsers = async () => {
    try {
      setAdminUsersLoading(true);
      setAdminMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load users."
        );
      }

      setAdminUsers(data.users || []);

    } catch (error) {
      console.error(
        "Admin Users Error:",
        error
      );

      setAdminMessage(
        error.message ||
          "Unable to load users."
      );
    } finally {
      setAdminUsersLoading(false);
    }
  };

  /*
  ====================================================
  LOAD USERS WHEN ADMIN PANEL OPENS
  ====================================================
  */

  useEffect(() => {
    loadAdminUsers();
  }, []);

  /*
  ====================================================
  DELETE USER
  ====================================================
  */

  const deleteAdminUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setAdminMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete user."
        );
      }

      setAdminUsers((previousUsers) =>
        previousUsers.filter(
          (user) =>
            user._id !== userId
        )
      );

      setAdminMessage(
        "User deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      setAdminMessage(
        error.message ||
          "Unable to delete user."
      );
    }
  };

  /*
  ====================================================
  FILTER USERS
  ====================================================
  */

  const filteredAdminUsers =
    adminUsers.filter((user) => {
      const search =
        adminUserSearch
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        user.name
          ?.toLowerCase()
          .includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search) ||
        user.role
          ?.toLowerCase()
          .includes(search)
      );
    });

  /*
  ====================================================
  STATISTICS
  ====================================================
  */

  const stats = [
    {
      icon: "👥",
      value: adminUsers.length,
      label: "Registered Students",
    },
    {
      icon: "🎤",
      value: "342",
      label: "Interviews Completed",
    },
    {
      icon: "📄",
      value: "186",
      label: "Resume Analyses",
    },
    {
      icon: "💻",
      value: "524",
      label: "Coding Problems",
    },
  ];

  /*
  ====================================================
  RECENT ACTIVITIES
  ====================================================
  */

  const activities = [
    {
      student: "Demo Student",
      activity:
        "Completed Technical Interview",
      score: "82%",
      time: "Today",
    },
    {
      student: "Student 02",
      activity:
        "Resume Analysis",
      score: "76%",
      time: "Today",
    },
    {
      student: "Student 03",
      activity:
        "Coding Interview",
      score: "88%",
      time: "Yesterday",
    },
    {
      student: "Student 04",
      activity:
        "HR Interview",
      score: "79%",
      time: "Yesterday",
    },
  ];

  /*
  ====================================================
  RETURN
  ====================================================
  */

  return (
    <div className="page-container admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="admin-header">

        <div>

          <p className="dashboard-label">
            ADMIN PANEL
          </p>

          <h1>
            InterZen Administration 👨‍💼
          </h1>

          <p>
            Monitor platform activity,
            users and student progress.
          </p>

        </div>

        <div className="admin-status">
          🟢 System Online
        </div>

      </div>


      {/* ==================================================
          ADMIN MESSAGE
      ================================================== */}

      {adminMessage && (
        <div
          style={{
            marginTop: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            color: "#1d4ed8",
          }}
        >
          {adminMessage}
        </div>
      )}


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <section className="dashboard-section">

        <div className="admin-stats-grid">

          {stats.map(
            (stat, index) => (

              <div
                className="admin-stat-card"
                key={index}
              >

                <div
                  className="admin-stat-icon"
                >
                  {stat.icon}
                </div>

                <div>

                  <strong>
                    {stat.value}
                  </strong>

                  <p>
                    {stat.label}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          PLATFORM OVERVIEW
      ================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Platform Overview 📊
            </h2>

            <p>
              Current InterZen
              platform performance
            </p>

          </div>

        </div>


        <div className="admin-overview-grid">

          <div className="admin-overview-card">

            <span>
              Average Readiness
            </span>

            <strong>
              74%
            </strong>

            <div className="admin-progress">

              <div
                style={{
                  width: "74%",
                }}
              />

            </div>

          </div>


          <div className="admin-overview-card">

            <span>
              Interview Completion
            </span>

            <strong>
              81%
            </strong>

            <div className="admin-progress">

              <div
                style={{
                  width: "81%",
                }}
              />

            </div>

          </div>


          <div className="admin-overview-card">

            <span>
              Resume Completion
            </span>

            <strong>
              68%
            </strong>

            <div className="admin-progress">

              <div
                style={{
                  width: "68%",
                }}
              />

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          USER MANAGEMENT
      ================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              User Management 👥
            </h2>

            <p>
              View and manage registered
              InterZen users.
            </p>

          </div>

          <button
            onClick={loadAdminUsers}
            disabled={adminUsersLoading}
            style={{
              padding:
                "10px 16px",
              border: "none",
              borderRadius: "8px",
              background:
                "#4f46e5",
              color: "#ffffff",
              cursor:
                adminUsersLoading
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "600",
              opacity:
                adminUsersLoading
                  ? 0.6
                  : 1,
            }}
          >
            {adminUsersLoading
              ? "⏳ Loading..."
              : "🔄 Refresh Users"}
          </button>

        </div>


        {/* SEARCH */}

        <div
          style={{
            marginTop: "20px",
          }}
        >

          <input
            type="text"
            placeholder=
              "Search by name, email or role..."
            value={adminUserSearch}
            onChange={(event) =>
              setAdminUserSearch(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding:
                "12px 14px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
              boxSizing:
                "border-box",
            }}
          />

        </div>


        {/* USER TABLE */}

        <div
          className="admin-table-wrapper"
          style={{
            marginTop: "20px",
          }}
        >

          {adminUsersLoading ? (

            <div
              style={{
                padding: "40px",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              ⏳ Loading users...
            </div>

          ) : filteredAdminUsers.length === 0 ? (

            <div
              style={{
                padding: "40px",
                textAlign:
                  "center",
                color:
                  "#64748b",
              }}
            >
              👤 No users found.
            </div>

          ) : (

            <table
              className="admin-table"
            >

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Registered
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredAdminUsers.map(
                  (user) => (

                    <tr
                      key={user._id}
                    >

                      <td>
                        <strong>
                          {user.name ||
                            "N/A"}
                        </strong>
                      </td>


                      <td>
                        {user.email ||
                          "N/A"}
                      </td>


                      <td>

                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            background:
                              user.role ===
                              "admin"
                                ? "#fef3c7"
                                : "#dbeafe",
                            color:
                              user.role ===
                              "admin"
                                ? "#92400e"
                                : "#1d4ed8",
                            fontWeight:
                              "600",
                            fontSize:
                              "13px",
                          }}
                        >
                          {user.role ||
                            "student"}
                        </span>

                      </td>


                      <td>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>


                      <td>

                        {user.role ===
                        "admin" ? (

                          <span
                            style={{
                              color:
                                "#64748b",
                              fontSize:
                                "13px",
                            }}
                          >
                            🔒 Protected
                          </span>

                        ) : (

                          <button
                            onClick={() =>
                              deleteAdminUser(
                                user._id
                              )
                            }
                            style={{
                              padding:
                                "7px 12px",
                              border:
                                "none",
                              borderRadius:
                                "7px",
                              background:
                                "#dc2626",
                              color:
                                "#ffffff",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            🗑️ Delete
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* ==================================================
          RECENT ACTIVITY
      ================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Recent Student Activity 👥
            </h2>

            <p>
              Latest activities
              on the platform
            </p>

          </div>

        </div>


        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Activity
                </th>

                <th>
                  Score
                </th>

                <th>
                  Time
                </th>

              </tr>

            </thead>


            <tbody>

              {activities.map(
                (activity, index) => (

                  <tr key={index}>

                    <td>
                      <strong>
                        {activity.student}
                      </strong>
                    </td>

                    <td>
                      {activity.activity}
                    </td>

                    <td>

                      <span
                        className="admin-score"
                      >
                        {activity.score}
                      </span>

                    </td>

                    <td>
                      {activity.time}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ==================================================
          MODULE STATUS
      ================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Module Status ⚙️
            </h2>

            <p>
              Availability of
              InterZen modules
            </p>

          </div>

        </div>


        <div className="module-status-grid">

          {[
            "Authentication",
            "Resume Analyzer",
            "Question Generator",
            "Technical Interview",
            "HR Interview",
            "Coding Interview",
            "Voice Assistant",
            "Face Interview",
            "Group Discussion",
            "Career Guidance",
            "Learning Resources",
            "Placement Readiness",
          ].map(
            (module, index) => (

              <div
                className="module-status-card"
                key={index}
              >

                <span>
                  {module}
                </span>

                <strong>
                  ✓ Active
                </strong>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}


function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });

      setMessage(
        "Reset code generated. Check the backend terminal for the verification code."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        <p>
          Enter your registered email to generate a password reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Reset Code"}
          </button>
        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <p>
          <a href="/verify-email">
            Continue to verification
          </a>
        </p>
      </div>
    </div>
  );
}

function VerifyEmail() {
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email || !code) {
      setError("Please enter your email and verification code.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({
          email,
          code
        })
      });

      setMessage("Code verified successfully.");

      localStorage.setItem(
        "interzen_reset_email",
        email
      );

      localStorage.setItem(
        "interzen_reset_code",
        code
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Verify Reset Code</h2>

        <p>
          Enter the verification code sent for your account.
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {message && (
          <p>
            <a href="/reset-password">
              Continue to Reset Password
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function ResetPassword() {
  const [email, setEmail] = React.useState(
    localStorage.getItem("interzen_reset_email") || ""
  );

  const [code, setCode] = React.useState(
    localStorage.getItem("interzen_reset_code") || ""
  );

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email || !code || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
          newPassword
        })
      });

      setMessage(
        "Password reset successfully. You can now login with your new password."
      );

      localStorage.removeItem("interzen_reset_email");
      localStorage.removeItem("interzen_reset_code");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <p>
          Create a new password for your InterZen account.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {message && (
          <p>
            <a href="/login">
              Go to Login
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function EmailVerification() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState(
    localStorage.getItem(
      "interzen_verification_email"
    ) || ""
  );

  const [code, setCode] = React.useState("");

  const [message, setMessage] =
    React.useState("");

  const [error, setError] =
    React.useState("");

  const [loading, setLoading] =
    React.useState(false);

  const [resendLoading, setResendLoading] =
    React.useState(false);

  const [resendMessage, setResendMessage] =
    React.useState("");

  /*
    ==============================
    VERIFY EMAIL
    ==============================
  */

  const handleVerify = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResendMessage("");

    if (!email || !code) {
      setError(
        "Please enter your email and verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        "/auth/verify-email",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            code
          })
        }
      );

      /*
        Email verification successful.
      */

      setMessage(
        "Email verified successfully!"
      );

      // Remove verification email
      localStorage.removeItem(
        "interzen_verification_email"
      );

      // Make sure no old token remains
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userName");

      /*
        Give the user a moment to see
        the success message, then go to login.
      */

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(
        "Email Verification Error:",
        err
      );

      setError(
        err.message ||
        "Unable to verify email."
      );

    } finally {
      setLoading(false);
    }
  };

  /*
    ==============================
    RESEND VERIFICATION
    ==============================
  */

  const handleResend = async () => {

    setResendMessage("");
    setError("");

    if (!email) {
      setError(
        "Verification email is missing. Please register again."
      );
      return;
    }

    try {
      setResendLoading(true);

      await apiRequest(
        "/auth/resend-verification",
        {
          method: "POST",

          body: JSON.stringify({
            email
          })
        }
      );

      setResendMessage(
        "New verification code generated. Please check your email."
      );

      setCode("");

    } catch (err) {

      console.error(
        "Resend Verification Error:",
        err
      );

      /*
        If the account is already verified,
        do NOT show it as a serious error.
      */

      if (
        err.message &&
        err.message
          .toLowerCase()
          .includes("already verified")
      ) {

        localStorage.removeItem(
          "interzen_verification_email"
        );

        setResendMessage(
          "Your email is already verified. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1200);

      } else {

        setError(
          err.message ||
          "Unable to resend verification code."
        );

      }

    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          IZ
        </div>

        <h2>
          Verify Your Email
        </h2>

        <p>
          Enter the 6-digit verification
          code sent to your email address.
        </p>

        <form onSubmit={handleVerify}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            maxLength="6"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="primary-button full-width"
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={
              resendLoading ||
              loading
            }
            className="secondary-button full-width"
            style={{
              marginTop: "10px"
            }}
          >
            {resendLoading
              ? "Sending..."
              : "Resend Verification Code"}
          </button>

        </form>

        {resendMessage && (
          <p className="success-message">
            {resendMessage}
          </p>
        )}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {message && (
          <p>
            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="primary-button"
            >
              Go to Login
            </button>
          </p>
        )}

      </div>

    </div>
  );
}


function InterviewScheduling() {
  const [form, setForm] = React.useState({
    interviewType: "Technical Interview",
    date: "",
    time: "",
    notes: ""
  });

  const [scheduled, setScheduled] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const token = localStorage.getItem("token");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const loadScheduledInterviews = async () => {
    if (!token) {
      return;
    }

    try {
      const data = await apiRequest("/schedule", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setScheduled(
        data.interviews ||
        data.schedules ||
        data.data ||
        []
      );
    } catch (err) {
      console.error(
        "Load Scheduled Interviews Error:",
        err
      );
    }
  };

  React.useEffect(() => {
    loadScheduledInterviews();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Please login first to schedule an interview.");
      return;
    }

    if (!form.date || !form.time) {
      setError("Please select date and time.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewType: form.interviewType,
          date: form.date,
          time: form.time,
          notes: form.notes
        })
      });

      setMessage(
        data.message ||
        "Interview scheduled successfully!"
      );

      setForm({
        interviewType: "Technical Interview",
        date: "",
        time: "",
        notes: ""
      });

      await loadScheduledInterviews();

    } catch (err) {
      console.error(
        "Schedule Interview Error:",
        err
      );

      setError(
        err.message ||
        "Unable to schedule interview."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="badge">
            Interview Scheduling
          </span>

          <h1>
            Interview <span>Scheduling</span> 📅
          </h1>

          <p>
            Schedule and manage your practice interviews.
          </p>
        </div>

        <div className="info-box">
          Please login first to schedule an interview.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <span className="badge">
          Interview Scheduling
        </span>

        <h1>
          Interview <span>Scheduling</span> 📅
        </h1>

        <p>
          Schedule practice interviews and manage your
          upcoming interview sessions.
        </p>
      </div>

      <div className="schedule-grid">

        {/* Schedule Form */}
        <div className="schedule-card">

          <h2>
            📅 Schedule Practice Interview
          </h2>

          <p>
            Choose your interview type, date and time.
          </p>

          {message && (
            <div className="success-box">
              {message}
            </div>
          )}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>
              Interview Type
            </label>

            <select
              name="interviewType"
              value={form.interviewType}
              onChange={handleChange}
            >
              <option>
                Technical Interview
              </option>

              <option>
                HR Interview
              </option>

              <option>
                Coding Interview
              </option>

              <option>
                Mock Interview
              </option>

              <option>
                Group Discussion
              </option>
            </select>

            <label>
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              required
            />

            <label>
              Time
            </label>

            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />

            <label>
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add preparation notes..."
              rows="4"
            />

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Scheduling..."
                : "📅 Schedule Interview"}
            </button>

          </form>
        </div>


        {/* Upcoming Interviews */}
        <div className="schedule-card">

          <h2>
            🔔 Upcoming Interviews
          </h2>

          {scheduled.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                📅
              </div>

              <h3>
                No interviews scheduled
              </h3>

              <p>
                Schedule your first practice interview
                using the form.
              </p>
            </div>
          ) : (
            <div className="scheduled-list">

              {scheduled.map((item, index) => (

                <div
                  className="scheduled-item"
                  key={
                    item._id ||
                    item.id ||
                    index
                  }
                >

                  <div className="scheduled-header">

                    <h3>
                      {item.interviewType ||
                        item.type ||
                        "Practice Interview"}
                    </h3>

                    <span className="schedule-status">
                      Upcoming
                    </span>

                  </div>

                  <p>
                    📅{" "}
                    {item.date
                      ? new Date(
                          item.date
                        ).toLocaleDateString()
                      : "Date not available"}
                  </p>

                  <p>
                    ⏰{" "}
                    {item.time ||
                      "Time not available"}
                  </p>

                  {item.notes && (
                    <p>
                      📝 {item.notes}
                    </p>
                  )}

                </div>

              ))}

            </div>
          )}

        </div>

      </div>


      {/* Interview History */}
      <div className="schedule-card history-card">

        <h2>
          📋 Interview History
        </h2>

        <p>
          Your completed and scheduled interview
          activities will appear here.
        </p>

        <div className="history-info">

          <div>
            <strong>
              Practice Interviews
            </strong>

            <span>
              Track your interview practice.
            </span>
          </div>

          <div>
            <strong>
              Interview Progress
            </strong>

            <span>
              Review your preparation journey.
            </span>
          </div>

          <div>
            <strong>
              Future Sessions
            </strong>

            <span>
              Keep your upcoming interviews organized.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

function App() {
  return (
    <>
      <Styles />

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={<Auth mode="login" />}
          />

          <Route
            path="/register"
            element={<Auth mode="register" />}
          />
          <Route
            path="/admin"
            element={
             <ProtectedRoute>
               <AdminPanel />
             </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/schedule"
  element={
    <ProtectedRoute>
      <InterviewScheduling />
    </ProtectedRoute>
  }
/>

          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-verification"
            element={<EmailVerification />}
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
               <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <QuestionGenerator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPractice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview/technical"
            element={
              <ProtectedRoute>
                <TechnicalInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview/hr"
            element={
              <ProtectedRoute>
                <HRInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <CodingInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/internhelp"
            element={
              <ProtectedRoute>
                <InternHelp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/voice"
            element={
              <ProtectedRoute>
                <VoiceAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/face"
            element={
              <ProtectedRoute>
                <FaceInterview />
              </ProtectedRoute>
            }
          />
          <Route
  path="/emotion"
  element={
    <ProtectedRoute>
      <EmotionDetection />
    </ProtectedRoute>
  }
/>
          <Route
            path="/career"
            element={
             <ProtectedRoute>
                <CareerGuidance />
             </ProtectedRoute>
            }
          />
          <Route
            path="/group"
            element={
              <ProtectedRoute>
                <GroupDiscussion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/readiness"
            element={
              <ProtectedRoute>
                <PlacementReadiness />
              </ProtectedRoute>
            }
          />
          <Route
  path="/placement"
  element={
    <ProtectedRoute>
      <PlacementRecommendations />
    </ProtectedRoute>
  }
/>
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="/learning"
            element={
             <ProtectedRoute>
               <LearningResources />
             </ProtectedRoute>
            }
          />
          

          <Route path="/about" element={<About />} />

          <Route path="/contact" element={<Contact />} />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </>
  );
}

export default App;