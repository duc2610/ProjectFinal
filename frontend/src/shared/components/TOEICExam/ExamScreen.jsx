import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, Modal, Typography, message, Spin } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest, submitAssessmentBulk } from "../../../services/testExamService";
import { uploadFile } from "../../../services/filesService";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ExamScreen() {
  const navigate = useNavigate();
  const rawTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
  const [questions] = useState(rawTestData.questions || []);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const normalizedDurationMinutes = Number(rawTestData.duration) || 0;
  const totalDurationSeconds = Math.max(0, Math.floor(normalizedDurationMinutes * 60));
  const isSelectTime =
    rawTestData.isSelectTime !== undefined ? !!rawTestData.isSelectTime : true;
  const startTimestampValue = rawTestData.startedAt ? Number(rawTestData.startedAt) : Date.now();
  const safeStartTimestamp = Number.isFinite(startTimestampValue) ? startTimestampValue : Date.now();
  const initialElapsedSeconds =
    !isSelectTime
      ? Math.max(0, Math.floor((Date.now() - safeStartTimestamp) / 1000))
      : 0;
  const [timeLeft, setTimeLeft] = useState(isSelectTime ? totalDurationSeconds : totalDurationSeconds);
  const [timeElapsed, setTimeElapsed] = useState(initialElapsedSeconds);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimestampRef = useRef(safeStartTimestamp);

  // Sync ref với state
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    const handlePopState = () => {
      history.go(1);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    if (!rawTestData.testResultId || questions.length === 0) {
      message.error("Không có dữ liệu bài thi");
      navigate("/test-list");
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isSelectTime) {
      const elapsedSinceStart = Math.max(
        0,
        Math.floor((Date.now() - startTimestampRef.current) / 1000)
      );
      const startingLeft =
        totalDurationSeconds > 0
          ? Math.max(0, totalDurationSeconds - elapsedSinceStart)
          : 0;
      setTimeLeft(startingLeft);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      const elapsedSinceStart = Math.max(
        0,
        Math.floor((Date.now() - startTimestampRef.current) / 1000)
      );
      setTimeElapsed(elapsedSinceStart);

      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - startTimestampRef.current) / 1000)
        );
        setTimeElapsed(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    rawTestData.testResultId,
    questions.length,
    navigate,
    isSelectTime,
    totalDurationSeconds,
  ]);

  const onAnswer = (testQuestionId, value) => {
    setAnswers((prev) => ({ ...prev, [testQuestionId]: value }));
  };

  const goToQuestionByIndex = (i) => {
    if (i >= 0 && i < questions.length) setCurrentIndex(i);
  };

  // Map partId sang partType cho S&W
  const getPartType = (partId) => {
    const partTypeMap = {
      8: "writing_sentence",      // W-Part 1
      9: "writing_email",          // W-Part 2
      10: "writing_essay",         // W-Part 3
      11: "speaking_read_aloud",   // S-Part 1
      12: "speaking_describe_picture", // S-Part 2
      13: "speaking_respond_questions", // S-Part 3
      14: "speaking_respond_questions_info", // S-Part 4
      15: "speaking_express_opinion", // S-Part 5
    };
    return partTypeMap[partId] || null;
  };

  // ExamScreen.jsx
  const handleSubmit = async (auto = false) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Submit already in progress, ignoring duplicate call");
      return;
    }

    setIsSubmitting(true);
    clearInterval(timerRef.current);
    setShowSubmitModal(true);

    try {
      const testResultId = rawTestData.testResultId;
      if (!testResultId) throw new Error("Không tìm thấy testResultId");

      const now = Date.now();
      let elapsedSeconds = Math.max(
        0,
        Math.floor((now - startTimestampRef.current) / 1000)
      );
      if (isSelectTime && totalDurationSeconds > 0) {
        elapsedSeconds = Math.min(elapsedSeconds, totalDurationSeconds);
      }
      const durationMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
      const testType = rawTestData.testType || "Simulator";
      const testTypeLower = testType.toLowerCase() === "simulator" ? "simulator" : "practice";

      // Tách answers thành L&R và S&W
      const lrAnswers = [];
      const swAnswers = [];

      // Xử lý từng answer
      for (const [answerKey, answerValue] of Object.entries(answers)) {
        // Parse answerKey: có thể là "testQuestionId" hoặc "testQuestionId_subQuestionIndex"
        let testQuestionId, subQuestionIndex;
        if (answerKey.includes('_')) {
          // Group question: key format là "testQuestionId_subQuestionIndex"
          const parts = answerKey.split('_');
          testQuestionId = parseInt(parts[0]);
          subQuestionIndex = parseInt(parts[1]);
        } else {
          // Single question: key là testQuestionId
          testQuestionId = parseInt(answerKey);
          subQuestionIndex = 0;
        }

        // Tìm question tương ứng
        const q = questions.find((q) => 
          q.testQuestionId === testQuestionId && 
          (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex))
        );
        if (!q) continue;

        const isWritingPart = q.partId >= 8 && q.partId <= 10;
        const isSpeakingPart = q.partId >= 11 && q.partId <= 15;
        const isLrPart = q.partId >= 1 && q.partId <= 7;

        if (isLrPart) {
          // L&R: gửi với testQuestionId và subQuestionIndex
          lrAnswers.push({
            testQuestionId: testQuestionId,
            subQuestionIndex: subQuestionIndex,
            chosenOptionLabel: answerValue || "",
          });
        } else if (isWritingPart) {
          // Writing: gửi text
          const partType = getPartType(q.partId);
          if (partType && typeof answerValue === "string" && answerValue.trim() !== "") {
            swAnswers.push({
              testQuestionId: testQuestionId,
              partType: partType,
              answerText: answerValue,
              audioFileUrl: null,
            });
          }
        } else if (isSpeakingPart) {
          // Speaking: upload audio trước, sau đó gửi URL
          const partType = getPartType(q.partId);
          if (partType && answerValue instanceof Blob) {
            try {
              // Upload audio file
              const audioFile = new File([answerValue], `speaking_${testQuestionId}_${subQuestionIndex}.webm`, {
                type: "audio/webm",
              });
              const audioUrl = await uploadFile(audioFile, "audio");
              
              swAnswers.push({
                testQuestionId: testQuestionId,
                partType: partType,
                answerText: null,
                audioFileUrl: audioUrl,
              });
            } catch (error) {
              console.error(`Error uploading audio for question ${testQuestionId}:`, error);
              message.warning(`Không thể upload audio cho câu ${q.globalIndex || testQuestionId}`);
              // Vẫn thêm vào nhưng với audioFileUrl null
              swAnswers.push({
                testQuestionId: testQuestionId,
                partType: partType,
                answerText: null,
                audioFileUrl: null,
              });
            }
          }
        }
      }

      // Submit L&R nếu có
      let lrResult = null;
      // Luôn ưu tiên testResultId do server trả về sau submit (trong trường hợp backend tạo bản ghi mới)
      let finalTestResultId = testResultId;
      
      if (lrAnswers.length > 0) {
        const lrPayload = {
          userId: "33333333-3333-3333-3333-333333333333",
          testId: rawTestData.testId,
          testResultId: finalTestResultId, // Dùng testResultId ban đầu
          duration: durationMinutes,
          testType: testType,
          answers: lrAnswers,
        };
        console.log("Submitting L&R with testResultId:", finalTestResultId);
        lrResult = await submitTest(lrPayload);
        console.log("L&R submit response:", lrResult);

        // Nếu backend trả về testResultId mới (ví dụ: 1202), dùng ID đó cho bước lấy chi tiết
        if (lrResult && lrResult.testResultId) {
          finalTestResultId = lrResult.testResultId;
          try {
            // Đồng bộ lại testResultId trong toeic_testData để các màn sau dùng đúng ID
            const saved = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            saved.testResultId = finalTestResultId;
            sessionStorage.setItem("toeic_testData", JSON.stringify(saved));
          } catch (e) {
            console.error("Error syncing testResultId to sessionStorage:", e);
          }
        }
      }

      // Submit S&W nếu có (dùng CÙNG testResultId ban đầu)
      let swResult = null;
      if (swAnswers.length > 0) {
        const swPayload = {
          testResultId: finalTestResultId, // Dùng CÙNG testResultId ban đầu
          testType: testTypeLower,
          duration: durationMinutes,
          parts: swAnswers,
        };
        console.log("Submitting S&W with testResultId:", finalTestResultId);
        swResult = await submitAssessmentBulk(swPayload);
        // KHÔNG cập nhật testResultId từ response - luôn dùng testResultId ban đầu
        console.log("S&W submit response:", swResult);
      }

      // Kiểm tra nếu không có câu nào được trả lời
      if (lrAnswers.length === 0 && swAnswers.length === 0) {
        message.warning("Bạn chưa trả lời câu nào!");
        setShowSubmitModal(false);
        return;
      }

      // Merge kết quả: ưu tiên L&R result vì nó có đầy đủ thông tin
      const fullResult = {
        ...(lrResult || {}),
        ...(swResult || {}),
        testResultId: finalTestResultId, // DÙNG ID do server trả để lấy chi tiết
        testId: rawTestData.testId, // Lưu testId để có thể làm lại bài thi
        questions: questions,
        duration: durationMinutes,
        testType,
        isSelectTime,
      };

      setTimeout(() => {
        setShowSubmitModal(false);
        navigate("/result", { state: { resultData: fullResult, autoSubmit: auto } });
      }, 900);
    } catch (error) {
      message.error("Nộp bài thất bại: " + (error.response?.data?.message || error.message));
      setShowSubmitModal(false);
      setIsSubmitting(false); // Reset flag on error
    }
  };

  useEffect(() => {
    if (isSelectTime && timeLeft === 0 && !isSubmittingRef.current) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectTime, timeLeft]);

  const formatTime = (value) => {
    const safeSeconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" tip="Đang tải câu hỏi..." />
      </div>
    );
  }

  return (
    <Layout className={styles.examLayout}>
      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
              onClick={() => setIsNavVisible(!isNavVisible)}
            />
            <Text style={{ color: "#fff", marginLeft: 12 }}>
              TOEIC - {rawTestData.title || "Bài thi"}
            </Text>
          </div>
          <div className={styles.headerRight}>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              loading={isSubmitting}
              style={{
                borderRadius: "8px",
                height: "36px",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
              }}
            >
              Nộp bài
            </Button>
            <Button 
              style={{ 
                marginLeft: 8,
                borderRadius: "8px",
                height: "36px",
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#fff"
              }} 
              type="dashed"
            >
              {formatTime(isSelectTime ? timeLeft : timeElapsed)}
            </Button>
            <Text style={{ 
              color: "#fff", 
              marginLeft: 12,
              fontSize: "14px",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.2)",
              padding: "6px 12px",
              borderRadius: "8px"
            }}>
              {answeredCount}/{totalCount} câu
            </Text>
          </div>
        </div>
      </Header>

      <Content className={styles.contentArea}>
        <div className={styles.examBody}>
          {isNavVisible && (
            <div className={styles.sideNav}>
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                goToQuestionByIndex={goToQuestionByIndex}
              />
            </div>
          )}
          <div className={styles.questionArea} style={{ flex: isNavVisible ? 1 : "auto" }}>
            <QuestionCard
              question={questions[currentIndex]}
              currentIndex={currentIndex}
              totalCount={totalCount}
              answers={answers}
              onAnswer={onAnswer}
              goToQuestionByIndex={goToQuestionByIndex}
              handleSubmit={() => handleSubmit(false)}
              isSubmitting={isSubmitting}
              globalAudioUrl={rawTestData.globalAudioUrl}
            />
          </div>
        </div>
      </Content>

      <Modal open={showSubmitModal} footer={null} closable={false}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin /> <Text style={{ marginLeft: 12 }}>Đang nộp bài...</Text>
        </div>
      </Modal>
    </Layout>
  );
}