import { Router } from "express";
import ChatMessage from "../models/ChatMessage.js";
import SleepData from "../models/SleepData.js";
import { authRequired } from "../middleware/auth.js";
import { isDevStore } from "../lib/storageMode.js";
import { listRecentUserChats, listSleepEntries } from "../lib/devStore.js";

const router = Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function suggestionFor(state) {
  if (state === "Poor") {
    return {
      title: "Gentle steps",
      tips: [
        "Try a 5-minute breathing exercise before bed.",
        "Keep a consistent sleep schedule, even on weekends.",
        "Share how you feel with someone you trust when you are ready.",
      ],
    };
  }
  if (state === "Moderate") {
    return {
      title: "Small habits",
      tips: [
        "Take a short walk or stretch between study blocks.",
        "Write down one thing that went okay today.",
        "Limit screens for 30 minutes before sleep.",
      ],
    };
  }
  return {
    title: "Keep it up",
    tips: [
      "Notice what helped you sleep well—try to repeat it.",
      "Your steady mood and rest are a strong foundation.",
      "Offer a kind word to someone—it often helps you too.",
    ],
  };
}

router.get("/mental-state/:userId", authRequired, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentChats = isDevStore()
      ? await listRecentUserChats(req.userId, weekAgo)
      : await ChatMessage.find({
          userId: req.userId,
          role: "user",
          createdAt: { $gte: weekAgo },
        })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean();

    let chatScore = 0;
    if (recentChats.length) {
      const counts = { positive: 0, neutral: 0, negative: 0 };
      for (const m of recentChats) {
        counts[m.sentiment] = (counts[m.sentiment] || 0) + 1;
      }
      if (counts.positive >= counts.negative && counts.positive >= counts.neutral) chatScore = 2;
      else if (counts.negative > counts.positive) chatScore = 0;
      else chatScore = 1;
    } else {
      chatScore = 1;
    }

    const sleepRows = isDevStore()
      ? await listSleepEntries(req.userId, startOfDay(weekAgo))
      : await SleepData.find({
          userId: req.userId,
          date: { $gte: startOfDay(weekAgo) },
        }).lean();

    let avgSleep = 7;
    if (sleepRows.length) {
      const sum = sleepRows.reduce((a, r) => a + r.hours, 0);
      avgSleep = sum / sleepRows.length;
    }

    let sleepBand = "average";
    if (avgSleep >= 7) sleepBand = "good";
    else if (avgSleep < 6) sleepBand = "poor";

    let state = "Moderate";
    if (chatScore === 2 && sleepBand === "good") state = "Good";
    else if (chatScore === 0 || sleepBand === "poor") state = "Poor";
    else state = "Moderate";

    const suggestion = suggestionFor(state);

    res.json({
      mentalState: state,
      avgSleepHours: Math.round(avgSleep * 10) / 10,
      chatMoodSummary:
        recentChats.length === 0
          ? "Not enough recent chat data—defaults to moderate."
          : `Based on your recent messages (last 7 days).`,
      suggestion,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not compute mental state" });
  }
});

export default router;
