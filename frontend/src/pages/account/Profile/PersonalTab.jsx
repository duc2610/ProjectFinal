import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Modal, notification } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import styles from "@shared/styles/Profile.module.css";
import { changePassword, updateName } from "@services/authService";
import { useAuth } from "@shared/hooks/useAuth";

export function PersonalTab({ user }) {
  const { refreshProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.fullName || "");
  const [nameLoading, setNameLoading] = useState(false);

  // Sync nameValue khi user thay đổi
  useEffect(() => {
    if (!isEditingName) {
      setNameValue(user?.fullName || "");
    }
  }, [user?.fullName, isEditingName]);

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setNameValue(user?.fullName || "");
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNameValue(user?.fullName || "");
  };

  const handleSaveName = async () => {
    const trimmedName = (nameValue || "").trim();
    
    if (!trimmedName) {
      notification.error({
        message: "Lỗi",
        description: "Họ và tên không được để trống",
      });
      return;
    }

    if (trimmedName === user?.fullName) {
      setIsEditingName(false);
      return;
    }

    setNameLoading(true);
    try {
      await updateName({ fullName: trimmedName });
      await refreshProfile();
      notification.success({
        message: "Cập nhật thành công",
        description: "Tên của bạn đã được cập nhật.",
      });
      setIsEditingName(false);
    } catch (error) {
      const rawMsg = error?.response?.data?.message || "Cập nhật tên thất bại";
      notification.error({
        message: "Cập nhật thất bại",
        description: rawMsg,
      });
    } finally {
      setNameLoading(false);
    }
  };

  // Hàm chuyển đổi thông báo lỗi sang tiếng Việt
  const translateError = (errorMsg) => {
    if (!errorMsg) return "Đổi mật khẩu thất bại";
    
    const errorMsgLower = errorMsg.toLowerCase();
    
    const errorMap = {
      "invalid password": "Mật khẩu không hợp lệ!",
      "password": "Mật khẩu không đúng định dạng!",
      "old password": "Mật khẩu hiện tại không đúng!",
      "current password": "Mật khẩu hiện tại không đúng!",
      "incorrect password": "Mật khẩu hiện tại không đúng!",
      "network error": "Lỗi kết nối mạng!",
      "timeout": "Yêu cầu quá thời gian chờ!",
      "server error": "Lỗi máy chủ!",
    };
    
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMsgLower.includes(key)) {
        return value;
      }
    }
    
    return "Đổi mật khẩu thất bại";
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
      // Kiểm tra xem có phải lỗi validation từ backend không
      const isValidationError = 
        error.response?.status === 400 && 
        (error.response?.data?.errors || 
         error.response?.data?.title?.toLowerCase().includes("validation") ||
         error.response?.data?.message?.toLowerCase().includes("validation"));
      
      // Nếu là lỗi validation từ backend, không hiển thị cho user
      if (isValidationError) {
        // Lỗi validation từ backend (không hiển thị)
        return;
      }

      const rawMsg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      const msg = translateError(rawMsg);
      
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
                 {isEditingName ? (
                   <div>
                     <Input
                       value={nameValue}
                       onChange={(e) => setNameValue(e.target.value)}
                       onPressEnter={handleSaveName}
                       disabled={nameLoading}
                       placeholder="Nhập họ và tên"
                       size="large"
                       style={{ marginBottom: 12 }}
                     />
                     <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                       <Button
                         onClick={handleCancelEditName}
                         disabled={nameLoading}
                         size="large"
                         style={{ minWidth: 100 }}
                       >
                         Hủy
                       </Button>
                       <Button
                         type="primary"
                         icon={<CheckOutlined />}
                         onClick={handleSaveName}
                         loading={nameLoading}
                         disabled={nameLoading}
                         size="large"
                         style={{ minWidth: 100 }}
                       >
                         Lưu
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <Input
                     value={user?.fullName || ""}
                     readOnly
                     size="large"
                     addonAfter={
                       <Button
                         type="text"
                         icon={<EditOutlined />}
                         onClick={handleStartEditName}
                         style={{
                           padding: "0 8px",
                           height: "100%",
                           display: "flex",
                           alignItems: "center",
                           color: "#1890ff",
                           fontWeight: 500,
                         }}
                       >
                         Sửa
                       </Button>
                     }
                   />
                 )}
               </Form.Item>
              <Form.Item label="Email">
                <Input value={user?.email || ""} readOnly />
              </Form.Item>

              <Button block className={styles.primaryBtn} onClick={showModal}>
                Đổi mật khẩu
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
            label="Mật khẩu hiện tại"
            name="oldPassword"
            required
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            required
            validateTrigger={['onBlur', 'onChange']}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  // Kiểm tra độ dài
                  if (value.length < 8) {
                    return Promise.reject(new Error("Mật khẩu phải có ít nhất 8 ký tự!"));
                  }
                  if (value.length > 32) {
                    return Promise.reject(new Error("Mật khẩu không được vượt quá 32 ký tự!"));
                  }
                  
                  const errors = [];
                  
                  // Kiểm tra chữ cái (chữ hoa hoặc chữ thường đều được)
                  if (!/[A-Za-z]/.test(value)) {
                    errors.push("chữ cái");
                  }
                  
                  // Kiểm tra số
                  if (!/[0-9]/.test(value)) {
                    errors.push("số");
                  }
                  
                  // Kiểm tra ký tự đặc biệt
                  if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;',./]/.test(value)) {
                    errors.push("ký tự đặc biệt");
                  }
                  
                  if (errors.length > 0) {
                    const errorMsg = `Mật khẩu phải chứa ít nhất một ${errors.join(", ")}!`;
                    return Promise.reject(new Error(errorMsg));
                  }
                  
                  return Promise.resolve();
                },
              },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Nhập mật khẩu mới (8-32 ký tự, phải có chữ cái, số và ký tự đặc biệt)" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmNewPassword"
            required
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
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

