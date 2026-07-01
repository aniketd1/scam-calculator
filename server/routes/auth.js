// routes/auth.js — ESM
// Word-based visual password system.
// Sentences preserved but inactive (see BACKUP comment below).

import express  from "express";
import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import crypto   from "crypto";
import User          from "../models/User.js";
import LoginSession  from "../models/LoginSession.js";
import { WORDS_BY_LANG, WORDS, WORD_PAIRS } from "../data/words.js";

// ── BACKUP: sentence-based system ────────────────────────────
// import { SENTENCES } from "../data/sentences.js";
// ─────────────────────────────────────────────────────────────

import nodemailer    from "nodemailer";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

const router = express.Router();

/* ── CONSTANTS ──────────────────────────────────────────────── */
const ALPHABET  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const GRID_SIZE = 9;                  
const RP_NAME   = process.env.RP_NAME   || "Scam2Safe";
const RP_ID     = process.env.RP_ID     || "localhost";
const RP_ORIGIN = process.env.RP_ORIGIN || "http://localhost:3000";

/* ── build masked display ────────────────────────────────────
   parts=["Ra","me","sh"], revealIdx=0  →  "Ra _ _"
─────────────────────────────────────────────────────────────── */
function buildMask(parts, revealIdx) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === revealIdx ? p : "_"))
    .join(" ");
}

/* ── generate challenge grid ─────────────────────────────────
    Rules:
    1. Only 9 cards total.
    2. Every card reveals the SAME part index as the secret word
      (e.g. if secret reveals index 0 → "Ra _ _", every distractor
      also reveals its own index 0, so they're all "Xx _ _" style —
      never mixed like "_ pa _" alongside "ra _ _").
    3. Distractors are pulled from the SAME language pool as the
      secret word, and only from words with the SAME number of
      parts as the secret (so underscore-count matches visually).
    4. Words that happen to share the same revealed text as the
      secret (e.g. Ramesh & Rajesh both reveal "Ra") are allowed to
      appear — that's intentional ambiguity — but each mask must be
      a real distinct word's masked form (no literal duplicate mask
      strings beyond what naturally occurs from same-prefix words,
      since the user must still tell their card apart by mask+value
      pairing if duplicate text appears, the session itself tracks
      index, not text, so this is safe).
─────────────────────────────────────────────────────────────── */
function generateWordChallengeGrid(secretWord, secretParts, lang) {
  const pool = WORDS_BY_LANG[lang] || WORDS;

  const cleanSecretParts = secretParts.filter(Boolean);
  const revealIdx   = Math.floor(Math.random() * cleanSecretParts.length);
  const secretMask  = buildMask(secretParts, revealIdx);
  const secretValue = Math.floor(Math.random() * 9) + 1; // 1–9

  // 1. Try single-word candidates first (WordPress / single-word flow)
  const singleCandidates = pool.filter(w => {
    if (!w?.word || !Array.isArray(w.parts)) return false;
    if (w.word === secretWord) return false;
    const clean = w.parts.filter(p => typeof p === "string" && p.trim().length > 0);
    return clean.length === cleanSecretParts.length && clean[revealIdx];
  });

  let buildDistractor; // returns { mask, word } or null

  if (singleCandidates.length > 0) {
    const shuffled = singleCandidates.sort(() => Math.random() - 0.5);
    let i = 0;
    buildDistractor = () => {
      const w = shuffled[i % shuffled.length];
      i++;
      const clean = w.parts.filter(Boolean);
      return {
        mask: buildMask(clean, revealIdx),
        word: w.word,
        value: Math.floor(Math.random() * 9) + 1, // ← add this
      };
    };
  } else {
    const usableWords = pool.filter(w => Array.isArray(w.parts) && w.parts.filter(Boolean).length > 0);
    if (usableWords.length < 2) {
      throw new Error(`Not enough words in '${lang}' pool to build a paired grid.`);
    }

    buildDistractor = () => {
      for (let attempt = 0; attempt < 50; attempt++) {
        const a = usableWords[Math.floor(Math.random() * usableWords.length)];
        const b = usableWords[Math.floor(Math.random() * usableWords.length)];
        if (a.word === b.word) continue;
        const combined = [...a.parts.filter(Boolean), ...b.parts.filter(Boolean)];
        if (combined.length === cleanSecretParts.length && combined[revealIdx]) {
          return {
            mask: buildMask(combined, revealIdx),
            word: `${a.word} + ${b.word}`,
            value: Math.floor(Math.random() * 9) + 1, // ← add this
          };
        }
      }
      return null;
    };
  }

  const distractors = [];
  const seenMasks = new Set([secretMask]); // secret's mask can't repeat either
  let tries = 0;
  while (distractors.length < GRID_SIZE - 1 && tries < (GRID_SIZE - 1) * 40) {
    tries++;
    const d = buildDistractor();
    if (!d) continue;
    if (seenMasks.has(d.mask)) continue;   // ← skip exact duplicate masks
    seenMasks.add(d.mask);
    distractors.push(d);
  }

  // Only pad with repeats as an absolute last resort (tiny pool edge case)
  if (distractors.length < GRID_SIZE - 1) {
    console.warn(`[grid] could not find ${GRID_SIZE - 1} unique masks for lang=${lang}, len=${cleanSecretParts.length}, idx=${revealIdx}`);
    while (distractors.length < GRID_SIZE - 1 && distractors.length > 0) {
      distractors.push(distractors[distractors.length % distractors.length]);
    }
  }

  if (distractors.length === 0) {
    throw new Error(`Could not generate any distractor cards for '${lang}' pool with ${cleanSecretParts.length} parts.`);
  }

  const grid = [{ mask: secretMask, value: secretValue, isSecret: true }, ...distractors];
  const shuffledGrid = grid.sort(() => Math.random() - 0.5);

  const secretIdx = shuffledGrid.findIndex(c => c.isSecret);
  const clientGrid = shuffledGrid.map(({ mask, value, word }) => ({ mask, value, word }));

  return { clientGrid, secretIdx, secretValue };
}

