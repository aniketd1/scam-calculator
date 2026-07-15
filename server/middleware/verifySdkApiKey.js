import bcrypt from "bcryptjs";
import User from "../models/User.js";

const keyFromRequest = req => {
  const headerKey = req.get("x-api-key");
  if (headerKey) return headerKey.trim();
  const authorization = req.get("authorization") || "";
  return authorization.startsWith("ApiKey ") ? authorization.slice(7).trim() : null;
};

export default async function verifySdkApiKey(req, res, next) {
  try {
    const apiKey = keyFromRequest(req);
    if (!apiKey) {
      return res.status(401).json({ success: false, error: "An API key is required." });
    }

    // API keys are bcrypt-hashed, so use the non-secret prefix only to locate
    // a candidate record before verifying the complete key.
    const keyPrefix = apiKey.slice(0, 8);
    const users = await User.find({ "apiKeys.keyPrefix": keyPrefix });
    let sdkUser = null;
    let apiKeyEntry = null;
    for (const user of users) {
      for (const entry of user.apiKeys.filter(candidate => candidate.keyPrefix === keyPrefix)) {
        if (await bcrypt.compare(apiKey, entry.keyHash)) {
          sdkUser = user;
          apiKeyEntry = entry;
          break;
        }
      }
      if (sdkUser) break;
    }

    if (!sdkUser) {
      return res.status(401).json({ success: false, error: "Invalid or inactive API key." });
    }

    req.sdkUser = sdkUser;
    req.apiKey = apiKeyEntry;
    next();
  } catch (error) {
    console.error("[sdk/api-key]", error);
    return res.status(500).json({ success: false, error: "Unable to authenticate API key." });
  }
}
