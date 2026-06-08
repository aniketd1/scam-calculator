import express from "express";

import {
  signup,
  login,
  profile
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get(
  "/test",
  (req, res) => {
    res.json({
      message:
        "Auth Route Working"
    });
  }
);
router.post("/dummy", (req, res) => {
  console.log(req.body);

  res.json({
    success: true,
    body: req.body,
  });
});
router.post(
  "/signup",
  signup
);

router.post(
  "/login",
  login
);

router.get(
  "/profile",
  protect,
  profile
);

export default router;