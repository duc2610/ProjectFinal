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
  Spin,
  message,
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
import {
  getDashboardStatistics,
  getTestPerformanceByDay,
  getTopPerformingTests,
  getRecentActivities,
} from "@services/testCreatorDashboardService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

export default function TestCreatorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statistics, performance, topTests, activities] = await Promise.all([
        getDashboardStatistics(),
        getTestPerformanceByDay(7),
        getTopPerformingTests(5),
        getRecentActivities(20),
      ]);

      // Transform statistics data
      const stats = {
        totalTests: statistics?.totalTests || 0,
        publishedTests: statistics?.publishedTests || 0,
        draftTests: statistics?.draftTests || 0,
        totalQuestions: statistics?.totalQuestions || 0,
        totalTestResults: statistics?.totalTestResults || 0,
        newTestsToday: statistics?.newTestsComparedToPrevious || 0,
        newQuestionsToday: statistics?.newQuestionsComparedToPrevious || 0,
        averageScore: statistics?.averageScore || 0,
      };

      // Transform performance data
      const testPerformance = (performance || []).map((item) => ({
        date: item.date || (item.timestamp ? dayjs(item.timestamp).format("DD/MM") : ""),
        completed: item.completedCount || 0,
        averageScore: item.averagePercentage || item.averageScore || 0,
      }));

      // Transform top tests data
      const transformedTopTests = (topTests || []).map((item) => ({
        id: item.testId,
        name: item.title,
        completed: item.completedCount || 0,
        averageScore: item.averagePercentage || item.averageScore || 0,
        status: item.visibilityStatusText?.toLowerCase() || "đã xuất bản",
      }));

      // Transform activities data
      const transformedActivities = (activities || []).map((item, index) => {
        // Parse activity type to determine icon type
        let type = "test";
        if (item.activityType?.includes("câu hỏi") || item.activityType?.includes("question")) {
          type = "question";
        }

        // Parse details to extract test name and count
        const details = item.details || "";
        const testMatch = details.match(/Bài thi:\s*(.+)/i);
        const countMatch = details.match(/Số lượng:\s*(\d+)/i);

        return {
          id: index + 1,
          type,
          action: item.activityType || "",
          test: testMatch ? testMatch[1] : null,
          count: countMatch ? parseInt(countMatch[1]) : null,
          time: dayjs(item.timestamp),
          status: item.status || "thông tin",
        };
      });

      setDashboardData({
        stats,
        activities: transformedActivities,
        testPerformance,
        topTests: transformedTopTests,
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

  const { stats, activities, testPerformance, topTests } = dashboardData;

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
      value: parseFloat(stats.averageScore).toFixed(1),
      prefix: <BarChartOutlined />,
      suffix: "/100",
      valueStyle: { color: "#13c2c2" },
    },
  ];

  // Chuyển đổi status sang tiếng Việt
  const translateStatus = (status) => {
    const statusMap = {
      "published": "đã xuất bản",
      "draft": "nháp",
      "hidden": "đã ẩn",
      "private": "riêng tư",
      "public": "công khai",
      "success": "thành công",
      "error": "lỗi",
      "info": "thông tin",
      "warning": "cảnh báo",
    };
    return statusMap[status?.toLowerCase()] || status || "thông tin";
  };

  // Activity status colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "thành công":
        return "green";
      case "error":
      case "lỗi":
        return "red";
      case "info":
      case "thông tin":
        return "blue";
      case "warning":
      case "cảnh báo":
        return "orange";
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
        Bảng điều khiển 
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
                        <Tag color="green">{translateStatus(item.status)}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">
                          Hoàn thành: {item.completed}
                        </Text>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          Điểm TB: {parseFloat(item.averageScore).toFixed(1)}%
                        </Text>
                      </Space>
                    }
                  />
                  <Progress
                    type="circle"
                    percent={parseFloat(item.averageScore)}
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
            <div
              style={{
                maxHeight: "1010px",
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
                            {translateStatus(item.status)}
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
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

