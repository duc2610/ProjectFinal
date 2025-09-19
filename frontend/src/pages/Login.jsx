import React from "react";
import { Card, Form, Input, Button, Typography, Divider } from "antd";
import { GoogleOutlined, FacebookOutlined } from "@ant-design/icons";

const { Title, Text, Link } = Typography;

export default function Login() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
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
          <img
            src="/asset/img/logo.png"
            alt="logo"
            style={{ width: 60, marginBottom: 12 }}
          />
          <Title level={3} style={{ marginBottom: 4 }}>
            Welcome back
          </Title>
          <Text type="secondary">Sign in to continue to HMS System</Text>
        </div>

        {/* Form */}
        <Form layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input placeholder="Enter email" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          <div style={{ textAlign: "end", marginBottom: 12 }}>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <Button
            type="primary"
            block
            size="large"
            style={{
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              border: "none",
              fontWeight: 600,
            }}
          >
            Login
          </Button>

          <Divider>Or continue with</Divider>

          <Button
            icon={<GoogleOutlined />}
            block
            size="large"
            style={{ marginBottom: 12 }}
          >
            Sign in with Google
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Don’t have an account? <Link href="/register">Sign up</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
