// models/LoginSession.js
import mongoose from "mongoose";

const LoginSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Server-authoritative challenge grid: [{ noun, value }, ...]
    challengeGrid: [
      {
        noun:  { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
    // The one secret noun entry shown to client (first secretNoun found in grid)
    revealedItem: {
      noun:  { type: String, default: null },
      value: { type: Number, default: null },
    },
    // Auto-expire after 10 minutes (MongoDB TTL)
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600,
    },
  }
);

export default mongoose.model("LoginSession", LoginSessionSchema);