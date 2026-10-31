import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Alert } from "../components/ui.jsx";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(state?.devOtp || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!state?.email) return <Navigate to="/signup" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.verifyOtp({ email: state.email, otp });
      navigate("/login", { state: { email: state.email, notice: "Account created. You can log in now." } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="center-page">
      <h1>Verify your email</h1>
      <form className="auth-card" onSubmit={submit}>
        <p style={{ margin: 0 }}>We sent a 6-digit code to <strong>{state.email}</strong>. It is valid for 10 minutes.</p>
        {state.devOtp && <Alert kind="info">Dev mode: the backend returned your OTP, so it is filled in for you.</Alert>}
        <Alert>{error}</Alert>
        <input className="otp-input" inputMode="numeric" maxLength={6} required placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} aria-label="6-digit OTP" />
        <button className="btn" disabled={busy || otp.length !== 6}>{busy ? "Verifying..." : "Verify"}</button>
        <p className="small muted" style={{ margin: 0 }}>No code? Check the spam folder, or <Link to="/signup">start again</Link>. If the server has no SMTP set up, the code is printed in the backend console.</p>
      </form>
    </div>
  );
}
