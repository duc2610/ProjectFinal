import React from "react";
import { Table, Tag, Button, Tooltip, Typography } from "antd";
import { FlagOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function LRQuestionsSection({
  sectionKey,
  dataSource,
  pagination,
  onPaginationChange,
  emptyMessage,
  onViewQuestionDetail,
  onReportQuestion,
  isQuestionReported,
}) {
  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "question",
      render: (_, row) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Tag color="purple" style={{ fontSize: 13, padding: "3px 10px" }}>
              {row.partTitle || "—"}
            </Tag>
            <Tag color="blue" style={{ fontSize: 13, padding: "3px 10px" }}>
              Câu {row.index}
            </Tag>
          </div>
          {row.passage && (
            <div
              style={{
                fontStyle: "italic",
                color: "#666",
                marginBottom: 6,
                whiteSpace: "pre-wrap",
              }}
            >
              {row.passage}
            </div>
          )}
          <div style={{ whiteSpace: "pre-wrap" }}>{row.question}</div>
        </div>
      ),
    },
    {
      title: "Đáp án của bạn",
      dataIndex: "userAnswer",
      width: 160,
      render: (_, row) => (
        <div>
          <Text style={{ color: row.isCorrect ? "#52c41a" : "#f5222d", fontWeight: "bold" }}>
            {row.userAnswer || "—"}
          </Text>
          {row.userAnswerText && (
            <div style={{ fontSize: 12, color: "#595959" }}>{row.userAnswerText}</div>
          )}
        </div>
      ),
    },
    {
      title: "Đáp án đúng",
      dataIndex: "correctAnswer",
      width: 180,
      render: (_, row) => (
        <div>
          <Text strong>{row.correctAnswer}</Text>
          {row.correctAnswerText && (
            <div style={{ fontSize: 12, color: "#595959" }}>{row.correctAnswerText}</div>
          )}
        </div>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "isCorrect",
      width: 120,
      render: (val) => (
        <Tag color={val === null ? "default" : val ? "success" : "error"}>
          {val === null ? "Chưa trả lời" : val ? "Đúng" : "Sai"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 160,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="small" onClick={() => onViewQuestionDetail(row)}>
            Xem
          </Button>
          {isQuestionReported(row.testQuestionId) ? (
            <Tooltip title="Đã báo cáo câu hỏi này">
              <FlagOutlined style={{ color: "#52c41a", fontSize: 16, marginTop: 4 }} />
            </Tooltip>
          ) : (
            <Button size="small" icon={<FlagOutlined />} onClick={() => onReportQuestion(row)}>
              Báo cáo
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="key"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `Tổng ${total} câu`,
        onChange: onPaginationChange,
      }}
      style={{ marginTop: 20 }}
      locale={{ emptyText: emptyMessage }}
    />
  );
}

