const express = require("express");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Load KB
const kb = JSON.parse(
  fs.readFileSync("./kb/fake-job.json", "utf-8")
);

// CHAT API
app.post("/api/chat", async (req, res) => {
    const message = req.body.message;

    try {
        const response = await axios.post(
        "http://YOUR_N8N_URL/webhook/chat",
        {
            message,
            kb
        }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "n8n failed" });
    }
    });

    app.listen(3001, () => {
    console.log("Server running on port 3001");
});