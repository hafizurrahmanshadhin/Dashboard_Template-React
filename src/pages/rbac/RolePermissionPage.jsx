import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ModalPortal } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { getActiveInactivePillClass, getVisiblePages, normalizeSearchValue } from "@/shared/lib";
import { PATHS } from "@/shared/config";
import { loadRoles } from "@/entities/role";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, "all"];
const DEFAULT_SORT = { key: "name", direction: "asc" };
const FILTER_ALL = "all";
const SEARCH_DEBOUNCE_MS = 220;

function sortRoles(list, sortKey, direction) {
  return [...list].sort((left, right) => {
    const multiplier = direction === "asc" ? 1 : -1;

    if (sortKey === "permissionCount") {
      const leftCount = Array.isArray(left.permissions) ? left.permissions.length : 0;
      const rightCount = Array.isArray(right.permissions) ? right.permissions.length : 0;
      if (leftCount < rightCount) return -1 * multiplier;
      if (leftCount > rightCount) return 1 * multiplier;
      return 0;
    }

    const leftValue = normalizeSearchValue(left?.[sortKey]);
    const rightValue = normalizeSearchValue(right?.[sortKey]);

    if (leftValue < rightValue) return -1 * multiplier;
    if (leftValue > rightValue) return 1 * multiplier;
    return 0;
  });
}

