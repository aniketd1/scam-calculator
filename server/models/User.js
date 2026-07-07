// models/User.js — ESM
// Word-based visual password system.
// Old sentence fields preserved but inactive (see BACKUP comments).

import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import crypto   from "crypto";

const PasskeyCredentialSchema = new mongoose.Schema({
  credentialID:        { type: String, required: true },
  credentialPublicKey: { type: String, required: true },
  counter:             { type: Number, required: true, default: 0 },
  transports:          [String],
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: false,
      default: null,
    },

    /* ── Word-based visual password ─────────────────────────── */
    selectedWord: {
      type:    String,
      default: null,
    },
    selectedWordLang: {
      type:    String,
      enum:    ["en", "hi", "mr"],
      default: "en",
    },
    // e.g. ["Ra","me","sh"] or ["Mo","bi","le"]
    secretParts: {
      type:    [String],
      default: [],
    },
    // 2 letters the user chose, e.g. ["R","Y"]
    secretLetters: {
      type:    [String],
      default: [],
    },
    // 5 fixed letters for this user's register row (contains secretLetters)
    registerLetters: {
      type:    [String],
      default: [],
    },
    // 10–99
    offset: {
      type:    Number,
      default: null,
    },
    // true = WordPress single-word flow
    wpFlow: {
      type:    Boolean,
      default: true,
    },

    /* ── BACKUP: sentence-based fields (inactive) ─────────────
    selectedSentence: { type: String, default: null },
    secretNouns:      { type: [String], default: [] },
    secretPositions:  { type: [String], default: [] },
    ── end backup ── */

    /* ── WordPress / invite ─────────────────────────────────── */
    wordpressSite:     { type: String, default: null },
    wordpressUsername: { type: String, default: null },
    pendingSetup:      { type: Boolean, default: false },
    inviteToken:       { type: String,  default: null },
    inviteTokenExpires:{ type: Date,    default: null },

    // One entry per (email + domain) registration
    apiKeys: {
      type: [{
        keyHash:   { type: String, required: true },
        keyHint:   { type: String },           // last 4 chars
        keyPrefix: { type: String },           // first 8 chars
        domain:    { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

const normalizeDomain = d => d
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "")
  .replace(/\/.*$/, "")
  .trim();

// Generate a new key for a specific domain.
// If that domain already has a key, it gets replaced.
UserSchema.methods.generateApiKey = async function (domain) {
  if (!domain) throw new Error("domain is required.");
  const normalized = normalizeDomain(domain);
  const rawKey     = crypto.randomBytes(32).toString("hex");
  const keyHash    = await bcrypt.hash(rawKey, 10);

  // Remove existing entry for this domain if any
  this.apiKeys = this.apiKeys.filter(k => k.domain !== normalized);

  // Add new entry
  this.apiKeys.push({
    keyHash,
    keyHint:   rawKey.slice(-4),
    keyPrefix: rawKey.slice(0, 8),
    domain:    normalized,
    createdAt: new Date(),
  });

  return rawKey;
};

// Verify: find the entry for this domain, then check the key
UserSchema.methods.verifyApiKey = async function (rawKey, incomingDomain) {
  if (!this.apiKeys?.length) return false;
  const normalized = normalizeDomain(incomingDomain);
  const entry = this.apiKeys.find(k => k.domain === normalized);
  if (!entry) return false;  // this user not registered for this domain
  return bcrypt.compare(rawKey, entry.keyHash);
};

// Revoke key for a specific domain
UserSchema.methods.revokeApiKey = function (domain) {
  const normalized = normalizeDomain(domain);
  this.apiKeys = this.apiKeys.filter(k => k.domain !== normalized);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", UserSchema);