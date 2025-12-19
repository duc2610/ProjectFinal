import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card, Row, Col, Form, Input, Button, Select, message } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import styles from "@shared/styles/Contact.module.css";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Contact() {
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.");
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau hoặc gửi email trực tiếp đến support@toeicgenius.com");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MailOutlined />,
      title: "Email",
      content: "support@toeicgenius.com",
      description: "Gửi email cho chúng tôi bất cứ lúc nào",
      color: "#1890ff",
    },
    {
      icon: <PhoneOutlined />,
      title: "Điện thoại",
      content: "+84 123 456 789",
      description: "Thứ 2 - Thứ 6: 8:00 - 17:00 (GMT+7)",
      color: "#52c41a",
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      content: "Khu công nghệ cao Hòa Lạc",
      description: "Hà Nội, Việt Nam",
      color: "#faad14",
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Thời gian hỗ trợ",
      content: "24/7 qua email",
      description: "Hotline: 8:00 - 17:00 (GMT+7)",
      color: "#722ed1",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <Card className={styles.heroCard}>
          <div className={styles.heroContent}>
            <MessageOutlined className={styles.heroIcon} />
            <Title level={1} className={styles.heroTitle}>
              Liên hệ với chúng tôi
            </Title>
            <Paragraph className={styles.heroDescription}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Gửi tin nhắn cho chúng tôi 
              hoặc liên hệ trực tiếp qua các kênh bên dưới.
            </Paragraph>
          </div>
        </Card>
      </div>

      {/* Contact Info Cards */}
      <Row gutter={[24, 24]} className={styles.contactInfoRow}>
        {contactInfo.map((info, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className={styles.contactInfoCard} hoverable>
              <div className={styles.contactInfoIcon} style={{ color: info.color }}>
                {info.icon}
              </div>
              <Title level={4} className={styles.contactInfoTitle}>
                {info.title}
              </Title>
              <Text strong className={styles.contactInfoContent}>
                {info.content}
              </Text>
              <Text className={styles.contactInfoDescription}>
                {info.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Contact Form and Additional Info */}
      <Row gutter={[32, 32]} className={styles.mainContentRow}>
        {/* Contact Form */}
        <Col xs={24} lg={14}>
          <Card className={styles.card}>
            <div className={styles.section}>
              <Title level={2} className={styles.sectionTitle}>
                Gửi tin nhắn cho chúng tôi
              </Title>
              <Paragraph className={styles.sectionDescription}>
                Điền form bên dưới và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </Paragraph>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.contactForm}
              >
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                    { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên của bạn" size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="your.email@example.com" size="large" />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Chủ đề"
                  rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
                >
                  <Select placeholder="Chọn chủ đề" size="large">
                    <Option value="general">Câu hỏi chung</Option>
                    <Option value="technical">Hỗ trợ kỹ thuật</Option>
                    <Option value="account">Vấn đề tài khoản</Option>
                    <Option value="payment">Thanh toán</Option>
                    <Option value="feedback">Góp ý và phản hồi</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Nội dung tin nhắn"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung tin nhắn" },
                    { min: 10, message: "Nội dung phải có ít nhất 10 ký tự" },
                  ]}
                >
                  <TextArea
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    rows={6}
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SendOutlined />}
                    loading={loading}
                    className={styles.submitButton}
                    block
                  >
                    Gửi tin nhắn
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        {/* Additional Info */}
        <Col xs={24} lg={10}>
          <Card className={styles.card}>
            <div className={styles.section}>
              <Title level={3} className={styles.infoTitle}>
                Thông tin liên hệ
              </Title>
              <Divider />
              
              <div className={styles.infoItem}>
                <MailOutlined className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <Text strong className={styles.infoLabel}>Email</Text>
                  <Text className={styles.infoValue}>support@toeicgenius.com</Text>
                </div>
              </div>

              <div className={styles.infoItem}>
                <PhoneOutlined className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <Text strong className={styles.infoLabel}>Điện thoại</Text>
                  <Text className={styles.infoValue}>+84 123 456 789</Text>
                </div>
              </div>

              <div className={styles.infoItem}>
                <EnvironmentOutlined className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <Text strong className={styles.infoLabel}>Địa chỉ</Text>
                  <Text className={styles.infoValue}>
                    Khu công nghệ cao Hòa Lạc<br />
                    Hà Nội, Việt Nam
                  </Text>
                </div>
              </div>

              <div className={styles.infoItem}>
                <ClockCircleOutlined className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <Text strong className={styles.infoLabel}>Thời gian hỗ trợ</Text>
                  <Text className={styles.infoValue}>
                    Email: 24/7<br />
                    Hotline: Thứ 2 - Thứ 6, 8:00 - 17:00 (GMT+7)
                  </Text>
                </div>
              </div>

              <Divider />

              <div className={styles.responseTime}>
                <Title level={4} className={styles.responseTimeTitle}>
                  Thời gian phản hồi
                </Title>
                <ul className={styles.responseTimeList}>
                  <li>Email: Trong vòng 24-48 giờ</li>
                  <li>Hotline: Ngay lập tức trong giờ làm việc</li>
                  <li>Form liên hệ: Trong vòng 24-48 giờ</li>
                </ul>
              </div>        
            </div>    
          </Card>

         
        </Col>
      </Row>
    </div>
  );
}

