import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Checkbox,
  Row,
  Col,
  notification,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import logo from "@assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { register as registerService } from "@services/authService";

const { Title, Text, Link } = Typography;

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const collapseSpaces = (s) => {
    if (typeof s !== "string") return s;
    // Chỉ collapse nhiều khoảng trắng thành một, không trim khi đang gõ
    return s.replace(/\s+/g, " ");
  };

  const onFinish = async (values) => {
    // Chỉ normalize và trim khi submit
    const fullName = (values.fullName || "").replace(/\s+/g, " ").trim();
    const email = (values.email || "").trim().toLowerCase();
    const password = (values.password || "").trim();

    const payload = { fullName, email, password };

    try {
      await registerService(payload);
      notification.success({
        message: "Đã gửi mã OTP",
        description: "Vui lòng kiểm tra email để lấy mã xác thực.",
      });
      sessionStorage.setItem("regDraft", JSON.stringify(payload));
      navigate("/verify-register", { state: payload });
    } catch (err) {
      const msg = err?.response?.data?.message || "Gửi OTP thất bại";
      form.setFields([{ name: "email", errors: [msg] }]);
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
          width: 750,
          borderRadius: 16,
          padding: "32px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Đăng ký tài khoản
          </Title>
          <Text type="secondary">Tạo tài khoản mới để sử dụng dịch vụ</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider orientation="left">Thông tin cá nhân</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên" },
                  {
                    validator: (_, value) => {
                      if (!value || !value.trim()) {
                        return Promise.reject("Họ và tên không hợp lệ");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input 
                  placeholder="Nhập họ và tên" 
                  size="large"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['fullName']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'fullName', errors: [] }]);
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                normalize={(v) => (v ? v.trim() : v)}
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input 
                  placeholder="Nhập email" 
                  size="large"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['email']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'email', errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate trường trước đó khi focus vào trường này
                    form.validateFields(['fullName']).catch(() => {});
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Bảo mật</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mật khẩu"
                name="password"
                normalize={(v) => (v ? v.trim() : v)}
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                    message:
                      "Phải có ít nhất 1 chữ và 1 số; chỉ gồm chữ và số (không khoảng trắng/ký tự đặc biệt)",
                  },
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu" 
                  size="large"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['password']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'password', errors: [] }]);
                    }
                    // Xóa lỗi của confirmPassword nếu có (vì password thay đổi)
                    const confirmErrors = form.getFieldsError(['confirmPassword']);
                    if (confirmErrors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'confirmPassword', errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    form.validateFields(['fullName', 'email']).catch(() => {});
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Nhập lại mật khẩu" 
                  size="large"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['confirmPassword']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'confirmPassword', errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    form.validateFields(['fullName', 'email', 'password']).catch(() => {});
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="accept"
            valuePropName="checked"
            rules={[
              {
                validator: (_, v) =>
                  v
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Cần đồng ý điều khoản & bảo mật")
                      ),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noreferrer">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">
                Chính sách bảo mật
              </a>
              .
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{
              height: 44,
              border: "none",
              background: "linear-gradient(90deg, #7b61ff 0%, #3ea1ff 100%)",
              fontWeight: 600,
              width: "100%",
            }}
            icon={<ArrowRightOutlined />}
          >
            Đăng ký
          </Button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text>
              Bạn đã có tài khoản? <Link href="/login">Đăng nhập</Link>
            </Text>
            <br />
            <Text>
              Quên mật khẩu?{" "}
              <Link href="/forgot-password">Đặt lại tại đây</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
