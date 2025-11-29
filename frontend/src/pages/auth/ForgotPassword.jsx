import React from "react";
import {Card, Form, Input, Button, Typography, Divider, notification} from "antd";
import { GoogleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import logo from "@assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import {sendOTP} from "@services/authService";
const { Title, Text, Link } = Typography;
export default function ForgotPassword() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const trimOnly = (v) => (typeof v === "string" ? v.trim() : v);
    // Hàm chuyển đổi thông báo lỗi sang tiếng Việt
    const translateError = (errorMsg) => {
        if (!errorMsg) return "Yêu cầu thất bại";
        
        const errorMsgLower = errorMsg.toLowerCase();
        
        const errorMap = {
            "email": "Email không tồn tại trong hệ thống!",
            "user not found": "Email không tồn tại trong hệ thống!",
            "invalid email": "Email không hợp lệ!",
            "network error": "Lỗi kết nối mạng!",
            "timeout": "Yêu cầu quá thời gian chờ!",
            "server error": "Lỗi máy chủ!",
        };
        
        for (const [key, value] of Object.entries(errorMap)) {
            if (errorMsgLower.includes(key)) {
                return value;
            }
        }
        
        return "Yêu cầu thất bại";
    };

    const onFinish = async (values) => {
        const email = (values.email || "").trim();
        setLoading(true);
        try {
            await sendOTP({email});
            notification.success({
                message: "Đã gửi OTP",
                description: "Vui lòng kiểm tra email để nhận mã OTP.",
            });
            sessionStorage.setItem("rpDraft", JSON.stringify({ email }));
            navigate("/verify-reset", {state: {email}
            })
        }catch (e) {
            // Kiểm tra xem có phải lỗi validation từ backend không
            const isValidationError = 
                e.response?.status === 400 && 
                (e.response?.data?.errors || 
                 e.response?.data?.title?.toLowerCase().includes("validation") ||
                 e.response?.data?.message?.toLowerCase().includes("validation"));
            
            // Nếu là lỗi validation từ backend, không hiển thị cho user
            if (isValidationError) {
                console.error("Lỗi validation từ backend (không hiển thị):", e.response?.data);
                return;
            }

            const rawMsg = e?.response?.data?.message || "Yêu cầu thất bại";
            const msg = translateError(rawMsg);
            form.setFields([{ name: "email", errors: [msg] }]);
        }finally {
            setLoading(false);
        }
    }
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7fb",
          padding: 16,
        }}
      >
        <img src={logo} alt="Logo" style={{ height: 90, margin: 16 }} />
        <Card
          style={{
            width: 520,
            borderRadius: 16,
            padding: "32px 24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Header */}
          <div style={{ padding: "28px 28px 8px", textAlign: "center" }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Đặt lại mật khẩu
            </Title>
            <Text type="secondary">
              Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại
            </Text>
          </div>

          {/* Form */}
          <div style={{ padding: "0 28px 24px" }}>
              <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                normalize={trimOnly}
                validateTrigger={['onBlur', 'onChange']}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Email không đúng định dạng! Ví dụ: example@gmail.com",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const trimmed = value.trim();
                      if (trimmed !== value) {
                        return Promise.reject(new Error("Email không được có khoảng trắng ở đầu hoặc cuối!"));
                      }
                      if (trimmed.length > 254) {
                        return Promise.reject(new Error("Email không được vượt quá 254 ký tự!"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input 
                  type="email"
                  placeholder="Nhập email (ví dụ: example@gmail.com)" 
                  size="large" 
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  height: 44,
                  border: "none",
                  background:
                    "linear-gradient(90deg, #7b61ff 0%, #3ea1ff 100%)",
                  fontWeight: 600,
                }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Gửi OTP
              </Button>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text>
                  <Link href="/login">Quay trở lại với đăng nhập</Link>
                </Text>
              </div>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text>
                  Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
                </Text>
              </div>

              <div style={{ textAlign: "center", marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Khi nhấp tiếp tục, bạn đồng ý với{" "}
                  <a href="/terms">Điều khoản dịch vụ</a> và{" "}
                  <a href="/privacy">Chính sách bảo mật</a>.
                </Text>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </>
  );
}
