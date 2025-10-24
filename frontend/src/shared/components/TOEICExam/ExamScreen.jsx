import React, { useEffect, useRef, useState } from "react";
import { Layout, Button, Modal, Typography } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { generateMockQuestionsFromParts } from "./mockData";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ExamScreen() {
  const navigate = useNavigate();
  const selectedParts = JSON.parse(sessionStorage.getItem("toeic_selectedParts") || "[]");
  const durationMinutes = Number(sessionStorage.getItem("toeic_duration") || 60);

  const [questions] = useState(() => generateMockQuestionsFromParts(selectedParts));
  // answers: for multiple choice store selected option; for writing store { text: '...' } under same q.id
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const timerRef = useRef(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAnswer = (qid, optionOrText) => setAnswers((p) => ({ ...p, [qid]: optionOrText }));
  const goToQuestionByIndex = (i) => { if (i >= 0 && i < questions.length) setCurrentIndex(i); };

  const handleSubmit = (auto = false) => {
    clearInterval(timerRef.current);
    // scoring: count MCQ correct; writing/speaking are left as-is (mock)
    const total = questions.length;
    const mcqQuestions = questions.filter((q) => q.type !== "photo" && q.type !== "audio" && q.type !== "mcq" && q.type !== "passage" ? [] : true);
    // We'll compute correct for MCQ/audio/photo/passage types where 'correct' exists
    const correctCount = questions.reduce((acc, q) => acc + (answers[q.id] && answers[q.id] === q.correct ? 1 : 0), 0);
    const scorePercent = total ? (correctCount / total) : 0;

    // Map result roughly:
    const listeningParts = questions.filter((q) => q.type === "audio" || q.type === "photo");
    const readingParts = questions.filter((q) => q.type === "mcq" || q.type === "passage");
    const listeningCorrect = listeningParts.reduce((acc, q) => acc + (answers[q.id] && answers[q.id] === q.correct ? 1 : 0), 0);
    const readingCorrect = readingParts.reduce((acc, q) => acc + (answers[q.id] && answers[q.id] === q.correct ? 1 : 0), 0);

    const listening = Math.round((listeningParts.length ? (listeningCorrect / listeningParts.length) : 0) * 495);
    const reading = Math.round((readingParts.length ? (readingCorrect / readingParts.length) : 0) * 495);
    const speaking = Math.round((Math.random() * 200)); // mock
    const writing = (() => {
      // derive writing: if user submitted text, give small boost
      const writingQs = questions.filter((q) => q.type === "passage" && q.partId === 7 ? false : q.type === "mcq" ? false : q.partId === 7 ? false : q); // keep simple
      // simpler: if any answer text exists for writing-type question (detected by presence of answers[qid] as object/string), give random moderate score
      const userWritingCount = questions.filter(q => q.type === "photo" || q.type === "audio" || q.type === "passage" ? false : false).length;
      const anyWritingText = Object.values(answers).some(v => typeof v === "string" && v.trim().length > 0);
      return anyWritingText ? Math.round(120 + Math.random() * 80) : Math.round(Math.random() * 80);
    })();

    const overall = listening + reading + Math.round((speaking + writing) / 2);

    const resultState = {
      totalQuestions: total,
      correctCount,
answers,
      listening, reading, speaking, writing, overall,
      detailTasks: [
        {
          title: "Task 1: Write a Sentence Based on a Picture",
          score: answers["1-1"] && typeof answers["1-1"] === "string" ? "User text submitted" : "No submission",
          feedback: "AI mock feedback: Good structure - improve vocabulary.",
          userWriting: Object.keys(answers).reduce((acc,k)=> {
            // collect writing-type answers (we define writing-type as keys where user provided text)
            const v = answers[k];
            if (typeof v === "string" && v.trim().length > 0) acc[k]=v;
            return acc;
          }, {})
        },
      ],
      auto,
    };

    setShowSubmitModal(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      navigate("/result", { state: resultState });
    }, 900);
  };

  const formattedTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  return (
    <Layout className={styles.examLayout}>
      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MenuOutlined style={{ color: "#fff" }} />
            <Text style={{ color: "#fff", marginLeft: 12 }}>Online exam</Text>
          </div>
          <div className={styles.headerRight}>
            <Button onClick={() => handleSubmit(false)}>Submit</Button>
            <Button style={{ marginLeft: 8 }}>{formattedTime(timeLeft)}</Button>
            <Text style={{ color: "#fff", marginLeft: 12 }}>Demo User</Text>
            <div style={{ marginLeft: 12 }} className={styles.progressBox}>{answeredCount}/{totalCount}</div>
          </div>
        </div>
      </Header>
      <Content className={styles.contentArea}>
        <div className={styles.examBody}>
          <div className={styles.sideNav}>
            <QuestionNavigator filteredQuestions={questions} currentIndex={currentIndex} answers={answers} goToQuestionByIndex={goToQuestionByIndex} />
          </div>
          <div className={styles.questionArea}>
            <QuestionCard
              question={questions[currentIndex]}
              currentIndex={currentIndex}
              totalCount={totalCount}
              answers={answers}
              onAnswer={onAnswer}
              goToQuestionByIndex={goToQuestionByIndex}
              handleSubmit={() => handleSubmit(false)}
            />
          </div>
        </div>
      </Content>

      <Modal open={showSubmitModal} title={"Submitting..."} footer={null} closable={false}>
        <div style={{ textAlign: "center", padding: 20 }}>Submitting your answers...</div>
      </Modal>
    </Layout>
  );
}