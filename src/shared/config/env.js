const DEFAULT_API_BASE_URL = "https://admin.gogobarter.com";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
const normalizedBaseUrl = normalizeBaseUrl(rawBaseUrl);

export const ENV = {
  API_BASE_URL: normalizedBaseUrl,
  API_BASE_URL_WITH_PREFIX: normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`,
};
