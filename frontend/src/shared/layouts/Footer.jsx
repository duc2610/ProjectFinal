import React from "react";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Typography, Divider } from "antd";
import styles from "@shared/styles/Footer.module.css";

const { Text, Title } = Typography;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    practice: [
      { label: "Luyện Tập L&R", to: "/practice-lr" },
      { label: "Luyện Tập S&W", to: "/practice-sw" },
      { label: "Bài thi", to: "/test-list" },
      { label: "Flashcard", to: "/flashcard" },
    ],
    support: [
      { label: "Giới thiệu", to: "/about" },
      { label: "Hỗ trợ", to: "/support" },
      { label: "Câu hỏi thường gặp", to: "/faq" },
      { label: "Liên hệ", to: "/contact" },
    ],
    legal: [
      { label: "Điều khoản sử dụng", to: "/terms" },
      { label: "Chính sách bảo mật", to: "/privacy" },
      { label: "Quy định", to: "/rules" },
    ],
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.brandHeader}>
              <Title level={4} className={styles.brandTitle}>
                Toeic Genius
              </Title>
            </div>
            <Text className={styles.brandDescription}>
              Nền tảng học và luyện thi TOEIC toàn diện, giúp bạn nâng cao kỹ
              năng tiếng Anh một cách hiệu quả.
            </Text>
            <div className={styles.socialLinks}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <FacebookOutlined />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <InstagramOutlined />
              </a>
            </div>
          </div>

          {/* Practice Links */}
          <div className={styles.linkSection}>
            <Title level={5} className={styles.sectionTitle}>
              Luyện tập
            </Title>
            <ul className={styles.linkList}>
              {footerLinks.practice.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className={styles.linkSection}>
            <Title level={5} className={styles.sectionTitle}>
              Hỗ trợ
            </Title>
            <ul className={styles.linkList}>
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <Title level={5} className={styles.sectionTitle}>
              Liên hệ
            </Title>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MailOutlined className={styles.contactIcon} />
                <Text className={styles.contactText}>
                  support@toeicgenius.com
                </Text>
              </li>
              <li className={styles.contactItem}>
                <PhoneOutlined className={styles.contactIcon} />
                <Text className={styles.contactText}>+84 123 456 789</Text>
              </li>
              <li className={styles.contactItem}>
                <EnvironmentOutlined className={styles.contactIcon} />
                <Text className={styles.contactText}>
                  Khu công nghệ cao Hòa Lạc, Hà Nội
                </Text>
              </li>
            </ul>
          </div>
        </div>

        <Divider className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <Text className={styles.copyright}>
            © {currentYear} Toeic Genius. Tất cả quyền được bảo lưu.
          </Text>
          <div className={styles.legalLinks}>
            {footerLinks.legal.map((link, index) => (
              <React.Fragment key={link.to}>
                <Link to={link.to} className={styles.legalLink}>
                  {link.label}
                </Link>
                {index < footerLinks.legal.length - 1 && (
                  <span className={styles.legalSeparator}>•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
