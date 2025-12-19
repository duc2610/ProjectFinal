import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Space, Tag, message, Tooltip, Select, Row, Col, Modal, Upload, Switch, Typography, DatePicker } from "antd";
import dayjs from "dayjs";
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
    getTestById,
    TEST_TYPE,
} from "@services/testsService";
import { HistoryOutlined } from "@ant-design/icons";
import { TOTAL_QUESTIONS_BY_SKILL } from "@shared/constants/toeicStructure";
import TestTypeSelectionModal from "@shared/components/ExamManagement/TestTypeSelectionModal";
import FromBankTestForm from "@shared/components/ExamManagement/FromBankTestForm";
import ManualTestForm from "@shared/components/ExamManagement/ManualTestForm";
import TestVersionsModal from "@shared/components/ExamManagement/TestVersionsModal";

const { Text } = Typography;

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
    const [dateRange, setDateRange] = useState(null);
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
        if (examId === undefined || examId === null) {
            message.error("Không xác định được ID bài thi");
            return;
        }

        const creationStatus = normalizeCreationStatusValue(exam.creationStatus ?? exam.CreationStatus);

        // Chỉ kiểm tra khi bật (publish), không cần kiểm tra khi tắt (hide)
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
            // Reload danh sách sau khi toggle thành công
            await fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật trạng thái hiển thị";
            message.error(errorMsg);
        } finally {
            setSwitchLoadingId(null);
        }
    };

    const fetchExams = async (page = 1, pageSize = 10, search = "", skill = "all", testType = "all", status = "all", creationStatus = "all", dateRangeFilter = null) => {
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
                
                // Client-side filtering theo search keyword (ID và tên đề thi)
                if (search && search.trim()) {
                    const searchLower = search.toLowerCase().trim();
                    allExams = allExams.filter((exam) => {
                        // Tìm theo ID
                        const examId = String(exam.id ?? exam.Id ?? exam.testId ?? exam.TestId ?? "");
                        if (examId.toLowerCase().includes(searchLower)) {
                            return true;
                        }
                        
                        // Tìm theo tên đề thi (title)
                        const title = (exam.title || "").toLowerCase();
                        if (title.includes(searchLower)) {
                            return true;
                        }
                        
                        return false;
                    });
                }
                
                if (testType !== "all") {
                    allExams = allExams.filter(exam => exam.testType === testType);
                }
                
                // Filter theo trạng thái (status) - chỉ check visibilityStatus
                if (status !== "all") {
                    allExams = allExams.filter(exam => {
                        const visibility = normalizeVisibilityStatusValue(exam?.visibilityStatus ?? exam?.VisibilityStatus);
                        if (status === "Published") {
                            return visibility === "Published";
                        }
                        if (status === "Hidden") {
                            return visibility === "Hidden";
                        }
                        return false;
                    });
                }
                
                // Filter theo trạng thái tạo bài (creationStatus)
                if (creationStatus !== "all") {
                    allExams = allExams.filter(exam => {
                        const examCreationStatus = normalizeCreationStatusValue(exam.creationStatus ?? exam.CreationStatus);
                        return examCreationStatus === creationStatus;
                    });
                }
                
                // Filter theo khoảng ngày tạo
                if (dateRangeFilter && dateRangeFilter.length === 2) {
                    const startDate = dayjs(dateRangeFilter[0]).startOf('day');
                    const endDate = dayjs(dateRangeFilter[1]).endOf('day');
                    allExams = allExams.filter(exam => {
                        const examDate = exam.createdAt || exam.CreatedAt || exam.created_at;
                        if (!examDate) return false;
                        const examDateObj = dayjs(examDate);
                        return examDateObj.isAfter(startDate) && examDateObj.isBefore(endDate) || 
                               examDateObj.isSame(startDate, 'day') || 
                               examDateObj.isSame(endDate, 'day');
                    });
                }
                
                // Helper: chuẩn hóa các field từ backend (camelCase / PascalCase)
                const getExamId = (exam) => exam.id ?? exam.Id ?? exam.testId ?? exam.TestId ?? 0;
                const getParentId = (exam) => exam.parentTestId ?? exam.ParentTestId ?? null;
                const getVersion = (exam) => Number(exam.version ?? exam.Version) || 0;
                const getCreatedAt = (exam) => exam.createdAt || exam.CreatedAt || exam.created_at || null;

                // Filter: chỉ giữ lại version mới nhất của mỗi test (group by parentId hoặc id gốc)
                const latestVersions = allExams.reduce((acc, exam) => {
                    // Xác định root test ID
                    // - Test gốc: ParentTestId = null/undefined → rootId = TestId
                    // - Version mới: có ParentTestId → rootId = ParentTestId
                    const rootId = getParentId(exam) ?? getExamId(exam);

                    const existing = acc.get(rootId);
                    const currentVersion = getVersion(exam);

                    if (!existing) {
                        acc.set(rootId, exam);
                    } else {
                        const existingVersion = getVersion(existing);
                        if (currentVersion > existingVersion) {
                            acc.set(rootId, exam);
                        }
                    }
                    return acc;
                }, new Map()).values();

                const filtered = Array.from(latestVersions);

                // Sắp xếp theo thời gian tạo giảm dần (test mới nhất lên đầu)
                // Ưu tiên createdAt, nếu không có thì dùng id (id lớn hơn = mới hơn)
                filtered.sort((a, b) => {
                    const dateA = getCreatedAt(a);
                    const dateB = getCreatedAt(b);

                    if (dateA && dateB) {
                        return new Date(dateB) - new Date(dateA);
                    }
                    if (dateA) return -1;
                    if (dateB) return 1;

                    const idA = getExamId(a);
                    const idB = getExamId(b);
                    return idB - idA;
                });
                
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
            message.error("Lỗi khi tải dữ liệu: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
        
        // Cleanup timeout khi component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    const handleTableChange = (newPagination) => {
        fetchExams(newPagination.current, newPagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
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
            fetchExams(1, pagination.pageSize, value, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
        }, 500); // Delay 500ms sau khi người dùng ngừng gõ
        
        setSearchTimeout(newTimeout);
    };

    const handleFilterChange = (skill) => {
        setFilterSkill(skill);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, skill, filterTestType, filterStatus, filterCreationStatus, dateRange);
    };

    const handleTestTypeFilterChange = (testType) => {
        setFilterTestType(testType);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, testType, filterStatus, filterCreationStatus, dateRange);
    };

    const handleStatusFilterChange = (status) => {
        setFilterStatus(status);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, filterTestType, status, filterCreationStatus, dateRange);
    };

    const handleCreationStatusFilterChange = (creationStatus) => {
        setFilterCreationStatus(creationStatus);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, creationStatus, dateRange);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        setPagination({ ...pagination, current: 1 });
        fetchExams(1, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dates);
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

    const handleSelectVersion = async (testId) => {
        setVersionsModalOpen(false);

        try {
            const detail = await getTestById(testId);
            const data = detail?.data || detail || {};

            const rawType = data.testType ?? data.TestType;
            let normalizedType = rawType;

            // Chuẩn hóa testType để dùng chung với logic hiện tại ("Simulator" hoặc "Practice")
            if (typeof rawType === "number") {
                if (rawType === TEST_TYPE.SIMULATOR) normalizedType = "Simulator";
                else if (rawType === TEST_TYPE.PRACTICE) normalizedType = "Practice";
            }

            const id =
                data.id ?? data.Id ?? data.testId ?? data.TestId ?? testId;

            setViewingExam({
                id,
                testType: normalizedType,
            });
        } catch (error) {
            // Fallback: chỉ set id nếu có lỗi, vẫn cho phép xem ở chế độ mặc định
            setViewingExam({ id: testId });
        }

        setViewFormOpen(true);
    };

    const handleTestCreated = () => {

        fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
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
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
        } catch (error) {
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
            const s = testSkill.toUpperCase();
            if (s === "LR" || s === "L&R" || s.includes("LISTENING")) {
                testSkill = 3;
            } else if (s === "SPEAKING") {
                testSkill = 1;
            } else if (s === "WRITING") {
                testSkill = 2;
            } else if (s === "SW" || s.includes("S&W") || s.includes("SPEAKING & WRITING")) {
                testSkill = 4;
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
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
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
                const s = testSkill.toUpperCase();
                if (s === "LR" || s === "L&R" || s.includes("LISTENING")) {
                    testSkill = 3;
                } else if (s === "SPEAKING") {
                    testSkill = 1;
                } else if (s === "WRITING") {
                    testSkill = 2;
                } else if (s === "SW" || s.includes("S&W") || s.includes("SPEAKING & WRITING")) {
                    testSkill = 4;
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
            fetchExams(pagination.current, pagination.pageSize, searchExam, filterSkill, filterTestType, filterStatus, filterCreationStatus, dateRange);
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


    // Hàm format ngày tháng theo định dạng tiếng Việt
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return dateString;
        }
    };

    const examColumns = [
        {
            title: "STT",
            key: "stt",
            width: 60,
            align: "center",
            render: (_, __, index) => {
                const currentPage = pagination.current;
                const pageSize = pagination.pageSize;
                return (currentPage - 1) * pageSize + index + 1;
            }
        },
        { 
            title: "ID", 
            dataIndex: "id", 
            key: "id",
            width: 70,
            align: "center",
            render: (id, record) => {
                const examId = id ?? record.Id ?? record.testId ?? record.TestId ?? "—";
                return <Text strong style={{ color: "#1890ff" }}>{examId}</Text>;
            }
        },
        { 
            title: "Thông tin đề thi", 
            key: "examBasicInfo",
            width: 220,
            render: (_, record) => {
                const type = record.testType;
                const skill = record.testSkill;
                const title = record.title || "—";
                
                // Xử lý loại bài thi
                let typeColor = "cyan";
                let typeLabel = type;
                if(type === "Simulator"){
                    typeColor = "blue";
                    typeLabel = "Thi mô phỏng";
                } else if (type === "Practice"){
                    typeColor = "magenta";
                    typeLabel = "Luyện tập";
                }
                
                // Xử lý kỹ năng
                let skillColor = "cyan";
                let skillLabel = skill;
                const s = typeof skill === "string" ? skill.toUpperCase() : skill;
                if (s === "LR" || s === 3) {
                    skillColor = "purple";
                    skillLabel = "Nghe & Đọc";
                } else if (s === "SPEAKING" || s === 1) {
                    skillColor = "green";
                    skillLabel = "Nói";
                } else if (s === "WRITING" || s === 2) {
                    skillColor = "cyan";
                    skillLabel = "Viết";
                } else if (s === "SW" || s === 4) {
                    skillColor = "blue";
                    skillLabel = "Nói & Viết";
                }
                
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Tag color={typeColor}>{typeLabel}</Tag>
                            <Tag color={skillColor}>{skillLabel}</Tag>
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 14 }}>{title}</Text>
                        </div>
                    </div>
                );
            }
        },
        { 
            title: "Thông tin bài thi", 
            key: "examInfo", 
            width: 160,
            align: "center",
            render: (_, record) => {
                const duration = record.duration || 0;
                const questionQuantity = record.questionQuantity || 0;
                const versionNum = record.version || 1;
                
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                        <div>
                            <Text strong>Thời lượng: </Text>
                            <Text>{duration} phút</Text>
                        </div>
                        <div>
                            <Text strong>Số câu hỏi: </Text>
                            <Text>{questionQuantity}</Text>
                        </div>
                        <div>
                            <Text strong>Version: </Text>
                            <Text>{`v${versionNum}`}</Text>
                        </div>
                    </div>
                );
            }
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            align: "center",
            render: (date, record) => {
                const dateValue = date || record.CreatedAt || record.created_at;
                return (
                    <div style={{ fontSize: 12 }}>
                        <div>{formatDate(dateValue)}</div>
                        {dateValue && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {(() => {
                                    try {
                                        const dateObj = new Date(dateValue);
                                        const now = new Date();
                                        const diffMs = now - dateObj;
                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                        
                                        if (diffDays === 0) {
                                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                            if (diffHours === 0) {
                                                const diffMins = Math.floor(diffMs / (1000 * 60));
                                                return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
                                            }
                                            return `${diffHours} giờ trước`;
                                        } else if (diffDays === 1) {
                                            return "Hôm qua";
                                        } else if (diffDays < 7) {
                                            return `${diffDays} ngày trước`;
                                        } else if (diffDays < 30) {
                                            const weeks = Math.floor(diffDays / 7);
                                            return `${weeks} tuần trước`;
                                        } else if (diffDays < 365) {
                                            const months = Math.floor(diffDays / 30);
                                            return `${months} tháng trước`;
                                        } else {
                                            const years = Math.floor(diffDays / 365);
                                            return `${years} năm trước`;
                                        }
                                    } catch (e) {
                                        return "";
                                    }
                                })()}
                            </Text>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => {
                const dateA = a.createdAt || a.CreatedAt || a.created_at;
                const dateB = b.createdAt || b.CreatedAt || b.created_at;
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                return new Date(dateA) - new Date(dateB);
            },
        },
        {
            title: "Trạng thái tạo bài",
            key: "creationStatus",
            width: 140,
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
            width: 130,
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
            width: 100,
            align: "center",
            render: (_, rec) => {
                const creationStatus = normalizeCreationStatusValue(rec.creationStatus ?? rec.CreationStatus);
                const isCompleted = creationStatus === "Completed";
                // Chỉ check visibilityStatus để xác định Published
                const visibility = normalizeVisibilityStatusValue(rec.visibilityStatus ?? rec.VisibilityStatus);
                const isPublished = visibility === "Published";
                const examId = rec.id ?? rec.Id ?? rec.testId ?? rec.TestId;
                // Chỉ disable nếu test chưa completed (chưa thể publish)
                // Nếu đã completed thì có thể toggle giữa Published và Hidden
                return (
                    <Switch
                        checked={isPublished}
                        checkedChildren="Hiện"
                        unCheckedChildren="Ẩn"
                        loading={switchLoadingId === examId}
                        disabled={!isCompleted}
                        onChange={(checked) => {
                            if (!isCompleted) return;
                            const actionLabel = checked ? "hiển thị (Published)" : "ẩn (Hidden)";
                            Modal.confirm({
                                title: "Xác nhận thay đổi trạng thái hiển thị",
                                content: `Bạn có chắc chắn muốn ${actionLabel} bài thi này?`,
                                okText: "Xác nhận",
                                cancelText: "Hủy",
                                onOk: () => handleVisibilityToggle(rec, checked),
                            });
                        }}
                    />
                );
            },
        },
        {
            title: "Thao tác", 
            key: "actions", 
            width: 150,
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
                                placeholder="Tìm kiếm theo ID, tên đề thi..." 
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
                        <Col xs={24} sm={12} md={4}>
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
                        <Col xs={24} sm={12} md={4}>
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
                        <Col xs={24} sm={12} md={4}>
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
                        <Col xs={24} sm={12} md={4}>
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
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: 4, fontSize: 13, color: '#666', fontWeight: 500 }}>
                            Lọc theo ngày tạo
                        </div>
                        <DatePicker.RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            style={{ width: '100%' }}
                            size="large"
                            format="DD/MM/YYYY"
                            placeholder={['Từ ngày', 'Đến ngày']}
                            allowClear
                        />
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
                    scroll={false}
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
