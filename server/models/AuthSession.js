import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stage: {
    type: String,
    enum: ["challenge", "verified"],
    default: "challenge",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const AuthSession = mongoose.models.AuthSession || mongoose.model("AuthSession", authSessionSchema);
