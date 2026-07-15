import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TransactionSession from "../models/TransactionSession.js";
import verifySdkApiKey from "../middleware/verifySdkApiKey.js";
import {
  amountCode,
  amountToMinor,
  buildRecipientRegister,
  buildWordGrid,
  recipientMarkers,
  transactionFingerprint,
} from "../utils/sdkChallenge.js";

const router = express.Router();
const SESSION_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL = "5m";
const MAX_ATTEMPTS = 3;
const buckets = new Map();

function rateLimit(limit, windowMs) {
  return (req, res, next) => {
    const key = `${req.organisation?._id || req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
    }
    next();
  };
}

function sdkSecret() {
  return process.env.SDK_JWT_SECRET || process.env.JWT_SECRET;
}

function validTransactionId(value) {
  return typeof value === "string" && value.trim().length >= 4 && value.trim().length <= 128;
}

function challengeResponse(sessionId, challengeGrid, registerLetters, expiresAt, extra = {}) {
  return {
    success: true,
    sessionId,
    challengeGrid,
    registerLetters,
    expiresAt: expiresAt.toISOString(),
    expiresInSeconds: SESSION_TTL_MS / 1000,
    ...extra,
  };
}

function issueVerificationToken(session) {
  const secret = sdkSecret();
  if (!secret) throw new Error("SDK_JWT_SECRET or JWT_SECRET must be configured.");
  return jwt.sign(
    {
      scope: session.purpose === "transaction" ? "sdk:transaction" : "sdk:recovery",
      sub: String(session.userId),
      org: String(session.organisationId),
      sid: session.sessionId,
      tx: session.transactionHash || undefined,
    },
    secret,
    { algorithm: "HS256", audience: "scam2safe-sdk", issuer: "scam2safe", expiresIn: TOKEN_TTL, jwtid: crypto.randomUUID() }
  );
}

async function createTransactionChallenge(req, res) {
  const { email, transactionId, amount, currency = "INR", recipientName } = req.body;
  if (!email || !validTransactionId(transactionId) || amount === undefined || !recipientName) {
    return res.status(400).json({ success: false, error: "email, transactionId, amount and recipientName are required." });
  }
  const money = amountToMinor(amount, currency);
  if (!money) return res.status(400).json({ success: false, error: "amount must be a positive value with at most two decimal places." });
  const markers = recipientMarkers(recipientName);
  if (!markers) return res.status(400).json({ success: false, error: "recipientName must contain at least two distinct letters or digits." });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || user.pendingSetup) return res.status(404).json({ success: false, error: "No eligible Scam2Safe user was found." });
  const { grid, secretValue } = buildWordGrid(user);
  const { registerLetters, markerPositions } = buildRecipientRegister(markers);
  const fingerprint = transactionFingerprint({ transactionId: transactionId.trim(), ...money, recipientName });
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const sessionId = crypto.randomUUID();
  const expectedDigits = amountCode(money.amountMinor, secretValue);

  try {
    await TransactionSession.create({
      sessionId, organisationId: req.organisation._id, userId: user._id, purpose: "transaction",
      transactionId: transactionId.trim(), transactionHash: fingerprint, ...money,
      recipientInitials: markers, registerLetters, markerPositions, expectedDigits, expiresAt,
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, error: "An active challenge already exists for this transaction. Use its session or wait for it to expire." });
    throw error;
  }

  console.info(`[sdk/transaction/start] org=${req.organisation._id} session=${sessionId}`);
  return res.status(201).json(challengeResponse(sessionId, grid, registerLetters, expiresAt, {
    transactionId: transactionId.trim(), recipientInitials: markers,
    verificationRule: "Add the selected visual-word card value to the last two digits of the amount. Enter the resulting two-digit code in the positions marked by the recipient initials.",
  }));
}

router.get("/ping", (_req, res) => res.json({ success: true, status: "ok", service: "scam2safe-sdk" }));
router.get("/version", (_req, res) => res.json({ success: true, version: "1.0.0" }));

// Limit unauthenticated traffic too, so invalid-key requests cannot be used to
// exhaust database lookups. The second limit is keyed by organisation.
router.use(rateLimit(120, 60 * 1000));
router.use(verifySdkApiKey);
router.use(rateLimit(60, 60 * 1000));

router.post("/transaction/start", async (req, res) => {
  try {
    return await createTransactionChallenge(req, res);
  } catch (error) {
    console.error("[sdk/transaction/start]", error);
    return res.status(500).json({ success: false, error: "Unable to start transaction verification." });
  }
});

router.post("/transaction/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;
    if (typeof sessionId !== "string" || !Array.isArray(registerInputs) || registerInputs.length !== 5) {
      return res.status(400).json({ success: false, error: "sessionId and exactly five registerInputs are required." });
    }
    const session = await TransactionSession.findOne({ sessionId, organisationId: req.organisation._id });
    if (!session) return res.status(404).json({ success: false, error: "Challenge not found or already consumed." });
    if (session.expiresAt <= new Date()) return res.status(410).json({ success: false, error: "Challenge expired. Start a new transaction verification." });
    if (session.status !== "challenge") return res.status(409).json({ success: false, error: "Challenge has already been used." });

    const suppliedRaw = session.markerPositions.map(position => registerInputs[position]);
    const validFormat = suppliedRaw.length === 2 && suppliedRaw.every(value =>
      (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 9) ||
      (typeof value === "string" && /^[0-9]$/.test(value))
    );
    const supplied = suppliedRaw.map(Number);
    const valid = validFormat && supplied[0] === session.expectedDigits[0] && supplied[1] === session.expectedDigits[1];
    if (!valid) {
      const updated = await TransactionSession.findOneAndUpdate(
        { _id: session._id, status: "challenge" }, { $inc: { attempts: 1 } }, { new: true }
      );
      const remaining = Math.max(0, MAX_ATTEMPTS - (updated?.attempts || MAX_ATTEMPTS));
      if (!updated || remaining === 0) {
        await TransactionSession.deleteOne({ _id: session._id, status: "challenge" });
        return res.status(401).json({ success: false, error: "Incorrect code. Challenge invalidated." });
      }
      return res.status(401).json({ success: false, error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` });
    }

    const consumed = await TransactionSession.findOneAndUpdate(
      { _id: session._id, status: "challenge", expiresAt: { $gt: new Date() } },
      { $set: { status: "verified", verifiedAt: new Date() } }, { new: true }
    );
    if (!consumed) return res.status(409).json({ success: false, error: "Challenge has already been used or expired." });

    const verificationToken = issueVerificationToken(consumed);
    console.info(`[sdk/transaction/verify] org=${req.organisation._id} session=${sessionId} verified=true`);
    return res.json({
      success: true, verified: true, recovery: consumed.purpose === "recovery",
      verificationToken, tokenType: "Bearer", expiresIn: 300,
      ...(consumed.purpose === "transaction" ? { transactionId: consumed.transactionId } : {}),
    });
  } catch (error) {
    console.error("[sdk/transaction/verify]", error);
    return res.status(500).json({ success: false, error: "Unable to verify transaction." });
  }
});

