import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../shared/ui/Alert";
import { PATHS } from "../../app/router/paths";
import {
  ROLE_PERMISSION_OPTIONS,
  loadRoles,
  saveRoles,
} from "../../features/rbac/model/rolesStore";

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

  const mode = getMode(searchParams.get("mode"));
  const roleId = searchParams.get("id");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const roles = useMemo(() => loadRoles(), []);
  const selectedRole = useMemo(
    () => roles.find((role) => role.id === roleId) || null,
    [roleId, roles]
  );

  const [form, setForm] = useState(() => {
    if (selectedRole) {
      return {
        name: selectedRole.name,
        description: selectedRole.description,
        status: selectedRole.status || "Active",
        permissions: selectedRole.permissions || [],
      };
    }
    return EMPTY_FORM;
  });

  const [message, setMessage] = useState(null);

  const pageTitle = isView
    ? "View Role & Permission"
    : isEdit
      ? "Edit Role & Permission"
      : "Create Role & Permission";

  const submitLabel = isEdit ? "Update Role" : "Create Role";

  const isMissingRole = (isEdit || isView) && !selectedRole;

  const togglePermission = (permission) => {
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

    setTimeout(() => navigate(PATHS.rolePermission), 550);
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

          <div className="card-body">
            {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}

            {isMissingRole ? (
              <Alert variant="danger">
                The selected role was not found. Please return to the role list.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
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

                  <div className="col-md-3">
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
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder="Describe what this role is for"
                      readOnly={isView}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Permissions</label>
                    <div className="row g-2">
                      {ROLE_PERMISSION_OPTIONS.map((permission) => (
                        <div className="col-12 col-md-6 col-xl-4" key={permission}>
                          <label className="form-check border rounded p-2 m-0">
                            <input
                              className="form-check-input me-2"
                              type="checkbox"
                              checked={form.permissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              disabled={isView}
                            />
                            <span className="form-check-label">
                              {formatPermissionLabel(permission)}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!isView ? (
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <Link to={PATHS.rolePermission} className="btn btn-light">
                      Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      {submitLabel}
                    </button>
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

