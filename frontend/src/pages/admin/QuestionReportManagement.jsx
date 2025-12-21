import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
  DatePicker,
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  requiresAudio,
  requiresImage,
  TEST_SKILL,
} from "@constants/toeicStructure";
import {
  getQuestionReports,
  reviewReport,
  updateTestQuestionFromReport,
} from "@services/questionReportService";
import { getTestById, updateTestManual } from "@services/testsService";
import { uploadFile } from "@services/filesService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: 0, label: "Chờ xử lý" }, // Pending
  { value: 1, label: "Đang xem xét" }, // Reviewing
  { value: 2, label: "Đã xử lý" }, // Resolved
  { value: 3, label: "Từ chối" }, // Rejected
];

const statusColorMap = {
  0: "orange",
  1: "blue",
  2: "green",
  3: "red",
};

const statusTextMap = {
  0: "Chờ xử lý",
  1: "Đang xem xét",
  2: "Đã xử lý",
  3: "Từ chối",
};

// Map string status từ BE sang mã số enum
const statusStringToCodeMap = {
  Pending: 0,
  Reviewing: 1,
  Resolved: 2,
  Rejected: 3,
};

// Suy ra skill từ partId/partName (phù hợp cấu trúc TOEIC hiện tại)
const getSkillFromPart = (partId, partName) => {
  if (partId >= 1 && partId <= 7) return TEST_SKILL.LR;
  if (partId >= 8 && partId <= 10) return TEST_SKILL.WRITING;
  if (partId >= 11 && partId <= 15) return TEST_SKILL.SPEAKING;

  if (typeof partName === "string") {
    if (partName.startsWith("L-")) return TEST_SKILL.LR;
    if (partName.startsWith("W-")) return TEST_SKILL.WRITING;
    if (partName.startsWith("S-")) return TEST_SKILL.SPEAKING;
  }

  return TEST_SKILL.LR;
};

const reportTypeTextMap = {
  IncorrectAnswer: "Đáp án sai",
  Typo: "Lỗi chính tả",
  AudioIssue: "Lỗi audio",
  ImageIssue: "Lỗi hình ảnh",
  Unclear: "Câu hỏi không rõ ràng",
  Other: "Khác",
};

// Convert unknown values (including weird objects) to safe displayable text
const safeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  // Common shapes
  if (typeof value === "object") {
    try {
      if (typeof value.content === "string") return value.content;
      if (typeof value.passage === "string") return value.passage;
      if (typeof value.message === "string") return value.message;
    } catch (_) {
      // ignore
    }
  }
  try {
    return String(value);
  } catch (_) {
    try {
      const json = JSON.stringify(value);
      return typeof json === "string" ? json : fallback;
    } catch (__) {
      return fallback;
    }
  }
};

