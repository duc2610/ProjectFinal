import React, { useState } from "react";
import { Tabs, Form, Input, Button, Row, Col, Modal, notification } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { changePassword } from "@services/authService";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Tabs
          defaultActiveKey="personal"
          className={styles.tabs}
          items={[
            {
              key: "personal",
              label: "Thông tin cá nhân",
              children: <PersonalTab user={user} />,
            },
            {
              key: "history",
              label: "Lịch sử thi",
              children: <div>Lịch sử thi</div>,
            },
            {
              key: "report",
              label: "Báo cáo",
              children: <div>Báo cáo</div>,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function PersonalTab({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const { oldPassword, newPassword, confirmNewPassword } = values;
      await changePassword({ oldPassword, newPassword, confirmNewPassword });
      notification.success({
        message: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật.",
      });
      handleCancel();
    } catch (error) {
      const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      if (
        msg.toLowerCase().includes("old password") ||
        msg.toLowerCase().includes("mật khẩu cũ") ||
        msg.toLowerCase().includes("current password")
      ) {
        form.setFields([
          {
            name: "oldPassword",
            errors: [msg],
          },
        ]);
      } else {
        notification.error({
          message: "Đổi mật khẩu thất bại",
          description: msg,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.tabPane}>
        <h2 className={styles.title}>Profile Information</h2>

        <Row gutter={24} justify="center">
          <Col xs={24} md={14} lg={14}>
            <Form layout="vertical" className={styles.form}>
              <Form.Item label="Full Name">
                <Input value={user?.fullName || ""} readOnly />
              </Form.Item>
              <Form.Item label="Email Address">
                <Input value={user?.email || ""} readOnly />
              </Form.Item>

              <Button block className={styles.primaryBtn} onClick={showModal}>
                Change Password
              </Button>
              <Button block className={styles.ghostBtn} type="default">
                Update Profile
              </Button>
            </Form>
          </Col>
        </Row>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onOk={() => form.submit()}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        onCancel={handleCancel}
        closable
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.form}
          onFinish={onFinish}
          name="change-password-form"
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                message:
                  "Phải có ít nhất 1 chữ và 1 số; chỉ gồm chữ và số (không khoảng trắng/ký tự đặc biệt)",
              },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
