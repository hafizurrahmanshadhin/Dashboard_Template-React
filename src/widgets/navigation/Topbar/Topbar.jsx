import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/session";
import { PATHS } from "@/shared/config";

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    nav(PATHS.login);
  };

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box horizontal-logo">
              <Link to={PATHS.dashboard} className="logo logo-dark">
                <span className="logo-sm">
                  <img src="/assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="/assets/images/logo-dark.png" alt="" height="17" />
                </span>
              </Link>

              <Link to={PATHS.dashboard} className="logo logo-light">
                <span className="logo-sm">
                  <img src="/assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="/assets/images/logo-light.png" alt="" height="17" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
              id="topnav-hamburger-icon"
              onClick={onToggleSidebar}
            >
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          <div className="d-flex align-items-center">
            <div className="dropdown ms-sm-3 header-item topbar-user">
              <button
                type="button"
                className="btn"
                id="page-header-user-dropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="d-flex align-items-center">
                  <img
                    className="rounded-circle header-profile-user"
                    src="/assets/images/users/avatar-1.jpg"
                    alt="Header Avatar"
                  />
                  <span className="text-start ms-xl-2">
                    <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                      {user?.name ?? "User"}
                    </span>
                    <span className="d-none d-xl-block ms-1 fs-12 user-name-sub-text">
                      Role: {user?.role ?? "-"}
                    </span>
                  </span>
                </span>
              </button>

              <div className="dropdown-menu dropdown-menu-end">
                <h6 className="dropdown-header">Welcome!</h6>
                <Link className="dropdown-item" to={PATHS.dashboard}>
                  <i className="mdi mdi-view-dashboard text-muted fs-16 align-middle me-1"></i>
                  <span className="align-middle">Dashboard</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button type="button" className="dropdown-item" onClick={onLogout}>
                  <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                  <span className="align-middle">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
