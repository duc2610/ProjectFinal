import React, { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";

const Home = lazy(() => import("@pages/Home.jsx"));
const About = lazy(() => import("@pages/About.jsx"));
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
export default function RoutesRoot() {
  return (
    <>
      {/* <nav
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          borderBottom: "1px solid #eee",
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
      </nav> */}
      <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
