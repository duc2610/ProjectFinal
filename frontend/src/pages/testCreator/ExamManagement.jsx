import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Space, Tag, message, Tooltip, Select, Row, Col, Modal, Upload, Switch } from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { 
    getTests, 
    hideTest,
    publishTest,
    finalizeTest,
    downloadTemplate,
    downloadTemplateSW,
    importTestFromExcel,
    importTestSWFromExcel,
} from "@services/testsService";
import { HistoryOutlined } from "@ant-design/icons";
import { TOTAL_QUESTIONS_BY_SKILL } from "@shared/constants/toeicStructure";
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
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCreationStatus, setFilterCreationStatus] = useState("all");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importTestType, setImportTestType] = useState("LR"); // "LR" or "SW"
    const [downloadTemplateModalOpen, setDownloadTemplateModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [audioFileList, setAudioFileList] = useState([]);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [finalizing, setFinalizing] = useState(false);
    const [finalizingId, setFinalizingId] = useState(null);
    const [switchLoadingId, setSwitchLoadingId] = useState(null);

    const normalizeCreationStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "completed" || str === "2") return "Completed";
        if (str === "inprogress" || str === "in_progress" || str === "1") return "InProgress";
        if (str === "draft" || str === "0") return "Draft";
        return undefined;
    };

    const normalizeVisibilityStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "published" || str === "1" || str === "active") return "Published";
        if (str === "hidden" || str === "hide" || str === "-1" || str === "0" || str === "inactive") {
            return "Hidden";
        }
        return undefined;
    };

    const normalizeLegacyStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "published" || str === "3" || str === "active") return "Published";
        if (str === "hidden" || str === "hide" || str === "-1" || str === "inactive") return "Hidden";
        if (str === "completed" || str === "2") return "Completed";
        if (str === "inprogress" || str === "in_progress" || str === "1") return "InProgress";
        if (str === "draft" || str === "0") return "Draft";
        return undefined;
    };

    const deriveStatusKey = (exam) => {
        if (!exam) return "Draft";
        const statusValue = normalizeLegacyStatusValue(exam?.status ?? exam?.Status);
        if (statusValue) return statusValue;

        const visibility = normalizeVisibilityStatusValue(exam?.visibilityStatus ?? exam?.VisibilityStatus);
        if (visibility === "Published") return "Published";
        if (visibility === "Hidden") return "Hidden";

        const creation = normalizeCreationStatusValue(exam?.creationStatus ?? exam?.CreationStatus);
        if (creation) return creation;

        return "Draft";
    };

    const deriveVisibilitySelectValue = (exam) => {
        if (!exam) return null;
        const visibility = normalizeVisibilityStatusValue(exam?.visibilityStatus ?? exam?.VisibilityStatus);
        if (visibility === "Published") return "Published";
        if (visibility === "Hidden") return "Hidden";

        const statusKey = deriveStatusKey(exam);
        if (statusKey === "Published") return "Published";
        if (statusKey === "Hidden") return "Hidden";
        return null;
    };

    const creationStatusLabels = {
        Draft: "Bản nháp",
        InProgress: "Đang tiến hành",
        Completed: "Hoàn thành",
    };

    const visibilityStatusLabels = {
        Hidden: "Đã ẩn",
        Published: "Đã công khai",
    };

    const creationStatusColors = {
        Draft: "warning",
        InProgress: "processing",
        Completed: "success",
    };

    const visibilityStatusColors = {
        Hidden: "default",
        Published: "success",
    };

    const handleVisibilityToggle = async (exam, checked) => {
        if (!exam) return;

        const examId = exam.id ?? exam.Id ?? exam.testId ?? exam.TestId;
        if (examId === undefined || examId === null) return;

        const creationStatus = normalizeCreationStatusValue(exam.creationStatus ?? exam.CreationStatus);

        if (checked && creationStatus !== "Completed") {
            message.warning("Chỉ những bài thi đã hoàn tất mới có thể công khai.");
            return;
        }

        setSwitchLoadingId(examId);

        try {
            if (checked) {
                await publishTest(examId);
                message.success("Đã công khai bài thi.");
            } else {
                await hideTest(examId);
                message.success("Đã ẩn bài thi.");
            }
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
        } catch (error) {
            console.error("Toggle visibility error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật trạng thái hiển thị";
            message.error(errorMsg);
        } finally {
            setSwitchLoadingId(null);
        }
    };

    const fetchExams = async (page = 1, pageSize = 10, search = "", skill = "all", testType = "all", status = "all", creationStatus = "all") => {
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
                
                // Filter theo trạng thái (status)
                if (status !== "all") {
                    allExams = allExams.filter(exam => {
                        const examStatus = deriveStatusKey(exam);
                        return examStatus === status;
                    });
                }
                
                // Filter theo trạng thái tạo bài (creationStatus)
                if (creationStatus !== "all") {
                    allExams = allExams.filter(exam => {
                        const examCreationStatus = normalizeCreationStatusValue(exam.creationStatus ?? exam.CreationStatus);
                        return examCreationStatus === creationStatus;
                    });
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
        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
        
        // Cleanup timeout khi component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    const handleTableChange = (newPagination) => {
        fetchExams(newPagination.current, newPagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
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
            fetchExams(1, pagination.pageSize, value, filterSkill, filterTestType, filterStatus, filterCreationStatus);
        }, 500); // Delay 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilterChange = (skill) => {
        setFilterSkill(skill);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, skill, filterTestType, filterStatus, filterCreationStatus);
    };

    const handleTestTypeFilterChange = (testType) => {
        setFilterTestType(testType);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, testType, filterStatus, filterCreationStatus);
    };

    const handleStatusFilterChange = (status) => {
        setFilterStatus(status);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, filterTestType, status, filterCreationStatus);
    };

    const handleCreationStatusFilterChange = (creationStatus) => {
        setFilterCreationStatus(creationStatus);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, creationStatus);
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadTemplate();
            
            // Check if blob is valid
            if (!blob || blob.size === 0) {
                message.error("File template không hợp lệ");
                return;
            }
            
            // Extract filename from Content-Disposition header if available, otherwise use default
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const fileName = `TOEIC_LR_Test_Template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success("Đã tải template Nghe & Đọc thành công");
            setDownloadTemplateModalOpen(false);
        } catch (error) {
            console.error("Download template error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
            message.error("Lỗi khi tải template: " + errorMsg);
        }
    };

    const handleDownloadTemplateSW = async () => {
        try {
            const blob = await downloadTemplateSW();
            
            // Check if blob is valid
            if (!blob || blob.size === 0) {
                message.error("File template không hợp lệ");
                return;
            }
            
            // Extract filename from Content-Disposition header if available, otherwise use default
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const fileName = `TOEIC_SW_Test_Template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success("Đã tải template Nói & Viết thành công");
            setDownloadTemplateModalOpen(false);
        } catch (error) {
            console.error("Download template S&W error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
            message.error("Lỗi khi tải template: " + errorMsg);
        }
    };

    const handleImportExcel = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn file Excel để import");
            return;
        }

        const excelFile = fileList[0].originFileObj;
        if (!excelFile) {
            message.warning("File Excel không hợp lệ");
            return;
        }

        // Validate Excel file extension
        const excelFileName = excelFile.name.toLowerCase();
        if (!excelFileName.endsWith(".xlsx") && !excelFileName.endsWith(".xls")) {
            message.error("File Excel phải có định dạng .xlsx hoặc .xls");
            return;
        }

        // Validate Audio file for L&R test
        if (importTestType === "LR") {
            if (audioFileList.length === 0) {
                message.warning("Vui lòng chọn file Audio để import");
                return;
            }

            const audioFile = audioFileList[0].originFileObj;
            if (!audioFile) {
                message.warning("File Audio không hợp lệ");
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
                await importTestFromExcel(excelFile, audioFile);
                message.success("Nhập bài thi Nghe & Đọc thành công");
                setImportModalOpen(false);
                setFileList([]);
                setAudioFileList([]);
                setImportTestType("LR");
                handleTestCreated(); // Reload danh sách
            } catch (error) {
                console.error("Import Excel error:", error);
                const errorMsg = error?.response?.data?.message || error?.response?.data?.data || error?.message || "Unknown error";
                message.error("Lỗi khi import: " + errorMsg);
            } finally {
                setUploading(false);
            }
        } else {
            // S&W test - no audio needed
            try {
                setUploading(true);
                await importTestSWFromExcel(excelFile);
                message.success("Nhập bài thi Nói & Viết thành công");
                setImportModalOpen(false);
                setFileList([]);
                setAudioFileList([]);
                setImportTestType("LR");
                handleTestCreated(); // Reload danh sách
            } catch (error) {
                console.error("Import Excel S&W error:", error);
                const errorMsg = error?.response?.data?.message || error?.response?.data?.data || error?.message || "Unknown error";
                message.error("Lỗi khi import: " + errorMsg);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleImportModalClose = () => {
        setImportModalOpen(false);
        setFileList([]);
        setAudioFileList([]);
        setImportTestType("LR");
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

        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
    };

    const openStatusModal = (exam) => {
        setSelectedTest(exam);
        setSelectedStatus(deriveVisibilitySelectValue(exam));
        setStatusModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedTest || !selectedStatus) {
            message.warning("Vui lòng chọn trạng thái");
            return;
        }

        try {
            // Chỉ hỗ trợ Published và Hidden vì backend chỉ có 2 endpoint này
            if (selectedStatus === "Published") {
                await publishTest(selectedTest.id);
                message.success("Đã cập nhật trạng thái thành Published");
            } else if (selectedStatus === "Hidden") {
                await hideTest(selectedTest.id);
                message.success("Đã cập nhật trạng thái thành Hidden");
            } else {
                message.warning("Chỉ có thể chuyển sang trạng thái Published hoặc Hidden");
                return;
            }
            
            setStatusModalOpen(false);
            setSelectedTest(null);
            setSelectedStatus(null);
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
        } catch (error) {
            console.error("Update status error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật trạng thái";
            message.error(errorMsg);
        }
    };

    // Kiểm tra bài thi đã nhập đủ câu hỏi chưa
    const isTestComplete = (exam) => {
        const questionQuantity = exam.questionQuantity || 0;
        let testSkill = exam.testSkill;
        
        // Chuyển đổi testSkill sang số nếu là string
        if (typeof testSkill === 'string') {
            if (testSkill === "LR" || testSkill === "L&R") {
                testSkill = 3;
            } else if (testSkill === "Speaking") {
                testSkill = 1;
            } else if (testSkill === "Writing") {
                testSkill = 2;
            } else {
                testSkill = Number(testSkill) || 0;
            }
        }
        
        // Lấy số câu hỏi yêu cầu theo skill
        const expectedTotal = TOTAL_QUESTIONS_BY_SKILL[testSkill] || 0;
        
        // Kiểm tra xem số câu hỏi đã nhập có bằng số câu hỏi yêu cầu không
        return questionQuantity >= expectedTotal && expectedTotal > 0;
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
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
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

    const handleFinalizeFromAction = async (exam) => {
        if (!exam) {
            message.warning("Chưa có bài thi để hoàn tất!");
            return;
        }

        // Kiểm tra bài thi đã nhập đủ câu hỏi chưa
        if (!isTestComplete(exam)) {
            let testSkill = exam.testSkill;
            // Chuyển đổi testSkill sang số nếu là string
            if (typeof testSkill === 'string') {
                if (testSkill === "LR" || testSkill === "L&R") {
                    testSkill = 3;
                } else if (testSkill === "Speaking") {
                    testSkill = 1;
                } else if (testSkill === "Writing") {
                    testSkill = 2;
                } else {
                    testSkill = Number(testSkill) || 0;
                }
            }
            const expectedTotal = TOTAL_QUESTIONS_BY_SKILL[testSkill] || 0;
            const questionQuantity = exam.questionQuantity || 0;
            message.warning(`Bài thi chưa nhập đủ câu hỏi! (Đã nhập: ${questionQuantity}/${expectedTotal})`);
            return;
        }

        // Kiểm tra trạng thái tạo bài
        const creationStatus = normalizeCreationStatusValue(exam.creationStatus ?? exam.CreationStatus);
        if (creationStatus === "Completed") {
            message.info("Bài thi đã được hoàn tất rồi!");
            return;
        }

        const examId = exam.id ?? exam.Id ?? exam.testId ?? exam.TestId;
        if (!examId) {
            message.error("Không tìm thấy ID bài thi!");
            return;
        }

        try {
            setFinalizingId(examId);
            await finalizeTest(examId);
            message.success("Đã hoàn tất bài thi thành công! Bây giờ bạn có thể công khai hoặc ẩn bài thi.");
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus);
        } catch (error) {
            console.error("Error finalizing test:", error);
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.data 
                || error.message 
                || "Unknown error";
            message.error("Lỗi khi hoàn tất bài thi: " + errorMessage);
        } finally {
            setFinalizingId(null);
        }
    };


    const examColumns = [
        { 
            title: "Loại bài thi", 
            dataIndex: "testType", 
            key: "testType",
            width: 130,
            render: (type) => {

                let color = "cyan"
                let label = type
                if(type ==="Simulator"){
                    color= "blue"
                    label="Thi mô phỏng"
                }else if (type === "Practice"){
                    color= "magenta"
                    label="Luyện tập"
                }
                return <Tag color={color}>{label}</Tag>;
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
            title: "Trạng thái tạo bài",
            key: "creationStatus",
            width: 170,
            align: "center",
            render: (_, rec) => {
                const creationStatus = normalizeCreationStatusValue(rec.creationStatus ?? rec.CreationStatus);
                if (!creationStatus) {
                    return <Tag color="default">Không xác định</Tag>;
                }
                return (
                    <Tag color={creationStatusColors[creationStatus] || "default"}>
                        {creationStatusLabels[creationStatus] || creationStatus}
                    </Tag>
                );
            },
        },
        { 
            title: "Trạng thái", 
            key: "status", 
            width: 160,
            align: "center",
            render: (_, rec) => {
                const normalizedStatus = deriveStatusKey(rec);
                const statusColorMap = {
                    "Published": "success",
                    "Active": "success", // Alias cho Published
                    "Completed": "success",
                    "InProgress": "processing",
                    "Draft": "warning",
                    "Hidden": "default",
                    "Inactive": "default" // Alias cho Hidden
                };
                const statusLabelMap = {
                    "Published": "Đã công khai",
                    "Active": "Đang hoạt động",
                    "Completed": "Hoàn thành",
                    "InProgress": "Đang tiến hành",
                    "Draft": "Bản nháp",
                    "Hidden": "Đã ẩn",
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
            title: "Hiển thị",
            key: "visibilitySwitch",
            width: 140,
            align: "center",
            render: (_, rec) => {
                const creationStatus = normalizeCreationStatusValue(rec.creationStatus ?? rec.CreationStatus);
                const isCompleted = creationStatus === "Completed";
                const isPublished = deriveStatusKey(rec) === "Published";
                const examId = rec.id ?? rec.Id ?? rec.testId ?? rec.TestId;
                return (
                    <Switch
                        checked={isPublished}
                        checkedChildren="Hiện"
                        unCheckedChildren="Ẩn"
                        loading={switchLoadingId === examId}
                        disabled={!isCompleted && !isPublished}
                        onChange={(checked) => handleVisibilityToggle(rec, checked)}
                    />
                );
            },
        },
        {
            title: "Thao tác", 
            key: "actions", 
            width: 200,
            fixed: 'right',
            align: "center",
            render: (_, rec) => {
                const creationStatus = normalizeCreationStatusValue(rec.creationStatus ?? rec.CreationStatus);
                const isAlreadyCompleted = creationStatus === "Completed";
                const isComplete = isTestComplete(rec);
                const examId = rec.id ?? rec.Id ?? rec.testId ?? rec.TestId;
                const isFinalizing = finalizingId === examId;
                
                return (
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
                        <Tooltip title={isAlreadyCompleted ? "Bài thi đã hoàn tất" : (!isComplete ? "Bài thi chưa nhập đủ câu hỏi" : "Hoàn tất bài thi")}>
                        <Button 
                                type={isAlreadyCompleted ? "default" : "primary"}
                                icon={<CheckCircleOutlined />} 
                                onClick={() => handleFinalizeFromAction(rec)}
                                disabled={isAlreadyCompleted || !isComplete}
                                loading={isFinalizing}
                        />
                    </Tooltip>
                </Space>
                );
            }
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2>Quản lý bài thi TOEIC</h2>
            </div>

            <Card style={{ marginBottom: '16px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Search and Action Buttons Row */}
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                            <Input 
                                placeholder="Tìm kiếm bài thi..." 
                                size="large"
                                style={{ width: '100%', maxWidth: 400 }} 
                                value={searchExam} 
                                onChange={handleSearchChange}
                                allowClear
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            />
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

                    {/* Filter Row */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                                Kỹ năng
                            </div>
                            <Select
                                value={filterSkill}
                                onChange={handleFilterChange}
                                style={{ width: '100%' }}
                                placeholder="Chọn kỹ năng"
                                size="large"
                            >
                                <Select.Option value="all">Tất cả kỹ năng</Select.Option>
                                <Select.Option value={3}>Nghe & Đọc</Select.Option>
                                <Select.Option value={1}>Nói</Select.Option>
                                <Select.Option value={2}>Viết</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                                Loại bài thi
                            </div>
                            <Select
                                value={filterTestType}
                                onChange={handleTestTypeFilterChange}
                                style={{ width: '100%' }}
                                placeholder="Chọn loại bài thi"
                                size="large"
                            >
                                <Select.Option value="all">Tất cả loại</Select.Option>
                                <Select.Option value="Practice">Luyện tập</Select.Option>
                                <Select.Option value="Simulator">Mô phỏng</Select.Option>
                            </Select>
                    </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                                Trạng thái
                            </div>
                            <Select
                                value={filterStatus}
                                onChange={handleStatusFilterChange}
                                style={{ width: '100%' }}
                                placeholder="Chọn trạng thái"
                                size="large"
                            >
                                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                <Select.Option value="Published">Đã công khai</Select.Option>
                                <Select.Option value="Hidden">Đã ẩn</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ marginBottom: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                                Trạng thái tạo bài
                            </div>
                            <Select
                                value={filterCreationStatus}
                                onChange={handleCreationStatusFilterChange}
                                style={{ width: '100%' }}
                                placeholder="Chọn trạng thái tạo bài"
                                size="large"
                            >
                                <Select.Option value="all">Tất cả trạng thái tạo bài</Select.Option>
                                <Select.Option value="Draft">Bản nháp</Select.Option>
                                <Select.Option value="InProgress">Đang tiến hành</Select.Option>
                                <Select.Option value="Completed">Hoàn thành</Select.Option>
                            </Select>
                    </Col>
                </Row>
                </Space>
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
                            Chọn template để tải:
                        </p>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Button
                            type="default"
                            block
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadTemplate()}
                            style={{ height: 60, fontSize: 15 }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: 500 }}>Template Nghe & Đọc</div>
                                <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                    Bài thi Nghe & Đọc (L&R)
                                </div>
                            </div>
                        </Button>
                        <Button
                            type="default"
                            block
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadTemplateSW()}
                            style={{ height: 60, fontSize: 15 }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: 500 }}>Template Nói & Viết</div>
                                <div style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>
                                    Bài thi Nói & Viết (S&W)
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
                    disabled: fileList.length === 0 || (importTestType === "LR" && audioFileList.length === 0) || uploading 
                }}
                width={600}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <div>
                        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
                            Chọn loại bài thi và file để import
                        </p>
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Loại bài thi:</p>
                            <Select
                                value={importTestType}
                                onChange={(value) => {
                                    setImportTestType(value);
                                    // Reset files when changing test type
                                    setFileList([]);
                                    setAudioFileList([]);
                                }}
                                style={{ width: "100%" }}
                                size="large"
                            >
                                <Select.Option value="LR">
                                    <Tag color="green">Nghe & Đọc (L&R)</Tag>
                                    <span style={{ marginLeft: 8 }}>Cần file Excel và Audio</span>
                                </Select.Option>
                                <Select.Option value="SW">
                                    <Tag color="blue">Nói & Viết (S&W)</Tag>
                                    <span style={{ marginLeft: 8 }}>Chỉ cần file Excel</span>
                                </Select.Option>
                            </Select>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            {importTestType === "LR" ? (
                                <Tag color="green">Bài thi Nghe & Đọc</Tag>
                            ) : (
                                <Tag color="blue">Bài thi Nói & Viết</Tag>
                            )}
                        </div>
                        <p style={{ marginBottom: 8, fontSize: 12, color: "#999" }}>
                            {importTestType === "LR" 
                                ? "Excel: .xlsx, .xls | Audio: .mp3, .wav, .m4a, .aac, .ogg"
                                : "Excel: .xlsx, .xls (Không cần file Audio)"
                            }
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
                            {importTestType === "LR" && (
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
                            )}
                        </Space>
                    </div>
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
                            {(() => {
                                const currentStatus = deriveStatusKey(selectedTest);
                                const statusColorMap = {
                                    "Published": "success",
                                    "Active": "success",
                                    "Completed": "success",
                                    "InProgress": "processing",
                                    "Draft": "warning",
                                    "Hidden": "default",
                                    "Inactive": "default"
                                };
                                const statusLabelMap = {
                                    "Published": "Đã công khai",
                                    "Active": "Đang hoạt động",
                                    "Completed": "Hoàn thành",
                                    "InProgress": "Đang tiến hành",
                                    "Draft": "Bản nháp",
                                    "Hidden": "Đã ẩn",
                                    "Inactive": "Đã ẩn"
                                };
                                return (
                                    <Tag color={statusColorMap[currentStatus] || "default"}>
                                        {statusLabelMap[currentStatus] || currentStatus}
                                    </Tag>
                                );
                            })()}
                        </div>
                        <div>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Trạng thái tạo bài:</p>
                            {(() => {
                                const creationStatus = normalizeCreationStatusValue(selectedTest.creationStatus ?? selectedTest.CreationStatus);
                                if (!creationStatus) {
                                    return <Tag color="default">Không xác định</Tag>;
                                }
                                return (
                                    <Tag color={creationStatusColors[creationStatus] || "default"}>
                                        {creationStatusLabels[creationStatus] || creationStatus}
                                    </Tag>
                                );
                            })()}
                        </div>
                        <div>
                            <p style={{ marginBottom: 8, fontWeight: 500 }}>Trạng thái hiển thị:</p>
                            {(() => {
                                const visibilityStatus = normalizeVisibilityStatusValue(selectedTest.visibilityStatus ?? selectedTest.VisibilityStatus);
                                if (!visibilityStatus) {
                                    return <Tag color="default">Không xác định</Tag>;
                                }
                                return (
                                    <Tag color={visibilityStatusColors[visibilityStatus] || "default"}>
                                        {visibilityStatusLabels[visibilityStatus] || visibilityStatus}
                                    </Tag>
                                );
                            })()}
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
                                <Select.Option value="Hidden">Hidden - Đã ẩn</Select.Option>
                            </Select>
                            <p style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                                Lưu ý: Chỉ có thể chuyển sang trạng thái Published hoặc Hidden
                            </p>
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
}
