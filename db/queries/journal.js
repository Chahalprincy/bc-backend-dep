import db from "../client.js";

/**
 * Creates a new journal entry for a specific user.
 * @param {{userId: number, title: string, content: string, tags: string, entry_timestamp: Date}} entryData - The data for the new entry.
 * @returns {Promise<object>} The newly created journal entry.
 */
export async function createJournalEntry({ userId, title, content, tags, entry_timestamp }) {
  const sql = `
    INSERT INTO journal_entries (user_id, title, content, tags, entry_timestamp)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const {
    rows: [entry],
  } = await db.query(sql, [userId, title, content, tags, entry_timestamp]);
  return entry;
}

// --- NO CHANGES NEEDED FOR THE FUNCTIONS BELOW ---

/**
 * Retrieves all journal entries for a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A list of the user's journal entries.
 */
export async function getJournalEntriesByUserId(userId) {
  const sql = `
    SELECT *
    FROM journal_entries
    WHERE user_id = $1
    ORDER BY entry_timestamp DESC;
  `;
  const { rows } = await db.query(sql, [userId]);
  return rows;
}

/**
 * Updates an existing journal entry.
 * @param {number} entryId - The ID of the entry to update.
 * @param {number} userId - The ID of the user making the request.
 * @param {{title: string, content: string, tags: string}} updates - The fields to update.
 * @returns {Promise<object|null>} The updated journal entry, or null if not found.
 */
export async function updateJournalEntry(entryId, userId, { title, content, tags }) {
  const sql = `
    UPDATE journal_entries
    SET title = $1, content = $2, tags = $3, updated_at = NOW()
    WHERE id = $4 AND user_id = $5
    RETURNING *;
  `;
  const {
    rows: [entry],
  } = await db.query(sql, [title, content, tags, entryId, userId]);
  return entry;
}


/**
 * Deletes a journal entry.
 * @param {number} entryId - The ID of the entry to delete.
 * @param {number} userId - The ID of the user owning the entry.
 * @returns {Promise<object|null>} The deleted entry, or null if not found.
 */
export async function deleteJournalEntry(entryId, userId) {
  const sql = `
    DELETE FROM journal_entries
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const {
    rows: [entry],
  } = await db.query(sql, [entryId, userId]);
  return entry;
}