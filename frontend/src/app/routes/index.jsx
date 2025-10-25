import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute, PublicOnlyRoute, RoleRoute } from "@app/guards/Guards";
import { ROLES } from "@shared/utils/acl";
import AdminShell from "@shared/layouts/AdminShell.jsx";
import MainLayout from "@shared/layouts/MainLayout";

const Home = lazy(() => import("@pages/public/Home.jsx"));
const About = lazy(() => import("@pages/public/About.jsx"));
const Login = lazy(() => import("@pages/auth/Login.jsx"));
const Register = lazy(() => import("@pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("@pages/auth/ForgotPassword.jsx"));
const VerifyRegister = lazy(() => import("@pages/auth/VerifyRegister.jsx"));
const Profile = lazy(() => import("@pages/account/Profile.jsx"));
const AdminDashboard = lazy(() => import("@pages/admin/Dashboard.jsx"));
const ResetPassword = lazy(() => import("@pages/auth/ResetPassword.jsx"));
const VerifyReset = lazy(() => import("@pages/auth/VerifyReset.jsx"));
const AccountManagement = lazy(() =>
  import("@pages/admin/AccountManagement.jsx")
);
const TestBanksManagement = lazy(() =>
  import("@pages/testCreator/TestBanksManagement.jsx")
);
const QuestionBankManagement = lazy(() =>
  import("@pages/testCreator/QuestionBankManagement.jsx")
);
import NotFound from "@pages/public/NotFound.jsx";
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
        <Route element={<RoleRoute allow={[ROLES.Admin, ROLES.TestCreator]} />}>
          <Route element={<AdminShell />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route element={<RoleRoute allow={[ROLES.Admin]} />}>
              <Route
                path="/admin/account-management"
                element={<AccountManagement />}
              />
            </Route>
            <Route element={<RoleRoute allow={[ROLES.TestCreator]} />}>
              <Route
                path="/test-creator/evaluation-banks-management"
                element={<TestBanksManagement />}
              />
              <Route
                path="/test-creator/question-bank"
                element={<QuestionBankManagement />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
