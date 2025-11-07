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
  Progress,
  Spin,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SoundOutlined,
  ReadOutlined,
  CheckCircleTwoTone,
  EditOutlined,
} from "@ant-design/icons";
import styles from "../../styles/Result.module.css";

const { Title, Text } = Typography;

export default function ResultScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { resultData, autoSubmit } = state || {};

  const [result, setResult] = useState(null);
  const [selectedSection, setSelectedSection] = useState("overall");
  const [displayScore, setDisplayScore] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportQuestion, setReportQuestion] = useState(null);
  const [reportText, setReportText] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailQuestions, setDetailQuestions] = useState([]);

  // === XỬ LÝ DỮ LIỆU TỪ SUBMIT ===
  useEffect(() => {
    if (autoSubmit) {
      message.info("Hết thời gian! Bài thi đã được nộp tự động.");
    }

    if (!resultData) {
      message.error("Không có dữ liệu kết quả.");
      navigate("/toeic-exam");
      return;
    }

    setResult(resultData);
  }, [resultData, autoSubmit, navigate]);

  // === ANIMATION ĐIỂM SỐ ===
  useEffect(() => {
    if (!result) return;

    const target =
      selectedSection === "overall"
        ? result.totalScore
        : result[selectedSection === "listening" ? "listeningScore" : "readingScore"] || 0;

    let curr = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => {
      curr += step;
      if (curr >= target) {
        setDisplayScore(target);
        clearInterval(id);
      } else {
        setDisplayScore(curr);
      }
    }, 20);
    return () => clearInterval(id);
  }, [selectedSection, result]);

  // === XỬ LÝ CÂU HỎI ===
  const questionRowsBySection = useMemo(() => {
    if (!result?.questions) return { listening: [], reading: [], all: [] };

    const rows = { listening: [], reading: [], all: [] };
    const answersMap = (result.answers || []).reduce((map, a) => {
      map[a.testQuestionId] = a.chosenOptionLabel;
      return map;
    }, {});

    result.questions.forEach((q, idx) => {
      const userAnswer = answersMap[q.testQuestionId] || "";
      const correctAnswer = q.options?.find(o => o.isCorrect)?.key || "";
      const isCorrect = userAnswer === correctAnswer;

      const row = {
        key: q.testQuestionId,
        index: q.globalIndex || idx + 1,
        partId: q.partId,
        partTitle: q.partName || `Part ${q.partId}`,
        question: q.question || "",
        passage: q.passage || null,
        userAnswer,
        correctAnswer,
        isCorrect,
      };

      rows.all.push(row);
      if (q.partId >= 1 && q.partId <= 4) rows.listening.push(row);
      if (q.partId >= 5 && q.partId <= 7) rows.reading.push(row);
    });

    return rows;
  }, [result]);

  // === KIỂM TRA CÓ TRẢ LỜI KHÔNG ===
  const hasAnswered = result && (result.correctCount > 0 || result.incorrectCount > 0);

  // === SIDEBAR SECTIONS ===
  const sections = result
    ? [
        {
          key: "overall",
          title: "Overall Score",
          score: result.totalScore,
          max: 990,
          icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        },
        {
          key: "listening",
          title: "Listening",
          score: result.listeningScore,
          max: 495,
          icon: <SoundOutlined />,
        },
        {
          key: "reading",
          title: "Reading",
          score: result.readingScore,
          max: 495,
          icon: <ReadOutlined />,
        },
      ]
    : [];

  // === TABLE COLUMNS ===
  const columns = [
    { title: "No.", dataIndex: "index", width: 80, align: "center" },
    {
      title: "Question",
      dataIndex: "question",
      render: (text, row) => (
        <div>
          {row.passage && (
            <div style={{ fontStyle: "italic", color: "#666", marginBottom: 6 }}>
              {row.passage}
            </div>
          )}
          <div>{text}</div>
        </div>
      ),
    },
    {
      title: "Your answer",
      dataIndex: "userAnswer",
      width: 160,
      render: (v, row) => (
        <Text style={{ color: row.isCorrect ? "#52c41a" : "#f5222d", fontWeight: "bold" }}>
          {v || "—"}
        </Text>
      ),
    },
    { title: "Correct", dataIndex: "correctAnswer", width: 140 },
    {
      title: "Result",
      dataIndex: "isCorrect",
      width: 120,
      render: (val) => (
        <Tag color={val ? "success" : "error"}>{val ? "Correct" : "Wrong"}</Tag>
      ),
    },
    {
      title: "Action",
      width: 160,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setDetailQuestions([row]);
              setDetailModalVisible(true);
            }}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setReportQuestion(row);
              setReportModalVisible(true);
            }}
          >
            Report
          </Button>
        </div>
      ),
    },
  ];

  const openDetailForSection = (key) => {
    const data =
      key === "overall"
        ? questionRowsBySection.all
        : key === "listening"
        ? questionRowsBySection.listening
        : questionRowsBySection.reading;
    setDetailQuestions(data);
    setDetailModalVisible(true);
  };

  const handleReportSubmit = () => {
    message.success("Báo cáo đã được gửi!");
    setReportModalVisible(false);
    setReportQuestion(null);
    setReportText("");
  };

  // === LOADING ===
  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang xử lý kết quả...</Text>
        </div>
      </div>
    );
  }

  // === CHƯA TRẢ LỜI GÌ ===
  if (!hasAnswered) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              TOEIC Test Results
            </Title>
            <Button onClick={() => navigate("/toeic-exam")} ghost>
              Làm lại bài thi
            </Button>
          </div>
          <div className={styles.content} style={{ textAlign: "center", padding: 60 }}>
            <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
              0
            </Title>
            <Text strong style={{ fontSize: 18 }}>
              Bạn chưa trả lời câu nào
            </Text>
            <br />
            <Text type="secondary">
              Hệ thống không tính điểm khi chưa chọn đáp án.
            </Text>
            <br />
            <br />
            <Button type="primary" size="large" onClick={() => navigate("/toeic-exam")}>
              Quay lại làm bài
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === CÓ TRẢ LỜI → HIỂN THỊ KẾT QUẢ ===
  return (
    <div className={styles.resultPage}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <Title level={4}>Test Sections</Title>
        {sections.map((s) => (
          <Card
            key={s.key}
            size="small"
            onClick={() => setSelectedSection(s.key)}
            className={`${styles.sidebarCard} ${
              selectedSection === s.key ? styles.activeCard : ""
            }`}
            style={{ marginBottom: 10, cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text strong>
                  {s.icon} {s.title}
                </Text>
                <br />
                <Text type="secondary">
                  {s.score}/{s.max} points
                </Text>
              </div>
              <Button
                size="small"
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetailForSection(s.key);
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </Card>
        ))}

        <div className={styles.infoBox}>
          <Title level={5}>Test Information</Title>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <br />
          <Text>Duration: {result.duration || 0} phút</Text>
          <br />
          <Text>Type: TOEIC Simulator</Text>
        </div>

        <div className={styles.performanceBox}>
          <Title level={5}>Performance Level</Title>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text style={{ marginLeft: 8 }}>
            {result.totalScore >= 785
              ? "Advanced"
              : result.totalScore >= 600
              ? "Intermediate"
              : "Beginner"}
          </Text>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>
            TOEIC Test Results
          </Title>
          <Button onClick={() => navigate("/toeic-exam")} ghost>
            Làm lại bài thi
          </Button>
        </div>

        <div className={styles.content}>
          <Title level={4} style={{ color: "#003a8c" }}>
            {selectedSection === "overall"
              ? "Overall Results"
              : sections.find((s) => s.key === selectedSection)?.title}
          </Title>

          <Card className={styles.scoreCard}>
            <div className={styles.scoreDisplay}>
              <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
                {displayScore}
              </Title>
              <Text strong>
                {selectedSection === "overall"
                  ? "Overall Score"
                  : selectedSection.charAt(0).toUpperCase() +
                    selectedSection.slice(1) +
                    " Score"}
              </Text>
              <br />
              <Text type="secondary">
                Out of {selectedSection === "overall" ? 990 : 495} points
              </Text>
              {/* ĐÃ XÓA: AI Evaluation */}
            </div>

            {/* BẢNG CÂU HỎI */}
            {(selectedSection === "listening" || selectedSection === "reading") && (
              <Table
                dataSource={
                  selectedSection === "listening"
                    ? questionRowsBySection.listening
                    : questionRowsBySection.reading
                }
                columns={columns}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 20 }}
              />
            )}

            {/* OVERALL */}
            {selectedSection === "overall" && (
              <div style={{ marginTop: 12, fontSize: 16 }}>
                <p>
                  <strong>Listening:</strong> {result.listeningScore} / 495
                </p>
                <p>
                  <strong>Reading:</strong> {result.readingScore} / 495
                </p>
                <div style={{ marginTop: 16 }}>
                  <Button onClick={() => openDetailForSection("overall")} type="primary">
                    Xem tất cả câu hỏi
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      <Modal
        title="Chi tiết câu hỏi"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={columns}
          dataSource={detailQuestions}
          rowKey="key"
          pagination={{ pageSize: 8 }}
        />
      </Modal>

      {/* MODAL BÁO CÁO */}
      <Modal
        title="Báo cáo câu hỏi"
        open={reportModalVisible}
        onOk={handleReportSubmit}
        onCancel={() => {
          setReportModalVisible(false);
          setReportQuestion(null);
          setReportText("");
        }}
        okText="Gửi"
      >
        <p>
          <strong>Câu hỏi:</strong> {reportQuestion?.question}
        </p>
        <Input.TextArea
          rows={4}
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Mô tả lỗi hoặc góp ý..."
        />
      </Modal>
    </div>
  );
}