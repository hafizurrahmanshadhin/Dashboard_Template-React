import { useAuth } from "../../features/auth/session/model/AuthContext";

const stats = [
  { label: "Total Users", value: 1240, icon: "ri-user-3-line" },
  { label: "Orders", value: 532, icon: "ri-shopping-bag-3-line" },
  { label: "Revenue", value: "$18,420", icon: "ri-money-dollar-circle-line" },
  { label: "Tickets", value: 27, icon: "ri-customer-service-2-line" },
];

const recent = [
  { id: 1, name: "Rahim", action: "Created a new request", time: "2 mins ago" },
  { id: 2, name: "Karim", action: "Approved an item", time: "10 mins ago" },
  { id: 3, name: "Sadia", action: "Updated profile", time: "1 hour ago" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="row">
      <div className="col-12">
        <div className="mb-4">
          <h4 className="mb-0">Dashboard</h4>
          <p className="text-muted mb-0">Hello, {user?.name}! (static demo data)</p>
        </div>
      </div>

      {stats.map((s) => (
        <div className="col-12 col-md-6 col-xl-3" key={s.label}>
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-primary-subtle text-primary rounded fs-3">
                    <i className={s.icon}></i>
                  </span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">{s.label}</p>
                  <h4 className="mb-0">{s.value}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12 col-xl-8">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">Recent Activity</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th className="text-end">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.action}</td>
                      <td className="text-end">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <button className="btn btn-primary w-100 mb-2" type="button">
              Create Request
            </button>
            <button className="btn btn-outline-primary w-100 mb-2" type="button">
              View Reports
            </button>
            <button className="btn btn-outline-secondary w-100" type="button">
              Manage Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
