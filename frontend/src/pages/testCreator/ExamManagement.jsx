import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Space, Tag, message, Tooltip, Select, Row, Col, Modal, Upload } from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined, SettingOutlined } from "@ant-design/icons";
import { 
    getTests, 
    hideTest,
    publishTest,
    finalizeTest,
    downloadTemplate,
    downloadTemplate4Skills,
    importTestFromExcel,
    importTest4SkillsFromExcel,
} from "@services/testsService";
import { HistoryOutlined } from "@ant-design/icons";
import TestTypeSelectionModal from "@shared/components/ExamManagement/TestTypeSelectionModal";
import FromBankTestForm from "@shared/components/ExamManagement/FromBankTestForm";
import ManualTestForm from "@shared/components/ExamManagement/ManualTestForm";
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
    const [filterTestType, setFilterTestType] = useState("all");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [downloadTemplateModalOpen, setDownloadTemplateModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [audioFileList, setAudioFileList] = useState([]);
    const [importTestType, setImportTestType] = useState(null); // 'lr' or '4skills'
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [finalizing, setFinalizing] = useState(false);

    const fetchExams = async (page = 1, pageSize = 10, search = "", skill = "all", testType = "all") => {
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
                let allExams = dataPaginated || [];
                
                if (testType !== "all") {
                    allExams = allExams.filter(exam => exam.testType === testType);
                }
                
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
        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType);
        
        // Cleanup timeout khi component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    const handleTableChange = (newPagination) => {
        fetchExams(newPagination.current, newPagination.pageSize, searchExam, filterSkill, filterTestType);
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
            fetchExams(1, pagination.pageSize, value, filterSkill, filterTestType);
        }, 500); // Delay 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilterChange = (skill) => {
        setFilterSkill(skill);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, skill, filterTestType);
    };

    const handleTestTypeFilterChange = (testType) => {
        setFilterTestType(testType);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, testType);
    };

    const handleDownloadTemplate = async (is4Skills = false) => {
        try {
            const blob = is4Skills ? await downloadTemplate4Skills() : await downloadTemplate();
            
            // Check if blob is valid
            if (!blob || blob.size === 0) {
                message.error("File template không hợp lệ");
                return;
            }
            
            // Extract filename from Content-Disposition header if available, otherwise use default
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const fileName = is4Skills 
                ? `TOEIC_4Skills_Test_Template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`
                : `TOEIC_LR_Test_Template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success(`Đã tải template ${is4Skills ? '4 kỹ năng' : 'Nghe & Đọc'} thành công`);
            setDownloadTemplateModalOpen(false);
        } catch (error) {
            console.error("Download template error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
            message.error("Lỗi khi tải template: " + errorMsg);
        }
    };

    const handleImportExcel = async () => {
        if (!importTestType) {
            message.warning("Vui lòng chọn loại bài thi để import");
            return;
        }

        if (fileList.length === 0) {
            message.warning("Vui lòng chọn file Excel để import");
            return;
        }

        if (audioFileList.length === 0) {
            message.warning("Vui lòng chọn file Audio để import");
            return;
        }

        const excelFile = fileList[0].originFileObj;
        if (!excelFile) {
            message.warning("File Excel không hợp lệ");
            return;
        }

        const audioFile = audioFileList[0].originFileObj;
        if (!audioFile) {
            message.warning("File Audio không hợp lệ");
            return;
        }

        // Validate Excel file extension
        const excelFileName = excelFile.name.toLowerCase();
        if (!excelFileName.endsWith(".xlsx") && !excelFileName.endsWith(".xls")) {
            message.error("File Excel phải có định dạng .xlsx hoặc .xls");
            return;
        }

        // Validate Audio file extension
        const audioFileName = audioFile.name.toLowerCase();
        const validAudioExtensions = [".mp3", ".wav", ".m4a", ".aac", ".ogg"];
        const isValidAudio = validAudioExtensions.some(ext => audioFileName.endsWith(ext));
        if (!isValidAudio) {
            message.error("File Audio phải có định dạng .mp3, .wav, .m4a, .aac hoặc .ogg");
            return;
        }

        try {
            setUploading(true);
            if (importTestType === '4skills') {
                await importTest4SkillsFromExcel(excelFile, audioFile);
            } else {
                await importTestFromExcel(excelFile, audioFile);
            }
            message.success(`Nhập bài thi ${importTestType === '4skills' ? '4 kỹ năng' : 'Nghe & Đọc'} thành công`);
            setImportModalOpen(false);
            setFileList([]);
            setAudioFileList([]);
            setImportTestType(null);
            handleTestCreated(); // Reload danh sách
        } catch (error) {
            console.error("Import Excel error:", error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.data || error?.message || "Unknown error";
            message.error("Lỗi khi import: " + errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleImportModalClose = () => {
        setImportModalOpen(false);
        setFileList([]);
        setAudioFileList([]);
        setImportTestType(null);
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
        if (exam.testType === "Simulator") {
            setManualFormOpen(true);
        } else {
            setFromBankFormOpen(true);
        }
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

        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType);
    };

    const openStatusModal = (exam) => {
        setSelectedTest(exam);
        // Normalize status để set giá trị ban đầu
        let normalizedStatus = exam.status;
        if (typeof exam.status === 'number') {
            const statusMap = {
                0: "Draft",
                1: "InProgress",
                2: "Completed",
                3: "Published",
            };
            if (exam.status === -1) {
                normalizedStatus = "Hide";
            } else {
                normalizedStatus = statusMap[exam.status] || exam.status;
            }
        }
        setSelectedStatus(normalizedStatus);
        setStatusModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedTest || !selectedStatus) {
            message.warning("Vui lòng chọn trạng thái");
            return;
        }

        try {
            // Chỉ hỗ trợ Published và Hide vì backend chỉ có 2 endpoint này
            if (selectedStatus === "Published") {
                await publishTest(selectedTest.id);
                message.success("Đã cập nhật trạng thái thành Published");
            } else if (selectedStatus === "Hide") {
                await hideTest(selectedTest.id);
                message.success("Đã cập nhật trạng thái thành Hide");
            } else {
                message.warning("Chỉ có thể chuyển sang trạng thái Published hoặc Hide");
                return;
            }
            
            setStatusModalOpen(false);
            setSelectedTest(null);
            setSelectedStatus(null);
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType);
        } catch (error) {
            console.error("Update status error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật trạng thái";
            message.error(errorMsg);
        }
    };

    const handleFinalize = async () => {
        if (!selectedTest) {
            message.warning("Chưa có bài thi để hoàn tất!");
            return;
        }

        try {
            setFinalizing(true);
            await finalizeTest(selectedTest.id);
            message.success("Đã hoàn tất bài thi thành công!");
            setStatusModalOpen(false);
            setSelectedTest(null);
            setSelectedStatus(null);
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType);
        } catch (error) {
            console.error("Error finalizing test:", error);
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.data 
                || error.message 
                || "Unknown error";
            message.error("Lỗi khi hoàn tất bài thi: " + errorMessage);
        } finally {
            setFinalizing(false);
        }
    };


    const examColumns = [
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
                let color = "cyan";
                let label = skill;
                
                if (skill === "LR") {
                    color = "purple";
                    label = "Nghe & Đọc";
                } else if (skill === "FourSkills" || skill === "Four Skills") {
                    color = "blue";
                    label = "4 Kỹ Năng";
                } else if (skill === "Speaking") {
                    color = "green";
                    label = "Nói";
                } else if (skill === "Writing") {
                    color = "cyan";
                    label = "Viết";
                }
                
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
                // Normalize status: có thể là số hoặc string
                let normalizedStatus = rec.status;
                if (typeof rec.status === 'number') {
                    const statusMap = {
                        0: "Draft",
                        1: "InProgress",
                        2: "Completed",
                        3: "Published",
                        [-1]: "Hide"
                    };
                    normalizedStatus = statusMap[rec.status] || rec.status;
                }
                
                const statusColorMap = {
                    "Published": "success",
                    "Active": "success", // Alias cho Published
                    "Completed": "success",
                    "InProgress": "processing",
                    "Draft": "warning",
                    "Hide": "default",
                    "Inactive": "default" // Alias cho Hide
                };
                const statusLabelMap = {
                    "Published": "Đã công khai",
                    "Active": "Đang hoạt động",
                    "Completed": "Hoàn thành",
                    "InProgress": "Đang tiến hành",
                    "Draft": "Bản nháp",
                    "Hide": "Đã ẩn",
                    "Inactive": "Đã ẩn"
                };
                
                const statusColor = statusColorMap[normalizedStatus] || "default";
                const statusLabel = statusLabelMap[normalizedStatus] || normalizedStatus;
                
                return (
                    <Tag color={statusColor}>
                        {statusLabel}
                    </Tag>
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
                    <Tooltip title="Chỉnh sửa trạng thái">
                        <Button 
                            icon={<SettingOutlined />} 
                            onClick={() => openStatusModal(rec)}
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
                                <Select.Option value={3}>Nghe & Đọc</Select.Option>
                                <Select.Option value={4}>4 Kỹ Năng</Select.Option>
                                <Select.Option value={1}>Nói</Select.Option>
                                <Select.Option value={2}>Viết</Select.Option>
                            </Select>
                            <Select
                                value={filterTestType}
                                onChange={handleTestTypeFilterChange}
                                style={{ width: 200 }}
                                placeholder="Chọn loại bài thi"
                            >
                                <Select.Option value="all">Tất cả loại</Select.Option>
                                <Select.Option value="Practice">Luyện tập</Select.Option>
                                <Select.Option value="Simulator">Mô phỏng</Select.Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={() => setDownloadTemplateModalOpen(true)}
                            >
                                Tải Template
                            </Button>
                            <Button 
                                icon={<UploadOutlined />} 
                                onClick={() => setImportModalOpen(true)}
                            >
                                Nhập Excel
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateExam}>
                                Tạo bài thi mới
                            </Button>
                        </Space>
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
                open={viewFormOpen && viewingExam?.testType !== "Simulator"}
                onClose={() => { setViewFormOpen(false); setViewingExam(null); }}
                onSuccess={() => {}}
                editingId={viewingExam?.id}
                readOnly={true}
            />

            <ManualTestForm
                open={viewFormOpen && viewingExam?.testType === "Simulator"}
                onClose={() => { setViewFormOpen(false); setViewingExam(null); }}
                onSuccess={() => {}}
                editingId={viewingExam?.id}
                readOnly={true}
            />

            <ManualTestForm
                open={manualFormOpen}
                onClose={() => { setManualFormOpen(false); setEditingExam(null); }}
                onSuccess={handleTestCreated}
                editingId={editingExam?.id}
                readOnly={false}
            />

            <TestVersionsModal
                open={versionsModalOpen}
                onClose={() => { setVersionsModalOpen(false); setSelectedParentTestId(null); }}
                parentTestId={selectedParentTestId}
                onSelectVersion={handleSelectVersion}
            />

            {/* Modal Download Template */}
            <Modal
                title="Tải Template Excel"
                open={downloadTemplateModalOpen}
                onCancel={() => setDownloadTemplateModalOpen(false)}
                footer={null}
                width={500}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div>
                        <p style={{ marginBottom: 16, fontSize: 14, color: "#666" }}>
                            Chọn loại template bạn muốn tải về:
                        </p>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Button
                            type="default"
                            block
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadTemplate(false)}
                            style={{ height: 60, fontSize: 15 }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: 500 }}>Template Nghe & Đọc</div>
                                <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                    Bài thi Nghe & Đọc
                                </div>
                            </div>
                        </Button>
                        <Button
                            type="default"
                            block
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadTemplate(true)}
                            style={{ height: 60, fontSize: 15 }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: 500 }}>Template 4 Kỹ Năng</div>
                                <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                    Nghe + Đọc + Viết + Nói
                                </div>
                            </div>
                        </Button>
                    </Space>
                </Space>
            </Modal>

            {/* Modal Import Excel */}
            <Modal
                title="Import bài thi từ Excel"
                open={importModalOpen}
                onOk={handleImportExcel}
                onCancel={handleImportModalClose}
                okText="Nhập"
                cancelText="Hủy"
                confirmLoading={uploading}
                okButtonProps={{ 
                    disabled: !importTestType || fileList.length === 0 || audioFileList.length === 0 || uploading 
                }}
                width={600}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Step 1: Chọn loại test */}
                    {!importTestType && (
                        <div>
                            <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
                                Bước 1: Chọn loại bài thi bạn muốn import
                            </p>
                            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                <Button
                                    type="default"
                                    block
                                    size="large"
                                    icon={<FileExcelOutlined />}
                                    onClick={() => setImportTestType('lr')}
                                    style={{ height: 60, fontSize: 15 }}
                                >
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 500 }}>Bài thi Nghe & Đọc</div>
                                        <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                            Bài thi Nghe & Đọc
                                        </div>
                                    </div>
                                </Button>
                                <Button
                                    type="default"
                                    block
                                    size="large"
                                    icon={<FileExcelOutlined />}
                                    onClick={() => setImportTestType('4skills')}
                                    style={{ height: 60, fontSize: 15 }}
                                >
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 500 }}>Bài thi 4 Kỹ Năng</div>
                                        <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                            Nghe + Đọc + Viết + Nói
                                        </div>
                                    </div>
                                </Button>
                            </Space>
                        </div>
                    )}

                    {/* Step 2: Upload files */}
                    {importTestType && (
                        <div>
                            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                                    Bước 2: Chọn file Excel và Audio
                                </p>
                                <Button 
                                    type="link" 
                                    size="small"
                                    onClick={() => {
                                        setImportTestType(null);
                                        setFileList([]);
                                        setAudioFileList([]);
                                    }}
                                >
                                    Đổi loại bài thi
                                </Button>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <Tag color={importTestType === '4skills' ? 'blue' : 'green'}>
                                    {importTestType === '4skills' ? 'Bài thi 4 Kỹ Năng' : 'Bài thi Nghe & Đọc'}
                                </Tag>
                            </div>
                            <p style={{ marginBottom: 8, fontSize: 12, color: "#999" }}>
                                Excel: .xlsx, .xls | Audio: .mp3, .wav, .m4a, .aac, .ogg
                            </p>
                            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                <div>
                                    <p style={{ marginBottom: 8, fontWeight: 500 }}>File Excel:</p>
                                    <Upload
                                        fileList={fileList}
                                        beforeUpload={(file) => {
                                            setFileList([{
                                                uid: file.uid,
                                                name: file.name,
                                                status: 'done',
                                                originFileObj: file,
                                            }]);
                                            return false;
                                        }}
                                        onRemove={() => {
                                            setFileList([]);
                                        }}
                                        accept=".xlsx,.xls"
                                        maxCount={1}
                                    >
                                        <Button icon={<FileExcelOutlined />}>
                                            Chọn file Excel
                                        </Button>
                                    </Upload>
                                </div>
                                <div>
                                    <p style={{ marginBottom: 8, fontWeight: 500 }}>File Audio:</p>
                                    <Upload
                                        fileList={audioFileList}
                                        beforeUpload={(file) => {
                                            setAudioFileList([{
                                                uid: file.uid,
                                                name: file.name,
                                                status: 'done',
                                                originFileObj: file,
                                            }]);
                                            return false;
                                        }}
                                        onRemove={() => {
                                            setAudioFileList([]);
                                        }}
                                        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            Chọn file Audio
                                        </Button>
                                    </Upload>
                                </div>
                            </Space>
                        </div>
                    )}
                </Space>
            </Modal>

            {/* Modal Chỉnh sửa trạng thái */}
            <Modal
                title="Chỉnh sửa trạng thái bài thi"
                open={statusModalOpen}
                onCancel={() => {
                    setStatusModalOpen(false);
                    setSelectedTest(null);
                    setSelectedStatus(null);
                }}
                footer={[
                    <Button 
                        key="finalize"
                        type="primary"
                        danger
                        onClick={handleFinalize}
                        loading={finalizing}
                        style={{ marginRight: 'auto' }}
                    >
                        Hoàn tất bài thi
                    </Button>,
                    <Button 
                        key="cancel"
                        onClick={() => {
                            setStatusModalOpen(false);
                            setSelectedTest(null);
                            setSelectedStatus(null);
                        }}
                    >
                        Hủy
                    </Button>,
                    <Button 
                        key="update"
                        type="primary"
                        onClick={handleUpdateStatus}
                    >
                        Cập nhật
                    </Button>
                ]}
                width={500}
            >
                {selectedTest && (
                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                        <div>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Bài thi:</p>
                            <p style={{ margin: 0, color: "#666" }}>{selectedTest.title}</p>
                        </div>
                        <div>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Trạng thái hiện tại:</p>
                            <Tag color={
                                selectedTest.status === 3 || selectedTest.status === "Published" ? "success" :
                                selectedTest.status === -1 || selectedTest.status === "Hide" ? "default" :
                                selectedTest.status === 2 || selectedTest.status === "Completed" ? "success" :
                                selectedTest.status === 1 || selectedTest.status === "InProgress" ? "processing" :
                                "warning"
                            }>
                                {typeof selectedTest.status === 'number' ? 
                                    (selectedTest.status === 3 ? "Published" :
                                     selectedTest.status === -1 ? "Hide" :
                                     selectedTest.status === 2 ? "Completed" :
                                     selectedTest.status === 1 ? "InProgress" : "Draft") :
                                    selectedTest.status
                                }
                            </Tag>
                        </div>
                        <div>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Chọn trạng thái mới:</p>
                            <Select
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                style={{ width: "100%" }}
                                placeholder="Chọn trạng thái"
                            >
                                <Select.Option value="Published">Published - Đã công khai</Select.Option>
                                <Select.Option value="Hide">Hide - Đã ẩn</Select.Option>
                            </Select>
                            <p style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                                Lưu ý: Chỉ có thể chuyển sang trạng thái Published hoặc Hide
                            </p>
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
}
