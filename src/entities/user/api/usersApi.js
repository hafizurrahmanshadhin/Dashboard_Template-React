import { api } from "@/shared/api";

const DEFAULT_USERS_ENDPOINT = "/users";

function normalizeNumeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}

function normalizePerPage(value, fallback = 10) {
  if (
    String(value || "")
      .trim()
      .toLowerCase() === "all"
  )
    return "all";
  return normalizeNumeric(value, fallback);
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function normalizeTotal(payload, fallbackLength = 0) {
  const candidates = [
    payload?.meta?.total,
    payload?.pagination?.total,
    payload?.meta?.pagination?.total,
    payload?.total,
    payload?.count,
    fallbackLength,
  ];

  const matched = candidates.find((value) => Number.isFinite(Number(value)));
  return matched === undefined ? fallbackLength : Number(matched);
}

function buildQuery(params = {}) {
  const query = {
    page: normalizeNumeric(params.page, 1),
    per_page: normalizePerPage(params.pageSize, 10),
    sort_by: String(params.sortKey || "name"),
    sort_direction: params.sortDirection === "desc" ? "desc" : "asc",
  };

  const search = String(params.search || "").trim();
  if (search) query.search = search;

  const role = String(params.role || "")
    .trim()
    .toLowerCase();
  if (role && role !== "all") query.role = params.role;

  const status = String(params.status || "")
    .trim()
    .toLowerCase();
  if (status && status !== "all") query.status = params.status;

  return query;
}

export async function fetchUsersPage(params = {}, signal) {
  const endpoint = String(import.meta.env.VITE_USERS_ENDPOINT || DEFAULT_USERS_ENDPOINT).trim();

  try {
    const response = await api.get(endpoint || DEFAULT_USERS_ENDPOINT, {
      params: buildQuery(params),
      signal,
    });

    const payload = response?.data ?? {};
    const rows = normalizeRows(payload);
    const total = normalizeTotal(payload, rows.length);

    return { rows, total };
  } catch (error) {
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      throw error;
    }

    const message =
      error?.response?.data?.message || error?.message || "Failed to fetch users list from server.";
    throw new Error(message);
  }
}
