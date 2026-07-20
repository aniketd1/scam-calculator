import User from "../models/User.js";

export default async function verifyApiKey(req, res, next) {
    try {
        const { email, apiKey, website } = req.body;

        if (!email || !apiKey || !website) {
            return res.status(400).json({
                success: false,
                error: "email, apiKey and website are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        const valid = await user.verifyApiKey(apiKey, website);

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid API Key."
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success:false,
            error:"Server error."
        });
    }
}