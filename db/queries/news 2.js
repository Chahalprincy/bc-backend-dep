import axios from "axios";
import pkg from "pg";
const { Pool } = pkg;

const API_KEY = process.env.NEWS_API_KEY;

const pool = new Pool({
  user: "fabianacarvalho",
  host: "localhost",
  database: "bc",
  password: "your_pg_password",
  port: 5432,
});

const apiClient = axios.create({
  baseURL: "https://newsapi.org/v2",
});

export async function getNews(search, page) {
  const url = `/everything?q=${encodeURIComponent(
    search
  )}&apiKey=${API_KEY}&pageSize=12&page=${page}`;
  try {
    const response = await apiClient.get(url, {
      headers: { "User-Agent": "MyNewsApp/1.0" },
    });
    console.log("API response totalResults:", response.data.totalResults);
    return response.data.articles;
  } catch (err) {
    console.error("Request failed:", err.response?.status, err.response?.data);
    throw err;
  }
}

export async function saveArticle(article) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO news (source, author, title, description, content, url, urlToImage, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (url) DO NOTHING`,
      [
        article.source.name,
        article.author,
        article.title,
        article.description,
        article.content,
        article.url,
        article.urlToImage,
        article.publishedAt,
      ]
    );
  } finally {
    client.release();
  }
}