/* ── build register row ──────────────────────────────────────
   secretValue: 1–9 (from grid card)
   offset:      10–99 (user's mental offset)
   secretLetters: ["R","Y"]  (2 of the 5 fixed letters)
   registerLetters: 5 letters, always includes secretLetters[0] & [1]
   Returns the 5 fixed letters (same every login for this user)
   and the two expected digits.
─────────────────────────────────────────────────────────────── */
function buildWordRegister(secretValue, offset, secretLetters, registerLetters) {
  const result     = (secretValue + offset) % 100;
  const normalized = String(result).padStart(2, "0");
  const d1 = parseInt(normalized[0], 10);
  const d2 = parseInt(normalized[1], 10);
  // Find positions of the two secret letters in the 5-letter row
  const pos1 = registerLetters.indexOf(secretLetters[0]);
  const pos2 = registerLetters.indexOf(secretLetters[1]);
  return { d1, d2, pos1, pos2 };
}

/* ── generate 5 fixed register letters for a user ───────────
   Always contains the user's 2 secret letters.
   The other 3 are random from A–Z, fixed per-user (stored in DB).
─────────────────────────────────────────────────────────────── */
function generateRegisterLetters(secretLetters) {
  const others = ALPHABET.filter(l => !secretLetters.includes(l));
  const three  = others.sort(() => Math.random() - 0.5).slice(0, 3);
  return [...secretLetters, ...three].sort(() => Math.random() - 0.5);
}

async function createLoginSession(userId, secretWord, secretParts, offset, secretLetters, registerLetters, lang) {
  const { clientGrid, secretIdx, secretValue } = generateWordChallengeGrid(secretWord, secretParts, lang || "en");
  const { d1, d2, pos1, pos2 } = buildWordRegister(secretValue, offset, secretLetters, registerLetters);

  const sessionId = crypto.randomUUID();
  await LoginSession.create({
    sessionId,
    userId,
    challengeGrid:   clientGrid,
    secretCardIndex: secretIdx,
    secretValue,
    registerLetters,
    expectedD1: d1,
    expectedD2: d2,
    secretPos1: pos1,
    secretPos2: pos2,
    attempts:   0,
    expiresAt:  new Date(Date.now() + 10 * 60 * 1000),
  });

  return { sessionId, challengeGrid: clientGrid, registerLetters };
}

/* ── MIDDLEWARE ─────────────────────────────────────────────── */
function verifyUserToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ success: false, error: "Unauthorised." });
  try {
    req.user = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
}

