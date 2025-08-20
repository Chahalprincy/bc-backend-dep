import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FINNHUB_API_KEY;

// GET /daily/stocks - get stock data for multiple symbols
router.get("/", async (req, res) => {
  const symbols =
    req.query.symbols || "AAPL,GOOGL,MSFT,AMZN,TSLA,NVDA,META,NFLX";
  const symbolArray = symbols.split(",");

  try {
    const stockPromises = symbolArray.map(async (symbol) => {
      try {
        const [quoteRes, profileRes] = await Promise.all([
          axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
          ),
          axios.get(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
          ),
        ]);

        return {
          symbol,
          name: profileRes.data.name || symbol,
          logo: profileRes.data.logo || null,
          current_price: quoteRes.data.c,
          previous_close: quoteRes.data.pc,
          change: quoteRes.data.d,
          change_percent: quoteRes.data.dp,
          high: quoteRes.data.h,
          low: quoteRes.data.l,
          open: quoteRes.data.o,
          timestamp: quoteRes.data.t,
        };
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err.message);
        return {
          symbol,
          name: symbol,
          logo: null,
          current_price: 0,
          previous_close: 0,
          change: 0,
          change_percent: 0,
          high: 0,
          low: 0,
          open: 0,
          timestamp: 0,
          error: true,
        };
      }
    });

    const stocks = await Promise.all(stockPromises);
    res.json(stocks);
  } catch (err) {
    console.error("Error fetching stocks:", err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// GET /daily/stocks/search - search for stocks
router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query parameter required" });
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(
        query
      )}&token=${API_KEY}`
    );

    const results = response.data.result
      ? response.data.result.slice(0, 10).map((stock) => ({
          symbol: stock.symbol,
          description: stock.description,
          displaySymbol: stock.displaySymbol,
          type: stock.type,
        }))
      : [];

    res.json(results);
  } catch (err) {
    console.error("Error searching stocks:", err);
    res.status(500).json({ error: "Failed to search stocks" });
  }
});

// GET /daily/stocks/:symbol - get individual stock data
router.get("/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    const [quoteRes, profileRes] = await Promise.all([
      axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      ),
      axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
      ),
    ]);

    const stock = {
      symbol,
      name: profileRes.data.name || symbol,
      logo: profileRes.data.logo || null,
      current_price: quoteRes.data.c,
      previous_close: quoteRes.data.pc,
      change: quoteRes.data.d,
      change_percent: quoteRes.data.dp,
      high: quoteRes.data.h,
      low: quoteRes.data.l,
      open: quoteRes.data.o,
      timestamp: quoteRes.data.t,
      // Additional profile data
      country: profileRes.data.country,
      currency: profileRes.data.currency,
      exchange: profileRes.data.exchange,
      industry: profileRes.data.finnhubIndustry,
      marketCapitalization: profileRes.data.marketCapitalization,
      shareOutstanding: profileRes.data.shareOutstanding,
      weburl: profileRes.data.weburl,
    };

    res.json(stock);
  } catch (err) {
    console.error(`Error fetching data for ${symbol}:`, err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

export default router;
