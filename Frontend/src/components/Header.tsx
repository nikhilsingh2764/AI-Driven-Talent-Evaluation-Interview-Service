import { BookOpen, FileText, History, LayoutDashboard, LineChart, LogOut, MessagesSquare, Moon, Settings, Sun } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";
import Logo from "./Logo";
import { buttonClass } from "./ui/Button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/interviews", label: "Interviews", icon: MessagesSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/performance", label: "Performance", icon: LineChart },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-sunken hover:text-ink",
  );

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const onLogout = async () => {
    navigate("/");
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Logo to={user ? "/dashboard" : "/"} />
          {user && (
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <Icon className="size-4" aria-hidden /> {label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <a href="https://ai-interview-application-26f9.onrender.com/api/docs" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-sunken hover:text-ink md:inline-flex">
            <BookOpen className="size-4" aria-hidden /> API docs
          </a>
          <button onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink">
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
          {user ? (
            <>
              <NavLink to="/settings" aria-label="Settings" className={({ isActive }) => cn("grid size-9 place-items-center rounded-lg", isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-sunken hover:text-ink")}>
                <Settings className="size-[18px]" />
              </NavLink>
              <button onClick={onLogout} className={buttonClass("secondary", "sm")}>
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonClass("ghost", "sm")}>Sign in</Link>
              <Link to="/register" className={buttonClass("primary", "sm")}>Get started</Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 lg:hidden" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon className="size-4" aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
