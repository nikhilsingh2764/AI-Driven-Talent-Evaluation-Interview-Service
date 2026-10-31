import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { Alert } from "../components/ui.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.signup(form);
      // devOtp only exists when the backend runs with EXPOSE_OTP_IN_RESPONSE=true (local testing)
      navigate("/verify", { state: { email: data.email, devOtp: data.devOtp } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="center-page">
      <h1>Create account</h1>
      <form className="auth-card" onSubmit={submit}>
        <Alert>{error}</Alert>
        <label>Username<input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" title="Letters, numbers and underscores" value={form.username} onChange={set("username")} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set("email")} /></label>
        <label>Password
          <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} />
          <span className="hint">8+ characters with upper and lower case, a number and one of @$!%*?&</span>
        </label>
        <button className="btn" disabled={busy}>{busy ? "Sending OTP..." : "Sign up"}</button>
        <p className="small muted" style={{ margin: 0 }}>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
