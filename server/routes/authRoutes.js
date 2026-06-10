import express from "express";

import {
  signup,
  login,
  verify
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

//router.post("/register", buildRegisterRoute);

router.post("/verify", verify);

router.get("/test", (req, res) => {
  res.json({
    message: "Auth Route Working"
  });
});

export default router;