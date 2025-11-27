import React from "react";
import { Card, Button, Tag, Typography } from "antd";
import { FlagOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function SWAnswersSection({
  feedbacks,
  emptyMessage = "Chưa có dữ liệu câu hỏi",
  onSelectFeedback,
  onReportQuestion,
  isQuestionReported,
  getSwPartDisplayName,
  formatQuestionText,
}) {
  if (!feedbacks.length) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Text type="secondary">{emptyMessage}</Text>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {feedbacks.map((item) => (
        <Card
          key={item.key}
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          actions={[
            <Button key="detail" type="primary" onClick={() => onSelectFeedback(item)}>
              Xem chi tiết
            </Button>,
          ]}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                  Câu {item.index}
                </Tag>
                {item.partName && (
                  <Tag color="purple" style={{ fontSize: 13, padding: "3px 10px" }}>
                    {item.partName}
                  </Tag>
                )}
                <Text strong style={{ fontSize: 16 }}>
                  {getSwPartDisplayName(item.partType)}
                </Text>
              </div>
              {item.questionContent && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Đề bài:</Text>
                  <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                    {formatQuestionText(item.questionContent)}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {item.content || "Chưa có đánh giá tổng quan"}
                </Text>
              </div>
              {item.answerText && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Câu trả lời:
                  </Text>
                  <div
                    style={{
                      marginTop: 4,
                      background: "#fafafa",
                      borderRadius: 6,
                      padding: 10,
                      maxHeight: 120,
                      overflowY: "auto",
                    }}
                  >
                    <Text style={{ whiteSpace: "pre-wrap" }}>{item.answerText}</Text>
                  </div>
                </div>
              )}
              {item.answerAudioUrl && !item.answerText && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    Câu trả lời:
                  </Text>
                  <audio controls src={item.answerAudioUrl} style={{ width: "100%" }}>
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
                marginLeft: 16,
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Điểm tổng
                </Text>
                <div>
                  <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                    {item.overallScore || 0}/100
                  </Text>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Điểm số
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                    {item.score || 0}
                  </Text>
                </div>
              </div>
              <div>
                {isQuestionReported(item.testQuestionId) ? (
                  <Tag color="success" icon={<FlagOutlined />}>
                    Đã báo cáo
                  </Tag>
                ) : (
                  <Button
                    size="small"
                    icon={<FlagOutlined />}
                    onClick={() => onReportQuestion(item)}
                  >
                    Báo cáo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

