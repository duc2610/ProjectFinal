import React from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import { verifyResetOtp } from "@services/authService";

const { Title, Text, Link } = Typography;

export default function VerifyReset() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = React.useState(false);

    const draft = React.useMemo(() => {
        const fromState = location?.state;
        try {
            const fromSession = JSON.parse(sessionStorage.getItem("rpDraft") || "null");
            return fromState || fromSession;
        } catch {
            return fromState || null;
        }
    }, [location?.state]);

    React.useEffect(() => {
        if (!draft?.email) {
            notification.warning({
                message: "Thiếu email",
                description: "Vui lòng nhập email trước để nhận OTP.",
            });
            navigate("/forgot-password", { replace: true });
        }
    }, [draft, navigate]);

    const onFinish = async (values) => {
        const otpCode = (values.otpCode || "").trim();
        setLoading(true);
        try {
            await verifyResetOtp({ email: draft.email, otpCode });
            sessionStorage.setItem("rpStep2", JSON.stringify({ email: draft.email, otpCode }));
            notification.success({
                message: "Xác nhận thành công",
                description: "Vui lòng đặt mật khẩu mới.",
            });
            navigate("/reset-password", { state: { email: draft.email, otpCode } });
        } catch (err) {
            const msg = err?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn";
            form.setFields([{ name: "otpCode", errors: [msg] }]);
        } finally {
            setLoading(false);
        }
    };

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
                >
                    {/* Header */}
                    <div style={{ padding: "28px 0 8px", textAlign: "center" }}>
                        <Title level={3} style={{ marginBottom: 4 }}>
                            Nhập mã xác nhận
                        </Title>
                        <Text type="secondary">
                            Mã OTP đã được gửi tới email: <b>{draft?.email}</b>
                        </Text>
                    </div>

                    {/* Form */}
                    <div style={{ paddingTop: 8 }}>
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item
                                label="Mã xác nhận"
                                name="otpCode"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mã xác nhận" },
                                ]}
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
                                    background:
                                        "linear-gradient(90deg, #7b61ff 0%, #3ea1ff 100%)",
                                    fontWeight: 600,
                                }}
                                icon={<ArrowRightOutlined />}
                                iconPosition="end"
                                loading={loading}
                            >
                                Tiếp tục
                            </Button>

                            <div style={{ textAlign: "center", marginTop: 16 }}>
                                <Text>
                                    <Link href="/forgot-password">Quay trở lại nhập email</Link>
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
