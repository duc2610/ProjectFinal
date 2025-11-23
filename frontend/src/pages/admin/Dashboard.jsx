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
  Spin,
  message,
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
import {
  getDashboardStatistics,
  getUserStatisticsByMonth,
  getTestCompletionsByDay,
  getRecentActivities,
} from "@services/adminDashboardService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statistics, userGrowth, testCompletion, activities] = await Promise.all([
        getDashboardStatistics(),
        getUserStatisticsByMonth(12),
        getTestCompletionsByDay(7),
        getRecentActivities(20),
      ]);

      // Transform statistics data
      const stats = {
        totalUsers: statistics?.totalUsers || 0,
        activeUsers: statistics?.activeUsers || 0,
        totalTests: statistics?.totalTests || 0,
        totalQuestions: statistics?.totalQuestions || 0,
        totalTestResults: statistics?.totalTestResults || 0,
        bannedUsers: statistics?.bannedUsers || 0,
        newUsersToday: statistics?.newUsersComparedToPrevious || 0,
        newTestsToday: statistics?.newTestsComparedToPrevious || 0,
      };

      // Transform user growth data
      const transformedUserGrowth = (userGrowth || []).map((item) => ({
        month: item.month || (item.timestamp ? dayjs(item.timestamp).format("MM/YYYY") : ""),
        users: item.userCount || 0,
      }));

      // Transform test completion data
      const transformedTestCompletion = (testCompletion || []).map((item) => ({
        date: item.date || (item.timestamp ? dayjs(item.timestamp).format("DD/MM") : ""),
        completed: item.completedTestsCount || 0,
      }));

      // Transform activities data
      const transformedActivities = (activities || []).map((item, index) => {
        // Parse activity type to determine icon type
        let type = "user";
        if (item.activityType?.includes("bài thi") || item.activityType?.includes("test")) {
          type = "test";
        }

        // Parse details to extract test name
        const details = item.details || "";
        const testMatch = details.match(/Bài thi:\s*(.+)/i);

        return {
          id: index + 1,
          type,
          action: item.activityType || "",
          user: item.userName || "",
          test: testMatch ? testMatch[1] : null,
          time: dayjs(item.timestamp),
          status: item.status || "info",
        };
      });

      setDashboardData({
        stats,
        activities: transformedActivities,
        userGrowth: transformedUserGrowth,
        testCompletion: transformedTestCompletion,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  const { stats, activities, userGrowth, testCompletion } = dashboardData;

  // Calculate max values for charts
  const maxUserCount = userGrowth.length > 0 
    ? Math.max(...userGrowth.map(item => item.users), 1)
    : 1;
  const maxCompletedTests = testCompletion.length > 0
    ? Math.max(...testCompletion.map(item => item.completed), 1)
    : 1;

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
      suffix: stats.totalUsers > 0 
        ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`
        : "0%",
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
              {userGrowth.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                  <Text type="secondary">Chưa có dữ liệu</Text>
                </div>
              ) : (
                <Row gutter={[8, 16]}>
                  {userGrowth.map((item, index) => (
                    <Col span={2} key={index}>
                      <div 
                        style={{ 
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          height: "250px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            height: `${(item.users / maxUserCount) * 200}px`,
                            background: "linear-gradient(to top, #1890ff, #40a9ff)",
                            borderRadius: "4px 4px 0 0",
                            marginBottom: 8,
                            minHeight: 20,
                          }}
                        />
                        <Text style={{ fontSize: 11 }}>{item.month}</Text>
                        <Text strong style={{ fontSize: 12 }}>
                          {item.users}
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
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
              {testCompletion.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                  <Text type="secondary">Chưa có dữ liệu</Text>
                </div>
              ) : (
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
                              width: `${(item.completed / maxCompletedTests) * 100}%`,
                              background: "linear-gradient(to right, #1890ff, #40a9ff)",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
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
            <div
              style={{
                maxHeight: "1000px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
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
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
