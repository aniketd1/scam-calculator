import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ══════════════════════════════════════════════════════════════
   WEBAUTHN — PASSKEY
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

export default router;
