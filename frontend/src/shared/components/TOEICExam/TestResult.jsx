import React, { useState, useEffect } from "react";
import { Card, Typography, List, Button, Spin, message, Tag, Progress } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getTestResultDetail } from "../../../services/testExamService";
import styles from "../../styles/Exam.module.css";

const { Title, Text } = Typography;

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { testResultId, autoSubmit } = location.state || {};
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testResultId) {
      message.error("Không tìm thấy ID kết quả. Vui lòng làm lại bài thi.");
      navigate("/toeic-exam");
      return;
    }

    if (autoSubmit) {
      message.info("Hết thời gian! Bài thi đã được nộp tự động.");
    }

    fetchResult();
  }, [testResultId, autoSubmit, navigate]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const data = await getTestResultDetail(testResultId);
      console.log("Kết quả:", data);
      setResult(data);
    } catch (error) {
      console.error("Lỗi tải kết quả:", error);
      message.error("Không thể tải kết quả. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" tip="Đang tải kết quả..." />
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Text type="danger">Không có dữ liệu kết quả.</Text>
        <Button style={{ marginTop: 16 }} onClick={() => navigate("/toeic-exam")}>
          Quay lại chọn đề
        </Button>
      </div>
    );
  }

  const correctCount = result.answers?.filter(a => a.isCorrect).length || 0;
  const totalCount = result.answers?.length || 0;
  const score = result.score || Math.round((correctCount / totalCount) * 990);

  return (
    <div className={styles.selectionContainer}>
      <Card title={<Title level={3}>Kết Quả Bài Thi TOEIC</Title>}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#1890ff" }}>
            {score} / 990
          </Title>
          <Text type="secondary">
            Đúng: {correctCount} / {totalCount} câu
          </Text>
          <div style={{ marginTop: 12 }}>
            <Progress
              percent={Math.round((correctCount / totalCount) * 100)}
              status="active"
              strokeColor="#52c41a"
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Chi tiết đáp án:</Text>
        </div>

        <List
          dataSource={result.answers || []}
          renderItem={(item, idx) => (
            <List.Item
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
                background: item.isCorrect ? "#f6ffed" : "#fff2f0",
              }}
            >
              <div style={{ flex: 1 }}>
                <Text strong>Câu {idx + 1}:</Text>{" "}
                <Text>{item.questionContent}</Text>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag color={item.isCorrect ? "green" : "red"}>
                  {item.chosenOptionLabel}
                </Tag>
                {!item.isCorrect && (
                  <Tag color="blue">Đáp án: {item.correctOptionLabel}</Tag>
                )}
                <Tag color={item.isCorrect ? "green" : "red"}>
                  {item.isCorrect ? "Đúng" : "Sai"}
                </Tag>
              </div>
            </List.Item>
          )}
        />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Button type="primary" size="large" onClick={() => navigate("/toeic-exam")}>
            Làm bài khác
          </Button>
        </div>
      </Card>
    </div>
  );
}