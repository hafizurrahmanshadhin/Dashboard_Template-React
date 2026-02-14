import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthLayout, DashboardLayout } from "@/widgets/layouts";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { NotFoundPage } from "@/pages/not-found";
import { RolePermissionManagePage, RolePermissionPage } from "@/pages/rbac";
import { UsersPage } from "@/pages/users";

import { RequireAuth } from "@/features/auth/session";
import { PATHS } from "@/shared/config";

export const appRoutes = [
  { path: PATHS.root, element: <Navigate to={PATHS.dashboard} replace /> },

  {
    element: <AuthLayout />,
    children: [
      { path: PATHS.login, element: <LoginPage /> },
      { path: PATHS.register, element: <RegisterPage /> },
      { path: PATHS.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },

  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { path: PATHS.dashboard, element: <DashboardPage /> },
      { path: PATHS.rolePermission, element: <RolePermissionPage /> },
      { path: PATHS.rolePermissionManage, element: <RolePermissionManagePage /> },
      { path: PATHS.users, element: <UsersPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(appRoutes);
