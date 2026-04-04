import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { isDevStore } from "../lib/storageMode.js";
import {
  createUser as createDevUser,
  findUserByEmail,
  findUserById,
  updateUser,
} from "../lib/devStore.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = isDevStore()
      ? await findUserByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = isDevStore()
      ? await createDevUser({ name, email, password: hash })
      : await User.create({ name, email, password: hash });
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        anonymousUsername: user.anonymousUsername,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = isDevStore()
      ? await findUserByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        anonymousUsername: user.anonymousUsername,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not log in" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = isDevStore()
      ? await findUserById(req.userId)
      : await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        anonymousUsername: user.anonymousUsername,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/me", authRequired, async (req, res) => {
  try {
    const { anonymousUsername } = req.body;
    const nextAnonymousUsername = anonymousUsername?.slice(0, 32) || "";
    const user = isDevStore()
      ? await updateUser(req.userId, { anonymousUsername: nextAnonymousUsername })
      : await User.findByIdAndUpdate(
          req.userId,
          { $set: { anonymousUsername: nextAnonymousUsername } },
          { new: true }
        ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        anonymousUsername: user.anonymousUsername,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Could not update profile" });
  }
});

export default router;
