import { Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBodyClass, useHtmlDataset } from "@/shared/hooks";
import { Topbar, Sidebar } from "@/widgets/navigation";
import { Footer } from "@/widgets/footer";

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
  const [visible, setVisible] = useState(false);
  const scrollContainersRef = useRef([]);

  useEffect(() => {
    const containers = [
      window,
      document.querySelector(".main-content"),
      document.querySelector(".page-content"),
    ].filter(Boolean);

    scrollContainersRef.current = containers;

    const getScrollTop = (target) => {
      if (target === window) {
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }
      return target.scrollTop || 0;
    };

    const updateVisibility = () => {
      const shouldShow = containers.some((target) => getScrollTop(target) > 120);
      setVisible(shouldShow);
    };

    updateVisibility();
    containers.forEach((target) =>
      target.addEventListener("scroll", updateVisibility, { passive: true })
    );

    return () => {
      containers.forEach((target) => target.removeEventListener("scroll", updateVisibility));
    };
  }, []);

  const handleGoTop = () => {
    scrollContainersRef.current.forEach((target) => {
      if (target === window) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (target.scrollTop > 0) {
        target.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <button
      type="button"
      className="btn btn-danger btn-icon"
      id="back-to-top"
      style={{ display: visible ? "inline-flex" : "none" }}
      onClick={handleGoTop}
      aria-label="Back to top"
    >
      <i className="ri-arrow-up-line"></i>
    </button>
  );
}
