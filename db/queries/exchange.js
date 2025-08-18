import axios from "axios";

const API_KEY = process.env.EXCHANGE_API_KEY;

/**
 * Fetch rates from API without storing in DB
 */
export async function fetchRatesFromAPI(base = "USD") {
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;
  const { data } = await axios.get(url);

  if (!data?.conversion_rates) {
    throw new Error("Invalid response from ExchangeRate API");
  }

  return data;
}

/**
 * Get all rates from API (same as fetchRatesFromAPI)
 */
export async function getRatesFromAPI(base = "USD") {
  const data = await fetchRatesFromAPI(base);
  return Object.entries(data.conversion_rates).map(
    ([currency_code, exchange_rate]) => ({
      currency_code,
      exchange_rate,
      base_currency: base,
      last_updated: data.time_last_update_utc,
    })
  );
}

/**
 * Get a single rate by code from API
 */
export async function getRateByCodeFromAPI(code, base = "USD") {
  const data = await fetchRatesFromAPI(base);
  const rate = data.conversion_rates[code.toUpperCase()];
  if (!rate) return null;
  return {
    currency_code: code.toUpperCase(),
    exchange_rate: rate,
    base_currency: base,
    last_updated: data.time_last_update_utc,
  };
}

/**
 * Get supported currency codes and names from API
 */
export async function getSupportedCodesFromAPI() {
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;
  const { data } = await axios.get(url);

  if (!data?.supported_codes) {
    throw new Error("Invalid response from ExchangeRate API (codes)");
  }

  return data.supported_codes.map(([currency_code, currency_name]) => ({
    currency_code,
    currency_name,
  }));
}
