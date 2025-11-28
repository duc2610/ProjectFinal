import React from "react";
import { Modal, Typography, Tag, Button } from "antd";
import { FileTextOutlined, FlagOutlined } from "@ant-design/icons";
import { getSwPartDisplayName, formatQuestionText } from "../utils.jsx";

const { Title, Text } = Typography;

export function SwDetailModal({
  open,
  feedback,
  onClose,
  onReportQuestion,
  isQuestionReported,
}) {
  if (!feedback) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={1200} style={{ top: 20 }} />
    );
  }

  const handleReport = () => {
    if (!feedback?.testQuestionId || !onReportQuestion) return;
    onReportQuestion({
      testQuestionId: feedback.testQuestionId,
      question: feedback.questionContent || "",
      content: feedback.questionContent || "",
    });
  };

  const renderAnswer = () => {
    const answerText = feedback.answerText || feedback.feedback?.answerText || "";
    if (answerText && answerText.trim().length > 0) {
      return (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Câu trả lời của bạn:</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              whiteSpace: "pre-wrap",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Text>{answerText}</Text>
          </div>
        </div>
      );
    }

    const answerAudio = feedback.answerAudioUrl || feedback.feedback?.answerAudioUrl;
    if (answerAudio) {
      return (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Câu trả lời của bạn:</Title>
          <audio controls src={answerAudio} style={{ width: "100%" }}>
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />
          <span>Chi tiết đánh giá {getSwPartDisplayName(feedback?.partType)}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1200}
      style={{ top: 20 }}
    >
      {feedback.partName && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>
            Phần: {feedback.partName}
          </Title>
          <Text type="secondary">{getSwPartDisplayName(feedback.partType)}</Text>
        </div>
      )}

      {(feedback.questionContent || feedback.questionContentFull?.content) && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Đề bài:</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#fff",
              border: "1px solid #f0f0f0",
              borderRadius: 4,
              whiteSpace: "pre-wrap",
            }}
          >
            <Text>
              {formatQuestionText(
                feedback.questionContent || feedback.questionContentFull?.content
              )}
            </Text>
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#f0f2f5",
          borderRadius: 4,
        }}
      >
        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
          Điểm số: {feedback.detailedScores?.overall || 0}/100
        </Title>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          {feedback.detailedScores?.word_count !== undefined && (
            <div>
              <Text type="secondary">Số từ: </Text>
              <Text strong>{feedback.detailedScores.word_count}</Text>
            </div>
          )}
          {feedback.detailedScores?.grammar !== undefined && (
            <div>
              <Text type="secondary">Ngữ pháp: </Text>
              <Text strong>{feedback.detailedScores.grammar}/100</Text>
            </div>
          )}
          {feedback.detailedScores?.vocabulary !== undefined && (
            <div>
              <Text type="secondary">Từ vựng: </Text>
              <Text strong>{feedback.detailedScores.vocabulary}/100</Text>
            </div>
          )}
          {feedback.detailedScores?.organization !== undefined && (
            <div>
              <Text type="secondary">Tổ chức: </Text>
              <Text strong>{feedback.detailedScores.organization}/100</Text>
            </div>
          )}
          {feedback.detailedScores?.relevance !== undefined && (
            <div>
              <Text type="secondary">Liên quan: </Text>
              <Text strong>{feedback.detailedScores.relevance}/100</Text>
            </div>
          )}
          {feedback.detailedScores?.sentence_variety !== undefined && (
            <div>
              <Text type="secondary">Đa dạng câu: </Text>
              <Text strong>{feedback.detailedScores.sentence_variety}/100</Text>
            </div>
          )}
          {feedback.detailedScores?.opinion_support !== undefined && (
            <div>
              <Text type="secondary">Hỗ trợ ý kiến: </Text>
              <Text strong>{feedback.detailedScores.opinion_support}/100</Text>
            </div>
          )}
        </div>
      </div>

      {renderAnswer()}

      {feedback.correctedText && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Câu trả lời đã chỉnh sửa:</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#f6ffed",
              border: "1px solid #52c41a",
              borderRadius: 4,
              whiteSpace: "pre-wrap",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Text>{feedback.correctedText}</Text>
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.grammar_errors?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Lỗi ngữ pháp:</Title>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {feedback.detailedAnalysis.grammar_errors.map((error, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 8,
                  padding: 12,
                  backgroundColor: "#fff1f0",
                  borderLeft: "4px solid #f5222d",
                  borderRadius: 4,
                }}
              >
                <div>
                  <Text strong style={{ color: "#f5222d" }}>
                    ✗ {error.wrong}
                  </Text>
                  {" → "}
                  <Text strong style={{ color: "#52c41a" }}>
                    ✓ {error.correct}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {error.rule} ({error.severity})
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.vocabulary_issues?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Gợi ý từ vựng:</Title>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {feedback.detailedAnalysis.vocabulary_issues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 8,
                  padding: 12,
                  backgroundColor: "#e6f7ff",
                  borderLeft: "4px solid #1890ff",
                  borderRadius: 4,
                }}
              >
                <div>
                  <Text strong>"{issue.word}"</Text>
                  {" → "}
                  <Text strong style={{ color: "#1890ff" }}>
                    "{issue.better}"
                  </Text>
                </div>
                {issue.example && (
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                    Ví dụ: {issue.example}
                  </Text>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.recommendations?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Khuyến nghị:</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#fffbe6",
              border: "1px solid #faad14",
              borderRadius: 4,
              whiteSpace: "pre-wrap",
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            <Text>{feedback.recommendations.join("\n")}</Text>
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.matched_points?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>✅ Các điểm đã đạt được:</Title>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {feedback.detailedAnalysis.matched_points.map((point, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <Text>{point}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.missing_points?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>❌ Các điểm còn thiếu:</Title>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {feedback.detailedAnalysis.missing_points.map((point, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <Text>{point}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.opinion_support_issues?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>💭 Vấn đề hỗ trợ ý kiến:</Title>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {feedback.detailedAnalysis.opinion_support_issues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 8,
                  padding: 12,
                  backgroundColor: "#fffbe6",
                  borderLeft: "4px solid #faad14",
                  borderRadius: 4,
                }}
              >
                <Text>{issue}</Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.detailedAnalysis?.image_description && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>🖼️ Mô tả hình ảnh:</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
              whiteSpace: "pre-wrap",
            }}
          >
            <Text>{feedback.detailedAnalysis.image_description}</Text>
          </div>
        </div>
      )}

      {feedback.testQuestionId && (
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
          }}
        >
          {isQuestionReported(feedback.testQuestionId) ? (
            <Tag color="success" icon={<FlagOutlined />}>
              Câu hỏi này đã được báo cáo
            </Tag>
          ) : (
            <Button icon={<FlagOutlined />} onClick={handleReport}>
              Báo cáo câu hỏi
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}

