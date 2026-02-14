import { PERMISSIONS } from "@/entities/permission";
import { PATHS } from "@/shared/config";

export const MENU = [
  {
    title: "Menu",
    items: [
      {
        label: "Dashboard",
        iconClass: "ri-home-4-line",
        to: PATHS.dashboard,
        permissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
      {
        label: "Settings",
        iconClass: "ri-settings-3-line",
        to: "/dashboard/settings",
        permissions: [PERMISSIONS.SETTINGS_VIEW], // demo: not granted
      },
    ],
  },
  {
    title: "Apps",
    items: [
      {
        label: "Role & Permission",
        iconClass: "ri-shield-user-line",
        to: PATHS.rolePermission,
        matchPrefix: true,
      },
      { label: "Users", iconClass: "ri-team-line", to: PATHS.users },
    ],
  },
];
