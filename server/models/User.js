// models/User.js
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import crypto   from "crypto";

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
    wordpressSite: {
      type: String, default: null,
    },
    wordpressUsername: {
      type: String, default: null,
    },
    secretNouns: {
      type: [String], default: [],
    },
    secretPositions: {
      type: [String], default: [],
    },
    offset: {
      type: Number, required: true,
    },
    // API key — generated on signup, used by WordPress plugin
    // Stored as a bcrypt hash; the raw key is shown once at signup
    apiKeyHash: {
      type: String, default: null,
    },
    // Last 6 chars of the raw key — shown in dashboard so user can identify it
    apiKeyHint: {
      type: String, default: null,
    },
    apiKeyCreatedAt: {
      type: Date, default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Verify a raw API key against the stored hash
UserSchema.methods.verifyApiKey = async function (rawKey) {
  if (!this.apiKeyHash) return false;
  return bcrypt.compare(rawKey, this.apiKeyHash);
};

// Generate a new API key, store its hash, return the raw key (shown once)
UserSchema.methods.generateApiKey = async function () {
  const raw  = "s2s_" + crypto.randomBytes(32).toString("hex"); // 68 chars
  this.apiKeyHash      = await bcrypt.hash(raw, 10);
  this.apiKeyHint      = raw.slice(-6);   // last 6 chars for identification
  this.apiKeyCreatedAt = new Date();
  return raw;
};

export default mongoose.model("User", UserSchema);