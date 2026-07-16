import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import NumberUser from "../models/NumberUser.js";
import NumberLoginSession from "../models/NumberLoginSession.js";

const router = express.Router();
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

function randInt(min, max) { return crypto.randomInt(min, max + 1); }

function randomDigitCount() {
  // weight toward 1-3 digit numbers, occasional 4-digit, like your example set
  const weights = [1, 2, 2, 3, 3, 3, 4];
  return weights[randInt(0, weights.length - 1)];
}

function randomNumberByDigits(digits) {
  if (digits === 1) return randInt(1, 9);
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return randInt(min, max);
}

function generateGridNumbers(excludeSet, count) {
  const result = [];
  let guard = 0;
  while (result.length < count && guard < count * 50) {
    guard++;
    const n = randomNumberByDigits(randomDigitCount());
    if (excludeSet.has(n)) continue; // allow repeats across circled vs top per your spec, just no dup within same generation batch below
    result.push(n);
  }
  return result;
}

function generateRegisterLetters(secretPositions) {
  const others = ALPHABET.filter(l => !secretPositions.includes(l));
  const three = [];
  const pool = [...others];
  while (three.length < 3) {
    const idx = randInt(0, pool.length - 1);
    three.push(pool.splice(idx, 1)[0]);
  }
  return [...secretPositions, ...three].sort(() => Math.random() - 0.5);
}

/* ── POST /api/numbers/signup ── */
router.post("/signup", async (req, res) => {
  try {
    const { email, secretNumber, secretMargin, secretPositions } = req.body;

    if (!email || secretNumber == null || secretMargin == null || !Array.isArray(secretPositions) || secretPositions.length !== 2) {
      return res.status(400).json({ success: false, error: "email, secretNumber, secretMargin and 2 secretPositions are required." });
    }
    const sn = parseInt(secretNumber, 10);
    const sm = parseInt(secretMargin, 10);
    if (isNaN(sn) || sn < 1 || sn > 9999) return res.status(400).json({ success: false, error: "secretNumber must be 1-9999." });
    if (isNaN(sm) || sm < 0 || sm > 99) return res.status(400).json({ success: false, error: "secretMargin must be 0-99." });
    if (secretPositions[0] === secretPositions[1]) return res.status(400).json({ success: false, error: "Positions must differ." });
    for (const l of secretPositions) if (!ALPHABET.includes(l)) return res.status(400).json({ success: false, error: `Invalid position: ${l}` });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await NumberUser.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ success: false, error: "An account with that email already exists." });

    const registerLetters = generateRegisterLetters(secretPositions);

    const user = await NumberUser.create({
      email: normalizedEmail,
      secretNumber: sn,
      secretMargin: sm,
      secretPositions,
      registerLetters,
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[numbers/signup]", err);
    return res.status(500).json({ success: false, error: "Server error during signup." });
  }
});

/* ── POST /api/numbers/login — email → grid ── */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required." });

    const user = await NumberUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, error: "No account found with that email." });

    const used = new Set();
    const topNumbers = generateGridNumbers(used, 6);
    topNumbers.forEach(n => used.add(n));
    const circledNumbers = generateGridNumbers(used, 3);

    const sessionId = crypto.randomUUID();
    await NumberLoginSession.create({
      sessionId,
      userId: user._id,
      topNumbers,
      circledNumbers,
      registerLetters: user.registerLetters,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    return res.json({ success: true, sessionId, topNumbers, circledNumbers, registerLetters: user.registerLetters });
  } catch (err) {
    console.error("[numbers/login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/numbers/register — user picks a circled number ── */
router.post("/register", async (req, res) => {
  try {
    const { sessionId, pickedCircledNumber } = req.body;
    if (!sessionId || pickedCircledNumber == null)
      return res.status(400).json({ success: false, error: "sessionId and pickedCircledNumber are required." });

    const session = await NumberLoginSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, error: "Session not found or expired." });
    if (session.expiresAt < new Date()) {
      await NumberLoginSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }

    const picked = parseInt(pickedCircledNumber, 10);
    if (!session.circledNumbers.includes(picked))
      return res.status(400).json({ success: false, error: "Picked number was not one of the circled options." });

    const user = await NumberUser.findById(session.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const result = (user.secretNumber + user.secretMargin + picked) % 100;
    const normalized = String(result).padStart(2, "0");
    const d1 = parseInt(normalized[0], 10);
    const d2 = parseInt(normalized[1], 10);
    const pos1 = session.registerLetters.indexOf(user.secretPositions[0]);
    const pos2 = session.registerLetters.indexOf(user.secretPositions[1]);

    session.pickedCircled = picked;
    session.expectedD1 = d1;
    session.expectedD2 = d2;
    session.pos1 = pos1;
    session.pos2 = pos2;
    await session.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("[numbers/register]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/numbers/verify ── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;
    if (!sessionId || !Array.isArray(registerInputs) || registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "sessionId and 5 registerInputs are required." });

    const session = await NumberLoginSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, error: "Session not found or expired." });
    if (session.expiresAt < new Date()) {
      await NumberLoginSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }
    if (session.pickedCircled == null)
      return res.status(400).json({ success: false, error: "Pick a circled number first." });

    session.attempts += 1;
    if (session.attempts > MAX_ATTEMPTS) {
      await NumberLoginSession.deleteOne({ sessionId });
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please sign in again." });
    }
    await session.save();

    const input1 = parseInt(registerInputs[session.pos1], 10);
    const input2 = parseInt(registerInputs[session.pos2], 10);
    if (isNaN(input1) || isNaN(input2))
      return res.status(400).json({ success: false, error: "Invalid input format." });

    const match =
      (input1 === session.expectedD1 && input2 === session.expectedD2) ||
      (input1 === session.expectedD2 && input2 === session.expectedD1);

    if (!match) {
      const remaining = MAX_ATTEMPTS - session.attempts;
      if (remaining <= 0) {
        await NumberLoginSession.deleteOne({ sessionId });
        return res.status(401).json({ success: false, error: "Too many failed attempts. Please sign in again." });
      }
      return res.status(401).json({ success: false, error: `Incorrect code. ${remaining} attempts remaining.` });
    }

    await NumberLoginSession.deleteOne({ sessionId });
    const user = await NumberUser.findById(session.userId);
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, message: "Identity verified! Welcome back.", token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[numbers/verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
});

export default router;