import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://scam2safe.com"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", (req, res, next) => {

  const apiKey =
    req.headers["x-api-key"] ||
    req.query.apikey;

  if (
    apiKey !== process.env.PLUGIN_API_KEY
  ) {
    return res.status(401).json({
      success: false,
      error: "Invalid API Key"
    });
  }

  next();
});

export default app;
