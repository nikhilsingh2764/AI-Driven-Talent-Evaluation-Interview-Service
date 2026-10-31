import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const links = [
  ["/", "Dashboard"],
  ["/resume", "Resume"],
  ["/interviews", "Interviews"],
  ["/history", "History"],
  ["/performance", "Performance"],
  ["/profile", "Profile"],
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <strong className="brand">AI Interview</strong>
          <nav className="nav-links">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>
            ))}
          </nav>
          <div className="nav-user">
            <span className="muted">{user.username}</span>
            <button className="btn btn-small btn-ghost" onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
