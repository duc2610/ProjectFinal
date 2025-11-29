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

  // Hàm chuyển đổi thông báo lỗi sang tiếng Việt
  const translateError = (errorMsg) => {
    if (!errorMsg) return "Gửi OTP thất bại";
    
    const errorMsgLower = errorMsg.toLowerCase();
    
    const errorMap = {
      "email": "Email đã tồn tại trong hệ thống!",
      "email already exists": "Email đã tồn tại trong hệ thống!",
      "user already exists": "Người dùng đã tồn tại!",
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
    
    return "Gửi OTP thất bại";
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
      // Kiểm tra xem có phải lỗi validation từ backend không
      const isValidationError = 
        err.response?.status === 400 && 
        (err.response?.data?.errors || 
         err.response?.data?.title?.toLowerCase().includes("validation") ||
         err.response?.data?.message?.toLowerCase().includes("validation"));
      
      // Nếu là lỗi validation từ backend, không hiển thị cho user
      if (isValidationError) {
        console.error("Lỗi validation từ backend (không hiển thị):", err.response?.data);
        return;
      }

      const rawMsg = err?.response?.data?.message || "Gửi OTP thất bại";
      const msg = translateError(rawMsg);
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
                validateTrigger={['onBlur', 'onChange']}
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
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
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu (8-32 ký tự, phải có chữ cái, số và ký tự đặc biệt)" 
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
