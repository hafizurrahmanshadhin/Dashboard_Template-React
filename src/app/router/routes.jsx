import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "../../widgets/auth-shell/AuthLayout";
import DashboardLayout from "../../widgets/dashboard-shell/DashboardLayout";

import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage";

import DashboardPage from "../../pages/dashboard/DashboardPage";
import RolePermissionPage from "../../pages/apps/RolePermissionPage";
import RolePermissionManagePage from "../../pages/apps/RolePermissionManagePage";
import UsersPage from "../../pages/apps/UsersPage";

import NotFoundPage from "../../pages/not-found/NotFoundPage";

import RequireAuth from "../../features/auth/session/guards/RequireAuth";
import { PATHS } from "./paths";

export const router = createBrowserRouter([
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
]);
