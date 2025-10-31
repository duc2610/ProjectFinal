import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Modal,
  Space,
  Tag,
  Switch,
  message,
  Spin,
  Row,
  Col,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import styles from "@shared/styles/AccountManagement.module.css";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
  unbanUser,
} from "@services/accountManagerService"; // ✅ import service API

const { Option } = Select;
const { TextArea } = Input;

const AccountManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Lấy danh sách user từ API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      if (Array.isArray(res)) {
        // backend có thể trả thêm metadata => chỉ lấy danh sách
        setData(res);
        setFilteredData(res);
      } else {
        message.warning("Không lấy được danh sách người dùng.");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Lọc data (search + role)
  const filterData = () => {
    let filtered = [...data];
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.phoneNumber?.includes(searchText)
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((item) => item.role === roleFilter);
    }
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [searchText, roleFilter, data]);

  // ✅ Toggle trạng thái (ban/unban)
  const handleToggleStatus = async (userId, isActive) => {
    try {
      setLoading(true);
      if (isActive) {
        await banUser(userId);
        message.success("Đã khóa tài khoản!");
      } else {
        await unbanUser(userId);
        message.success("Đã mở khóa tài khoản!");
      }
      loadUsers();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Thêm hoặc cập nhật tài khoản
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!dayjs.isDayjs(values.dob) || !values.dob.isValid()) {
        message.error("Ngày sinh không hợp lệ!");
        return;
      }

      const payload = {
        fullName: values.name,
        dateOfBirth: values.dob.format("YYYY-MM-DD"),
        address: values.address,
        phoneNumber: values.phone,
        email: values.email,
        role: values.role,
      };

      setLoading(true);
      if (editingAccount) {
        await updateUser(editingAccount.id, payload);
        message.success("Cập nhật tài khoản thành công!");
      } else {
        await createUser(payload);
        message.success("Thêm tài khoản thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingAccount(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lưu tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mở modal thêm mới
  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ✅ Mở modal chỉnh sửa
  const handleEdit = (record) => {
    setEditingAccount(record);
    form.setFieldsValue({
      name: record.fullName,
      dob: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      address: record.address,
      phone: record.phoneNumber,
      email: record.email,
      role: record.role,
      status: record.isActive,
    });
    setIsModalVisible(true);
  };

  // ✅ Xóa tài khoản
  const handleDelete = async (ids) => {
    Modal.confirm({
      title: `Xác nhận xóa ${ids.length > 1 ? `${ids.length} tài khoản` : "tài khoản"}?`,
      content: "Dữ liệu sẽ bị xóa vĩnh viễn.",
      onOk: async () => {
        try {
          setLoading(true);
          // API chưa có delete => có thể implement thêm trong backend nếu cần
          message.info("Tính năng xóa chưa khả dụng từ API!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAccount(null);
    form.resetFields();
  };

  // ✅ Cấu hình bảng
  const columns = [
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "name",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dob",
      render: (text) => (text ? format(parseISO(text), "dd/MM/yyyy") : "-"),
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={
            role === "Admin"
              ? "volcano"
              : role === "User"
              ? "geekblue"
              : "green"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "status",
      render: (status, record) => (
        <Switch
          checked={status}
          onChange={() => handleToggleStatus(record.id, status)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          disabled={loading}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            disabled={loading}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete([record.id])}
            size="small"
            disabled={loading}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ✅ Export Excel
  const handleExport = () => {
    const headers = [
      "Tên",
      "Ngày sinh",
      "Địa chỉ",
      "SĐT",
      "Email",
      "Role",
      "Trạng thái",
    ];
    const excelData = filteredData.map((item) => [
      item.fullName,
      item.dateOfBirth ? format(parseISO(item.dateOfBirth), "dd/MM/yyyy") : "",
      item.address,
      item.phoneNumber,
      item.email,
      item.role,
      item.isActive ? "Active" : "Inactive",
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `accounts_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    message.success("Xuất Excel thành công!");
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quản lý Tài khoản</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={loading}
            >
              Thêm tài khoản
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={loading}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>

        <Card className={styles.controlsCard}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên, email, SĐT"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="Admin">Admin</Option>
                <Option value="User">User</Option>
                <Option value="Moderator">Moderator</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} tài khoản`,
            onShowSizeChange: (_, size) => setPageSize(size),
          }}
          scroll={{ x: 1200 }}
        />

        {/* Modal thêm/sửa */}
        <Modal
          title={editingAccount ? "Sửa tài khoản" : "Thêm tài khoản"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input placeholder="Nhập tên đầy đủ" />
            </Form.Item>
            <Form.Item
              name="dob"
              label="Ngày sinh"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <TextArea rows={2} placeholder="Nhập địa chỉ chi tiết" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="SĐT"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT!" },
                { pattern: /^[0-9]{10,11}$/, message: "SĐT phải là 10-11 số!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Vui lòng chọn role!" }]}
            >
              <Select placeholder="Chọn role">
                <Option value="Admin">Admin</Option>
                <Option value="User">User</Option>
                <Option value="Moderator">Moderator</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default AccountManagement;
