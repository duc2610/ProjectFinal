import React, { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";

const Home = lazy(() => import("@pages/Home.jsx"));
const About = lazy(() => import("@pages/About.jsx"));
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
const PorgotPasswrod = lazy(() => import("@pages/ForgotPassword.jsx"));
export default function RoutesRoot() {
  return (
    <>
      <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<PorgotPasswrod />} />
          <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
