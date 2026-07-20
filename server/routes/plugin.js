import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/*
POST /api/plugin/authenticate

Used ONLY by the WordPress plugin.

Body:
{
    email,
    apiKey,
    website
}
*/

router.post("/authenticate", async (req, res) => {
    try {

        const {
            email,
            apiKey,
            website
        } = req.body;

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
                error: "Invalid API key."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                plugin: true
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            error: "Server error."
        });

    }
});


router.post("/verify-token", async (req,res)=>{

    try{

        const {token}=req.body;

        if(!token)
            return res.status(400).json({
                success:false,
                error:"Missing token."
            });

        const decoded=jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        return res.json({
            success:true,
            userId:decoded.userId,
            email:decoded.email
        });

    }catch{

        return res.status(401).json({
            success:false,
            error:"Invalid token."
        });

    }

});

export default router;