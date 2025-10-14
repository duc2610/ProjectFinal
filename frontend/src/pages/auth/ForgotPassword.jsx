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
            const msg = e?.response?.data?.message || "Yêu cầu thất bại";
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
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                    {
                        validator: (_, v) =>
                            v && /\s/.test(v)
                                ? Promise.reject(
                                    new Error("Email không được chứa khoảng trắng")
                                )
                                : Promise.resolve(),
                    },
                    {
                        pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: "Email không hợp lệ",
                    },
                ]}
              >
                <Input placeholder="Nhập email" size="large" />
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
