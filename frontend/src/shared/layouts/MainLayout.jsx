import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import styles from "@shared/styles/MainLayout.module.css";
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className={styles.headerUnderbar} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
