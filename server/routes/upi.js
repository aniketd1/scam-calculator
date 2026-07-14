// routes/upi.js — ESM
// UPI Visual Password — separate from the main auth system
// Uses the same WORDS pool and syllable-grid mechanics,
// The selected card's value is added to the number of digits in the
// transaction amount. Two characters from the UPI transaction ID identify
// the answer positions in a five-character register.

import express  from "express";
import crypto   from "crypto";
import jwt      from "jsonwebtoken";
import UpiUser        from "../models/UpiUser.js";
import UpiSession     from "../models/UpiSession.js";
import { WORDS }      from "../data/words.js";

const router = express.Router();

/* ── constants ─────────────────────────────────────────────── */
const REGISTER_CHARS = "0123456789".split("");const GRID_SIZE  = 21;   // 3-col × 7-row
const SESSION_TTL = 10 * 60 * 1000; // 10 min

/* ── helpers ────────────────────────────────────────────────── */
function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * Build the five-character register row:
 *   - includes two distinct characters from the UPI transaction ID
 *   - padded with 3 random alphanumeric characters
 *   - shuffled so positions vary each session
 * Returns: { letters: string[5], posIdx1: number, posIdx2: number }
 */
function buildRegisterLetters(idChar1, idChar2) {
  const fillers = shuffle(
    REGISTER_CHARS.filter(char => char !== idChar1 && char !== idChar2)
  ).slice(0, 3);
  const letters = shuffle([idChar1, idChar2, ...fillers]);
  return {
    letters,
    posIdx1: letters.indexOf(idChar1),
    posIdx2: letters.indexOf(idChar2),
  };
}

/**
 * Use the final two distinct alphanumeric characters of the UPI transaction
 * ID as the register markers. Reading from the end makes the rule easy to
 * apply to the reference number shown by a UPI app.
 */
function getTransactionIdMarkers(transactionId) {
  const chars = String(transactionId).toUpperCase().match(/[A-Z0-9]/g) || [];
  const markers = [];

  for (let i = chars.length - 1; i >= 0 && markers.length < 2; i--) {
    if (!markers.includes(chars[i])) markers.push(chars[i]);
  }

  return markers.length === 2 ? markers.reverse() : null;
}

function buildRegister(offset, posIdx1, posIdx2) {
  const result = offset % 100;

  const normalized = String(result).padStart(2, "0");

  const d1 = Number(normalized[0]);
  const d2 = Number(normalized[1]);

  const reg = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));

  reg[posIdx1] = d1;
  reg[posIdx2] = d2;

  return { register: reg, d1, d2 };
}

/* ── build masked display ────────────────────────────────────
   parts=["Ra","me","sh"], revealIdx=0  →  "Ra _ _"
─────────────────────────────────────────────────────────────── */
function buildMask(parts, revealIdx) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === revealIdx ? p : "_"))
    .join(" ");
}

/**
 * Generate the challenge grid:
 * 21 cards. One is the user's masked visual word (only one part revealed),
 * the rest are masked distractors revealing the SAME part index, so every
 * card in the grid has the same underscore pattern. Every card has a
 * value from 1–9 shown below it.
 */
function generateChallengeGrid(userWord) {
  const cleanUserParts = (userWord.parts || []).filter(Boolean);
  if (cleanUserParts.length === 0) {
    throw new Error("User word has no parts to mask.");
  }
  const revealIdx = Math.floor(Math.random() * cleanUserParts.length);
  const secretMask = buildMask(cleanUserParts, revealIdx);

  // Only use distractor words with the SAME number of parts, so masks
  // line up visually (same number of underscores).
  const candidates = WORDS.filter(w => {
    if (w.word === userWord.word) return false;
    if (userWord.lang && w.lang !== userWord.lang) return false;
    const clean = (w.parts || []).filter(Boolean);
    return clean.length === cleanUserParts.length && clean[revealIdx];
  });

  const source = candidates.length >= GRID_SIZE - 1
    ? candidates
    : WORDS.filter(w => {
        if (w.word === userWord.word) return false;
        const clean = (w.parts || []).filter(Boolean);
        return clean.length === cleanUserParts.length && clean[revealIdx];
      });

  const seenMasks = new Set([secretMask]);
  const distractors = [];
  for (const w of shuffle(source)) {
    if (distractors.length >= GRID_SIZE - 1) break;
    const clean = w.parts.filter(Boolean);
    const mask = buildMask(clean, revealIdx);
    if (seenMasks.has(mask)) continue;
    seenMasks.add(mask);
    distractors.push({ mask, value: Math.floor(Math.random() * 9) + 1 });
  }

  // Last-resort padding if the pool is too small for unique masks
  while (distractors.length < GRID_SIZE - 1 && distractors.length > 0) {
    distractors.push(distractors[distractors.length % distractors.length]);
  }

  const grid = shuffle([
    { mask: secretMask, value: Math.floor(Math.random() * 9) + 1, isSecret: true },
    ...distractors.map(card => ({ ...card, isSecret: false })),
  ]);

  return { grid };
}

