import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../../../shared/api/axios";
import { PERMISSIONS } from "../../../../entities/permission/model/permissions";

const AuthContext = createContext(null);

const LS_KEY = "velzon_demo_auth";

function loadSession() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (!session) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function buildUser(apiUser = {}) {
  return {
    id: apiUser?.id ?? null,
    name: apiUser?.name || apiUser?.email || "User",
    email: apiUser?.email || "",
    phone_number: apiUser?.phone_number || "",
    address: apiUser?.address ?? null,
    role: apiUser?.role || "user",
    permissions: Array.isArray(apiUser?.permissions)
      ? apiUser.permissions
      : [PERMISSIONS.DASHBOARD_VIEW],
    terms_and_conditions: Boolean(apiUser?.terms_and_conditions),
  };
}

function buildSessionFromPayload(payload = {}) {
  const token = payload?.token;
  if (!token) return null;

  return {
    tokenType: payload?.token_type || "bearer",
    token,
    user: buildUser(payload?.data || {}),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    if (session?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [session?.token]);

  const value = useMemo(() => {
    const user = session?.user ?? null;

    const login = async ({ email, password }) => {
      try {
        const res = await api.post(
          "/auth/login",
          { email, password },
          { headers: { Accept: "application/json", "Content-Type": "application/json" } }
        );

        const payload = res?.data || {};
        const next = buildSessionFromPayload(payload);
        if (!next) {
          return { ok: false, message: payload?.message || "Login failed" };
        }

        setSession(next);
        saveSession(next);
        return { ok: true, data: payload };
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please check your credentials.";
        return { ok: false, message };
      }
    };

    const register = async ({
      name,
      email,
      phone_number,
      address,
      password,
      password_confirmation,
      terms_and_conditions,
    }) => {
      try {
        const res = await api.post(
          "/auth/register",
          {
            name,
            email,
            phone_number,
            address: address?.trim() ? address.trim() : null,
            password,
            password_confirmation,
            terms_and_conditions: terms_and_conditions ? 1 : 0,
          },
          { headers: { Accept: "application/json", "Content-Type": "application/json" } }
        );

        const payload = res?.data || {};
        const next = buildSessionFromPayload(payload);

        if (next) {
          setSession(next);
          saveSession(next);
          return { ok: true, authenticated: true, data: payload };
        }

        return { ok: true, authenticated: false, data: payload };
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        const firstValidationMessage = Object.values(error?.response?.data?.errors || {})?.[0]?.[0];
        const message =
          firstValidationMessage ||
          apiMessage ||
          error?.message ||
          "Registration failed. Please check your input.";
        return { ok: false, message };
      }
    };

    const logout = async () => {
      try {
        if (session?.token) {
          await api.post(
            "/auth/logout",
            {},
            { headers: { Accept: "application/json", Authorization: `Bearer ${session.token}` } }
          );
        }
      } catch {
        // API logout failure should not block local sign-out.
      }

      setSession(null);
      saveSession(null);
      return { ok: true };
    };

    return {
      isAuthenticated: Boolean(session?.token),
      token: session?.token ?? null,
      user,
      login,
      register,
      logout,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
