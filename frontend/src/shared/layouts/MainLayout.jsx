import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import styles from "@shared/styles/MainLayout.module.css";

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
