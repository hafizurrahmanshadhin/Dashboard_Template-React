import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Alert from "../../shared/ui/Alert";
import {
  DEFAULT_USERS,
  loadUsers,
  saveUsers,
} from "../../features/users/model/usersStore";
import { loadRoles } from "../../features/rbac/model/rolesStore";

const FALLBACK_AVATAR = "/assets/images/users/avatar-1.jpg";
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];
const DEFAULT_SORT = { key: "name", direction: "asc" };

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

function statusBadgeVariant(status) {
  return status === "Active" ? "success" : "secondary";
}

function normalizeValue(input) {
  return String(input || "").toLowerCase();
}

function sortUsers(list, sortKey, direction) {
  return [...list].sort((left, right) => {
    const leftValue = normalizeValue(left?.[sortKey]);
    const rightValue = normalizeValue(right?.[sortKey]);
    const multiplier = direction === "asc" ? 1 : -1;

    if (leftValue < rightValue) return -1 * multiplier;
    if (leftValue > rightValue) return 1 * multiplier;
    return 0;
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState(() => loadUsers());
  const roleOptions = useMemo(() => {
    const options = loadRoles().map((role) => role.name).filter(Boolean);
    return options.length ? [...new Set(options)] : ["Support"];
  }, []);

  const [notification, setNotification] = useState(null);
  const [editorMode, setEditorMode] = useState("create");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(() => getInitialForm(roleOptions));
  const [errors, setErrors] = useState({});
  const [viewUser, setViewUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(DEFAULT_SORT.key);
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT.direction);

  useEffect(() => {
    if (!users.length) {
      setUsers(DEFAULT_USERS);
      saveUsers(DEFAULT_USERS);
    }
  }, [users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user.phone, user.role, user.status, user.address]
        .map(normalizeValue)
        .some((value) => value.includes(query))
    );
  }, [searchTerm, users]);

  const sortedUsers = useMemo(
    () => sortUsers(filteredUsers, sortKey, sortDirection),
    [filteredUsers, sortDirection, sortKey]
  );

  const totalRecords = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginatedUsers = sortedUsers.slice(pageStart, pageEnd);
  const showingFrom = totalRecords ? pageStart + 1 : 0;
  const showingTo = Math.min(pageEnd, totalRecords);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
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

  const SortableHeader = ({ label, field, className = "" }) => (
    <th className={className}>
      <button
        type="button"
        className="btn btn-link p-0 text-reset text-decoration-none fw-semibold"
        onClick={() => toggleSort(field)}
      >
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
    setEditorMode("create");
    setForm(getInitialForm(roleOptions));
    setErrors({});
    setEditingUserId(null);
    setEditorOpen(true);
  };

  const openEditModal = (user) => {
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

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center">
            <div className="flex-grow-1">
              <h4 className="card-title mb-1">Users</h4>
              <p className="text-muted mb-0">
                Manage users from a static frontend table (no API connected yet).
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

            <div className="row g-2 align-items-center mb-3">
              <div className="col-12 col-md-7 col-lg-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, phone, role, status..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-5 col-lg-4">
                <div className="d-flex align-items-center justify-content-md-end gap-2">
                  <label className="mb-0 text-muted small">Per page</label>
                  <select
                    className="form-select w-auto"
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "65px" }}>#</th>
                    <SortableHeader label="Name" field="name" />
                    <SortableHeader label="Email" field="email" />
                    <th>Profile Photo</th>
                    <SortableHeader label="Phone Number" field="phone" />
                    <SortableHeader label="Role" field="role" />
                    <SortableHeader label="Status" field="status" />
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length ? (
                    paginatedUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td>{pageStart + index + 1}</td>
                        <td>{user.name || "-"}</td>
                        <td>{user.email || "-"}</td>
                        <td>
                          <img
                            src={user.avatar || FALLBACK_AVATAR}
                            alt={user.name || "User avatar"}
                            className="rounded-circle avatar-sm object-fit-cover"
                          />
                        </td>
                        <td>{user.phone || "-"}</td>
                        <td>{user.role || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm btn-soft-${statusBadgeVariant(user.status)}`}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status || "Active"}
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-info"
                              onClick={() => setViewUser(user)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-soft-primary"
                              onClick={() => openEditModal(user)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        No users found for your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-3">
              <p className="text-muted mb-0">
                Showing {showingFrom} to {showingTo} of {totalRecords} entries
              </p>

              <nav aria-label="Users pagination">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    >
                      Prev
                    </button>
                  </li>

                  {pageNumbers.map((page) => (
                    <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <DashboardModal
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, avatar: event.target.value }))
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
                placeholder="Enter address"
              ></textarea>
            </div>
          </div>
        </form>
      </DashboardModal>

      <DashboardModal
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
      </DashboardModal>
    </div>
  );
}

function DashboardModal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1060 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">{children}</div>

            <div className="modal-footer">{footer}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
    </>,
    document.body
  );
}
