import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Alert from "../../shared/ui/Alert";
import { PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/session/model/AuthContext";

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!name || !email || !phoneNumber || !password || !passwordConfirmation) {
      return setError("Name, email, phone number, password and confirmation are required.");
    }
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== passwordConfirmation) return setError("Password confirmation does not match.");
    if (!termsAndConditions) return setError("Please accept terms and conditions.");

    setLoading(true);
    const res = await register({
      name,
      email,
      phone_number: phoneNumber,
      address,
      password,
      password_confirmation: passwordConfirmation,
      terms_and_conditions: termsAndConditions,
    });
    setLoading(false);

    if (!res.ok) return setError(res.message || "Registration failed");
    nav(res.authenticated ? PATHS.dashboard : PATHS.login);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6 col-xl-5">
        <div className="card mt-4">
          <div className="card-body p-4">
            <div className="text-center mt-2">
              <h5 className="text-primary">Create New Account</h5>
              <p className="text-muted">Get your free account now</p>
            </div>

            <div className="p-2 mt-4">
              {error ? <Alert variant="warning">{error}</Alert> : null}

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone_number"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="password-input">
                    Password
                  </label>
                  <div className="position-relative auth-pass-inputgroup">
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control pe-5 password-input"
                      placeholder="Enter password"
                      id="password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="mb-3">
                  <label className="form-label" htmlFor="password-confirmation-input">
                    Confirm Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm password"
                    id="password-confirmation-input"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms-and-conditions"
                    checked={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="terms-and-conditions">
                    I agree to the terms and conditions
                  </label>
                </div>

                <div className="mt-4">
                  <button className="btn btn-success w-100" type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="mb-0">
            Already have an account ?{" "}
            <Link to={PATHS.login} className="fw-semibold text-primary text-decoration-underline">
              Signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
