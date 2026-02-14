export function normalizeSearchValue(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}
