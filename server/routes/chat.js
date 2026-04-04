import { Router } from "express";
import ChatMessage from "../models/ChatMessage.js";
import { authRequired } from "../middleware/auth.js";
import { analyzeSentiment } from "../utils/sentiment.js";
import { detectRiskyContent, SUPPORT_MESSAGE } from "../utils/safety.js";
import { getOpenAIReply } from "../utils/aiReply.js";
import { isDevStore } from "../lib/storageMode.js";
import {
  createChatMessage as createDevChatMessage,
  listChatMessages,
} from "../lib/devStore.js";

const router = Router();

router.post("/chat", authRequired, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }
    const trimmed = message.trim().slice(0, 8000);
    if (!trimmed) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const sentiment = analyzeSentiment(trimmed);
    if (isDevStore()) {
      await createDevChatMessage({
        userId: req.userId,
        role: "user",
        content: trimmed,
        sentiment,
      });
    } else {
      await ChatMessage.create({
        userId: req.userId,
        role: "user",
        content: trimmed,
        sentiment,
      });
    }

    if (detectRiskyContent(trimmed)) {
      const assistantText = SUPPORT_MESSAGE;
      if (isDevStore()) {
        await createDevChatMessage({
          userId: req.userId,
          role: "assistant",
          content: assistantText,
          sentiment: "neutral",
        });
      } else {
        await ChatMessage.create({
          userId: req.userId,
          role: "assistant",
          content: assistantText,
          sentiment: "neutral",
        });
      }
      return res.json({
        reply: assistantText,
        sentiment,
        risky: true,
        helpline: SUPPORT_MESSAGE,
      });
    }

    const history = isDevStore()
      ? await listChatMessages(req.userId)
      : await ChatMessage.find({ userId: req.userId })
          .sort({ createdAt: 1 })
          .limit(20)
          .lean();

    const replyResult = await getOpenAIReply({
      userMessage: trimmed,
      sentiment,
      history,
    });
    const reply = replyResult.text;
    if (isDevStore()) {
      await createDevChatMessage({
        userId: req.userId,
        role: "assistant",
        content: reply,
        sentiment: "neutral",
      });
    } else {
      await ChatMessage.create({
        userId: req.userId,
        role: "assistant",
        content: reply,
        sentiment: "neutral",
      });
    }

    res.json({
      reply,
      sentiment,
      risky: false,
      source: replyResult.source,
      modelError: replyResult.error,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not process chat" });
  }
});

router.get("/chat/history", authRequired, async (req, res) => {
  try {
    const messages = isDevStore()
      ? await listChatMessages(req.userId)
      : await ChatMessage.find({ userId: req.userId })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();
    res.json({
      messages: messages.map((m) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        sentiment: m.sentiment,
        createdAt: m.createdAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Could not load history" });
  }
});

export default router;
