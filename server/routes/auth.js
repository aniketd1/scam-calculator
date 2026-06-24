// routes/auth.js — ESM
import express from "express";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";
import crypto  from "crypto";
import User        from "../models/User.js";
import LoginSession from "../models/LoginSession.js";
import { SENTENCES } from "../data/sentences.js";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const router = express.Router();

/* ── CONSTANTS ──────────────────────────────────────────────── */
const POSITIONS  = ["A","B","C","D","E"];
const GRID_SIZE  = 12;

const NOUN_WORDS = new Set([
  "boy","girl","dog","cat","bird","monkey","farmer","teacher","child","baby",
  "rabbit","chef","driver","ball","toy","stick","doll","dress","bone","mouse",
  "milk","nest","egg","banana","tree","seed","crops","tractor","book","chart",
  "house","flower","picture","rattle","bicycle","bell","park","rose","basket",
  "carrot","log","burrow","car","road","market","door","room","bag","box",
  "wall","plant","soil","field","clouds","letter","paper","spoon","cup",
  "table","kitchen","blocks","model","star","garden","kite","bucket",
  "vegetables","dinner","lesson","rope","question","answer","bell",
]);

function extractNouns(sentence) {
  return [...new Set(
    sentence.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
      .filter(w => w && NOUN_WORDS.has(w))
  )];
}

function generateChallengeGrid(secretNouns) {
  const secrets      = [...new Set(secretNouns.filter(Boolean))];
  const chosenSecret = secrets[Math.floor(Math.random() * secrets.length)];
  const distractors  = [...NOUN_WORDS]
    .filter(n => !secrets.includes(n))
    .sort(() => Math.random() - 0.5)
    .slice(0, GRID_SIZE - 1);
  const challengeGrid = [chosenSecret, ...distractors]
    .sort(() => Math.random() - 0.5)
    .map(noun => ({ noun, value: Math.floor(Math.random() * 90) + 10 }));
  return { challengeGrid, chosenSecret };
}

function buildRegister(secretValue, offset, secretPositions) {
  const result = (secretValue + offset) % 100;
  const d1 = Math.floor(result / 10);
  const d2 = result % 10;
  const reg = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
  reg[POSITIONS.indexOf(secretPositions[0])] = d1;
  reg[POSITIONS.indexOf(secretPositions[1])] = d2;
  return { register: reg, d1, d2 };
}

