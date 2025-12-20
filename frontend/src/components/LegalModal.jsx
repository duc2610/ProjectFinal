import React from "react";
import { Modal, Typography, Divider } from "antd";
import TermsContent from "./TermsContent";
import PrivacyContent from "./PrivacyContent";
import styles from "@shared/styles/LegalModal.module.css";

const { Title, Text } = Typography;

export default function LegalModal({ open, onClose, type = "terms" }) {
  const isTerms = type === "terms";
  const title = isTerms ? "Điều khoản sử dụng" : "Chính sách bảo mật";
  const lastUpdated = "18/10/2025";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      className={styles.legalModal}
      title={
        <div className={styles.modalHeader}>
          <Title level={3} className={styles.modalTitle}>
            {title}
          </Title>
          <Text type="secondary" className={styles.modalLastUpdated}>
            Cập nhật lần cuối: {lastUpdated}
          </Text>
        </div>
      }
    >
      <div className={styles.modalContent}>
        {isTerms ? <TermsContent /> : <PrivacyContent />}
      </div>
    </Modal>
  );
}

