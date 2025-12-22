import { useState } from "react";
import { Layout, Avatar, Space, Typography, Drawer } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import styles from "@shared/styles/Header.module.css";
import { Dropdown } from "antd";
import { useAuth } from "@shared/hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const nav = [
  { to: "/practice-lr", label: "Luyện tập Listening & Reading" },
  { to: "/practice-sw", label: "Luyện tập Speaking & Writing" },
  { to: "/test-list", label: "Bài thi mô phỏng" },
  { to: "/flashcard", label: "Flashcard" },
];

export default function Header() {
  const { user, isAuthenticated, signOut, refreshProfile } = useAuth();
  const fullName =
    user?.fullName || user?.FullName || user?.email || "User";
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const menuItems = !isAuthenticated
    ? [
        {
          key: "login",
          label: (
            <Space className={styles.ddItem}>
              <UserOutlined />
              <span>Đăng nhập</span>
            </Space>
          ),
        },
        { type: "divider" },
        {
          key: "signup",
          label: (
            <Space className={styles.ddItem}>
              <UserOutlined />
              <span>Đăng ký</span>
            </Space>
          ),
        },
      ]
    : [
        {
          key: "info",
          label: (
            <div className={styles.userInfo}>
              <Text strong style={{ fontSize: 14 }}>
                {fullName}
              </Text>
            </div>
          ),
        },
        { type: "divider" },
        {
          key: "profile",
          label: (
            <Space className={styles.ddItem} onClick={handleProfileClick}>
              <UserOutlined />
              <span>Hồ sơ</span>
            </Space>
          ),
        },
        { type: "divider" },
        {
          key: "logout",
          label: (
            <Space className={styles.ddItem} onClick={handleLogout}>
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </Space>
          ),
        },
      ];

  const onMenuClick = ({ key }) => {
    if (key === "login") return navigate("/login");
    if (key === "signup") return navigate("/register");
    if (key === "logout") return handleLogout();
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoWrap}>
          <img src={logo} alt="Toeic Genius Logo" className={styles.logo} />
          <span className={styles.logoText}>Toeic Genius</span>
        </Link>

        <div className={styles.right}>
          {/* Nút menu mobile */}
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu điều hướng"
          >
            <MenuOutlined />
          </button>

          <nav className={styles.navRight}>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated && (
              <Text className={styles.fullname} ellipsis>
                {fullName}
              </Text>
            )}

            <Dropdown
              menu={{
                items: menuItems,
                onClick: onMenuClick,
              }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName={styles.dropdownMenu}
            >
              <Space className={styles.avatarWrapper}>
                <Avatar
                  size={40}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "2px solid #e2e8f0",
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                  }}
                >
                  {isAuthenticated
                    ? fullName?.charAt(0).toUpperCase()
                    : <UserOutlined />}
                </Avatar>
                <DownOutlined className={styles.dropdownIcon} />
              </Space>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Menu mobile dạng Drawer */}
      <Drawer
        placement="left"
        closable
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className={styles.mobileMenuDrawer}
        width={260}
        title="Menu"
      >
        <nav className={styles.mobileNav}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? `${styles.mobileNavItem} ${styles.mobileNavItemActive}`
                  : styles.mobileNavItem
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.mobileAuthSection}>
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                className={styles.mobileAuthButtonPrimary}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={styles.mobileAuthButtonSecondary}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/register");
                }}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              <div className={styles.mobileUserInfo}>
                <Avatar
                  size={40}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "2px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  {fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Text className={styles.mobileUserName}>{fullName}</Text>
              </div>
              <button
                type="button"
                className={styles.mobileAuthButtonPrimary}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleProfileClick();
                }}
              >
                Hồ sơ
              </button>
              <button
                type="button"
                className={styles.mobileAuthButtonSecondary}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </Drawer>
    </AntHeader>
  );
}
