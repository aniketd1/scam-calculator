import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { classifyScam } from "./classifier.js";
import { scamKB } from "./scamKB.js";
import { getResponse } from "./llm.js";
import { connectDB } from "./db.js";
import { User } from "./models/User.js";
import { AuthSession } from "./models/AuthSession.js";
import { VISUAL_PASSWORD_SENTENCES } from "./authData.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

await connectDB();

function buildSafetyPrompt(userText, context) {
  return `You are a scam safety assistant.\n\nUser message:\n${userText}\n\nContext:\n${context}\n\nSafety rules:\n- Use calm, caring, and professional language.\n- Clearly say whether it looks like a scam or not.\n- Explain the scam indicators gently.\n- Give practical safety advice and next steps.\n- If you are unsure, tell the user to verify and avoid sharing sensitive information.\n`;
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


const SESSION_TTL_MINUTES = 15;

function generateSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Helper: extract nouns from a sentence (mirrors client-side logic) ────────
const NOUN_SET = new Set([
  "teacher","doctor","farmer","student","child","engineer","driver","boy","girl",
  "school","hospital","house","university","park","field","road","ocean","mountain",
  "river","bus","train","car","laptop","mobile","tv","table","chair","bed","guitar",
  "drums","piano","cricket","football","tennis","apple","banana","mango","carrot",
  "rice","milk","bread","dog","cat","parrot","pigeon","sparrow","elephant",
  "sunflower","rose","spinach","eye","ear","hand","book","beach","lotus",
]);

function extractNouns(sentence) {
  const words = sentence.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  return [...new Set(words.filter(w => NOUN_SET.has(w)))];
}

// ── /auth/signup ─────────────────────────────────────────────────────────────
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, selectedSentence, lockerCodes } = req.body;
    // lockerCodes = { noun: "42", noun2: "7", … }  (plain numbers from client)

    if (!email || !password || !selectedSentence || !lockerCodes) {
      return res.status(400).json({
        success: false,
        error: "Email, password, sentence, and locker codes are all required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, error: "A user with that email already exists." });
    }

    if (!VISUAL_PASSWORD_SENTENCES.includes(selectedSentence)) {
      return res.status(400).json({ success: false, error: "Invalid sentence selection." });
    }

    const nouns = extractNouns(selectedSentence);

    // Validate that every noun has a code
    const missing = nouns.filter(n => !lockerCodes[n] || String(lockerCodes[n]).trim() === "");
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing locker code for: ${missing.join(", ")}`,
      });
    }

    // Hash each locker code individually
    const hashedLockers = {};
    for (const noun of nouns) {
      hashedLockers[noun] = await bcrypt.hash(String(lockerCodes[noun]), 10);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email: normalizedEmail,
      passwordHash,
      visualPasswordSentence: selectedSentence,
      nouns,                        // ordered list, e.g. ["teacher", "bus", "school"]
      lockerCodes: hashedLockers,   // { noun: "$2b$10$..." }
    });

    res.json({
      success: true,
      message: "Account created. Sign in and enter your locker codes to verify.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to create account." });
  }
});

// ── /auth/login ──────────────────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found. Please sign up first." });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Invalid password." });
    }

    if (!user.nouns || user.nouns.length === 0) {
      return res.status(400).json({ success: false, error: "No locker codes found. Please sign up again." });
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);
    await AuthSession.create({ sessionId, user: user._id, expiresAt });

    // Return the noun list — client renders images from these
    res.json({
      success: true,
      sessionId,
      nouns: user.nouns,   // ["teacher", "bus", "school"] — client maps these to images
      message: "Password accepted. Enter your locker codes to complete sign-in.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to sign in." });
  }
});

// ── /auth/verify ─────────────────────────────────────────────────────────────
app.post("/auth/verify", async (req, res) => {
  try {
    const { sessionId, lockerCodes } = req.body;
    // lockerCodes = { noun: "42", noun2: "7", … }  (plain numbers from client)

    if (!sessionId || !lockerCodes || typeof lockerCodes !== "object") {
      return res.status(400).json({ success: false, error: "Session ID and locker codes are required." });
    }

    const session = await AuthSession.findOne({ sessionId }).populate("user");
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: "Invalid or expired session. Please sign in again." });
    }

    const user = session.user;
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found for this session." });
    }

    // Check every noun's code against its stored hash
    const results = await Promise.all(
      user.nouns.map(async (noun) => {
        const submitted = String(lockerCodes[noun] || "");
        const storedHash = user.lockerCodes.get(noun);
        if (!storedHash) return false;
        return bcrypt.compare(submitted, storedHash);
      })
    );

    const allCorrect = results.every(Boolean);
    if (!allCorrect) {
      // Don't reveal which locker was wrong — generic error
      return res.status(403).json({
        success: false,
        error: "One or more locker codes are incorrect. Please try again.",
      });
    }

    session.stage = "verified";
    await session.save();

    res.json({ success: true, message: "All locker codes verified. Welcome back!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Unable to verify locker codes." });
  }
});

app.post("/chat", async (req, res) => {
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