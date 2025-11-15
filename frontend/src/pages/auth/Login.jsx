import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  notification,
} from "antd";
import { GoogleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
const { Title, Text, Link } = Typography;
import { useAuth } from "@shared/hooks/useAuth";
import logo from "@assets/images/logo.png";
import { useGoogleLogin } from "@react-oauth/google";
import { ROLES } from "@shared/utils/acl";
import styles from "@shared/styles/Auth.module.css";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { signIn, signInWithGoogle, loading } = useAuth();
  const redirectAfterLogin = (user) => {
    const returnTo = location.state?.returnTo;
    if (returnTo) return navigate(returnTo, { replace: true });
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (roles.includes(ROLES.Admin))
      return navigate("/admin/dashboard", { replace: true });
    if (roles.includes(ROLES.TestCreator))
      return navigate("/test-creator/dashboard", { replace: true });
    return navigate("/", { replace: true });
  };
  const handleLogin = async (values) => {
    const { email, password } = values;
    try {
      const res = await signIn(email, password);
      if (res.ok) {
        notification.success({
          message: "Đăng nhập thành công",
          description: `Xin chào ${res.user?.fullName}`,
          duration: 5,
        });
        redirectAfterLogin(res.user);
      } else {
        const msg = res?.message || "Email hoặc mật khẩu không đúng";
        
        // Hiển thị notification error
        notification.error({
          message: "Đăng nhập thất bại",
          description: msg,
          duration: 5,
          placement: "top",
        });
        
        // Set errors vào form fields
        form.setFields([
          { name: "email", errors: [msg] },
          { name: "password", errors: [msg] },
        ]);
        
        // Xóa password để người dùng nhập lại
        form.setFieldsValue({ password: "" });
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
        placement: "top",
      });
      
      // Set errors vào form fields
      form.setFields([
        { name: "email", errors: [beMsg] },
        { name: "password", errors: [beMsg] },
      ]);
      
      // Xóa password để người dùng nhập lại
      form.setFieldsValue({ password: "" });
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await signInWithGoogle(response.code);
        if (res.ok) {
          notification.success({
            message: "Đăng nhập thành công",
            description: `Xin chào ${res.user?.fullName}`,
          });
          redirectAfterLogin(res.user);
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
    <div className={styles.authContainer}>
      <img src={logo} alt="Logo" className={styles.authLogo} />
      <Card
        className={styles.authCard}
        bodyStyle={{ padding: 0 }}
      >
        <div className={styles.authHeader}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Chào mừng trở lại
          </Title>
          <Text type="secondary">Đăng nhập vào tài khoản của bạn</Text>
        </div>

        <div className={styles.authForm}>
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
                  style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}
                >
                  <span>Mật khẩu</span>
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
              className={styles.authButton}
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
              className={styles.googleButton}
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
