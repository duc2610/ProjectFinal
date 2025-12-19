import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card, Row, Col, Statistic } from "antd";
import {
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import styles from "@shared/styles/About.module.css";

const { Title, Paragraph, Text } = Typography;

export default function About() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <Card className={styles.heroCard}>
          <div className={styles.heroContent}>
            <Title level={1} className={styles.heroTitle}>
              Chào mừng đến với Toeic Genius
            </Title>
            <Paragraph className={styles.heroDescription}>
              Nền tảng học và luyện thi TOEIC toàn diện, giúp bạn nâng cao kỹ năng tiếng Anh 
              một cách hiệu quả và đạt được điểm số mong muốn trong kỳ thi TOEIC chính thức.
            </Paragraph>
          </div>
        </Card>
      </div>

      {/* Mission Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Sứ mệnh của chúng tôi
          </Title>
          <Paragraph className={styles.sectionContent}>
            Toeic Genius được xây dựng với mục tiêu cung cấp một nền tảng học tập TOEIC chất lượng cao, 
            dễ sử dụng và hiệu quả. Chúng tôi tin rằng mọi người đều có thể cải thiện kỹ năng tiếng Anh 
            và đạt được điểm số TOEIC mong muốn thông qua việc luyện tập đều đặn và có phương pháp.
          </Paragraph>
          <Paragraph className={styles.sectionContent}>
            Với hệ thống bài thi đa dạng, câu hỏi được biên soạn kỹ lưỡng, và công nghệ AI tiên tiến, 
            Toeic Genius giúp bạn:
          </Paragraph>
          <ul className={styles.featureList}>
            <li>Luyện tập và làm quen với format bài thi TOEIC thực tế</li>
            <li>Nâng cao kỹ năng Listening, Reading, Speaking và Writing</li>
            <li>Theo dõi tiến độ học tập và cải thiện điểm số qua từng bài thi</li>
            <li>Học từ vựng hiệu quả thông qua hệ thống Flashcard thông minh</li>
            <li>Nhận phản hồi tức thì về kết quả và lỗi sai để cải thiện</li>
          </ul>
        </div>
      </Card>

      {/* Features Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Tính năng nổi bật
          </Title>
          <Row gutter={[24, 24]} className={styles.featuresGrid}>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <BookOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Bài thi đa dạng
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Hệ thống bài thi phong phú với nhiều mức độ khác nhau, từ cơ bản đến nâng cao, 
                  giúp bạn luyện tập toàn diện các kỹ năng TOEIC.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <ThunderboltOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Chấm điểm AI
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Công nghệ AI tiên tiến tự động chấm điểm phần Speaking và Writing, 
                  cung cấp phản hồi chi tiết và gợi ý cải thiện.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <TrophyOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Theo dõi tiến độ
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Hệ thống lưu trữ và phân tích kết quả làm bài, giúp bạn theo dõi sự tiến bộ 
                  và xác định các điểm cần cải thiện.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <GlobalOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Luyện tập từng kỹ năng
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Chế độ luyện tập riêng cho Listening & Reading hoặc Speaking & Writing, 
                  giúp bạn tập trung vào các kỹ năng cần cải thiện.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <BookOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Flashcard thông minh
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Tạo và học từ vựng với hệ thống Flashcard, chia sẻ với cộng đồng hoặc sử dụng 
                  các bộ flashcard công khai từ người dùng khác.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <SafetyOutlined />
                </div>
                <Title level={4} className={styles.featureTitle}>
                  Môi trường học tập an toàn
                </Title>
                <Paragraph className={styles.featureDescription}>
                  Nền tảng được thiết kế với các quy định rõ ràng, đảm bảo môi trường học tập 
                  công bằng và minh bạch cho tất cả người dùng.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Statistics Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Toeic Genius trong số liệu
          </Title>
          <Row gutter={[24, 24]} className={styles.statisticsRow}>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Bài thi"
                value={1000}
                suffix="+"
                prefix={<BookOutlined />}
                className={styles.statistic}
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Câu hỏi"
                value={50000}
                suffix="+"
                prefix={<BookOutlined />}
                className={styles.statistic}
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Người dùng"
                value={10000}
                suffix="+"
                prefix={<TeamOutlined />}
                className={styles.statistic}
              />
            </Col>
            <Col xs={12} sm={8} lg={6}>
              <Statistic
                title="Flashcard"
                value={5000}
                suffix="+"
                prefix={<BookOutlined />}
                className={styles.statistic}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* Why Choose Us Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Tại sao chọn Toeic Genius?
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className={styles.whyCard}>
                <Title level={4} className={styles.whyTitle}>
                  ✓ Nội dung chất lượng cao
                </Title>
                <Paragraph>
                  Tất cả câu hỏi và bài thi được biên soạn bởi đội ngũ chuyên gia, 
                  đảm bảo phù hợp với format và độ khó của kỳ thi TOEIC chính thức.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className={styles.whyCard}>
                <Title level={4} className={styles.whyTitle}>
                  ✓ Giao diện thân thiện
                </Title>
                <Paragraph>
                  Thiết kế giao diện trực quan, dễ sử dụng, giúp bạn tập trung vào việc học 
                  mà không bị phân tâm bởi các yếu tố không cần thiết.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className={styles.whyCard}>
                <Title level={4} className={styles.whyTitle}>
                  ✓ Luyện tập mọi lúc mọi nơi
                </Title>
                <Paragraph>
                  Truy cập nền tảng từ bất kỳ thiết bị nào, luyện tập bất cứ khi nào bạn có thời gian, 
                  lưu tiến độ và tiếp tục sau.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className={styles.whyCard}>
                <Title level={4} className={styles.whyTitle}>
                  ✓ Phản hồi tức thì
                </Title>
                <Paragraph>
                  Nhận kết quả và phân tích chi tiết ngay sau khi hoàn thành bài thi, 
                  giúp bạn nhanh chóng xác định điểm mạnh và điểm yếu.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Contact CTA Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Bắt đầu hành trình của bạn ngay hôm nay
          </Title>
          <Paragraph className={styles.ctaDescription}>
            Tham gia cùng hàng nghìn người dùng đang sử dụng Toeic Genius để cải thiện điểm số TOEIC. 
            Bắt đầu luyện tập ngay để đạt được mục tiêu của bạn!
          </Paragraph>
          <Paragraph className={styles.ctaDescription}>
            Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua 
            email <strong>support@toeicgenius.com</strong> hoặc điện thoại <strong>+84 123 456 789</strong>.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}
