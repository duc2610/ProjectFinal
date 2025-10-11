import React from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import { verifyRegisterOtp } from "@services/authService";

const { Title, Text, Link } = Typography;

export default function VerifyRegister() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);

  const draft = React.useMemo(() => {
    const fromState = location?.state;
    try {
      const fromSession = JSON.parse(
        sessionStorage.getItem("regDraft") || "null"
      );
      return fromState || fromSession;
    } catch {
      return fromState || null;
    }
  }, [location?.state]);

  React.useEffect(() => {
    if (!draft?.email || !draft?.fullName || !draft?.password) {
      notification.warning({
        message: "Thiếu thông tin đăng ký",
        description: "Vui lòng nhập lại thông tin để nhận mã OTP.",
      });
      navigate("/register", { replace: true });
    }
  }, [draft, navigate]);

  const onFinish = async (values) => {
    const otpCode = (values.otpCode || "").trim();

    const payload = {
      email: draft.email,
      fullName: draft.fullName,
      password: draft.password,
      otpCode,
    };

    setLoading(true);
    try {
      await verifyRegisterOtp(payload);
      sessionStorage.removeItem("regDraft");
      notification.success({
        message: "Đăng ký thành công",
        description: "Bạn có thể đăng nhập ngay bây giờ.",
      });
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn";
      form.setFields([{ name: "otpCode", errors: [msg] }]);
    } finally {
      setLoading(false);
    }
  };

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
          width: 550,
          borderRadius: 16,
          padding: "32px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ padding: "4px 0 16px", textAlign: "center" }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Nhập mã xác nhận để hoàn tất đăng ký
          </Title>
          <Text type="secondary">
            Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Mã xác nhận"
            name="otpCode"
            rules={[{ required: true, message: "Vui lòng nhập mã xác nhận" }]}
          >
            <Input
              placeholder="Nhập mã xác nhận"
              size="large"
              inputMode="numeric"
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
              background: "linear-gradient(90deg, #7b61ff 0%, #3ea1ff 100%)",
              fontWeight: 600,
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            loading={loading}
          >
            Đăng ký
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
      </Card>
    </div>
  );
}
