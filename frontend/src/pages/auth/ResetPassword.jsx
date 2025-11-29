import React from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@assets/images/logo.png";
import { resetPasswordConfirm } from "@services/authService";

const { Title, Text, Link } = Typography;

export default function ResetPassword() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = React.useState(false);

    const step2 = React.useMemo(() => {
        const fromState = location?.state;
        try {
            const fromSession = JSON.parse(sessionStorage.getItem("rpStep2") || "null");
            return fromState || fromSession;
        } catch {
            return fromState || null;
        }
    }, [location?.state]);

    React.useEffect(() => {
        if (!step2?.email || !step2?.otpCode) {
            notification.warning({
                message: "Thiếu thông tin",
                description: "Vui lòng xác nhận OTP trước.",
            });
            navigate("/forgot-password", { replace: true });
        }
    }, [step2, navigate]);

    const trimOnly = (v) => (typeof v === "string" ? v.trim() : v);

    // Hàm chuyển đổi thông báo lỗi sang tiếng Việt
    const translateError = (errorMsg) => {
        if (!errorMsg) return "Đổi mật khẩu thất bại";
        
        const errorMsgLower = errorMsg.toLowerCase();
        
        const errorMap = {
            "invalid password": "Mật khẩu không hợp lệ!",
            "password": "Mật khẩu không đúng định dạng!",
            "otp": "Mã OTP không hợp lệ hoặc đã hết hạn!",
            "expired": "Mã OTP đã hết hạn!",
            "network error": "Lỗi kết nối mạng!",
            "timeout": "Yêu cầu quá thời gian chờ!",
            "server error": "Lỗi máy chủ!",
        };
        
        for (const [key, value] of Object.entries(errorMap)) {
            if (errorMsgLower.includes(key)) {
                return value;
            }
        }
        
        return "Đổi mật khẩu thất bại";
    };

    const onFinish = async ({ newPassword, confirmNewPassword }) => {
        const payload = {
            email: step2.email,
            otpCode: step2.otpCode,
            newPassword: (newPassword || "").trim(),
            confirmNewPassword: (confirmNewPassword || "").trim(),
        };

        setLoading(true);
        try {
            await resetPasswordConfirm(payload);
            sessionStorage.removeItem("rpDraft");
            sessionStorage.removeItem("rpStep2");
            notification.success({
                message: "Đổi mật khẩu thành công",
                description: "Bạn có thể đăng nhập với mật khẩu mới.",
            });
            navigate("/login");
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

            const rawMsg = err?.response?.data?.message || "Đổi mật khẩu thất bại";
            const msg = translateError(rawMsg);
            form.setFields([{ name: "newPassword", errors: [msg] }]);
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
                            Đặt mật khẩu mới
                        </Title>
                        <Text type="secondary">
                            Email: <b>{step2?.email}</b>
                        </Text>
                    </div>

                    {/* Form */}
                    <div style={{ paddingTop: 8 }}>
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                normalize={trimOnly}
                                validateTrigger={['onBlur', 'onChange']}
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
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
                                    placeholder="Nhập mật khẩu mới (8-32 ký tự, phải có chữ cái, số và ký tự đặc biệt)" 
                                    size="large" 
                                />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu"
                                name="confirmNewPassword"
                                dependencies={["newPassword"]}
                                normalize={trimOnly}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("newPassword") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Mật khẩu không khớp"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
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
                                Đổi mật khẩu
                            </Button>

                            <div style={{ textAlign: "center", marginTop: 16 }}>
                                <Text>
                                    Nhớ mật khẩu? <Link href="/login">Đăng nhập</Link>
                                </Text>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div>
        </>
    );
}
