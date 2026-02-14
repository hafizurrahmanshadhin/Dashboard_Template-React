export function getActiveInactivePillClass(status) {
  return status === "Active"
    ? "users-status-pill users-status-pill-active"
    : "users-status-pill users-status-pill-inactive";
}
