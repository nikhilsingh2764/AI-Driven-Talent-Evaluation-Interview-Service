import api, { unwrap } from "../lib/api";
import type { User } from "../lib/types";

type Otp = { email: string; devOtp?: string };

export const authService = {
  signup: (body: { username: string; email: string; password: string }) => unwrap<Otp>(api.post("/signup", body)),
  verifyOtp: (body: { email: string; otp: string }) => unwrap<User>(api.post("/verify-otp", body)),
  resendOtp: (email: string) => unwrap<Otp>(api.post("/resend-otp", { email })),
  login: (body: { email: string; password: string }) => unwrap<User>(api.post("/login", body)),
  logout: () => unwrap<null>(api.post("/logout")),
  profile: () => unwrap<User>(api.get("/profile")),
  forgotPassword: (email: string) => unwrap<{ devOtp?: string }>(api.post("/forgot-password", { email })),
  resetPassword: (body: { email: string; otp: string; newPassword: string }) => unwrap<null>(api.post("/reset-password", body)),
  updateProfile: (username: string) => unwrap<User>(api.patch("/update-profile", { username })),
  changePassword: (body: { oldPassword: string; newPassword: string }) => unwrap<null>(api.patch("/change-password", body)),
  deactivate: () => unwrap<null>(api.patch("/deactivate-account")),
  deleteAccount: (password: string) => unwrap<null>(api.delete("/delete-account", { data: { password } })),
};
