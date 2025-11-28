import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Row, Col, Typography, Tag, Tabs, Badge } from "antd";
import {
  AudioOutlined,
  ReadOutlined,
  SoundOutlined,
  EditOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  BookOutlined,
  FileTextOutlined,
  RocketOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "@shared/styles/Home.module.css";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SoundOutlined />,
      title: "Practice Listening & Reading",
      description: "Luyện tập kỹ năng nghe và đọc với hàng ngàn câu hỏi đa dạng",
      link: "/practice-lr",
      color: "#3b82f6",
    },
    {
      icon: <AudioOutlined />,
      title: "Practice Speaking",
      description: "Luyện nói và nhận đánh giá chính xác từ AI thông minh",
      link: "/practice-sw",
      color: "#10b981",
      badge: "AI Scoring",
    },
    {
      icon: <EditOutlined />,
      title: "Practice Writing",
      description: "Luyện viết và được chấm điểm tự động bằng công nghệ AI",
      link: "/practice-sw",
      color: "#f59e0b",
      badge: "AI Scoring",
    },
    {
      icon: <FileTextOutlined />,
      title: "Full TOEIC Test",
      description: "Làm bài thi TOEIC đầy đủ 4 kỹ năng với chấm điểm tự động",
      link: "/test-list",
      color: "#8b5cf6",
    },
    {
      icon: <BookOutlined />,
      title: "Flashcard",
      description: "Học từ vựng hiệu quả với hệ thống thẻ ghi nhớ thông minh",
      link: "/flashcard",
      color: "#ec4899",
    },
  ];

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleFeatureClick = (link) => {
    navigate(link);
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <RobotOutlined />
            <span>Powered by AI</span>
          </div>
          <Title className={styles.heroTitle}>
            Nâng cao kỹ năng TOEIC với{" "}
            <span className={styles.gradientText}>AI</span>
          </Title>
          <Paragraph className={styles.heroDescription}>
            Hệ thống luyện thi TOEIC toàn diện với công nghệ AI tiên tiến. Chấm
            điểm tự động cho kỹ năng Nói và Viết, giúp bạn cải thiện điểm số một
            cách hiệu quả.
          </Paragraph>
          <div className={styles.heroActions}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={handleGetStarted}
              className={styles.primaryButton}
            >
              Bắt đầu ngay
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/test-list")}
              className={styles.secondaryButton}
            >
              Làm bài test
            </Button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.floatingCard}>
            <ThunderboltOutlined className={styles.iconLarge} />
            <Text strong>AI Scoring</Text>
            <Text type="secondary">Speaking & Writing</Text>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <Title level={2} className={styles.sectionTitle}>
            Khám phá các tính năng
          </Title>
          <Paragraph className={styles.sectionDescription}>
            Hệ thống đầy đủ 4 kỹ năng với công nghệ AI tiên tiến
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Col
              xs={24}
              sm={12}
              lg={8}
              key={index}
              onClick={() => handleFeatureClick(feature.link)}
            >
              <Card
                hoverable
                className={styles.featureCard}
                style={{ borderTopColor: feature.color }}
              >
                <div className={styles.cardHeader}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: `${feature.color}15`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <Tag color="blue" icon={<RobotOutlined />} className={styles.aiBadge}>
                      {feature.badge}
                    </Tag>
                  )}
                </div>
                <Title level={4} className={styles.cardTitle}>
                  {feature.title}
                </Title>
                <Paragraph className={styles.cardDescription}>
                  {feature.description}
                </Paragraph>
                <Button
                  type="link"
                  className={styles.cardLink}
                  style={{ color: feature.color }}
                >
                  Khám phá ngay →
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* TOEIC Structure Section */}
      <section className={styles.structureSection}>
        <div className={styles.sectionHeader}>
          <Title level={2} className={styles.sectionTitle}>
            Cấu trúc bài thi TOEIC
          </Title>
          <Paragraph className={styles.sectionDescription}>
            Tìm hiểu về định dạng và bố cục của bài thi TOEIC 4 kỹ năng
          </Paragraph>
        </div>

        <div className={styles.structureContent}>
          <Tabs
            defaultActiveKey="lr"
            items={[
              {
                key: "lr",
                label: (
                  <span>
                    <SoundOutlined /> Listening & Reading
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    <div className={styles.testInfo}>
                      <div className={styles.infoItem}>
                        <ClockCircleOutlined />
                        <span>Thời gian: 120 phút</span>
                      </div>
                      <div className={styles.infoItem}>
                        <FileTextOutlined />
                        <span>Tổng số câu: 200 câu</span>
                      </div>
                      <div className={styles.infoItem}>
                        <Tag color="blue">Thang điểm: 0-990</Tag>
                      </div>
                    </div>
                    <Row gutter={[16, 16]} className={styles.partsGrid}>
                      <Col xs={24} sm={12} lg={6}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 1</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Mô tả tranh
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Photographs
                          </Text>
                          <Text className={styles.questionCount}>6 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 2</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Hỏi – Đáp
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Question-Response
                          </Text>
                          <Text className={styles.questionCount}>25 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 3</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Hội thoại
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Conversations
                          </Text>
                          <Text className={styles.questionCount}>39 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 4</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Bài nói ngắn
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Talks
                          </Text>
                          <Text className={styles.questionCount}>30 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 5</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Hoàn thành câu
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Incomplete Sentences
                          </Text>
                          <Text className={styles.questionCount}>30 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 6</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Hoàn thành đoạn văn
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Text Completion
                          </Text>
                          <Text className={styles.questionCount}>16 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 7</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Đọc hiểu
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Reading Comprehension
                          </Text>
                          <Text className={styles.questionCount}>54 câu hỏi</Text>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "speaking",
                label: (
                  <span>
                    <AudioOutlined /> Speaking
                    <Tag color="blue" icon={<RobotOutlined />} style={{ marginLeft: 8 }}>
                      AI Scoring
                    </Tag>
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    <div className={styles.testInfo}>
                      <div className={styles.infoItem}>
                        <ClockCircleOutlined />
                        <span>Thời gian: 20 phút</span>
                      </div>
                      <div className={styles.infoItem}>
                        <FileTextOutlined />
                        <span>Tổng số câu: 11 câu</span>
                      </div>
                      <div className={styles.infoItem}>
                        <Tag color="green">Thang điểm: 0-200</Tag>
                      </div>
                    </div>
                    <Row gutter={[16, 16]} className={styles.partsGrid}>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 1</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Đọc to
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Read a text aloud
                          </Text>
                          <Text className={styles.questionCount}>2 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 2</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Mô tả tranh
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Describe a picture
                          </Text>
                          <Text className={styles.questionCount}>1 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 3</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Trả lời câu hỏi
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Respond to questions
                          </Text>
                          <Text className={styles.questionCount}>3 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={12}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 4</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Trả lời theo tình huống
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Respond using information provided
                          </Text>
                          <Text className={styles.questionCount}>3 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={12}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 5</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Bài nói dài
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Express an opinion
                          </Text>
                          <Text className={styles.questionCount}>1 câu hỏi</Text>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "writing",
                label: (
                  <span>
                    <EditOutlined /> Writing
                    <Tag color="blue" icon={<RobotOutlined />} style={{ marginLeft: 8 }}>
                      AI Scoring
                    </Tag>
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    <div className={styles.testInfo}>
                      <div className={styles.infoItem}>
                        <ClockCircleOutlined />
                        <span>Thời gian: 60 phút</span>
                      </div>
                      <div className={styles.infoItem}>
                        <FileTextOutlined />
                        <span>Tổng số câu: 8 câu</span>
                      </div>
                      <div className={styles.infoItem}>
                        <Tag color="orange">Thang điểm: 0-200</Tag>
                      </div>
                    </div>
                    <Row gutter={[16, 16]} className={styles.partsGrid}>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 1</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Viết câu theo tranh
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Write a sentence based on a picture
                          </Text>
                          <Text className={styles.questionCount}>5 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 2</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Trả lời yêu cầu viết
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Respond to a written request
                          </Text>
                          <Text className={styles.questionCount}>2 câu hỏi</Text>
                        </Card>
                      </Col>
                      <Col xs={24} sm={24} lg={8}>
                        <Card className={styles.partCard}>
                          <div className={styles.partHeader}>
                            <div className={styles.partNumber}>Part 3</div>
                          </div>
                          <Title level={5} className={styles.partTitle}>
                            Viết luận
                          </Title>
                          <Text type="secondary" className={styles.partDescription}>
                            Write an opinion essay
                          </Text>
                          <Text className={styles.questionCount}>1 câu hỏi</Text>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
            className={styles.structureTabs}
          />
        </div>
      </section>

      {/* AI Highlight Section */}
      <section className={styles.aiSection}>
        <div className={styles.aiContent}>
          <div className={styles.aiVisual}>
            <div className={styles.aiIconWrapper}>
              <RobotOutlined className={styles.aiIcon} />
            </div>
          </div>
          <div className={styles.aiText}>
            <Tag color="blue" icon={<RobotOutlined />} className={styles.aiTag}>
              Công nghệ AI
            </Tag>
            <Title level={2} className={styles.aiTitle}>
              Chấm điểm tự động bằng AI
            </Title>
            <Paragraph className={styles.aiDescription}>
              Hệ thống sử dụng công nghệ AI tiên tiến để chấm điểm và đánh giá
              chính xác kỹ năng Nói và Viết của bạn. Nhận phản hồi chi tiết và
              đề xuất cải thiện ngay lập tức.
            </Paragraph>
            <div className={styles.aiFeatures}>
              <div className={styles.aiFeatureItem}>
                <SoundOutlined className={styles.aiFeatureIcon} />
                <div>
                  <Text strong>Speaking Assessment</Text>
                  <br />
                  <Text type="secondary">Phân tích phát âm, ngữ điệu, và độ trôi chảy</Text>
                </div>
              </div>
              <div className={styles.aiFeatureItem}>
                <EditOutlined className={styles.aiFeatureIcon} />
                <div>
                  <Text strong>Writing Assessment</Text>
                  <br />
                  <Text type="secondary">Đánh giá ngữ pháp, từ vựng, và cấu trúc câu</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <Title level={2} className={styles.ctaTitle}>
            Sẵn sàng bắt đầu hành trình của bạn?
          </Title>
          <Paragraph className={styles.ctaDescription}>
            Tham gia cùng hàng nghìn học viên đang cải thiện điểm TOEIC mỗi ngày
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={handleGetStarted}
            className={styles.ctaButton}
          >
            Đăng ký miễn phí
          </Button>
        </div>
      </section>
    </div>
  );
}
