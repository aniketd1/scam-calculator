import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { classifyScam } from "./classifier.js";
import { scamKB } from "./scamKB.js";
import { getResponse } from "./llm.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import app from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
connectDB();

function buildSafetyPrompt(userText, context) {
  return `You are a scam safety assistant.\n\nUser message:\n${userText}\n\nContext:\n${context}\n\nSafety rules:\n- Use calm, caring, and professional language.\n- Clearly say whether it looks like a scam or not.\n- Explain the scam indicators gently.\n- Give practical safety advice and next steps.\n- If you are unsure, tell the user to verify and avoid sharing sensitive information.\n`;
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Scam2Safe API Running"
  });
});
app.post("/Home", async (req, res) => {
  try {
    const userText = req.body.message;

    const agent = req.body.agent || "eleven";

    // 1. classify scam category
    const category = classifyScam(userText);

    // 2. generate response using only relevant context
    const reply = await getResponse(userText, category, agent);

    res.json({
      agent,
      category,
      reply
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Something went wrong. Please try again."
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

// Streamed chat using Server-Sent Events (EventSource on client)
app.get("/chat/stream", async (req, res) => {
  const userText = req.query.message || "";
  const agent = req.query.agent || process.env.ELEVEN_AGENT_ID || "eleven";

  // classify and build prompt with KB context
  const category = classifyScam(userText);
  const context = scamKB[category] || scamKB.general;
  const prompt = buildSafetyPrompt(userText, context);

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // If Eleven agent streaming endpoint is available, proxy its stream
  const elevenApiKey = process.env.ELEVEN_API_KEY || process.env.API_KEY;
  const elevenEndpoint = process.env.ELEVEN_AGENT_URL || process.env.LLM_URL;
  const elevenAgentId = process.env.ELEVEN_AGENT_ID || process.env.AGENT_ID;
  const canStreamEleven = Boolean(elevenApiKey && elevenEndpoint && elevenAgentId && elevenEndpoint.includes("elevenlabs.io"));

  if (canStreamEleven) {
    try {
      let upstream = await fetch(elevenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenApiKey
        },
        body: JSON.stringify({
          agent_id: elevenAgentId,
          text: prompt,
          stream: true
        })
      });

      if (upstream.status === 404 && elevenEndpoint.includes("elevenlabs.io")) {
        const fallbackUrl = `https://api.elevenlabs.io/v1/agents/${elevenAgentId}/chat`;
        upstream = await fetch(fallbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenApiKey
          },
          body: JSON.stringify({
            agent_id: elevenAgentId,
            text: prompt,
            stream: true
          })
        });
      }

      if (!upstream.body) {
        res.write(`data: ${JSON.stringify({ error: 'no upstream body' })}\n\n`);
        return res.end();
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // send chunk as SSE
        res.write(`data: ${chunk.replace(/\n/g, "\ndata: ")}\n\n`);
      }

      res.write(`event: done\ndata: [DONE]\n\n`);
      res.end();

    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }

    return;
  }

  // Fallback non-streaming: call generic LLM and send the full reply as one SSE message
  try {
    const reply = await getResponse(userText, category, agent);
    res.write(`data: ${JSON.stringify({ agent, category, reply })}\n\n`);
    res.write(`event: done\ndata: [DONE]\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// TTS proxy endpoint: returns audio stream from ElevenLabs TTS
app.post("/tts", async (req, res) => {
  try {
    const text = req.body.text || "";
    const voice = req.body.voice || process.env.ELEVEN_TTS_VOICE;

    if (!process.env.ELEVEN_API_KEY || !voice) {
      return res.status(400).json({ error: "TTS not configured on server" });
    }

    const ttsUrl = process.env.ELEVEN_TTS_URL || `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`;

    const upstream = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_API_KEY
      },
      body: JSON.stringify({ text })
    });

    // Forward upstream audio stream headers
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
    if (!upstream.body) return res.status(500).end();

    upstream.body.pipe(res);
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: err.message });
  }
});