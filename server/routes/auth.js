// routes/auth.js — ESM (type:"module")
// Single source of truth for auth. authController.js is NOT used.

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import LoginSession from "../models/LoginSession.js";

const router = express.Router();

/* ── CONSTANTS ──────────────────────────────────────────────── */
const POSITIONS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
const GRID_SIZE = 12;

const ALL_NOUNS = [
  "teacher","doctor","farmer","student","child","engineer","driver","boy","girl",
  "school","hospital","house","university","park","field","road","ocean","mountain",
  "river","bus","train","car","laptop","mobile","tv","table","chair","bed","guitar",
  "drums","piano","cricket","football","tennis","apple","banana","mango","carrot",
  "rice","milk","bread","dog","cat","parrot","pigeon","sparrow","elephant",
  "sunflower","rose","spinach","eye","ear","hand","beach","lotus",
];

/* ── HELPERS ────────────────────────────────────────────────── */
function extractNouns(sentence) {
  const nounSet = new Set(ALL_NOUNS);
  return [...new Set(
    sentence.toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter(w => nounSet.has(w))
  )];
}

function generateChallengeGrid(secretNouns) {
  const chosenSecret = secretNouns[Math.floor(Math.random() * secretNouns.length)];

  const distractors = ALL_NOUNS
    .filter(n => n !== chosenSecret)
    .sort(() => Math.random() - 0.5)
    .slice(0, GRID_SIZE - 1);

  const challengeGrid = [chosenSecret, ...distractors]
    .sort(() => Math.random() - 0.5)
    .map(noun => ({
      noun,
      value: Math.floor(Math.random() * 90) + 10
    }));

  return { challengeGrid, chosenSecret };
}

/* ── POST /api/auth/signup ──────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, selectedSentence, secretPositions, offset } = req.body;

    if (!email || !password || !selectedSentence || !secretPositions || offset == null)
      return res.status(400).json({ success: false, error: "All fields are required." });

    if (!Array.isArray(secretPositions) || secretPositions.length !== 2)
      return res.status(400).json({ success: false, error: "Exactly 2 positions required." });

    if (secretPositions[0] === secretPositions[1])
      return res.status(400).json({ success: false, error: "Positions must be different." });

    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 1 || off > 99)
      return res.status(400).json({ success: false, error: "Offset must be 1–99." });

    for (const p of secretPositions)
      if (!POSITIONS.includes(p))
        return res.status(400).json({ success: false, error: `Invalid position: ${p}` });

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
      success: true,
      message: "Account created successfully.",
      token,
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
    if (!user)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const { challengeGrid, chosenSecret } = generateChallengeGrid(user.secretNouns);
    const revealedItem = challengeGrid.find(item => item.noun === chosenSecret);

    const sessionId = uuidv4();

    await LoginSession.create({
      sessionId,
      userId: user._id,
      challengeGrid,
      revealedItem: {
        noun: revealedItem.noun,
        value: revealedItem.value
      },
    });

    return res.json({ success: true, sessionId, challengeGrid });

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/auth/register ────────────────────────────────── */
router.post("/register", async (req, res) => {
  try {
    const { sessionId, challengeGrid } = req.body;

    if (!sessionId || !Array.isArray(challengeGrid) || !challengeGrid.length)
      return res.status(400).json({ success: false, error: "sessionId and challengeGrid are required." });

    const session = await LoginSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found." });

    const user = await User.findById(session.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    const secretValue = session.revealedItem.value;
    const expected = secretValue + user.offset;

    const d1 = Math.floor(expected / 10) % 10;
    const d2 = expected % 10;

    const register = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10));

    register[POSITIONS.indexOf(user.secretPositions[0])] = d1;
    register[POSITIONS.indexOf(user.secretPositions[1])] = d2;

    session.register = register;
    await session.save();

    return res.json({ success: true, register });

  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ success: false, error: "Server error building register." });
  }
});

/* ── POST /api/auth/verify ──────────────────────────────────── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    const session = await LoginSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found." });

    const user = await User.findById(session.userId);

    const posIdx1 = POSITIONS.indexOf(user.secretPositions[0]);
    const posIdx2 = POSITIONS.indexOf(user.secretPositions[1]);

    const actual1 = parseInt(registerInputs[posIdx1], 10);
    const actual2 = parseInt(registerInputs[posIdx2], 10);

    const correct1 = session.register[posIdx1];
    const correct2 = session.register[posIdx2];

    if (actual1 !== correct1 || actual2 !== correct2) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(401).json({ success: false, error: "Verification failed." });
    }

    await LoginSession.deleteOne({ sessionId });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Identity verified.",
      token,
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    console.error("[verify]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

export default router;