import { Outlet } from "react-router-dom";
import { useBodyClass, useHtmlDataset } from "@/shared/hooks";

export default function AuthLayout() {
  useHtmlDataset({
    layout: "vertical",
    topbar: "light",
    sidebar: "light",
    sidebarSize: "lg",
    sidebarImage: "none",
    preloader: "disable",
  });

  // many templates add body class for auth background
  useBodyClass("auth-body", true);

  return (
    <div className="auth-page-wrapper pt-5">
      <div className="auth-page-content">
        <div className="container">
          <Outlet />
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  &copy; {new Date().getFullYear()} Shadhin. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger"></i> by Shadhin
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
