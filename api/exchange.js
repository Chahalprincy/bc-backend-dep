import express from "express";
import {
  getRatesFromAPI,
  getSupportedCodesFromAPI,
} from "../db/queries/exchange.js";

const router = express.Router();

// Route to fetch all exchange rates
// GET /daily/exchange
router.get("/", async (req, res) => {
  try {
    const rates = await getRatesFromAPI(); // default base USD
    res.json(rates);
  } catch (err) {
    console.error("Error fetching exchange rates:", err.message);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

// Route to fetch all supported currency codes and names
// GET /daily/exchange/currency-codes
router.get("/currency-codes", async (req, res) => {
  try {
    const codes = await getSupportedCodesFromAPI();
    res.json(codes);
  } catch (err) {
    console.error("Error fetching currency codes:", err.message);
    res.status(500).json({ error: "Failed to fetch currency codes" });
  }
});

export default router;
