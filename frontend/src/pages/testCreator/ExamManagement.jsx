import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Space, Tag, Switch, message, Tooltip, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { 
    getTests, 
    hideTest, 
    publishTest,
} from "@services/testsService";
import TestTypeSelectionModal from "@shared/components/ExamManagement/TestTypeSelectionModal";
import FromBankTestForm from "@shared/components/ExamManagement/FromBankTestForm";

export default function ExamManagement() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [testTypeModalOpen, setTestTypeModalOpen] = useState(false);
    const [fromBankFormOpen, setFromBankFormOpen] = useState(false);
    const [manualFormOpen, setManualFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [searchExam, setSearchExam] = useState("");
    const [filterSkill, setFilterSkill] = useState("all");
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchExams = async (page = 1, pageSize = 10, search = "", skill = "all") => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize,
                keyword: search || undefined,
                testSkill: skill !== "all" ? skill : undefined,
            };
            const response = await getTests(params);
            
            
            if (response?.success && response?.data) {
                const { dataPaginated, currentPage, pageSize: size, totalCount } = response.data;
                setExams(dataPaginated || []);
                setPagination({
                    current: currentPage,
                    pageSize: size,
                    total: totalCount,
                });
            } else {
                message.error("Không thể tải dữ liệu bài thi");
            }
        } catch (error) {
            console.error("Error fetching tests:", error);
            message.error("Lỗi khi tải dữ liệu: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill);
        
        // Cleanup timeout khi component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    const handleTableChange = (newPagination) => {
        fetchExams(newPagination.current, newPagination.pageSize, searchExam, filterSkill);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchExam(value);
        
        // Clear timeout cũ
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Tạo timeout mới để debounce search
        const newTimeout = setTimeout(() => {
            setPagination({ ...pagination, current: 1 });
            fetchExams(1, pagination.pageSize, value, filterSkill);
        }, 500); // Delay 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilterChange = (skill) => {
        setFilterSkill(skill);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, skill);
    };

    const openCreateExam = () => { 
        setTestTypeModalOpen(true);
    };
    
    const handleSelectTestType = (type) => {
        setTestTypeModalOpen(false);
        if (type === "manual") {
            setManualFormOpen(true);
        } else if (type === "fromBank") {
            setFromBankFormOpen(true);
        }
    };
    
    const openEditExam = (exam) => { 
        setEditingExam(exam); 
        // TODO: Determine test type from exam data and open appropriate form
        message.info("Đang phát triển: Chỉnh sửa bài thi");
    };

    const handleTestCreated = () => {
        // Sau khi tạo bài thi thành công, reload danh sách
        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill);
    };

    // toggle test status (Active/Inactive)
    const toggleTestStatus = async (testId, currentStatus) => {
        try {
            // If currently active, hide it. Otherwise, publish it
            if (currentStatus === "Active") {
                await hideTest(testId);
                message.success("Đã ẩn bài thi");
            } else {
                await publishTest(testId);
                message.success("Đã công khai bài thi");
            }
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill);
        } catch (error) {
            console.error("Toggle status error:", error);
            message.error("Lỗi khi cập nhật trạng thái");
        }
    };

    const examColumns = [
        { 
            title: "ID", 
            dataIndex: "id", 
            key: "id", 
            width: 50,
            align: "center",
        },
        { 
            title: "Loại bài thi", 
            dataIndex: "testType", 
            key: "testType",
            width: 130,
            render: (type) => {
                const color = type === "Simulator" ? "blue" : "orange";
                return <Tag color={color}>{type}</Tag>;
            }
        },
        { 
            title: "Kỹ năng", 
            dataIndex: "testSkill", 
            key: "testSkill",
            width: 150,
            render: (skill) => {
                const color = skill === "LR" ? "purple" : skill === "Speaking" ? "green" : "cyan";
                const label = skill === "LR" ? "Listening & Reading" : skill;
                return <Tag color={color}>{label}</Tag>;
            }
        },
        { 
            title: "Tiêu đề", 
            dataIndex: "title", 
            key: "title",
            width: 150,
            ellipsis: true,
        },
        { 
            title: "Thời lượng", 
            dataIndex: "duration", 
            key: "duration", 
            width: 120,
            align: "center",
            render: d => `${d} phút` 
        },
        { 
            title: "Số câu hỏi", 
            dataIndex: "questionQuantity", 
            key: "questionQuantity", 
            width: 120,
            align: "center",
        },
        { 
            title: "Trạng thái", 
            key: "status", 
            width: 160,
            align: "center",
            render: (_, rec) => {
                const statusColorMap = {
                    "Active": "success",
                    "Draft": "warning",
                    "Inactive": "default"
                };
                const statusLabelMap = {
                    "Active": "Đang hoạt động",
                    "Draft": "Bản nháp",
                    "Inactive": "Đã ẩn"
                };
                return (
                    <Space>
                        <Tag color={statusColorMap[rec.status] || "default"}>
                            {statusLabelMap[rec.status] || rec.status}
                        </Tag>
                        <Switch 
                            checked={rec.status === "Active"} 
                            onChange={() => toggleTestStatus(rec.id, rec.status)}
                            checkedChildren="Active"
                            unCheckedChildren="Hidden"
                        />
                    </Space>
                );
            } 
        },
        {
            title: "Thao tác", 
            key: "actions", 
            width: 150,
            fixed: 'right',
            align: "center",
            render: (_, rec) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            type="primary"
                            icon={<EyeOutlined />} 
                            onClick={() => openEditExam(rec)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => openEditExam(rec)} 
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2>Quản lý bài thi TOEIC</h2>
            </div>

            <Card style={{ marginBottom: '16px' }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Space size="middle" style={{ width: '100%' }}>
                            <Input 
                                placeholder="Tìm kiếm bài thi..." 
                                style={{ width: 360 }} 
                                value={searchExam} 
                                onChange={handleSearchChange}
                                allowClear
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            />
                            <Select
                                value={filterSkill}
                                onChange={handleFilterChange}
                                style={{ width: 200 }}
                                placeholder="Chọn kỹ năng"
                            >
                                <Select.Option value="all">Tất cả kỹ năng</Select.Option>
                                <Select.Option value={3}>Listening & Reading</Select.Option>
                                <Select.Option value={1}>Speaking</Select.Option>
                                <Select.Option value={2}>Writing</Select.Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateExam}>
                            Tạo bài thi mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table 
                    columns={examColumns} 
                    dataSource={exams} 
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bài thi`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1400 }}
                />
            </Card>

            <TestTypeSelectionModal
                open={testTypeModalOpen}
                onClose={() => setTestTypeModalOpen(false)}
                onSelect={handleSelectTestType}
            />
            
            <FromBankTestForm
                open={fromBankFormOpen}
                onClose={() => setFromBankFormOpen(false)}
                onSuccess={handleTestCreated}
            />
            
            {/* TODO: Add Manual Test Form */}
        </div>
    );
}
