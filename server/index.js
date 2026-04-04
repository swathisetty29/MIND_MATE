import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { setStorageMode } from "./lib/storageMode.js";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import sleepRoutes from "./routes/sleep.js";
import mentalRoutes from "./routes/mental.js";
import peerRoutes from "./routes/peer.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", sleepRoutes);
app.use("/api", mentalRoutes);
app.use("/api", peerRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mindmate";
if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set. Using insecure default for development only.");
  process.env.JWT_SECRET = "dev-only-change-me";
}

function startServer(mode) {
  setStorageMode(mode);
  app.listen(PORT, () => {
    console.log(`MindMate API listening on http://localhost:${PORT} using ${mode}`);
  });
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    startServer("mongo");
  })
  .catch((err) => {
    console.warn("MongoDB connection failed:", err.message);
    console.warn("Falling back to local dev store at server/data/dev-store.json");
    startServer("dev-store");
  });
