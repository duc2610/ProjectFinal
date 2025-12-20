import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Typography, Checkbox, Spin, message, Alert } from "antd";
import { LoadingOutlined, BulbOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import { startTest } from "../../../services/testExamService";
import { getTestById } from "../../../services/testsService";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { translateErrorMessage } from "@utils/translateError";
import { useAuth } from "@shared/hooks/useAuth";

const { Title, Text } = Typography;

const normalizeTestType = (value) => {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
    return "Simulator";
  }
  if (value === 2) return "Practice";
  return "Simulator";
};

const normalizeTestSkill = (value) => {
  if (typeof value === "string") {
    return value;
  }
  const mapping = {
    1: "Speaking",
    2: "Writing",
    3: "Listening & Reading",
    4: "S&W",
  };
  return mapping[value] || "Unknown";
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const buildQuestions = (parts = []) => {
  const questions = [];
  let globalIndex = 1;

  // Sắp xếp parts theo partId tăng dần (bắt đầu từ part 1)
  const sortedParts = [...parts].sort((a, b) => (a.partId || 0) - (b.partId || 0));

  sortedParts.forEach((part) => {
    part?.testQuestions?.forEach((tq) => {
      if (tq.isGroup && tq.questionGroupSnapshotDto) {
        const group = tq.questionGroupSnapshotDto;
        group.questionSnapshots?.forEach((qs, idx) => {
          questions.push({
            testQuestionId: tq.testQuestionId,
            // questionId: ID của sub-question trong group (dùng cho report SubQuestionId)
            questionId: qs.questionId,
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
          // Với câu đơn, vẫn lưu questionId phòng khi backend có dùng (không bắt buộc cho report)
          questionId: qs.questionId,
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

export default function ExamSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const testIdParam = searchParams.get("testId");

  const [modalVisible, setModalVisible] = useState(true);
  const [testInfo, setTestInfo] = useState(location.state?.testMeta || null);
  const [metaLoading, setMetaLoading] = useState(!location.state?.testMeta);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [practiceCountdown, setPracticeCountdown] = useState(false);
  const initializedPracticeRef = useRef(false);

  const testType = useMemo(
    () => normalizeTestType(testInfo?.testType),
    [testInfo]
  );
  const isPractice = testType === "Practice";
  const isSimulator = testType === "Simulator";

  useEffect(() => {
    if (!testIdParam) {
      message.error("Không tìm thấy bài test. Vui lòng chọn lại.");
      navigate(location.state?.from || "/test-list");
      return;
    }

    const testId = Number(testIdParam);
    if (Number.isNaN(testId)) {
      message.error("ID bài test không hợp lệ.");
      navigate(location.state?.from || "/test-list");
      return;
    }

    if (testInfo) {
      return;
    }

    const fetchMeta = async () => {
      setMetaLoading(true);
      try {
        const data = await getTestById(testId);
        if (!data) {
          message.error("Không thể tải thông tin bài test.");
          navigate(location.state?.from || "/test-list");
          return;
        }
        setTestInfo({
          id: data.id ?? testId,
          title: data.title || data.Title || "TOEIC Test",
          testType: data.testType ?? data.TestType ?? "Simulator",
          testSkill: data.testSkill ?? data.TestSkill ?? undefined,
          duration: data.duration ?? data.Duration ?? 0,
          questionQuantity:
            data.questionQuantity ?? data.quantityQuestion ?? data.QuestionQuantity ?? 0,
        });
      } catch (error) {
        console.error("Error fetching test info:", error);
        message.error("Không thể tải thông tin bài test.");
        navigate(location.state?.from || "/test-list");
      } finally {
        setMetaLoading(false);
      }
    };

    fetchMeta();
  }, [testIdParam, navigate, location.state, testInfo]);

  useEffect(() => {
    if (testInfo && isPractice && !initializedPracticeRef.current) {
      setPracticeCountdown(false);
      initializedPracticeRef.current = true;
    }
  }, [testInfo, isPractice]);

  const handleCancel = () => {
    setModalVisible(false);
    navigate(location.state?.from || "/test-list");
  };

  const handleConfirm = async () => {
    if (!testIdParam) return;
    const testId = Number(testIdParam);
    if (Number.isNaN(testId)) return;

    if (metaLoading || confirmLoading) return;

    const finalSelectTime = isSimulator ? true : !!practiceCountdown;

    setConfirmLoading(true);
    try {
      const data = await startTest(testId, finalSelectTime);
      if (!data) {
        message.error("Không thể bắt đầu bài thi. Vui lòng thử lại.");
        return;
      }

      const questions = buildQuestions(data.parts || []);
      
      // Xử lý savedAnswers để fill vào answers
      // Lọc để lấy bản ghi mới nhất cho mỗi cặp (testQuestionId, subQuestionIndex)
      const savedAnswers = data.savedAnswers || [];
      const answersMap = new Map(); // Dùng Map để lưu bản ghi mới nhất
      
      savedAnswers.forEach((saved) => {
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
      
      
      const payload = {
        ...data,
        ownerUserId: user?.id || user?.userId || user?.Id || null,
        ownerEmail: user?.email || user?.Email || null,
        testId,
        testResultId: data.testResultId,
        testType: normalizeTestType(data.testType || testInfo?.testType),
        testSkill: data.testSkill || testInfo?.testSkill,
        duration: data.duration ?? testInfo?.duration ?? 0,
        questionQuantity:
          data.quantityQuestion ?? data.questionQuantity ?? testInfo?.questionQuantity ?? 0,
        questions,
        answers, // Thêm answers đã load từ savedAnswers
        isSelectTime: finalSelectTime,
        timerMode: finalSelectTime ? "countdown" : "countup",
        startedAt: Date.now(),
        globalAudioUrl: data.audioUrl || null,
        lastBackendLoadTime: Date.now(), // Đánh dấu đã load từ backend (bắt đầu test mới hoặc tiếp tục)
      };

      sessionStorage.setItem("toeic_testData", JSON.stringify(payload));
      navigate("/exam");
    } catch (error) {
      console.error("Error starting test:", error);
      message.error(translateErrorMessage(error.response?.data?.message) || "Không thể bắt đầu bài thi. Vui lòng thử lại.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className={styles.selectionContainer}>
      <Modal
        title={
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              {testInfo?.title || "Bài thi TOEIC"}
            </Title>
            <Text type="secondary">
              {isSimulator ? "Mô phỏng theo đề thi thật" : "Bài luyện tập"}
            </Text>
          </div>
        }
        open={modalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="Bắt đầu làm bài"
        cancelText="Hủy"
        confirmLoading={confirmLoading}
        maskClosable={false}
        closable={!confirmLoading}
        destroyOnClose
        width={640}
      >
        {metaLoading && !testInfo ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="large" />
            <div style={{ marginTop: 12 }}>
              <Text>Đang tải thông tin bài thi...</Text>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 4 }}>
                Thông tin bài thi
              </Text>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Text>
                  <strong>Loại bài thi:</strong> {isSimulator ? "Simulator" : "Practice"}
                </Text>
                {testInfo?.testSkill && (
                  <Text>
                    <strong>Kỹ năng:</strong> {normalizeTestSkill(testInfo.testSkill)}
                  </Text>
                )}
                <Text>
                  <strong>Thời lượng đề:</strong>{" "}
                  {normalizeNumber(testInfo?.duration) > 0
                    ? `${normalizeNumber(testInfo?.duration)} phút`
                    : "Không giới hạn"}
                </Text>
                <Text>
                  <strong>Số lượng câu hỏi:</strong>{" "}
                  {normalizeNumber(testInfo?.questionQuantity) || "Không rõ"}
                </Text>
              </div>
            </div>

            {isSimulator ? (
              <Alert
                type="info"
                showIcon
                message="Chế độ Simulator"
                description="Bài thi sẽ tự động đếm ngược theo thời lượng chuẩn của đề và tự nộp khi hết giờ."
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="Chế độ Practice"
                description="Bạn có thể luyện tập với chế độ đếm ngược theo thời gian đề (nếu bật) hoặc luyện tự do đếm thời gian lên từ 00:00."
                style={{ marginBottom: 16 }}
              />
            )}

            {isPractice && (
              <div style={{ marginBottom: 12 }}>
                <Checkbox
                  checked={practiceCountdown}
                  onChange={(e) => setPracticeCountdown(e.target.checked)}
                  disabled={confirmLoading}
                >
                  Bật đếm ngược theo thời gian của đề
                </Checkbox>
                <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                  Nếu không chọn, thời gian sẽ đếm lên từ 00:00 và bạn có thể nộp bài bất cứ lúc nào.
                </Text>
              </div>
            )}

            <Alert
              type="info"
              showIcon
              message="Tính năng lưu tiến độ"
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    Hệ thống sẽ tự động lưu tiến độ làm bài của bạn mỗi 5 phút. Bạn cũng có thể nhấn nút <strong>"Lưu"</strong> trên thanh công cụ để lưu thủ công bất cứ lúc nào.
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    <BulbOutlined style={{ marginRight: 4, color: "#1890ff" }} /> Lưu ý: Nếu mất kết nối mạng, hệ thống sẽ lưu tạm thời các câu trả lời của bạn. Khi kết nối lại, tiến độ sẽ được lưu tự động.
                  </div>
                </div>
              }
              style={{ marginBottom: 16 }}
            />

            <Alert
              type="warning"
              showIcon
              message="Lưu ý"
              description="Ngay sau khi xác nhận, đề thi sẽ bắt đầu và thời gian làm bài được ghi nhận."
            />
          </div>
        )}
      </Modal>
    </div>
  );
}