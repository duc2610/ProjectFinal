import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, Modal, Typography, message, Spin } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest } from "../../../services/testExamService";
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

  // ExamScreen.jsx
  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    setShowSubmitModal(true);

    try {
      const testResultId = rawTestData.testResultId;
      if (!testResultId) throw new Error("Không tìm thấy testResultId");

      // Tính thời gian đã làm
      const duration = Math.floor((rawTestData.duration * 60 - timeLeft) / 60);

      // Xử lý answers: upload audio files cho speaking, giữ text cho writing
      const processedAnswers = await Promise.all(
        Object.entries(answers).map(async ([testQuestionId, answerValue]) => {
          const q = questions.find((q) => q.testQuestionId === parseInt(testQuestionId));
          const isWritingPart = q?.partId >= 8 && q?.partId <= 10;
          const isSpeakingPart = q?.partId >= 11 && q?.partId <= 15;

          // Nếu là speaking và answerValue là Blob, upload file
          if (isSpeakingPart && answerValue instanceof Blob) {
            try {
              // Tạo File từ Blob để upload
              const audioFile = new File([answerValue], `speaking_${testQuestionId}.webm`, {
                type: "audio/webm",
              });
              const audioUrl = await uploadFile(audioFile, "audio");
              return {
                testQuestionId: parseInt(testQuestionId),
                subQuestionIndex: q?.subQuestionIndex || 0,
                chosenOptionLabel: audioUrl, // Gửi URL audio cho speaking
              };
            } catch (error) {
              console.error(`Error uploading audio for question ${testQuestionId}:`, error);
              message.warning(`Không thể upload audio cho câu ${q?.globalIndex || testQuestionId}`);
              return {
                testQuestionId: parseInt(testQuestionId),
                subQuestionIndex: q?.subQuestionIndex || 0,
                chosenOptionLabel: "", // Gửi rỗng nếu upload thất bại
              };
            }
          }

          // Nếu là writing, gửi text
          if (isWritingPart && typeof answerValue === "string") {
            return {
              testQuestionId: parseInt(testQuestionId),
              subQuestionIndex: q?.subQuestionIndex || 0,
              chosenOptionLabel: answerValue, // Gửi text cho writing
            };
          }

          // Nếu là L&R (multiple choice), gửi chosenOptionLabel như bình thường
          return {
            testQuestionId: parseInt(testQuestionId),
            subQuestionIndex: q?.subQuestionIndex || 0,
            chosenOptionLabel: answerValue || "",
          };
        })
      );

      const payload = {
        userId: "33333333-3333-3333-3333-333333333333",
        testId: rawTestData.testId,
        testResultId,
        duration: duration > 0 ? duration : 1, // Backend không cho 0
        testType: "Simulator",
        answers: processedAnswers,
      };

      if (payload.answers.length === 0) {
        message.warning("Bạn chưa trả lời câu nào!");
        setShowSubmitModal(false);
        return;
      }

      const submitResult = await submitTest(payload);

      // TRUYỀN TOÀN BỘ DỮ LIỆU + CÂU HỎI TỪ SESSION
      const fullResult = {
        ...submitResult,
        questions: questions, // Gửi luôn câu hỏi để hiển thị
        duration: payload.duration,
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
            <Button onClick={() => handleSubmit(false)}>Nộp bài</Button>
            <Button style={{ marginLeft: 8 }} type="dashed">{formatTime(timeLeft)}</Button>
            <Text style={{ color: "#fff", marginLeft: 12 }}>
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