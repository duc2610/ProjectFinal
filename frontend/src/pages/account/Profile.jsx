import React, { useState, useMemo, useEffect } from "react";
import { Tabs, Dropdown, Button, Grid } from "antd";
import { useSearchParams } from "react-router-dom";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { PersonalTab } from "./Profile/PersonalTab";
import { TestHistoryTab } from "./Profile/TestHistoryTab";
import { ReportTab } from "./Profile/ReportTab";
import { MoreOutlined } from "@ant-design/icons";

export default function Profile() {
  const { user } = useAuth();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [searchParams, setSearchParams] = useSearchParams();

  const tabItems = useMemo(
    () => [
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
    ],
    [user]
  );

  // Đọc tab từ query param và map sang key tương ứng
  const tabFromQuery = searchParams.get("tab");
  const getInitialTab = () => {
    if (tabFromQuery === "test-history" || tabFromQuery === "history") {
      return "history";
    }
    if (tabFromQuery === "report") {
      return "report";
    }
    return "personal";
  };

  const [activeKey, setActiveKey] = useState(() => getInitialTab());

  // Cập nhật activeKey khi query param thay đổi
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeKey) {
      setActiveKey(newTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromQuery]);

  const activeLabel =
    tabItems.find((item) => item.key === activeKey)?.label || "";

  const mobileMenuItems = tabItems
    .filter((item) => item.key !== activeKey)
    .map((item) => ({
      key: item.key,
      label: item.label,
    }));

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        {isMobile && (
          <div className={styles.mobileTabsHeader}>
            <span className={styles.mobileTabsTitle}>{activeLabel}</span>
            <Dropdown
              menu={{
                items: mobileMenuItems,
                onClick: ({ key }) => setActiveKey(key),
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className={styles.mobileTabsMore}
              />
            </Dropdown>
          </div>
        )}
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          className={styles.tabs}
          items={tabItems}
          tabBarStyle={isMobile ? { display: "none" } : undefined}
        />
      </div>
    </div>
  );
}
