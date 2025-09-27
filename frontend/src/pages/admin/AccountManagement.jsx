import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, DatePicker, Select, Modal, Space, Tag, Switch, message, Spin, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../../CSS/AccountManagement.module.css';
import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const { Option } = Select;
const { TextArea } = Input;

const AccountManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pageSize, setPageSize] = useState(10);

    // Load data từ localStorage
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem('accounts');
        if (saved) {
            setData(JSON.parse(saved));
        } else {
            // Dữ liệu mẫu nếu chưa có
            const mockData = [
                {
                    key: '1',
                    name: 'Nguyễn Văn A',
                    dob: '1990-01-01',
                    address: '123 Đường ABC, Quận 1, TP.HCM',
                    phone: '0123456789',
                    email: 'nva@example.com',
                    role: 'Admin',
                    status: true,
                },
                {
                    key: '2',
                    name: 'Trần Thị B',
                    dob: '1995-05-15',
                    address: '456 Đường XYZ, Hà Nội',
                    phone: '0987654321',
                    email: 'ttb@example.com',
                    role: 'User ',
                    status: true,
                },
                {
                    key: '3',
                    name: 'Lê Văn C',
                    dob: '1985-12-20',
                    address: '789 Đường DEF, Đà Nẵng',
                    phone: '0111222333',
                    email: 'lvc@example.com',
                    role: 'Moderator',
                    status: false
                },
            ];
            setData(mockData);
            saveData(mockData);
        }
        filterData(); // Áp dụng filter ban đầu
    };

    const saveData = (newData) => {
        localStorage.setItem('accounts', JSON.stringify(newData));
    };

    // Filter data theo search và role
    const filterData = () => {
        let filtered = [...data];
        if (searchText) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.email.toLowerCase().includes(searchText.toLowerCase()) ||
                item.phone.includes(searchText)
            );
        }
        if (roleFilter !== 'all') {
            filtered = filtered.filter(item => item.role === roleFilter);
        }
        setFilteredData(filtered);
    };

    useEffect(() => {
        filterData();
    }, [searchText, roleFilter, data]);

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            responsive: ['sm'],
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dob',
            key: 'dob',
            render: (text) => format(parseISO(text), 'dd/MM/yyyy'),
            sorter: (a, b) => new Date(a.dob) - new Date(b.dob),
            responsive: ['md'],
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            responsive: ['lg'],
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),
            responsive: ['sm'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            responsive: ['md'],
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'Admin' ? 'volcano' : role === 'User ' ? 'geekblue' : 'green'}>
                    {role}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'User ', value: 'User ' },
                { text: 'Moderator', value: 'Moderator' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Switch
                    checked={status}
                    onChange={() => handleToggleStatus(record.key)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    loading={loading}
                    disabled={loading}
                />
            ),
            sorter: (a, b) => Number(a.status) - Number(b.status),
        },
        {
            title: 'Hành động',
            key: 'actions',
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
                        onClick={() => handleDelete([record.key])}
                        size="small"
                        disabled={loading}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
            responsive: ['sm'],
        },
    ];

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleAdd = () => {
        setEditingAccount(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingAccount(record);
        form.setFieldsValue({
            name: record.name,
            dob: dayjs(record.dob),
            address: record.address,
            phone: record.phone,
            email: record.email,
            role: record.role,
            status: record.status,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (keys) => {
        if (keys.length === 0) return;
        Modal.confirm({
            title: `Xác nhận xóa ${keys.length > 1 ? `${keys.length} tài khoản` : 'tài khoản'}?`,
            content: 'Dữ liệu sẽ bị xóa vĩnh viễn.',
            onOk: async () => {
                setLoading(true);
                await delay(1000);
                const newData = data.filter((item) => !keys.includes(item.key));
                setData(newData);
                saveData(newData);
                setSelectedRowKeys([]);
                message.success(`Đã xóa ${keys.length} tài khoản.`);
                setLoading(false);
            },
        });
    };

    const handleToggleStatus = async (key) => {
        setLoading(true);
        await delay(500);
        const newData = data.map((item) =>
            item.key === key ? { ...item, status: !item.status } : item
        );
        setData(newData);
        saveData(newData);
        message.success('Cập nhật trạng thái thành công.');
        setLoading(false);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Kiểm tra ngày sinh hợp lệ
            if (!dayjs.isDayjs(values.dob) || !values.dob.isValid()) {
                message.error('Ngày sinh không hợp lệ!');
                return;
            }

            // Kiểm tra duplicate (trừ chính record đang edit)
            const isDuplicate = data.some(item =>
                item.key !== editingAccount?.key &&
                (item.email === values.email || item.phone === values.phone)
            );
            if (isDuplicate) {
                message.error('Email hoặc SĐT đã tồn tại!');
                return;
            }

            setLoading(true);
            await delay(1000);

            const newAccount = {
                ...values,
                dob: values.dob.format('YYYY-MM-DD'),
                status: values.status !== undefined ? values.status : true,
                key: editingAccount ? editingAccount.key : Date.now().toString(),
            };

            let newData;
            if (editingAccount) {
                newData = data.map((item) => (item.key === editingAccount.key ? newAccount : item));
                message.success('Cập nhật tài khoản thành công.');
            } else {
                newData = [...data, newAccount];
                message.success('Thêm tài khoản thành công.');
            }
            setData(newData);
            saveData(newData);
            setIsModalVisible(false);
            form.resetFields();
            setEditingAccount(null);
            setLoading(false);
        } catch (error) {
            console.error('Validation error:', error);
            message.error('Lỗi validation hoặc dữ liệu không hợp lệ.');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingAccount(null);
        form.resetFields();
    };

    // Export Excel
    const handleExport = () => {
        const headers = ['Tên', 'Ngày sinh', 'Địa chỉ', 'SĐT', 'Email', 'Role', 'Trạng thái'];

        const data = filteredData.map(item => [
            item.name,
            format(parseISO(item.dob), 'dd/MM/yyyy'),
            item.address,
            item.phone,
            item.email,
            item.role,
            item.status ? 'Active' : 'Inactive',
        ]);

        // Gộp header + data
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Auto-width cho cột
        const colWidths = headers.map((h, i) => ({
            wch: Math.max(
                h.length,
                ...data.map(row => (row[i] ? row[i].toString().length : 0))
            ) + 2
        }));
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `accounts_${dayjs().format("YYYY-MM-DD")}.xlsx`);

        message.success("Xuất file Excel thành công.");
    };


    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleRoleFilter = (value) => {
        setRoleFilter(value);
    };

    return (
        <Spin spinning={loading}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Quản lý Tài khoản Admin</h1>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            size="large"
                            className={styles.addButton}
                            disabled={loading}
                        >
                            Thêm Tài khoản
                        </Button>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                            className={styles.exportButton}
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
                                onChange={handleSearchChange}
                                allowClear
                                className={styles.searchInput}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Lọc theo Role"
                                onChange={handleRoleFilter}
                                style={{ width: '100%' }}
                                value={roleFilter}
                                allowClear
                            >
                                <Option value="all">Tất cả</Option>
                                <Option value="Admin">Admin</Option>
                                <Option value="User ">User </Option>
                                <Option value="Moderator">Moderator</Option>
                            </Select>
                        </Col>
                        {selectedRowKeys.length > 0 && (
                            <Col xs={24} sm={24} md={10}>
                                <Space>
                                    <span className={styles.selectedText}>{selectedRowKeys.length} mục được chọn</span>
                                    <Button danger onClick={() => handleDelete(selectedRowKeys)} disabled={loading}>
                                        Xóa mục đã chọn
                                    </Button>
                                </Space>
                            </Col>
                        )}
                    </Row>
                </Card>

                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        pageSize,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
                        onShowSizeChange: (current, size) => setPageSize(size),
                        style: { marginRight: 16 }
                    }}
                    scroll={{ x: 1200 }}
                    loading={loading}
                    className={styles.table}
                    rowKey="key"
                />

                <Modal
                    title={editingAccount ? 'Sửa Tài khoản' : 'Thêm Tài khoản'}
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="Lưu"
                    cancelText="Hủy"
                    width={600}
                    className={styles.modal}
                    confirmLoading={loading} // Loading khi save
                    destroyOnClose // Reset form khi đóng modal
                >
                    <Form form={form} layout="vertical" name="accountForm">
                        <Form.Item
                            name="name"
                            label="Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input placeholder="Nhập tên đầy đủ" />
                        </Form.Item>

                        <Form.Item
                            name="dob"
                            label="Ngày sinh"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày sinh!' },
                                {
                                    validator: (_, value) => {
                                        if (value && value.isAfter(dayjs(), 'day')) {
                                            return Promise.reject('Ngày sinh không thể là ngày tương lai!');
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <TextArea rows={2} placeholder="Nhập địa chỉ chi tiết" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="SĐT"
                            rules={[
                                { required: true, message: 'Vui lòng nhập SĐT!' },
                                { pattern: /^[0-9]{10,11}$/, message: 'SĐT phải là 10-11 số!' },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[{ required: true, message: 'Vui lòng chọn role!' }]}
                        >
                            <Select placeholder="Chọn role">
                                <Option value="Admin">Admin</Option>
                                <Option value="User ">User </Option>
                                <Option value="Moderator">Moderator</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Spin>
    );
};

export default AccountManagement;