import { Router } from "express";
import SleepData from "../models/SleepData.js";
import { authRequired } from "../middleware/auth.js";
import { isDevStore } from "../lib/storageMode.js";
import { listSleepEntries, saveSleepEntry } from "../lib/devStore.js";

const router = Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

router.post("/sleep", authRequired, async (req, res) => {
  try {
    const { date, hours } = req.body;
    const h = Number(hours);
    if (date === undefined || Number.isNaN(h) || h < 0 || h > 24) {
      return res.status(400).json({ error: "Valid date and hours (0–24) are required" });
    }
    const day = startOfDay(date ? new Date(date) : new Date());
    if (isDevStore()) {
      await saveSleepEntry({ userId: req.userId, date: day, hours: h });
    } else {
      await SleepData.findOneAndUpdate(
        { userId: req.userId, date: day },
        { $set: { hours: h } },
        { upsert: true, new: true }
      );
    }
    res.json({ ok: true, date: day.toISOString(), hours: h });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not save sleep data" });
  }
});

router.get("/sleep/:userId", authRequired, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 13);

    const rows = isDevStore()
      ? await listSleepEntries(req.userId, startOfDay(start))
      : await SleepData.find({
          userId: req.userId,
          date: { $gte: startOfDay(start) },
        })
          .sort({ date: 1 })
          .lean();

    res.json({
      entries: rows.map((r) => ({
        date: r.date,
        hours: r.hours,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Could not load sleep data" });
  }
});

export default router;
