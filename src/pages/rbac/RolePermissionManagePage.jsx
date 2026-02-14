import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "@/shared/ui";
import { getActiveInactivePillClass } from "@/shared/lib";
import { PATHS } from "@/shared/config";
import { ROLE_PERMISSION_OPTIONS, loadRoles, saveRoles } from "@/entities/role";

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "Active",
  permissions: [],
};

function getMode(input) {
  if (input === "edit" || input === "view") return input;
  return "create";
}

function formatPermissionLabel(permission) {
  return permission
    .replaceAll(".", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RolePermissionManagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTimeoutRef = useRef(null);

  const mode = getMode(searchParams.get("mode"));
  const roleId = searchParams.get("id");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const roles = useMemo(() => loadRoles(), []);
  const selectedRole = useMemo(
    () => roles.find((role) => role.id === roleId) || null,
    [roleId, roles]
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if ((isEdit || isView) && selectedRole) {
      setForm({
        name: selectedRole.name,
        description: selectedRole.description,
        status: selectedRole.status || "Active",
        permissions: selectedRole.permissions || [],
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [isEdit, isView, selectedRole]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) window.clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const isMissingRole = (isEdit || isView) && !selectedRole;
  const selectedCount = form.permissions.length;

  const pageTitle = isView
    ? "View Role & Permission"
    : isEdit
      ? "Edit Role & Permission"
      : "Create Role & Permission";

  const submitLabel = isEdit ? "Update Role" : "Create Role";
  const modeLabel = isView ? "View Mode" : isEdit ? "Edit Mode" : "Create Mode";

  const togglePermission = (permission) => {
    if (isView) return;

    setForm((prev) => {
      const exists = prev.permissions.includes(permission);
      const nextPermissions = exists
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission];

      return { ...prev, permissions: nextPermissions };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(null);

    if (isView) return;

    if (!form.name.trim()) {
      setMessage({ variant: "danger", text: "Role name is required." });
      return;
    }

    if (!form.permissions.length) {
      setMessage({ variant: "danger", text: "Select at least one permission." });
      return;
    }

    const normalized = {
      id: selectedRole?.id || `role-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status === "Inactive" ? "Inactive" : "Active",
      permissions: [...new Set(form.permissions)],
    };

    const nextRoles = selectedRole
      ? roles.map((role) => (role.id === selectedRole.id ? normalized : role))
      : [normalized, ...roles];

    saveRoles(nextRoles);
    setMessage({
      variant: "success",
      text: selectedRole ? "Role updated successfully." : "Role created successfully.",
    });

    if (redirectTimeoutRef.current) window.clearTimeout(redirectTimeoutRef.current);
    // Keeps success feedback visible briefly before returning to the listing page.
    redirectTimeoutRef.current = window.setTimeout(() => navigate(PATHS.rolePermission), 700);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center">
            <div className="flex-grow-1">
              <h4 className="card-title mb-1">{pageTitle}</h4>
              <p className="text-muted mb-0">
                Configure role details and permission mapping (frontend/static only).
              </p>
            </div>
            <Link to={PATHS.rolePermission} className="btn btn-light">
              <i className="ri-arrow-left-line align-bottom me-1"></i>
              Back
            </Link>
          </div>

          <div className="card-body roles-manage-body">
            {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}

            {isMissingRole ? (
              <Alert variant="danger">
                The selected role was not found. Please return to the role list.
              </Alert>
            ) : (
              <>
                <div className="roles-manage-overview mb-3">
                  <div>
                    <span className="roles-manage-mode-pill">{modeLabel}</span>
                    <p className="text-muted mb-0 mt-2">
                      Selected permissions: <strong>{selectedCount}</strong> of{" "}
                      {ROLE_PERMISSION_OPTIONS.length}
                    </p>
                  </div>
                  <div className="roles-manage-overview-side">
                    <span className={getActiveInactivePillClass(form.status)}>
                      {form.status || "Active"}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="roles-manage-section">
                    <h6 className="roles-manage-section-title">Basic Details</h6>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Role Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.name}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Enter role name"
                          readOnly={isView}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, status: event.target.value }))
                          }
                          disabled={isView}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={form.description}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                          placeholder="Describe what this role is for"
                          readOnly={isView}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="roles-manage-section mt-3">
                    <h6 className="roles-manage-section-title">Permissions</h6>
                    <div className="roles-manage-permission-grid">
                      {ROLE_PERMISSION_OPTIONS.map((permission) => {
                        const checked = form.permissions.includes(permission);
                        return (
                          <label
                            key={permission}
                            className={`roles-manage-permission-item ${checked ? "is-active" : ""} ${isView ? "is-readonly" : ""}`}
                          >
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(permission)}
                              disabled={isView}
                            />
                            <span>{formatPermissionLabel(permission)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="roles-manage-footer mt-4">
                    <Link to={PATHS.rolePermission} className="btn btn-light">
                      {isView ? "Close" : "Cancel"}
                    </Link>
                    {!isView ? (
                      <button type="submit" className="btn btn-primary">
                        {submitLabel}
                      </button>
                    ) : null}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
