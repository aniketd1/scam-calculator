// routes/auth.js — ESM
import express  from "express";
import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import crypto   from "crypto";
import User          from "../models/User.js";
import LoginSession  from "../models/LoginSession.js";
import { SENTENCES } from "../data/sentences.js";
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
const POSITIONS = ["A", "B", "C", "D", "E"];
const GRID_SIZE = 12;
const RP_NAME   = process.env.RP_NAME   || "Scam2Safe";
const RP_ID     = process.env.RP_ID     || "localhost";
const RP_ORIGIN = process.env.RP_ORIGIN || "http://localhost:3000";

const NOUN_WORDS = new Set([
  "boy","girl","dog","cat","bird","monkey","farmer","teacher","child","baby",
  "rabbit","chef","driver","ball","toy","stick","doll","dress","bone","mouse",
  "milk","nest","egg","banana","tree","seed","crops","tractor","book","chart",
  "house","flower","picture","rattle","bicycle","bell","park","rose","basket",
  "carrot","log","burrow","car","road","market","door","room","bag","box",
  "wall","plant","soil","field","clouds","letter","paper","spoon","cup",
  "table","kitchen","blocks","model","star","garden","kite","bucket",
  "vegetables","dinner","lesson","rope","question","answer",
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
  const result     = (secretValue + offset) % 100;
  const normalized = String(result).padStart(2, "0");
  const d1 = parseInt(normalized[0], 10);
  const d2 = parseInt(normalized[1], 10);
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

/* ── GET /api/auth/sentences ────────────────────────────────── */
router.get("/sentences", (_req, res) => {
  res.json({ success: true, sentences: SENTENCES });
});

/* ── GET /api/auth/profile ──────────────────────────────────── */
router.get("/profile", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, [
      "email", "wordpressSite", "wordpressUsername",
      "secretNouns", "secretPositions", "offset",
      "selectedSentence", "apiKeyHint", "apiKeyPrefix", "apiKeyCreatedAt",
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
        hasVisualPassword: (
          user.secretNouns?.length > 0 &&
          user.secretPositions?.length === 2 &&
          user.offset != null
        ),
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

/* ── POST /api/auth/complete-invite ─────────────────────────────
   User completes their account after admin created it.
   Body: { token, password, selectedSentence, secretPositions, offset,
           wordpressSite?, wordpressUsername? }
─────────────────────────────────────────────────────────────── */
router.post("/complete-invite", async (req, res) => {
  try {
    const {
      token, password, selectedSentence,
      secretPositions, offset,
      wordpressSite, wordpressUsername,
    } = req.body;

    if (!token || !password || !selectedSentence || !secretPositions || offset == null)
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      inviteToken:        hashedToken,
      inviteTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, error: "Invalid or expired invite link." });

    const secretNouns = extractNouns(selectedSentence);
    if (!secretNouns.length)
      return res.status(400).json({ success: false, error: "No recognisable nouns found in that sentence." });

    user.password          = password;
    user.selectedSentence  = selectedSentence;
    user.secretNouns       = secretNouns;
    user.secretPositions   = secretPositions;
    user.offset            = off;
    user.wordpressSite     = wordpressSite     || null;
    user.wordpressUsername = wordpressUsername || null;
    user.pendingSetup      = false;
    user.inviteToken       = null;
    user.inviteTokenExpires = null;
    await user.save();

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Account setup complete. Welcome!",
      token: jwtToken,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[complete-invite]", err);
    return res.status(500).json({ success: false, error: "Server error." });
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

    const { sessionId, challengeGrid } = await createLoginSession(user._id, user.secretNouns);
    return res.json({ success: true, sessionId, challengeGrid });
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

    const { sessionId, challengeGrid } = await createLoginSession(user._id, user.secretNouns);
    return res.json({ success: true, sessionId, challengeGrid });
  } catch (err) {
    console.error("[wordpress-login]", err);
    return res.status(500).json({ success: false, error: "Server error." });
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

/* ═══════════════════════════════════════════════════════════════
   WEBAUTHN — PASSKEY REGISTRATION (authenticated users)
   Used after normal login to register a passkey for future recovery.
═══════════════════════════════════════════════════════════════ */

/* ── POST /api/auth/passkey/register-options ────────────────── */
router.post("/passkey/register-options", verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const existingCredentials = (user.passkeyCredentials || []).map(c => ({
      id:         c.credentialID,
      type:       "public-key",
      transports: c.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName:                  RP_NAME,
      rpID:                    RP_ID,
      userID:                  Buffer.from(user._id.toString()),
      userName:                user.email,
      userDisplayName:         user.email,
      attestationType:         "none",
      excludeCredentials:      existingCredentials,
      authenticatorSelection:  {
        residentKey:       "preferred",
        userVerification:  "preferred",
      },
    });

    // Save challenge temporarily
    user.passkeyChallenge = options.challenge;
    await user.save();

    return res.json({ success: true, options });
  } catch (err) {
    console.error("[passkey/register-options]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/passkey/register-complete ───────────────── */
router.post("/passkey/register-complete", verifyUserToken, async (req, res) => {
  try {
    const { response } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    if (!user.passkeyChallenge)
      return res.status(400).json({ success: false, error: "No pending challenge. Call register-options first." });

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: user.passkeyChallenge,
        expectedOrigin:    RP_ORIGIN,
        expectedRPID:      RP_ID,
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

/* ═══════════════════════════════════════════════════════════════
   WEBAUTHN — PASSKEY LOGIN (account recovery / bypass visual pw)
═══════════════════════════════════════════════════════════════ */

/* ── POST /api/auth/passkey/login-options ───────────────────── */
router.post("/passkey/login-options", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: "email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passkeyCredentials?.length)
      return res.status(404).json({ success: false, error: "No passkey registered for this account." });

    const allowCredentials = user.passkeyCredentials.map(c => ({
      id:         c.credentialID,
      type:       "public-key",
      transports: c.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID:             RP_ID,
      userVerification: "preferred",
      allowCredentials,
    });

    user.passkeyChallenge = options.challenge;
    await user.save();

    return res.json({ success: true, options });
  } catch (err) {
    console.error("[passkey/login-options]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/passkey/login-complete ──────────────────── */
router.post("/passkey/login-complete", async (req, res) => {
  try {
    const { email, response } = req.body;
    if (!email || !response)
      return res.status(400).json({ success: false, error: "email and response are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    if (!user.passkeyChallenge)
      return res.status(400).json({ success: false, error: "No pending challenge. Call login-options first." });

    // Find the matching credential
    const credentialID = response.id;
    const storedCred   = user.passkeyCredentials.find(c => c.credentialID === credentialID);
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

    // Update counter to prevent replay attacks
    storedCred.counter    = verification.authenticationInfo.newCounter;
    user.passkeyChallenge = null;
    await user.save();

    // Issue JWT — passkey bypasses the visual password challenge
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Passkey verified. Welcome back!",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("[passkey/login-complete]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/regenerate-api-key ─────────────────────────
   REMOVED — API key management is now admin-only.
   Kept as a stub that returns a clear error so old clients get a
   useful message instead of a 404.
─────────────────────────────────────────────────────────────── */
router.post("/regenerate-api-key", verifyUserToken, (_req, res) => {
  return res.status(403).json({
    success: false,
    error: "API key management has moved to the admin dashboard. Contact your administrator.",
  });
});

/* ── POST /api/auth/signup ──────────────────────────────────────
   Direct self-registration (no admin invite required).
   Creates user, returns JWT. No API key generated.
   Passkey registration is handled separately by the frontend
   immediately after this call succeeds.
   Body: { email, password, selectedSentence,
           secretPositions, offset,
           wordpressSite?, wordpressUsername? }
─────────────────────────────────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const {
      email, password, selectedSentence,
      secretPositions, offset,
      wordpressSite, wordpressUsername,
    } = req.body;

    /* ── basic field validation ── */
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

    /* ── duplicate check ── */
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, error: "An account with that email already exists." });

    /* ── extract secret nouns from sentence ── */
    const secretNouns = extractNouns(selectedSentence);
    if (!secretNouns.length)
      return res.status(400).json({
        success: false,
        error: "No recognisable nouns found in that sentence. Try a different one.",
      });

    /* ── create user ── */
    const user = new User({
      email:             email.toLowerCase().trim(),
      password,                          // pre-save hook hashes this
      selectedSentence,
      secretNouns,
      secretPositions,
      offset:            off,
      wordpressSite:     wordpressSite     || null,
      wordpressUsername: wordpressUsername || null,
      pendingSetup:      false,           // self-registered users are immediately active
    });

    await user.save();

    /* ── issue JWT ── */
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

/* ── POST /api/auth/forgot-password ─────────────────────────── */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.json({ success: true, message: "If account exists, reset link sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken   = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
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
            We received a request to reset your password. Click below — expires in <b>15 minutes</b>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 18px;background:linear-gradient(135deg,#06B6D4,#0891b2);color:white;text-decoration:none;border-radius:8px;font-weight:600">
            Reset Password
          </a>
          <p style="color:#64748b;font-size:12px;">
            If the button doesn't work: <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#94a3b8;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
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
    if (!user)
      return res.status(400).json({ success: false, error: "Invalid or expired token." });

    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
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
          <p style="color:#334155;font-size:14px">Your password has been successfully changed. If this was not you, contact support immediately.</p>
        </div>
      </div>`,
    });

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

router.get("/test", (_req, res) => res.json({ message: "Auth route working ✓" }));

export default router;