// models/LoginSession.js
import mongoose from "mongoose";

const LoginSessionSchema = new mongoose.Schema({
  sessionId:     { type: String, required: true, unique: true, index: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challengeGrid: { type: Array, required: true },
  revealedItem:  {
    noun:  { type: String, required: true },
    value: { type: Number, required: true },
  },
  // Stored after /register call
  register:   { type: [Number], default: null },  // 5 digits A–E
  expectedD1: { type: Number,   default: null },  // tens digit of (value + offset)
  expectedD2: { type: Number,   default: null },  // units digit
  attempts:   { type: Number,   default: 0 },
  expiresAt:  { type: Date,     required: true, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

export default mongoose.model("LoginSession", LoginSessionSchema);