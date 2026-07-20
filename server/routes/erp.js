import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ── POST /api/auth/erp-login ────────────────────────────────
   Generic ERP integration — identical logic to wordpress-login
   but named neutrally. Share this with college / hospital ERPs.
   They send the user's email + their API key, get back a session.
─────────────────────────────────────────────────────────────── */
router.post("/erp-login", async (req, res) => {
  try {
    const { email, apiKey } = req.body;
    if (!email || !apiKey)
      return res.status(400).json({ success: false, error: "email and apiKey are required." });

    // Validate against the shared User.apiKeys infrastructure.
    const keyPrefix = apiKey.slice(0, 8);
    const keyOwners = await User.find({ "apiKeys.keyPrefix": keyPrefix });
    const valid = (await Promise.all(keyOwners.flatMap(owner =>
      owner.apiKeys
        .filter(key => key.keyPrefix === keyPrefix)
        .map(key => bcrypt.compare(apiKey, key.keyHash))
    ))).some(Boolean);
    if (!valid)
      return res.status(401).json({ success: false, error: "Invalid or inactive API key." });

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({
        success: false,
        error: "No Scam2Safe account found for this email.",
      });

    const { sessionId, challengeGrid, registerLetters } = await createLoginSession(
      user._id, user.selectedWord, user.secretParts,
      user.offset, user.secretLetters, user.registerLetters,
      user.selectedWordLang
    );

    return res.json({ success: true, sessionId, challengeGrid, registerLetters, expiresInSeconds: 600 });

  } catch (err) {
    console.error("[erp-login]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

/* ── POST /api/auth/verify-erp-token ────────────────────────
   ERPs call this after receiving the JWT from the callback URL
   to confirm it's genuine and get the user's identity.
   Replaces verify-wp-token with a neutral name.
─────────────────────────────────────────────────────────────── */
router.post("/verify-erp-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ success: false, error: "token is required." });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Invalid or expired token." });
    }

    // Optionally look up the user to confirm account still exists
    const user = await User.findById(decoded.userId, ["email", "pendingSetup"]);
    if (!user)
      return res.status(404).json({ success: false, error: "User account no longer exists." });

    if (user.pendingSetup)
      return res.status(403).json({ success: false, error: "Account setup incomplete." });

    return res.json({
      success: true,
      userId: decoded.userId,
      email: decoded.email,
      // ERPs can use this to create their own local session
      verifiedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("[verify-erp-token]", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

export default router;
