// routes/auth.js — ESM (type:"module")
import express from "express";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";
import crypto  from "crypto";
import User        from "../models/User.js";
import LoginSession from "../models/LoginSession.js";
import { SENTENCES } from "../data/sentences.js";

const router = express.Router();

/* ── CONSTANTS ──────────────────────────────────────────────── */
const POSITIONS = ["A","B","C","D","E"]; // 5 positions only
const GRID_SIZE = 12;

const NOUN_WORDS = new Set([
  "boy","girl","dog","cat","bird","monkey","farmer","teacher","child","baby",
  "rabbit","chef","driver",
  "ball","toy","stick","doll","dress","bone","mouse","milk","nest","egg",
  "banana","tree","seed","crops","tractor","book","chart","house","flower",
  "picture","toy","rattle","bicycle","bell","park","rose","basket","carrot",
  "log","burrow","car","road","market","door","room","bag","box","ball",
  "wall","bird","plant","soil","field","clouds","letter","paper","spoon",
  "cup","table","kitchen","blocks","model","star","garden","seed"
]);

function extractNouns(sentence) {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/);

  return [...new Set(words.filter(w => NOUN_WORDS.has(w)))];
}

function generateChallengeGrid(secretNouns) {
  const secrets      = [...new Set(secretNouns.filter(Boolean))];
  const chosenSecret = secrets[Math.floor(Math.random() * secrets.length)];
  const distractors = [...NOUN_WORDS]
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
  const d1     = Math.floor(result / 10);  // tens digit
  const d2     = result % 10;              // units digit
  const reg    = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
  reg[POSITIONS.indexOf(secretPositions[0])] = d1;
  reg[POSITIONS.indexOf(secretPositions[1])] = d2;
  return { register: reg, d1, d2 };
}

/* ── POST /api/auth/signup ──────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, wordpressSite, wordpressUsername, selectedSentence, secretPositions, offset } = req.body;

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

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      selectedSentence,
      wordpressSite,
      wordpressUsername,
      secretNouns,
      secretPositions,
      offset: off,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(201).json({
      success: true, message: "Account created successfully.",
      token, user: { id: user._id, email: user.email },
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
    if (!user)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const { challengeGrid, chosenSecret } = generateChallengeGrid(user.secretNouns);
    const revealedItem = challengeGrid.find(item => item.noun === chosenSecret);

    const sessionId = crypto.randomUUID();
    await LoginSession.create({
      sessionId,
      userId:      user._id,
      challengeGrid,
      revealedItem: { noun: revealedItem.noun, value: revealedItem.value },
      register:    null,
      expectedD1:  null,  // ← consistent field names
      expectedD2:  null,
      attempts:    0,
      expiresAt:   new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.json({ success: true, sessionId, challengeGrid });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/auth/register ────────────────────────────────── */
// Client sends ONLY sessionId. Server builds register server-side.
// Returns register[5] for display only. Positions NOT returned.
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
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    const secretPositions = user.secretPositions;

    if (!Array.isArray(secretPositions) || secretPositions.length !== 2) {
      return res.status(400).json({
        success: false,
        error: "User secret positions corrupted"
      });
    }

    const { register, d1, d2 } = buildRegister(
      session.revealedItem.value,
      user.offset,
      secretPositions
    );

    // ← Save as expectedD1 / expectedD2 — consistent with /verify
    session.register   = register;
    session.expectedD1 = d1;
    session.expectedD2 = d2;
    await session.save();

    return res.json({
      success:      true,
      register,                           // number[5] shown for reference
      revealedItem: session.revealedItem, // for overlay
    });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ success: false, error: "Server error building register." });
  }
});

/* ── POST /api/auth/verify ──────────────────────────────────── */
// Client sends 5 digits (A–E).
// Checks ONLY the 2 secret positions.
// Accepts any digit order at those positions:
//   positions = ["A","D"], result = 42
//   VALID: A=4,D=2  OR  A=2,D=4
//   Also valid when positions stored as ["D","A"]: D=4,A=2 OR D=2,A=4
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    if (!sessionId || !Array.isArray(registerInputs))
      return res.status(400).json({ success: false, error: "sessionId and registerInputs are required." });
    if (registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "registerInputs must have exactly 5 values (A–E)." });

    const session = await LoginSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found or expired. Please sign in again." });

    if (session.expiresAt < new Date()) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }

    if (!session.register || session.expectedD1 == null || session.expectedD2 == null)
      return res.status(400).json({ success: false, error: "Register not built yet. Please complete step 2 first." });

    // Increment attempts before checking
    session.attempts += 1;
    if (session.attempts > 3) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please sign in again." });
    }
    await session.save();

    const user = await User.findById(session.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    const posIdx1 = POSITIONS.indexOf(user.secretPositions[0]);
    const posIdx2 = POSITIONS.indexOf(user.secretPositions[1]);
    const input1 = parseInt(registerInputs[posIdx1], 10);
    const input2 = parseInt(registerInputs[posIdx2], 10);

    if (isNaN(input1) || isNaN(input2)) {
      return res.status(400).json({
        success: false,
        error: "Invalid input format"
      });
    }

    const { expectedD1, expectedD2 } = session;

    // Accept any order: (d1,d2) or (d2,d1) at the two secret positions
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
      success: true, message: "Identity verified. Welcome back!",
      token, user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
  console.log("SECRET POSITIONS:", user.secretPositions);
  console.log("EXPECTED:", session.expectedD1, session.expectedD2);
  console.log("INPUTS:", registerInputs);
  console.log("POSITION INDEXES:", posIdx1, posIdx2);
  console.log("INPUT1/INPUT2:", input1, input2);
});

router.get("/sentences", (req, res) => {
  res.json({ success: true, sentences: SENTENCES });
});
router.post("/wordpress-login", async (req, res) => {
  try {

    const {
      wordpressSite,
      wordpressUsername
    } = req.body;

    if (!wordpressSite || !wordpressUsername) {
      return res.status(400).json({
        success: false,
        error: "Missing WordPress details."
      });
    }

    const user = await User.findOne({
      wordpressSite,
      wordpressUsername
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No Visual Password account linked to this WordPress user."
      });
    }

    const { challengeGrid } =
      generateChallengeGrid(
        user.secretNouns
      );

    const sessionId =
      crypto.randomUUID();

    await LoginSession.create({
      sessionId,
      userId: user._id,
      challengeGrid,
      revealedItem:
        challengeGrid.find(item =>
          user.secretNouns.includes(
            item.noun
          )
        ),
      register: null,
      expectedD1: null,
      expectedD2: null,
      attempts: 0,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    return res.json({
      success: true,
      sessionId,
      challengeGrid
    });

  }
  catch (err) {

    console.error(
      "[wordpress-login]",
      err
    );

    return res.status(500).json({
      success: false,
      error: "Server error"
    });

  }
});
router.get("/test", (_req, res) => res.json({ message: "Auth route working ✓" }));

export default router;
