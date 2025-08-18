import db from "../client.js";

/**
 * Creates or updates a mood entry for a specific user and date.
 * Uses an "upsert" operation to avoid duplicate entries for the same day.
 * @param {number} userId
 * @param {number} moodValue - A value from 1 to 5.
 * @param {string} moodDate - A date string in 'YYYY-MM-DD' format.
 * @returns {Promise<object>} The created or updated mood entry.
 */
export const upsertMood = async (userId, moodValue, moodDate) => {
  const sql = `
    INSERT INTO mood_entries (user_id, mood_value, mood_date)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, mood_date)
    DO UPDATE SET mood_value = EXCLUDED.mood_value
    RETURNING *;
  `;
  const {
    rows: [mood],
  } = await db.query(sql, [userId, moodValue, moodDate]);
  return mood;
};

/**
 * Retrieves all mood entries for a specific user.
 * @param {number} userId
 * @returns {Promise<Array<object>>} A list of the user's mood entries.
 */
export const getMoodsByUserId = async (userId) => {
  const sql = `
    SELECT mood_value, mood_date FROM mood_entries WHERE user_id = $1;
  `;
  const { rows } = await db.query(sql, [userId]);
  return rows;
};