router.post("/recovery/start", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email is required." });
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || user.pendingSetup) return res.status(404).json({ success: false, error: "No eligible Scam2Safe user was found." });
    if (!Array.isArray(user.registerLetters) || user.registerLetters.length !== 5 || !Array.isArray(user.secretLetters) || user.secretLetters.length !== 2 || user.offset === null) {
      return res.status(409).json({ success: false, error: "This user has not completed visual-password setup." });
    }
    const { grid, secretValue } = buildWordGrid(user);
    const markerPositions = user.secretLetters.map(letter => user.registerLetters.indexOf(letter));
    if (markerPositions.some(position => position < 0)) return res.status(409).json({ success: false, error: "User visual-password setup is invalid." });
    const expectedDigits = String((Number(user.offset) + secretValue) % 100).padStart(2, "0").split("").map(Number);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const sessionId = crypto.randomUUID();
    await TransactionSession.create({ sessionId, organisationId: req.organisation._id, userId: user._id, purpose: "recovery", registerLetters: user.registerLetters, markerPositions, expectedDigits, expiresAt });
    return res.status(201).json(challengeResponse(sessionId, grid, user.registerLetters, expiresAt, { recovery: true }));
  } catch (error) {
    console.error("[sdk/recovery/start]", error);
    return res.status(500).json({ success: false, error: "Unable to start recovery verification." });
  }
});

export default router;
