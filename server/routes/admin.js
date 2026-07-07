// routes/admin.js — ESM
import express   from "express";
import jwt       from "jsonwebtoken";
import crypto    from "crypto";
import nodemailer from "nodemailer";
import User      from "../models/User.js";
import AdminUser from "../models/AdminUser.js";
import dotenv    from "dotenv";
import RegisteredDomain from "../models/RegisteredDomain.js";

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
    });

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

    /* ── POST /api/admin/login ──────────────────────────────────── */
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
        success: true, token,
        admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
        });
    } catch (err) {
        console.error("[admin/login]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/register-first ────────────────────────── */
    router.post("/register-first", async (req, res) => {
    try {
        const existingCount = await AdminUser.countDocuments();
        if (existingCount > 0)
        return res.status(403).json({ success: false, error: "Admin already exists." });

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

    /* ── POST /api/admin/create-user ────────────────────────────────
    Admin creates an end-user account by email only.
    An invite email is sent so the user can set their own password
    and visual-password during first login.
    Body: { email, wordpressSite?, wordpressUsername? }
    ─────────────────────────────────────────────────────────────── */
    router.post("/create-user", verifyAdminToken, async (req, res) => {
    try {
        const { email, wordpressSite, wordpressUsername } = req.body;
        if (!email)
        return res.status(400).json({ success: false, error: "email is required." });

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing)
        return res.status(409).json({ success: false, error: "An account with that email already exists." });

        // Generate invite token
        const rawToken    = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Create a pending user — password and visual-password filled in later
        const user = new User({
        email:             email.toLowerCase().trim(),
        password:          crypto.randomBytes(16).toString("hex"), // placeholder; overwritten on invite completion
        selectedSentence:  "pending",                              // placeholder
        secretNouns:       [],
        secretPositions:   ["A", "B"],                            // placeholder
        offset:            0,                                     // placeholder
        wordpressSite:     wordpressSite     || null,
        wordpressUsername: wordpressUsername || null,
        pendingSetup:      true,
        inviteToken:       hashedToken,
        inviteTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours
        });
        await user.save();

        const inviteUrl = `${process.env.FRONTEND_URL}/complete-invite/${rawToken}`;

        await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to:   email,
        subject: "🔐 You've been invited to Scam2Safe — set up your account",
        html: `
        <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
            <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eee">
            <h2 style="color:#0f172a">Welcome to Scam2Safe</h2>
            <p style="color:#334155;font-size:14px;line-height:1.6">
                An account has been created for you. Click below to set your password and
                visual security key. This link expires in <b>48 hours</b>.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;margin:16px 0;padding:12px 18px;background:linear-gradient(135deg,#06B6D4,#0891b2);color:white;text-decoration:none;border-radius:8px;font-weight:600">
                Set up my account →
            </a>
            <p style="color:#64748b;font-size:12px;">
                If the button doesn't work: <a href="${inviteUrl}">${inviteUrl}</a>
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="color:#94a3b8;font-size:12px">If you didn't expect this, ignore this email.</p>
            </div>
        </div>`,
        });

        return res.status(201).json({
        success: true,
        message: `Invite sent to ${email}. They have 48 hours to complete setup.`,
        user: { id: user._id, email: user.email, pendingSetup: true },
        });
    } catch (err) {
        console.error("[admin/create-user]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/resend-invite ──────────────────────────────
    Resend (or refresh) an invite for a pending user.
    Body: { email }
    ─────────────────────────────────────────────────────────────── */
    router.post("/resend-invite", verifyAdminToken, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
        return res.status(400).json({ success: false, error: "email is required." });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
        return res.status(404).json({ success: false, error: "User not found." });
        if (!user.pendingSetup)
        return res.status(400).json({ success: false, error: "User has already completed setup." });

        const rawToken    = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        user.inviteToken        = hashedToken;
        user.inviteTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 48);
        await user.save();

        const inviteUrl = `${process.env.FRONTEND_URL}/complete-invite/${rawToken}`;

        await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to:   email,
        subject: "🔐 New invite link — set up your Scam2Safe account",
        html: `
        <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px">
            <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eee">
            <h2 style="color:#0f172a">New invite link</h2>
            <p style="color:#334155;font-size:14px;line-height:1.6">
                Here is a fresh invite link. Expires in <b>48 hours</b>.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;margin:16px 0;padding:12px 18px;background:linear-gradient(135deg,#06B6D4,#0891b2);color:white;text-decoration:none;border-radius:8px;font-weight:600">
                Set up my account →
            </a>
            </div>
        </div>`,
        });

        return res.json({ success: true, message: "Invite resent." });
    } catch (err) {
        console.error("[admin/resend-invite]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/invite ─────────────────────────────────── */
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

    /* ── GET /api/admin/team ────────────────────────────────────── */
    router.get("/team", verifyAdminToken, async (req, res) => {
    try {
        const team = await AdminUser.find({}, "-password").sort({ createdAt: -1 });
        return res.json({ success: true, team });
    } catch (err) {
        console.error("[admin/team]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── DELETE /api/admin/team/:adminId ────────────────────────── */
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

    /* ── GET /api/admin/users ───────────────────────────────────── */
    router.get("/users", verifyAdminToken, async (req, res) => {
    try {
        const page   = Math.max(1, parseInt(req.query.page  || "1",  10));
        const limit  = Math.min(100, parseInt(req.query.limit || "20", 10));
        const search = req.query.search?.trim();

        const filter = search ? { email: { $regex: search, $options: "i" } } : {};
        const total  = await User.countDocuments(filter);
        const users  = await User.find(
        filter,
        "-password -apiKeyHash -secretNouns -secretPositions -offset -resetPasswordToken -resetPasswordExpires -passkeyCredentials -passkeyChallenge -inviteToken"
        ).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        return res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
    } catch (err) {
        console.error("[admin/users]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── GET /api/admin/users/:email ────────────────────────────── */
    router.get("/users/:email", verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findOne(
        { email: req.params.email.toLowerCase().trim() },
        "-password -apiKeyHash -secretNouns -secretPositions -offset -resetPasswordToken -resetPasswordExpires -passkeyCredentials -passkeyChallenge -inviteToken"
        );
        if (!user)
        return res.status(404).json({ success: false, error: "User not found." });
        return res.json({ success: true, user });
    } catch (err) {
        console.error("[admin/users/:email]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/generate-api-key ───────────────────────── */
    router.post("/generate-api-key", verifyAdminToken, async (req, res) => {
        try {
            const { email, domain } = req.body;  // ← domain added

            if (!email || !domain)
            return res.status(400).json({ success: false, error: "email and domain are required." });

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user)
            return res.status(404).json({ success: false, error: "No user found with that email." });

            if (user.pendingSetup)
            return res.status(400).json({ success: false, error: "User has not completed account setup yet." });

            const rawApiKey = await user.generateApiKey(domain); // ← pass domain
            await user.save();

            return res.json({
            success:    true,
            email:      user.email,
            domain:     user.apiKeyDomain,
            apiKey:     rawApiKey,
            apiKeyHint: user.apiKeyHint,
            message:    `API key generated for ${user.email} bound to ${domain}. Copy it now — it won't be shown again.`,
            });
        } catch (err) {
            console.error("[admin/generate-api-key]", err);
            return res.status(500).json({ success: false, error: "Server error." });
        }
        });

    /* ── POST /api/admin/revoke-api-key ─────────────────────────── */
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

    /* ── GET /api/admin/me ──────────────────────────────────────── */
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

    /* ── GET /api/admin/domains ─────────────────────────────── */
    router.get("/domains", verifyAdminToken, async (req, res) => {
    try {
        const domains = await RegisteredDomain.find().sort({ createdAt: -1 });
        return res.json({ success: true, domains });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error." });
    }
    });

    /* ── POST /api/admin/domains ────────────────────────────── */
    router.post("/domains", verifyAdminToken, async (req, res) => {
        try {
            const { domain, orgName, notes } = req.body;
            if (!domain || !orgName)
            return res.status(400).json({ success: false, error: "domain and orgName are required." });

            const existing = await RegisteredDomain.findOne({
            domain: domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim()
            });
            if (existing)
            return res.status(409).json({ success: false, error: "Domain already registered." });

            const doc = await RegisteredDomain.create({
            domain, orgName, notes, addedBy: req.admin.email,
            });

            return res.status(201).json({ success: true, domain: doc });
        } catch (err) {
            return res.status(500).json({ success: false, error: "Server error." });
        }
    });

    /* ── POST /api/admin/domains/:id/suspend ────────────────── */
    router.post("/domains/:id/suspend", verifyAdminToken, async (req, res) => {
        try {
            const doc = await RegisteredDomain.findByIdAndUpdate(
            req.params.id, { status: "suspended" }, { new: true }
            );
            if (!doc) return res.status(404).json({ success: false, error: "Domain not found." });
            return res.json({ success: true, message: `${doc.domain} suspended.` });
        } catch (err) {
            return res.status(500).json({ success: false, error: "Server error." });
        }
    });

    /* ── DELETE /api/admin/domains/:id ──────────────────────── */
    router.delete("/domains/:id", verifyAdminToken, async (req, res) => {
        try {
            await RegisteredDomain.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: "Domain removed." });
        } catch (err) {
            return res.status(500).json({ success: false, error: "Server error." });
        }
    });

    // Also update generate-api-key — no domain needed anymore
    router.post("/generate-api-key", verifyAdminToken, async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
            return res.status(400).json({ success: false, error: "email is required." });

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user)
            return res.status(404).json({ success: false, error: "No user found with that email." });

            if (user.pendingSetup)
            return res.status(400).json({ success: false, error: "User has not completed account setup yet." });

            const rawApiKey = await user.generateApiKey();
            await user.save();

            return res.json({
            success:    true,
            email:      user.email,
            apiKey:     rawApiKey,
            apiKeyHint: user.apiKeyHint,
            message:    `API key generated for ${user.email}. Copy it now — it won't be shown again.`,
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: "Server error." });
        }
    });

export default router;