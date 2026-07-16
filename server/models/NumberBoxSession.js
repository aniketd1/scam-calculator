import mongoose from "mongoose";

const NumberBoxSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "NumberUser", required: true },
    boxes: { type: [mongoose.Schema.Types.Mixed], required: true }, // [{ name, numbers: [4], circled: Number }, ...]
    registerLetters: { type: [String], required: true },
    expectedD1: { type: Number, required: true },
    expectedD2: { type: Number, required: true },
    pos1: { type: Number, required: true },
    pos2: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("NumberBoxSession", NumberBoxSessionSchema);