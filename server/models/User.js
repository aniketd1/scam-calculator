// models/User.js
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import crypto   from "crypto";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
    },
    password: { type: String, default: "" },
    selectedSentence: {
      type: String, required: true,
    },
    wordpressSite: {
      type: String, default: null,
    },
    wordpressUsername: {
      type: String, default: null,
    },
    secretNouns: {
      type: [String], default: [],
    },
    secretPositions: {
      type: [String], default: [],
    },
    offset: {
      type: Number, required: true,
    },
    // API key — generated on signup, used by WordPress plugin
    // Stored as a bcrypt hash; the raw key is shown once at signup
    apiKeyHash: {
      type: String, default: null,
    },
    // Last 6 chars of the raw key — shown in dashboard so user can identify it
    apiKeyHint: {
      type: String, default: null,
    },
    apiKeyPrefix: {
      type: String,
      default: null,
      index: true, 
    },
    apiKeyCreatedAt: {
      type: Date, default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    passkeyEnabled: {
      type: Boolean,
      default: false
    },

    pendingSetup: { type: Boolean, default: false },
    inviteToken:  { type: String, default: null },
    inviteTokenExpires: { type: Date, default: null },

    passkeyCredentials: [{
      credentialID:        { type: String, required: true }, // base64url
      credentialPublicKey: { type: String, required: true }, // base64url
      counter:             { type: Number, default: 0 },
      transports:          [String],
      createdAt:           { type: Date,   default: Date.now },
    }],
    passkeyChallenge: { type: String, default: null },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Verify a raw API key against the stored hash
UserSchema.methods.verifyApiKey = async function (rawKey) {
  if (!this.apiKeyHash) return false;
  return bcrypt.compare(rawKey, this.apiKeyHash);
};

// Generate a new API key, store its hash, return the raw key (shown once)
UserSchema.methods.generateApiKey = async function () {
  const raw = "s2s_" + crypto.randomBytes(32).toString("hex");

  // store prefix (first 10 chars for lookup)
  this.apiKeyPrefix = raw.slice(0, 10);

  // hash full key
  this.apiKeyHash = await bcrypt.hash(raw, 10);

  // store hint (last 6 chars for UI)
  this.apiKeyHint = raw.slice(-6);

  this.apiKeyCreatedAt = new Date();

  return raw;
};

export default mongoose.model("User", UserSchema);