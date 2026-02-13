import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../features/auth/session/model/AuthContext";
import Alert from "../../shared/ui/Alert";
import { PATHS } from "../../app/router/paths";

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("user@user.com");
  const [password, setPassword] = useState("12345678");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const res = await login({ email, password, remember });
    setLoading(false);
    if (!res.ok) return setError(res.message || "Login failed");
    nav(PATHS.dashboard);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6 col-xl-5">
        <div className="card mt-4">
          <div className="card-body p-4">
            <div className="text-center mt-2">
              <h5 className="text-primary">Welcome Back !</h5>
              <p className="text-muted">Sign in to continue.</p>
            </div>

            <div className="p-2 mt-4">
              {error ? <Alert variant="warning">{error}</Alert> : null}
              {location.state?.message ? <Alert variant="success">{location.state.message}</Alert> : null}

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <div className="float-end">
                    <Link to={PATHS.forgotPassword} className="text-muted">
                      Forgot password?
                    </Link>
                  </div>
                  <label className="form-label" htmlFor="password-input">
                    Password
                  </label>
                  <div className="position-relative auth-pass-inputgroup mb-3">
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control pe-5 password-input"
                      placeholder="Enter password"
                      id="password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                    >
                      <i className="ri-eye-fill align-middle"></i>
                    </button>
                  </div>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="auth-remember-check"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="auth-remember-check">
                    Remember me
                  </label>
                </div>

                <div className="mt-4">
                  <button className="btn btn-success w-100" type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="mb-0">
            Don't have an account ?{" "}
            <Link to={PATHS.register} className="fw-semibold text-primary text-decoration-underline">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
