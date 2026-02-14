import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/shared/api";
import { Alert } from "@/shared/ui";
import { PATHS } from "@/shared/config";

const RESEND_COOLDOWN_SECONDS = 120;

function getErrorMessage(error, fallback) {
  const apiMessage = error?.response?.data?.message;
  const validationErrors = error?.response?.data?.errors;
  const firstValidationMessage = validationErrors
    ? Object.values(validationErrors)?.[0]?.[0]
    : null;
  return firstValidationMessage || apiMessage || error?.message || fallback;
}

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (step !== 2 || resendSecondsLeft <= 0) return;

    const timerId = window.setInterval(() => {
      setResendSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [step, resendSecondsLeft]);

  const sendOtpRequest = async () => {
    return api.post(
      "/auth/send-otp",
      { email },
      { headers: { Accept: "application/json", "Content-Type": "application/json" } }
    );
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtpRequest();
      setLoading(false);
      setStep(2);
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setSuccess(res?.data?.message || "OTP sent successfully.");
    } catch (error) {
      setLoading(false);
      setError(getErrorMessage(error, "Failed to send OTP."));
    }
  };

  const resendOtp = async () => {
    if (resendLoading || resendSecondsLeft > 0) return;
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);
      const res = await sendOtpRequest();
      setResendLoading(false);
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setSuccess(res?.data?.message || "OTP sent successfully.");
    } catch (error) {
      setResendLoading(false);
      setError(getErrorMessage(error, "Failed to resend OTP."));
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!otp) {
      setError("OTP is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/auth/verify-otp",
        { otp },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            email,
          },
        }
      );
      setLoading(false);
      setStep(3);
      setSuccess(res?.data?.message || "OTP verified successfully.");
    } catch (error) {
      setLoading(false);
      setError(getErrorMessage(error, "OTP verification failed."));
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!password || !passwordConfirmation) {
      setError("Password and confirm password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/auth/reset-password",
        { password, password_confirmation: passwordConfirmation },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            email,
          },
        }
      );
      setLoading(false);
      setResendSecondsLeft(0);
      nav(PATHS.login, {
        state: {
          message: res?.data?.message || "Password reset successfully. Please sign in.",
        },
      });
    } catch (error) {
      setLoading(false);
      setError(getErrorMessage(error, "Failed to reset password."));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6 col-xl-5">
        <div className="card mt-4">
          <div className="card-body p-4">
            <div className="text-center mt-2">
              <h5 className="text-primary">Reset Password</h5>
              <p className="text-muted mb-0">
                {step === 1 && "Step 1: Send OTP to your email"}
                {step === 2 && "Step 2: Verify OTP"}
                {step === 3 && "Step 3: Set new password"}
              </p>
            </div>

            <div className="p-2 mt-4">
              {error ? <Alert variant="warning">{error}</Alert> : null}
              {success ? <Alert variant="success">{success}</Alert> : null}

              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <div className="mb-3">
                    <label htmlFor="forgot-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="forgot-email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-success w-100" type="submit" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              ) : null}

              {step === 2 ? (
                <form onSubmit={verifyOtp}>
                  <div className="mb-2 text-muted">
                    OTP sent to: <b>{email}</b>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      OTP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-success w-100" type="submit" disabled={loading}>
                      {loading ? "Verifying OTP..." : "Verify OTP"}
                    </button>
                  </div>

                  <div className="mt-3">
                    {resendSecondsLeft > 0 ? (
                      <p className="text-muted mb-0">
                        You can resend OTP in <b>{formatCountdown(resendSecondsLeft)}</b>
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={resendOtp}
                        disabled={resendLoading}
                      >
                        {resendLoading ? "Resending OTP..." : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setResendSecondsLeft(0);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Change email
                    </button>
                  </div>
                </form>
              ) : null}

              {step === 3 ? (
                <form onSubmit={resetPassword}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="reset-password-input">
                      New Password
                    </label>
                    <div className="position-relative auth-pass-inputgroup">
                      <input
                        type={showPass ? "text" : "password"}
                        className="form-control pe-5 password-input"
                        placeholder="Enter new password"
                        id="reset-password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                    <label className="form-label" htmlFor="reset-password-confirmation-input">
                      Confirm New Password
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm new password"
                      id="reset-password-confirmation-input"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-success w-100" type="submit" disabled={loading}>
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="mb-0">
            Remember your password?{" "}
            <Link to={PATHS.login} className="fw-semibold text-primary text-decoration-underline">
              Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
