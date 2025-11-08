import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { getTestResultDetailLR } from "../../../services/testExamService";
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
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // === LOAD DETAIL TỪ API ===
  const loadDetailFromAPI = useCallback(async (testResultId) => {
    if (!testResultId) {
      return;
    }

    // Kiểm tra xem đã load chưa (dựa vào testResultId trong detailData)
    if (detailData && detailData.testResultId === testResultId) {
      return;
    }

    setLoadingDetail(true);
    try {
      const data = await getTestResultDetailLR(testResultId);
      setDetailData(data);
      // Không hiển thị message success khi auto load
    } catch (error) {
      console.error("Error loading detail:", error);
      message.error("Không thể tải chi tiết câu hỏi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingDetail(false);
    }
  }, [detailData]);

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
    
    // Tự động load detail từ API khi có testResultId
    if (resultData?.testResultId) {
      loadDetailFromAPI(resultData.testResultId);
    }
  }, [resultData, autoSubmit, navigate, loadDetailFromAPI]);

  // === XỬ LÝ CÂU HỎI TỪ API DETAIL ===
  const processQuestionsFromDetail = (detailData) => {
    if (!detailData?.parts) return { listening: [], reading: [], all: [] };

    const rows = { listening: [], reading: [], all: [] };
    let globalIndex = 1;

    detailData.parts.forEach((part) => {
      part.testQuestions?.forEach((tq) => {
        // Xử lý single question
        if (!tq.isGroup && tq.questionSnapshotDto) {
          const qs = tq.questionSnapshotDto;
          const userAnswer = qs.userAnswer || "";
          const correctAnswer = qs.options?.find((o) => o.isCorrect)?.label || "";
          const isCorrect = qs.isCorrect !== null ? qs.isCorrect : userAnswer === correctAnswer;

          const row = {
            key: tq.testQuestionId,
            index: globalIndex++,
            partId: qs.partId || part.partId,
            partTitle: part.partName || `Part ${qs.partId || part.partId}`,
            question: qs.content || "",
            passage: null,
            userAnswer,
            correctAnswer,
            isCorrect,
            imageUrl: qs.imageUrl,
            explanation: qs.explanation,
          };

          rows.all.push(row);
          if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
          if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
        }

        // Xử lý group question
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots?.forEach((qs, idx) => {
            const userAnswer = qs.userAnswer || "";
            const correctAnswer = qs.options?.find((o) => o.isCorrect)?.label || "";
            const isCorrect = qs.isCorrect !== null ? qs.isCorrect : userAnswer === correctAnswer;

            const row = {
              key: `${tq.testQuestionId}_${idx}`,
              index: globalIndex++,
              partId: qs.partId || part.partId,
              partTitle: part.partName || `Part ${qs.partId || part.partId}`,
              question: qs.content || "",
              passage: group.passage || null,
              userAnswer,
              correctAnswer,
              isCorrect,
              imageUrl: qs.imageUrl || group.imageUrl,
              explanation: qs.explanation,
            };

            rows.all.push(row);
            if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
            if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
          });
        }
      });
    });

    return rows;
  };

  // === XỬ LÝ CÂU HỎI ===
  const questionRowsBySection = useMemo(() => {
    // Ưu tiên dữ liệu từ API detail
    if (detailData) {
      return processQuestionsFromDetail(detailData);
    }

    // Fallback về dữ liệu từ submit
    if (!result?.questions) return { listening: [], reading: [], all: [] };

    const rows = { listening: [], reading: [], all: [] };
    const answersMap = (result.answers || []).reduce((map, a) => {
      map[a.testQuestionId] = a.chosenOptionLabel;
      return map;
    }, {});

    result.questions.forEach((q, idx) => {
      const userAnswer = answersMap[q.testQuestionId] || "";
      const correctAnswer = q.options?.find((o) => o.isCorrect)?.key || "";
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
  }, [result, detailData]);

  // === TÍNH ĐIỂM READING VỚI TỐI THIỂU 5 ĐIỂM ===
  const getReadingScore = useMemo(() => {
    if (!result) return 0;
    const readingScore = result.readingScore || 0;
    // Nếu không chọn đáp án nào ở phần reading, vẫn được 5 điểm
    const hasReadingAnswers = questionRowsBySection.reading.some(
      (row) => row.userAnswer && row.userAnswer.trim() !== ""
    );
    return hasReadingAnswers ? readingScore : Math.max(5, readingScore);
  }, [result, questionRowsBySection]);

  // === ANIMATION ĐIỂM SỐ ===
  useEffect(() => {
    if (!result) return;

    const target =
      selectedSection === "overall"
        ? result.totalScore
        : selectedSection === "listening"
        ? result.listeningScore || 0
        : getReadingScore;

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
  }, [selectedSection, result, getReadingScore]);

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
          score: getReadingScore,
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


  const openDetailForSection = async (key) => {
    // Đảm bảo detail đã được load
    if (!detailData && result?.testResultId) {
      await loadDetailFromAPI(result.testResultId);
    }

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
                  <strong>Reading:</strong> {getReadingScore} / 495
                </p>
                <div style={{ marginTop: 16 }}>
                  <Button
                    onClick={() => openDetailForSection("overall")}
                    type="primary"
                    loading={loadingDetail}
                  >
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
        width={1200}
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang tải chi tiết câu hỏi...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={detailQuestions}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        )}
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