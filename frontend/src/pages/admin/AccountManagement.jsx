import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
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
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import styles from "@shared/styles/AccountManagement.module.css";
import {
  getAllUsers,
  getBannedUsers,
  createUser,
  updateUser,
  banUser,
  unbanUser,
} from "@services/accountManagerService";

const { Option } = Select;
const { TabPane } = Tabs;

const AccountManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [filteredActive, setFilteredActive] = useState([]);
  const [filteredBanned, setFilteredBanned] = useState([]);
  const [loading, setLoading] = useState({ active: false, banned: false });
  const [activeTab, setActiveTab] = useState("active");

  const [searchText, setSearchText] = useState({ active: "", banned: "" });
  const [roleFilter, setRoleFilter] = useState({ active: "all", banned: "all" });
  const [pageSize, setPageSize] = useState({ active: 10, banned: 10 });

  const loadActiveUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, active: true }));
      const res = await getAllUsers();
      if (Array.isArray(res)) {
        const normalized = res
          .filter(item => item.isActive === true || item.status === "Active")
          .map(item => ({
            ...item,
            role: Array.isArray(item.roles) ? item.roles[0] : item.role || "User",
            isActive: true,
          }));
        setActiveUsers(normalized);
        setFilteredActive(normalized);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản hoạt động!");
    } finally {
      setLoading(prev => ({ ...prev, active: false }));
    }
  };

  const loadBannedUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, banned: true }));
      const res = await getBannedUsers();
      if (Array.isArray(res)) {
        const normalized = res.map(item => ({
          ...item,
          role: Array.isArray(item.roles) ? item.roles[0] : item.role || "User",
          isActive: false,
        }));
        setBannedUsers(normalized);
        setFilteredBanned(normalized);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản bị ban!");
    } finally {
      setLoading(prev => ({ ...prev, banned: false }));
    }
  };

  useEffect(() => {
    loadActiveUsers();
    loadBannedUsers();
  }, []);

  const filterData = (type) => {
    const data = type === "active" ? activeUsers : bannedUsers;
    const search = searchText[type] || "";
    const role = roleFilter[type] || "all";

    let filtered = [...data];

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.fullName?.toLowerCase().includes(lower) ||
          item.email?.toLowerCase().includes(lower)
      );
    }

    if (role !== "all") {
      filtered = filtered.filter(item => item.role === role);
    }

    if (type === "active") setFilteredActive(filtered);
    else setFilteredBanned(filtered);
  };

  useEffect(() => {
    filterData(activeTab);
  }, [searchText[activeTab], roleFilter[activeTab], activeUsers, bannedUsers, activeTab]);

  const handleToggleStatus = async (userId, currentActive) => {
    const user = [...activeUsers, ...bannedUsers].find(u => u.id === userId);
    if (user?.role === "Admin") {
      message.warning("Không thể thay đổi trạng thái tài khoản Admin!");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [currentActive ? "active" : "banned"]: true }));
      if (currentActive) {
        await banUser(userId);
        message.success("Đã khóa tài khoản!");
      } else {
        await unbanUser(userId);
        message.success("Đã mở khóa tài khoản!");
      }
      loadActiveUsers();
      loadBannedUsers();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(prev => ({ ...prev, [currentActive ? "active" : "banned"]: false }));
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Normalize dữ liệu khi submit
      const fullName = (values.fullName || "").replace(/\s+/g, " ").trim();
      const email = editingAccount 
        ? editingAccount.email 
        : (values.email || "").trim().toLowerCase();

      const payload = {
        fullName: fullName,
        email: email,
        roles: [values.role],
      };

      if (!editingAccount) {
        payload.password = (values.password || "").trim();
      }

      if (editingAccount && values.newPassword) {
        payload.password = (values.newPassword || "").trim();
      }

      setLoading(prev => ({ ...prev, active: true }));

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
      loadActiveUsers();
      loadBannedUsers();
    } catch (error) {
      if (error.errorFields) return;

      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Lỗi không xác định khi lưu tài khoản!";

      message.error(errMsg);
      console.error("Lỗi lưu tài khoản:", error);
    } finally {
      setLoading(prev => ({ ...prev, active: false }));
    }
  };

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAccount(record);
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      role: record.role,
      newPassword: "",
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAccount(null);
    form.resetFields();
  };

  const handleExport = () => {
    const data = activeTab === "active" ? filteredActive : filteredBanned;
    const status = activeTab === "active" ? "Đang hoạt động" : "Bị ban";

    const headers = ["Tên", "Email", "Role", "Trạng thái", "Ngày tạo"];
    const excelData = data.map(item => [
      item.fullName,
      item.email,
      item.role,
      status,
      item.createdAt ? format(parseISO(item.createdAt), "dd/MM/yyyy HH:mm") : "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `accounts_${status}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    message.success("Xuất Excel thành công!");
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      key: "role",
      render: (_, record) => {
        const role = record.role;
        const colorMap = {
          Admin: "volcano",
          TestCreator: "geekblue",
          Moderator: "purple",
          User: "green",
          Examinee: "orange",
        };
        return <Tag color={colorMap[role] || "default"}>{role || "-"}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isAdmin = record.role === "Admin";

        if (isAdmin) {
          return (
            <Tag color="green" style={{ margin: 0 }}>
              Đang hoạt động
            </Tag>
          );
        }

        return (
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleStatus(record.id, record.isActive)}
            disabled={loading[record.isActive ? "active" : "banned"]}
          />
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => {
        const dateA = a.createdAt ? dayjs(a.createdAt) : null;
        const dateB = b.createdAt ? dayjs(b.createdAt) : null;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.isAfter(dateB) ? -1 : 1;
      },
      render: (text) => (text ? format(parseISO(text), "dd/MM/yyyy HH:mm") : "-"),
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
            disabled={loading[record.isActive ? "active" : "banned"]}
          >
            Sửa
          </Button>
          
        </Space>
      ),
    },
  ];
  const currentData = activeTab === "active" ? filteredActive : filteredBanned;
  const currentLoading = loading[activeTab];
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Spin indicator={loadingIcon} spinning={currentLoading}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quản lý Tài khoản</h1>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={currentLoading}>
              Thêm tài khoản
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={currentLoading || currentData.length === 0}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Tài khoản đang hoạt động (${activeUsers.length})`} key="active">
            <Card className={styles.controlsCard}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm tên, email..."
                    prefix={<SearchOutlined />}
                    value={searchText.active || ""}
                    onChange={(e) => setSearchText(prev => ({ ...prev, active: e.target.value }))}
                    allowClear
                  />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    value={roleFilter.active || "all"}
                    onChange={(val) => setRoleFilter(prev => ({ ...prev, active: val }))}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả Role</Option>
                    <Option value="TestCreator">TestCreator</Option>
                    <Option value="Examinee">Examinee</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            <Table
              columns={columns}
              dataSource={filteredActive}
              rowKey="id"
              pagination={{
                pageSize: pageSize.active,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
                onShowSizeChange: (_, size) => setPageSize(prev => ({ ...prev, active: size })),
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane tab={`Tài khoản bị ban (${bannedUsers.length})`} key="banned">
            <Card className={styles.controlsCard}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Tìm kiếm tên, email..."
                    prefix={<SearchOutlined />}
                    value={searchText.banned || ""}
                    onChange={(e) => setSearchText(prev => ({ ...prev, banned: e.target.value }))}
                    allowClear
                  />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    value={roleFilter.banned || "all"}
                    onChange={(val) => setRoleFilter(prev => ({ ...prev, banned: val }))}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả Role</Option>
                    <Option value="TestCreator">TestCreator</Option>
                    <Option value="Examinee">Examinee</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            <Table
              columns={columns}
              dataSource={filteredBanned}
              rowKey="id"
              pagination={{
                pageSize: pageSize.banned,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
                onShowSizeChange: (_, size) => setPageSize(prev => ({ ...prev, banned: size })),
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>

        <Modal
          title={editingAccount ? "Sửa tài khoản" : "Thêm tài khoản"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Lưu"
          cancelText="Hủy"
          confirmLoading={loading.active}
          destroyOnClose
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="fullName"
              label="Tên đầy đủ"
              validateTrigger={['onBlur']}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) {
                      return Promise.reject(new Error("Vui lòng nhập tên đầy đủ"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input 
                placeholder="Nhập tên đầy đủ"
                onChange={() => {
                  // Xóa lỗi khi đang sửa (nếu có)
                  const errors = form.getFieldsError(['fullName']);
                  if (errors[0]?.errors?.length > 0) {
                    form.setFields([{ name: 'fullName', errors: [] }]);
                  }
                }}
              />
            </Form.Item>

            {!editingAccount && (
              <Form.Item
                name="email"
                label="Email"
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input 
                  placeholder="Nhập email"
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
            )}

            {editingAccount && (
              <Form.Item label="Email">
                <Input value={editingAccount.email} disabled />
              </Form.Item>
            )}

            {!editingAccount && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                validateTrigger={['onBlur']}
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự!" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      // Kiểm tra ký tự đặc biệt
                      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
                      if (specialCharRegex.test(value)) {
                        return Promise.reject(new Error("Mật khẩu không được chứa ký tự đặc biệt!"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['password']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'password', errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    form.validateFields(['fullName', 'email']).catch(() => {});
                  }}
                />
              </Form.Item>
            )}

            {editingAccount && (
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới (để trống nếu không đổi)"
                validateTrigger={['onBlur']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value.length < 6) {
                        return Promise.reject(new Error("Mật khẩu phải ít nhất 6 ký tự!"));
                      }
                      // Kiểm tra ký tự đặc biệt
                      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
                      if (specialCharRegex.test(value)) {
                        return Promise.reject(new Error("Mật khẩu không được chứa ký tự đặc biệt!"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu mới"
                  onChange={() => {
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = form.getFieldsError(['newPassword']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'newPassword', errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate trường trước đó khi focus vào trường này
                    form.validateFields(['fullName']).catch(() => {});
                  }}
                />
              </Form.Item>
            )}

            <Form.Item
              name="role"
              label="Quyền"
              validateTrigger={['onBlur', 'onChange']}
              rules={[{ required: true, message: "Vui lòng chọn role!" }]}
            >
              <Select 
                placeholder="Chọn role"
                onFocus={() => {
                  // Validate các trường trước đó khi focus vào trường này
                  const fieldsToValidate = editingAccount 
                    ? ['fullName'] 
                    : ['fullName', 'email', 'password'];
                  form.validateFields(fieldsToValidate).catch(() => {});
                }}
              >
                <Option value="TestCreator">TestCreator</Option>
                <Option value="Examinee">Examinee</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default AccountManagement;