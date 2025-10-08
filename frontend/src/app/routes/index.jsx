import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute, PublicOnlyRoute } from "@app/guards/Guards";
import MainLayout from "@shared/layouts/MainLayout";

const Home = lazy(() => import("@pages/Home.jsx"));
const About = lazy(() => import("@pages/About.jsx"));
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
const ForgotPassword = lazy(() => import("@pages/ForgotPassword.jsx"));
const VerifyRegister = lazy(() => import("@pages/VerifyRegister.jsx"));
const Profile = lazy(() => import("@pages/Profile.jsx"));
const AdminDashboard = lazy(() => import("@pages/admin/Dashboard.jsx"));
const ResetPassword = lazy(() => import("@pages/ResetPassword.jsx"));
const VerifyReset = lazy(() => import("@pages/VerifyReset.jsx"));

export default function RoutesRoot() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Đang tải...</div>}>
      <Routes>
        //khong dung chung layout header voi footer
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-register" element={<VerifyRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-reset" element={<VerifyReset />} />
        </Route>
        // dung chung layout header voi footer
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          //chi user binh thuong moi vao duoc
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
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
