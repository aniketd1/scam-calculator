import express from "express";
import authRouter from "../routes/auth.js";

const router = express.Router();

// just reuse the existing router
router.use("/", authRouter);

export default router;