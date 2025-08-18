import express from "express";
import requireUser from "../middleware/requireUser.js";
import { upsertMood, getMoodsByUserId } from "../db/queries/mood.js";

const moodRouter = express.Router();

// GET /api/mood - Get all mood entries for the logged-in user
moodRouter.get("/", requireUser, async (req, res, next) => {
  try {
    const moods = await getMoodsByUserId(req.user.id);
    res.json(moods);
  } catch (error) {
    next(error);
  }
});

// POST /api/mood - Create or update a mood entry for today
moodRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { moodValue, moodDate } = req.body;
    if (!moodValue || !moodDate) {
      return res.status(400).json({ error: "Mood value and date are required" });
    }

    const mood = await upsertMood(req.user.id, moodValue, moodDate);
    res.status(201).json(mood);
  } catch (error) {
    next(error);
  }
});

export default moodRouter;