async function createLoginSession(userId, secretNouns) {
  const { challengeGrid, chosenSecret } = generateChallengeGrid(secretNouns);
  const revealedItem = challengeGrid.find(i => i.noun === chosenSecret);
  const sessionId = crypto.randomUUID();
  await LoginSession.create({
    sessionId, userId, challengeGrid,
    revealedItem: { noun: revealedItem.noun, value: revealedItem.value },
    register: null, expectedD1: null, expectedD2: null,
    attempts: 0,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  return { sessionId, challengeGrid };
}

/* ── GET /api/auth/sentences ────────────────────────────────── */
router.get("/sentences", (_req, res) => {
  res.json({ success: true, sentences: SENTENCES });
});

/* ── POST /api/auth/signup ──────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, wordpressSite, wordpressUsername,
            selectedSentence, secretPositions, offset } = req.body;

    if (!email || !password || !selectedSentence || !secretPositions || offset == null)
      return res.status(400).json({ success: false, error: "All fields are required." });
    if (!Array.isArray(secretPositions) || secretPositions.length !== 2)
      return res.status(400).json({ success: false, error: "Exactly 2 positions required." });
    if (secretPositions[0] === secretPositions[1])
      return res.status(400).json({ success: false, error: "Positions must be different." });
    for (const p of secretPositions)
      if (!POSITIONS.includes(p))
        return res.status(400).json({ success: false, error: `Invalid position: ${p}` });
    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 0 || off > 99)
      return res.status(400).json({ success: false, error: "Offset must be 0–99." });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, error: "An account with that email already exists." });

    const secretNouns = extractNouns(selectedSentence);
    if (!secretNouns.length)
      return res.status(400).json({ success: false, error: "No recognisable nouns found in that sentence." });

    // Build user (password hashed in pre-save hook)
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      selectedSentence,
      wordpressSite:     wordpressSite     || null,
      wordpressUsername: wordpressUsername || null,
      secretNouns,
      secretPositions,
      offset: off,
    });

    // Generate API key — raw key returned ONCE, hash stored
    const rawApiKey = await user.generateApiKey();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      // ── Raw API key — shown ONCE. User must copy it now. ──
      apiKey: rawApiKey,
      apiKeyHint: user.apiKeyHint,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[signup]", err);
    return res.status(500).json({ success: false, error: "Server error during signup." });
  }
});

/* ── POST /api/auth/login ───────────────────────────────────── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ success: false, error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: "Invalid email or password." });

    const { sessionId, challengeGrid } = await createLoginSession(user._id, user.secretNouns);
    return res.json({ success: true, sessionId, challengeGrid });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/auth/wordpress-login ────────────────────────────
   Called by the WordPress plugin using the user's API key.
   Body: { apiKey, wordpressSite, wordpressUsername }
   No password needed — API key IS the credential for WP flow.
─────────────────────────────────────────────────────────────── */
router.post("/wordpress-login", async (req, res) => {
  try {
    const { email, apiKey } = req.body;

    if (!email || !apiKey) {
      return res.status(400).json({
        success: false,
        error: "email and apiKey are required."
      });
    }

    // 1. find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }

    // 2. verify API key
    const keyValid = await user.verifyApiKey(apiKey);

    if (!keyValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid API key."
      });
    }

    // 3. create session
    const { sessionId, challengeGrid } =
      await createLoginSession(user._id, user.secretNouns);

    return res.json({
      success: true,
      sessionId,
      challengeGrid
    });

  } catch (err) {
    console.error("[wordpress-login]", err);
    return res.status(500).json({
      success: false,
      error: "Server error."
    });
  }
});

/* ── POST /api/auth/register ────────────────────────────────── */
router.post("/register", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId)
      return res.status(400).json({ success: false, error: "sessionId is required." });

    const session = await LoginSession.findOne({ sessionId });
    if (!session || session.expiresAt < new Date()) {
      if (session) await LoginSession.deleteOne({ sessionId });
      return res.status(404).json({ success: false, error: "Session not found or expired. Please sign in again." });
    }

    const user = await User.findById(session.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const secretPositions = user.secretPositions;
    if (!Array.isArray(secretPositions) || secretPositions.length !== 2)
      return res.status(400).json({ success: false, error: "User secret positions corrupted." });

    const { register, d1, d2 } = buildRegister(session.revealedItem.value, user.offset, secretPositions);
    session.register   = register;
    session.expectedD1 = d1;
    session.expectedD2 = d2;
    await session.save();

    return res.json({ success: true, register, revealedItem: session.revealedItem });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ success: false, error: "Server error building register." });
  }
});

