// models/UpiUser.js — ESM
// Separate user model for UPI Visual Password.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UpiUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /* ── UPI Visual Password ───────────────────────────── */

    selectedWord: {
      type: String,
      default: null,
    },

    selectedWordLang: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },

    // e.g. ["Ra","me","sh"]
    selectedWordParts: {
      type: [String],
      default: [],
    },

    // Plain number used to compute:
    // offset = amountDigitCount + personalSecretNum
    personalSecretNum: {
      type: Number,
      min: 1,
      max: 99,
      default: null,
    },

    // Hashed copy for verification/auditing
    personalSecretHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash the secret whenever it changes
UpiUserSchema.pre("save", async function (next) {
  if (
    !this.isModified("personalSecretHash") ||
    !this.personalSecretHash
  ) {
    return next();
  }

  // Prevent double-hashing if already bcrypt hashed
  if (this.personalSecretHash.startsWith("$2")) {
    return next();
  }

  this.personalSecretHash = await bcrypt.hash(
    this.personalSecretHash,
    10
  );
  next();
});

export default mongoose.model("UpiUser", UpiUserSchema);