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
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
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
} from "@shared/constants/toeicStructure";
import {
  getQuestionReports,
  reviewReport,
  updateTestQuestionFromReport,
} from "@services/questionReportService";

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

export default function QuestionReportManagement() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    // Mặc định: lấy tất cả trạng thái, không filter theo status
    status: "all",
    page: 1,
    // Mặc định lấy nhiều bản ghi để hạn chế phải chuyển trang
    pageSize: 1000,
  });
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
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

      const itemsArray = Array.isArray(items)
        ? items
        : Array.isArray(items.data)
        ? items.data
        : [];

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

      setDataSource(itemsArray);
      setPagination({
        current: pageNumber,
        pageSize,
        total,
      });
      setFilters(merged);
    } catch (error) {
      console.error("Failed to load question reports", error);
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
    fetchData({
      page: pag.current,
      pageSize: pag.pageSize,
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
      // eslint-disable-next-line no-console
      console.error("Failed to review report", error);
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
      title: "Cập nhật nhanh câu hỏi theo snapshot?",
      content:
        "Thao tác này sẽ ghi đè nội dung câu hỏi, đáp án và giải thích của TestQuestion bằng dữ liệu snapshot hiện tại. Bạn vẫn có thể chỉnh sửa chi tiết trong trang Quản lý Test sau này.",
      okText: "Cập nhật ngay",
      cancelText: "Hủy",
      okButtonProps: { danger: false, type: "primary" },
      onOk: async () => {
        try {
          setUpdatingQuestion(true);
          
          let payload;
          if (isQuestionGroup) {
            // Question group payload
            payload = {
              passage: editableQuestionGroup.passage ?? "",
              alsoUpdateSourceInBank: alsoUpdateSourceInBank,
              audioFile,
              imageFile,
              questions: Array.isArray(editableQuestionGroup.questions)
                ? editableQuestionGroup.questions.map((q) => ({
                    questionId: q.questionId,
                    content: q.content ?? "",
                    explanation: q.explanation ?? "",
                    options: Array.isArray(q.options) ? q.options : [],
                  }))
                : [],
            };
          } else {
            // Single question payload
            payload = {
              content: editableQuestion.content ?? "",
              solution: editableQuestion.explanation ?? "",
              alsoUpdateSourceInBank: alsoUpdateSourceInBank,
              audioFile,
              imageFile,
              answerOptions: Array.isArray(editableQuestion.options)
                ? editableQuestion.options
                : [],
            };
          }

          await updateTestQuestionFromReport(
            selectedReport.testQuestionId,
            payload
          );
          message.success(
            "Đã cập nhật câu hỏi trong bài test theo dữ liệu snapshot."
          );
        } catch (error) {
          console.error("Failed to update test question from report", error);
          message.error("Không thể cập nhật câu hỏi từ báo cáo.");
        } finally {
          setUpdatingQuestion(false);
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: "Câu hỏi",
        dataIndex: "questionContent",
        width: 260,
        ellipsis: true,
        render: (text, record) => {
          const content =
            text ||
            record?.questionSnapshot?.content ||
            "(Không có nội dung câu hỏi)";
          return (
            <Tooltip title={content}>
              <span>{content}</span>
            </Tooltip>
          );
        },
      },
      {
        title: "Bài test",
        dataIndex: "testName",
        width: 200,
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Text strong ellipsis style={{ maxWidth: 180 }}>
              {text || "—"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.testId} · Part {record.partName || record.partId}
            </Text>
          </Space>
        ),
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
        title: "Người báo cáo",
        dataIndex: "reporterName",
        width: 200,
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.reporterEmail}
            </Text>
          </Space>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
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
    []
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

    return (
      <Card
        size="small"
        title="Snapshot câu hỏi tại thời điểm báo cáo"
        extra={
          !isReadOnly && (
            <Space>
              {showAudioControls && (
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
              <Tooltip title="Cập nhật nhanh câu hỏi trong bài test theo snapshot hiện tại">
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
          )
        }
      >
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
                Khi bật: Thay đổi sẽ được áp dụng cho cả câu hỏi trong bài test và câu hỏi gốc trong ngân hàng câu hỏi
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
              placeholder="Giải thích / Solution"
            />
          </Descriptions.Item>
          {(audioPreviewUrl ||
            imagePreviewUrl ||
            snapshot.audioUrl ||
            snapshot.imageUrl) && (
            <Descriptions.Item label="Media">
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
                      alt="Question"
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
                  <Space>
                    <Checkbox
                      checked={!!opt.isCorrect}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const checked = e.target.checked;
                        setEditableQuestion((prev) => {
                          const current = prev || { options: [] };
                          const newOptions = (current.options || []).map(
                            (o) => {
                              if (o.label === opt.label) {
                                // Đáp án vừa click: set theo checked
                                return { ...o, isCorrect: checked };
                              }
                              // Các đáp án khác: nếu chọn mới thì tất cả phải false (chỉ cho 1 đáp án đúng)
                              return checked ? { ...o, isCorrect: false } : o;
                            }
                          );
                          return { ...current, options: newOptions };
                        });
                      }}
                    >
                      Đáp án đúng
                    </Checkbox>
                    <Text strong>{opt.label}.</Text>
                    <Input
                      value={opt.content}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        const value = e.target.value;
                        setEditableQuestion((prev) => {
                          const current = prev || { options: [] };
                          const newOptions = (current.options || []).map(
                            (o) =>
                              o.label === opt.label
                                ? { ...o, content: value }
                                : o
                          );
                          return { ...current, options: newOptions };
                        });
                      }}
                      placeholder="Nội dung đáp án"
                    />
                  </Space>
                </Card>
              ))}
            </Space>
          </>
        )}
      </Card>
    );
  };

  const renderQuestionGroupSnapshot = (isReadOnly = false) => {
    if (!selectedReport) return null;
    
    const groupSnapshot = selectedReport.questionGroupSnapshot || {};
    
    // Lấy questions từ editableQuestionGroup nếu có, nếu không thì từ snapshot
    let questions = [];
    if (editableQuestionGroup && Array.isArray(editableQuestionGroup.questions)) {
      questions = editableQuestionGroup.questions;
    } else if (Array.isArray(groupSnapshot.questionSnapshots)) {
      // Map từ snapshot sang format editable
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
    
    const passage = editableQuestionGroup?.passage ?? groupSnapshot.passage ?? selectedReport.questionContent ?? "";
    
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

    return (
      <Card
        size="small"
        title="Snapshot nhóm câu hỏi tại thời điểm báo cáo"
        extra={
          !isReadOnly && (
            <Space>
              {showAudioControls && (
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
              <Tooltip title="Cập nhật nhanh nhóm câu hỏi trong bài test theo snapshot hiện tại">
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
          )
        }
      >
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
                Khi bật: Thay đổi sẽ được áp dụng cho cả nhóm câu hỏi trong bài test và nhóm câu hỏi gốc trong ngân hàng câu hỏi
              </Text>
            </div>
          </div>
        )}
        
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Đoạn văn (Passage)">
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
              placeholder="Nội dung đoạn văn / passage"
            />
          </Descriptions.Item>
          
          {(audioPreviewUrl ||
            imagePreviewUrl ||
            groupSnapshot.audioUrl ||
            groupSnapshot.imageUrl) && (
            <Descriptions.Item label="Media">
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
                      alt="Question Group"
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
                
                return (
                  <Card
                    key={questionId}
                    size="small"
                    title={`Câu ${qIndex + 1}${questionId ? ` (ID: ${questionId})` : ""}`}
                    style={{ border: "1px solid #e5e7eb" }}
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
                                <Space>
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
                                            return checked ? { ...o, isCorrect: false } : o;
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
                                  <Text strong>{opt.label}.</Text>
                                  <Input
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
                                    placeholder="Nội dung đáp án"
                                  />
                                </Space>
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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
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
        scroll={{ x: 1200 }}
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
        width={900}
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
                    <Descriptions.Item label="Report ID">
                      {selectedReport.reportId}
                    </Descriptions.Item>
                    <Descriptions.Item label="TestQuestion ID">
                      {selectedReport.testQuestionId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bài test">
                      {selectedReport.testName} (ID: {selectedReport.testId})
                    </Descriptions.Item>
                    <Descriptions.Item label="Part">
                      {selectedReport.partName || selectedReport.partId}
                    </Descriptions.Item>
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


