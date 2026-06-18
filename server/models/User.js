// models/User.js
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
    },
    password: {
      type: String, required: true,
    },
    selectedSentence: {
      type: String, required: true,
    },
    // Ordered noun list extracted from selectedSentence
    // e.g. ["teacher", "bus", "school"]
    secretNouns: {
      type: [String], default: [],
    },
    // Two register position labels, e.g. ["A", "D"]
    secretPositions: {
      type: [String], default: [],
    },
    // Private offset 1–99
    offset: {
      type: Number, required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", UserSchema);