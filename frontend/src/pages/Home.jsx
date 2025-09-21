import { Link } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Button } from "antd";
import logo from "@assets/images/logo.png";
import { getCurrentUser, logout } from "@services/authService";
import { useAuth } from "@shared/hooks/useAuth";
export default function Home() {
  const { user, isAuthenticated, signOut } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const items = isAuthenticated
    ? [
        { key: "info", label: <span>{fullName || user?.email}</span> },
        { type: "divider" },
        { key: "logout", label: <a onClick={signOut}>Đăng xuất</a> },
      ]
    : [
        { key: "login", label: <a href="/login">Đăng nhập</a> },
        { key: "register", label: <a href="/register">Đăng ký</a> },
      ];

  return (
    <div
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      <div>
        <a href="/">
          <img src={logo} alt="Logo" style={{ height: 64, margin: 16 }} />
        </a>
      </div>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button type="text">
          <Space>
            {isAuthenticated ? fullName || "Người dùng" : "Tài khoản"}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </div>
  );
}
