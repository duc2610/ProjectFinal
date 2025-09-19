import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  DatePicker,
  Select,
  Checkbox,
  Row,
  Col,
  message,
  notification,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import logo from "@assets/images/logo.png";
const { Title, Text, Link } = Typography;
import { useNavigate } from "react-router-dom";
import { register as svcRegister } from "@services/authService";
export default function Register() {
  const [form] = Form.useForm();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const navigate = useNavigate();

  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:3001/posts");
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);
  console.log("cities:", cities);

  const handleCityChange = (value) => {
    setSelectedCityId(value || null);
    const city = cities.find((c) => c?.Id === value);
    const d = city?.Districts ?? [];
    setDistricts(d);
    setWards([]);
    setSelectedDistrictId(null);
    form.setFieldsValue({ district: undefined, ward: undefined });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrictId(value || null);
    const district = districts.find((d) => d?.Id === value);
    const w = district?.Wards ?? [];
    setWards(w);
    form.setFieldsValue({ ward: undefined });
  };

  const onFinish = async (values) => {
    try {
      const res = await svcRegister(values);

      if (res.success) {
        notification.success({
          message: "Đăng ký thành công",
          description: "Bạn đã đăng ký tài khoản thành công.",
        });
        form.resetFields();
        navigate("/login");
        return;
      }

      if (res.errors) {
        form.setFields(
          Object.entries(res.errors).map(([name, msg]) => ({
            name,
            errors: [msg],
          }))
        );
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description: res.message || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Đăng ký thất bại",
        description: error.message,
      });
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
                label="Họ"
                name="lastName"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input placeholder="Nhập họ" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên"
                name="firstName"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email" }]}
              >
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày sinh" name="dob">
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="mm/dd/yyyy"
                  format="MM/DD/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Giới tính" name="gender">
                <Select
                  size="large"
                  placeholder="Chọn giới tính"
                  options={[
                    { label: "Nam", value: "male" },
                    { label: "Nữ", value: "female" },
                    { label: "Khác", value: "other" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Cấp độ giáo dục" name="education">
                <Select
                  size="large"
                  placeholder="Chọn cấp độ"
                  options={[
                    { label: "THPT", value: "highschool" },
                    { label: "Cao đẳng", value: "college" },
                    { label: "Đại học", value: "university" },
                    { label: "Sau đại học", value: "postgrad" },
                  ]}
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
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password placeholder="Nhập mật khẩu" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin địa chỉ</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Tỉnh/Thành phố" name="province">
                <Select
                  showSearch
                  size="large"
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleCityChange}
                  options={(cities ?? []).map((c) => ({
                    label: c?.Name,
                    value: c?.Id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Quận/Huyện" name="district">
                <Select
                  showSearch
                  size="large"
                  placeholder="Chọn quận/huyện"
                  disabled={!selectedCityId}
                  onChange={handleDistrictChange}
                  options={(districts ?? []).map((d) => ({
                    label: d?.Name,
                    value: d?.Id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Phường/Xã" name="ward">
                <Select
                  showSearch
                  size="large"
                  placeholder="Chọn phường/xã"
                  disabled={!selectedDistrictId}
                  options={(wards ?? []).map((w) => ({
                    label: w?.Name,
                    value: w?.Id,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
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
