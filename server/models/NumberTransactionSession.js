import mongoose from "mongoose";

const numberTransactionSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  apiKeyOwnerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  purpose: { type: String, enum: ["transaction", "recovery"], default: "transaction" },
  transactionId: { type: String },
  transactionHash: { type: String, unique: true, sparse: true },
  boxes: { type: Array, required: true },
  registerLetters: { type: [String], required: true },
  expectedD1: { type: Number, required: true },
  expectedD2: { type: Number, required: true },
  pos1: { type: Number, required: true },
  pos2: { type: Number, required: true },
  status: { type: String, enum: ["challenge", "verified"], default: "challenge" },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  verifiedAt: { type: Date },
});

export default mongoose.model("NumberTransactionSession", numberTransactionSessionSchema);