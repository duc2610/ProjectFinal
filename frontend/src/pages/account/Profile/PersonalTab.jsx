import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Modal, notification } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { changePassword } from "@services/authService";
import { translateErrorMessage } from "@shared/utils/translateError";

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
      const rawMsg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      const msg = translateErrorMessage(rawMsg);
      if (
        rawMsg.toLowerCase().includes("old password") ||
        rawMsg.toLowerCase().includes("mật khẩu cũ") ||
        rawMsg.toLowerCase().includes("current password") ||
        rawMsg.toLowerCase().includes("incorrect password")
      ) {
        form.setFields([
          {
            name: "oldPassword",
            errors: ["Mật khẩu hiện tại không đúng"],
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
        <h2 className={styles.title}>Thông tin cá nhân</h2>

        <Row gutter={32} justify="center">
          <Col xs={24} sm={20} md={18} lg={16} xl={14}>
            <Form layout="vertical" className={styles.form}>
              <Form.Item label="Họ và tên">
                <Input value={user?.fullName || ""} readOnly />
              </Form.Item>
              <Form.Item label="Email">
                <Input value={user?.email || ""} readOnly />
              </Form.Item>

              <Button block className={styles.primaryBtn} onClick={showModal}>
                Đổi mật khẩu
              </Button>
              <Button block className={styles.ghostBtn} type="default">
                Cập nhật thông tin
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