export default function RolePermissionPage() {
  const roles = useMemo(() => loadRoles(), []);
  const [viewRole, setViewRole] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [permissionFilter, setPermissionFilter] = useState(FILTER_ALL);
  const [density, setDensity] = useState("comfortable");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [sortKey, setSortKey] = useState(DEFAULT_SORT.key);
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT.direction);

  const activeFilterCount = useMemo(
    () => Number(statusFilter !== FILTER_ALL) + Number(permissionFilter !== FILTER_ALL),
    [permissionFilter, statusFilter]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize, permissionFilter, statusFilter]);

  useEffect(() => {
    setPageJumpValue(String(currentPage));
  }, [currentPage]);

  const filteredRoles = useMemo(() => {
    const query = normalizeSearchValue(debouncedSearchTerm);

    return roles.filter((role) => {
      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
      const permissionCount = permissions.length;

      const matchesQuery =
        !query ||
        [role.name, role.description, role.status, permissions.join(" ")]
          .map(normalizeSearchValue)
          .some((value) => value.includes(query));

      const matchesStatus =
        statusFilter === FILTER_ALL ||
        normalizeSearchValue(role.status) === normalizeSearchValue(statusFilter);

      let matchesPermissionCount = true;
      if (permissionFilter === "few") matchesPermissionCount = permissionCount <= 2;
      if (permissionFilter === "medium") {
        matchesPermissionCount = permissionCount >= 3 && permissionCount <= 5;
      }
      if (permissionFilter === "many") matchesPermissionCount = permissionCount >= 6;

      return matchesQuery && matchesStatus && matchesPermissionCount;
    });
  }, [debouncedSearchTerm, permissionFilter, roles, statusFilter]);

  const sortedRoles = useMemo(
    () => sortRoles(filteredRoles, sortKey, sortDirection),
    [filteredRoles, sortDirection, sortKey]
  );

  const totalRecords = sortedRoles.length;
  const isAllPageSize = pageSize === "all";
  const totalPages = isAllPageSize ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageStart = isAllPageSize ? 0 : (currentPage - 1) * pageSize;
  const pageEnd = isAllPageSize ? totalRecords : pageStart + pageSize;
  const paginatedRoles = isAllPageSize ? sortedRoles : sortedRoles.slice(pageStart, pageEnd);
  const showingFrom = totalRecords ? pageStart + 1 : 0;
  const showingTo = Math.min(pageEnd, totalRecords);
  const visiblePages = useMemo(
    () => getVisiblePages(totalPages, currentPage),
    [currentPage, totalPages]
  );

  const toolbarMeta =
    totalRecords === roles.length
      ? `Total ${roles.length} roles`
      : `${totalRecords} matched of ${roles.length}`;

  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter(FILTER_ALL);
    setPermissionFilter(FILTER_ALL);
    setFiltersOpen(false);
  };

  const applyPageJump = () => {
    const parsed = Number(pageJumpValue);
    if (!Number.isFinite(parsed)) {
      setPageJumpValue(String(currentPage));
      return;
    }

    const nextPage = Math.min(totalPages, Math.max(1, Math.trunc(parsed)));
    setCurrentPage(nextPage);
  };

  const toggleSort = (nextKey) => {
    setCurrentPage(1);
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <i className="ri-expand-up-down-line ms-1 text-muted"></i>;
    return sortDirection === "asc" ? (
      <i className="ri-arrow-up-s-line ms-1"></i>
    ) : (
      <i className="ri-arrow-down-s-line ms-1"></i>
    );
  };

  const SortableHeader = ({ label, field, className = "" }) => (
    <th
      className={className}
      aria-sort={
        sortKey === field ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button type="button" className="users-table-sort-btn" onClick={() => toggleSort(field)}>
        {label}
        {sortIcon(field)}
      </button>
    </th>
  );

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center">
            <div className="flex-grow-1">
              <h4 className="card-title mb-1">Role & Permission</h4>
              <p className="text-muted mb-0">
                Manage role list and permission assignment (static demo data).
              </p>
            </div>
            <Link to={PATHS.rolePermissionManage} className="btn btn-primary">
              <i className="ri-add-line align-bottom me-1"></i>
              Create
            </Link>
          </div>

          <div className="card-body">
            <div className="users-toolbar-grid">
              <div className="users-search-group">
                <i className="ri-search-line"></i>
                <input
                  type="text"
                  className="form-control users-search-input"
                  placeholder="Search role, permission, description..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>

              <div className="users-toolbar-actions">
                <button
                  type="button"
                  className={`btn btn-sm users-filter-toggle ${filtersOpen ? "active" : ""}`}
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  aria-expanded={filtersOpen}
                  aria-controls="roles-advanced-filters"
                >
                  <i className="ri-filter-3-line"></i>
                  Filters
                  {activeFilterCount ? (
                    <span className="users-filter-count">{activeFilterCount}</span>
                  ) : null}
                </button>
              </div>
            </div>

            <div
              id="roles-advanced-filters"
              className={`users-advanced-filters ${filtersOpen ? "is-open" : ""}`}
            >
              <div className="users-advanced-filters-grid">
                <select
                  className="form-select users-filter-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value={FILTER_ALL}>All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  className="form-select users-filter-select"
                  value={permissionFilter}
                  onChange={(event) => setPermissionFilter(event.target.value)}
                >
                  <option value={FILTER_ALL}>All permission sizes</option>
                  <option value="few">Few (0-2)</option>
                  <option value="medium">Medium (3-5)</option>
                  <option value="many">Many (6+)</option>
                </select>

                <div
                  className="btn-group users-density-toggle"
                  role="group"
                  aria-label="Row density"
                >
                  <button
                    type="button"
                    className={`btn btn-sm ${density === "comfortable" ? "active" : ""}`}
                    onClick={() => setDensity("comfortable")}
                  >
                    Cozy
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${density === "compact" ? "active" : ""}`}
                    onClick={() => setDensity("compact")}
                  >
                    Compact
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-light btn-sm users-clear-btn"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="table-responsive users-table-wrap">
              <div className="users-table-panel-head">
                <p className="text-muted mb-0">{toolbarMeta}</p>
                <select
                  className="form-select users-page-size-select"
                  value={pageSize}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPageSize(value === "all" ? "all" : Number(value));
                  }}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size === "all" ? "All" : `${size} / page`}
                    </option>
                  ))}
                </select>
              </div>

              <table
                className={`table align-middle mb-0 users-table roles-table users-density-${density}`}
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "65px" }}>#</th>
                    <SortableHeader label="Role" field="name" className="roles-col-role" />
                    <SortableHeader
                      label="Permissions"
                      field="permissionCount"
                      className="roles-col-permissions"
                    />
                    <SortableHeader label="Status" field="status" className="roles-col-status" />
                    <th className="text-end roles-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.length ? (
                    paginatedRoles.map((role, index) => {
                      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
                      return (
                        <tr key={role.id}>
                          <td>{pageStart + index + 1}</td>
                          <td className="roles-col-role">
                            <h6 className="mb-1 roles-role-title">{role.name}</h6>
                            <small className="text-muted roles-role-description">
                              {role.description || "No description"}
                            </small>
                          </td>
                          <td className="roles-col-permissions">
                            <div className="roles-permission-list">
                              {permissions.slice(0, 4).map((permission) => (
                                <span key={permission} className="roles-permission-badge">
                                  {permission}
                                </span>
                              ))}
                              {permissions.length > 4 ? (
                                <span className="roles-permission-more">
                                  +{permissions.length - 4} more
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="roles-col-status">
                            <span className={getActiveInactivePillClass(role.status)}>
                              {role.status}
                            </span>
                          </td>
                          <td className="text-end roles-col-actions">
                            <div className="d-inline-flex gap-1 users-action-group">
                              <button
                                type="button"
                                className="btn btn-sm users-action-btn users-action-view"
                                onClick={() => setViewRole(role)}
                              >
                                <i className="ri-eye-line"></i>
                                View
                              </button>
                              <Link
                                to={`${PATHS.rolePermissionManage}?mode=edit&id=${role.id}`}
                                className="btn btn-sm users-action-btn users-action-edit"
                              >
                                <i className="ri-pencil-line"></i>
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No roles found for the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mt-3">
              <p className="text-muted mb-0">
                Showing {showingFrom} to {showingTo} of {totalRecords} entries
              </p>

              <div className="users-pagination-tools">
                <form
                  className="users-page-jump"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applyPageJump();
                  }}
                >
                  <label htmlFor="roles-page-jump-input">Page</label>
                  <input
                    id="roles-page-jump-input"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageJumpValue}
                    onChange={(event) => setPageJumpValue(event.target.value)}
                  />
                  <span>of {totalPages}</span>
                  <button type="submit" className="btn btn-sm btn-light">
                    Go
                  </button>
                </form>

                <nav aria-label="Role pagination">
                  <ul className="pagination pagination-sm users-pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(1)}
                        aria-label="First page"
                      >
                        First
                      </button>
                    </li>

                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      >
                        Prev
                      </button>
                    </li>

                    {visiblePages.map((page) =>
                      typeof page === "number" ? (
                        <li
                          key={page}
                          className={`page-item ${page === currentPage ? "active" : ""}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ) : (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      )
                    )}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </button>
                    </li>

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(totalPages)}
                        aria-label="Last page"
                      >
                        Last
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleDetailsModal role={viewRole} onClose={() => setViewRole(null)} />
    </div>
  );
}

function RoleDetailsModal({ role, onClose }) {
  if (!role) return null;

  const permissions = Array.isArray(role.permissions) ? role.permissions : [];

  return (
    <ModalPortal
      open={Boolean(role)}
      title="Role Details"
      onClose={onClose}
      dialogClassName="modal-lg"
      footer={
        <button type="button" className="btn btn-light" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="row g-3">
        <div className="col-12 col-md-8">
          <small className="text-muted d-block">Role Name</small>
          <h5 className="mb-0">{role.name || "Untitled Role"}</h5>
        </div>
        <div className="col-12 col-md-4">
          <small className="text-muted d-block">Status</small>
          <span className={getActiveInactivePillClass(role.status)}>{role.status || "Active"}</span>
        </div>
        <div className="col-12">
          <small className="text-muted d-block">Description</small>
          <p className="mb-0">{role.description || "No description available."}</p>
        </div>
        <div className="col-12">
          <small className="text-muted d-block mb-2">Permissions ({permissions.length})</small>
          <div className="roles-permission-list">
            {permissions.length ? (
              permissions.map((permission) => (
                <span key={permission} className="roles-permission-badge">
                  {permission}
                </span>
              ))
            ) : (
              <span className="roles-permission-more">No permissions assigned</span>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
