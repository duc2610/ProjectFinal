import React from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Dropdown, Layout, Menu, theme, Button, Space } from "antd";
import { useAuth } from "@shared/hooks/useAuth";

const { Header, Content, Sider } = Layout;

const sideItems = [
  {
    key: "sub1",
    icon: <UserOutlined />,
    label: "User",
    children: [{ key: "1-1", label: "Danh sách" }],
  },
  {
    key: "sub2",
    icon: <LaptopOutlined />,
    label: "Sản phẩm",
    children: [
      { key: "2-1", label: "Kho" },
      { key: "2-2", label: "Biến thể" },
    ],
  },
  {
    key: "sub3",
    icon: <NotificationOutlined />,
    label: "Thông báo",
    children: [
      { key: "3-1", label: "Gửi thông báo" },
      { key: "3-2", label: "Lịch sử" },
    ],
  },
];

export default function Dashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { user, signOut, isAuthenticated } = useAuth();

  const fullName = user ? `${user.lastName} ${user.firstName}`.trim() : "";

  const items = [
    {
      key: "info",
      label: <span>{fullName || user?.email}</span>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: <span onClick={signOut}>Đăng xuất</span>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, minWidth: 0 }} />
        <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
          <Button type="text">
            <Space style={{ color: "#fff" }}>
              {isAuthenticated ? fullName || "Người dùng" : "Tài khoản"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Header>

      <Layout>
        <Sider width={220} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1-1"]}
            defaultOpenKeys={["sub1"]}
            items={sideItems}
            style={{ height: "100%", borderInlineEnd: 0 }}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            items={[
              { title: "Home" },
              { title: "Dashboard" },
              { title: "App" },
            ]}
            style={{ margin: "16px 0" }}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
