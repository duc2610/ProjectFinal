import React, { useState, useEffect } from "react";
import { Tabs, Form, Input, Button, Row, Col, Modal, notification, Table, Tag, Space, Empty, message } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { changePassword } from "@services/authService";
import { getTestHistory } from "@services/testsService";
import { startTest } from "@services/testExamService";
import { getMyQuestionReports } from "@services/questionReportService";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Tabs
          defaultActiveKey="personal"
          className={styles.tabs}
          items={[
            {
              key: "personal",
              label: "Thông tin cá nhân",
              children: <PersonalTab user={user} />,
            },
            {
              key: "history",
              label: "Lịch sử thi",
              children: <TestHistoryTab />,
            },
            {
              key: "report",
              label: "Lịch sử báo cáo",
              children: <ReportTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function PersonalTab({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const { oldPassword, newPassword, confirmNewPassword } = values;
      await changePassword({ oldPassword, newPassword, confirmNewPassword });
      notification.success({
        message: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật.",
      });
      handleCancel();
    } catch (error) {
      const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      if (
        msg.toLowerCase().includes("old password") ||
        msg.toLowerCase().includes("mật khẩu cũ") ||
        msg.toLowerCase().includes("current password")
      ) {
        form.setFields([
          {
            name: "oldPassword",
            errors: [msg],
          },
        ]);
      } else {
        notification.error({
          message: "Đổi mật khẩu thất bại",
          description: msg,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.tabPane}>
        <h2 className={styles.title}>Thông tin cá nhân</h2>

        <Row gutter={32} justify="center">
          <Col xs={24} sm={20} md={18} lg={16} xl={14}>
            <Form layout="vertical" className={styles.form}>
              <Form.Item label="Họ và tên">
                <Input value={user?.fullName || ""} readOnly />
              </Form.Item>
              <Form.Item label="Email">
                <Input value={user?.email || ""} readOnly />
              </Form.Item>

              <Button block className={styles.primaryBtn} onClick={showModal}>
                Đổi mật khẩu
              </Button>
              <Button block className={styles.ghostBtn} type="default">
                Cập nhật thông tin
              </Button>
            </Form>
          </Col>
        </Row>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onOk={() => form.submit()}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        onCancel={handleCancel}
        closable
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.form}
          onFinish={onFinish}
          name="change-password-form"
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                message:
                  "Phải có ít nhất 1 chữ và 1 số; chỉ gồm chữ và số (không khoảng trắng/ký tự đặc biệt)",
              },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export function TestHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getTestHistory();
      const historyList = Array.isArray(data) ? data : [];
      
      // Normalize data: convert PascalCase to camelCase để đảm bảo match với backend
      const normalizedHistory = historyList.map(item => ({
        testId: item.testId || item.TestId,
        testResultId: item.testResultId || item.TestResultId,
        testStatus: item.testStatus || item.TestStatus,
        testType: item.testType || item.TestType,
        testSkill: item.testSkill || item.TestSkill,
        title: item.title || item.Title,
        duration: item.duration || item.Duration,
        createdAt: item.createdAt || item.CreatedAt,
        totalQuestion: item.totalQuestion || item.TotalQuestion,
        correctQuestion: item.correctQuestion || item.CorrectQuestion,
        totalScore: item.totalScore || item.TotalScore,
      }));
      
      setHistory(normalizedHistory);
    } catch (error) {
      console.error("Error fetching test history:", error);
      message.error("Không thể tải lịch sử thi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSkillLabel = (skill) => {
    // Xử lý cả số và string
    if (typeof skill === "string") {
      const upper = skill.toUpperCase();
      if (upper === "LR" || upper === "LISTENING & READING") return "Listening & Reading";
      if (upper === "SW" || upper === "S&W") return "S&W";
      return skill;
    }
    const skillMap = {
      1: "Speaking",
      2: "Writing",
      3: "Listening & Reading",
      4: "S&W",
    };
    return skillMap[skill] || skill;
  };

  const getSkillColor = (skill) => {
    // Xử lý cả số và string
    if (typeof skill === "string") {
      const upper = skill.toUpperCase();
      if (upper === "LR" || upper === "LISTENING & READING") return "purple";
      if (upper === "SW" || upper === "S&W") return "blue";
      if (upper === "SPEAKING") return "green";
      if (upper === "WRITING") return "cyan";
      return "default";
    }
    const colorMap = {
      1: "green",
      2: "cyan",
      3: "purple",
      4: "blue",
    };
    return colorMap[skill] || "default";
  };

  const getTestTypeLabel = (type) => {
    // Xử lý cả số và string
    if (typeof type === "string") {
      const lower = type.toLowerCase();
      if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
      if (lower.includes("simulator")) return "Simulator";
      return type;
    }
    const typeMap = {
      1: "Simulator",
      2: "Practice",
    };
    return typeMap[type] || type;
  };

  const getTestTypeColor = (type) => {
    // Xử lý cả số và string
    if (typeof type === "string") {
      const lower = type.toLowerCase();
      if (lower.includes("simulator")) return "blue";
      return "orange";
    }
    return type === 1 ? "blue" : "orange";
  };

  const calculateScore = (correct, total) => {
    // Xử lý trường hợp undefined, null, hoặc NaN
    const correctNum = Number(correct);
    const totalNum = Number(total);
    
    if (isNaN(correctNum) || isNaN(totalNum) || !totalNum || totalNum === 0) {
      return 0;
    }
    
    const score = Math.round((correctNum / totalNum) * 100);
    return isNaN(score) ? 0 : score;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getStatusLabel = (status) => {
    if (status === "InProgress" || status === "inProgress" || status === 0 || status === "0") {
      return "Đang làm";
    }
    if (status === "Graded" || status === "graded" || status === 2 || status === "2") {
      return "Đã hoàn thành";
    }
    return "Không xác định";
  };

  const getStatusColor = (status) => {
    if (status === "InProgress" || status === "inProgress" || status === 0 || status === "0") {
      return "processing"; 
    }
    if (status === "Graded" || status === "graded" || status === 2 || status === "2") {
      return "success";
    }
    return "default";
  };

  const handleContinueTest = async (record) => {
    if (!record.testResultId || !record.testId) {
      message.error("Không tìm thấy thông tin bài test");
      return;
    }

    try {
      message.loading({ content: "Đang tải bài thi...", key: "continueTest" });
      
      // Gọi API startTest với testId và testResultId
      const testIdNum = Number(record.testId);
      if (Number.isNaN(testIdNum)) {
        message.error({ content: "TestId không hợp lệ", key: "continueTest" });
        return;
      }

      // Lấy isSelectTime từ testType (Simulator = true, Practice = false mặc định)
      // LƯU Ý: Khi tiếp tục bài Practice, giá trị này có thể không chính xác nếu user đã chọn đếm ngược khi bắt đầu
      // Backend cần lưu và trả về isSelectTime gốc trong response để đảm bảo chế độ timer đúng
      const defaultIsSelectTime = normalizeTestType(record.testType) === "Simulator";
      
      const data = await startTest(testIdNum, defaultIsSelectTime);
      
      // Ưu tiên lấy isSelectTime từ response của backend (nếu backend lưu và trả về)
      // Nếu không có, dùng giá trị mặc định (có thể không chính xác cho Practice với đếm ngược)
      const isSelectTime = data.isSelectTime !== undefined ? !!data.isSelectTime : defaultIsSelectTime;
      
      console.log("Profile - Continue test: isSelectTime from backend:", data.isSelectTime);
      console.log("Profile - Continue test: defaultIsSelectTime:", defaultIsSelectTime);
      console.log("Profile - Continue test: final isSelectTime:", isSelectTime);
      
      if (!data) {
        message.error({ content: "Không thể tải bài thi. Vui lòng thử lại.", key: "continueTest" });
        return;
      }

      // Kiểm tra xem có parts không
      if (!data.parts || !Array.isArray(data.parts) || data.parts.length === 0) {
        message.error({ content: "Không có câu hỏi trong bài thi. Vui lòng thử lại.", key: "continueTest" });
        return;
      }

      // Import buildQuestions từ ExamSelection (hoặc định nghĩa lại)
      const buildQuestions = (parts = []) => {
        const questions = [];
        let globalIndex = 1;
        const sortedParts = [...parts].sort((a, b) => (a.partId || 0) - (b.partId || 0));
        sortedParts.forEach((part) => {
          part?.testQuestions?.forEach((tq) => {
            if (tq.isGroup && tq.questionGroupSnapshotDto) {
              const group = tq.questionGroupSnapshotDto;
              group.questionSnapshots?.forEach((qs, idx) => {
                questions.push({
                  testQuestionId: tq.testQuestionId,
                  subQuestionIndex: idx,
                  partId: part.partId,
                  partName: part.partName,
                  partDescription: part.description,
                  globalIndex: globalIndex++,
                  type: "group",
                  question: qs.content,
                  passage: group.passage,
                  imageUrl: qs.imageUrl,
                  audioUrl: qs.audioUrl,
                  options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
                  correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
                  userAnswer: qs.userAnswer,
                });
              });
            } else if (!tq.isGroup && tq.questionSnapshotDto) {
              const qs = tq.questionSnapshotDto;
              questions.push({
                testQuestionId: tq.testQuestionId,
                subQuestionIndex: 0,
                partId: part.partId,
                partName: part.partName,
                partDescription: part.description,
                globalIndex: globalIndex++,
                type: "single",
                question: qs.content,
                imageUrl: qs.imageUrl,
                audioUrl: qs.audioUrl,
                options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
                correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
                userAnswer: qs.userAnswer,
              });
            }
          });
        });
        return questions;
      };

      // Build questions từ response
      const questions = buildQuestions(data.parts);
      
      if (!questions || questions.length === 0) {
        message.error({ content: "Không thể tạo danh sách câu hỏi. Vui lòng thử lại.", key: "continueTest" });
        return;
      }

      // Xử lý savedAnswers để fill vào answers
      // Lọc để lấy bản ghi mới nhất cho mỗi cặp (testQuestionId, subQuestionIndex)
      const savedAnswers = data.savedAnswers || [];
      const answersMap = new Map(); // Dùng Map để lưu bản ghi mới nhất
      
      savedAnswers.forEach((saved, index) => {
        // Chuẩn hóa subQuestionIndex: null hoặc undefined = 0
        const subIndex = saved.subQuestionIndex !== undefined && saved.subQuestionIndex !== null 
          ? saved.subQuestionIndex 
          : 0;
        
        // Đảm bảo testQuestionId là string để tránh type mismatch
        const testQuestionIdStr = String(saved.testQuestionId);
        const answerKey = subIndex !== 0
          ? `${testQuestionIdStr}_${subIndex}`
          : testQuestionIdStr;
        
        // Lấy timestamp để so sánh (ưu tiên updatedAt, nếu không có thì dùng createdAt)
        const timestamp = saved.updatedAt 
          ? new Date(saved.updatedAt).getTime()
          : new Date(saved.createdAt || 0).getTime();
        
        // Kiểm tra xem đã có bản ghi cho key này chưa, nếu có thì so sánh timestamp
        const existing = answersMap.get(answerKey);
        if (!existing || timestamp > existing.timestamp) {
          // Xử lý theo loại answer
          let answerValue = null;
          if (saved.chosenOptionLabel) {
            // L&R: chosenOptionLabel
            answerValue = saved.chosenOptionLabel;
          } else if (saved.answerText) {
            // Writing: answerText
            answerValue = saved.answerText;
          } else if (saved.answerAudioUrl) {
            // Speaking: answerAudioUrl
            answerValue = saved.answerAudioUrl;
          }
          
          if (answerValue !== null) {
            console.log(`Profile - Processing savedAnswer[${index}]: testQuestionId=${saved.testQuestionId}, subQuestionIndex=${saved.subQuestionIndex} (normalized=${subIndex}), answerKey="${answerKey}", answerValue="${answerValue}", timestamp=${timestamp}`);
            answersMap.set(answerKey, { value: answerValue, timestamp });
          }
        } else {
          console.log(`Profile - Skipping savedAnswer[${index}]: testQuestionId=${saved.testQuestionId}, subQuestionIndex=${saved.subQuestionIndex} (normalized=${subIndex}), answerKey="${answerKey}" - existing timestamp is newer`);
        }
      });
      
      // Chuyển Map thành object
      const answers = {};
      answersMap.forEach((item, key) => {
        answers[key] = item.value;
      });
      
      console.log("Profile - Processed answers from savedAnswers:", answers);
      console.log("Profile - Total savedAnswers:", savedAnswers.length);
      console.log("Profile - Total unique answers:", Object.keys(answers).length);
      console.log("Profile - Answers keys:", Object.keys(answers));
      console.log("Profile - Sample answers:", {
        "1": answers["1"],
        "3": answers["3"],
        "6": answers["6"],
        "13": answers["13"],
        "32_2": answers["32_2"],
        "34_2": answers["34_2"],
      });

      // Tạo payload cho bài thi
      // Ưu tiên dùng testResultId từ history (record.testResultId) thay vì testResultId mới từ startTest
      // Vì khi tiếp tục test, cần submit với testResultId cũ để cập nhật kết quả đã có
      const originalTestResultId = record.testResultId; // testResultId từ history
      const createdAt = record.createdAt; // Thời gian tạo testResult từ history
      
      const payload = {
        ...data,
        testId: testIdNum,
        testResultId: originalTestResultId, // Dùng testResultId từ history, không phải từ startTest
        originalTestResultId: originalTestResultId, // Lưu thêm để dễ debug
        createdAt: createdAt, // Lưu createdAt từ history để tính thời gian đã làm bài
        testType: normalizeTestType(data.testType || record.testType),
        testSkill: data.testSkill || record.testSkill,
        duration: data.duration ?? record.duration ?? 0,
        questionQuantity: data.quantityQuestion ?? data.questionQuantity ?? record.totalQuestion ?? 0,
        questions,
        answers, // Thêm answers đã load từ savedAnswers
        isSelectTime: isSelectTime,
        timerMode: isSelectTime ? "countdown" : "countup",
        startedAt: Date.now(), // Thời điểm hiện tại (sẽ được tính lại từ createdAt trong ExamScreen)
        globalAudioUrl: data.audioUrl || null,
        lastBackendLoadTime: Date.now(), // Đánh dấu đã load từ backend (tiếp tục từ history)
      };
      
      console.log("Profile - Using testResultId from history:", originalTestResultId);
      console.log("Profile - createdAt from history:", createdAt);
      console.log("Profile - testResultId from startTest API:", data.testResultId);

      // Lưu vào sessionStorage và navigate đến màn hình làm bài
      console.log("Profile - Saving to sessionStorage, payload.answers:", payload.answers);
      sessionStorage.setItem("toeic_testData", JSON.stringify(payload));
      
      // Verify saved data
      const saved = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
      console.log("Profile - Verified saved answers in sessionStorage:", saved.answers);
      
      message.success({ content: "Đã tải bài thi thành công", key: "continueTest" });
      navigate("/exam");
    } catch (error) {
      console.error("Error continuing test:", error);
      message.error({ 
        content: error.response?.data?.message || "Không thể tiếp tục bài test. Vui lòng thử lại.", 
        key: "continueTest" 
      });
    }
  };

  const normalizeTestType = (value) => {
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
      return "Simulator";
    }
    if (value === 2) return "Practice";
    return "Simulator";
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Loại",
      dataIndex: "testType",
      key: "testType",
      width: 120,
      render: (type) => (
        <Tag color={getTestTypeColor(type)}>{getTestTypeLabel(type)}</Tag>
      ),
    },
    {
      title: "Kỹ năng",
      dataIndex: "testSkill",
      key: "testSkill",
      width: 150,
      render: (skill) => (
        <Tag color={getSkillColor(skill)}>{getSkillLabel(skill)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "testStatus",
      key: "testStatus",
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Kết quả",
      key: "result",
      width: 150,
      render: (_, record) => {
        // Kiểm tra xem có phải Speaking hoặc Writing không (không có khái niệm "câu đúng")
        const testSkill = record.testSkill || "";
        const isSW = testSkill === "Writing" || testSkill === "Speaking" || testSkill === "S&W" || 
                     testSkill === 2 || testSkill === 1 || testSkill === 4;
        
        // Tất cả đều hiển thị totalScore từ API
        const totalScore = record.totalScore !== undefined && record.totalScore !== null 
          ? Number(record.totalScore) 
          : null;
        
        return (
          <Space direction="vertical" size="small">
            {totalScore !== null && !isNaN(totalScore) ? (
              <span>
                <Tag color={isSW ? "blue" : getScoreColor(calculateScore(record.correctQuestion, record.totalQuestion))}>
                  {totalScore} điểm
                </Tag>
              </span>
            ) : (
              <span>
                <Tag color="default">—</Tag>
              </span>
            )}
            {/* Chỉ hiển thị số câu đúng cho L&R */}
            {!isSW && (
              <span style={{ fontSize: 12, color: "#666" }}>
                {record.correctQuestion ?? 0}/{record.totalQuestion ?? 0} câu đúng
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (duration) => `${duration} phút`,
    },
    {
      title: "Ngày làm",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const isInProgress = record.testStatus === "InProgress" || 
                             record.testStatus === "inProgress" ||
                             record.testStatus === 0 ||
                             record.testStatus === "0";
        
        if (isInProgress) {
          return (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleContinueTest(record)}
            >
              Tiếp tục
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className={styles.tabPane}>
      <h2 className={styles.title}>Lịch sử luyện thi</h2>
      <Row gutter={24} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {history.length === 0 && !loading ? (
            <Empty
              description="Chưa có lịch sử thi nào"
              style={{ marginTop: 40 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={history}
              rowKey={(record, index) => `${record.testId}-${record.createdAt}-${index}`}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bài thi`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

export function ReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      const response = await getMyQuestionReports(page, pageSize);
      
      // Response structure: { data: [], pageNumber, pageSize, totalRecords, totalPages, ... }
      const reportsData = response?.data || [];
      const totalRecords = response?.totalRecords || 0;
      const currentPage = response?.pageNumber || page;
      
      setReports(reportsData);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: totalRecords,
      });
    } catch (error) {
      console.error("Error fetching question reports:", error);
      message.error("Không thể tải báo cáo");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      title: "ID Câu hỏi",
      dataIndex: "questionId",
      key: "questionId",
      width: 120,
      render: (id) => id || "—",
    },
    {
      title: "Nội dung báo cáo",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      width: 300,
      render: (content) => content || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusMap = {
          "Pending": { label: "Chờ xử lý", color: "warning" },
          "Processing": { label: "Đang xử lý", color: "processing" },
          "Resolved": { label: "Đã xử lý", color: "success" },
          "Rejected": { label: "Từ chối", color: "error" },
        };
        const statusInfo = statusMap[status] || { label: status || "—", color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className={styles.tabPane}>
      <h2 className={styles.title}>Lịch sử báo cáo</h2>
      <Row gutter={24} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {reports.length === 0 && !loading ? (
            <Empty
              description="Chưa có báo cáo nào"
              style={{ marginTop: 40 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={reports}
              rowKey={(record, index) => record.id || record.questionId || `report-${index}`}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} báo cáo`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
