import mongoose from "mongoose";

// An SDK challenge is deliberately separate from a login session: it is bound
// to one API-key owner and one transaction, and can be consumed only once.
const TransactionSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    apiKeyOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["transaction", "recovery"], required: true },
    transactionId: { type: String, default: null, index: true },
    transactionHash: { type: String, default: null },
    amountMinor: { type: Number, default: null, min: 0 },
    currency: { type: String, default: null },
    recipientInitials: { type: [String], default: [] },
    registerLetters: { type: [String], required: true },
    markerPositions: { type: [Number], required: true },
    expectedDigits: { type: [Number], required: true },
    attempts: { type: Number, default: 0 },
    status: { type: String, enum: ["challenge", "verified"], default: "challenge", index: true },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

TransactionSessionSchema.index(
  { apiKeyOwnerId: 1, transactionId: 1, status: 1 },
  { unique: true, partialFilterExpression: { transactionId: { $type: "string" }, status: "challenge" } }
);

export default mongoose.model("TransactionSession", TransactionSessionSchema);
