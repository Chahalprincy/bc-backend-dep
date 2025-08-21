import express from "express";
import requireUser from "#middleware/requireUser";
import {
  getMapPinsByUserId,
  createMapPin,
  updateMapPin,
  deleteMapPin,
} from "#db/queries/map";

const router = express.Router();

// Get Mapbox access token (secure endpoint)
router.get("/mapbox-token", requireUser, (req, res) => {
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Mapbox token not configured" });
  }
  res.json({
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  });
});

// Format pin for response
const formatPin = (pin) => ({
  id: pin.id,
  name: pin.name,
  longitude: parseFloat(pin.longitude),
  latitude: parseFloat(pin.latitude),
  address: pin.address,
  notes: pin.notes,
  rating: pin.rating,
  visitedDate: pin.visited_date,
  locationType: pin.location_type,
  createdAt: pin.created_at,
});

// Get all pins for logged-in user
router.get("/pins", requireUser, async (req, res) => {
  try {
    const pins = await getMapPinsByUserId(req.user.id);
    const formattedPins = pins.map(formatPin);
    res.json(formattedPins);
  } catch (error) {
    console.error("Error fetching pins:", error);
    res.status(500).json({ error: "Failed to fetch pins" });
  }
});

// Create new pin for logged-in user
router.post("/pins", requireUser, async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      address,
      notes,
      rating,
      locationType,
      visitedDate,
    } = req.body;

    // Validate required fields
    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        error: "Name, latitude, and longitude are required",
      });
    }

    const newPin = await createMapPin({
      userId: req.user.id,
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || null,
      notes: notes || null,
      rating: rating ? parseInt(rating) : null,
      locationType: locationType || "been_there",
      visitedDate: visitedDate || null,
    });

    const formattedPin = formatPin(newPin);
    res.status(201).json(formattedPin);
  } catch (error) {
    console.error("Error creating pin:", error);
    res.status(500).json({
      error: "Failed to create pin",
      details: error.message,
    });
  }
});

// Update pin
router.put("/pins/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      latitude,
      longitude,
      address,
      notes,
      rating,
      locationType,
      visitedDate,
    } = req.body;

    const updatedPin = await updateMapPin(id, req.user.id, {
      name,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      address,
      notes,
      rating: rating ? parseInt(rating) : null,
      locationType,
      visitedDate,
    });

    if (!updatedPin) {
      return res.status(404).json({ error: "Pin not found" });
    }

    const formattedPin = formatPin(updatedPin);
    res.json(formattedPin);
  } catch (error) {
    console.error("Error updating pin:", error);
    res.status(500).json({ error: "Failed to update pin" });
  }
});

// Delete pin
router.delete("/pins/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMapPin(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: "Pin not found" });
    }

    res.json({ message: "Pin deleted successfully" });
  } catch (error) {
    console.error("Error deleting pin:", error);
    res.status(500).json({ error: "Failed to delete pin" });
  }
});

export default router;
