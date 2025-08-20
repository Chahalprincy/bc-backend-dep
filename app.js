import morgan from "morgan";
import express from "express";
const app = express();
import cors from "cors";

import getUserFromToken from "#middleware/getUserFromToken";

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

const ALLOWED_ORIGINS = [
  process.env.CORS_ORIGIN,          // e.g. https://brain-cloud.netlify.app
  "http://localhost:5173",          // Vite dev
].filter(Boolean);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(cors({
  origin(origin, cb) {
    // allow curl/postman/no origin
    if (!origin) return cb(null, true);
    cb(ALLOWED_ORIGINS.includes(origin) ? null : new Error("Not allowed by CORS"), true);
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true, // enable only if you use cookie sessions
}));

app.options("*", cors());

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(getUserFromToken);

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
