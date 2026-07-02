import mongoose from "mongoose";
import crypto   from "crypto";

const orgSchema = new mongoose.Schema({
  // Who they are
    orgName:       { type: String, required: true },
    orgType:       { type: String, enum: ["college", "hospital", "corporate", "other"], required: true },
    contactName:   { type: String, required: true },
    contactEmail:  { type: String, required: true, unique: true, lowercase: true },
    contactPhone:  { type: String },
    website:       { type: String },

    // API access
    apiKey:        { type: String },          // null until approved
    apiKeyHash:    { type: String },          // bcrypt/sha256 of the key
    apiKeyCreatedAt: { type: Date },

    // Approval
    status:        { type: String, enum: ["pending", "approved", "suspended"], default: "pending" },
    approvedAt:    { type: Date },
    approvedBy:    { type: String },          // admin email
    notes:         { type: String },          // internal admin notes

}, { timestamps: true });

// Generate a new API key — call this on approval
orgSchema.methods.generateApiKey = function () {
    const raw     = `s2s_${crypto.randomBytes(32).toString("hex")}`;
    this.apiKey   = raw;                      // store plain only briefly — send to org then clear if you want extra security
    this.apiKeyHash     = crypto.createHash("sha256").update(raw).digest("hex");
    this.apiKeyCreatedAt = new Date();
    return raw;  // return once so you can email it
};

// Verify an incoming key
orgSchema.methods.verifyApiKey = function (incoming) {
    const hash = crypto.createHash("sha256").update(incoming).digest("hex");
    return hash === this.apiKeyHash;
};

export default mongoose.model("Organisation", orgSchema);