import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { RequireAuth } from "@/features/auth/session";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";

const AUTH_STORAGE_KEY = "velzon_demo_auth";

function renderWithProviders(ui, { initialEntries = ["/"], session = null } = {}) {
  localStorage.clear();
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return render(
    <AppProviders>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AppProviders>
  );
}

describe("routing/auth smoke tests", () => {
  it("redirects unauthenticated user from private route", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<h1>Login Screen</h1>} />
        <Route
          path="/private"
          element={
            <RequireAuth>
              <h1>Private Screen</h1>
            </RequireAuth>
          }
        />
      </Routes>,
      { initialEntries: ["/private"] }
    );

    expect(await screen.findByRole("heading", { name: /login screen/i })).toBeInTheDocument();
  });

  it("allows authenticated user to access private route", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<h1>Login Screen</h1>} />
        <Route
          path="/private"
          element={
            <RequireAuth>
              <h1>Private Screen</h1>
            </RequireAuth>
          }
        />
      </Routes>,
      {
        initialEntries: ["/private"],
        session: {
          tokenType: "bearer",
          token: "fake-token",
          user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "Admin",
            permissions: ["dashboard.view"],
          },
        },
      }
    );

    expect(await screen.findByRole("heading", { name: /private screen/i })).toBeInTheDocument();
  });

  it("renders login page and not-found page components", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>,
      { initialEntries: ["/login"] }
    );

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("renders not found route", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>,
      { initialEntries: ["/route-that-does-not-exist"] }
    );

    expect(
      await screen.findByRole("heading", { name: /sorry, page not found/i })
    ).toBeInTheDocument();
  });
});
