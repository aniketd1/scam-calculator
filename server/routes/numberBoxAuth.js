import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import NumberUser from "../models/NumberUser.js";
import NumberBoxSession from "../models/NumberBoxSession.js";

const router = express.Router();
const SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");   // ← add this line here

const BOX_NAMES = [
  "Crocodile", "Falcon", "Tiger", "Panther", "Otter", "Heron",
  "Wolf", "Cobra", "Lynx", "Hawk", "Bison", "Orca",
];

function randInt(min, max) { return crypto.randomInt(min, max + 1); }

function randomDigitCount() {
  const weights = [1, 2, 2, 3, 3, 3, 4];
  return weights[randInt(0, weights.length - 1)];
}

function randomNumberByDigits(digits) {
  if (digits === 1) return randInt(1, 9);
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return randInt(min, max);
}

function generateUniqueNumbers(count, exclude) {
  const result = [];
  let guard = 0;
  while (result.length < count && guard < count * 80) {
    guard++;
    const n = randomNumberByDigits(randomDigitCount());
    if (exclude.has(n) || result.includes(n)) continue;
    result.push(n);
  }
  return result;
}

/* ── build the 9-box grid, with the real secretNumber hidden in one box ── */
function buildBoxGrid(secretNumber) {
  const shuffledNames = [...BOX_NAMES].sort(() => Math.random() - 0.5).slice(0, 9);
  const secretBoxIndex = randInt(0, 8);
  const secretSlot = randInt(0, 3);

  const usedNumbers = new Set([secretNumber]);
  const boxes = shuffledNames.map((name, boxIdx) => {
    const numbers = new Array(4).fill(null);
    if (boxIdx === secretBoxIndex) numbers[secretSlot] = secretNumber;

    for (let i = 0; i < 4; i++) {
      if (numbers[i] !== null) continue;
      const [n] = generateUniqueNumbers(1, usedNumbers);
      numbers[i] = n;
      usedNumbers.add(n);
    }

    // circled numbers CAN repeat across boxes — no uniqueness constraint
    const circled = randomNumberByDigits(randomDigitCount() <= 2 ? randomDigitCount() : 2);

    return { name, numbers, circled };
  });

  return { boxes, secretBoxIndex };
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

    const others = ALPHABET.filter(l => !secretPositions.includes(l));
    const three = [];
    const pool = [...others];
    while (three.length < 3) {
      const idx = randInt(0, pool.length - 1);
      three.push(pool.splice(idx, 1)[0]);
    }
    const registerLetters = [...secretPositions, ...three].sort(() => Math.random() - 0.5);

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

/* ── POST /api/number-boxes/login ── */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required." });

    const user = await NumberUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, error: "No account found with that email." });

    const { boxes, secretBoxIndex } = buildBoxGrid(user.secretNumber);
    const correctCircled = boxes[secretBoxIndex].circled;

    const result = (user.secretNumber + user.secretMargin + correctCircled) % 100;
    const normalized = String(result).padStart(2, "0");
    const d1 = parseInt(normalized[0], 10);
    const d2 = parseInt(normalized[1], 10);
    const pos1 = user.registerLetters.indexOf(user.secretPositions[0]);
    const pos2 = user.registerLetters.indexOf(user.secretPositions[1]);

    // client only ever receives boxes (name + 4 numbers + circled) — never secretBoxIndex
    const clientBoxes = boxes.map(({ name, numbers, circled }) => ({ name, numbers, circled }));

    const sessionId = crypto.randomUUID();
    await NumberBoxSession.create({
      sessionId,
      userId: user._id,
      boxes: clientBoxes,
      registerLetters: user.registerLetters,
      expectedD1: d1,
      expectedD2: d2,
      pos1,
      pos2,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    return res.json({ success: true, sessionId, boxes: clientBoxes, registerLetters: user.registerLetters });
  } catch (err) {
    console.error("[number-boxes/login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/number-boxes/verify ── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;
    if (!sessionId || !Array.isArray(registerInputs) || registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "sessionId and 5 registerInputs are required." });

    const session = await NumberBoxSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, error: "Session not found or expired." });
    if (session.expiresAt < new Date()) {
      await NumberBoxSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }

    session.attempts += 1;
    if (session.attempts > MAX_ATTEMPTS) {
      await NumberBoxSession.deleteOne({ sessionId });
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
        await NumberBoxSession.deleteOne({ sessionId });
        return res.status(401).json({ success: false, error: "Too many failed attempts. Please sign in again." });
      }
      return res.status(401).json({ success: false, error: `Incorrect code. ${remaining} attempts remaining.` });
    }

    await NumberBoxSession.deleteOne({ sessionId });
    const user = await NumberUser.findById(session.userId);
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, message: "Identity verified! Welcome back.", token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[number-boxes/verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
});

export default router;