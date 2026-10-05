const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const systemInstruction =
  "You are InternHelp, the AI assistant inside InterZen, an AI-powered interview preparation and career guidance platform. Help students with interview preparation, coding, programming, resumes, career guidance, placement preparation, projects, React, JavaScript, databases, DBMS and general computer science study questions. Give clear, practical and beginner-friendly answers. Keep answers reasonably concise and structured. Do not claim to perform actions that you cannot actually perform.";

async function generateWithModel(model, message) {
  return await ai.models.generateContent({
    model,
    contents: message,
    config: {
      systemInstruction
    }
  });
}

function isRetryableError(error) {
  const message = error?.message || "";

  return (
    error?.status === 429 ||
    error?.status === 503 ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("quota")
  );
}

function getRetrySeconds(error) {
  const message = error?.message || "";

  const match = message.match(
    /retryDelay["']?\s*:\s*["']?(\d+(?:\.\d+)?)s/i
  );

  if (match) {
    return Math.ceil(Number(match[1]));
  }

  return 3;
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    let response = null;
    let lastError = null;

    const models = [
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite"
    ];

    for (const model of models) {
      try {
        console.log(
          `InternHelp: Trying ${model}...`
        );

        response = await generateWithModel(
          model,
          message
        );

        if (response) {
          console.log(
            `InternHelp: ${model} response received.`
          );

          break;
        }
      } catch (error) {
        lastError = error;

        console.error(
          `${model} error:`,
          error.message
        );

        if (!isRetryableError(error)) {
          break;
        }

        const retrySeconds =
          getRetrySeconds(error);

        console.log(
          `${model} unavailable/rate-limited.`
        );

        console.log(
          `Retry information: ${retrySeconds}s`
        );
      }
    }

    if (!response) {
      const retrySeconds =
        getRetrySeconds(lastError);

      const lastMessage =
        lastError?.message || "";

      const isQuotaError =
        lastError?.status === 429 ||
        lastMessage.includes("429") ||
        lastMessage.includes(
          "RESOURCE_EXHAUSTED"
        ) ||
        lastMessage.includes("quota");

      if (isQuotaError) {
        return res.status(429).json({
          message:
            `InternHelp AI is temporarily rate-limited. Please wait about ${retrySeconds} seconds and try again.`
        });
      }

      return res.status(503).json({
        message:
          "InternHelp AI is temporarily unavailable. Please try again in a moment."
      });
    }

    const reply = response.text;

    if (!reply || !reply.trim()) {
      return res.status(503).json({
        message:
          "InternHelp returned an empty response. Please try again."
      });
    }

    return res.json({
      reply
    });

  } catch (error) {
    console.error(
      "InternHelp Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to process InternHelp request"
    });
  }
});

module.exports = router;