/* ══════════════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════════════ */

/* ── GET /api/auth/words?lang=en|hi|mr ──────────────────────── */
router.get("/words", (req, res) => {
  const lang = ["en", "hi", "mr"].includes(req.query.lang) ? req.query.lang : "en";
  const words = WORDS_BY_LANG[lang] || WORDS_BY_LANG.en;

  // Build word pairs on the fly for "Regular (two words)" mode,
  // restricted to the same language so masks stay consistent.
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const wordPairs = [];
  for (let i = 0; i + 1 < shuffled.length && wordPairs.length < 12; i += 2) {
    wordPairs.push([shuffled[i].word, shuffled[i + 1].word]);
  }

  res.json({ success: true, lang, words, wordPairs });
});

// wordpress security endpoint
router.post("/verify-wp-token", async (req, res) => {
    try {

        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: "Missing token."
            });
        }

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        } catch (err) {

            return res.status(401).json({
                success: false,
                error: "Invalid or expired token."
            });

        }

        return res.json({
            success: true,
            userId: decoded.userId,
            email: decoded.email
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            error: "Server error."
        });

    }
});

// ── BACKUP: sentence endpoint preserved but inactive ─────────
// router.get("/sentences", (_req, res) => {
//   res.json({ success: true, sentences: SENTENCES });
// });

/* ── GET /api/auth/profile ──────────────────────────────────── */
router.get("/profile", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, [
      "email", "wordpressSite", "wordpressUsername",
      "selectedWord", "secretParts", "secretLetters", "registerLetters",
      "offset", "apiKeyHint", "apiKeyPrefix", "apiKeyCreatedAt",
      "pendingSetup", "passkeyCredentials",
    ]);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    return res.json({
      success: true,
      user: {
        email:             user.email,
        wordpressSite:     user.wordpressSite     || null,
        wordpressUsername: user.wordpressUsername || null,
        hasVisualPassword: !!(user.selectedWord && user.secretParts?.length && user.secretLetters?.length === 2 && user.offset != null),
        apiKeyHint:        user.apiKeyHint      || null,
        apiKeyCreatedAt:   user.apiKeyCreatedAt || null,
        pendingSetup:      user.pendingSetup    || false,
        hasPasskey:        (user.passkeyCredentials?.length ?? 0) > 0,
      },
    });
  } catch (err) {
    console.error("[profile]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/signup ───────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const {
      email, password,
      selectedWord, selectedWordParts, selectedWordLang,
      secretLetters,
      offset,
      wpFlow,
      wordpressSite, wordpressUsername,
    } = req.body;

    if (!email || !password || !selectedWord || !selectedWordParts || !secretLetters || offset == null)
      return res.status(400).json({ success: false, error: "All fields are required." });

    if (!Array.isArray(secretLetters) || secretLetters.length !== 2)
      return res.status(400).json({ success: false, error: "Exactly 2 secret letters required." });

    if (secretLetters[0] === secretLetters[1])
      return res.status(400).json({ success: false, error: "Secret letters must be different." });

    for (const l of secretLetters)
      if (!ALPHABET.includes(l))
        return res.status(400).json({ success: false, error: `Invalid letter: ${l}` });

    const off = parseInt(offset, 10);
    if (isNaN(off) || off < 10 || off > 99)
      return res.status(400).json({ success: false, error: "Offset must be 10–99." });

    if (!Array.isArray(selectedWordParts) || ![3, 6].includes(selectedWordParts.filter(Boolean).length))
      return res.status(400).json({ success: false, error: "Word must have exactly 3 parts (or 6 for two-word combos)." });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, error: "An account with that email already exists." });

    // Generate fixed 5-letter register row for this user
    const regLetters = generateRegisterLetters(secretLetters);

    const user = new User({
      email:             email.toLowerCase().trim(),
      password,
      selectedWord,
      selectedWordLang:  selectedWordLang || "en",
      secretParts:       selectedWordParts.filter(Boolean),
      secretLetters,
      registerLetters:   regLetters,
      offset:            off,
      wpFlow:            !!wpFlow,
      wordpressSite:     wordpressSite     || null,
      wordpressUsername: wordpressUsername || null,
      pendingSetup:      false,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
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
    if (!user) return res.status(401).json({ success: false, error: "Invalid email or password." });

    if (user.pendingSetup)
      return res.status(403).json({ success: false, error: "Account setup not complete. Please check your invite email." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: "Invalid email or password." });

    const { sessionId, challengeGrid, registerLetters } = await createLoginSession(
      user._id, user.selectedWord, user.secretParts,
      user.offset, user.secretLetters, user.registerLetters,
      user.selectedWordLang
    );

    return res.json({ success: true, sessionId, challengeGrid, registerLetters });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Server error during login." });
  }
});

