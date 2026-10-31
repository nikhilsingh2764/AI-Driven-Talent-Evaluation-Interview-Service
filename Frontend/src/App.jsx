import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import { Spinner } from "./components/ui.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx"; // Fixed casing here
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Resume from "./pages/Resume.jsx";
import Interviews from "./pages/Interviews.jsx";
import InterviewRun from "./pages/InterviewRun.jsx";
import Report from "./pages/Report.jsx";
import History from "./pages/History.jsx";
import Performance from "./pages/Performance.jsx";
import Profile from "./pages/Profile.jsx";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Loading..." />;
  return user ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Loading..." />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyOTP />} /> {/* Fixed usage here */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/interview/:sessionId" element={<InterviewRun />} />
        <Route path="/report/:sessionId" element={<Report />} />
        <Route path="/history" element={<History />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<div className="center-page"><h1>404</h1><p>Page not found.</p><a href="/">Go home</a></div>} />
    </Routes>
  );
}