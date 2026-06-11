import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRouter);

export default app;