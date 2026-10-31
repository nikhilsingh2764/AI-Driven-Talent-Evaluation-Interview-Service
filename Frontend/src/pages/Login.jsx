import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Alert } from "../components/ui.jsx";

export default function Login() {
  const { login, flash, setFlash } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const notice = location.state?.notice || flash;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFlash(""); // the one-time notice has been seen
    setBusy(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="center-page">
      <h1>AI Interview Service</h1>
      <form className="auth-card" onSubmit={submit}>
        <h2>Log in</h2>
        <Alert kind="success">{notice}</Alert>
        <Alert>{error}</Alert>
        <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        <div className="row small" style={{ justifyContent: "space-between" }}>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/signup">Create account</Link>
        </div>
      </form>
    </div>
  );
}
