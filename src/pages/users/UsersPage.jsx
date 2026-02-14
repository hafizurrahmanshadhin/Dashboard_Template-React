import { useEffect, useMemo, useState } from "react";
import { Alert, ModalPortal } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { getActiveInactivePillClass, getVisiblePages, normalizeSearchValue } from "@/shared/lib";
import { fetchUsersPage, loadUsers, saveUsers } from "@/entities/user";
import { loadRoles } from "@/entities/role";

const FALLBACK_AVATAR = "/assets/images/users/avatar-1.jpg";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, "all"];
const DEFAULT_SORT = { key: "name", direction: "asc" };
const FILTER_ALL = "all";
const SEARCH_DEBOUNCE_MS = 220;
const SERVER_TABLE_MODE = "server";

function getInitialForm(roleOptions = []) {
  return {
    name: "",
    phone: "",
    email: "",
    avatar: "",
    role: roleOptions[0] || "",
    address: "",
    status: "Active",
  };
}

function validateUserForm(form) {
  const errors = {};

  if (!form.role.trim()) errors.role = "Role is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";

  return errors;
}

function sortUsers(list, sortKey, direction) {
  return [...list].sort((left, right) => {
    const leftValue = normalizeSearchValue(left?.[sortKey]);
    const rightValue = normalizeSearchValue(right?.[sortKey]);
    const multiplier = direction === "asc" ? 1 : -1;

    if (leftValue < rightValue) return -1 * multiplier;
    if (leftValue > rightValue) return 1 * multiplier;
    return 0;
  });
}

