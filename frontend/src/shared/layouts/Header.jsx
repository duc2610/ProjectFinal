import { Layout, Avatar, Badge, Space, Typography } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import styles from "@shared/styles/Header.module.css";
import { Dropdown } from "antd";
import { useAuth } from "@shared/hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const nav = [
  { to: "/practice-lr", label: "Practice L&R" },
  { to: "/practice-sw", label: "Practice S&W" },
  { to: "/test", label: "Test" },
  { to: "/flashcard", label: "Flashcard" },
];

export default function Header() {
  const { user, isAuthenticated, signOut, refreshProfile } = useAuth();
  const fullName =
    user?.fullName || user?.FullName || user?.email || "User";
  const navigate = useNavigate();

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
            <Badge dot offset={[-2, 4]} className={styles.badge}>
              <BellOutlined className={styles.bell} />
            </Badge>

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
    </AntHeader>
  );
}
