import { Layout, Avatar, Badge } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import styles from "@shared/styles/Header.module.css";
import { Dropdown } from "antd";
import { useAuth } from "@shared/hooks/useAuth";
const { Header: AntHeader } = Layout;

const nav = [
  { to: "/practice-lr", label: "Practice L&R" },
  { to: "/practice-sw", label: "Practice S&W" },
  { to: "/test", label: "Test" },
  { to: "/flashcard", label: "Flashcard" },
];

export default function Header() {
  const { user, isAuthenticated, signOut, refreshProfile } = useAuth();

  const navigate = useNavigate();
  const menuItems = !isAuthenticated
    ? [
        {
          key: "login",
          label: <span className={styles.ddItem}>Đăng nhập</span>,
        },
        { type: "divider" },
        {
          key: "signup",
          label: <span className={styles.ddItem}>Đăng ký</span>,
        },
      ]
    : [
        {
          key: "Name",
          label: (
            <span className={styles.ddItem}>Xin chào, {user?.fullName}</span>
          ),
        },
        {
          key: "profile",
          label: (
            <span
              className={styles.ddItem}
              onClick={() => navigate("/profile")}
            >
              Profile
            </span>
          ),
        },
        { type: "divider" },
        {
          key: "logout",
          label: (
            <span className={styles.ddItem} onClick={signOut}>
              Đăng xuất
            </span>
          ),
        },
      ];

  const onMenuClick = async ({ key }) => {
    if (key === "login") return navigate("/login");
    if (key === "signup") return navigate("/register");
    if (key === "logout") return signOut();

    if (key === "profile") {
      try {
        await refreshProfile();
        navigate("/profile");
      } catch (e) {
        message.error("Không tải được hồ sơ. Vui lòng thử lại.");
      } finally {
        hide();
      }
    }
  };
  return (
    <AntHeader className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoWrap}>
          <img src={logo} alt="Logo" className={styles.logo} />
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

          <Badge dot offset={[0, 2]}>
            <BellOutlined className={styles.bell} />
          </Badge>
          {isAuthenticated && (
            <span className={styles.fullname}>{user?.fullName}</span>
          )}
          <Dropdown
            menu={{ items: menuItems, onClick: onMenuClick }}
            trigger={["hover", "click"]}
            placement="bottomRight"
          >
            <Avatar
              size={32}
              icon={<UserOutlined />}
              className={styles.avatar}
            />
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
}
