import db from "#db/client";

export async function createMapPin({
  userId,
  name,
  latitude,
  longitude,
  address,
  notes,
  rating,
  locationType,
  visitedDate,
}) {
  const sql = `
    INSERT INTO map (user_id, name, latitude, longitude, address, notes, rating, location_type, visited_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *
    `;
  const {
    rows: [pin],
  } = await db.query(sql, [
    userId,
    name,
    latitude,
    longitude,
    address,
    notes,
    rating,
    locationType,
    visitedDate,
  ]);
  return pin;
}

export async function getMapPinsByUserId(userId) {
  const sql = `
    SELECT * 
    FROM map 
    WHERE user_id = $1 
    ORDER BY created_at DESC
    `;
  const { rows } = await db.query(sql, [userId]);
  return rows;
}

export async function updateMapPin(id, userId, updateData) {
  const {
    name,
    address,
    notes,
    rating,
    locationType,
    visitedDate,
    latitude,
    longitude,
  } = updateData;

  const sql = `
    UPDATE map 
    SET 
      name = COALESCE($3, name),
      address = COALESCE($4, address),
      notes = COALESCE($5, notes),
      rating = COALESCE($6, rating),
      location_type = COALESCE($7, location_type),
      visited_date = COALESCE($8, visited_date),
      latitude = COALESCE($9, latitude),
      longitude = COALESCE($10, longitude)
    WHERE id = $1 AND user_id = $2 
    RETURNING *
    `;
  const {
    rows: [pin],
  } = await db.query(sql, [
    id,
    userId,
    name,
    address,
    notes,
    rating,
    locationType,
    visitedDate,
    latitude,
    longitude,
  ]);
  return pin;
}

export async function deleteMapPin(pinId, userId) {
  const sql = `
    DELETE FROM map 
    WHERE id = $1 AND user_id = $2 
    RETURNING *
    `;
  const {
    rows: [pin],
  } = await db.query(sql, [pinId, userId]);
  return pin;
}
