import express from "express";
import requireUser from "#middleware/requireUser";
import { upsertBestTime, getBestTimesByUser } from "#db/queries/games";
import db from "#db/client";

const router = express.Router();

/**
 * POST /games/score
 * Save a best time for time-based games (reaction, memory)
 */
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

/**
 * GET /games/me
 * Return the current user's best times (existing behavior)
 */
router.get("/me", requireUser, async (req, res, next) => {
  try {
    const bests = await getBestTimesByUser(req.user.id);
    return res.json(bests); // if no records yet, returns {}
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /games/leaderboard/memory?limit=10
 * Public leaderboard for Memory Match (lower time = better).
 * Returns top N users with their best_time_ms and rank.
 */
router.get("/leaderboard/memory", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);

    const query = `
      SELECT
        u.id                         AS user_id,
        u.name                       AS username,
        gs.best_time_ms              AS time_ms,
        DENSE_RANK() OVER (ORDER BY gs.best_time_ms ASC) AS rank
      FROM game_scores gs
      JOIN users u ON u.id = gs.user_id
      WHERE gs.game_key = 'memory' AND gs.best_time_ms IS NOT NULL
      ORDER BY gs.best_time_ms ASC, u.id ASC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);
    return res.json({ game: "memory", top: rows });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /games/leaderboard/memory/me
 * Auth-required endpoint returning the current user's rank and time in Memory Match.
 * Useful if they are not in the top N of the public leaderboard.
 */
router.get("/leaderboard/memory/me", requireUser, async (req, res, next) => {
  try {
    const query = `
      WITH ranked AS (
        SELECT
          u.id            AS user_id,
          u.name          AS username,
          gs.best_time_ms AS time_ms,
          DENSE_RANK() OVER (ORDER BY gs.best_time_ms ASC) AS rank
        FROM game_scores gs
        JOIN users u ON u.id = gs.user_id
        WHERE gs.game_key = 'memory' AND gs.best_time_ms IS NOT NULL
      )
      SELECT * FROM ranked WHERE user_id = $1 LIMIT 1
    `;
    const { rows } = await db.query(query, [req.user.id]);
    // If the user has never played / saved a score, rows[0] will be undefined.
    return res.json({ game: "memory", me: rows[0] ?? null });
  } catch (err) {
    return next(err);
  }
});

export default router;
