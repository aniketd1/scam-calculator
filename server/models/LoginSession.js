// models/LoginSession.js — ESM
// Word-based visual password system.

import mongoose from "mongoose";

const LoginSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    /* ── Challenge grid ─────────────────────────────────────── */
    // Array of { mask: "Ra _ _", value: 7 }
    challengeGrid: {
      type:    [mongoose.Schema.Types.Mixed],
      default: [],
    },
    // Which index in challengeGrid is the user's secret card
    secretCardIndex: {
      type:    Number,
      default: null,
    },
    // The 1–9 value shown on the secret card
    secretValue: {
      type:    Number,
      default: null,
    },

    /* ── Register row ───────────────────────────────────────── */
    // The 5 fixed letters for this user e.g. ["F","R","K","O","Y"]
    registerLetters: {
      type:    [String],
      default: [],
    },
    // Expected digits at the two secret positions
    expectedD1: { type: Number, default: null },
    expectedD2: { type: Number, default: null },
    // Indices in registerLetters where the secret letters sit
    secretPos1: { type: Number, default: null },
    secretPos2: { type: Number, default: null },

    /* ── Attempt tracking ───────────────────────────────────── */
    attempts: {
      type:    Number,
      default: 0,
    },
    expiresAt: {
      type:     Date,
      required: true,
      index:    { expires: 0 },   // TTL index — MongoDB auto-deletes expired docs
    },
  },
  { timestamps: true }
);

export default mongoose.model("LoginSession", LoginSessionSchema);