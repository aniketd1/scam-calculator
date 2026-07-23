import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import NumberUser from "../models/NumberUser.js";
import NumberTransactionSession from "../models/NumberTransactionSession.js";
import verifySdkApiKey from "../middleware/verifySdkApiKey.js";
import { transactionFingerprint } from "../utils/sdkChallenge.js"; // reuse existing helper

const router = express.Router();
const SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const TOKEN_TTL = "5m";

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
    const circled = randomNumberByDigits(1);
    return { name, numbers, circled };
  });

  return { boxes, secretBoxIndex };
}

function issueVerificationToken(session) {
  const secret = process.env.SDK_JWT_SECRET || process.env.JWT_SECRET;
  return jwt.sign(
    {
      scope: "sdk:transaction",
      sub: String(session.userId),
      sdk: String(session.apiKeyOwnerId),
      sid: session.sessionId,
      tx: session.transactionHash || undefined,
    },
    secret,
    { algorithm: "HS256", audience: "scam2safe-sdk", issuer: "scam2safe", expiresIn: TOKEN_TTL, jwtid: crypto.randomUUID() }
  );
}

router.use(verifySdkApiKey);

// Equivalent of /transaction/start, but number-box based
router.post("/transaction/start", async (req, res) => {
  try {
    const { email, transactionId } = req.body;
    if (!email || typeof transactionId !== "string" || transactionId.trim().length < 4) {
      return res.status(400).json({ success: false, error: "email and transactionId are required." });
    }

    const user = await NumberUser.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, error: "No eligible Scam2Safe user was found." });
    }

    const { boxes, secretBoxIndex } = buildBoxGrid(user.secretNumber);
    const correctCircled = boxes[secretBoxIndex].circled;
    const result = (user.secretNumber + user.secretMargin + correctCircled) % 100;
    const normalized = String(result).padStart(2, "0");
    const d1 = parseInt(normalized[0], 10);
    const d2 = parseInt(normalized[1], 10);
    const pos1 = user.registerLetters.indexOf(user.secretPositions[0]);
    const pos2 = user.registerLetters.indexOf(user.secretPositions[1]);

    const clientBoxes = boxes.map(({ name, numbers, circled }) => ({ name, numbers, circled }));
    const fingerprint = transactionFingerprint({ transactionId: transactionId.trim(), userId: String(user._id) });
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const sessionId = crypto.randomUUID();

    try {
      await NumberTransactionSession.create({
        sessionId, apiKeyOwnerId: req.sdkUser._id, userId: user._id, purpose: "transaction",
        transactionId: transactionId.trim(), transactionHash: fingerprint,
        boxes: clientBoxes, registerLetters: user.registerLetters,
        expectedD1: d1, expectedD2: d2, pos1, pos2, expiresAt,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, error: "An active challenge already exists for this transaction." });
      }
      throw error;
    }

    console.info(`[sdk/number-transaction/start] owner=${req.sdkUser._id} session=${sessionId}`);
    return res.status(201).json({
      success: true,
      sessionId,
      boxes: clientBoxes,
      registerLetters: user.registerLetters,
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: SESSION_TTL_MS / 1000,
      transactionId: transactionId.trim(),
    });
  } catch (error) {
    console.error("[sdk/number-transaction/start]", error);
    return res.status(500).json({ success: false, error: "Unable to start transaction verification." });
  }
});

// Equivalent of /transaction/verify, but number-box based
router.post("/transaction/verify", async (req, res) => {
  try {
    const { sessionId, registerInputs } = req.body;
    if (typeof sessionId !== "string" || !Array.isArray(registerInputs) || registerInputs.length !== 5) {
      return res.status(400).json({ success: false, error: "sessionId and exactly five registerInputs are required." });
    }

    const session = await NumberTransactionSession.findOne({ sessionId, apiKeyOwnerId: req.sdkUser._id });
    if (!session) return res.status(404).json({ success: false, error: "Challenge not found or already consumed." });
    if (session.expiresAt <= new Date()) return res.status(410).json({ success: false, error: "Challenge expired. Start a new transaction verification." });
    if (session.status !== "challenge") return res.status(409).json({ success: false, error: "Challenge has already been used." });

    const input1 = parseInt(registerInputs[session.pos1], 10);
    const input2 = parseInt(registerInputs[session.pos2], 10);
    const validFormat = !isNaN(input1) && !isNaN(input2);
    const match = validFormat && (
      (input1 === session.expectedD1 && input2 === session.expectedD2) ||
      (input1 === session.expectedD2 && input2 === session.expectedD1)
    );

    if (!match) {
      const updated = await NumberTransactionSession.findOneAndUpdate(
        { _id: session._id, status: "challenge" }, { $inc: { attempts: 1 } }, { new: true }
      );
      const remaining = Math.max(0, MAX_ATTEMPTS - (updated?.attempts || MAX_ATTEMPTS));
      if (!updated || remaining === 0) {
        await NumberTransactionSession.deleteOne({ _id: session._id, status: "challenge" });
        return res.status(401).json({ success: false, error: "Incorrect code. Challenge invalidated." });
      }
      return res.status(401).json({ success: false, error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` });
    }

    const consumed = await NumberTransactionSession.findOneAndUpdate(
      { _id: session._id, status: "challenge", expiresAt: { $gt: new Date() } },
      { $set: { status: "verified", verifiedAt: new Date() } }, { new: true }
    );
    if (!consumed) return res.status(409).json({ success: false, error: "Challenge has already been used or expired." });

    const verificationToken = issueVerificationToken(consumed);
    console.info(`[sdk/number-transaction/verify] owner=${req.sdkUser._id} session=${sessionId} verified=true`);
    return res.json({
      success: true, verified: true,
      verificationToken, tokenType: "Bearer", expiresIn: 300,
      transactionId: consumed.transactionId,
    });
  } catch (error) {
    console.error("[sdk/number-transaction/verify]", error);
    return res.status(500).json({ success: false, error: "Unable to verify transaction." });
  }
});

export default router;