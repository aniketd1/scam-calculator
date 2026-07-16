import mongoose from "mongoose";

const NumberUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    secretNumber:   { type: Number, required: true, min: 1, max: 9999 },
    secretMargin:   { type: Number, required: true, min: 0, max: 99 }, // never resent to client
    secretPositions:{ type: [String], required: true }, // e.g. ["A","D"]
    registerLetters:{ type: [String], required: true }, // 5 fixed letters, includes both secretPositions
    pendingSetup:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("NumberUser", NumberUserSchema);