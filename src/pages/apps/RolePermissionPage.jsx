import { Link } from "react-router-dom";
import { PATHS } from "../../app/router/paths";
import { loadRoles } from "../../features/rbac/model/rolesStore";

function permissionVariant(status) {
  return status === "Active" ? "success" : "secondary";
}

export default function RolePermissionPage() {
  const roles = loadRoles();

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
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <h6 className="mb-1">{role.name}</h6>
                        <small className="text-muted">{role.description || "No description"}</small>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {role.permissions.slice(0, 4).map((permission) => (
                            <span key={permission} className="badge bg-info-subtle text-info">
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 4 ? (
                            <span className="badge bg-light text-muted">
                              +{role.permissions.length - 4} more
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${permissionVariant(role.status)}-subtle text-${permissionVariant(role.status)}`}>
                          {role.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Link
                            to={`${PATHS.rolePermissionManage}?mode=view&id=${role.id}`}
                            className="btn btn-sm btn-soft-info"
                          >
                            View
                          </Link>
                          <Link
                            to={`${PATHS.rolePermissionManage}?mode=edit&id=${role.id}`}
                            className="btn btn-sm btn-soft-primary"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

