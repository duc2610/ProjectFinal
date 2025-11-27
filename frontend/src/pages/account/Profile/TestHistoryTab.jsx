import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Space, Empty, message, Spin, Card, Progress, Divider, Collapse, Typography, Button, Modal, Row, Col } from "antd";
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined, EditOutlined, SoundOutlined, FileTextOutlined, BulbOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Text, Title } = Typography;
import { useNavigate } from "react-router-dom";
import styles from "@shared/styles/Profile.module.css";
import { getTestHistory } from "@services/testsService";
import { startTest, getTestResultDetail } from "@services/testExamService";

const EMPTY_LR_MESSAGE =
  "Không có câu trả lời cho phần này. Có thể bạn chưa làm hoặc dữ liệu chưa được ghi nhận.";
import { translateErrorMessage } from "@shared/utils/translateError";

export function TestHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMode, setDetailMode] = useState(null); // LR hoặc SW
  const [lrDetail, setLrDetail] = useState({ questions: [] });
  const [swDetail, setSwDetail] = useState([]);
  const [detailSummary, setDetailSummary] = useState({});
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [detailData, setDetailData] = useState(null); // Lưu toàn bộ detailData từ API
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
        isSelectTime: item.isSelectTime !== undefined ? item.isSelectTime : (item.IsSelectTime !== undefined ? item.IsSelectTime : undefined),
      }));
      
      setHistory(normalizedHistory);
      setPagination(prev => ({
        ...prev,
        total: normalizedHistory.length,
      }));
    } catch (error) {
      console.error("Error fetching test history:", error);
      // Không hiển thị thông báo lỗi, chỉ log lỗi vào console
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
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

  const getSkillGroupFromValue = (skill) => {
    if (!skill && skill !== 0) return null;
    if (typeof skill === "string") {
      const upper = skill.toUpperCase();
      if (upper.includes("LISTENING") || upper.includes("READING") || upper.includes("L&R") || upper === "LR") {
        return "lr";
      }
      if (
        upper.includes("WRITING") ||
        upper.includes("SPEAKING") ||
        upper.includes("S&W") ||
        upper === "SW"
      ) {
        return "sw";
      }
    } else if (typeof skill === "number") {
      if (skill === 3) return "lr";
      if ([1, 2, 4].includes(skill)) return "sw";
    }
    return null;
  };

  const buildLRQuestionsFromDetail = (detailData = {}) => {
    const rows = [];
    let globalIndex = 1;
    const sortedParts = [...(detailData.parts || [])].sort(
      (a, b) => (a.partId || 0) - (b.partId || 0)
    );

    const getOptionText = (options = [], label) =>
      options?.find((opt) => opt.label === label)?.content || "";

    const hasUserAnswer = (value) =>
      value !== null && value !== undefined && String(value).trim() !== "";

    sortedParts.forEach((part) => {
      part?.testQuestions?.forEach((tq) => {
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots?.forEach((qs, idx) => {
            const options = qs.options || [];
            const correct = options.find((opt) => opt.isCorrect);
            const userAnswerText =
              qs.userAnswer && getOptionText(options, qs.userAnswer);
            if (hasUserAnswer(qs.userAnswer)) {
              rows.push({
                key: `${tq.testQuestionId}_${idx}`,
                order: globalIndex++,
                partId: part.partId || 0,
                partName: part.partName || `Part ${part.partId}`,
                passage: group.passage || null,
                question: qs.content || "",
                imageUrl: qs.imageUrl || group.imageUrl || null,
                audioUrl: qs.audioUrl || group.audioUrl || null,
                options,
                userAnswerLabel: qs.userAnswer || null,
                userAnswerText: userAnswerText || null,
                correctAnswerLabel: correct?.label || null,
                correctAnswerText: correct?.content || null,
                explanation: qs.explanation || group.explanation || null,
                isCorrect:
                  typeof qs.isCorrect === "boolean"
                    ? qs.isCorrect
                    : qs.userAnswer && correct
                    ? qs.userAnswer === correct.label
                    : null,
              });
            } else {
              globalIndex++;
            }
          });
        } else if (!tq.isGroup && tq.questionSnapshotDto) {
          const qs = tq.questionSnapshotDto;
          const options = qs.options || [];
          const correct = options.find((opt) => opt.isCorrect);
          const userAnswerText =
            qs.userAnswer && getOptionText(options, qs.userAnswer);
          if (hasUserAnswer(qs.userAnswer)) {
            rows.push({
              key: tq.testQuestionId,
              order: globalIndex++,
              partId: part.partId || 0,
              partName: part.partName || `Part ${part.partId}`,
              passage: null,
              question: qs.content || "",
              imageUrl: qs.imageUrl || null,
              audioUrl: qs.audioUrl || null,
              options,
              userAnswerLabel: qs.userAnswer || null,
              userAnswerText: userAnswerText || null,
              correctAnswerLabel: correct?.label || null,
              correctAnswerText: correct?.content || null,
              explanation: qs.explanation || null,
              isCorrect:
                typeof qs.isCorrect === "boolean"
                  ? qs.isCorrect
                  : qs.userAnswer && correct
                  ? qs.userAnswer === correct.label
                  : null,
            });
          } else {
            globalIndex++;
          }
        }
      });
    });

    return rows;
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

      // Chỉ lấy isSelectTime từ API get History (record.isSelectTime)
      // Không dùng logic mặc định dựa trên testType
      if (record.isSelectTime === undefined) {
        message.error({ content: "Không tìm thấy thông tin isSelectTime từ lịch sử thi", key: "continueTest" });
        return;
      }
      
      const isSelectTime = !!record.isSelectTime;
      
      const data = await startTest(testIdNum, isSelectTime);
      
      
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
             answersMap.set(answerKey, { value: answerValue, timestamp });
           }
        }
      });
      
      // Chuyển Map thành object
      const answers = {};
      answersMap.forEach((item, key) => {
        answers[key] = item.value;
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
      

       // Lưu vào sessionStorage và navigate đến màn hình làm bài
       sessionStorage.setItem("toeic_testData", JSON.stringify(payload));
      
      message.success({ content: "Đã tải bài thi thành công", key: "continueTest" });
      navigate("/exam");
    } catch (error) {
      console.error("Error continuing test:", error);
      message.error({ 
        content: translateErrorMessage(error.response?.data?.message) || "Không thể tiếp tục bài test. Vui lòng thử lại.", 
        key: "continueTest" 
      });
    }
  };

  const handleViewDetail = async (record) => {
    if (!record?.testResultId) {
      message.error("Không tìm thấy testResultId của bài thi");
      return;
    }
    const skillGroup = getSkillGroupFromValue(record.testSkill);
    if (!skillGroup) {
      message.error("Không xác định được loại bài thi để hiển thị chi tiết");
      return;
    }

    setDetailModalVisible(true);
    setDetailLoading(true);
    setDetailMode(skillGroup === "lr" ? "LR" : "SW");
    setSelectedHistory(record);

    try {
      const data = await getTestResultDetail(record.testResultId);
      setDetailData(data); // Lưu toàn bộ detailData
      
      // Lấy timeResult (ưu tiên timeResult, fallback về timeResuilt, sau đó tính từ createdAt)
      const timeResult = data?.timeResult ?? data?.timeResuilt ?? null;
      const isSelectTime = data?.isSelectTime ?? record.isSelectTime ?? false;
      
      if (skillGroup === "lr") {
        setLrDetail({
          questions: buildLRQuestionsFromDetail(data || {}),
        });
        setDetailSummary({
          totalScore: data?.totalScore ?? record.totalScore ?? null,
          listeningScore: data?.listeningScore ?? null,
          readingScore: data?.readingScore ?? null,
          correctCount: data?.correctCount ?? record.correctQuestion ?? null,
          quantityQuestion: data?.quantityQuestion ?? record.totalQuestion ?? null,
          duration: data?.duration ?? record.duration ?? null,
          timeResult: timeResult,
          isSelectTime: isSelectTime,
          status: data?.status ?? record.testStatus ?? null,
          testType: data?.testType ?? record.testType ?? null,
          testSkill: data?.testSkill ?? record.testSkill ?? null,
        });
      } else {
        setSwDetail(data?.perPartFeedbacks || []);
        setDetailSummary({
          totalScore: data?.totalScore ?? record.totalScore ?? null,
          writingScore: data?.writingScore ?? null,
          speakingScore: data?.speakingScore ?? null,
          quantityQuestion: data?.quantityQuestion ?? record.totalQuestion ?? null,
          duration: data?.duration ?? record.duration ?? null,
          timeResult: timeResult,
          isSelectTime: isSelectTime,
          status: data?.status ?? record.testStatus ?? null,
          testType: data?.testType ?? record.testType ?? null,
          testSkill: data?.testSkill ?? record.testSkill ?? null,
        });
      }
    } catch (error) {
      console.error("Error loading test detail:", error);
      message.error(
        translateErrorMessage(error?.response?.data?.message) || "Không thể tải chi tiết bài thi"
      );
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setDetailLoading(false);
    setDetailMode(null);
    setLrDetail({ questions: [] });
    setSwDetail([]);
    setDetailSummary({});
    setSelectedHistory(null);
    setDetailData(null);
  };

  const lrDetailColumns = [
    {
      title: "Câu",
      dataIndex: "order",
      width: 70,
      align: "center",
      render: (value, row) => (
        <div style={{ textAlign: "center" }}>
          <strong style={{ fontSize: 16 }}>{value}</strong>
          <div style={{ marginTop: 4 }}>
            {row.isCorrect === true && (
              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
            )}
            {row.isCorrect === false && (
              <CloseCircleOutlined style={{ color: "#f5222d", fontSize: 18 }} />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "question",
      render: (_, row) => (
        <div style={{ maxWidth: 500 }}>
          {row.passage && (
            <div
              style={{
                fontStyle: "italic",
                marginBottom: 8,
                color: "#666",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#f9f9f9",
                padding: 8,
                borderRadius: 4,
                borderLeft: "3px solid #d9d9d9",
              }}
            >
              {row.passage}
            </div>
          )}
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontWeight: 500 }}>
            {row.question || "—"}
          </div>
          {row.imageUrl && (
            <div style={{ marginTop: 8 }}>
              <img
                src={row.imageUrl}
                alt="question"
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              />
            </div>
          )}
          {row.audioUrl && (
            <div style={{ marginTop: 8 }}>
              <audio controls src={row.audioUrl} style={{ width: "100%" }}>
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
            </div>
          )}
          {row.options?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {row.options.map((opt) => {
                const isUserAnswer = opt.label === row.userAnswerLabel;
                const isCorrectAnswer = opt.isCorrect;
                let bgColor = "transparent";
                let borderColor = "transparent";
                let textColor = "#333";
                
                if (isCorrectAnswer) {
                  bgColor = "#f6ffed";
                  borderColor = "#52c41a";
                  textColor = "#389e0d";
                } else if (isUserAnswer && !row.isCorrect) {
                  bgColor = "#fff1f0";
                  borderColor = "#f5222d";
                  textColor = "#cf1322";
                }
                
                return (
                  <div 
                    key={opt.label}
                    style={{
                      padding: "6px 10px",
                      marginBottom: 4,
                      background: bgColor,
                      borderLeft: `3px solid ${borderColor}`,
                      borderRadius: 4,
                      color: textColor,
                    }}
                  >
                    <strong>{opt.label}.</strong> {opt.content}
                    {isCorrectAnswer && <CheckCircleOutlined style={{ marginLeft: 8, color: "#52c41a" }} />}
                    {isUserAnswer && !row.isCorrect && <CloseCircleOutlined style={{ marginLeft: 8, color: "#f5222d" }} />}
                  </div>
                );
              })}
            </div>
          )}
          {/* Giải thích */}
          {row.explanation && (
            <div 
              style={{ 
                marginTop: 12, 
                padding: 10, 
                background: "#e6f7ff", 
                borderRadius: 6,
                borderLeft: "3px solid #1890ff"
              }}
            >
              <div style={{ fontWeight: 600, color: "#1890ff", marginBottom: 4, fontSize: 12 }}>
                <BulbOutlined /> Giải thích:
              </div>
              <div style={{ color: "#333", fontSize: 13 }}>
                {row.explanation}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đáp án của bạn",
      dataIndex: "userAnswerLabel",
      width: 150,
      render: (_, row) =>
        row.userAnswerLabel ? (
          <Tag 
            color={row.isCorrect ? "success" : "error"}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {row.userAnswerLabel}
          </Tag>
        ) : (
          <Tag color="default">—</Tag>
        ),
    },
    {
      title: "Đáp án đúng",
      dataIndex: "correctAnswerLabel",
      width: 150,
      render: (_, row) =>
        row.correctAnswerLabel ? (
          <Tag 
            color="success"
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {row.correctAnswerLabel}
          </Tag>
        ) : (
          <Tag color="default">—</Tag>
        ),
    },
  ];

  const renderLRDetailByParts = () => {
    if (!lrDetail.questions || lrDetail.questions.length === 0) {
      return (
        <Empty
          description={EMPTY_LR_MESSAGE}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    // Nhóm questions theo partId
    const questionsByPart = {};
    lrDetail.questions.forEach((q) => {
      const partId = q.partId || 0;
      if (!questionsByPart[partId]) {
        questionsByPart[partId] = {
          partId,
          partName: q.partName || `Part ${partId}`,
          questions: [],
        };
      }
      questionsByPart[partId].questions.push(q);
    });

    // Sắp xếp theo partId
    const sortedParts = Object.values(questionsByPart).sort(
      (a, b) => a.partId - b.partId
    );

    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {sortedParts.map((part) => (
          <div key={part.partId}>
            <div
              style={{
                padding: "12px 16px",
                background: "#f0f2f5",
                borderRadius: "8px 8px 0 0",
                border: "1px solid #d9d9d9",
                borderBottom: "none",
                marginBottom: 0,
              }}
            >
              <strong style={{ fontSize: 16 }}>{part.partName}</strong>
              <span style={{ marginLeft: 8, color: "#666" }}>
                ({part.questions.length} câu)
              </span>
            </div>
            <Table
              columns={lrDetailColumns}
              dataSource={part.questions}
              rowKey="key"
              pagination={false}
              scroll={{ x: 900 }}
              style={{
                border: "1px solid #d9d9d9",
                borderTop: "none",
                borderRadius: "0 0 8px 8px",
              }}
            />
          </div>
        ))}
      </Space>
    );
  };

  const renderSWDetailByParts = () => {
    if (!swDetail || swDetail.length === 0) {
      return (
        <Empty
          description="Không có dữ liệu chi tiết cho bài thi này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    // Nhóm SW items theo partId
    const itemsByPart = {};
    swDetail.forEach((item) => {
      const partId = item.partId || 0;
      if (!itemsByPart[partId]) {
        itemsByPart[partId] = {
          partId,
          partName: item.partName || `Part ${partId}`,
          items: [],
        };
      }
      itemsByPart[partId].items.push(item);
    });

    // Sắp xếp theo partId
    const sortedParts = Object.values(itemsByPart).sort(
      (a, b) => a.partId - b.partId
    );

    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {sortedParts.map((part) => (
          <div key={part.partId}>
            <div
              style={{
                padding: "12px 16px",
                background: "#f0f2f5",
                borderRadius: "8px",
                marginBottom: 16,
              }}
            >
              <strong style={{ fontSize: 16 }}>{part.partName}</strong>
              <span style={{ marginLeft: 8, color: "#666" }}>
                ({part.items.length} câu)
              </span>
            </div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {part.items.map((item, index) => {
                const scores = item.detailedScores || {};
                const analysis = item.detailedAnalysis || {};
                return (
                  <div
                    key={item.feedbackId || item.testQuestionId || index}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 12,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    {renderSWItemContent(item, scores, analysis)}
                  </div>
                );
              })}
            </Space>
          </div>
        ))}
      </Space>
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high": return "#f5222d";
      case "medium": return "#fa8c16";
      case "low": return "#52c41a";
      default: return "#666";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high": return "Nghiêm trọng";
      case "medium": return "Trung bình";
      case "low": return "Nhẹ";
      default: return "Không xác định";
    }
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "normal";
    if (score >= 40) return "active";
    return "exception";
  };

  const renderScoreCard = (scores, item) => {
    const overallScore = scores.overall ?? item.score ?? 0;
    const hasDetailedScores = scores.grammar !== undefined || scores.vocabulary !== undefined;
    
    return (
      <Card 
        size="small" 
        style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12,
          marginBottom: 16 
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Điểm tổng</div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{overallScore}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>/100</div>
            </div>
          </Col>
          {hasDetailedScores && (
            <Col xs={24} sm={16}>
              <Row gutter={[8, 8]}>
                {scores.grammar !== undefined && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Ngữ pháp</div>
                      <Progress 
                        percent={scores.grammar} 
                        size="small" 
                        strokeColor="#52c41a"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
                {scores.vocabulary !== undefined && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Từ vựng</div>
                      <Progress 
                        percent={scores.vocabulary} 
                        size="small" 
                        strokeColor="#1890ff"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
                {scores.organization !== undefined && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Cấu trúc</div>
                      <Progress 
                        percent={scores.organization} 
                        size="small" 
                        strokeColor="#722ed1"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
                {scores.relevance !== undefined && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Liên quan</div>
                      <Progress 
                        percent={scores.relevance} 
                        size="small" 
                        strokeColor="#eb2f96"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
                {scores.opinion_support !== undefined && scores.opinion_support > 0 && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Luận điểm</div>
                      <Progress 
                        percent={scores.opinion_support} 
                        size="small" 
                        strokeColor="#13c2c2"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
                {scores.sentence_variety !== undefined && scores.sentence_variety > 0 && (
                  <Col span={12}>
                    <div style={{ color: "#fff" }}>
                      <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Đa dạng câu</div>
                      <Progress 
                        percent={scores.sentence_variety} 
                        size="small" 
                        strokeColor="#faad14"
                        trailColor="rgba(255,255,255,0.3)"
                        format={(p) => <span style={{ color: "#fff", fontSize: 11 }}>{p}</span>}
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </Col>
          )}
        </Row>
        {scores.word_count !== undefined && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
              <FileTextOutlined /> Số từ: {scores.word_count}
            </Tag>
          </div>
        )}
      </Card>
    );
  };

  const renderSWItemContent = (item, scores, analysis) => {
    const hasGrammarErrors = analysis.grammar_errors?.length > 0;
    const hasVocabIssues = analysis.vocabulary_issues?.length > 0;
    const hasMissingPoints = analysis.missing_points?.length > 0;
    const hasMatchedPoints = analysis.matched_points?.length > 0;
    const hasOpinionIssues = analysis.opinion_support_issues?.length > 0;
    const hasRecommendations = Array.isArray(item.recommendations) && item.recommendations.length > 0;
    
    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Score Card */}
        {renderScoreCard(scores, item)}

        {/* Đề bài */}
        {item.questionContent?.content && (
          <Card 
            size="small" 
            title={<><EditOutlined /> Đề bài</>}
            style={{ borderRadius: 8 }}
          >
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {item.questionContent.content}
            </div>
          </Card>
        )}

        {/* Hình ảnh đề bài */}
        {item.questionContent?.imageUrl && (
          <div style={{ textAlign: "center" }}>
            <img
              src={item.questionContent.imageUrl}
              alt="question"
              style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            />
          </div>
        )}

        {/* Audio trả lời (Speaking) */}
        {item.answerAudioUrl && (
          <Card 
            size="small" 
            title={<><SoundOutlined /> Âm thanh trả lời</>}
            style={{ borderRadius: 8 }}
          >
            <audio
              controls
              src={item.answerAudioUrl}
              style={{ width: "100%" }}
            >
              Trình duyệt không hỗ trợ audio.
            </audio>
            {item.audioDuration && (
              <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                Thời lượng: {item.audioDuration}s
              </div>
            )}
          </Card>
        )}

        {/* Transcription (Speaking) */}
        {item.transcription && item.transcription.trim() && (
          <Card 
            size="small" 
            title="Nội dung phiên âm"
            style={{ borderRadius: 8, background: "#f6ffed" }}
          >
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {item.transcription}
            </div>
          </Card>
        )}

        {/* Bài làm (Writing) */}
        {item.answerText && (
          <Card 
            size="small" 
            title={<><FileTextOutlined /> Bài làm của bạn</>}
            style={{ borderRadius: 8, background: "#fafafa" }}
          >
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.8 }}>
              {item.answerText}
            </div>
          </Card>
        )}

        {/* Phiên bản sửa lỗi */}
        {item.correctedText && item.correctedText !== "original" && (
          <Card 
            size="small" 
            title={<><CheckCircleOutlined style={{ color: "#52c41a" }} /> Phiên bản đã sửa</>}
            style={{ borderRadius: 8, background: "#f6ffed", borderColor: "#b7eb8f" }}
          >
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.8 }}>
              {item.correctedText}
            </div>
          </Card>
        )}

        {/* Mô tả hình ảnh (từ AI) */}
        {analysis.image_description && (
          <Card 
            size="small" 
            title={<><InfoCircleOutlined /> Mô tả hình ảnh (AI phân tích)</>}
            style={{ borderRadius: 8, background: "#e6f7ff", borderColor: "#91d5ff" }}
          >
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {analysis.image_description}
            </div>
          </Card>
        )}

        {/* Collapsible sections for detailed analysis */}
        <Collapse 
          defaultActiveKey={hasGrammarErrors ? ["grammar"] : []} 
          style={{ borderRadius: 8 }}
          expandIconPosition="end"
        >
          {/* Lỗi ngữ pháp */}
          {hasGrammarErrors && (
            <Panel 
              header={
                <Space>
                  <CloseCircleOutlined style={{ color: "#f5222d" }} />
                  <span>Lỗi ngữ pháp ({analysis.grammar_errors.length} lỗi)</span>
                </Space>
              } 
              key="grammar"
            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {analysis.grammar_errors.map((err, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: "10px 12px", 
                      background: "#fff1f0", 
                      borderRadius: 6,
                      borderLeft: `3px solid ${getSeverityColor(err.severity)}`
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <Text delete style={{ color: "#f5222d" }}>{err.wrong}</Text>
                        <span style={{ margin: "0 8px" }}>→</span>
                        <Text strong style={{ color: "#52c41a" }}>{err.correct}</Text>
                      </div>
                      {err.severity && (
                        <Tag color={getSeverityColor(err.severity)} style={{ margin: 0 }}>
                          {getSeverityLabel(err.severity)}
                        </Tag>
                      )}
                    </div>
                    {err.rule && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                        <InfoCircleOutlined style={{ marginRight: 4 }} />
                        {err.rule}
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            </Panel>
          )}

          {/* Gợi ý từ vựng */}
          {hasVocabIssues && (
            <Panel 
              header={
                <Space>
                  <BulbOutlined style={{ color: "#1890ff" }} />
                  <span>Gợi ý từ vựng ({analysis.vocabulary_issues.length} gợi ý)</span>
                </Space>
              } 
              key="vocabulary"
            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {analysis.vocabulary_issues.map((issue, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: "10px 12px", 
                      background: "#e6f7ff", 
                      borderRadius: 6,
                      borderLeft: "3px solid #1890ff"
                    }}
                  >
                    <div>
                      <Text style={{ color: "#595959" }}>"{issue.word}"</Text>
                      <span style={{ margin: "0 8px" }}>→</span>
                      <Text strong style={{ color: "#1890ff" }}>{issue.better}</Text>
                    </div>
                    {issue.example && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "#666", fontStyle: "italic" }}>
                        Ví dụ: {issue.example}
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            </Panel>
          )}

          {/* Ý còn thiếu */}
          {hasMissingPoints && (
            <Panel 
              header={
                <Space>
                  <WarningOutlined style={{ color: "#fa8c16" }} />
                  <span>Ý còn thiếu ({analysis.missing_points.length} ý)</span>
                </Space>
              } 
              key="missing"
            >
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {analysis.missing_points.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: 6, color: "#fa8c16" }}>
                    {point}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Ý đã đáp ứng */}
          {hasMatchedPoints && (
            <Panel 
              header={
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <span>Ý đã đáp ứng ({analysis.matched_points.length} ý)</span>
                </Space>
              } 
              key="matched"
            >
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {analysis.matched_points.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: 6, color: "#52c41a" }}>
                    {point}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Lưu ý bổ sung */}
          {hasOpinionIssues && (
            <Panel 
              header={
                <Space>
                  <InfoCircleOutlined style={{ color: "#722ed1" }} />
                  <span>Lưu ý bổ sung ({analysis.opinion_support_issues.length})</span>
                </Space>
              } 
              key="opinion"
            >
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {analysis.opinion_support_issues.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {point}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Khuyến nghị */}
          {hasRecommendations && (
            <Panel 
              header={
                <Space>
                  <BulbOutlined style={{ color: "#13c2c2" }} />
                  <span>Khuyến nghị từ AI</span>
                </Space>
              } 
              key="recommendations"
            >
              <div 
                style={{ 
                  whiteSpace: "pre-wrap", 
                  wordBreak: "break-word",
                  background: "#f0f5ff",
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.8
                }}
              >
                {item.recommendations.join("\n")}
              </div>
            </Panel>
          )}
        </Collapse>

        {/* Thông tin bổ sung */}
        {(item.createdAt || item.aiScorer) && (
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 8, padding: "8px 0", borderTop: "1px solid #f0f0f0", fontSize: 12, color: "#999" }}>
            {item.createdAt && (
              <span>Thời gian: {new Date(item.createdAt).toLocaleString("vi-VN")}</span>
            )}
            {item.aiScorer && (
              <span>Chấm bởi: {item.aiScorer.toUpperCase()} AI</span>
            )}
          </div>
        )}
      </Space>
    );
  };

  // Tính practiceLrStats từ detailData (giống TestResult.jsx)
  const practiceLrStats = useMemo(() => {
    if (!detailData?.parts || detailMode !== "LR") {
      return {
        totalQuestions: 0,
        totalAnswered: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        accuracy: 0,
        listening: { total: 0, answered: 0, correct: 0, wrong: 0, unanswered: 0 },
        reading: { total: 0, answered: 0, correct: 0, wrong: 0, unanswered: 0 },
      };
    }

    // Tính tổng số câu hỏi trong đề
    let totalQuestions = 0;
    let listeningTotal = 0;
    let readingTotal = 0;

    detailData.parts.forEach((part) => {
      const partId = part.partId || 0;
      const isListening = partId >= 1 && partId <= 4;
      const isReading = partId >= 5 && partId <= 7;

      part.testQuestions?.forEach((tq) => {
        let count = 0;
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          count = tq.questionGroupSnapshotDto.questionSnapshots?.length || 0;
        } else if (!tq.isGroup && tq.questionSnapshotDto) {
          count = 1;
        }
        totalQuestions += count;
        if (isListening) listeningTotal += count;
        if (isReading) readingTotal += count;
      });
    });

    // Tính từ lrDetail.questions (chỉ những câu đã làm)
    const questions = lrDetail.questions || [];
    const listeningRows = questions.filter((q) => {
      const partId = q.partId || 0;
      return partId >= 1 && partId <= 4;
    });
    const readingRows = questions.filter((q) => {
      const partId = q.partId || 0;
      return partId >= 5 && partId <= 7;
    });

    const listeningAnswered = {
      answered: listeningRows.length,
      correct: listeningRows.filter((r) => r.isCorrect === true).length,
      wrong: listeningRows.filter((r) => r.isCorrect === false).length,
    };

    const readingAnswered = {
      answered: readingRows.length,
      correct: readingRows.filter((r) => r.isCorrect === true).length,
      wrong: readingRows.filter((r) => r.isCorrect === false).length,
    };

    const totalAnswered = listeningAnswered.answered + readingAnswered.answered;
    const correct = listeningAnswered.correct + readingAnswered.correct;
    const wrong = listeningAnswered.wrong + readingAnswered.wrong;
    const unanswered = Math.max(0, totalQuestions - totalAnswered);
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      totalAnswered,
      correct,
      wrong,
      unanswered,
      accuracy,
      listening: {
        total: listeningTotal,
        answered: listeningAnswered.answered,
        correct: listeningAnswered.correct,
        wrong: listeningAnswered.wrong,
        unanswered: Math.max(0, listeningTotal - listeningAnswered.answered),
      },
      reading: {
        total: readingTotal,
        answered: readingAnswered.answered,
        correct: readingAnswered.correct,
        wrong: readingAnswered.wrong,
        unanswered: Math.max(0, readingTotal - readingAnswered.answered),
      },
    };
  }, [detailData, lrDetail, detailMode]);

  // Helper function để normalize testType
  const normalizeTestType = (value) => {
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
      return "Simulator";
    }
    if (value === 2) return "Practice";
    return "Simulator";
  };

  // Kiểm tra xem có phải Practice LR không
  const isPracticeLrMode = useMemo(() => {
    const normalizedTestType = normalizeTestType(detailSummary.testType);
    return normalizedTestType === "Practice" && detailMode === "LR";
  }, [detailSummary.testType, detailMode]);

  const renderPracticeSummary = () => {
    const tiles = [
      { label: "Tổng số câu trong đề", value: practiceLrStats.totalQuestions },
      { label: "Câu đã làm", value: practiceLrStats.totalAnswered, color: "#1d39c4" },
      { label: "Câu chưa làm", value: practiceLrStats.unanswered, color: "#fa8c16" },
      {
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#389e0d",
      },
    ];
    return (
      <div
        style={{
          width: "100%",
          padding: 32,
          borderRadius: 20,
          border: "1px dashed #91caff",
          background: "linear-gradient(135deg, #e6f7ff, #f0f9ff)",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>ℹ️</div>
        <Title level={3} style={{ marginBottom: 8, color: "#0958d9" }}>
          Chế độ Practice (Listening & Reading)
        </Title>
        <Text style={{ fontSize: 16, color: "#1f3b76" }}>
          Chế độ luyện tập không chấm điểm tự động. Hệ thống chỉ hiển thị danh sách câu hỏi bạn
          đã làm cùng trạng thái đúng/sai để tự đánh giá.
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                minWidth: 160,
                padding: "16px 20px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(145,202,255,0.7)",
                boxShadow: "0 6px 16px rgba(9,88,217,0.08)",
              }}
            >
              <Text type="secondary">{tile.label}</Text>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 700,
                  color: tile.color || "#0c1d4f",
                }}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Khối thông tin chi tiết dùng chung (giống TestResult.jsx)
  const renderGlobalDetailTiles = () => {
    const tiles = [];

    // Thời gian làm bài (timeResult)
    const displayedTimeSpent = detailSummary.timeResult ?? detailSummary.duration ?? 0;
    tiles.push({
      label: "Thời gian làm bài",
      value: `${displayedTimeSpent} phút`,
      color: "#1d39c4",
    });

    // Thời lượng đề (chỉ hiển thị nếu isSelectTime = true)
    const displayedIsSelectTime = detailSummary.isSelectTime ?? false;
    const displayedDuration = detailSummary.duration ?? 0;
    tiles.push({
      label: "Thời lượng đề",
      value: displayedIsSelectTime ? `${displayedDuration} phút` : "Không giới hạn",
      color: "#531dab",
    });

    if (detailMode === "LR") {
      tiles.push({
        label: "Tổng số câu trong đề",
        value: practiceLrStats.totalQuestions,
        color: "#0958d9",
      });
      tiles.push({
        label: "Câu đã làm",
        value: practiceLrStats.totalAnswered,
        color: "#1d39c4",
      });
      tiles.push({
        label: "Câu chưa làm",
        value: practiceLrStats.unanswered,
        color: "#fa8c16",
      });
      tiles.push({
        label: "Đúng",
        value: practiceLrStats.correct,
        color: "#389e0d",
      });
      tiles.push({
        label: "Sai",
        value: practiceLrStats.wrong,
        color: "#cf1322",
      });
      tiles.push({
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#08979c",
      });
    } else {
      // SW mode
      const totalQuestions = detailSummary.quantityQuestion ?? 0;
      if (totalQuestions > 0) {
        tiles.push({
          label: "Tổng số câu trong đề",
          value: totalQuestions,
          color: "#0958d9",
        });
      }
      if (detailSummary.writingScore != null) {
        tiles.push({
          label: "Điểm Writing",
          value: detailSummary.writingScore,
          color: "#fa541c",
        });
      }
      if (detailSummary.speakingScore != null) {
        tiles.push({
          label: "Điểm Speaking",
          value: detailSummary.speakingScore,
          color: "#fa8c16",
        });
      }
      if (detailSummary.totalScore != null && !isPracticeLrMode) {
        tiles.push({
          label: "Tổng điểm",
          value: detailSummary.totalScore,
          color: "#722ed1",
        });
      }
    }

    if (tiles.length === 0) return null;

    return (
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px dashed #e6f4ff",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
            Thông tin chi tiết
          </Title>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {tiles.map((tile) => (
              <div
                key={tile.label}
                style={{
                  minWidth: 160,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "#fff",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tile.label}
                </Text>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: 700,
                    color: tile.color || "#111827",
                  }}
                >
                  {tile.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryChips = () => {
    const isLR = detailMode === "LR";
    const totalScore = detailSummary.totalScore;
    const maxScore = isLR ? 990 : 400;
    
    // Tạo tiles cho thông tin chi tiết
    const detailTiles = [];
    
    // Thời gian làm bài (timeResult)
    const displayedTimeSpent = detailSummary.timeResult ?? detailSummary.duration ?? 0;
    detailTiles.push({
      label: "Thời gian làm bài",
      value: `${displayedTimeSpent} phút`,
      color: "#1d39c4",
    });

    // Thời lượng đề (chỉ hiển thị nếu isSelectTime = true)
    const displayedIsSelectTime = detailSummary.isSelectTime ?? false;
    const displayedDuration = detailSummary.duration ?? 0;
    detailTiles.push({
      label: "Thời lượng đề",
      value: displayedIsSelectTime ? `${displayedDuration} phút` : "Không giới hạn",
      color: "#531dab",
    });

    if (detailMode === "LR") {
      detailTiles.push({
        label: "Tổng số câu trong đề",
        value: practiceLrStats.totalQuestions,
        color: "#0958d9",
      });
      detailTiles.push({
        label: "Câu đã làm",
        value: practiceLrStats.totalAnswered,
        color: "#1d39c4",
      });
      detailTiles.push({
        label: "Câu chưa làm",
        value: practiceLrStats.unanswered,
        color: "#fa8c16",
      });
      detailTiles.push({
        label: "Đúng",
        value: practiceLrStats.correct,
        color: "#389e0d",
      });
      detailTiles.push({
        label: "Sai",
        value: practiceLrStats.wrong,
        color: "#cf1322",
      });
      detailTiles.push({
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#08979c",
      });
    } else {
      // SW mode
      const totalQuestions = detailSummary.quantityQuestion ?? 0;
      if (totalQuestions > 0) {
        detailTiles.push({
          label: "Tổng số câu trong đề",
          value: totalQuestions,
          color: "#0958d9",
        });
      }
      if (detailSummary.writingScore != null) {
        detailTiles.push({
          label: "Điểm Writing",
          value: detailSummary.writingScore,
          color: "#fa541c",
        });
      }
      if (detailSummary.speakingScore != null) {
        detailTiles.push({
          label: "Điểm Speaking",
          value: detailSummary.speakingScore,
          color: "#fa8c16",
        });
      }
      if (detailSummary.totalScore != null && !isPracticeLrMode) {
        detailTiles.push({
          label: "Tổng điểm",
          value: detailSummary.totalScore,
          color: "#722ed1",
        });
      }
    }
    
    return (
      <Card 
        style={{ 
          marginBottom: 20, 
          borderRadius: 12,
          background: isLR 
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          border: "none"
        }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Row gutter={[24, 16]} align="middle">
          {/* Điểm tổng */}
          <Col xs={24} sm={8} style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 4 }}>
              Điểm tổng
            </div>
            <div style={{ color: "#fff", fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
              {totalScore ?? "—"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>
              /{maxScore}
            </div>
          </Col>
          
          {/* Chi tiết điểm */}
          <Col xs={24} sm={16}>
            <Row gutter={[16, 12]}>
              {/* Listening Score */}
              {detailSummary.listeningScore !== undefined && detailSummary.listeningScore !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <SoundOutlined /> Listening
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.listeningScore}
                      <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/495</span>
                    </div>
                  </div>
                </Col>
              )}
              
              {/* Reading Score */}
              {detailSummary.readingScore !== undefined && detailSummary.readingScore !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <FileTextOutlined /> Reading
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.readingScore}
                      <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/495</span>
                    </div>
                  </div>
                </Col>
              )}
              
              {/* Writing Score */}
              {detailSummary.writingScore !== undefined && detailSummary.writingScore !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <EditOutlined /> Writing
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.writingScore}
                      <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/200</span>
                    </div>
                  </div>
                </Col>
              )}
              
              {/* Speaking Score */}
              {detailSummary.speakingScore !== undefined && detailSummary.speakingScore !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <SoundOutlined /> Speaking
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.speakingScore}
                      <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/200</span>
                    </div>
                  </div>
                </Col>
              )}
              
              {/* Correct Count (for LR) */}
              {detailSummary.correctCount !== undefined && detailSummary.correctCount !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <CheckCircleOutlined /> Số câu đúng
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.correctCount}
                      {detailSummary.quantityQuestion && (
                        <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>
                          /{detailSummary.quantityQuestion}
                        </span>
                      )}
                    </div>
                  </div>
                </Col>
              )}
              
              {/* Số câu hỏi (for SW) */}
              {!isLR && detailSummary.quantityQuestion !== undefined && detailSummary.quantityQuestion !== null && (
                <Col span={12}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 2 }}>
                      <FileTextOutlined /> Số câu hỏi
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>
                      {detailSummary.quantityQuestion}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        
        {/* Additional Info */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          {detailSummary.duration && (
            <Tag style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>
              Thời gian: {detailSummary.duration} phút
            </Tag>
          )}
          {detailSummary.testType && (
            <Tag style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>
              {getTestTypeLabel(detailSummary.testType)}
            </Tag>
          )}
          {detailSummary.testSkill && (
            <Tag style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>
              {getSkillLabel(detailSummary.testSkill)}
            </Tag>
          )}
          {detailSummary.status && (
            <Tag style={{ background: detailSummary.status === "Graded" ? "rgba(82,196,26,0.3)" : "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>
              {detailSummary.status === "Graded" ? "Đã chấm điểm" : "Đang chấm điểm" + getStatusLabel(detailSummary.status)}
            </Tag>
          )}
        </div>

        {/* Thông tin chi tiết - gộp vào card */}
        {detailTiles.length > 0 && (
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Title level={5} style={{ marginBottom: 12, textAlign: "center", color: "#fff" }}>
              Thông tin chi tiết
            </Title>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {detailTiles.map((tile) => (
                <div
                  key={tile.label}
                  style={{
                    minWidth: 160,
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                    {tile.label}
                  </Text>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {tile.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Kiểm tra xem có bài nào đang làm không
  const hasInProgressTest = history.some(record => {
    const status = record.testStatus;
    return status === "InProgress" || status === "inProgress" || status === 0 || status === "0";
  });

  const cellCardStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    background: "#fafafa",
    border: "1px solid #f0f0f0",
  };

  const sectionTitleStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 240,
      render: (title) => (
        <div style={cellCardStyle}>
          <div style={sectionTitleStyle}>Tiêu đề</div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {title || "—"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại / Kỹ năng / Trạng thái",
      key: "typeSkillStatus",
      width: 200,
      render: (_, record) => (
        <div style={cellCardStyle}>
          <div style={sectionTitleStyle}>Loại / Kỹ năng / Trạng thái</div>
          <Space direction="vertical" size={4}>
            <Tag color={getTestTypeColor(record.testType)}>
              {getTestTypeLabel(record.testType)}
            </Tag>
            <Tag color={getSkillColor(record.testSkill)}>
              {getSkillLabel(record.testSkill)}
            </Tag>
            <Tag color={getStatusColor(record.testStatus)}>
              {getStatusLabel(record.testStatus)}
            </Tag>
        </Space>
        </div>
      ),
    },
    {
      title: "Kết quả",
      key: "result",
      width: 130,
      render: (_, record) => {
        // Kiểm tra xem có phải Speaking hoặc Writing không (không có khái niệm "câu đúng")
        const testSkill = record.testSkill || "";
        const isSW = testSkill === "Writing" || testSkill === "Speaking" || testSkill === "S&W" || 
                     testSkill === 2 || testSkill === 1 || testSkill === 4;
        
        // Kiểm tra xem có phải Practice LR không
        const normalizedTestType = normalizeTestType(record.testType);
        const skillGroup = getSkillGroupFromValue(record.testSkill);
        const isPracticeLR = normalizedTestType === "Practice" && skillGroup === "lr";
        
          // Tất cả đều hiển thị totalScore từ API, nếu không có thì hiển thị 0
        const totalScore =
          record.totalScore !== undefined && record.totalScore !== null
            ? Number(record.totalScore) 
            : 0;
          
        // Tính số câu đúng và tổng số câu
        const correctCount = record.correctQuestion ?? 0;
        const totalCount = record.totalQuestion ?? 0;
        const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

          return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Kết quả</div>
            <Space direction="vertical" size={4}>
              {isPracticeLR ? (
                // Practice LR: Hiển thị số câu đúng và độ chính xác (không hiển thị điểm)
                <>
                  <Tag color="success" style={{ fontSize: 13, fontWeight: 500 }}>
                    {correctCount} câu đúng
                </Tag>
                  {totalCount > 0 && (
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {accuracy}% chính xác
              </span>
                  )}
                  {totalCount > 0 && (
                    <span style={{ fontSize: 11, color: "#999" }}>
                      {correctCount}/{totalCount} câu
                    </span>
                  )}
                </>
              ) : (
                // Simulator hoặc SW: Hiển thị điểm và phần trăm chính xác
                <>
                  <Tag
                    color={
                      isSW
                        ? "blue"
                        : getScoreColor(
                            calculateScore(record.correctQuestion, record.totalQuestion)
                          )
                    }
                  >
                    {totalScore} điểm
                  </Tag>
            {!isSW && (
                    <>
                      {totalCount > 0 && (
                        <span style={{ fontSize: 12, color: "#666" }}>
                          {accuracy}% chính xác
                        </span>
                      )}
              <span style={{ fontSize: 12, color: "#666" }}>
                {record.correctQuestion ?? 0}/{record.totalQuestion ?? 0} câu đúng
              </span>
                    </>
                  )}
                  {isSW && totalCount > 0 && (
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {accuracy}% chính xác
                    </span>
                  )}
                </>
            )}
          </Space>
          </div>
        );
      },
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration) => {
        const display =
          duration === undefined || duration === null || duration === 0 || isNaN(duration)
            ? "—"
            : `${duration} phút`;
        return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Thời lượng</div>
            <div>{display}</div>
          </div>
        );
      },
    },
    {
      title: "Ngày làm",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => (
        <div style={cellCardStyle}>
          <div style={sectionTitleStyle}>Ngày làm</div>
          <div>{formatDate(date)}</div>
        </div>
      ),
    },
    {
      title: "Chi tiết",
      key: "detail",
      width: 110,
      render: (_, record) => (
        <div style={cellCardStyle}>
          <div style={sectionTitleStyle}>Chi tiết</div>
        <Button
          size="small"
          onClick={() => handleViewDetail(record)}
          disabled={!record.testResultId}
        >
          Xem chi tiết
        </Button>
        </div>
      ),
    },
    // Chỉ hiển thị cột "Hành động" nếu có bài đang làm
    ...(hasInProgressTest ? [{
      title: "Hành động",
      key: "action",
      width: 140,
      render: (_, record) => {
        const isInProgress =
          record.testStatus === "InProgress" ||
                             record.testStatus === "inProgress" ||
                             record.testStatus === 0 ||
                             record.testStatus === "0";
        
          return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Hành động</div>
            {isInProgress ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleContinueTest(record)}
            >
              Tiếp tục
            </Button>
            ) : (
              <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>
            )}
          </div>
          );
      },
    }] : []),
  ];

  return (
    <>
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
              showHeader={false}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bài thi`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
              size="middle"
              bordered
            />
          )}
        </Col>
      </Row>
    </div>

    <Modal
      title={
        <span>
          Chi tiết bài thi{" "}
          {selectedHistory?.title ? `- ${selectedHistory.title}` : ""}
        </span>
      }
      open={detailModalVisible}
      onCancel={closeDetailModal}
      footer={null}
      width={detailMode === "SW" ? 960 : 1200}
      destroyOnClose
    >
      {detailLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
          <div style={{ marginTop: 12 }}>Đang tải dữ liệu...</div>
        </div>
      ) : detailMode === "LR" ? (
        <>
          {isPracticeLrMode ? renderPracticeSummary() : renderSummaryChips()}
          <div style={{ marginTop: 16 }}>
            {renderLRDetailByParts()}
          </div>
        </>
      ) : detailMode === "SW" ? (
        <>
          {renderSummaryChips()}
          <div style={{ marginTop: 16 }}>
            {renderSWDetailByParts()}
          </div>
        </>
      ) : (
        <Empty description="Chưa có dữ liệu chi tiết" />
      )}
    </Modal>
    </>
  );
}

