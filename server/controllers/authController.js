import { User } from "../models/User.js";
import generateToken from "../utils/jwt.js";
import {hashVisualPassword, verifyVisualPassword} from "../services/VisualPasswordService.js";

const signup = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      visualPassword
    } = req.body;

    const existingUser =
      await User.findOne({
        email
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists"
      });
    }

    const hash =
      await hashVisualPassword(
        visualPassword
      );

    const user =
      await User.create({
        name,
        email,
        phone,
        visualPasswordHash: hash
      });

    res.status(201).json({
      message:
        "Account Created Successfully",
      token: generateToken(
        user._id
      )
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      visualPassword
    } = req.body;

    const user =
      await User.findOne({
        email
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const isMatch =
      await verifyVisualPassword(
        visualPassword,
        user.visualPasswordHash
      );

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Invalid Visual Password"
      });
    }

    res.status(200).json({
      message:
        "Login Successful",
      token: generateToken(
        user._id
      ),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const profile = async (
  req,
  res
) => {
  const user =
    await User.findById(
      req.user
    ).select(
      "-visualPasswordHash"
    );

  res.json(user);
};

export {
  signup,
  login,
  profile
};