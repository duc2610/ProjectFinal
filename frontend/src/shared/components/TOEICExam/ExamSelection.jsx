import React, { useState, useEffect } from "react";
import { Card, Button, Select, Typography, Checkbox, message, Spin } from "antd";
import styles from "../../styles/Exam.module.css";
import { startTest } from "../../../services/testExamService";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const TEST_ID = 9; // Dùng testId=6 như bạn cung cấp

export default function ExamSelection() {
  const [testData, setTestData] = useState(null);
  const [parts, setParts] = useState([]);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSelectTime, setIsSelectTime] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setLoading(true);
    try {
      const data = await startTest(TEST_ID, true);
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
      setSelectedPartIds(partList.map((p) => p.partId));
    } catch (error) {
      message.error("Không thể tải đề thi");
    } finally {
      setLoading(false);
    }
  };

  const togglePart = (partId) => {
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
    const finalDuration = isSelectTime ? durationMinutes : testData.duration;

    sessionStorage.setItem(
      "toeic_testData",
      JSON.stringify({
        ...testData,
        questions: selectedQuestions,
        duration: finalDuration,
        selectedPartIds,
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

  return (
    <div className={styles.selectionContainer}>
      <Card title={<Title level={4}>TOEIC Simulator - Chọn Phần Thi</Title>}>
        <Spin spinning={loading}>
          <Title level={5}>Chọn các phần bạn muốn luyện</Title>

          <div style={{ marginBottom: 16 }}>
            <Button type="link" onClick={selectAll} size="small">
              Chọn tất cả
            </Button>
          </div>

          <div className={styles.partsGrid}>
            {parts.map((part) => (
              <div
                key={part.partId}
                className={styles.partCard}
                style={{
                  border: selectedPartIds.includes(part.partId)
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
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
                />
              </div>
            ))}
          </div>

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