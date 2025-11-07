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

  const handleLogout = () => {
    signOut();
  };

  const profileMenu = {
    items: [
      {
        key: "info",
        label: (
          <Space style={{ padding: "4px 0" }}>
            <UserOutlined />
            <Text strong>{fullName}</Text>
          </Space>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        label: (
          <Space style={{ padding: "4px 0" }} onClick={handleLogout}>
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </Space>
        ),
      },
    ],
    style: {
      minWidth: 200,
      borderRadius: 8,
      padding: "8px 0",
    },
  };

  const baseItems = [
    {
      key: "/admin/dashboard",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
    },
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
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Sider
        width={260}
        style={{
          background: "linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 12px rgba(0, 0, 0, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative element */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo/Brand Section */}
        <div
          style={{
            padding: "24px 20px",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.5px",
            position: "relative",
            zIndex: 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
                backdropFilter: "blur(10px)",
              }}
            >
              TG
            </div>
            <span style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
              Toeic Genius
            </span>
          </div>
        </div>

        {/* Menu Section */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={onMenuClick}
          items={siderItems}
          style={{
            flex: 1,
            background: "transparent",
            borderRight: "none",
            padding: "8px 12px",
            position: "relative",
            zIndex: 1,
          }}
          className="custom-admin-menu"
        />

        {/* User Info & Logout Section */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            zIndex: 1,
            background: "rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              marginBottom: 12,
              backdropFilter: "blur(10px)",
            }}
          >
            <Space>
              <Avatar
                size={36}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: 600,
                }}
              >
                {fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fullName}
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: 11,
                    display: "block",
                  }}
                >
                  {isAdmin ? "Administrator" : isCreator ? "Test Creator" : "User"}
                </Text>
              </div>
            </Space>
          </div>
          <Button
            block
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontWeight: 500,
              height: 40,
              borderRadius: 8,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.25)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout style={{ background: "#f5f7fa" }}>
        <Header
          style={{
            background: "#ffffff",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            borderBottom: "1px solid #e8eaed",
            height: 72,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div>
            <Text
              style={{
                fontSize: 15,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Xin chào,{" "}
              <Text
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              >
                {fullName}
              </Text>
            </Text>
          </div>
          <Dropdown
            menu={profileMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Space
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Avatar
                size={40}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "2px solid #e2e8f0",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                }}
              >
                {fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <DownOutlined
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  transition: "transform 0.2s ease",
                }}
              />
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: "32px",
            minHeight: "calc(100vh - 72px)",
            background: "#f5f7fa",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              minHeight: "calc(100vh - 160px)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        .custom-admin-menu .ant-menu-item {
          border-radius: 8px !important;
          margin: 4px 0 !important;
          height: 48px !important;
          line-height: 48px !important;
          transition: all 0.3s ease !important;
        }
        .custom-admin-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: translateX(4px);
        }
        .custom-admin-menu .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          font-weight: 600 !important;
        }
        .custom-admin-menu .ant-menu-item-selected::after {
          display: none !important;
        }
        .custom-admin-menu .ant-menu-item-icon {
          font-size: 18px !important;
        }
        .custom-admin-menu .ant-menu-title-content {
          font-size: 14px !important;
          font-weight: 500 !important;
        }
      `}</style>
    </Layout>
  );
}