export default function QuestionReportManagement() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    // Mặc định: lấy tất cả trạng thái, không filter theo status
    status: "all",
    reportType: "all",
    dateRange: null,
    searchText: "",
    page: 1,
    // Mặc định lấy nhiều bản ghi để hạn chế phải chuyển trang
    pageSize: 1000,
  });
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);
  const [editableQuestion, setEditableQuestion] = useState(null);
  const [editableQuestionGroup, setEditableQuestionGroup] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [alsoUpdateSourceInBank, setAlsoUpdateSourceInBank] = useState(true);
  // State cho test audio (Simulator test)
  const [testAudioFile, setTestAudioFile] = useState(null);
  const [testAudioPreviewUrl, setTestAudioPreviewUrl] = useState(null);
  const [testAudioUrl, setTestAudioUrl] = useState(null);

  const [reviewForm] = Form.useForm();

  const fetchData = async (override = {}) => {
    const merged = {
      ...filters,
      ...override,
    };

    setLoading(true);
    try {
      const res = await getQuestionReports({
        status: merged.status,
        page: merged.page,
        pageSize: merged.pageSize,
      });

      let items = res?.data ?? res?.items ?? res?.results ?? res ?? [];
      const pageNumber =
        res?.pageNumber ?? res?.page ?? merged.page ?? pagination.current;
      const pageSize = res?.pageSize ?? merged.pageSize ?? pagination.pageSize;
      const total = res?.totalRecords ?? res?.total ?? items.length ?? 0;

      let itemsArray = Array.isArray(items)
        ? items
        : Array.isArray(items.data)
        ? items.data
        : [];

      // Filter theo loại lỗi (reportType)
      if (merged.reportType && merged.reportType !== "all") {
        const beforeFilter = itemsArray.length;
        itemsArray = itemsArray.filter(item => {
          return item.reportType === merged.reportType;
        });
      }
      
      // Filter theo khoảng ngày tạo
      if (merged.dateRange && Array.isArray(merged.dateRange) && merged.dateRange.length === 2) {
        const beforeFilter = itemsArray.length;
        const startDate = dayjs(merged.dateRange[0]).startOf('day');
        const endDate = dayjs(merged.dateRange[1]).endOf('day');
        itemsArray = itemsArray.filter(item => {
          const itemDate = item.createdAt || item.CreatedAt;
          if (!itemDate) return false;
          const itemDateObj = dayjs(itemDate);
          const isInRange = itemDateObj.isAfter(startDate) && itemDateObj.isBefore(endDate) || 
                           itemDateObj.isSame(startDate, 'day') || 
                           itemDateObj.isSame(endDate, 'day');
          return isInRange;
        });
      }
      
      // Filter theo tìm kiếm (nội dung câu hỏi, bài thi, người báo cáo, ID)
      if (merged.searchText && merged.searchText.trim()) {
        const beforeFilter = itemsArray.length;
        const searchLower = merged.searchText.toLowerCase().trim();
        itemsArray = itemsArray.filter(item => {
          // Tìm theo ID (reportId, testQuestionId, testId)
          const reportId = String(item.reportId ?? item.id ?? item.Id ?? "");
          const testQuestionId = String(item.testQuestionId ?? "");
          const testId = String(item.testId ?? "");
          if (
            reportId.toLowerCase().includes(searchLower) ||
            testQuestionId.toLowerCase().includes(searchLower) ||
            testId.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
          
          // Tìm theo nội dung câu hỏi
          const questionContent = safeText(
            item.questionContent ||
              item?.questionSnapshot?.content ||
              item?.questionGroupSnapshot?.passage ||
              "",
            ""
          ).toLowerCase();
          if (questionContent.includes(searchLower)) {
            return true;
          }
          
          // Tìm theo tên bài thi
          const testName = safeText(item.testName || "", "").toLowerCase();
          if (testName.includes(searchLower)) {
            return true;
          }
          
          // Tìm theo người báo cáo (tên hoặc email)
          const reporterName = safeText(item.reporterName || "", "").toLowerCase();
          const reporterEmail = safeText(item.reporterEmail || "", "").toLowerCase();
          if (
            reporterName.includes(searchLower) ||
            reporterEmail.includes(searchLower)
          ) {
            return true;
          }
          
          return false;
        });
      }
      
      // Sắp xếp theo thời gian tạo giảm dần (report mới nhất lên đầu)
      // Ưu tiên createdAt, nếu không có thì dùng reportId (id lớn hơn = mới hơn)
      itemsArray.sort((a, b) => {
        const dateA = a.createdAt || a.CreatedAt;
        const dateB = b.createdAt || b.CreatedAt;
        
        if (dateA && dateB) {
          return new Date(dateB) - new Date(dateA);
        }
        if (dateA) return -1;
        if (dateB) return 1;
        
        // Nếu không có createdAt, sắp xếp theo reportId (id lớn hơn = mới hơn)
        const idA = a.reportId ?? a.id ?? a.Id ?? 0;
        const idB = b.reportId ?? b.id ?? b.Id ?? 0;
        return idB - idA;
      });

      // Chuẩn hóa dữ liệu cho hiển thị (ưu tiên sub-question được report)
      const normalizedItems = itemsArray.map((item) => {
        const reportedSub = item.reportedSubQuestion || null;
        const snapshot = item.questionSnapshot || {};
        const groupSnapshot = item.questionGroupSnapshot || {};

        const questionContent = safeText(
          (reportedSub && reportedSub.content) ||
            snapshot.content ||
            item.questionContent ||
            groupSnapshot.passage ||
            "",
          ""
        );

        return {
          ...item,
          questionContent,
        };
      });

      setDataSource(normalizedItems);
      setPagination({
        current: merged.page || 1, // Reset về trang 1 khi filter thay đổi
        pageSize: pagination.pageSize || 10, // Giữ nguyên pageSize hiển thị (không dùng pageSize từ API)
        total: itemsArray.length, // Total sau khi filter
      });
      setFilters(merged);
    } catch (error) {
      // Không hiển thị thông báo lỗi, chỉ log lỗi vào console
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pag) => {
    // Với client-side pagination, chỉ cần cập nhật pagination state
    // Không cần gọi lại API vì đã có tất cả dữ liệu trong dataSource
    setPagination({
      current: pag.current || 1,
      pageSize: pag.pageSize || pagination.pageSize,
      total: pagination.total, // Giữ nguyên total (tổng số sau filter)
    });
  };

  const handleFilterChange = (changed) => {
    const next = {
      ...filters,
      ...changed,
      page: 1,
    };
    setFilters(next);
    fetchData(next);
  };

  const openReviewModal = (record) => {
    setSelectedReport(record);
    
    // Kiểm tra xem là question group hay single question
    const isQuestionGroup = record.isQuestionGroup === true || record.questionGroupSnapshot != null;
    
    if (isQuestionGroup) {
      // Xử lý question group
      const groupSnapshot = record.questionGroupSnapshot || {};
      const questionSnapshots = Array.isArray(groupSnapshot.questionSnapshots) 
        ? groupSnapshot.questionSnapshots 
        : [];
      
      setEditableQuestionGroup({
        passage: groupSnapshot.passage || record.questionContent || "",
        questions: questionSnapshots.map((q) => ({
          questionId: q.questionId,
          content: q.content || "",
          explanation: q.explanation || "",
          options: Array.isArray(q.options) 
            ? q.options.map((opt) => ({
                label: opt.label,
                content: opt.content,
                isCorrect: !!opt.isCorrect,
              }))
            : [],
        })),
      });
      setEditableQuestion(null);
    } else {
      // Xử lý single question
      const snapshot = record.questionSnapshot || {};
      const options = Array.isArray(snapshot.options) ? snapshot.options : [];

      setEditableQuestion({
        content: snapshot.content || record.questionContent || "",
        explanation: snapshot.explanation || "",
        options: options.map((opt) => ({
          label: opt.label,
          content: opt.content,
          isCorrect: !!opt.isCorrect,
        })),
      });
      setEditableQuestionGroup(null);
    }
    
    setAudioFile(null);
    setImageFile(null);
    setAudioPreviewUrl(null);
    setImagePreviewUrl(null);
    setAlsoUpdateSourceInBank(true); // Mặc định là true
    
    // Lấy test audio URL (nếu có) - cho Simulator test
    // Có thể lấy từ record hoặc cần fetch từ API
    const testAudio = record.testAudioUrl || record.globalAudioUrl || record.test?.audioUrl || null;
    setTestAudioUrl(testAudio);
    setTestAudioFile(null);
    setTestAudioPreviewUrl(null);
    
    // Nếu là Simulator test và chưa có testAudioUrl, fetch từ API
    if (!testAudio && record.testId) {
      // Kiểm tra xem có phải Simulator test không
      const isSimulator = record.testType === 1 || 
                         record.testType === "Simulator" || 
                         record.testType === "SIMULATOR" ||
                         (!record.sourceQuestionId && !record.sourceQuestionGroupId);
      
      if (isSimulator) {
        // Fetch test detail để lấy audioUrl
        getTestById(record.testId)
          .then((testData) => {
            if (testData?.audioUrl) {
              setTestAudioUrl(testData.audioUrl);
            }
          })
          .catch((error) => {
            // Silently fail - không hiển thị lỗi nếu không fetch được
          });
      }
    }

    reviewForm.setFieldsValue({
      status:
        typeof record.status === "number"
          ? record.status
          : typeof record.statusCode === "number"
          ? record.statusCode
          : statusStringToCodeMap[record.status] ?? 0,
      reviewerNotes: record?.reviewerNotes ?? "",
    });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      if (!selectedReport) return;
      const values = await reviewForm.validateFields();
      const payload = {
        status: values.status,
        reviewerNotes: values.reviewerNotes || null,
      };


      const res = await reviewReport(selectedReport.reportId, payload);
      const successMessage =
        res?.message || "Cập nhật trạng thái báo cáo thành công.";
      message.success(successMessage);
      setReviewModalOpen(false);
      setSelectedReport(null);
      fetchData();
    } catch (error) {
      // Lỗi validate form
      if (error?.errorFields) return;

      // Lỗi từ API
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Cập nhật trạng thái báo cáo thất bại.";
      message.error(apiMessage);
    }
  };

  const handleQuickUpdateQuestion = async () => {
    if (!selectedReport) return;
    
    const isQuestionGroup = selectedReport.isQuestionGroup === true || selectedReport.questionGroupSnapshot != null;
    
    if (isQuestionGroup && !editableQuestionGroup) return;
    if (!isQuestionGroup && !editableQuestion) return;

    Modal.confirm({
      title: "Cập nhật nhanh câu hỏi theo dữ liệu?",
      content:
        "Thao tác này sẽ ghi đè nội dung câu hỏi, đáp án và giải thích của câu hỏi trong bài thi bằng dữ liệu hiện tại. Bạn vẫn có thể chỉnh sửa chi tiết trong trang Quản lý bài thi sau này.",
      okText: "Cập nhật ngay",
      cancelText: "Hủy",
      okButtonProps: { danger: false, type: "primary" },
      onOk: async () => {
        try {
          setUpdatingQuestion(true);
          
          let payload = {
            alsoUpdateSourceInBank: alsoUpdateSourceInBank,
          };
          
          if (isQuestionGroup) {
            // Question group payload - chỉ gửi các fields có giá trị (partial update)
            // Passage: chỉ gửi nếu có giá trị
            if (editableQuestionGroup.passage != null && editableQuestionGroup.passage.trim() !== "") {
              payload.passage = editableQuestionGroup.passage;
            }
            
            // Audio: chỉ gửi nếu có file mới được chọn
            // Lưu ý: Với Simulator test, audio có thể dùng chung ở test level
            // Nhưng nếu user chọn file mới, vẫn gửi để update
            if (audioFile) {
              payload.audioFile = audioFile;
            }
            
            // Image: chỉ gửi nếu có file mới được chọn
            if (imageFile) {
              payload.imageFile = imageFile;
            }
            
            // Questions: chỉ gửi nếu có questions và có ít nhất 1 question có dữ liệu
            if (Array.isArray(editableQuestionGroup.questions) && editableQuestionGroup.questions.length > 0) {
              const validQuestions = editableQuestionGroup.questions
                .filter(q => q.questionId != null) // Phải có questionId
                .map((q) => {
                  const questionData = {
                    questionId: q.questionId,
                  };
                  
                  // Chỉ thêm content nếu có giá trị
                  if (q.content != null && q.content.trim() !== "") {
                    questionData.content = q.content;
                  }
                  
                  // Chỉ thêm explanation nếu có giá trị
                  if (q.explanation != null && q.explanation.trim() !== "") {
                    questionData.explanation = q.explanation;
                  }
                  
                  // Options: chỉ gửi nếu có options
                  if (Array.isArray(q.options) && q.options.length > 0) {
                    questionData.options = q.options.map(opt => ({
                      label: opt.label ?? "",
                      content: opt.content ?? "",
                      isCorrect: !!opt.isCorrect,
                    }));
                  }
                  
                  return questionData;
                })
                .filter(q => 
                  // Chỉ giữ lại question nếu có ít nhất content hoặc explanation hoặc options
                  (q.content != null && q.content.trim() !== "") ||
                  (q.explanation != null && q.explanation.trim() !== "") ||
                  (Array.isArray(q.options) && q.options.length > 0)
                );
              
              if (validQuestions.length > 0) {
                payload.questions = validQuestions;
              }
            }
          } else {
            // Single question payload - chỉ gửi các fields có giá trị (partial update)
            // Content: chỉ gửi nếu có giá trị
            if (editableQuestion.content != null && editableQuestion.content.trim() !== "") {
              payload.content = editableQuestion.content;
            }
            
            // Solution: chỉ gửi nếu có giá trị
            if (editableQuestion.explanation != null && editableQuestion.explanation.trim() !== "") {
              payload.solution = editableQuestion.explanation;
            }
            
            // Audio: chỉ gửi nếu có file mới được chọn
            // Lưu ý: Với Simulator test, audio có thể dùng chung ở test level
            // Nhưng nếu user chọn file mới, vẫn gửi để update
            if (audioFile) {
              payload.audioFile = audioFile;
            }
            
            // Image: chỉ gửi nếu có file mới được chọn
            if (imageFile) {
              payload.imageFile = imageFile;
            }
            
            // AnswerOptions: chỉ gửi nếu có options
            if (Array.isArray(editableQuestion.options) && editableQuestion.options.length > 0) {
              payload.answerOptions = editableQuestion.options.map(opt => ({
                label: opt.label ?? "",
                content: opt.content ?? "",
                isCorrect: !!opt.isCorrect,
              }));
            }
          }

          await updateTestQuestionFromReport(
            selectedReport.testQuestionId,
            payload
          );
          message.success(
            "Đã cập nhật câu hỏi trong bài thi theo dữ liệu."
          );
          
          // Reset preview URLs sau khi update thành công
          if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
            setAudioPreviewUrl(null);
          }
          if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(null);
          }
          setAudioFile(null);
          setImageFile(null);
          
          // Refresh data để hiển thị dữ liệu mới
          fetchData();
        } catch (error) {
          const errorMessage = error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              error?.message || 
                              "Không thể cập nhật câu hỏi từ báo cáo.";
          message.error(errorMessage);
        } finally {
          setUpdatingQuestion(false);
        }
      },
    });
  };

  const columns = useMemo(
    () => [
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
        dataIndex: "reportId",
        key: "reportId",
        width: 80,
        align: "center",
        render: (id) => (
          <Text strong style={{ color: "#1890ff" }}>{id}</Text>
        ),
      },
      {
        title: "Thông tin báo cáo",
        key: "reportInfo",
        width: 350,
        render: (_, record) => {
          const content = safeText(
            record?.reportedSubQuestion?.content ||
              record.questionContent ||
              record?.questionSnapshot?.content ||
              "(Không có nội dung câu hỏi)",
            "(Không có nội dung câu hỏi)"
          );
          const testName = safeText(record.testName || "—", "—");
          const testId = record.testId;
          const partName = record.partName || record.partId;
          const isGroup = record.isQuestionGroup === true || !!record.questionGroupSnapshot;
          let groupInfo = null;

          if (isGroup && record.questionGroupSnapshot && record.reportedSubQuestion) {
            const qs = Array.isArray(record.questionGroupSnapshot.questionSnapshots)
              ? record.questionGroupSnapshot.questionSnapshots
              : [];
            const idx = qs.findIndex(
              (q) => q.questionId === record.reportedSubQuestion.questionId
            );
            if (idx >= 0) {
              groupInfo = `Câu ${idx + 1}/${qs.length} trong nhóm`;
            }
          }
          
          return (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Nội dung câu hỏi:
                </Text>
                <Tooltip title={content}>
                  <Text ellipsis style={{ display: 'block', maxWidth: '100%', fontSize: 13 }}>
                    {content}
                  </Text>
                </Tooltip>
                {groupInfo && (
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    {groupInfo}
                  </Text>
                )}
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Bài thi:
                </Text>
                <Space size={4}>
                  <Text strong style={{ fontSize: 13 }}>{testName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ID: {testId} · Part {partName}
                  </Text>
                </Space>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Loại lỗi",
        dataIndex: "reportType",
        width: 130,
        render: (value) => {
          const label = reportTypeTextMap[value] || value || "Khác";
          return <Tag color="purple">{label}</Tag>;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: 140,
        render: (_, record) => {
          let statusCode = 0;

          if (typeof record.status === "number") {
            statusCode = record.status;
          } else if (typeof record.statusCode === "number") {
            statusCode = record.statusCode;
          } else if (typeof record.status === "string") {
            statusCode = statusStringToCodeMap[record.status] ?? 0;
          }

          const color = statusColorMap[statusCode] || "default";
          const text = statusTextMap[statusCode] || record.status || "Không rõ";
          return (
            <Tag color={color} style={{ minWidth: 100, textAlign: "center" }}>
              {text}
            </Tag>
          );
        },
      },
      {
        title: "Người báo cáo & Nội dung",
        key: "reporterAndDescription",
        width: 280,
        render: (_, record) => {
          const reporterName = safeText(record.reporterName || "—", "—");
          const reporterEmail = safeText(record.reporterEmail || "—", "—");
          const description = safeText(record.description || "(Không có mô tả)", "(Không có mô tả)");
          
          return (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Người báo cáo:
                </Text>
                <Space direction="vertical" size={2}>
                  <Text strong style={{ fontSize: 13 }}>{reporterName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {reporterEmail}
                  </Text>
                </Space>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Nội dung báo cáo:
                </Text>
                <Tooltip title={description}>
                  <Text 
                    ellipsis 
                    style={{ 
                      display: 'block', 
                      maxWidth: '100%', 
                      fontSize: 12,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {description}
                  </Text>
                </Tooltip>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (value) => {
          if (!value) return "—";
          const time = dayjs(value);
          return (
            <Space direction="vertical" size={0}>
              <Text>{time.format("HH:mm DD/MM/YYYY")}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {time.fromNow()}
              </Text>
            </Space>
          );
        },
        sorter: (a, b) => {
          const dateA = a.createdAt || a.CreatedAt;
          const dateB = b.createdAt || b.CreatedAt;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
        },
        defaultSortOrder: 'descend',
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 120,
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem & xử lý">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openReviewModal(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [pagination]
  );

  const renderQuestionSnapshot = (isReadOnly = false) => {
    if (!selectedReport) return null;
    
    // Kiểm tra xem là question group hay single question
    const isQuestionGroup = selectedReport.isQuestionGroup === true || selectedReport.questionGroupSnapshot != null;
    
    if (isQuestionGroup) {
      return renderQuestionGroupSnapshot(isReadOnly);
    }
    
    // Single question rendering
    const snapshot = selectedReport.questionSnapshot || {};
    const options = Array.isArray(editableQuestion?.options)
      ? editableQuestion.options
      : Array.isArray(snapshot.options)
      ? snapshot.options
      : [];

    // Kiểm tra testType: chỉ hiển thị checkbox khi test là PRACTICE
    // Practice test có question từ bank (có SourceQuestionId), Simulator thì không
    const testType = selectedReport.testType ?? snapshot.testType ?? selectedReport.TestType;
    const isPracticeTest = 
      testType === 2 || 
      testType === "Practice" || 
      testType === "PRACTICE" ||
      selectedReport.sourceQuestionId != null || // Nếu có sourceQuestionId thì là Practice
      snapshot.sourceQuestionId != null;

    const partId = snapshot.partId || selectedReport.partId;
    const skill = getSkillFromPart(partId, selectedReport.partName);
    const imageRule = requiresImage(partId, skill);
    const showAudioControls = requiresAudio(skill);
    const showImageControls = imageRule.show;

    // Kiểm tra xem có phải Simulator test và có test audio không
    const isSimulatorTest = !isPracticeTest;
    const hasTestAudio = testAudioUrl != null || testAudioPreviewUrl != null;
    // Với Simulator test, nếu có test audio thì không hiển thị nút chọn audio cho câu hỏi riêng lẻ
    const shouldShowQuestionAudioControls = showAudioControls && (!isSimulatorTest || !hasTestAudio);

    return (
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* Card tiêu đề */}
        <Card size="small">
          <Title level={5} style={{ margin: 0 }}>
            Dữ liệu câu hỏi tại thời điểm báo cáo
          </Title>
        </Card>

        {/* Card Audio chung của test (Simulator) */}
        {isSimulatorTest && (
          <Card 
            size="small" 
            title={
              <Space>
                <Text strong>Audio chung của bài thi (Simulator)</Text>
                <Tag color="blue">Dùng chung cho tất cả câu hỏi</Tag>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {(testAudioPreviewUrl || testAudioUrl) ? (
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Audio hiện tại:
                  </Text>
                  <audio
                    src={testAudioPreviewUrl || testAudioUrl}
                    controls
                    style={{ width: "100%" }}
                  />
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chưa có audio cho bài thi này. Vui lòng chọn file audio để upload.
                </Text>
              )}
              {!isReadOnly && (
                <Upload
                  accept="audio/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setTestAudioFile(file);
                    if (testAudioPreviewUrl) {
                      URL.revokeObjectURL(testAudioPreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setTestAudioPreviewUrl(url);
                    message.success(
                      "Đã chọn file audio mới cho bài thi. Nhấn 'Cập nhật audio bài thi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    {testAudioUrl ? "Thay đổi audio bài thi" : "Chọn audio bài thi"}
                  </Button>
                </Upload>
              )}
              {testAudioPreviewUrl && !isReadOnly && (
                <Button
                  size="small"
                  type="primary"
                  loading={updatingQuestion}
                  onClick={async () => {
                    if (!testAudioFile || !selectedReport?.testId) {
                      message.warning("Vui lòng chọn file audio mới.");
                      return;
                    }
                    
                    Modal.confirm({
                      title: "Cập nhật audio chung của bài thi?",
                      content: "Thao tác này sẽ thay đổi audio chung cho tất cả câu hỏi trong bài thi Simulator này. Bạn có chắc chắn muốn tiếp tục?",
                      okText: "Cập nhật",
                      cancelText: "Hủy",
                      okButtonProps: { danger: false, type: "primary" },
                      onOk: async () => {
                        try {
                          setUpdatingQuestion(true);
                          
                          // Bước 1: Upload file audio
                          const audioUrl = await uploadFile(testAudioFile, "audio");
                          
                          // Bước 2: Lấy test hiện tại
                          const currentTest = await getTestById(selectedReport.testId);
                          
                          // Bước 3: Update test với AudioUrl mới (giữ nguyên các field khác)
                          const updateData = {
                            title: currentTest.title,
                            testType: currentTest.testType,
                            testSkill: currentTest.testSkill,
                            description: currentTest.description || null,
                            audioUrl: audioUrl, // URL mới từ upload
                            parts: currentTest.parts || [], // Giữ nguyên parts
                          };
                          
                          await updateTestManual(selectedReport.testId, updateData);
                          message.success("Đã cập nhật audio chung của bài thi thành công.");
                          
                          // Cập nhật testAudioUrl để hiển thị audio mới
                          setTestAudioUrl(audioUrl);
                          
                          // Reset preview URL và file
                          if (testAudioPreviewUrl) {
                            URL.revokeObjectURL(testAudioPreviewUrl);
                            setTestAudioPreviewUrl(null);
                          }
                          setTestAudioFile(null);
                          
                          // Refresh data để hiển thị audio mới
                          fetchData();
                        } catch (error) {
                          const errorMessage = error?.response?.data?.message || 
                                              error?.response?.data?.error || 
                                              error?.message || 
                                              "Không thể cập nhật audio bài thi.";
                          message.error(errorMessage);
                        } finally {
                          setUpdatingQuestion(false);
                        }
                      },
                    });
                  }}
                >
                  Cập nhật audio bài thi
                </Button>
              )}
            </Space>
          </Card>
        )}

        {/* Card nút chức năng */}
        {!isReadOnly && (
          <Card size="small">
            <Space wrap>
              {/* Chỉ hiển thị nút chọn audio cho câu hỏi nếu không phải Simulator hoặc không có test audio */}
              {shouldShowQuestionAudioControls && (
                <Upload
                  accept="audio/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setAudioFile(file);
                    if (audioPreviewUrl) {
                      URL.revokeObjectURL(audioPreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setAudioPreviewUrl(url);
                    message.success(
                      "Đã chọn file audio mới. Nhấn 'Cập nhật câu hỏi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Chọn audio mới
                  </Button>
                </Upload>
              )}
              {showImageControls && (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setImageFile(file);
                    if (imagePreviewUrl) {
                      URL.revokeObjectURL(imagePreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setImagePreviewUrl(url);
                    message.success(
                      "Đã chọn ảnh mới. Nhấn 'Cập nhật câu hỏi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Chọn ảnh mới
                  </Button>
                </Upload>
              )}
              <Tooltip title="Cập nhật nhanh câu hỏi trong bài thi theo dữ liệu hiện tại">
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  loading={updatingQuestion}
                  onClick={handleQuickUpdateQuestion}
                >
                  Cập nhật câu hỏi
                </Button>
              </Tooltip>
            </Space>
          </Card>
        )}

        {/* Card nội dung */}
        <Card size="small">
        {/* Checkbox để update source question trong bank - chỉ hiển thị cho Practice test */}
        {!isReadOnly && isPracticeTest && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: "#e6f7ff", 
            borderRadius: 6,
            border: "1px solid #91d5ff"
          }}>
            <Checkbox
              checked={alsoUpdateSourceInBank}
              onChange={(e) => setAlsoUpdateSourceInBank(e.target.checked)}
              style={{ fontSize: 14 }}
            >
              <Text strong style={{ fontSize: 14 }}>Cập nhật cả câu hỏi gốc trong ngân hàng</Text>
            </Checkbox>
            <div style={{ marginTop: 8, marginLeft: 24 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Khi bật: Thay đổi sẽ được áp dụng cho cả câu hỏi trong bài thi và câu hỏi gốc trong ngân hàng câu hỏi
              </Text>
            </div>
          </div>
        )}
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Nội dung câu hỏi">
            <Input.TextArea
              rows={4}
              value={editableQuestion?.content}
              onChange={(e) =>
                !isReadOnly &&
                setEditableQuestion((prev) => ({
                  ...(prev || {}),
                  content: e.target.value,
                }))
              }
              disabled={isReadOnly}
              placeholder={
                editableQuestion?.content && editableQuestion.content.trim()
                  ? "Nội dung câu hỏi"
                  : "Câu hỏi không có nội dung văn bản, chỉ hình ảnh/âm thanh. Nhập nội dung mới nếu cần."
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Giải thích">
            <Input.TextArea
              rows={3}
              value={editableQuestion?.explanation}
              onChange={(e) =>
                !isReadOnly &&
                setEditableQuestion((prev) => ({
                  ...(prev || {}),
                  explanation: e.target.value,
                }))
              }
              disabled={isReadOnly}
              placeholder="Giải thích"
            />
          </Descriptions.Item>
          {(audioPreviewUrl ||
            imagePreviewUrl ||
            snapshot.audioUrl ||
            snapshot.imageUrl) && (
            <Descriptions.Item label="Âm thanh">
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                {(audioPreviewUrl || snapshot.audioUrl) && (
                  <div style={{ flex: "0 0 260px", minWidth: 220 }}>
                    <audio
                      src={audioPreviewUrl || snapshot.audioUrl}
                      controls
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
                {(imagePreviewUrl || snapshot.imageUrl) && (
                  <div
                    style={{
                      flex: "1 1 260px",
                      maxWidth: 360,
                    }}
                  >
                    <img
                      src={imagePreviewUrl || snapshot.imageUrl}
                      alt="Câu hỏi"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        objectFit: "cover",
                      }}
                    />
                    {imagePreviewUrl && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block", marginTop: 4 }}
                      >
                        Đang hiển thị ảnh mới (chưa lưu). Nhấn "Cập nhật câu hỏi"
                        để gửi lên server.
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {options.length > 0 && (
          <>
            <Divider style={{ margin: "12px 0" }} />
            <Title level={5} style={{ marginBottom: 8 }}>
              Đáp án
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              {options.map((opt) => (
                <Card
                  key={opt.label}
                  size="small"
                  style={{
                    borderColor: opt.isCorrect ? "#52c41a" : "#f0f0f0",
                    background: opt.isCorrect ? "#f6ffed" : "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    <Checkbox
                      checked={!!opt.isCorrect}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const checked = e.target.checked;
                        setEditableQuestion((prev) => {
                          const current = prev || { options: [] };
                          const newOptions = (current.options || []).map((o) => {
                            if (o.label === opt.label) {
                              return { ...o, isCorrect: checked };
                            }
                            return checked ? { ...o, isCorrect: false } : o;
                          });
                          return { ...current, options: newOptions };
                        });
                      }}
                    >
                      Đáp án đúng
                    </Checkbox>
                    <Text strong style={{ minWidth: 18 }}>{opt.label}.</Text>
                    <Input.TextArea
                      value={opt.content}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const value = e.target.value;
                        setEditableQuestion((prev) => {
                          const current = prev || { options: [] };
                          const newOptions = (current.options || []).map((o) =>
                            o.label === opt.label ? { ...o, content: value } : o
                          );
                          return { ...current, options: newOptions };
                        });
                      }}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{ flex: 1 }}
                      placeholder="Nội dung đáp án"
                    />
                  </div>
                </Card>
              ))}
            </Space>
          </>
        )}
        </Card>
      </Space>
    );
  };

  const renderQuestionGroupSnapshot = (isReadOnly = false) => {
    if (!selectedReport) return null;
    
    const groupSnapshot = selectedReport.questionGroupSnapshot || {};
    const reportedSubQuestionId =
      selectedReport.subQuestionId ??
      selectedReport?.reportedSubQuestion?.questionId ??
      null;
    
    // Lấy questions từ editableQuestionGroup nếu có, nếu không thì từ dữ liệu
    let questions = [];
    if (editableQuestionGroup && Array.isArray(editableQuestionGroup.questions)) {
      questions = editableQuestionGroup.questions;
    } else if (Array.isArray(groupSnapshot.questionSnapshots)) {
      // Map từ dữ liệu sang format editable
      questions = groupSnapshot.questionSnapshots.map((q) => ({
        questionId: q.questionId,
        content: q.content || "",
        explanation: q.explanation || "",
        options: Array.isArray(q.options) 
          ? q.options.map((opt) => ({
              label: opt.label,
              content: opt.content,
              isCorrect: !!opt.isCorrect,
            }))
          : [],
      }));
    }
    
    const passage =
      editableQuestionGroup?.passage ??
      groupSnapshot.passage ??
      selectedReport.questionContent ??
      "";
    
    // Kiểm tra testType: chỉ hiển thị checkbox khi test là PRACTICE
    const testType = selectedReport.testType ?? groupSnapshot.testType ?? selectedReport.TestType;
    const isPracticeTest = 
      testType === 2 || 
      testType === "Practice" || 
      testType === "PRACTICE" ||
      selectedReport.sourceQuestionGroupId != null || // Nếu có sourceQuestionGroupId thì là Practice
      groupSnapshot.sourceQuestionGroupId != null;

    const partId = groupSnapshot.partId || selectedReport.partId;
    const skill = getSkillFromPart(partId, selectedReport.partName);
    const imageRule = requiresImage(partId, skill);
    const showAudioControls = requiresAudio(skill);
    const showImageControls = imageRule.show;
    
    // Kiểm tra xem có phải Simulator test và có test audio không
    const isSimulatorTest = !isPracticeTest;
    const hasTestAudio = testAudioUrl != null || testAudioPreviewUrl != null;
    // Với Simulator test, nếu có test audio thì không hiển thị nút chọn audio cho câu hỏi riêng lẻ
    const shouldShowQuestionAudioControls = showAudioControls && (!isSimulatorTest || !hasTestAudio);

    return (
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* Card tiêu đề */}
        <Card size="small">
          <Title level={5} style={{ margin: 0 }}>
            Dữ liệu nhóm câu hỏi tại thời điểm báo cáo
          </Title>
        </Card>

        {/* Card Audio chung của test (Simulator) */}
        {isSimulatorTest && (
          <Card 
            size="small" 
            title={
              <Space>
                <Text strong>Audio chung của bài thi (Simulator)</Text>
                <Tag color="blue">Dùng chung cho tất cả câu hỏi</Tag>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {(testAudioPreviewUrl || testAudioUrl) ? (
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Audio hiện tại:
                  </Text>
                  <audio
                    src={testAudioPreviewUrl || testAudioUrl}
                    controls
                    style={{ width: "100%" }}
                  />
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chưa có audio cho bài thi này. Vui lòng chọn file audio để upload.
                </Text>
              )}
              {!isReadOnly && (
                <Upload
                  accept="audio/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setTestAudioFile(file);
                    if (testAudioPreviewUrl) {
                      URL.revokeObjectURL(testAudioPreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setTestAudioPreviewUrl(url);
                    message.success(
                      "Đã chọn file audio mới cho bài thi. Nhấn 'Cập nhật audio bài thi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    {testAudioUrl ? "Thay đổi audio bài thi" : "Chọn audio bài thi"}
                  </Button>
                </Upload>
              )}
              {testAudioPreviewUrl && !isReadOnly && (
                <Button
                  size="small"
                  type="primary"
                  loading={updatingQuestion}
                  onClick={async () => {
                    if (!testAudioFile || !selectedReport?.testId) {
                      message.warning("Vui lòng chọn file audio mới.");
                      return;
                    }
                    
                    Modal.confirm({
                      title: "Cập nhật audio chung của bài thi?",
                      content: "Thao tác này sẽ thay đổi audio chung cho tất cả câu hỏi trong bài thi Simulator này. Bạn có chắc chắn muốn tiếp tục?",
                      okText: "Cập nhật",
                      cancelText: "Hủy",
                      okButtonProps: { danger: false, type: "primary" },
                      onOk: async () => {
                        try {
                          setUpdatingQuestion(true);
                          
                          // Bước 1: Upload file audio
                          const audioUrl = await uploadFile(testAudioFile, "audio");
                          
                          // Bước 2: Lấy test hiện tại
                          const currentTest = await getTestById(selectedReport.testId);
                          
                          // Bước 3: Update test với AudioUrl mới (giữ nguyên các field khác)
                          const updateData = {
                            title: currentTest.title,
                            testType: currentTest.testType,
                            testSkill: currentTest.testSkill,
                            description: currentTest.description || null,
                            audioUrl: audioUrl, // URL mới từ upload
                            parts: currentTest.parts || [], // Giữ nguyên parts
                          };
                          
                          await updateTestManual(selectedReport.testId, updateData);
                          message.success("Đã cập nhật audio chung của bài thi thành công.");
                          
                          // Cập nhật testAudioUrl để hiển thị audio mới
                          setTestAudioUrl(audioUrl);
                          
                          // Reset preview URL và file
                          if (testAudioPreviewUrl) {
                            URL.revokeObjectURL(testAudioPreviewUrl);
                            setTestAudioPreviewUrl(null);
                          }
                          setTestAudioFile(null);
                          
                          // Refresh data để hiển thị audio mới
                          fetchData();
                        } catch (error) {
                          const errorMessage = error?.response?.data?.message || 
                                              error?.response?.data?.error || 
                                              error?.message || 
                                              "Không thể cập nhật audio bài thi.";
                          message.error(errorMessage);
                        } finally {
                          setUpdatingQuestion(false);
                        }
                      },
                    });
                  }}
                >
                  Cập nhật audio bài thi
                </Button>
              )}
            </Space>
          </Card>
        )}

        {/* Card nút chức năng */}
        {!isReadOnly && (
          <Card size="small">
            <Space wrap>
              {/* Chỉ hiển thị nút chọn audio cho câu hỏi nếu không phải Simulator hoặc không có test audio */}
              {shouldShowQuestionAudioControls && (
                <Upload
                  accept="audio/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setAudioFile(file);
                    if (audioPreviewUrl) {
                      URL.revokeObjectURL(audioPreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setAudioPreviewUrl(url);
                    message.success(
                      "Đã chọn file audio mới. Nhấn 'Cập nhật câu hỏi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Chọn audio mới
                  </Button>
                </Upload>
              )}
              {showImageControls && (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setImageFile(file);
                    if (imagePreviewUrl) {
                      URL.revokeObjectURL(imagePreviewUrl);
                    }
                    const url = URL.createObjectURL(file);
                    setImagePreviewUrl(url);
                    message.success(
                      "Đã chọn ảnh mới. Nhấn 'Cập nhật câu hỏi' để lưu."
                    );
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Chọn ảnh mới
                  </Button>
                </Upload>
              )}
              <Tooltip title="Cập nhật nhanh nhóm câu hỏi trong bài thi theo dữ liệu hiện tại">
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  loading={updatingQuestion}
                  onClick={handleQuickUpdateQuestion}
                >
                  Cập nhật câu hỏi
                </Button>
              </Tooltip>
            </Space>
          </Card>
        )}

        {/* Card nội dung */}
        <Card size="small">
        {/* Checkbox để update source question trong bank - chỉ hiển thị cho Practice test */}
        {!isReadOnly && isPracticeTest && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: "#e6f7ff", 
            borderRadius: 6,
            border: "1px solid #91d5ff"
          }}>
            <Checkbox
              checked={alsoUpdateSourceInBank}
              onChange={(e) => setAlsoUpdateSourceInBank(e.target.checked)}
              style={{ fontSize: 14 }}
            >
              <Text strong style={{ fontSize: 14 }}>Cập nhật cả nhóm câu hỏi gốc trong ngân hàng</Text>
            </Checkbox>
            <div style={{ marginTop: 8, marginLeft: 24 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Khi bật: Thay đổi sẽ được áp dụng cho cả nhóm câu hỏi trong bài thi và nhóm câu hỏi gốc trong ngân hàng câu hỏi
              </Text>
            </div>
          </div>
        )}
        
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Đoạn văn">
            <Input.TextArea
              rows={6}
              value={passage}
              onChange={(e) =>
                !isReadOnly &&
                setEditableQuestionGroup((prev) => ({
                  ...(prev || { questions: [] }),
                  passage: e.target.value,
                }))
              }
              disabled={isReadOnly}
              placeholder="Nội dung đoạn văn"
            />
          </Descriptions.Item>
          
          {(audioPreviewUrl ||
            imagePreviewUrl ||
            groupSnapshot.audioUrl ||
            groupSnapshot.imageUrl) && (
            <Descriptions.Item label="Âm thanh">
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                {(audioPreviewUrl || groupSnapshot.audioUrl) && (
                  <div style={{ flex: "0 0 260px", minWidth: 220 }}>
                    <audio
                      src={audioPreviewUrl || groupSnapshot.audioUrl}
                      controls
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
                {(imagePreviewUrl || groupSnapshot.imageUrl) && (
                  <div
                    style={{
                      flex: "1 1 260px",
                      maxWidth: 360,
                    }}
                  >
                    <img
                      src={imagePreviewUrl || groupSnapshot.imageUrl}
                      alt="Nhóm câu hỏi"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        objectFit: "cover",
                      }}
                    />
                    {imagePreviewUrl && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block", marginTop: 4 }}
                      >
                        Đang hiển thị ảnh mới (chưa lưu). Nhấn "Cập nhật câu hỏi"
                        để gửi lên server.
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {questions.length > 0 && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Title level={5} style={{ marginBottom: 12 }}>
              Các câu hỏi trong nhóm ({questions.length} câu)
            </Title>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {questions.map((q, qIndex) => {
                const questionId = q.questionId ?? qIndex;
                const questionContent = q.content ?? "";
                const questionExplanation = q.explanation ?? "";
                const questionOptions = Array.isArray(q.options) ? q.options : [];
                const isReported =
                  reportedSubQuestionId != null &&
                  questionId === reportedSubQuestionId;
                
                return (
                  <Card
                    key={questionId}
                    size="small"
                    title={
                      <Space>
                        <span>{`Câu ${qIndex + 1}${
                          questionId ? ` (ID: ${questionId})` : ""
                        }`}</span>
                        {isReported && (
                          <Tag color="red" style={{ marginLeft: 8 }}>
                            ĐANG BỊ BÁO CÁO
                          </Tag>
                        )}
                      </Space>
                    }
                    style={{
                      border: isReported ? "2px solid #fa8c16" : "1px solid #e5e7eb",
                      boxShadow: isReported
                        ? "0 0 0 2px rgba(250,140,22,0.12)"
                        : "none",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                      <div>
                        <Text strong style={{ display: "block", marginBottom: 4 }}>
                          Nội dung câu hỏi:
                        </Text>
                        <Input.TextArea
                          rows={2}
                          value={questionContent}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            setEditableQuestionGroup((prev) => {
                              const current = prev || { passage: "", questions: [] };
                              const newQuestions = [...(current.questions || [])];
                              if (newQuestions[qIndex]) {
                                newQuestions[qIndex] = {
                                  ...newQuestions[qIndex],
                                  content: e.target.value,
                                };
                              } else {
                                newQuestions[qIndex] = {
                                  questionId,
                                  content: e.target.value,
                                  explanation: "",
                                  options: [],
                                };
                              }
                              return { ...current, questions: newQuestions };
                            });
                          }}
                          disabled={isReadOnly}
                          placeholder="Nội dung câu hỏi"
                        />
                      </div>
                      
                      <div>
                        <Text strong style={{ display: "block", marginBottom: 4 }}>
                          Giải thích:
                        </Text>
                        <Input.TextArea
                          rows={2}
                          value={questionExplanation}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            setEditableQuestionGroup((prev) => {
                              const current = prev || { passage: "", questions: [] };
                              const newQuestions = [...(current.questions || [])];
                              if (newQuestions[qIndex]) {
                                newQuestions[qIndex] = {
                                  ...newQuestions[qIndex],
                                  explanation: e.target.value,
                                };
                              } else {
                                newQuestions[qIndex] = {
                                  questionId,
                                  content: "",
                                  explanation: e.target.value,
                                  options: [],
                                };
                              }
                              return { ...current, questions: newQuestions };
                            });
                          }}
                          disabled={isReadOnly}
                          placeholder="Giải thích đáp án"
                        />
                      </div>
                      
                      {questionOptions.length > 0 && (
                        <div>
                          <Text strong style={{ display: "block", marginBottom: 8 }}>
                            Đáp án:
                          </Text>
                          <Space direction="vertical" style={{ width: "100%" }} size="small">
                            {questionOptions.map((opt) => (
                              <Card
                                key={opt.label}
                                size="small"
                                style={{
                                  borderColor: opt.isCorrect ? "#52c41a" : "#f0f0f0",
                                  background: opt.isCorrect ? "#f6ffed" : "#ffffff",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 12,
                                    width: "100%",
                                  }}
                                >
                                  <Checkbox
                                    checked={!!opt.isCorrect}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                      if (isReadOnly) return;
                                      const checked = e.target.checked;
                                      setEditableQuestionGroup((prev) => {
                                        const current = prev || { passage: "", questions: [] };
                                        const newQuestions = [...(current.questions || [])];
                                        if (!newQuestions[qIndex]) {
                                          newQuestions[qIndex] = {
                                            questionId,
                                            content: "",
                                            explanation: "",
                                            options: [],
                                          };
                                        }
                                        const newOptions = (newQuestions[qIndex].options || []).map(
                                          (o) => {
                                            if (o.label === opt.label) {
                                              return { ...o, isCorrect: checked };
                                            }
                                            return checked ? { ...o, IsCorrect: false } : o;
                                          }
                                        );
                                        newQuestions[qIndex] = {
                                          ...newQuestions[qIndex],
                                          options: newOptions,
                                        };
                                        return { ...current, questions: newQuestions };
                                      });
                                    }}
                                  >
                                    Đáp án đúng
                                  </Checkbox>
                                  <Text strong style={{ minWidth: 18 }}>{opt.label}.</Text>
                                  <Input.TextArea
                                    value={opt.content}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                      if (isReadOnly) return;
                                      const value = e.target.value;
                                      setEditableQuestionGroup((prev) => {
                                        const current = prev || { passage: "", questions: [] };
                                        const newQuestions = [...(current.questions || [])];
                                        if (!newQuestions[qIndex]) {
                                          newQuestions[qIndex] = {
                                            questionId,
                                            content: "",
                                            explanation: "",
                                            options: [],
                                          };
                                        }
                                        const newOptions = (newQuestions[qIndex].options || []).map(
                                          (o) =>
                                            o.label === opt.label
                                              ? { ...o, content: value }
                                              : o
                                        );
                                        newQuestions[qIndex] = {
                                          ...newQuestions[qIndex],
                                          options: newOptions,
                                        };
                                        return { ...current, questions: newQuestions };
                                      });
                                    }}
                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                    style={{ flex: 1 }}
                                    placeholder="Nội dung đáp án"
                                  />
                                </div>
                              </Card>
                            ))}
                          </Space>
                        </div>
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </>
        )}
        </Card>
      </Space>
    );
  };

  return (
    <div className="animate-fade-in">
      <Space
        align="center"
        style={{ marginBottom: 20, justifyContent: "space-between", width: "100%" }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            Quản lý báo cáo câu hỏi
          </Title>
         
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData()}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={24}>
            <Space size="middle" direction="vertical" style={{ width: "100%" }}>
              {/* Dòng 1: Tìm kiếm */}
              <div style={{ width: "100%" }}>
                <Input.Search
                  placeholder="Tìm kiếm theo ID, nội dung câu hỏi, bài thi, người báo cáo..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={filters.searchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev) => ({ ...prev, searchText: value }));
                    // Tự động filter khi người dùng nhập (debounce có thể thêm sau nếu cần)
                    handleFilterChange({ searchText: value });
                  }}
                  onSearch={(value) => {
                    handleFilterChange({ searchText: value });
                  }}
                  style={{ maxWidth: 600 }}
                />
              </div>
              
              {/* Dòng 2: Các filter khác */}
              <Space size="middle" wrap>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Text type="secondary" style={{ margin: 0 }}>
                    Trạng thái
                  </Text>
                  <Select
                    style={{ width: 180 }}
                    value={filters.status}
                    onChange={(value) =>
                      handleFilterChange({
                        status: value,
                      })
                    }
                  >
                    {statusOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Text type="secondary" style={{ margin: 0 }}>
                    Loại lỗi
                  </Text>
                  <Select
                    style={{ width: 200 }}
                    value={filters.reportType}
                    onChange={(value) =>
                      handleFilterChange({
                        reportType: value,
                      })
                    }
                  >
                    <Option value="all">Tất cả loại lỗi</Option>
                    {Object.entries(reportTypeTextMap).map(([key, label]) => (
                      <Option key={key} value={key}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Text type="secondary" style={{ margin: 0 }}>
                    Lọc theo ngày
                  </Text>
                  <DatePicker.RangePicker
                    value={filters.dateRange}
                    onChange={(dates) =>
                      handleFilterChange({
                        dateRange: dates,
                      })
                    }
                    style={{ width: 300 }}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    allowClear
                  />
                </div>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        rowKey="reportId"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} báo cáo`,
        }}
        scroll={{ x: 1340 }}
        onChange={handleTableChange}
        size="middle"
      />

      <Modal
        open={reviewModalOpen}
        onCancel={() => {
          setReviewModalOpen(false);
          setSelectedReport(null);
        }}
        onOk={(() => {
          if (!selectedReport) return handleReviewSubmit;
          let statusCode = 0;
          if (typeof selectedReport.status === "number") {
            statusCode = selectedReport.status;
          } else if (typeof selectedReport.statusCode === "number") {
            statusCode = selectedReport.statusCode;
          } else if (typeof selectedReport.status === "string") {
            statusCode = statusStringToCodeMap[selectedReport.status] ?? 0;
          }
          const isReadOnly = statusCode === 2 || statusCode === 3; // Resolved hoặc Rejected
          return isReadOnly ? undefined : handleReviewSubmit;
        })()}
        title="Chi tiết báo cáo & xử lý"
        okText={(() => {
          if (!selectedReport) return "Lưu xử lý";
          let statusCode = 0;
          if (typeof selectedReport.status === "number") {
            statusCode = selectedReport.status;
          } else if (typeof selectedReport.statusCode === "number") {
            statusCode = selectedReport.statusCode;
          } else if (typeof selectedReport.status === "string") {
            statusCode = statusStringToCodeMap[selectedReport.status] ?? 0;
          }
          const isReadOnly = statusCode === 2 || statusCode === 3; // Resolved hoặc Rejected
          return isReadOnly ? undefined : "Lưu xử lý";
        })()}
        cancelText="Đóng"
        width={1100}
      >
        {selectedReport && (() => {
          // Tính isReadOnly một lần để dùng chung
          let statusCode = 0;
          if (typeof selectedReport.status === "number") {
            statusCode = selectedReport.status;
          } else if (typeof selectedReport.statusCode === "number") {
            statusCode = selectedReport.statusCode;
          } else if (typeof selectedReport.status === "string") {
            statusCode = statusStringToCodeMap[selectedReport.status] ?? 0;
          }
          const isReadOnlyModal = statusCode === 2 || statusCode === 3; // Resolved hoặc Rejected
          
          return (
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%" }}
          >
            <Row gutter={16}>
              <Col xs={24} md={10}>
                <Card size="small" title="Thông tin báo cáo">
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="ID báo cáo">
                      {selectedReport.reportId}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID câu hỏi trong bài thi">
                      {selectedReport.testQuestionId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bài thi">
                      <Space direction="vertical" size={0}>
                        <Text strong>{selectedReport.testName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ID: {selectedReport.testId}
                        </Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại test">
                      {(() => {
                        // Ưu tiên lấy từ testType trực tiếp
                        const testType = selectedReport.testType ?? selectedReport.TestType;
                        if (testType === 1 || testType === "Simulator" || testType === "SIMULATOR") {
                          return <Tag color="blue">Simulator</Tag>;
                        } else if (testType === 2 || testType === "Practice" || testType === "PRACTICE") {
                          return <Tag color="green">Practice</Tag>;
                        }
                        // Nếu không có testType, suy luận từ sourceQuestionId/sourceQuestionGroupId
                        const hasSourceId = selectedReport.sourceQuestionId != null || 
                                          selectedReport.sourceQuestionGroupId != null ||
                                          selectedReport?.questionSnapshot?.sourceQuestionId != null ||
                                          selectedReport?.questionGroupSnapshot?.sourceQuestionGroupId != null;
                        if (hasSourceId) {
                          return <Tag color="green">Practice</Tag>;
                        }
                        // Nếu không có sourceId, suy luận từ testName (nếu có "Simulator" trong tên)
                        const testName = (selectedReport.testName || "").toLowerCase();
                        if (testName.includes("simulator")) {
                          return <Tag color="blue">Simulator</Tag>;
                        }
                        // Mặc định: không xác định
                        return <Tag color="default">Không xác định</Tag>;
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phần">
                      {selectedReport.partName || selectedReport.partId}
                    </Descriptions.Item>
                    {/* Với question group: hiển thị rõ câu nào đang bị report */}
                    {selectedReport.isQuestionGroup && (
                      <>
                        <Descriptions.Item label="Số câu trong nhóm">
                          {selectedReport.groupQuestionCount ?? 
                           (selectedReport?.questionGroupSnapshot?.questionSnapshots?.length ?? 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Câu bị report trong group">
                          {(() => {
                            const reportedId =
                              selectedReport.subQuestionId ??
                              selectedReport?.reportedSubQuestion?.questionId ??
                              null;
                            if (!reportedId) return "Không xác định";
                            const qs =
                              selectedReport?.questionGroupSnapshot?.questionSnapshots || [];
                            const idx = qs.findIndex((q) => q.questionId === reportedId);
                            return idx >= 0
                              ? `Câu ${idx + 1}/${qs.length} (ID: ${reportedId})`
                              : `ID: ${reportedId}`;
                          })()}
                        </Descriptions.Item>
                      </>
                    )}
                    {/* Hiển thị sourceQuestionId/sourceQuestionGroupId nếu có (Practice test) */}
                    {selectedReport.sourceQuestionId && (
                      <Descriptions.Item label="ID câu hỏi gốc (Bank)">
                        {selectedReport.sourceQuestionId}
                      </Descriptions.Item>
                    )}
                    {selectedReport.sourceQuestionGroupId && (
                      <Descriptions.Item label="ID nhóm câu hỏi gốc (Bank)">
                        {selectedReport.sourceQuestionGroupId}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Người báo cáo">
                      <Space direction="vertical" size={0}>
                        <Text strong>{selectedReport.reporterName}</Text>
                        <Text type="secondary">
                          {selectedReport.reporterEmail}
                        </Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại lỗi">
                      <Tag color="purple">
                        {reportTypeTextMap[selectedReport.reportType] ??
                          selectedReport.reportType}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian báo cáo">
                      {selectedReport.createdAt
                        ? dayjs(selectedReport.createdAt).format(
                            "HH:mm DD/MM/YYYY"
                          )
                        : "—"}
                    </Descriptions.Item>
                    {/* Hiển thị thông tin người review nếu đã được review */}
                    {selectedReport.reviewedBy && (
                      <Descriptions.Item label="Người xử lý">
                        <Space direction="vertical" size={0}>
                          <Text strong>{selectedReport.reviewerName || "—"}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {selectedReport.reviewedBy}
                          </Text>
                        </Space>
                      </Descriptions.Item>
                    )}
                    {selectedReport.reviewedAt && (
                      <Descriptions.Item label="Thời gian xử lý">
                        {dayjs(selectedReport.reviewedAt).format("HH:mm DD/MM/YYYY")}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <Divider style={{ margin: "12px 0" }} />

                  <Text strong>Nội dung người dùng báo cáo</Text>
                  <Paragraph style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                    {selectedReport.description || "(Không có mô tả)"}
                  </Paragraph>
                </Card>

                <Card
                  size="small"
                  style={{ marginTop: 16 }}
                  title={
                    <Space>
                      <ExclamationCircleOutlined />
                      <span>Thông tin xử lý</span>
                    </Space>
                  }
                >
                  <Form layout="vertical" form={reviewForm}>
                    <Form.Item
                      name="status"
                      label="Trạng thái xử lý"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn trạng thái xử lý",
                        },
                      ]}
                    >
                      <Select disabled={isReadOnlyModal}>
                        {statusOptions
                          .filter((opt) => opt.value !== "all")
                          .map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="reviewerNotes"
                      label="Ghi chú của người duyệt"
                  extra={
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        display: "block",
                        paddingRight: 80, 
                        lineHeight: 1.4,
                      }}
                    >
                      Ghi lý do chấp nhận / từ chối và các thay đổi đã thực
                      hiện.
                    </span>
                  }
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Nhập ghi chú xử lý (tối đa 1000 ký tự)"
                        showCount
                        maxLength={1000}
                        disabled={isReadOnlyModal}
                      />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} md={14}>
                {renderQuestionSnapshot(isReadOnlyModal)}
              </Col>
            </Row>
          </Space>
          );
        })()}
      </Modal>
    </div>
  );
}
