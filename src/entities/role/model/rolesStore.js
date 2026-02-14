import { storage } from "@/shared/lib";
import { PERMISSIONS } from "@/entities/permission";

export const ROLE_STORAGE_KEY = "velzon_demo_roles";

export const ROLE_PERMISSION_OPTIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_EDIT,
  PERMISSIONS.ROLES_VIEW,
  PERMISSIONS.ROLES_CREATE,
  PERMISSIONS.ROLES_EDIT,
  PERMISSIONS.SETTINGS_VIEW,
];

export const DEFAULT_ROLES = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to dashboard modules and management actions.",
    status: "Active",
    permissions: ROLE_PERMISSION_OPTIONS,
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "Can monitor dashboards and manage users, but cannot change global settings.",
    status: "Active",
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.ROLES_VIEW,
    ],
  },
  {
    id: "role-support",
    name: "Support",
    description: "Focused on user support tasks.",
    status: "Active",
    permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USERS_VIEW],
  },
  {
    id: "role-viewer",
    name: "Viewer",
    description: "Read-only access to dashboard sections.",
    status: "Inactive",
    permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.USERS_VIEW],
  },
];

function normalizeRoles(raw) {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_ROLES;

  return raw
    .map((role) => ({
      id: role?.id || `role-${Math.random().toString(36).slice(2, 9)}`,
      name: role?.name?.trim() || "Untitled Role",
      description: role?.description?.trim() || "",
      status: role?.status === "Inactive" ? "Inactive" : "Active",
      permissions: Array.isArray(role?.permissions)
        ? role.permissions.filter((item) => ROLE_PERMISSION_OPTIONS.includes(item))
        : [],
    }))
    .filter((role) => role.name);
}

export function loadRoles() {
  return normalizeRoles(storage.get(ROLE_STORAGE_KEY));
}

export function saveRoles(roles) {
  storage.set(ROLE_STORAGE_KEY, normalizeRoles(roles));
}