/* ── POST /api/auth/wordpress-login ────────────────────────── */
router.post("/wordpress-login", async (req, res) => {
  try {
    const { email, apiKey } = req.body;
    if (!email || !apiKey)
      return res.status(400).json({ success: false, error: "email and apiKey are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    const keyValid = await user.verifyApiKey(apiKey);
    if (!keyValid)
      return res.status(401).json({ success: false, error: "Invalid API key." });

    const { sessionId, challengeGrid, registerLetters } = await createLoginSession(
      user._id, user.selectedWord, user.secretParts,
      user.offset, user.secretLetters, user.registerLetters,
      user.selectedWordLang
    );

    return res.json({ success: true, sessionId, challengeGrid, registerLetters });
  } catch (err) {
    console.error("[wordpress-login]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/verify ───────────────────────────────────
   Now combined: user selects card + submits register in one step.
   Body: { sessionId, selectedCardIndex, registerInputs: [5 ints] }
─────────────────────────────────────────────────────────────── */
router.post("/verify", async (req, res) => {
  try {
    const { sessionId, selectedCardIndex, registerInputs } = req.body;

    if (!sessionId || selectedCardIndex == null || !Array.isArray(registerInputs))
      return res.status(400).json({ success: false, error: "sessionId, selectedCardIndex, and registerInputs are required." });

    if (registerInputs.length !== 5)
      return res.status(400).json({ success: false, error: "registerInputs must have exactly 5 values." });

    const session = await LoginSession.findOne({ sessionId });
    if (!session)
      return res.status(404).json({ success: false, error: "Session not found or expired." });

    if (session.expiresAt < new Date()) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(410).json({ success: false, error: "Session expired. Please sign in again." });
    }

    session.attempts += 1;
    if (session.attempts > 3) {
      await LoginSession.deleteOne({ sessionId });
      return res.status(429).json({ success: false, error: "Too many failed attempts. Please sign in again." });
    }
    await session.save();

    // 1. Check card selection
    if (selectedCardIndex !== session.secretCardIndex) {
      const remaining = 3 - session.attempts;
      if (remaining <= 0) {
        await LoginSession.deleteOne({ sessionId });
        return res.status(401).json({ success: false, error: "Too many failed attempts. Please sign in again." });
      }
      return res.status(401).json({
        success: false,
        error: `गलत कार्ड चुना। ${remaining} प्रयास बचे हैं।`,
      });
    }

    // 2. Check register inputs at the two secret positions
    const input1 = parseInt(registerInputs[session.secretPos1], 10);
    const input2 = parseInt(registerInputs[session.secretPos2], 10);

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
        error: `गलत अंक। ${remaining} प्रयास बचे हैं।`,
      });
    }

    await LoginSession.deleteOne({ sessionId });

    const user = await User.findById(session.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "पहचान सत्यापित। वापस आपका स्वागत है!",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[verify]", err);
    return res.status(500).json({ success: false, error: "Server error during verification." });
  }
});

/* ══════════════════════════════════════════════════════════════
   WEBAUTHN — PASSKEY (unchanged from previous version)
══════════════════════════════════════════════════════════════ */

router.post("/passkey/register-options", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const existingCredentials = (user.passkeyCredentials || []).map(c => ({
      id: c.credentialID, type: "public-key", transports: c.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME, rpID: RP_ID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email, userDisplayName: user.email,
      attestationType: "none",
      excludeCredentials: existingCredentials,
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });

    user.passkeyChallenge = options.challenge;
    await user.save();
    return res.json({ success: true, options });
  } catch (err) {
    console.error("[passkey/register-options]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/passkey/register-complete", verifyUserToken, async (req, res) => {
  try {
    const { response } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    if (!user.passkeyChallenge)
      return res.status(400).json({ success: false, error: "No pending challenge." });

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: `Passkey verification failed: ${e.message}` });
    }

    if (!verification.verified || !verification.registrationInfo)
      return res.status(400).json({ success: false, error: "Passkey registration not verified." });

    const { credential } = verification.registrationInfo;
    user.passkeyCredentials.push({
      credentialID:        Buffer.from(credential.id).toString("base64url"),
      credentialPublicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter:             credential.counter,
      transports:          response.response.transports || [],
    });
    user.passkeyChallenge = null;
    await user.save();
    return res.json({ success: true, message: "Passkey registered successfully." });
  } catch (err) {
    console.error("[passkey/register-complete]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/passkey/login-options", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passkeyCredentials?.length)
      return res.status(404).json({ success: false, error: "No passkey registered for this account." });

    const allowCredentials = user.passkeyCredentials.map(c => ({
      id: c.credentialID, type: "public-key", transports: c.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID, userVerification: "preferred", allowCredentials,
    });

    user.passkeyChallenge = options.challenge;
    await user.save();
    return res.json({ success: true, options });
  } catch (err) {
    console.error("[passkey/login-options]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/passkey/login-complete", async (req, res) => {
  try {
    const { email, response } = req.body;
    if (!email || !response)
      return res.status(400).json({ success: false, error: "email and response are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    if (!user.passkeyChallenge)
      return res.status(400).json({ success: false, error: "No pending challenge." });

    const storedCred = user.passkeyCredentials.find(c => c.credentialID === response.id);
    if (!storedCred)
      return res.status(400).json({ success: false, error: "Credential not found." });

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge:  user.passkeyChallenge,
        expectedOrigin:     RP_ORIGIN,
        expectedRPID:       RP_ID,
        credential: {
          id:         storedCred.credentialID,
          publicKey:  Buffer.from(storedCred.credentialPublicKey, "base64url"),
          counter:    storedCred.counter,
          transports: storedCred.transports,
        },
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: `Passkey verification failed: ${e.message}` });
    }

    if (!verification.verified)
      return res.status(401).json({ success: false, error: "Passkey authentication failed." });

    storedCred.counter    = verification.authenticationInfo.newCounter;
    user.passkeyChallenge = null;
    await user.save();

    // Passkey verified — still show the word grid for the visual layer
    const { sessionId, challengeGrid, registerLetters } = await createLoginSession(
      user._id, user.selectedWord, user.secretParts,
      user.offset, user.secretLetters, user.registerLetters,
      user.selectedWordLang
    );

    return res.json({ success: true, sessionId, challengeGrid, registerLetters });
  } catch (err) {
    console.error("[passkey/login-complete]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/forgot-password ─────────────────────────── */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ success: true, message: "If account exists, reset link sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken   = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: `"Visual Password Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Reset Your Password (valid for 15 minutes)",
      html: `<div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #eee">
          <h2 style="color:#0f172a">Password Reset — Scam2Safe</h2>
          <p style="color:#334155;font-size:14px">Click below to reset your password. Expires in <b>15 minutes</b>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 18px;background:linear-gradient(135deg,#06B6D4,#0891b2);color:white;text-decoration:none;border-radius:8px;font-weight:600">Reset Password</a>
          <p style="color:#64748b;font-size:12px">If the button doesn't work: <a href="${resetUrl}">${resetUrl}</a></p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#94a3b8;font-size:12px">If you didn't request this, ignore this email.</p>
        </div></div>`,
    });
    return res.json({ success: true, message: "If account exists, reset link sent." });
  } catch (err) {
    console.error("[forgot-password]", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/reset-password ──────────────────────────── */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, error: "Invalid or expired token." });

    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ success: true, message: "Password reset successful." });
  } catch (err) {
    console.error("[reset-password]", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/delete-user ─────────────────────────────── */
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

/* ── POST /api/auth/regenerate-api-key — admin-only stub ─── */
router.post("/regenerate-api-key", verifyUserToken, (_req, res) => {
  return res.status(403).json({
    success: false,
    error: "API key management has moved to the admin dashboard. Contact your administrator.",
  });
});

router.get("/test", (_req, res) => res.json({ message: "Auth route working ✓" }));

export default router;