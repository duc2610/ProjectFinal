import React from "react";
import {
  AppstoreOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  Typography,
  Button,
  Space,
} from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { ROLES } from "@shared/utils/acl";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

export default function AdminShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fullName =
    user?.fullName || user?.FullName || user?.email || "Administrator";

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = roles.includes(ROLES.Admin);
  const isCreator = roles.includes(ROLES.TestCreator);

  const profileMenu = {
    items: [
      { key: "info", label: <span>{fullName}</span>, icon: <UserOutlined /> },
      { type: "divider" },
      {
        key: "logout",
        label: <span onClick={signOut}>Đăng xuất</span>,
        icon: <LogoutOutlined />,
      },
    ],
  };

  const baseItems = [
    { key: "/admin/dashboard", icon: <AppstoreOutlined />, label: "Dashboard" },
  ];
  let roleItems = [];
  if (isAdmin) {
    roleItems = [
      {
        key: "/admin/account-management",
        icon: <TeamOutlined />,
        label: "Users Management",
      },
    ];
  } else if (isCreator) {
    roleItems = [
      {
        key: "/test-creator/question-bank",
        icon: <DatabaseOutlined />,
        label: "QuestionBank",
      },
      {
        key: "/test-creator/exam-management",
        icon: <FileTextOutlined />,
        label: "Test Bank",
      },
    ];
  }
  const siderItems = [...baseItems, ...roleItems];

  const onMenuClick = ({ key }) => {
    if (key && key !== location.pathname) navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Sider
        width={220}
        style={{
          background: "#ffe9ec",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 16,
            color: "#213f9a",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Toeic Genius
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={onMenuClick}
          items={siderItems}
          style={{ flex: 1, background: "#ffe9ec" }}
        />
        <div style={{ padding: 16 }}>
          <Button block onClick={signOut}>
            Logout
          </Button>
        </div>
      </Sider>

      <Layout style={{ background: "#ffffff" }}>
        <Header
          style={{
            background: "#ffffff",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 14 }}>You're Logged as {fullName}.</Text>
          <Dropdown
            menu={profileMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={32} style={{ background: "#213f9a" }}>
                {fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
