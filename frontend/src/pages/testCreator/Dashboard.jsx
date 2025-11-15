import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Progress,
  Space,
  Avatar,
  List,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

// Mock data generator for TestCreator
const generateCreatorMockData = () => {
  // Statistics data
  const stats = {
    totalTests: 45,
    publishedTests: 32,
    draftTests: 13,
    totalQuestions: 1240,
    totalTestResults: 2340,
    newTestsToday: 2,
    newQuestionsToday: 15,
    averageScore: 78.5,
  };

  // Recent activities
  const activities = [
    {
      id: 1,
      type: "test",
      action: "Tạo bài thi mới",
      test: "TOEIC Practice Test #46",
      time: dayjs().subtract(10, "minute"),
      status: "info",
    },
    {
      id: 2,
      type: "question",
      action: "Thêm câu hỏi",
      test: "TOEIC Practice Test #45",
      count: 5,
      time: dayjs().subtract(30, "minute"),
      status: "success",
    },
    {
      id: 3,
      type: "test",
      action: "Xuất bản bài thi",
      test: "TOEIC Full Test #44",
      time: dayjs().subtract(2, "hour"),
      status: "success",
    },
    {
      id: 4,
      type: "test",
      action: "Cập nhật bài thi",
      test: "TOEIC Practice Test #43",
      time: dayjs().subtract(4, "hour"),
      status: "info",
    },
    {
      id: 5,
      type: "question",
      action: "Xóa câu hỏi",
      test: "TOEIC Practice Test #42",
      count: 2,
      time: dayjs().subtract(6, "hour"),
      status: "error",
    },
  ];

  // Test performance data (for charts simulation)
  const testPerformance = Array.from({ length: 7 }, (_, i) => ({
    date: dayjs().subtract(6 - i, "day").format("DD/MM"),
    completed: Math.floor(Math.random() * 50) + 20,
    averageScore: Math.floor(Math.random() * 30) + 60,
  }));

  // Top performing tests
  const topTests = [
    {
      id: 1,
      name: "TOEIC Practice Test #45",
      completed: 234,
      averageScore: 85.5,
      status: "published",
    },
    {
      id: 2,
      name: "TOEIC Full Test #44",
      completed: 189,
      averageScore: 82.3,
      status: "published",
    },
    {
      id: 3,
      name: "TOEIC Practice Test #43",
      completed: 156,
      averageScore: 79.8,
      status: "published",
    },
    {
      id: 4,
      name: "TOEIC Practice Test #42",
      completed: 142,
      averageScore: 77.2,
      status: "published",
    },
    {
      id: 5,
      name: "TOEIC Full Test #41",
      completed: 128,
      averageScore: 75.6,
      status: "published",
    },
  ];

  return { stats, activities, testPerformance, topTests };
};

export default function TestCreatorDashboard() {
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMockData(generateCreatorMockData());
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

  const { stats, activities, testPerformance, topTests } = mockData;

  // Statistic cards configuration
  const statCards = [
    {
      title: "Tổng số bài thi",
      value: stats.totalTests,
      prefix: <FileTextOutlined />,
      suffix: (
        <span style={{ fontSize: 14, color: "#52c41a" }}>
          <ArrowUpOutlined /> +{stats.newTestsToday}
        </span>
      ),
      valueStyle: { color: "#1890ff" },
    },
    {
      title: "Bài thi đã xuất bản",
      value: stats.publishedTests,
      prefix: <CheckCircleOutlined />,
      suffix: `${Math.round((stats.publishedTests / stats.totalTests) * 100)}%`,
      valueStyle: { color: "#52c41a" },
    },
    {
      title: "Bài thi nháp",
      value: stats.draftTests,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: "#fa8c16" },
    },
    {
      title: "Tổng số câu hỏi",
      value: stats.totalQuestions,
      prefix: <QuestionCircleOutlined />,
      suffix: (
        <span style={{ fontSize: 14, color: "#52c41a" }}>
          <ArrowUpOutlined /> +{stats.newQuestionsToday}
        </span>
      ),
      valueStyle: { color: "#722ed1" },
    },
    {
      title: "Kết quả thi",
      value: stats.totalTestResults,
      prefix: <TrophyOutlined />,
      valueStyle: { color: "#eb2f96" },
    },
    {
      title: "Điểm trung bình",
      value: stats.averageScore,
      prefix: <BarChartOutlined />,
      suffix: "/100",
      valueStyle: { color: "#13c2c2" },
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
        return <FileTextOutlined style={{ color: "#1890ff" }} />;
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
        Bảng điều khiển Test Creator
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
                <span>Hiệu suất bài thi (7 ngày qua)</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: "20px 0" }}>
              <Row gutter={[16, 24]}>
                {testPerformance.map((item, index) => (
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
                        <Space>
                          <Text type="secondary">
                            Hoàn thành: {item.completed}
                          </Text>
                          <Text type="secondary">
                            Điểm TB: {item.averageScore}%
                          </Text>
                        </Space>
                      </div>
                      <Progress
                        percent={item.averageScore}
                        strokeColor={{
                          "0%": "#108ee9",
                          "100%": "#87d068",
                        }}
                        showInfo={false}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>

          {/* Top Performing Tests */}
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span>Top bài thi hiệu suất cao</span>
              </Space>
            }
          >
            <List
              dataSource={topTests}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: "#52c41a",
                        }}
                      >
                        {item.id}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color="green">{item.status}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">
                          Hoàn thành: {item.completed}
                        </Text>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          Điểm TB: {item.averageScore}%
                        </Text>
                      </Space>
                    }
                  />
                  <Progress
                    type="circle"
                    percent={item.averageScore}
                    size={60}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                </List.Item>
              )}
            />
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
                        {item.test && (
                          <div>
                            <Text type="secondary">Bài thi: {item.test}</Text>
                          </div>
                        )}
                        {item.count && (
                          <Text type="secondary">Số lượng: {item.count}</Text>
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

