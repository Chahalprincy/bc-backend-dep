import express from "express";
import { getNews } from "../db/queries/news.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q = "latest", page = 1 } = req.query;
  try {
    const data = await getNews(q, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
