import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
  "neutral",
];

const EMOTION_LABELS = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  fearful: "Fearful",
  disgusted: "Disgusted",
  surprised: "Surprised",
  neutral: "Neutral",
};

function EmotionDetection() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [emotionScores, setEmotionScores] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0,
  });

  const [emotionCounts, setEmotionCounts] = useState({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0,
  });

  const [totalSamples, setTotalSamples] = useState(0);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setCameraError("");

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");

        setModelsLoaded(true);
      } catch (error) {
        console.error("Model loading error:", error);

        setCameraError(
          "Unable to load emotion detection models. Please check the files inside frontend/public/models."
        );
      }
    };

    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraError("");

      if (!modelsLoaded) {
        setCameraError("Please wait until the emotion models are loaded.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false,
});

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        setCameraStarted(true);
      }
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Camera permission was denied or the camera is unavailable. Please allow camera access and try again."
      );
    }
  };

  // Stop webcam
  const stopCamera = () => {
    stopDetection();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  };

  // Start emotion detection
  const startDetection = () => {
    if (!cameraStarted || !videoRef.current) {
      setCameraError("Please start the camera first.");
      return;
    }

    if (detecting) {
      return;
    }

    setDetecting(true);

    detectionIntervalRef.current = setInterval(async () => {
      try {
        if (!videoRef.current) {
          return;
        }

        if (videoRef.current.readyState < 2) {
          return;
        }

        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.5,
            })
          )
          .withFaceExpressions();

        if (!detection) {
          return;
        }

        const expressions = detection.expressions;

        let dominantEmotion = "neutral";
        let highestScore = 0;

        EMOTIONS.forEach((emotion) => {
          const score = expressions[emotion] || 0;

          if (score > highestScore) {
            highestScore = score;
            dominantEmotion = emotion;
          }
        });

        setCurrentEmotion(dominantEmotion);

        setEmotionScores({
          happy: expressions.happy || 0,
          sad: expressions.sad || 0,
          angry: expressions.angry || 0,
          fearful: expressions.fearful || 0,
          disgusted: expressions.disgusted || 0,
          surprised: expressions.surprised || 0,
          neutral: expressions.neutral || 0,
        });

        setEmotionCounts((previous) => ({
          ...previous,
          [dominantEmotion]: previous[dominantEmotion] + 1,
        }));

        setTotalSamples((previous) => previous + 1);
      } catch (error) {
        console.error("Emotion detection error:", error);
      }
    }, 700);
  };

  // Stop emotion detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    setDetecting(false);
  };

  // Calculate emotion percentage
  const getEmotionPercentage = (emotion) => {
    if (totalSamples === 0) {
      return 0;
    }

    return Math.round((emotionCounts[emotion] / totalSamples) * 100);
  };

  // Reset statistics
  const resetResults = () => {
    setCurrentEmotion("neutral");

    setEmotionScores({
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      neutral: 0,
    });

    setEmotionCounts({
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
      neutral: 0,
    });

    setTotalSamples(0);
  };

  // Get dominant emotion from collected samples
  const getOverallEmotion = () => {
    if (totalSamples === 0) {
      return "No data";
    }

    let dominantEmotion = "neutral";
    let highestCount = 0;

    EMOTIONS.forEach((emotion) => {
      if (emotionCounts[emotion] > highestCount) {
        highestCount = emotionCounts[emotion];
        dominantEmotion = emotion;
      }
    });

    return EMOTION_LABELS[dominantEmotion];
  };

  // Interview-focused analysis
  const getInterviewAnalysis = () => {
    if (totalSamples === 0) {
      return "Start emotion detection during your interview practice to receive an analysis.";
    }

    const happy = getEmotionPercentage("happy");
    const neutral = getEmotionPercentage("neutral");
    const surprised = getEmotionPercentage("surprised");
    const fearful = getEmotionPercentage("fearful");
    const angry = getEmotionPercentage("angry");
    const sad = getEmotionPercentage("sad");

    if (fearful >= 30) {
      return "The detection shows a noticeable amount of fearful expression. Try slow breathing, pause briefly before answering, and practice common interview questions.";
    }

    if (angry >= 30) {
      return "The detection shows a noticeable amount of angry expression. Try maintaining a relaxed facial expression and a calm speaking style during interviews.";
    }

    if (sad >= 30) {
      return "The detection shows a noticeable amount of sad expression. Practice maintaining an attentive and confident facial expression while answering.";
    }

    if (happy >= 35) {
      return "The detection shows frequent happy expressions. Continue maintaining positive facial engagement while keeping your expressions professional.";
    }

    if (surprised >= 30) {
      return "The detection shows frequent surprised expressions. Practice unexpected interview questions so you can remain composed when faced with unfamiliar questions.";
    }

    if (neutral >= 50) {
      return "The detection shows mostly neutral expressions. This can indicate a composed appearance, but practice adding natural facial engagement when appropriate.";
    }

    return "Your detected expressions show a mixed pattern. Continue practicing interview questions while focusing on calm, natural and professional facial expressions.";
  };

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div className="emotion-page">
      <div className="emotion-container">
        <div className="emotion-header">
          <h1>🎭 Emotion Detection</h1>

          <p>
            Analyze your facial expressions during interview practice using
            your webcam.
          </p>
        </div>

        <div className="emotion-status">
          <span
            className={`status-dot ${
              modelsLoaded ? "status-ready" : "status-loading"
            }`}
          ></span>

          {modelsLoaded
            ? "Emotion models loaded"
            : "Loading emotion models..."}
        </div>

        {cameraError && (
          <div className="emotion-error">
            {cameraError}
          </div>
        )}

        <div className="emotion-main-grid">
          {/* Camera */}
          <div className="emotion-card camera-card">
            <h2>📷 Camera</h2>

            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              ></video>

              {!cameraStarted && (
                <div className="video-placeholder">
                  <div className="camera-icon">📷</div>
                  <p>Camera is currently off</p>
                </div>
              )}
            </div>

            <div className="emotion-buttons">
              {!cameraStarted ? (
                <button
                  className="emotion-btn primary"
                  onClick={startCamera}
                  disabled={!modelsLoaded}
                >
                  ▶ Start Camera
                </button>
              ) : (
                <button
                  className="emotion-btn danger"
                  onClick={stopCamera}
                >
                  ⏹ Stop Camera
                </button>
              )}

              {!detecting ? (
                <button
                  className="emotion-btn success"
                  onClick={startDetection}
                  disabled={!cameraStarted}
                >
                  🎭 Start Detection
                </button>
              ) : (
                <button
                  className="emotion-btn warning"
                  onClick={stopDetection}
                >
                  ⏸ Stop Detection
                </button>
              )}

              <button
                className="emotion-btn secondary"
                onClick={resetResults}
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Current emotion */}
          <div className="emotion-card current-emotion-card">
            <h2>Current Emotion</h2>

            <div className="current-emotion">
              <div className="emotion-emoji">
                {currentEmotion === "happy" && "😊"}
                {currentEmotion === "sad" && "😢"}
                {currentEmotion === "angry" && "😡"}
                {currentEmotion === "fearful" && "😨"}
                {currentEmotion === "disgusted" && "🤢"}
                {currentEmotion === "surprised" && "😲"}
                {currentEmotion === "neutral" && "😐"}
              </div>

              <h3>
                {EMOTION_LABELS[currentEmotion] || "Neutral"}
              </h3>

              <p>
                Detection confidence:{" "}
                {Math.round((emotionScores[currentEmotion] || 0) * 100)}%
              </p>
            </div>

            <div className="overall-emotion">
              <span>Overall detected emotion</span>
              <strong>{getOverallEmotion()}</strong>
            </div>
          </div>
        </div>

        {/* Emotion scores */}
        <div className="emotion-card">
          <h2>📊 Live Emotion Scores</h2>

          <div className="emotion-score-list">
            {EMOTIONS.map((emotion) => {
              const percentage = Math.round(
                (emotionScores[emotion] || 0) * 100
              );

              return (
                <div className="emotion-score-item" key={emotion}>
                  <div className="emotion-score-header">
                    <span>{EMOTION_LABELS[emotion]}</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div className="emotion-progress">
                    <div
                      className="emotion-progress-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="emotion-card">
          <h2>📈 Emotion Statistics</h2>

          <div className="emotion-stat-grid">
            {EMOTIONS.map((emotion) => (
              <div className="emotion-stat" key={emotion}>
                <span>{EMOTION_LABELS[emotion]}</span>

                <strong>
                  {getEmotionPercentage(emotion)}%
                </strong>
              </div>
            ))}
          </div>

          <div className="sample-count">
            Samples analyzed: <strong>{totalSamples}</strong>
          </div>
        </div>

        {/* Interview analysis */}
        <div className="emotion-card analysis-card">
          <h2>📝 Interview-Focused Analysis</h2>

          <p>{getInterviewAnalysis()}</p>

          <div className="analysis-tips">
            <h3>Interview Tips</h3>

            <ul>
              <li>Maintain a relaxed facial expression.</li>
              <li>Look toward the camera while answering.</li>
              <li>Practice difficult questions before interviews.</li>
              <li>Take a short pause instead of reacting suddenly.</li>
              <li>Keep your expressions natural and professional.</li>
            </ul>
          </div>
        </div>

        <div className="emotion-disclaimer">
          <strong>Note:</strong> Emotion detection is an experimental
          interview-practice feature. Facial-expression predictions are
          estimates and should not be treated as a definitive measurement
          of a person's actual emotional state.
        </div>
      </div>
    </div>
  );
}

export default EmotionDetection;