export default function UsersPage() {
  const isServerMode =
    String(import.meta.env.VITE_USERS_TABLE_MODE || "")
      .trim()
      .toLowerCase() === SERVER_TABLE_MODE;
  const [users, setUsers] = useState(() => (isServerMode ? [] : loadUsers()));

  const roleOptions = useMemo(() => {
    const options = loadRoles()
      .map((role) => role.name)
      .filter(Boolean);
    return options.length ? [...new Set(options)] : ["Support"];
  }, []);

  const [notification, setNotification] = useState(null);
  const [editorMode, setEditorMode] = useState("create");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(() => getInitialForm(roleOptions));
  const [errors, setErrors] = useState({});
  const [viewUser, setViewUser] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [roleFilter, setRoleFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [density, setDensity] = useState("comfortable");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [pageJumpValue, setPageJumpValue] = useState("1");
  const [remoteTotal, setRemoteTotal] = useState(0);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(DEFAULT_SORT.key);
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT.direction);

  const activeFilterCount = useMemo(
    () => Number(roleFilter !== FILTER_ALL) + Number(statusFilter !== FILTER_ALL),
    [roleFilter, statusFilter]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    if (!isServerMode) return;

    const controller = new AbortController();
    // Server mode delegates pagination/filter/sort to backend to keep the table scalable.
    const run = async () => {
      setRemoteLoading(true);
      setRemoteError("");
      try {
        const { rows, total } = await fetchUsersPage(
          {
            page: currentPage,
            pageSize,
            search: debouncedSearchTerm,
            role: roleFilter,
            status: statusFilter,
            sortKey,
            sortDirection,
          },
          controller.signal
        );

        if (controller.signal.aborted) return;
        setUsers(rows);
        setRemoteTotal(total);
      } catch (error) {
        if (controller.signal.aborted) return;
        setUsers([]);
        setRemoteTotal(0);
        setRemoteError(error?.message || "Unable to load users from API.");
      } finally {
        if (!controller.signal.aborted) setRemoteLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [
    currentPage,
    debouncedSearchTerm,
    isServerMode,
    pageSize,
    refreshToken,
    roleFilter,
    sortDirection,
    sortKey,
    statusFilter,
  ]);

  useEffect(() => {
    setPageJumpValue(String(currentPage));
  }, [currentPage]);

  const filteredUsers = useMemo(() => {
    if (isServerMode) return users;

    const query = normalizeSearchValue(debouncedSearchTerm);

    return users.filter((user) => {
      const matchesQuery =
        !query ||
        [user.name, user.email, user.phone, user.role, user.status, user.address]
          .map(normalizeSearchValue)
          .some((value) => value.includes(query));

      const matchesRole =
        roleFilter === FILTER_ALL ||
        normalizeSearchValue(user.role) === normalizeSearchValue(roleFilter);
      const matchesStatus =
        statusFilter === FILTER_ALL ||
        normalizeSearchValue(user.status) === normalizeSearchValue(statusFilter);

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [debouncedSearchTerm, isServerMode, roleFilter, statusFilter, users]);

  const sortedUsers = useMemo(() => {
    if (isServerMode) return filteredUsers;
    return sortUsers(filteredUsers, sortKey, sortDirection);
  }, [filteredUsers, isServerMode, sortDirection, sortKey]);

  const totalRecords = isServerMode ? remoteTotal : sortedUsers.length;
  const isAllPageSize = pageSize === "all";
  const totalPages = isAllPageSize ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));
  const columnCount = 8;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageStart = isAllPageSize ? 0 : (currentPage - 1) * pageSize;
  const pageEnd = isAllPageSize ? totalRecords : pageStart + pageSize;
  const paginatedUsers = isServerMode
    ? sortedUsers
    : isAllPageSize
      ? sortedUsers
      : sortedUsers.slice(pageStart, pageEnd);
  const showingFrom = totalRecords ? pageStart + 1 : 0;
  const showingTo = Math.min(pageEnd, totalRecords);
  const visiblePages = useMemo(
    () => getVisiblePages(totalPages, currentPage),
    [currentPage, totalPages]
  );

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

  const clearFilters = () => {
    setSearchInput("");
    setRoleFilter(FILTER_ALL);
    setStatusFilter(FILTER_ALL);
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

  const closeEditorModal = () => {
    setEditorOpen(false);
    setErrors({});
    setEditingUserId(null);
  };

  const openCreateModal = () => {
    if (isServerMode) {
      setNotification({
        variant: "warning",
        text: "Create action is currently local-only. Connect the create API endpoint to enable it.",
      });
      return;
    }

    setEditorMode("create");
    setForm(getInitialForm(roleOptions));
    setErrors({});
    setEditingUserId(null);
    setEditorOpen(true);
  };

  const openEditModal = (user) => {
    if (isServerMode) {
      setNotification({
        variant: "warning",
        text: "Edit action is currently local-only. Connect the update API endpoint to enable it.",
      });
      return;
    }

    setEditorMode("edit");
    setEditingUserId(user.id);
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      avatar: user.avatar || "",
      role: user.role || "",
      address: user.address || "",
      status: user.status === "Inactive" ? "Inactive" : "Active",
    });
    setErrors({});
    setEditorOpen(true);
  };

  const handleEditorSubmit = (event) => {
    event.preventDefault();
    setNotification(null);

    if (isServerMode) {
      setNotification({
        variant: "warning",
        text: "This form is local-only right now. Connect API create/update to save server-side.",
      });
      return;
    }

    const nextErrors = validateUserForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const normalized = {
      id: editingUserId || `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar.trim() || FALLBACK_AVATAR,
      role: form.role.trim(),
      address: form.address.trim(),
      status: form.status === "Inactive" ? "Inactive" : "Active",
    };

    const nextUsers =
      editorMode === "edit"
        ? users.map((user) => (user.id === editingUserId ? normalized : user))
        : [normalized, ...users];

    setCurrentPage(1);
    setUsers(nextUsers);
    saveUsers(nextUsers);
    closeEditorModal();
    setNotification({
      variant: "success",
      text: editorMode === "edit" ? "User updated successfully." : "User created successfully.",
    });
  };

  const toggleUserStatus = (userId) => {
    if (isServerMode) {
      setNotification({
        variant: "warning",
        text: "Status toggle requires backend endpoint in server mode.",
      });
      return;
    }

    setUsers((previous) => {
      const next = previous.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
          : user
      );
      saveUsers(next);
      return next;
    });
  };

  const toolbarMeta = isServerMode
    ? `${totalRecords} users (server paginated)`
    : totalRecords === users.length
      ? `Total ${users.length} users`
      : `${totalRecords} matched of ${users.length}`;

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center">
            <div className="flex-grow-1">
              <h4 className="card-title mb-1">Users</h4>
              <p className="text-muted mb-0">
                {isServerMode
                  ? "Server-side data mode enabled for large-scale datasets."
                  : "Manage users from a local demo table (no API connected yet)."}
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              <i className="ri-add-line align-bottom me-1"></i>
              Create
            </button>
          </div>

          <div className="card-body">
            {notification ? (
              <Alert variant={notification.variant}>{notification.text}</Alert>
            ) : null}

            <div className="users-toolbar-grid">
              <div className="users-search-group">
                <i className="ri-search-line"></i>
                <input
                  type="text"
                  className="form-control users-search-input"
                  placeholder="Search users..."
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
                  aria-controls="users-advanced-filters"
                >
                  <i className="ri-filter-3-line"></i>
                  Filters
                  {activeFilterCount ? (
                    <span className="users-filter-count">{activeFilterCount}</span>
                  ) : null}
                </button>

                {isServerMode ? (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setRefreshToken((prev) => prev + 1)}
                  >
                    <i className="ri-refresh-line align-bottom me-1"></i>
                    Refresh
                  </button>
                ) : null}
              </div>
            </div>

            <div
              id="users-advanced-filters"
              className={`users-advanced-filters ${filtersOpen ? "is-open" : ""}`}
            >
              <div className="users-advanced-filters-grid">
                <select
                  className="form-select users-filter-select"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value={FILTER_ALL}>All roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select users-filter-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value={FILTER_ALL}>All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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

              <table className={`table align-middle mb-0 users-table users-density-${density}`}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "65px" }}>#</th>
                    <SortableHeader label="Name" field="name" className="users-col-name" />
                    <SortableHeader label="Email" field="email" className="users-col-email" />
                    <th className="users-col-photo">Profile Photo</th>
                    <SortableHeader
                      label="Phone Number"
                      field="phone"
                      className="users-col-phone"
                    />
                    <SortableHeader label="Role" field="role" className="users-col-role" />
                    <SortableHeader label="Status" field="status" className="users-col-status" />
                    <th className="text-end users-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {remoteLoading ? (
                    <tr>
                      <td colSpan={columnCount} className="text-center text-muted py-4">
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        ></span>
                        Loading users...
                      </td>
                    </tr>
                  ) : remoteError ? (
                    <tr>
                      <td colSpan={columnCount} className="text-center text-danger py-4">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <span>{remoteError}</span>
                          {isServerMode ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={() => setRefreshToken((prev) => prev + 1)}
                            >
                              Retry
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length ? (
                    paginatedUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td>{pageStart + index + 1}</td>
                        <td className="users-col-name">{user.name || "-"}</td>
                        <td className="users-col-email">{user.email || "-"}</td>
                        <td className="users-col-photo">
                          <img
                            src={user.avatar || FALLBACK_AVATAR}
                            alt={user.name || "User avatar"}
                            className="rounded-circle avatar-sm object-fit-cover"
                          />
                        </td>
                        <td className="users-col-phone">{user.phone || "-"}</td>
                        <td className="users-col-role">{user.role || "-"}</td>
                        <td className="users-col-status">
                          <button
                            type="button"
                            className={getActiveInactivePillClass(user.status)}
                            onClick={() => toggleUserStatus(user.id)}
                            disabled={isServerMode}
                          >
                            {user.status || "Active"}
                          </button>
                        </td>
                        <td className="text-end users-col-actions">
                          <div className="d-inline-flex gap-1 users-action-group">
                            <button
                              type="button"
                              className="btn btn-sm users-action-btn users-action-view"
                              onClick={() => setViewUser(user)}
                            >
                              <i className="ri-eye-line"></i>
                              View
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm users-action-btn users-action-edit"
                              onClick={() => openEditModal(user)}
                              disabled={isServerMode}
                            >
                              <i className="ri-pencil-line"></i>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columnCount} className="text-center text-muted py-4">
                        No users found for the current filters.
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
                  <label htmlFor="users-page-jump-input">Page</label>
                  <input
                    id="users-page-jump-input"
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

                <nav aria-label="Users pagination">
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

      <ModalPortal
        open={editorOpen}
        title={editorMode === "edit" ? "Edit User" : "Create User"}
        onClose={closeEditorModal}
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={closeEditorModal}>
              Cancel
            </button>
            <button type="submit" form="user-editor-form" className="btn btn-primary">
              {editorMode === "edit" ? "Update User" : "Create User"}
            </button>
          </>
        }
      >
        <form id="user-editor-form" onSubmit={handleEditorSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Enter phone number"
              />
              {errors.phone ? <div className="invalid-feedback">{errors.phone}</div> : null}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Enter email address"
              />
              {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Role <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.role ? "is-invalid" : ""}`}
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role ? <div className="invalid-feedback">{errors.role}</div> : null}
            </div>

            <div className="col-md-6">
              <label className="form-label">Avatar URL</label>
              <input
                type="text"
                className="form-control"
                value={form.avatar}
                onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Enter address"
              ></textarea>
            </div>
          </div>
        </form>
      </ModalPortal>

      <ModalPortal
        open={Boolean(viewUser)}
        title="User Details"
        onClose={() => setViewUser(null)}
        footer={
          <button type="button" className="btn btn-light" onClick={() => setViewUser(null)}>
            Close
          </button>
        }
      >
        {viewUser ? (
          <div className="d-flex flex-column flex-md-row gap-3">
            <img
              src={viewUser.avatar || FALLBACK_AVATAR}
              alt={viewUser.name || "User avatar"}
              className="rounded-circle avatar-lg object-fit-cover"
            />
            <div className="flex-grow-1">
              <h5 className="mb-3">{viewUser.name || "Unnamed User"}</h5>
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <small className="text-muted d-block">Email</small>
                  <span>{viewUser.email || "-"}</span>
                </div>
                <div className="col-12 col-md-6">
                  <small className="text-muted d-block">Phone Number</small>
                  <span>{viewUser.phone || "-"}</span>
                </div>
                <div className="col-12 col-md-6">
                  <small className="text-muted d-block">Role</small>
                  <span>{viewUser.role || "-"}</span>
                </div>
                <div className="col-12 col-md-6">
                  <small className="text-muted d-block">Status</small>
                  <span>{viewUser.status || "Active"}</span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Address</small>
                  <span>{viewUser.address || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </ModalPortal>
    </div>
  );
}
