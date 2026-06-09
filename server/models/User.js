import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    visualPasswordSentence: {
      type: String,
      required: true,
    },
    // Ordered list of nouns from the chosen sentence
    // e.g. ["teacher", "bus", "school"]
    nouns: {
      type: [String],
      default: [],
    },
    // Per-noun bcrypt-hashed locker codes
    // e.g. { teacher: "$2b$10$...", bus: "$2b$10$...", school: "$2b$10$..." }
    lockerCodes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
