// One small API client for the whole app. Cookies carry the login; an expired access token is refreshed automatically.
const BASE = `${import.meta.env.VITE_API_URL || ""}/api/v1`;

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let onAuthLost = () => {};
export const setAuthLostHandler = (fn) => (onAuthLost = fn);

// Several requests can fail with 401 at the same moment. They must share ONE refresh call,
// because a refresh token can only be used once.
let refreshing = null;
const refreshSession = () => {
  refreshing ??= fetch(`${BASE}/refresh-token`, { method: "POST", credentials: "include" })
    .then((r) => {
      if (!r.ok) throw new Error("refresh failed");
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const NO_REFRESH = ["/login", "/signup", "/verify-otp", "/refresh-token", "/logout", "/forgot-password", "/reset-password"];

async function request(path, { method = "GET", body, form, blob = false } = {}, canRetry = true) {
  const init = { method, credentials: "include", headers: {} };
  if (form) init.body = form;
  else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the backend running?");
  }

  if (res.status === 401 && canRetry && !NO_REFRESH.includes(path)) {
    try {
      await refreshSession();
      return request(path, { method, body, form, blob }, false);
    } catch {
      onAuthLost();
      throw new ApiError(401, "Your session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* not json */
    }
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`, data.errors || []);
  }

  if (blob) return res.blob();
  const json = await res.json();
  return json.data;
}

export const api = {
  // auth
  signup: (b) => request("/signup", { method: "POST", body: b }),
  verifyOtp: (b) => request("/verify-otp", { method: "POST", body: b }),
  login: (b) => request("/login", { method: "POST", body: b }),
  logout: () => request("/logout", { method: "POST", body: {} }),
  profile: () => request("/profile"),
  updateProfile: (b) => request("/update-profile", { method: "PATCH", body: b }),
  changePassword: (b) => request("/change-password", { method: "PATCH", body: b }),
  deactivate: () => request("/deactivate-account", { method: "PATCH", body: {} }),
  deleteAccount: (password) => request("/delete-account", { method: "DELETE", body: { password } }),
  forgotPassword: (email) => request("/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (b) => request("/reset-password", { method: "POST", body: b }),
  // resume
  getResume: () => request("/resume"),
  uploadResume: (file) => {
    const f = new FormData();
    f.append("resume", file);
    return request("/resume/upload", { method: "POST", form: f });
  },
  replaceResume: (file) => {
    const f = new FormData();
    f.append("resume", file);
    return request("/resume", { method: "PATCH", form: f });
  },
  deleteResume: () => request("/resume", { method: "DELETE" }),
  analyzeResume: () => request("/resume/analysis", { method: "POST", body: {} }),
  getAnalysis: () => request("/resume/analysis"),
  // interviews
  createInterview: (b) => request("/interview/generate", { method: "POST", body: b }),
  listInterviews: () => request("/interviews"),
  startSession: (interviewId) => request("/session/start", { method: "POST", body: { interviewId } }),
  getSession: (id) => request(`/session/${id}`),
  submitAnswer: (sessionId, answerText) => request("/answer", { method: "POST", body: { sessionId, answerText } }),
  getReport: (sessionId) => request(`/session/${sessionId}/report`),
  // performance
  dashboard: () => request("/dashboard"),
  history: (params) => request(`/history?${new URLSearchParams(params)}`),
  getPerformance: () => request("/performance"),
  generatePerformance: () => request("/performance/generate", { method: "POST", body: {} }),
  performancePdf: () => request("/performance/pdf", { blob: true }),
  resumeFile: () => request("/resume/file", { blob: true }),
};
