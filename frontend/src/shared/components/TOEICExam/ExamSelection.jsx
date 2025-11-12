import React, { useState, useEffect } from "react";
import { Card, Button, Select, Typography, Checkbox, message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import { startTest } from "../../../services/testExamService";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const { Title, Text } = Typography;

export default function ExamSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const testIdFromUrl = searchParams.get("testId");
  
  const [testData, setTestData] = useState(null);
  const [parts, setParts] = useState([]);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSelectTime, setIsSelectTime] = useState(true);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý quay lại - quay về trang trước hoặc test-list
  const handleGoBack = () => {
    // Nếu có state.from thì quay về đó, nếu không thì quay về test-list
    const from = location.state?.from || "/test-list";
    navigate(from);
  };

  useEffect(() => {
    // Kiểm tra testId từ URL
    if (!testIdFromUrl) {
      message.error("Không tìm thấy bài test. Vui lòng chọn lại từ trang chủ.");
      navigate("/test-list");
      return;
    }
    fetchTestData();
  }, [testIdFromUrl, navigate]);

  const fetchTestData = async () => {
    if (!testIdFromUrl) return;
    
    setLoading(true);
    try {
      const testId = parseInt(testIdFromUrl);
      if (isNaN(testId)) {
        message.error("ID bài test không hợp lệ.");
        navigate("/test-list");
        return;
      }
      
      const data = await startTest(testId, true);
      if (!data) {
        message.error("Không thể tải dữ liệu bài thi.");
        navigate("/test-list");
        return;
      }
      
      setTestData(data);

      const partList = data.parts.map((p) => ({
        partId: p.partId,
        partName: p.partName,
        description: p.description,
        questionCount: p.testQuestions.reduce((sum, tq) => {
          return tq.isGroup
            ? sum + tq.questionGroupSnapshotDto.questionSnapshots.length
            : sum + 1;
        }, 0),
      }));

      setParts(partList);
      
      // Kiểm tra testType: nếu là Simulator thì tự động chọn tất cả phần và không cho chọn thời gian
      const testType = data.testType || "Simulator";
      const isSimulator = testType.toLowerCase() === "simulator";
      
      if (isSimulator) {
        // Simulator: chọn tất cả phần, không cho chọn thời gian
        setSelectedPartIds(partList.map((p) => p.partId));
        setIsSelectTime(false); // Không cho chọn thời gian
      } else {
        // Practice: cho phép chọn phần và thời gian
        setSelectedPartIds(partList.map((p) => p.partId));
      }
    } catch (error) {
      message.error("Không thể tải đề thi");
    } finally {
      setLoading(false);
    }
  };

  const togglePart = (partId) => {
    // Không cho phép toggle nếu là Simulator
    const testType = testData?.testType || "Simulator";
    const isSimulator = testType.toLowerCase() === "simulator";
    if (isSimulator) {
      return; // Không làm gì nếu là Simulator
    }
    
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const selectAll = () => {
    setSelectedPartIds(parts.map((p) => p.partId));
  };

  const startExam = () => {
    if (selectedPartIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một phần");
      return;
    }

    const selectedQuestions = flattenQuestions(testData.parts, selectedPartIds);
    // Nếu là Simulator, luôn dùng thời gian mặc định từ testData
    const testType = testData.testType || "Simulator";
    const isSimulator = testType.toLowerCase() === "simulator";
    const finalDuration = (isSimulator || !isSelectTime) ? testData.duration : durationMinutes;

    // Lưu testId để có thể dùng lại sau này
    const testId = parseInt(testIdFromUrl);
    
    sessionStorage.setItem(
      "toeic_testData",
      JSON.stringify({
        ...testData,
        testId: testId, // Lưu testId để dùng khi submit
        testResultId: testData.testResultId, // QUAN TRỌNG: Lưu testResultId từ startTest response
        questions: selectedQuestions,
        duration: finalDuration,
        selectedPartIds,
        testType: testType, // Lưu testType để dùng sau
        globalAudioUrl: testData.audioUrl, // Âm thanh tổng
      })
    );

    navigate("/exam");
  };

  const flattenQuestions = (parts, selectedIds) => {
    const questions = [];
    let globalIndex = 1;

    parts.forEach((part) => {
      if (!selectedIds.includes(part.partId)) return;

      part.testQuestions.forEach((tq) => {
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots.forEach((qs, idx) => {
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
              options: qs.options.map((o) => ({ key: o.label, text: o.content })),
              correctAnswer: qs.options.find((o) => o.isCorrect)?.label,
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
            options: qs.options.map((o) => ({ key: o.label, text: o.content })),
            correctAnswer: qs.options.find((o) => o.isCorrect)?.label,
            userAnswer: qs.userAnswer,
          });
        }
      });
    });

    return questions;
  };

  // Kiểm tra testType để xác định có cho phép chọn phần và thời gian không
  const testType = testData?.testType || "Simulator";
  const isSimulator = testType.toLowerCase() === "simulator";
  const isPractice = testType.toLowerCase() === "practice";

  return (
    <div className={styles.selectionContainer}>
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleGoBack}
          type="text"
          style={{ padding: 0 }}
        >
          Quay lại
        </Button>
      </div>
      <Card title={<Title level={4}>{isSimulator ? "TOEIC Simulator" : "TOEIC Practice"} - {isSimulator ? "Bài thi mô phỏng" : "Chọn Phần Thi"}</Title>}>
        <Spin spinning={loading}>
          {isSimulator ? (
            <>
              <Title level={5}>Bài thi mô phỏng - Tất cả các phần sẽ được làm</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Ở chế độ Simulator, bạn sẽ làm tất cả các phần thi với thời gian mặc định.
              </Text>
            </>
          ) : (
            <Title level={5}>Chọn các phần bạn muốn luyện</Title>
          )}

          {isPractice && (
            <div style={{ marginBottom: 16 }}>
              <Button type="link" onClick={selectAll} size="small">
                Chọn tất cả
              </Button>
            </div>
          )}

          <div className={styles.partsGrid}>
            {parts.map((part) => (
              <div
                key={part.partId}
                className={styles.partCard}
                style={{
                  border: selectedPartIds.includes(part.partId)
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                  opacity: isSimulator ? 1 : 1,
                }}
              >
                <div>
                  <Text strong>{part.partName}</Text>
                  <div className={styles.partDesc}>{part.description}</div>
                  <div className={styles.partSmall}>{part.questionCount} câu</div>
                </div>
                <Checkbox
                  checked={selectedPartIds.includes(part.partId)}
                  onChange={() => togglePart(part.partId)}
                  disabled={isSimulator} // Disable checkbox nếu là Simulator
                />
              </div>
            ))}
          </div>

          {isPractice && (
            <div style={{ marginTop: 24 }}>
              <Checkbox checked={isSelectTime} onChange={(e) => setIsSelectTime(e.target.checked)}>
                Chọn thời gian tự do
              </Checkbox>
              {isSelectTime && (
                <Select
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                  style={{ width: 120, marginLeft: 12 }}
                >
                  {[15, 30, 45, 60, 90, 120].map((m) => (
                    <Select.Option key={m} value={m}>
                      {m} phút
                    </Select.Option>
                  ))}
                </Select>
              )}
            </div>
          )}

          {isSimulator && testData && (
            <div style={{ marginTop: 24 }}>
              <Text type="secondary">
                Thời gian làm bài: <Text strong>{testData.duration || 120} phút</Text>
              </Text>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              onClick={startExam}
              disabled={selectedPartIds.length === 0 || loading}
            >
              Bắt đầu làm bài
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
}