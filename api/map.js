import express from "express";
import requireUser from "#middleware/requireUser";
import {
  getMapPinsByUserId,
  createMapPin,
  updateMapPin,
  deleteMapPin,
} from "#db/queries/map";

const mapRouter = express.Router();

// Get Mapbox access token (secure endpoint)
mapRouter.get("/mapbox-token", requireUser, (req, res) => {
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Mapbox token not configured" });
  }
  res.json({
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  });
});

// Get all pins for logged-in user
mapRouter.get("/pins", requireUser, async (req, res, next) => {
  try {
    const pins = await getMapPinsByUserId(req.user.id);

    // Format pins for frontend
    const formattedPins = pins.map((pin) => ({
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
    }));

    res.json(formattedPins);
  } catch (error) {
    next(error);
  }
});

// Create new pin for logged-in user
mapRouter.post("/pins", requireUser, async (req, res, next) => {
  console.log("Adding pin request received:", req.body);
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

    if (!name || !latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Name, latitude, and longitude are required" });
    }

    const newPin = await createMapPin({
      userId: req.user.id,
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      notes,
      rating: rating ? parseInt(rating) : null,
      locationType,
      visitedDate,
    });

    // Format response
    const formattedPin = {
      id: newPin.id,
      name: newPin.name,
      longitude: parseFloat(newPin.longitude),
      latitude: parseFloat(newPin.latitude),
      address: newPin.address,
      notes: newPin.notes,
      rating: newPin.rating,
      visitedDate: newPin.visited_date,
      locationType: newPin.location_type,
      createdAt: newPin.created_at,
    };

    res.status(201).json(formattedPin);
  } catch (error) {
    next(error);
  }
});

// Update pin
mapRouter.put("/pins/:id", requireUser, async (req, res, next) => {
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

    // Format response
    const formattedPin = {
      id: updatedPin.id,
      name: updatedPin.name,
      longitude: parseFloat(updatedPin.longitude),
      latitude: parseFloat(updatedPin.latitude),
      address: updatedPin.address,
      notes: updatedPin.notes,
      rating: updatedPin.rating,
      visitedDate: updatedPin.visited_date,
      locationType: updatedPin.location_type,
      createdAt: updatedPin.created_at,
    };

    res.json(formattedPin);
  } catch (error) {
    next(error);
  }
});

// Delete pin
mapRouter.delete("/pins/:id", requireUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await deleteMapPin(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: "Pin not found" });
    }

    res.json({ message: "Pin deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default mapRouter;
