import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute, PublicOnlyRoute, RoleRoute } from "@app/guards/Guards";
import { ROLES } from "@shared/utils/acl";
import AdminShell from "@shared/layouts/AdminShell.jsx";
import MainLayout from "@shared/layouts/MainLayout";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Home = lazy(() => import("@pages/public/Home.jsx"));
const About = lazy(() => import("@pages/public/About.jsx"));
const PracticeLR = lazy(() => import("@pages/public/PracticeLR.jsx"));
const PracticeSW = lazy(() => import("@pages/public/PracticeSW.jsx"));
const TestList = lazy(() => import("@pages/public/TestList.jsx"));
const Flashcard = lazy(() => import("@pages/public/Flashcard.jsx"));
const FlashcardDetail = lazy(() => import("@pages/public/FlashcardDetail.jsx"));
const FlashcardLearn = lazy(() => import("@pages/public/FlashcardLearn.jsx"));
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

const QuestionBankManagement = lazy(() =>
  import("@pages/testCreator/QuestionBankManagement.jsx")
);
const TOEICExam = lazy(() =>
  import("../../../src/shared/components/TOEICExam/ExamSelection.jsx")
);
const TestResults = lazy(() =>
  import("../../../src/shared/components/TOEICExam/TestResult.jsx")
);
const ExamScreen = lazy(() =>
  import("../../../src/shared/components/TOEICExam/ExamScreen.jsx")
);
const ExamManagement = lazy(() =>
  import("@pages/testCreator/ExamManagement.jsx")
);
import NotFound from "@pages/public/NotFound.jsx";

export default function RoutesRoot() {
  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Spin indicator={antIcon} tip="Đang tải..." size="large" />
        </div>
      }
    >
      <Routes>
        {/* không dùng chung layout header với footer */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-register" element={<VerifyRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-reset" element={<VerifyReset />} />
        </Route>

        {/* dùng chung layout header với footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/practice-lr" element={<PracticeLR />} />
          <Route path="/practice-sw" element={<PracticeSW />} />
          <Route path="/test-list" element={<TestList />} />
          <Route path="/flashcard" element={<Flashcard />} />
          <Route path="/flashcard/:setId" element={<FlashcardDetail />} />
          <Route path="/flashcard/:setId/learn" element={<FlashcardLearn />} />
          {/* chỉ user bình thường mới vào được */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          {/* Chỉ Examinee mới vào được */}
          <Route element={<RoleRoute allow={[ROLES.Examinee]} />}>
            <Route path="/toeic-exam" element={<TOEICExam />} />
            <Route path="/result" element={<TestResults />} />
          </Route>
        </Route>

        {/* Role-based routes */}
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
                path="/test-creator/question-bank"
                element={<QuestionBankManagement />}
              />
            </Route>
            <Route element={<RoleRoute allow={[ROLES.TestCreator]} />}>
              <Route
                path="/test-creator/exam-management"
                element={<ExamManagement />}
              />
            </Route>
          </Route>
        </Route>

        {/* ExamScreen không dùng MainLayout, có layout riêng, nhưng cần guard Examinee */}
        <Route element={<RoleRoute allow={[ROLES.Examinee]} />}>
          <Route path="/exam" element={<ExamScreen />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
