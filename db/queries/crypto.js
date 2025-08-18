import axios from "axios";

const API_KEY = process.env.CRYPTO_API_KEY;

/**
 * Fetch top 10 cryptos from API without storing in DB
 */
export async function fetchCrypto() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";

  try {
    const res = await axios.get(url);

    return res.data.map((crypto) => ({
      id: crypto.id,
      name: crypto.name,
      image: crypto.image,
      current_price: crypto.current_price,
      price_change_percentage_24h: crypto.price_change_percentage_24h,
    }));
  } catch (err) {
    console.error(
      "Request failed:",
      err.response?.status,
      err.response?.data || err.message
    );
    return [];
  }
}

/**
 * Get a single crypto by id from API
 */
export async function fetchCryptoById(id, base = "usd") {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${base}&ids=${id}`;

  try {
    const res = await axios.get(url);

    if (!res.data.length) return null;

    const crypto = res.data[0];
    return {
      id: crypto.id,
      name: crypto.name,
      image: crypto.image,
      current_price: crypto.current_price,
      price_change_percentage_24h: crypto.price_change_percentage_24h,
    };
  } catch (err) {
    console.error(
      "Request failed:",
      err.response?.status,
      err.response?.data || err.message
    );
    return null;
  }
}
