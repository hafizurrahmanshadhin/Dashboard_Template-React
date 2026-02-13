import { Link } from "react-router-dom";
import { useHtmlDataset } from "../../shared/hooks/useHtmlDataset";
import { useBodyClass } from "../../shared/hooks/useBodyClass";
import { useAuth } from "../../features/auth/session/model/AuthContext";
import { PATHS } from "../../app/router/paths";

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const ctaPath = isAuthenticated ? PATHS.dashboard : PATHS.root;
  const ctaLabel = isAuthenticated ? "Back to Dashboard" : "Back to home";

  useHtmlDataset({
    layout: "vertical",
    topbar: "light",
    sidebar: "light",
    sidebarSize: "lg",
    sidebarImage: "none",
    preloader: "disable",
  });

  useBodyClass("auth-body", true);

  return (
    <div className="auth-page-wrapper py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="auth-page-content overflow-hidden p-0">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-7 col-lg-8">
              <div className="text-center">
                <img
                  src="/assets/images/error400-cover.png"
                  alt="Page not found"
                  className="img-fluid"
                />
                <div className="mt-3">
                  <h3 className="text-uppercase">Sorry, Page not Found</h3>
                  <p className="text-muted mb-4">The page you are looking for is not available.</p>
                  <Link to={ctaPath} className="btn btn-primary">
                    <i className="mdi mdi-home me-1"></i>
                    {ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
