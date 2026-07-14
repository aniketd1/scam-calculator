// models/UpiSession.js — ESM
// Temporary verification session for UPI Visual Password.

import mongoose from "mongoose";

const UpiSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UpiUser",
      required: true,
    },

    // The 5-letter register shown to the user
    registerLetters: {
      type: [String],
      required: true,
      validate: arr => arr.length === 5,
    },

    // Positions of the recipient's initials
    posIdx1: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },

    posIdx2: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },

    // Expected digits at those positions
    expectedD1: {
      type: Number,
      required: true,
      min: 0,
      max: 9,
    },

    expectedD2: {
      type: Number,
      required: true,
      min: 0,
      max: 9,
    },

    // Failed attempts
    attempts: {
      type: Number,
      default: 0,
    },

    // Session expiry
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UpiSession", UpiSessionSchema);