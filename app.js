import morgan from "morgan";
import express from "express";
const app = express();
import cors from "cors";



import usersRouter from "#api/users";
import mapRouter from "#api/map";
import getUserFromToken from "#middleware/getUserFromToken";
import newsRouter from "#api/news";

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(getUserFromToken);

app.use("/users", usersRouter);
app.use("/daily/news", newsRouter);

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