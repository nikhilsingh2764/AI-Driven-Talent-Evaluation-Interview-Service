import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import HistoryPage from "./pages/History";
import Interviews from "./pages/Interviews";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Performance from "./pages/Performance";
import Practice from "./pages/Practice";
import Register from "./pages/Register";
import Report from "./pages/Report";
import ResetPassword from "./pages/ResetPassword";
import ResumePage from "./pages/Resume";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="practice/:interviewId" element={<Practice />} />
          <Route path="reports/:sessionId" element={<Report />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="performance" element={<Performance />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
