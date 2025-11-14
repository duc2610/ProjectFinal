import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Avatar,
  List,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

// Mock data generator for Admin
const generateAdminMockData = () => {
  // Statistics data
  const stats = {
    totalUsers: 1248,
    activeUsers: 892,
    totalTests: 156,
    totalQuestions: 3420,
    totalTestResults: 8456,
    bannedUsers: 12,
    newUsersToday: 23,
    newTestsToday: 3,
  };

  // Recent activities
  const activities = [
    {
      id: 1,
      type: "user",
      action: "Đăng ký mới",
      user: "Nguyễn Văn A",
      time: dayjs().subtract(5, "minute"),
      status: "success",
    },
    {
      id: 2,
      type: "test",
      action: "Hoàn thành bài thi",
      user: "Trần Thị B",
      test: "TOEIC Practice Test #45",
      time: dayjs().subtract(12, "minute"),
      status: "success",
    },
    {
      id: 3,
      type: "user",
      action: "Bị cấm",
      user: "Lê Văn C",
      time: dayjs().subtract(1, "hour"),
      status: "error",
    },
    {
      id: 4,
      type: "test",
      action: "Tạo bài thi mới",
      user: "Test Creator",
      test: "TOEIC Full Test #157",
      time: dayjs().subtract(2, "hour"),
      status: "info",
    },
    {
      id: 5,
      type: "user",
      action: "Đăng nhập",
      user: "Phạm Thị D",
      time: dayjs().subtract(3, "hour"),
      status: "success",
    },
  ];

  // User growth data
  const userGrowth = Array.from({ length: 12 }, (_, i) => ({
    month: dayjs().subtract(11 - i, "month").format("MM/YYYY"),
    users: Math.floor(Math.random() * 100) + 50,
  }));

  // Test completion data
  const testCompletion = Array.from({ length: 7 }, (_, i) => ({
    date: dayjs().subtract(6 - i, "day").format("DD/MM"),
    completed: Math.floor(Math.random() * 50) + 20,
  }));

  return { stats, activities, userGrowth, testCompletion };
};

export default function AdminDashboard() {
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMockData(generateAdminMockData());
      setLoading(false);
    }, 500);
  }, []);

  if (loading || !mockData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Typography.Text>Đang tải dữ liệu...</Typography.Text>
      </div>
    );
  }

  const { stats, activities, userGrowth, testCompletion } = mockData;

  // Statistic cards configuration
  const statCards = [
    {
      title: "Tổng số người dùng",
      value: stats.totalUsers,
      prefix: <UserOutlined />,
      suffix: (
        <span style={{ fontSize: 14, color: "#52c41a" }}>
          <ArrowUpOutlined /> +{stats.newUsersToday}
        </span>
      ),
      valueStyle: { color: "#1890ff" },
    },
    {
      title: "Người dùng hoạt động",
      value: stats.activeUsers,
      prefix: <CheckCircleOutlined />,
      suffix: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`,
      valueStyle: { color: "#52c41a" },
    },
    {
      title: "Tổng số bài thi",
      value: stats.totalTests,
      prefix: <FileTextOutlined />,
      suffix: (
        <span style={{ fontSize: 14, color: "#52c41a" }}>
          <ArrowUpOutlined /> +{stats.newTestsToday}
        </span>
      ),
      valueStyle: { color: "#722ed1" },
    },
    {
      title: "Tổng số câu hỏi",
      value: stats.totalQuestions,
      prefix: <QuestionCircleOutlined />,
      valueStyle: { color: "#fa8c16" },
    },
    {
      title: "Kết quả thi",
      value: stats.totalTestResults,
      prefix: <TrophyOutlined />,
      valueStyle: { color: "#eb2f96" },
    },
    {
      title: "Tài khoản bị cấm",
      value: stats.bannedUsers,
      prefix: <ExclamationCircleOutlined />,
      valueStyle: { color: "#f5222d" },
    },
  ];

  // Activity status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "info":
        return "blue";
      default:
        return "default";
    }
  };

  // Activity icons
  const getActivityIcon = (type) => {
    switch (type) {
      case "user":
        return <UserOutlined style={{ color: "#1890ff" }} />;
      case "test":
        return <FileTextOutlined style={{ color: "#52c41a" }} />;
      case "question":
        return <QuestionCircleOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div style={{ padding: "24px" }} className="animate-fade-in">
      <Title level={2} style={{ marginBottom: 24 }} className="animate-fade-in-down">
        Bảng điều khiển Admin
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={8} key={index}>
            <Card className="hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Chart Section */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Thống kê người dùng theo tháng</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: "20px 0" }}>
              <Row gutter={[8, 16]}>
                {userGrowth.map((item, index) => (
                  <Col span={2} key={index}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          height: `${(item.users / 150) * 200}px`,
                          background: "linear-gradient(to top, #1890ff, #40a9ff)",
                          borderRadius: "4px 4px 0 0",
                          marginBottom: 8,
                          minHeight: 20,
                        }}
                      />
                      <Text style={{ fontSize: 11 }}>{item.month}</Text>
                      <br />
                      <Text strong style={{ fontSize: 12 }}>
                        {item.users}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>

          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span>Hoàn thành bài thi (7 ngày qua)</span>
              </Space>
            }
          >
            <div style={{ padding: "20px 0" }}>
              <Row gutter={[16, 24]}>
                {testCompletion.map((item, index) => (
                  <Col span={24} key={index}>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text strong>{item.date}</Text>
                        <Text type="secondary">
                          Hoàn thành: {item.completed} bài thi
                        </Text>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#f0f0f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(item.completed / 70) * 100}%`,
                            background: "linear-gradient(to right, #1890ff, #40a9ff)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
          >
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: getStatusColor(item.status),
                        }}
                        icon={getActivityIcon(item.type)}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.action}</Text>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        {item.user && (
                          <Text type="secondary">Người dùng: {item.user}</Text>
                        )}
                        {item.test && (
                          <div>
                            <Text type="secondary">Bài thi: {item.test}</Text>
                          </div>
                        )}
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.time.fromNow()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
