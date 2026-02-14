const DEFAULT_PAGINATION_WINDOW = 7;

// Keeps pagination compact by showing first/last pages and a moving middle window.
export function getVisiblePages(totalPages, currentPage, windowSize = DEFAULT_PAGINATION_WINDOW) {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const innerCount = Math.max(3, windowSize - 2);
  let start = Math.max(2, currentPage - Math.floor(innerCount / 2));
  let end = Math.min(totalPages - 1, start + innerCount - 1);

  start = Math.max(2, end - innerCount + 1);

  if (start > 2) pages.push("left-ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("right-ellipsis");

  pages.push(totalPages);
  return pages;
}
