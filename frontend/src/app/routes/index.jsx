import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute, RoleGuard } from "@app/guards/Guards";
import { ROLES } from "@shared/utils/acl";

const Home = lazy(() => import("@pages/Home.jsx"));
const About = lazy(() => import("@pages/About.jsx"));
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
const ForgotPassword = lazy(() => import("@pages/ForgotPassword.jsx"));
const VerifyRegister = lazy(() => import("@pages/VerifyRegister.jsx"));
// const Profile = lazy(() => import("@pages/Profile.jsx"));
const AdminDashboard = lazy(() => import("@pages/admin/Dashboard.jsx"));
const ResetPassword = lazy(() => import("@pages/ResetPassword.jsx"));
const VerifyReset = lazy(() => import("@pages/VerifyReset.jsx"));
const AuthCallback = lazy(() => import("@pages/AuthCallback.jsx"));
export default function RoutesRoot() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Đang tải...</div>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-register" element={<VerifyRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-reset" element={<VerifyReset />} />
        <Route path="/auth/callback" element={<AuthCallback />} />


        {/* Private (cần đăng nhập) */}
        {/* <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        /> */}

        {/* Role-based (chỉ admin) */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard roles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleGuard>
          }
        />

        <Route
          path="*"
          element={
            <div style={{ padding: 16 }}>404 - Không tìm thấy trang</div>
          }
        />
      </Routes>
    </Suspense>
  );
}
