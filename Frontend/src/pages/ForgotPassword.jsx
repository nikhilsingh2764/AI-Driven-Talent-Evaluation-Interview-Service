import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Alert } from "../components/ui.jsx";

// Step 1: ask for an OTP. Step 2: enter OTP + new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = (fn) => async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = run(async () => {
    const data = await api.forgotPassword(email);
    if (data?.devOtp) { setDevOtp(data.devOtp); setOtp(data.devOtp); }
    setStep(2);
  });

  const reset = run(async () => {
    await api.resetPassword({ email, otp, newPassword });
    navigate("/login", { state: { email, notice: "Password reset. Log in with your new password." } });
  });

  return (
    <div className="center-page">
      <h1>Reset password</h1>
      {step === 1 ? (
        <form className="auth-card" onSubmit={requestOtp}>
          <Alert>{error}</Alert>
          <label>Your account email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <button className="btn" disabled={busy}>{busy ? "Sending..." : "Send reset code"}</button>
          <Link className="small" to="/login">Back to login</Link>
        </form>
      ) : (
        <form className="auth-card" onSubmit={reset}>
          <Alert kind="info">If <strong>{email}</strong> is registered, a code was sent. It is valid for 10 minutes.</Alert>
          {devOtp && <Alert kind="info">Dev mode: OTP filled in for you.</Alert>}
          <Alert>{error}</Alert>
          <label>6-digit code<input className="otp-input" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} /></label>
          <label>New password
            <input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <span className="hint">8+ characters with upper and lower case, a number and one of @$!%*?&</span>
          </label>
          <button className="btn" disabled={busy || otp.length !== 6}>{busy ? "Saving..." : "Reset password"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Use a different email</button>
        </form>
      )}
    </div>
  );
}
