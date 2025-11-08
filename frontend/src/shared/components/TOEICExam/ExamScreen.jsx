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
  const [timeLeft, setTimeLeft] = useState((rawTestData.duration || 120) * 60);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!rawTestData.testResultId || questions.length === 0) {
      message.error("Không có dữ liệu bài thi");
      navigate("/toeic-exam");
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [rawTestData, questions, navigate]);

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
    clearInterval(timerRef.current);
    setShowSubmitModal(true);

    try {
      const testResultId = rawTestData.testResultId;
      if (!testResultId) throw new Error("Không tìm thấy testResultId");

      // Tính thời gian đã làm
      const duration = Math.floor((rawTestData.duration * 60 - timeLeft) / 60);
      const testType = rawTestData.testType || "Simulator";
      const testTypeLower = testType.toLowerCase() === "simulator" ? "simulator" : "practice";

      // Tách answers thành L&R và S&W
      const lrAnswers = [];
      const swAnswers = [];

      // Xử lý từng answer
      for (const [testQuestionId, answerValue] of Object.entries(answers)) {
        const q = questions.find((q) => q.testQuestionId === parseInt(testQuestionId));
        if (!q) continue;

        const isWritingPart = q.partId >= 8 && q.partId <= 10;
        const isSpeakingPart = q.partId >= 11 && q.partId <= 15;
        const isLrPart = q.partId >= 1 && q.partId <= 7;

        if (isLrPart) {
          // L&R: gửi như cũ
          lrAnswers.push({
            testQuestionId: parseInt(testQuestionId),
            subQuestionIndex: q.subQuestionIndex || 0,
            chosenOptionLabel: answerValue || "",
          });
        } else if (isWritingPart) {
          // Writing: gửi text
          const partType = getPartType(q.partId);
          if (partType && typeof answerValue === "string" && answerValue.trim() !== "") {
            swAnswers.push({
              testQuestionId: parseInt(testQuestionId),
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
              const audioFile = new File([answerValue], `speaking_${testQuestionId}.webm`, {
                type: "audio/webm",
              });
              const audioUrl = await uploadFile(audioFile, "audio");
              
              swAnswers.push({
                testQuestionId: parseInt(testQuestionId),
                partType: partType,
                answerText: null,
                audioFileUrl: audioUrl,
              });
            } catch (error) {
              console.error(`Error uploading audio for question ${testQuestionId}:`, error);
              message.warning(`Không thể upload audio cho câu ${q.globalIndex || testQuestionId}`);
              // Vẫn thêm vào nhưng với audioFileUrl null
              swAnswers.push({
                testQuestionId: parseInt(testQuestionId),
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
      let finalTestResultId = testResultId; // Dùng testResultId ban đầu làm mặc định
      
      if (lrAnswers.length > 0) {
        const lrPayload = {
          userId: "33333333-3333-3333-3333-333333333333",
          testId: rawTestData.testId,
          testResultId,
          duration: duration > 0 ? duration : 1,
          testType: testType,
          answers: lrAnswers,
        };
        lrResult = await submitTest(lrPayload);
        // Lấy testResultId từ response nếu có (có thể backend trả về testResultId mới)
        if (lrResult?.testResultId) {
          finalTestResultId = lrResult.testResultId;
        } else if (lrResult?.data?.testResultId) {
          finalTestResultId = lrResult.data.testResultId;
        }
      }

      // Submit S&W nếu có (dùng cùng testResultId)
      let swResult = null;
      if (swAnswers.length > 0) {
        const swPayload = {
          testResultId: finalTestResultId, // Dùng testResultId từ L&R hoặc ban đầu
          testType: testTypeLower,
          duration: duration > 0 ? duration : 1,
          parts: swAnswers,
        };
        swResult = await submitAssessmentBulk(swPayload);
        // Cập nhật testResultId từ S&W response nếu có
        if (swResult?.testResultId) {
          finalTestResultId = swResult.testResultId;
        } else if (swResult?.data?.testResultId) {
          finalTestResultId = swResult.data.testResultId;
        }
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
        testResultId: finalTestResultId, // Đảm bảo có testResultId để lấy chi tiết sau
        questions: questions,
        duration: duration > 0 ? duration : 1,
      };

      setTimeout(() => {
        setShowSubmitModal(false);
        navigate("/result", { state: { resultData: fullResult, autoSubmit: auto } });
      }, 900);
    } catch (error) {
      message.error("Nộp bài thất bại: " + (error.response?.data?.message || error.message));
      setShowSubmitModal(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
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
            <Text style={{ color: "#fff", marginLeft: 12 }}>TOEIC - {rawTestData.title}</Text>
          </div>
          <div className={styles.headerRight}>
            <Button 
              onClick={() => handleSubmit(false)}
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
              {formatTime(timeLeft)}
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