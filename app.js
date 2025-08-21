
import morgan from "morgan";
import express from "express";
const app = express();

/* ===== CORS (top of file) ===== */
const normalize = (s = "") => s.replace(/\/+$/, "").toLowerCase();
const MAIN = normalize(process.env.CORS_ORIGIN || "https://brain-cloud.netlify.app");
const DEV  = normalize("http://localhost:5173");

app.use((req, res, next) => {
  const raw = req.headers.origin || "";
  const origin = normalize(raw);

  // allow main site, dev, and (optionally) netlify previews:
  const isMain    = origin === MAIN;
  const isDev     = origin === DEV;
  const isPreview = origin.endsWith(".netlify.app");   // <-- remove if you don’t want previews

  if (raw && (isMain || isDev || isPreview)) {
    res.setHeader("Access-Control-Allow-Origin", raw);
    // res.setHeader("Access-Control-Allow-Credentials", "true"); // only if you use cookies/sessions
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ===== Parsers + logs ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ===== Healthcheck ===== */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ===== Auth token middleware ===== */
import getUserFromToken from "#middleware/getUserFromToken";
app.use(getUserFromToken); // make sure this does NOT reject when no token on public routes

/* ===== Routers ===== */
import usersRouter from "#api/users";
import newsRouter from "#api/news";
import weatherRouter from "./api/weather.js";
import exchangeRouter from "#api/exchange";
import cryptoRouter from "#api/crypto";
import stocksRouter from "#api/stocks";
import mapRouter from "#api/map";
import gamesRouter from "#api/games";
import journalRouter from "#api/journal";
import moodRouter from "#api/mood";

app.use("/users", usersRouter);
app.use("/daily/news", newsRouter);
app.use("/daily/weather", weatherRouter);
app.use("/daily/exchange", exchangeRouter);
app.use("/daily/crypto", cryptoRouter);
app.use("/daily/stocks", stocksRouter);
app.use("/map", mapRouter);
app.use("/games", gamesRouter);
app.use("/journal", journalRouter);
app.use("/mood", moodRouter);

/* ===== 404 JSON ===== */
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

/* ===== Error handlers (JSON) ===== */
app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02": return res.status(400).json({ message: err.message });
    case "23505":
    case "23503": return res.status(400).json({ message: err.detail });
    default: return next(err);
  }
});

app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Sorry! Something went wrong." });
});

export default app;