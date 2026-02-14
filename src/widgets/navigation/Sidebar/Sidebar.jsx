import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MENU } from "./menu.config";
import { useAuth } from "@/features/auth/session";
import { PATHS } from "@/shared/config";

function hasPermissions(user, needed = []) {
  if (!needed?.length) return true;
  const set = new Set(user?.permissions || []);
  return needed.every((p) => set.has(p));
}

function isItemActive(pathname, item) {
  if (item.matchPrefix) {
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  }
  return pathname === item.to;
}

export default function Sidebar({ collapsed, onNavigate, onCloseMobile }) {
  const { user } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const menu = useMemo(() => {
    return MENU.map((g) => ({
      ...g,
      items: g.items.filter((it) => hasPermissions(user, it.permissions)),
    })).filter((g) => g.items.length > 0);
  }, [user]);

  useEffect(() => {
    // auto open parent group if current path matches any child
    const next = {};
    for (const group of menu) {
      for (const it of group.items) {
        if (it.children?.some((c) => location.pathname.startsWith(c.to))) {
          next[it.label] = true;
        }
      }
    }
    if (Object.keys(next).length) {
      setOpenGroups((p) => ({ ...p, ...next }));
    }
  }, [location.pathname, menu]);

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
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

        <button
          type="button"
          className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
          id="vertical-hover"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <i className="ri-record-circle-line"></i>
        </button>
      </div>

      {onCloseMobile ? (
        <button
          type="button"
          className="btn btn-sm btn-light d-md-none sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          <i className="ri-close-line fs-20"></i>
        </button>
      ) : null}

      <div id="scrollbar">
        <div className="container-fluid">
          <div id="two-column-menu"></div>

          <ul className="navbar-nav" id="navbar-nav">
            {menu.map((group) => (
              <Fragment key={group.title}>
                <li className="menu-title">
                  <span>{group.title}</span>
                </li>

                {group.items.map((item) =>
                  item.children ? (
                    <SidebarGroup
                      key={item.label}
                      item={item}
                      open={!!openGroups[item.label]}
                      onNavigate={onNavigate}
                      onToggle={() =>
                        setOpenGroups((p) => ({ ...p, [item.label]: !p[item.label] }))
                      }
                    />
                  ) : (
                    <li className="nav-item" key={item.label}>
                      <NavLink
                        to={item.to}
                        className={() =>
                          isItemActive(location.pathname, item)
                            ? "nav-link menu-link active"
                            : "nav-link menu-link"
                        }
                        onClick={onNavigate}
                        end={!item.matchPrefix}
                      >
                        <i className={item.iconClass}></i>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  )
                )}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>

      <div className="sidebar-background"></div>
    </div>
  );
}

function SidebarGroup({ item, open, onToggle, onNavigate }) {
  return (
    <li className="nav-item">
      <button
        type="button"
        className="nav-link menu-link w-100 text-start border-0 bg-transparent"
        aria-expanded={open}
        onClick={onToggle}
      >
        <i className={item.iconClass}></i>
        <span>{item.label}</span>
      </button>

      <div className={open ? "collapse menu-dropdown show" : "collapse menu-dropdown"}>
        <ul className="nav nav-sm flex-column">
          {item.children.map((c) => (
            <li className="nav-item" key={c.to}>
              <NavLink
                to={c.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={onNavigate}
              >
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
