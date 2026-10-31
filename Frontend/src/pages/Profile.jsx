import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Alert, Card, fmtDate } from "../components/ui.jsx";

export default function Profile() {
  const { user, setUser, setFlash } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [delPassword, setDelPassword] = useState("");
  const [msg, setMsg] = useState({ area: "", kind: "error", text: "" });
  const [busy, setBusy] = useState("");

  const run = (area, fn) => async (e) => {
    e?.preventDefault();
    setBusy(area);
    setMsg({ area, kind: "error", text: "" });
    try {
      const text = await fn();
      if (text) setMsg({ area, kind: "success", text });
    } catch (err) {
      setMsg({ area, kind: "error", text: err.message });
    } finally {
      setBusy("");
    }
  };
  const note = (area) => (msg.area === area ? <Alert kind={msg.kind}>{msg.text}</Alert> : null);

  // After these, the server has already revoked every session. Clearing the user makes the route guard send us to /login.
  const leave = (notice) => { setFlash(notice); setUser(null); };

  return (
    <>
      <div className="page-head"><div><h1>Profile</h1><p className="muted">{user.email} · member since {fmtDate(user.createdAt)}</p></div></div>

      <Card title="Username">
        <form className="stack" onSubmit={run("name", async () => { setUser(await api.updateProfile({ username })); return "Username updated."; })}>
          {note("name")}
          <label>Username<input required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" value={username} onChange={(e) => setUsername(e.target.value)} /></label>
          <div><button className="btn" disabled={busy === "name" || username === user.username}>Save</button></div>
        </form>
      </Card>

      <Card title="Change password">
        <form className="stack" onSubmit={run("pw", async () => { await api.changePassword(pw); leave("Password changed. Please log in again."); })}>
          {note("pw")}
          <div className="grid grid-2">
            <label>Current password<input type="password" required autoComplete="current-password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} /></label>
            <label>New password<input type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
          </div>
          <span className="hint">8+ characters with upper and lower case, a number and one of @$!%*?&. You will be logged out on all devices.</span>
          <div><button className="btn" disabled={busy === "pw"}>Change password</button></div>
        </form>
      </Card>

      <Card title="Danger zone" className="danger-zone">
        <div className="stack">
          {note("danger")}
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>Deactivate your account (you can no longer log in).</span>
            <button className="btn btn-ghost" disabled={busy === "danger"} onClick={() => window.confirm("Deactivate your account?") && run("danger", async () => { await api.deactivate(); leave("Account deactivated."); })()}>Deactivate</button>
          </div>
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (window.confirm("Permanently delete your account, resume and all interviews? This cannot be undone.")) run("danger", async () => { await api.deleteAccount(delPassword); leave("Account deleted."); })(); }}>
            <input type="password" required placeholder="Password to confirm" autoComplete="current-password" style={{ maxWidth: 260 }} value={delPassword} onChange={(e) => setDelPassword(e.target.value)} aria-label="Password to confirm deletion" />
            <button className="btn btn-danger" disabled={busy === "danger"}>Delete account and all data</button>
          </form>
        </div>
      </Card>
    </>
  );
}
