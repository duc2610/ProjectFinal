import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Space, Tag, Switch, message, Tooltip, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { 
    getTests, 
    hideTest, 
    publishTest,
} from "@services/testsService";
import { HistoryOutlined } from "@ant-design/icons";
import TestTypeSelectionModal from "@shared/components/ExamManagement/TestTypeSelectionModal";
import FromBankTestForm from "@shared/components/ExamManagement/FromBankTestForm";
import TestVersionsModal from "@shared/components/ExamManagement/TestVersionsModal";

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
    const [viewFormOpen, setViewFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [viewingExam, setViewingExam] = useState(null);
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);
    const [selectedParentTestId, setSelectedParentTestId] = useState(null);
    const [manualFormOpen, setManualFormOpen] = useState(false);
    const [searchExam, setSearchExam] = useState("");
    const [filterSkill, setFilterSkill] = useState("all");
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchExams = async (page = 1, pageSize = 10, search = "", skill = "all") => {
        setLoading(true);
        try {
            // Fetch tất cả tests (không paginate) để đảm bảo có đủ tất cả versions để filter
            const params = {
                page: 1,
                pageSize: 10000, // Lấy tất cả để filter version mới nhất
                keyword: search || undefined,
                testSkill: skill !== "all" ? skill : undefined,
            };
            const response = await getTests(params);
            
            
            if (response?.success && response?.data) {
                const { dataPaginated, currentPage, pageSize: size, totalCount } = response.data;
                const allExams = dataPaginated || [];
                
                // Filter: chỉ giữ lại version mới nhất của mỗi test (group by parentTestId hoặc id)
                // Logic: Group theo root test ID (nếu có parentTestId thì dùng parentTestId, không thì dùng id)
                const latestVersions = allExams
                    .reduce((acc, exam) => {
                        // Xác định root test ID
                        // - Test gốc: parentTestId = null/undefined → rootId = id
                        // - Version mới: có parentTestId → rootId = parentTestId
                        const rootId = exam.parentTestId ?? exam.id;
                        
                        const existing = acc.get(rootId);
                        const currentVersion = Number(exam.version) || 0;
                        
                        // So sánh version: nếu chưa có hoặc version hiện tại lớn hơn thì cập nhật
                        if (!existing) {
                            acc.set(rootId, exam);
                        } else {
                            const existingVersion = Number(existing.version) || 0;
                            if (currentVersion > existingVersion) {
                                acc.set(rootId, exam);
                            }
                        }
                        return acc;
                    }, new Map())
                    .values();
                
                const filtered = Array.from(latestVersions);
                
                // Paginate lại sau khi filter
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedExams = filtered.slice(startIndex, endIndex);
                
                setExams(paginatedExams);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: filtered.length, // Total sau khi filter
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
        setFromBankFormOpen(true);
    };

    const openViewExam = (exam) => {
        setViewingExam(exam);
        setViewFormOpen(true);
    };

    const openVersionsModal = (exam) => {
        const parentId = exam.parentTestId || exam.id;
        setSelectedParentTestId(parentId);
        setVersionsModalOpen(true);
    };

    const handleSelectVersion = (testId) => {
        setVersionsModalOpen(false);
        setViewingExam({ id: testId });
        setViewFormOpen(true);
    };

    const handleTestCreated = () => {
        // Sau khi tạo/cập nhật bài thi thành công, reload danh sách
        // Reset về trang 1 để đảm bảo hiển thị version mới nhất
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill);
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
            title: "Version", 
            dataIndex: "version", 
            key: "version", 
            width: 100,
            align: "center",
            render: (version) => version ? `v${version}` : "v1"
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
                            onClick={() => openViewExam(rec)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => openEditExam(rec)} 
                        />
                    </Tooltip>
                    <Tooltip title="Xem version">
                        <Button 
                            icon={<HistoryOutlined />} 
                            onClick={() => openVersionsModal(rec)}
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
                onClose={() => { setFromBankFormOpen(false); setEditingExam(null); }}
                onSuccess={handleTestCreated}
                editingId={editingExam?.id}
                readOnly={false}
            />

            <FromBankTestForm
                open={viewFormOpen}
                onClose={() => { setViewFormOpen(false); setViewingExam(null); }}
                onSuccess={() => {}}
                editingId={viewingExam?.id}
                readOnly={true}
            />

            <TestVersionsModal
                open={versionsModalOpen}
                onClose={() => { setVersionsModalOpen(false); setSelectedParentTestId(null); }}
                parentTestId={selectedParentTestId}
                onSelectVersion={handleSelectVersion}
            />
            
            {/* TODO: Add Manual Test Form */}
        </div>
    );
}
