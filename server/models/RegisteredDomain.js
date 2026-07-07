// models/RegisteredDomain.js
import mongoose from "mongoose";

const RegisteredDomainSchema = new mongoose.Schema({
    domain:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    orgName:     { type: String, required: true },   // e.g. "ABC University"
    addedBy:     { type: String },                   // admin email who approved it
    status:      { type: String, enum: ["active", "suspended"], default: "active" },
    notes:       { type: String, default: "" },
}, { timestamps: true });

// Normalize on save — strip protocol, www, trailing slash
RegisteredDomainSchema.pre("save", function (next) {
    this.domain = this.domain
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "")
        .trim();
    next();
});

export default mongoose.model("RegisteredDomain", RegisteredDomainSchema);