/* ── POST /api/auth/verify ──────────────────────────────────── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    if (!sessionId || !Array.isArray(registerInputs))
      return res.status(400).json({ success: false, error: "sessionId and registerInputs are required." });
    if (registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "registerInputs must have exactly 5 values (A–E)." });

    const session = await LoginSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found or expired." });

    if (session.expiresAt < new Date()) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }

    if (session.expectedD1 == null || session.expectedD2 == null)
      return res.status(400).json({ success: false, error: "Register not built yet. Please complete step 2 first." });

    session.attempts += 1;
    if (session.attempts > 3) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please sign in again." });
    }
    await session.save();

    const user = await User.findById(session.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const posIdx1 = POSITIONS.indexOf(user.secretPositions[0]);
    const posIdx2 = POSITIONS.indexOf(user.secretPositions[1]);
    const input1  = parseInt(registerInputs[posIdx1], 10);
    const input2  = parseInt(registerInputs[posIdx2], 10);

    if (isNaN(input1) || isNaN(input2))
      return res.status(400).json({ success: false, error: "Invalid input format." });

    const { expectedD1, expectedD2 } = session;
    const match =
      (input1 === expectedD1 && input2 === expectedD2) ||
      (input1 === expectedD2 && input2 === expectedD1);

    if (!match) {
      const remaining = 3 - session.attempts;
      if (remaining <= 0) {
        await LoginSession.deleteOne({ sessionId });
        return res.status(401).json({ success: false, error: "Too many failed attempts. Please sign in again." });
      }
      return res.status(401).json({
        success: false,
        error: `Incorrect digits. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }

    await LoginSession.deleteOne({ sessionId });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      message: "Identity verified. Welcome back!",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
});

/* ── POST /api/auth/regenerate-api-key ─────────────────────────
   Authenticated endpoint. User can rotate their API key.
   Requires JWT in Authorization header.
─────────────────────────────────────────────────────────────── */
router.post("/regenerate-api-key", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ success: false, error: "Unauthorised." });

    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    const rawApiKey = await user.generateApiKey();
    await user.save();

    return res.json({
      success: true,
      apiKey:     rawApiKey,    // shown once — user must copy it
      apiKeyHint: user.apiKeyHint,
      message: "New API key generated. Copy it now — it won't be shown again.",
    });
  } catch (err) {
    console.error("[regenerate-api-key]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ success: true, message: "If account exists, reset link sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Visual Password Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Reset Your Password (valid for 15 minutes)",

      html: `
      <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eee">

          <h2 style="color:#0f172a;margin-bottom:10px">Password Reset Request for Scam2Safe.com</h2>

          <p style="color:#334155;font-size:14px;line-height:1.6">
            We received a request to reset your password. If this was you, click the button below.
            This link will expire in <b>15 minutes</b>.
          </p>

          <a href="${resetUrl}"
            style="display:inline-block;margin:16px 0;padding:12px 18px;background:linear-gradient(135deg,#06B6D4,#0891b2);color:white;text-decoration:none;border-radius:8px;font-weight:600">
            Reset Password
          </a>

          <p style="color:#64748b;font-size:12px;line-height:1.5">
            If the button doesn’t work, copy and paste this link:<br/>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>

          <p style="color:#94a3b8;font-size:12px">
            If you didn’t request this, you can safely ignore this email.
            Your password will remain unchanged.
          </p>

        </div>
      </div>
      `
    });

    return res.json({
      success: true,
      message: "If account exists, reset link sent."
    });

  } catch (err) {
    console.error("[forgot-password]", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(await User.findOne({
      resetPasswordToken: hashedToken
    }));

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired token." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await transporter.sendMail({
      from: `"Visual Password Security" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "✅ Your Password Was Successfully Reset",

      html: `
      <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eee">

          <h2 style="color:#0f172a">Password Updated</h2>

          <p style="color:#334155;font-size:14px;line-height:1.6">
            Your password has been successfully changed.
            If this was not you, please contact support immediately.
          </p>

          <div style="padding:12px;background:#ecfeff;border-left:4px solid #06B6D4;border-radius:6px;margin-top:12px">
            <p style="margin:0;color:#0f172a;font-size:13px">
              Your account is now secured with your new password.
            </p>
          </div>

          <p style="color:#94a3b8;font-size:12px;margin-top:20px">
            Visual Password Security System
          </p>

        </div>
      </div>
      `
    });

    return res.json({
      success: true,
      message: "Password reset successful."
    });

  } catch (err) {
    console.error("[reset-password]", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/delete-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, error: "Invalid credentials" });

    await User.deleteOne({ email });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/test", (_req, res) => res.json({ message: "Auth route working ✓" }));

export default router;