/* ── POST /api/upi/setup ────────────────────────────────────── */
// One-time: save the sender's visual word.
// No password — email is the only identifier.
router.post("/setup", async (req, res) => {
  try {
    const {
      email,
      selectedWord,
      selectedWordParts,
      selectedWordLang,
    } = req.body;

    if (!email || !selectedWord || !selectedWordParts)
      return res.status(400).json({ success: false, error: "All fields are required." });

    if (!Array.isArray(selectedWordParts) || selectedWordParts.length < 2)
      return res.status(400).json({ success: false, error: "Word must have at least 2 parts." });

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert — user can change their word
    let user = await UpiUser.findOne({ email: normalizedEmail });
    if (user) {
      user.selectedWord      = selectedWord;
      user.selectedWordParts = selectedWordParts;
      user.selectedWordLang  = selectedWordLang || "en";
    } else {
      user = new UpiUser({
        email:             normalizedEmail,
        selectedWord,
        selectedWordParts,
        selectedWordLang:  selectedWordLang || "en",
      });
    }
    await user.save();

    return res.status(201).json({ success: true, message: "UPI Visual Password saved." });
  } catch (err) {
    console.error("[upi/setup]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/upi/verify-start ─────────────────────────────── */
// Called when the user is about to send money.
// Body: { email, transactionId: string, amountDigitCount: number }
// Returns: { sessionId, challengeGrid: [{word, value}], registerLetters: string[5] }
router.post("/verify-start", async (req, res) => {
  try {
    const { email, transactionId, amountDigitCount } = req.body;

    if (!email || !transactionId)
      return res.status(400).json({ success: false, error: "email and UPI transaction ID are required." });

    const transactionMarkers = getTransactionIdMarkers(transactionId);
    if (!transactionMarkers)
      return res.status(400).json({ success: false, error: "UPI transaction ID must contain at least 2 different letters or numbers." });

    const digits = parseInt(amountDigitCount, 10);
    if (isNaN(digits) || digits < 1)
      return res.status(400).json({ success: false, error: "amountDigitCount must be a positive number." });

    const user = await UpiUser.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ success: false, error: "No UPI Visual Password account found for this email." });

    const userWord = {
      word:  user.selectedWord,
      parts: user.selectedWordParts,
      lang:  user.selectedWordLang,
    };
    const { grid } = generateChallengeGrid(userWord);

    // The selected word's card value is added to the amount's digit count.
    const secretCard = grid.find(card => card.isSecret);
    const offset = digits + secretCard.value;

    // Build the register using two markers from the UPI transaction ID.
    const { letters, posIdx1, posIdx2 } = buildRegisterLetters(...transactionMarkers);
    const { d1, d2 } = buildRegister(offset, posIdx1, posIdx2);

    // Save session
    const sessionId = crypto.randomUUID();
    await UpiSession.create({
      sessionId,
      userId:         user._id,
      registerLetters: letters,
      posIdx1,
      posIdx2,
      expectedD1:     d1,
      expectedD2:     d2,
      attempts:       0,
      expiresAt:      new Date(Date.now() + SESSION_TTL),
    });

    return res.json({
      success:         true,
      sessionId,
      challengeGrid:   grid.map(c => ({ mask: c.mask, value: c.value })), // strip isSecret flag
      registerLetters: letters,
    });

  } catch (err) {
    console.error("[upi/verify-start]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/upi/verify-complete ──────────────────────────── */
// Body: { sessionId, registerInputs: number[5] }
// Checks the 2 UPI-transaction-ID positions. Accepts either digit order.
router.post("/verify-complete", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;

    if (!sessionId || !Array.isArray(registerInputs) || registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "sessionId and 5 registerInputs required." });

    const session = await UpiSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found or expired. Please start over." });

    if (session.expiresAt < new Date()) {
      await UpiSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please start over." });
    }

    // Attempt guard
    session.attempts += 1;
    if (session.attempts > 3) {
      await UpiSession.deleteOne({ sessionId });
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please start over." });
    }
    await session.save();

    const input1 = parseInt(registerInputs[session.posIdx1], 10);
    const input2 = parseInt(registerInputs[session.posIdx2], 10);

    if (isNaN(input1) || isNaN(input2))
      return res.status(400).json({ success: false, error: "Invalid input." });

    const { expectedD1, expectedD2 } = session;

    // Accept either digit order at the two positions
    const match =
      (input1 === expectedD1 && input2 === expectedD2) ||
      (input1 === expectedD2 && input2 === expectedD1);

    if (!match) {
      const remaining = 3 - session.attempts;
      if (remaining <= 0) {
        await UpiSession.deleteOne({ sessionId });
        return res.status(401).json({ success: false, error: "Too many failed attempts. Please start over." });
      }
      return res.status(401).json({
        success: false,
        error: `Incorrect digits. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }

    // Success
    await UpiSession.deleteOne({ sessionId });

    const token = jwt.sign(
      { upiVerified: true, userId: session.userId },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }   // short-lived — only for completing the transaction
    );

    return res.json({
      success: true,
      message: "Identity verified. Transaction authorised.",
      token,
    });

  } catch (err) {
    console.error("[upi/verify-complete]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

export default router;
