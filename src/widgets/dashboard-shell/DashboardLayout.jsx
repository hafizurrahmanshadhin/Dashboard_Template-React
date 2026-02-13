import { Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHtmlDataset } from "../../shared/hooks/useHtmlDataset";
import { useBodyClass } from "../../shared/hooks/useBodyClass";
import Topbar from "../navigation/Topbar/Topbar";
import Sidebar from "../navigation/Sidebar/Sidebar";
import Footer from "../footer/Footer";

const MOBILE_BREAKPOINT = 767;

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    if (isMobileViewport()) {
      setMobileSidebarOpen((v) => !v);
      return;
    }

    setSidebarCollapsed((v) => !v);
  }, []);

  useBodyClass("vertical-sidebar-enable", mobileSidebarOpen);

  // template-style dataset values (sidebarSize toggles lg/sm)
  useHtmlDataset(
    useMemo(
      () => ({
        layout: "vertical",
        topbar: "light",
        sidebar: "light",
        sidebarSize: mobileSidebarOpen ? "lg" : sidebarCollapsed ? "sm" : "lg",
        sidebarImage: "none",
        preloader: "disable",
      }),
      [mobileSidebarOpen, sidebarCollapsed]
    )
  );

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      if (!isMobileViewport()) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div id="layout-wrapper">
      <Topbar onToggleSidebar={handleSidebarToggle} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onNavigate={closeMobileSidebar}
        onCloseMobile={closeMobileSidebar}
      />

      <div className="vertical-overlay" onClick={closeMobileSidebar}></div>

      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>

      <BackToTop />
    </div>
  );
}

function BackToTop() {
  useEffect(() => {
    const btn = document.getElementById("back-to-top");
    const onScroll = () => {
      if (!btn) return;
      if (window.scrollY > 200) btn.style.display = "block";
      else btn.style.display = "none";
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className="btn btn-danger btn-icon"
      id="back-to-top"
      style={{ display: "none" }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <i className="ri-arrow-up-line"></i>
    </button>
  );
}
