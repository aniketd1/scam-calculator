// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    selectedSentence: {
      type: String,
      required: true,
    },

    secretNouns: {
      type: [String],
      required: true,
    },

    secretPositions: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 2,
        message: "Exactly 2 positions required.",
      },
    },

    offset: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
  },
  {
    timestamps: true,
  }
);

/* Hash password before saving */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(
    this.password,
    10
  );
});

/* Compare login password with stored hash */
UserSchema.methods.comparePassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

const User = mongoose.model(
  "User",
  UserSchema
);

export default User;
