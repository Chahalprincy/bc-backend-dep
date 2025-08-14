DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS map;
DROP TABLE IF EXISTS daily_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name TEXT NOT NULL,
  feature_type TEXT,
  created_at TIME,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_items (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  is_favorite BOOLEAN,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE journal_entries (
  id serial PRIMARY KEY,
  entry_timestamp DATE,
  title TEXT,
  context TEXT,
  -- image,
  tags TEXT,
  created_at TIME,
  updated_at TIME,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE map (
  id serial PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  location_type TEXT DEFAULT 'been_there',
  notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  visited_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE game_scores (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_key     TEXT    NOT NULL CHECK (game_key IN ('reaction','memory')),
  best_time_ms INTEGER NOT NULL,
  attempts     INTEGER NOT NULL DEFAULT 1,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_key)
);
