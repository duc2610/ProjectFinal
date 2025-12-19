import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card, Row, Col, Collapse, Alert } from "antd";
import {
  QuestionCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import styles from "@shared/styles/Support.module.css";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function Support() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  const faqData = [
    {
      key: "1",
      label: "Làm thế nào để đăng ký tài khoản?",
      children: (
        <div>
          <Paragraph>
            Để đăng ký tài khoản trên Toeic Genius, bạn thực hiện các bước sau:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Truy cập trang chủ và click vào nút "Đăng ký" ở góc trên bên phải</li>
            <li>Điền đầy đủ thông tin: Email, Mật khẩu, Họ tên</li>
            <li>Xác nhận email để kích hoạt tài khoản</li>
            <li>Đăng nhập và bắt đầu sử dụng dịch vụ</li>
          </ol>
        </div>
      ),
    },
    {
      key: "2",
      label: "Tôi quên mật khẩu, làm sao để lấy lại?",
      children: (
        <div>
          <Paragraph>
            Nếu bạn quên mật khẩu, bạn có thể khôi phục bằng cách:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Truy cập trang đăng nhập và click vào "Quên mật khẩu?"</li>
            <li>Nhập email đã đăng ký</li>
            <li>Kiểm tra email và click vào link khôi phục mật khẩu</li>
            <li>Đặt mật khẩu mới và đăng nhập lại</li>
          </ol>
          <Paragraph>
            Nếu không nhận được email, vui lòng kiểm tra thư mục Spam hoặc liên hệ với chúng tôi qua email support@toeicgenius.com
          </Paragraph>
        </div>
      ),
    },
    {
      key: "3",
      label: "Làm thế nào để làm bài thi?",
      children: (
        <div>
          <Paragraph>
            Để làm bài thi trên Toeic Genius:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Đăng nhập vào tài khoản của bạn</li>
            <li>Vào mục "Bài thi" hoặc "Luyện tập"</li>
            <li>Chọn bài thi bạn muốn làm</li>
            <li>Đọc kỹ hướng dẫn và click "Bắt đầu làm bài"</li>
            <li>Làm bài theo thời gian quy định</li>
            <li>Click "Nộp bài" khi hoàn thành hoặc hệ thống sẽ tự động nộp khi hết thời gian</li>
          </ol>
        </div>
      ),
    },
    {
      key: "4",
      label: "Tiến độ làm bài có được lưu tự động không?",
      children: (
        <div>
          <Paragraph>
            Có, hệ thống sẽ tự động lưu tiến độ làm bài của bạn. Bạn có thể:
          </Paragraph>
          <ul className={styles.list}>
            <li>Dừng làm bài bất cứ lúc nào và quay lại tiếp tục sau</li>
            <li>Tiến độ được lưu trong vòng thời gian quy định của bài thi</li>
            <li>Khi quay lại, bạn sẽ tiếp tục từ câu hỏi đã làm dở</li>
          </ul>
          <Paragraph>
            <strong>Lưu ý:</strong> Sau khi hết thời gian quy định, bạn không thể tiếp tục làm bài nữa.
          </Paragraph>
        </div>
      ),
    },
    {
      key: "5",
      label: "Làm thế nào để tạo Flashcard?",
      children: (
        <div>
          <Paragraph>
            Để tạo Flashcard mới:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Vào mục "Flashcard" trên thanh menu</li>
            <li>Click vào nút "Tạo Flashcard mới"</li>
            <li>Điền thông tin: Từ vựng, Nghĩa, Ví dụ (tùy chọn)</li>
            <li>Chọn chế độ công khai hoặc riêng tư</li>
            <li>Click "Lưu" để hoàn tất</li>
          </ol>
          <Paragraph>
            Bạn cũng có thể tìm kiếm và sử dụng các Flashcard công khai từ người dùng khác.
          </Paragraph>
        </div>
      ),
    },
    {
      key: "6",
      label: "Điểm số có chính xác như kỳ thi TOEIC thực tế không?",
      children: (
        <div>
          <Paragraph>
            Điểm số trên Toeic Genius chỉ mang tính chất tham khảo cho mục đích luyện tập:
          </Paragraph>
          <ul className={styles.list}>
            <li>Điểm số được tính dựa trên số câu trả lời đúng và độ khó của câu hỏi</li>
            <li>Đối với phần Speaking và Writing, điểm được tính bằng công nghệ AI</li>
            <li>Điểm số không đảm bảo sẽ khớp hoàn toàn với kỳ thi TOEIC chính thức</li>
            <li>Mục đích chính là giúp bạn đánh giá trình độ và cải thiện kỹ năng</li>
          </ul>
        </div>
      ),
    },
    {
      key: "7",
      label: "Tôi phát hiện câu hỏi có sai sót, làm sao để báo cáo?",
      children: (
        <div>
          <Paragraph>
            Chúng tôi rất cảm ơn bạn đã phát hiện và báo cáo sai sót. Để báo cáo:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Trong khi làm bài, click vào nút "Báo cáo câu hỏi" ở câu hỏi có vấn đề</li>
            <li>Mô tả chi tiết vấn đề bạn phát hiện</li>
            <li>Gửi báo cáo cho chúng tôi</li>
            <li>Hoặc gửi email trực tiếp đến support@toeicgenius.com với tiêu đề "Báo cáo câu hỏi"</li>
          </ol>
          <Paragraph>
            Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
          </Paragraph>
        </div>
      ),
    },
    {
      key: "8",
      label: "Tài khoản của tôi bị khóa, tôi phải làm gì?",
      children: (
        <div>
          <Paragraph>
            Nếu tài khoản của bạn bị khóa, có thể do:
          </Paragraph>
          <ul className={styles.list}>
            <li>Vi phạm quy định sử dụng dịch vụ</li>
            <li>Hoạt động đáng ngờ hoặc gian lận</li>
            <li>Nhiều lần đăng nhập sai mật khẩu</li>
          </ul>
          <Paragraph>
            Để được hỗ trợ:
          </Paragraph>
          <ol className={styles.orderedList}>
            <li>Liên hệ với chúng tôi qua email support@toeicgenius.com</li>
            <li>Cung cấp thông tin tài khoản và mô tả tình huống</li>
            <li>Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ</li>
          </ol>
        </div>
      ),
    },
    {
      key: "9",
      label: "Tôi có thể sử dụng Toeic Genius trên điện thoại không?",
      children: (
        <div>
          <Paragraph>
            Có, Toeic Genius được thiết kế responsive và có thể sử dụng trên:
          </Paragraph>
          <ul className={styles.list}>
            <li>Máy tính để bàn và laptop</li>
            <li>Tablet</li>
            <li>Điện thoại thông minh (smartphone)</li>
          </ul>
          <Paragraph>
            Bạn chỉ cần truy cập website qua trình duyệt trên thiết bị của mình. 
            Giao diện sẽ tự động điều chỉnh để phù hợp với kích thước màn hình.
          </Paragraph>
        </div>
      ),
    },
    {
      key: "10",
      label: "Dịch vụ có miễn phí không?",
      children: (
        <div>
          <Paragraph>
            Toeic Genius cung cấp nhiều tính năng miễn phí cho người dùng:
          </Paragraph>
          <ul className={styles.list}>
            <li>Đăng ký và sử dụng tài khoản</li>
            <li>Làm bài thi và luyện tập</li>
            <li>Tạo và sử dụng Flashcard</li>
            <li>Xem kết quả và phân tích điểm số</li>
          </ul>
          <Paragraph>
            Một số tính năng nâng cao có thể yêu cầu đăng ký gói Premium. 
            Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
          </Paragraph>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <Card className={styles.heroCard}>
          <div className={styles.heroContent}>
            <QuestionCircleOutlined className={styles.heroIcon} />
            <Title level={1} className={styles.heroTitle}>
              Trung tâm hỗ trợ
            </Title>
            <Paragraph className={styles.heroDescription}>
              Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình học tập và luyện thi TOEIC. 
              Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.
            </Paragraph>
          </div>
        </Card>
      </div>

      {/* Contact Info Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Liên hệ với chúng tôi
          </Title>
          <Row gutter={[24, 24]} className={styles.contactRow}>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.contactCard}>
                <MailOutlined className={styles.contactIcon} />
                <Title level={4} className={styles.contactTitle}>
                  Email
                </Title>
                <Text className={styles.contactText}>
                  support@toeicgenius.com
                </Text>
                <Text className={styles.contactNote}>
                  Phản hồi trong vòng 24-48 giờ
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.contactCard}>
                <PhoneOutlined className={styles.contactIcon} />
                <Title level={4} className={styles.contactTitle}>
                  Điện thoại
                </Title>
                <Text className={styles.contactText}>
                  +84 123 456 789
                </Text>
                <Text className={styles.contactNote}>
                  Thứ 2 - Thứ 6: 8:00 - 17:00
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <div className={styles.contactCard}>
                <ClockCircleOutlined className={styles.contactIcon} />
                <Title level={4} className={styles.contactTitle}>
                  Thời gian hỗ trợ
                </Title>
                <Text className={styles.contactText}>
                  24/7 qua email
                </Text>
                <Text className={styles.contactNote}>
                  Hotline: 8:00 - 17:00 (GMT+7)
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Câu hỏi thường gặp (FAQ)
          </Title>
          <Paragraph className={styles.sectionDescription}>
            Tìm câu trả lời cho các câu hỏi phổ biến về cách sử dụng Toeic Genius
          </Paragraph>
          <Collapse
            items={faqData}
            defaultActiveKey={["1"]}
            className={styles.faqCollapse}
            expandIcon={({ isActive }) => (
              <QuestionCircleOutlined rotate={isActive ? 90 : 0} />
            )}
          />
        </div>
      </Card>

      {/* Quick Help Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Hướng dẫn nhanh
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Alert
                message="Bắt đầu làm bài thi"
                description="Vào mục 'Bài thi' hoặc 'Luyện tập', chọn bài thi bạn muốn làm và click 'Bắt đầu làm bài'. Tiến độ sẽ được lưu tự động."
                type="info"
                showIcon
                className={styles.helpAlert}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="Tạo Flashcard"
                description="Vào mục 'Flashcard', click 'Tạo Flashcard mới', điền thông tin và lưu. Bạn có thể chia sẻ với cộng đồng hoặc giữ riêng tư."
                type="info"
                showIcon
                className={styles.helpAlert}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="Xem kết quả"
                description="Sau khi hoàn thành bài thi, bạn sẽ thấy kết quả ngay lập tức với phân tích chi tiết về điểm số và các câu trả lời sai."
                type="info"
                showIcon
                className={styles.helpAlert}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="Báo cáo vấn đề"
                description="Nếu phát hiện câu hỏi sai sót hoặc gặp lỗi kỹ thuật, click 'Báo cáo câu hỏi' hoặc gửi email đến support@toeicgenius.com"
                type="warning"
                showIcon
                className={styles.helpAlert}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* Additional Support Section */}
      <Card className={styles.card}>
        <div className={styles.section}>
          <Title level={2} className={styles.sectionTitle}>
            Cần hỗ trợ thêm?
          </Title>
          <Paragraph className={styles.sectionContent}>
            Nếu bạn không tìm thấy câu trả lời trong phần FAQ hoặc cần hỗ trợ về vấn đề cụ thể, 
            đừng ngần ngại liên hệ với chúng tôi. Đội ngũ hỗ trợ của Toeic Genius luôn sẵn sàng giúp đỡ bạn.
          </Paragraph>
          <div className={styles.supportActions}>
            <div className={styles.supportAction}>
              <MessageOutlined className={styles.actionIcon} />
              <Text strong className={styles.actionText}>
                Gửi email: support@toeicgenius.com
              </Text>
            </div>
            <div className={styles.supportAction}>
              <PhoneOutlined className={styles.actionIcon} />
              <Text strong className={styles.actionText}>
                Gọi hotline: +84 123 456 789
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

