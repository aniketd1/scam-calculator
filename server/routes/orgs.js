import express      from "express";
import jwt          from "jsonwebtoken";
import nodemailer   from "nodemailer";
import Organisation from "../models/Organisation.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: 587, secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
});

/* ── Admin token check ── */
function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, error: "Unauthorised." });
    try {
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        if (!process.env.ADMIN_EMAILS?.split(",").includes(decoded.email))
        return res.status(403).json({ success: false, error: "Admin access only." });
        req.admin = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, error: "Invalid token." });
    }
}

/* ════════════════════════════════════════════
    PUBLIC — Organisation applies for API access
═════════════════════════════════════════════ */
router.post("/apply", async (req, res) => {
    try {
        const { orgName, orgType, contactName, contactEmail, contactPhone, website } = req.body;

        if (!orgName || !orgType || !contactName || !contactEmail)
        return res.status(400).json({ success: false, error: "orgName, orgType, contactName and contactEmail are required." });

        const existing = await Organisation.findOne({ contactEmail: contactEmail.toLowerCase() });
        if (existing)
        return res.status(409).json({ success: false, error: "An application from this email already exists." });

        const org = await Organisation.create({
        orgName, orgType, contactName,
        contactEmail: contactEmail.toLowerCase(),
        contactPhone, website,
    });

    // Notify admin
    await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAILS,
        subject: `New API access request — ${orgName}`,
        html: `
            <h2>New Organisation Application</h2>
            <p><b>Org:</b> ${orgName} (${orgType})</p>
            <p><b>Contact:</b> ${contactName} — ${contactEmail}</p>
            <p><b>Website:</b> ${website || "—"}</p>
            <p><b>Phone:</b> ${contactPhone || "—"}</p>
            <p>
            <a href="${process.env.FRONTEND_URL}/admin/orgs/${org._id}/approve"
                style="padding:10px 18px;background:#06B6D4;color:#fff;border-radius:6px;text-decoration:none;font-weight:700">
                Approve &amp; generate key
            </a>
            </p>
        `,
    });

    // Confirm to applicant
    await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to: contactEmail,
        subject: "Your Scam2Safe API application has been received",
        html: `
            <h2>Thanks, ${contactName}!</h2>
            <p>We've received your API access request for <b>${orgName}</b>.</p>
            <p>Our team will review it and email your API key within 1–2 business days.</p>
            <p>Questions? Email <a href="mailto:support@scam2safe.com">support@scam2safe.com</a></p>
        `,
    });

    return res.status(201).json({ success: true, message: "Application received. We'll email your API key within 1–2 business days." });

    } catch (err) {
        console.error("[org/apply]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

/* ════════════════════════════════════════════
    ADMIN — List all pending applications
═════════════════════════════════════════════ */
router.get("/list", verifyAdmin, async (req, res) => {
    try {
        const { status = "pending" } = req.query;
        const orgs = await Organisation.find({ status }).sort({ createdAt: -1 });
        return res.json({ success: true, orgs });
    } catch (err) {
        console.error("[org/list]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

/* ════════════════════════════════════════════
    ADMIN — Approve org and email API key
═════════════════════════════════════════════ */
router.post("/:id/approve", verifyAdmin, async (req, res) => {
    try {
        const org = await Organisation.findById(req.params.id);
        if (!org)
        return res.status(404).json({ success: false, error: "Organisation not found." });

        if (org.status === "approved")
        return res.status(409).json({ success: false, error: "Already approved." });

    const rawKey = org.generateApiKey();
    org.status     = "approved";
    org.approvedAt = new Date();
    org.approvedBy = req.admin.email;
    org.notes      = req.body?.notes || org.notes || "";
    await org.save();

    // Email the API key — only time it's ever sent in plain text
    await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to: org.contactEmail,
        subject: "Your Scam2Safe API Key",
        html: `
            <h2>Welcome, ${org.contactName}!</h2>
            <p>Your organisation <b>${org.orgName}</b> has been approved for Scam2Safe API access.</p>
            <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:1.1rem;letter-spacing:0.04em;">
            ${rawKey}
            </div>
            <p><b>Keep this key secret.</b> It cannot be shown again — if lost, contact us for a reset.</p>
            <h3>Quick start</h3>
            <p>Send your users to:</p>
            <pre style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:0.85rem;">https://scam2safe.com/auth?email=USER_EMAIL&amp;apikey=${rawKey}&amp;callback=YOUR_CALLBACK_URL</pre>
            <p>Full integration guide: <a href="${process.env.FRONTEND_URL}/docs/erp-integration">scam2safe.com/docs/erp-integration</a></p>
            <p>Support: <a href="mailto:support@scam2safe.com">support@scam2safe.com</a></p>
        `,
    });

    return res.json({ success: true, message: `Approved and API key emailed to ${org.contactEmail}.` });

    } catch (err) {
        console.error("[org/approve]", err);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

/* ════════════════════════════════════════════
    ADMIN — Suspend org
═════════════════════════════════════════════ */
router.post("/:id/suspend", verifyAdmin, async (req, res) => {
    try {
        const org = await Organisation.findByIdAndUpdate(
        req.params.id,
        { status: "suspended" },
        { new: true }
        );
        if (!org) return res.status(404).json({ success: false, error: "Not found." });
        return res.json({ success: true, message: "Organisation suspended." });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

/* ════════════════════════════════════════════
    ADMIN — Regenerate API key
═════════════════════════════════════════════ */
router.post("/:id/regenerate-key", verifyAdmin, async (req, res) => {
    try {
        const org = await Organisation.findById(req.params.id);
        if (!org) return res.status(404).json({ success: false, error: "Not found." });

        const rawKey = org.generateApiKey();
        await org.save();

        await transporter.sendMail({
        from: `"Scam2Safe" <${process.env.SMTP_USER}>`,
        to: org.contactEmail,
        subject: "Your Scam2Safe API Key has been regenerated",
        html: `
            <h2>New API Key for ${org.orgName}</h2>
            <p>Your previous key has been revoked. Here is your new key:</p>
            <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0;font-family:monospace;font-size:1.1rem;">
            ${rawKey}
            </div>
            <p><b>Keep this key secret.</b> It cannot be shown again.</p>
        `,
    });

    return res.json({ success: true, message: "Key regenerated and emailed." });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

/* ════════════════════════════════════════════
    PUBLIC — Validate API key (called from erp-login internally,
    but also useful for ERPs to test their key is active)
═════════════════════════════════════════════ */
router.post("/validate-key", async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ success: false, error: "apiKey required." });

        const orgs = await Organisation.find({ status: "approved" });
        const match = orgs.find(o => o.verifyApiKey(apiKey));

        if (!match)
        return res.status(401).json({ success: false, error: "Invalid or inactive API key." });

        return res.json({
        success: true,
        org: { name: match.orgName, type: match.orgType },
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

export default router;