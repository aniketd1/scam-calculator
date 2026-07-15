import crypto from "crypto";
import Organisation from "../models/Organisation.js";

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

    const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const organisation = await Organisation.findOne({ status: "approved", apiKeyHash });
    if (!organisation) {
      return res.status(401).json({ success: false, error: "Invalid or inactive API key." });
    }

    req.organisation = organisation;
    next();
  } catch (error) {
    console.error("[sdk/api-key]", error);
    return res.status(500).json({ success: false, error: "Unable to authenticate API key." });
  }
}
