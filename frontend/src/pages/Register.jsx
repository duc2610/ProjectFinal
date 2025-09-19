import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text, Link } = Typography;

export default function Register() {
  const [form] = Form.useForm();
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState(0);

  // Kiểm tra strength theo rule đơn giản
  const checkStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setLevel(checkStrength(value));
    form.validateFields(["confirmPassword"]);
  };

  const getLevelText = () => {
    switch (level) {
      case 0:
        return { text: "Very Weak", color: "red" };
      case 1:
        return { text: "Weak", color: "orangered" };
      case 2:
        return { text: "Medium", color: "orange" };
      case 3:
        return { text: "Strong", color: "green" };
      case 4:
        return { text: "Very Strong", color: "darkgreen" };
      default:
        return { text: "", color: "" };
    }
  };

  const onFinish = (values) => {
    console.log("Register form values:", values);
  };

  const levelInfo = getLevelText();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)",
        padding: 16,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          padding: "32px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>Create an Account</Title>
          <Text type="secondary">Sign up to start using HMS System</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name!" }]}
          >
            <Input placeholder="Enter your full name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Password&nbsp;
                <Tooltip title="Ít nhất 6 ký tự, có chữ hoa, số và ký tự đặc biệt.">
                  <InfoCircleOutlined style={{ color: "#999" }} />
                </Tooltip>
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              size="large"
              value={password}
              onChange={handlePasswordChange}
            />
          </Form.Item>

          {/* Thanh strength 4 nấc */}
          {password && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  height: 8,
                  display: "flex",
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: 4,
                      backgroundColor:
                        i <= level ? getLevelText().color : "rgba(0,0,0,0.1)",
                    }}
                  />
                ))}
              </div>
              <Text
                type="secondary"
                style={{ fontSize: 12, color: levelInfo.color }}
              >
                {levelInfo.text}
              </Text>
            </div>
          )}

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            style={{
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              border: "none",
              fontWeight: 600,
            }}
          >
            Register
          </Button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text>
              Already have an account? <Link href="/login">Login</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
