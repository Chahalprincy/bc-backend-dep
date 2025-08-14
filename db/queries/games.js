import db from "#db/client";

export async function upsertBestTime(userId, gameKey, timeMs) {
  const { rows } = await db.query(
    `
    INSERT INTO game_scores (user_id, game_key, best_time_ms)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, game_key)
    DO UPDATE SET
      best_time_ms = LEAST(game_scores.best_time_ms, EXCLUDED.best_time_ms),
      attempts = game_scores.attempts + 1,
      updated_at = now()
    RETURNING id, user_id, game_key, best_time_ms, attempts, updated_at;
    `,
    [userId, gameKey, timeMs]
  );
  return rows[0];
}

export async function getBestTimesByUser(userId) {
  const { rows } = await db.query(
    `SELECT game_key, best_time_ms, attempts, updated_at
     FROM game_scores
     WHERE user_id = $1`,
    [userId]
  );
  return rows.reduce((acc, r) => {
    acc[r.game_key] = r;
    return acc;
  }, {});
}
