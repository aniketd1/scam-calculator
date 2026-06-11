// routes/authRoutes.js
import express from "express";
import { signup, login, verify, buildRegisterRoute } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup",   signup);
router.post("/login",    login);
router.post("/register", buildRegisterRoute);  // ← was commented out, now active
router.post("/verify",   verify);

router.get("/test", (_req, res) => res.json({ message: "Auth route working ✓" }));

export default router;