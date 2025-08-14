import express from "express";
import requireUser from "#middleware/requireUser";
import { upsertBestTime, getBestTimesByUser } from "#db/queries/games";

const router = express.Router();

router.post("/score", requireUser, async (req, res, next) => {
  try {
    const { game, timeMs } = req.body ?? {};

    if (game !== "reaction" && game !== "memory") {
      return res.status(400).json({ message: "Invalid game key" });
    }
    const n = Number(timeMs);
    if (!Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "timeMs must be a positive number" });
    }

    const row = await upsertBestTime(req.user.id, game, Math.round(n));
    return res.status(200).json(row);
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireUser, async (req, res, next) => {
  try {
    const bests = await getBestTimesByUser(req.user.id);
    return res.json(bests); // if no records yet, returns {}
  } catch (err) {
    return next(err);
  }
});

export default router;
