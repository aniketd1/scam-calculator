// routes/admin.js — ESM
// Dashboard routes for the scam2safe.com internal team.
// All /api/admin/* routes are protected by verifyAdminToken middleware
// except /api/admin/login and /api/admin/register-first.

import express from "express";
import jwt     from "jsonwebtoken";
import User    from "../models/User.js";
import AdminUser from "../models/AdminUser.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

/* ── MIDDLEWARE ─────────────────────────────────────────────── */
function verifyAdminToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, error: "Unauthorised." });

    try {
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        if (!decoded.isAdmin)
        return res.status(403).json({ success: false, error: "Admin access required." });
        req.admin = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, error: "Invalid or expired token." });
    }
    }

    /* ── POST /api/admin/login ───────────────────────────────────
    Body: { email, password }
    ─────────────────────────────────────────────────────────────── */
    router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
        return res.status(400).json({ success: false, error: "Email and password required." });

        const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
        if (!admin)
        return res.status(401).json({ success: false, error: "Invalid credentials." });

        const match = await admin.comparePassword(password);
        if (!match)
        return res.status(401).json({ success: false, error: "Invalid credentials." });

        const token = jwt.sign(
        { adminId: admin._id, email: admin.email, name: admin.name, role: admin.role, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
        );

        return res.json({
        success: true,
        token,
        admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
        });
    } catch (err) {
        console.error("[admin/login]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/register-first ─────────────────────────
    Creates the very first super_admin. Disabled if any admin exists.
    Remove this route (or gate it behind an env flag) in production
    after the first super_admin has been created.
    Body: { email, password, name, setupSecret }
    ─────────────────────────────────────────────────────────────── */
    router.post("/register-first", async (req, res) => {
    try {
        const existingCount = await AdminUser.countDocuments();
        if (existingCount > 0)
        return res.status(403).json({ success: false, error: "Admin already exists. Use the dashboard to add more admins." });

        const { email, password, name, setupSecret } = req.body;
        if (setupSecret !== process.env.ADMIN_SETUP_SECRET)
        return res.status(403).json({ success: false, error: "Invalid setup secret." });
        if (!email || !password || !name)
        return res.status(400).json({ success: false, error: "email, password, and name are required." });

        const admin = new AdminUser({ email, password, name, role: "super_admin" });
        await admin.save();

        return res.status(201).json({ success: true, message: "Super admin created." });
    } catch (err) {
        console.error("[admin/register-first]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/invite ─────────────────────────────────
    Super admin invites a new team member (admin).
    Body: { email, password, name }
    ─────────────────────────────────────────────────────────────── */
    router.post("/invite", verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== "super_admin")
        return res.status(403).json({ success: false, error: "Only super admins can invite team members." });

        const { email, password, name } = req.body;
        if (!email || !password || !name)
        return res.status(400).json({ success: false, error: "email, password, and name are required." });

        const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
        if (existing)
        return res.status(409).json({ success: false, error: "An admin with that email already exists." });

        const admin = new AdminUser({ email, password, name, role: "admin" });
        await admin.save();

        return res.status(201).json({
        success: true,
        message: "Team member added.",
        admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
        });
    } catch (err) {
        console.error("[admin/invite]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── GET /api/admin/team ────────────────────────────────────
    List all admin team members.
    ─────────────────────────────────────────────────────────────── */
    router.get("/team", verifyAdminToken, async (req, res) => {
    try {
        const team = await AdminUser.find({}, "-password").sort({ createdAt: -1 });
        return res.json({ success: true, team });
    } catch (err) {
        console.error("[admin/team]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── DELETE /api/admin/team/:adminId ───────────────────────
    Super admin removes a team member.
    ─────────────────────────────────────────────────────────────── */
    router.delete("/team/:adminId", verifyAdminToken, async (req, res) => {
    try {
        if (req.admin.role !== "super_admin")
        return res.status(403).json({ success: false, error: "Only super admins can remove team members." });

        if (req.admin.adminId === req.params.adminId)
        return res.status(400).json({ success: false, error: "You cannot remove yourself." });

        await AdminUser.findByIdAndDelete(req.params.adminId);
        return res.json({ success: true, message: "Team member removed." });
    } catch (err) {
        console.error("[admin/team/delete]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── GET /api/admin/users ────────────────────────────────────
    List all end users (paginated).
    Query: ?page=1&limit=20&search=email
    ─────────────────────────────────────────────────────────────── */
    router.get("/users", verifyAdminToken, async (req, res) => {
    try {
        const page   = Math.max(1, parseInt(req.query.page  || "1", 10));
        const limit  = Math.min(100, parseInt(req.query.limit || "20", 10));
        const search = req.query.search?.trim();

        const filter = search ? { email: { $regex: search, $options: "i" } } : {};
        const total  = await User.countDocuments(filter);
        const users  = await User.find(filter, "-password -apiKeyHash -secretNouns -secretPositions -offset -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        return res.json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        users,
        });
    } catch (err) {
        console.error("[admin/users]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── GET /api/admin/users/:email ─────────────────────────────
    Look up a single end user by email.
    ─────────────────────────────────────────────────────────────── */
    router.get("/users/:email", verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findOne(
        { email: req.params.email.toLowerCase().trim() },
        "-password -apiKeyHash -secretNouns -secretPositions -offset -resetPasswordToken -resetPasswordExpires"
        );
        if (!user)
        return res.status(404).json({ success: false, error: "User not found." });

        return res.json({ success: true, user });
    } catch (err) {
        console.error("[admin/users/:email]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/generate-api-key ───────────────────────
    Admin creates (or rotates) an API key for any end user by email.
    The raw key is returned ONCE — admin relays it to the user.
    Body: { email }
    ─────────────────────────────────────────────────────────────── */
    router.post("/generate-api-key", verifyAdminToken, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
        return res.status(400).json({ success: false, error: "email is required." });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
        return res.status(404).json({ success: false, error: "No user found with that email." });

        const rawApiKey = await user.generateApiKey();
        await user.save();

        return res.json({
        success: true,
        email: user.email,
        apiKey: rawApiKey,         // shown once — admin must relay it to the user
        apiKeyHint: user.apiKeyHint,
        message: `API key generated for ${user.email}. Copy it now — it won't be shown again.`,
        });
    } catch (err) {
        console.error("[admin/generate-api-key]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/revoke-api-key ─────────────────────────
    Revoke (clear) the API key for a user.
    Body: { email }
    ─────────────────────────────────────────────────────────────── */
    router.post("/revoke-api-key", verifyAdminToken, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
        return res.status(400).json({ success: false, error: "email is required." });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
        return res.status(404).json({ success: false, error: "No user found with that email." });

        user.apiKeyHash      = null;
        user.apiKeyHint      = null;
        user.apiKeyPrefix    = null;
        user.apiKeyCreatedAt = null;
        await user.save();

        return res.json({ success: true, message: `API key revoked for ${user.email}.` });
    } catch (err) {
        console.error("[admin/revoke-api-key]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── GET /api/admin/me ──────────────────────────────────────
    Returns the currently authenticated admin's profile.
    ─────────────────────────────────────────────────────────────── */
    router.get("/me", verifyAdminToken, async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.admin.adminId, "-password");
        if (!admin)
        return res.status(404).json({ success: false, error: "Admin not found." });
        return res.json({ success: true, admin });
    } catch (err) {
        console.error("[admin/me]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

export default router;