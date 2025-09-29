import React, { useRef, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  notification,
} from "antd";
import { GoogleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Title, Text, Link } = Typography;
import { useAuth } from "@shared/hooks/useAuth";
import logo from "@assets/images/logo.png";
import { useGoogleLogin } from "@react-oauth/google";
export default function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { signIn, signInWithGoogle, loading } = useAuth();
  const handleLogin = async (values) => {
    const { email, password } = values;
    try {
      const res = await signIn(email, password);
      if (res.ok) {
        notification.success({
          message: "Đăng nhập thành công",
          description: "Chào mừng bạn trở lại!",
          duration: 5,
        });
        navigate("/");
      } else {
        const msg = res?.message || "Email hoặc mật khẩu không đúng";
        form.setFields([
          { name: "email", errors: [msg] },
          { name: "password", errors: [msg] },
        ]);
      }
    } catch (error) {
      const beMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Đã có lỗi xảy ra, vui lòng thử lại sau.";
      notification.error({
        message: "Đăng nhập thất bại",
        description: beMsg,
        duration: 5,
      });
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await signInWithGoogle(response.code);
        if (res.ok) {
          notification.success({
            message: "Đăng nhập thành công",
            description: `Xin chào ${res.user.fullname}`,
          });
          navigate("/");
        } else {
          notification.error({
            message: "Đăng nhập Google thất bại",
            description: res.message || "Có lỗi xảy ra, vui lòng thử lại",
          });
        }
      } catch (err) {
        notification.error({
          message: "Đăng nhập Google thất bại",
          description: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
        });
      }
    },
    flow: "auth-code",
  });
  return (
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
        <div style={{ padding: "28px 28px 8px", textAlign: "center" }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Chào mừng trở lại
          </Title>
          <Text type="secondary">Đăng nhập vào tài khoản của bạn</Text>
        </div>

        <div style={{ padding: "0 28px 24px" }}>
          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                },
              ]}
            >
              <Input placeholder="Nhập email của bạn" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ marginRight: 230 }}>Mật khẩu</span>
                  <a href="/forgot-password">Quên mật khẩu?</a>
                </div>
              }
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Enter your password" size="large" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                height: 44,
                border: "none",
                background: "linear-gradient(90deg, #7b61ff 0%, #3ea1ff 100%)",
                fontWeight: 600,
              }}
              icon={<ArrowRightOutlined />}
              loading={loading}
              iconPosition="end"
            >
              Đăng nhập
            </Button>

            <Divider plain style={{ margin: "20px 0" }}>
              HOẶC TIẾP TỤC VỚI
            </Divider>

            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              style={{
                height: 44,
                background: "#fff",
                borderColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onClick={() => googleLogin()}
            >
              Tiếp tục với Google
            </Button>

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
  );
}
