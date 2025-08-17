import express from "express";
const router = express.Router();

import { fetchCrypto, fetchCryptoById } from "../db/queries/crypto.js";

// GET /daily/crypto - get top 10 cryptos
router.get("/", async (req, res) => {
  const base = (req.query.base || "usd").toLowerCase();
  const limit = req.query.limit || 10;
  try {
    const coins = await fetchCrypto(base, limit);
    res.json(coins);
  } catch (err) {
    console.error("Error fetching crypto:", err);
    res.status(500).json({ error: "Failed to fetch crypto data" });
  }
});

// GET /daily/crypto/:id - get a specific crypto from API
router.get("/:id", async (req, res) => {
  const base = (req.query.base || "usd").toLowerCase();

  try {
    const crypto = await fetchCryptoById(req.params.id, base);
    if (!crypto) {
      return res.status(404).json({ error: "Cryptocurrency not found" });
    }
    res.json(crypto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch crypto from API" });
  }
});

export default router;
