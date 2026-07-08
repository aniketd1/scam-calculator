import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import orgRoutes from "./routes/orgs.js";

dotenv.config();

import helmet from "helmet";

const app = express();
app.use(helmet());


// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://scam2safe.com",
    "https://magenta-dragonfly-533205.hostingersite.com",
    "https://chocolate-guanaco-675288.hostingersite.com",
    "https://deeppink-chicken-796406.hostingersite.com"
  ],
  credentials: true
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/orgs", orgRoutes);

// ── Health check ─────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
