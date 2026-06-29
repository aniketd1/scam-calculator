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
      required: true,
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

    /* ── API key (admin-issued) ─────────────────────────────── */
    apiKeyHash:      { type: String, default: null },
    apiKeyHint:      { type: String, default: null },   // last 4 chars
    apiKeyPrefix:    { type: String, default: null },   // first 8 chars
    apiKeyCreatedAt: { type: Date,   default: null },

    /* ── Passkeys ───────────────────────────────────────────── */
    passkeyCredentials: { type: [PasskeyCredentialSchema], default: [] },
    passkeyChallenge:   { type: String, default: null },

    /* ── Password reset ─────────────────────────────────────── */
    resetPasswordToken:   { type: String, default: null },
    resetPasswordExpires: { type: Date,   default: null },
  },
  { timestamps: true }
);

/* ── pre-save: hash password ── */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ── generateApiKey — called by admin route ── */
UserSchema.methods.generateApiKey = async function () {
  const rawKey        = crypto.randomBytes(32).toString("hex");
  this.apiKeyHash     = await bcrypt.hash(rawKey, 10);
  this.apiKeyHint     = rawKey.slice(-4);
  this.apiKeyPrefix   = rawKey.slice(0, 8);
  this.apiKeyCreatedAt = new Date();
  return rawKey;
};

/* ── verifyApiKey ── */
UserSchema.methods.verifyApiKey = async function (rawKey) {
  if (!this.apiKeyHash) return false;
  return bcrypt.compare(rawKey, this.apiKeyHash);
};

export default mongoose.model("User", UserSchema);