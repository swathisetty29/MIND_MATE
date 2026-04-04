import { Router } from "express";
import mongoose from "mongoose";
import PeerQueue from "../models/PeerQueue.js";
import PeerSession from "../models/PeerSession.js";
import PeerMessage from "../models/PeerMessage.js";
import { authRequired } from "../middleware/auth.js";
import { detectRiskyContent, SUPPORT_MESSAGE } from "../utils/safety.js";
import { isDevStore } from "../lib/storageMode.js";
import {
  createPeerMessage as createDevPeerMessage,
  createPeerSession,
  enqueueUser,
  findActiveSessionForUser,
  findOldestOtherQueueEntry,
  findPeerQueueEntry,
  findPeerSessionById,
  listPeerMessages,
  removeQueuedUsers,
  updatePeerSession,
} from "../lib/devStore.js";

const router = Router();

async function sessionForUser(userId) {
  if (isDevStore()) {
    return findActiveSessionForUser(userId);
  }
  const uid = new mongoose.Types.ObjectId(userId);
  return PeerSession.findOne({
    $or: [{ user1: uid }, { user2: uid }],
    status: { $in: ["pending", "active"] },
  }).sort({ updatedAt: -1 });
}

router.post("/find-peer", authRequired, async (req, res) => {
  try {
    const existing = await sessionForUser(req.userId);
    if (existing) {
      const other =
        existing.user1.toString() === req.userId ? existing.user2 : existing.user1;
      return res.json({
        matched: true,
        sessionId: existing._id.toString(),
        status: existing.status,
        peerId: other.toString(),
      });
    }

    const otherEntry = isDevStore()
      ? await findOldestOtherQueueEntry(req.userId)
      : await PeerQueue.findOne({
          userId: { $ne: req.userId },
        }).sort({ createdAt: 1 });

    if (otherEntry) {
      if (isDevStore()) {
        await removeQueuedUsers([req.userId, otherEntry.userId]);
      } else {
        await PeerQueue.deleteMany({
          userId: { $in: [req.userId, otherEntry.userId] },
        });
      }
      const session = isDevStore()
        ? await createPeerSession({
            user1: otherEntry.userId,
            user2: req.userId,
            status: "pending",
            acceptedBy: [],
          })
        : await PeerSession.create({
            user1: otherEntry.userId,
            user2: req.userId,
            status: "pending",
            acceptedBy: [],
          });
      return res.json({
        matched: true,
        sessionId: session._id.toString(),
        status: session.status,
        peerId: otherEntry.userId.toString(),
      });
    }

    if (isDevStore()) {
      await enqueueUser(req.userId);
    } else {
      await PeerQueue.findOneAndUpdate(
        { userId: req.userId },
        { $setOnInsert: { userId: req.userId } },
        { upsert: true }
      );
    }

    res.json({ matched: false, waiting: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not find peer" });
  }
});

router.get("/peer/status", authRequired, async (req, res) => {
  try {
    const session = await sessionForUser(req.userId);
    if (!session) {
      const queued = isDevStore()
        ? await findPeerQueueEntry(req.userId)
        : await PeerQueue.findOne({ userId: req.userId });
      return res.json({ session: null, waiting: !!queued });
    }
    const other =
      session.user1.toString() === req.userId ? session.user2 : session.user1;
    res.json({
      session: {
        sessionId: session._id.toString(),
        status: session.status,
        peerId: other.toString(),
        acceptedBy: session.acceptedBy.map((id) => id.toString()),
        iAccepted: session.acceptedBy.some((id) => id.toString() === req.userId),
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Could not get status" });
  }
});

router.post("/accept-peer", authRequired, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || (!isDevStore() && !mongoose.isValidObjectId(sessionId))) {
      return res.status(400).json({ error: "Valid sessionId is required" });
    }
    const session = isDevStore()
      ? await findPeerSessionById(sessionId)
      : await PeerSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const uid = req.userId;
    const ok =
      session.user1.toString() === uid || session.user2.toString() === uid;
    if (!ok) return res.status(403).json({ error: "Forbidden" });

    let acceptedBy = session.acceptedBy;
    if (!acceptedBy.some((id) => id.toString() === uid)) {
      acceptedBy = [...acceptedBy, uid];
    }
    const nextStatus = acceptedBy.length >= 2 ? "active" : session.status;
    const savedSession = isDevStore()
      ? await updatePeerSession(sessionId, { acceptedBy, status: nextStatus })
      : await (async () => {
          session.acceptedBy = acceptedBy;
          session.status = nextStatus;
          await session.save();
          return session;
        })();

    res.json({
      sessionId: savedSession._id.toString(),
      status: savedSession.status,
      acceptedBy: savedSession.acceptedBy.map((id) => id.toString()),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not accept" });
  }
});

router.post("/send-message", authRequired, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message || typeof message !== "string") {
      return res.status(400).json({ error: "sessionId and message are required" });
    }
    const session = isDevStore()
      ? await findPeerSessionById(sessionId)
      : await PeerSession.findById(sessionId);
    if (!session || session.status !== "active") {
      return res.status(400).json({ error: "No active session" });
    }
    const uid = req.userId;
    const participant =
      session.user1.toString() === uid || session.user2.toString() === uid;
    if (!participant) return res.status(403).json({ error: "Forbidden" });

    const trimmed = message.trim().slice(0, 4000);
    if (!trimmed) return res.status(400).json({ error: "Message empty" });

    if (detectRiskyContent(trimmed)) {
      return res.json({
        blocked: true,
        notice: SUPPORT_MESSAGE,
      });
    }

    const msg = isDevStore()
      ? await createDevPeerMessage({
          sessionId: session._id,
          senderId: uid,
          content: trimmed,
        })
      : await PeerMessage.create({
          sessionId: session._id,
          senderId: uid,
          content: trimmed,
        });

    res.json({
      blocked: false,
      message: {
        id: msg._id.toString(),
        senderId: uid,
        content: trimmed,
        createdAt: msg.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not send message" });
  }
});

router.get("/peer/messages/:sessionId", authRequired, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = isDevStore()
      ? await findPeerSessionById(sessionId)
      : await PeerSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Not found" });
    const uid = req.userId;
    const participant =
      session.user1.toString() === uid || session.user2.toString() === uid;
    if (!participant) return res.status(403).json({ error: "Forbidden" });

    const since = req.query.since ? new Date(req.query.since) : null;
    const list = isDevStore()
      ? await listPeerMessages(
          session._id,
          since && !Number.isNaN(since.getTime()) ? since : null
        )
      : await PeerMessage.find(
          since && !Number.isNaN(since.getTime())
            ? { sessionId: session._id, createdAt: { $gt: since } }
            : { sessionId: session._id }
        )
          .sort({ createdAt: 1 })
          .limit(200)
          .lean();
    res.json({
      messages: list.map((m) => ({
        id: m._id.toString(),
        senderId: m.senderId.toString(),
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Could not load messages" });
  }
});

router.post("/peer/end", authRequired, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = isDevStore()
      ? await findPeerSessionById(sessionId)
      : await PeerSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Not found" });
    const uid = req.userId;
    const participant =
      session.user1.toString() === uid || session.user2.toString() === uid;
    if (!participant) return res.status(403).json({ error: "Forbidden" });
    if (isDevStore()) {
      await updatePeerSession(sessionId, { status: "ended" });
    } else {
      session.status = "ended";
      await session.save();
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Could not end session" });
  }
});

export default router;
