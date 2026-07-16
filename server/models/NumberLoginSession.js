import mongoose from "mongoose";

const NumberLoginSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "NumberUser", required: true },
    topNumbers:      { type: [Number], required: true }, // 6 plain numbers
    circledNumbers:  { type: [Number], required: true }, // 3 circled numbers
    registerLetters: { type: [String], required: true },
    pickedCircled:   { type: Number, default: null },
    expectedD1:      { type: Number, default: null },
    expectedD2:      { type: Number, default: null },
    pos1:            { type: Number, default: null },
    pos2:            { type: Number, default: null },
    attempts:  { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("NumberLoginSession", NumberLoginSessionSchema);