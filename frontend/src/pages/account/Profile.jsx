import React from "react";
import { Tabs } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { PersonalTab } from "./Profile/PersonalTab";
import { TestHistoryTab } from "./Profile/TestHistoryTab";
import { ReportTab } from "./Profile/ReportTab";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Tabs
          defaultActiveKey="personal"
          className={styles.tabs}
          items={[
            {
              key: "personal",
              label: "Thông tin cá nhân",
              children: <PersonalTab user={user} />,
            },
            {
              key: "history",
              label: "Lịch sử thi",
              children: <TestHistoryTab />,
            },
            {
              key: "report",
              label: "Lịch sử báo cáo",
              children: <ReportTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}
