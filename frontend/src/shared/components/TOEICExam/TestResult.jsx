import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Table,
  Modal,
  Input,
  message,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SoundOutlined,
  ReadOutlined,
  MessageOutlined,
  EditOutlined,
  CheckCircleTwoTone,
  FlagOutlined,
} from "@ant-design/icons";
import styles from "../../styles/Result.module.css";

const { Title, Text } = Typography;

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Nếu có state từ ExamScreen thì dùng nó, nếu không thì fallback mock
  const resultState = state || {
    // fallback mock (keeps previous mock structure)
    overall: 845,
    listening: 420,
    reading: 350,
    speaking: 160,
    writing: 170,
    detailTasks: [
      {
        title: "Task 1: Write a Sentence Based on a Picture",
        score: 4.5,
        feedback: "Excellent accuracy and relevance.",
        userWriting: {
          "1-1": "A man is riding a bicycle in the park.",
        },
      },
    ],
    // NOTE: in real flow ExamScreen passes `questions` array and `answers` map
    questions: [], // fallback empty
    answers: {}, // fallback empty
  };

  const [selectedSection, setSelectedSection] = useState("overall");
  const [displayScore, setDisplayScore] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportQuestion, setReportQuestion] = useState(null);
  const [reportText, setReportText] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailQuestions, setDetailQuestions] = useState([]);

  // animate score display (same as before)
  useEffect(() => {
    const target =
      selectedSection === "overall"
        ? resultState.overall
        : resultState[selectedSection] || 0;
    let curr = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => {
      curr += step;
      if (curr >= target) {
        setDisplayScore(target);
        clearInterval(id);
      } else setDisplayScore(curr);
    }, 20);
    return () => clearInterval(id);
  }, [selectedSection, resultState]);

  // sections meta (for sidebar)
  const sections = [
    {
      key: "overall",
      title: "Overall Score",
      score: resultState.overall,
      max: 990,
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
    },
    {
      key: "listening",
      title: "Listening (495 points)",
      score: resultState.listening,
      max: 495,
      icon: <SoundOutlined />,
    },
    {
      key: "reading",
      title: "Reading (495 points)",
      score: resultState.reading,
      max: 495,
      icon: <ReadOutlined />,
    },
    {
      key: "speaking",
      title: "Speaking (200) - AI Scored",
      score: resultState.speaking,
      max: 200,
      icon: <MessageOutlined />,
    },
    {
      key: "writing",
      title: "Writing (200) - AI Scored",
      score: resultState.writing,
      max: 200,
      icon: <EditOutlined />,
    },
  ];

  // derive question rows per section from resultState.questions + resultState.answers
  // resultState.questions is expected to be array of question objects (from generateMockQuestionsFromParts)
  const questionRowsBySection = useMemo(() => {
    const qRows = {
      listening: [],
      reading: [],
      writing: [],
      all: [],
    };
    const questions = Array.isArray(resultState.questions)
      ? resultState.questions
      : [];

    const answersMap = resultState.answers || {};

    questions.forEach((q, idx) => {
      // determine which "section" q belongs to based on partId
      // parts 1-4 -> listening, 5-7 -> reading; writing is separate (we'll use allowWrite or type 'writing')
      const part = q.partId;
      const user = answersMap[q.id];
      const correct = q.correct || null;
      // if allowWrite true treat as writing-type (user is text)
      const isWritingType = !!q.allowWrite || q.type === "writing";
      const isCorrect =
        isWritingType ? null : (user !== undefined && correct !== null ? user === correct : false);

      const row = {
        key: q.id,
        id: q.id,
        index: q.globalIndex || idx + 1,
        partId: q.partId,
        partTitle: q.partTitle || `Part ${q.partId}`,
        question: q.question || q.passage || "",
        passage: q.passage || null,
        imageUrl: q.imageUrl || null,
        audioUrl: q.audioUrl || null,
        options: q.options || [],
        userAnswer: user === undefined || user === null ? "" : user,
        correctAnswer: correct,
        isCorrect,
      };

      qRows.all.push(row);

      if (isWritingType) {
        qRows.writing.push(row);
      } else if ([1, 2, 3, 4].includes(part)) {
        qRows.listening.push(row);
      } else if ([5, 6, 7].includes(part)) {
        qRows.reading.push(row);
      } else {
        // default to reading
        qRows.reading.push(row);
      }
    });

    return qRows;
  }, [resultState.questions, resultState.answers]);

  // table columns (reuse)
  const columns = [
    {
      title: "No.",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (text, row) => (
        <div>
          {row.passage && <div style={{ fontStyle: "italic", marginBottom: 6 }}>{row.passage}</div>}
          <div>{text}</div>
        </div>
      ),
    },
    {
      title: "Your answer",
      dataIndex: "userAnswer",
      key: "userAnswer",
      width: 160,
      render: (v, row) => {
        if (row.isCorrect === null) {
          // writing / N/A
          return <Text type="secondary">{v ? v : "No submission"}</Text>;
        }
        return <Text style={{ color: row.isCorrect ? "green" : "red" }}>{v ? v : "No answer"}</Text>;
      },
    },
    {
      title: "Correct",
      dataIndex: "correctAnswer",
      key: "correctAnswer",
      width: 140,
      render: (v) => (v ? v : <Text type="secondary">N/A</Text>),
    },
    {
      title: "Result",
      dataIndex: "isCorrect",
      key: "isCorrect",
      width: 120,
      render: (isCorrect) => {
        if (isCorrect === null) return <Tag color="gold">N/A</Tag>;
        return isCorrect ? <Tag color="success">Correct</Tag> : <Tag color="error">Wrong</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="small" onClick={() => {
            setDetailQuestions([row]); // quick view single
            setDetailModalVisible(true);
          }}>View</Button>
          <Button size="small" onClick={() => { setReportQuestion(row); setReportModalVisible(true); }}>Report</Button>
        </div>
      ),
    },
  ];

  // handlers
  const handleReportSubmit = () => {
    // mock submit
    console.log("REPORT (mock):", {
      questionId: reportQuestion?.id,
      questionText: reportQuestion?.question,
      reason: reportText,
      at: new Date().toISOString(),
    });
    message.success("Cảm ơn — báo cáo đã được gửi (mô phỏng).");
    setReportModalVisible(false);
    setReportQuestion(null);
    setReportText("");
  };

  const openDetailForSection = (key) => {
    if (key === "overall") {
      setDetailQuestions(questionRowsBySection.all);
    } else if (key === "listening") {
      setDetailQuestions(questionRowsBySection.listening);
    } else if (key === "reading") {
      setDetailQuestions(questionRowsBySection.reading);
    } else if (key === "writing") {
      setDetailQuestions(questionRowsBySection.writing);
    } else {
      setDetailQuestions([]);
    }
    setDetailModalVisible(true);
  };

  return (
    <div className={styles.resultPage}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <Title level={4}>Test Sections</Title>
        {sections.map((s) => (
          <Card
            key={s.key}
            size="small"
            onClick={() => setSelectedSection(s.key)}
            className={`${styles.sidebarCard} ${selectedSection === s.key ? styles.activeCard : ""}`}
            style={{ marginBottom: 10, cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>{s.icon} {s.title}</Text>
                <br />
                <Text type="secondary">{s.score}/{s.max} points</Text>
              </div>
              <div>
                <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); openDetailForSection(s.key); }}>
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <div className={styles.infoBox}>
          <Title level={5}>Test Information</Title>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <br />
          <Text>Duration: 2h 45m</Text>
          <br />
          <Text>Type: Full TOEIC – Speaking & Writing</Text>
          <br />
          <Text>AI Scoring: Advanced Neural Network</Text>
        </div>

        <div className={styles.performanceBox}>
          <Title level={5}>Performance Level</Title>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text style={{ marginLeft: 8 }}>Advanced (785–990)</Text>
          <p style={{ color: "#555", marginTop: 6 }}>
            You can communicate effectively in most professional situations.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            TOEIC Test Results
          </Title>
          <Button onClick={() => { navigate("/toeic-exam"); }} ghost>Retake Test</Button>
        </div>

        <div className={styles.content}>
          <Title level={4} style={{ color: "#003a8c" }}>
            {selectedSection === "writing"
              ? "Writing Section Results (AI Evaluated)"
              : selectedSection === "overall"
                ? "Overall Results"
                : `${sections.find((s) => s.key === selectedSection).title}`}
          </Title>

          <Card className={styles.scoreCard}>
            <div className={styles.scoreDisplay}>
              <Title level={1} style={{ color: "#fa8c16", marginBottom: 0 }}>{displayScore}</Title>
              <Text strong>
                {selectedSection === "overall" ? "Overall Score" : selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1) + " Score"}
              </Text>
              <br />
              <Text type="secondary">
                Out of {selectedSection === "overall" ? 990 : sections.find((s) => s.key === selectedSection).max} points
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="orange">AI Neural Network Evaluation</Tag>
              </div>
            </div>

            {/* Writing */}
            {selectedSection === "writing" && (resultState.detailTasks || []).map((t, i) => (
              <Card key={i} type="inner" title={t.title} className={styles.taskCard}>
                <Text strong style={{ color: "#fa541c", fontSize: 16 }}>{t.score}</Text><br />
                <Text>{t.feedback}</Text>
                <div style={{ marginTop: 8 }}><a href="#">View AI Analysis</a></div>

                <div style={{ marginTop: 12 }}>
                  <Title level={5}>Your submissions</Title>
                  {t.userWriting && Object.keys(t.userWriting).length ? (
                    Object.entries(t.userWriting).map(([qid, text]) => (
                      <Card key={qid} size="small" style={{ marginTop: 8 }}>
                        <Text type="secondary">Question {qid}</Text>
                        <div style={{ marginTop: 6 }}>{text}</div>
                      </Card>
                    ))
                  ) : (
                    <Text type="secondary">No writing submissions found.</Text>
                  )}
                </div>
              </Card>
            ))}

            {/* Listening & Reading Tables */}
            {selectedSection === "listening" && (
              <Table
                dataSource={questionRowsBySection.listening}
                columns={columns}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 20 }}
              />
            )}

            {selectedSection === "reading" && (
              <Table
                dataSource={questionRowsBySection.reading}
                columns={columns}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 20 }}
              />
            )}

            {/* Overall Section */}
            {selectedSection === "overall" && (
              <div style={{ marginTop: 12 }}>
                <p>Listening: {resultState.listening} / 495</p>
                <p>Reading: {resultState.reading} / 495</p>
                <p>Speaking: {resultState.speaking} / 200</p>
                <p>Writing: {resultState.writing} / 200</p>
                <div style={{ marginTop: 12 }}>
                  <Button onClick={() => { setDetailQuestions(questionRowsBySection.all); setDetailModalVisible(true); }}>View all question details</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Detail modal (list questions for a section) */}
      <Modal
        title="Question details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={[
            { title: "No.", dataIndex: "index", key: "index", width: 80 },
            { title: "Question", dataIndex: "question", key: "question", render: (t, r) => (<div>{r.passage && <div style={{ fontStyle: 'italic' }}>{r.passage}</div>}{t}</div>) },
            { title: "Your answer", dataIndex: "userAnswer", key: "userAnswer", render: (v, r) => (r.isCorrect === null ? <Text type="secondary">{v || 'No submission'}</Text> : <Text style={{ color: r.isCorrect ? 'green' : 'red' }}>{v || 'No answer'}</Text>) },
            { title: "Correct", dataIndex: "correctAnswer", key: "correctAnswer" },
            { title: "Result", dataIndex: "isCorrect", key: "isCorrect", render: (val) => (val === null ? <Tag color="gold">N/A</Tag> : val ? <Tag color="success">Correct</Tag> : <Tag color="error">Wrong</Tag>) },
            { title: "Report", key: "report", render: (_, row) => (<Button size="small" onClick={() => { setReportQuestion(row); setReportModalVisible(true); }}>Report</Button>) }
          ]}
          dataSource={detailQuestions}
          rowKey="key"
          pagination={{ pageSize: 8 }}
        />
      </Modal>

      {/* Report Modal */}
      <Modal
        title="Report Question"
        open={reportModalVisible}
        onOk={handleReportSubmit}
        onCancel={() => { setReportModalVisible(false); setReportQuestion(null); setReportText(""); }}
        okText="Submit"
      >
        <p><b>Question:</b> {reportQuestion ? reportQuestion.question : ""}</p>
        <Input.TextArea rows={4} value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Describe the issue with this question..." />
      </Modal>
    </div>
  );
}
