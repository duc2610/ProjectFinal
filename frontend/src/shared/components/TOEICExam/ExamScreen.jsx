import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, Modal, Typography, message, Spin } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest } from "../../../services/testExamService";
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

  const handleSubmit = async (auto = false) => {
  clearInterval(timerRef.current);
  setShowSubmitModal(true);

  try {
    // LẤY testResultId từ sessionStorage
    const testResultId = rawTestData.testResultId;
    if (!testResultId) {
      throw new Error("Không tìm thấy testResultId");
    }

    const payload = {
      userId: "33333333-3333-3333-3333-333333333333", // Dùng GUID thật
      testId: rawTestData.testId,
      testResultId: testResultId, // BẮT BUỘC
      duration: Math.floor((rawTestData.duration * 60 - timeLeft) / 60), // Thời gian đã làm
      testType: rawTestData.testType, // "Simulator"
      answers: Object.entries(answers).map(([testQuestionId, chosenOptionLabel]) => {
        const question = questions.find(q => q.testQuestionId === parseInt(testQuestionId));
        return {
          testQuestionId: parseInt(testQuestionId),
          subQuestionIndex: question?.subQuestionIndex || 0,
          chosenOptionLabel,
        };
      }),
    };

    console.log("Final payload:", payload);
    await submitTest(payload);

    setTimeout(() => {
      setShowSubmitModal(false);
      navigate("/result", { 
  state: { 
    testResultId: rawTestData.testResultId,
    autoSubmit: auto 
  } 
});
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