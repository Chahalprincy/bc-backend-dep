import morgan from "morgan";
import express from "express";
const app = express();

// ---- CORS (normalize + log) ----
const normalize = (s = "") => s.replace(/\/+$/, "").toLowerCase();

const NETLIFY = normalize(process.env.CORS_ORIGIN || "https://brain-cloud.netlify.app");
const DEV     = normalize("http://localhost:5173");

// show what we think is allowed in Render logs
console.log("[CORS] ALLOW:", { NETLIFY, DEV });

const ALLOW = new Set([NETLIFY, DEV]);

app.use((req, res, next) => {
  const rawOrigin = req.headers.origin || "";
  const origin = normalize(rawOrigin);

  // log what we received so we can compare in Render logs
  if (rawOrigin) console.log("[CORS] req.origin:", rawOrigin);

  if (origin && ALLOW.has(origin)) {
    // echo back the original (non-normalized) origin
    res.setHeader("Access-Control-Allow-Origin", rawOrigin);
    // If you use cookies/sessions, also set:
    // res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/__test", (req, res) => {
  res.json({ ok: true, method: "GET" });
});

app.post("/__test", (req, res) => {
  res.json({ ok: true, method: "POST" });
});

app.get("/health", (req, res) => res.json({ ok: true }));


import getUserFromToken from "#middleware/getUserFromToken";
app.use(getUserFromToken);

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


app.use((err, req, res, next) => {
  // A switch statement can be used instead of if statements
  // when multiple cases are handled the same way.
  switch (err.code) {
    // Invalid type
    case "22P02":
      // CHANGE THIS to send JSON
      return res.status(400).json({ message: err.message });
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      // CHANGE THIS to send JSON
      return res.status(400).json({ message: err.detail });
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
