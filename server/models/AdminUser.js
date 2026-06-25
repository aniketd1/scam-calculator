// models/AdminUser.js — ESM
import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const AdminUserSchema = new mongoose.Schema(
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
        name: {
        type: String,
        required: true,
        trim: true,
        },
        role: {
        type: String,
        enum: ["super_admin", "admin"],
        default: "admin",
        },
    },
    { timestamps: true }
);

AdminUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

AdminUserSchema.methods.comparePassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

export default mongoose.model("AdminUser", AdminUserSchema);