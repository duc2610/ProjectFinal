import React from "react";
import { Modal, Select, Input, Typography } from "antd";
import { formatQuestionText } from "../utils.jsx";

const { Text } = Typography;

export function ReportQuestionModal({
  open,
  question,
  reportType,
  reportDescription,
  reporting,
  onChangeType,
  onChangeDescription,
  onSubmit,
  onCancel,
}) {
  const questionText = formatQuestionText(
    question?.question || question?.content || "—"
  );

  return (
    <Modal
      title="Báo cáo câu hỏi"
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Gửi báo cáo"
      cancelText="Hủy"
      confirmLoading={reporting}
      width={600}
    >
      {question && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Câu hỏi:
            </Text>
            <div
              style={{
                padding: 12,
                backgroundColor: "#fafafa",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {questionText}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Loại báo cáo:
            </Text>
            <Select
              value={reportType}
              onChange={onChangeType}
              style={{ width: "100%" }}
              size="large"
            >
              <Select.Option value="IncorrectAnswer">Đáp án sai</Select.Option>
              <Select.Option value="Typo">Lỗi chính tả</Select.Option>
              <Select.Option value="AudioIssue">Vấn đề về âm thanh</Select.Option>
              <Select.Option value="ImageIssue">Vấn đề về hình ảnh</Select.Option>
              <Select.Option value="Unclear">Câu hỏi không rõ ràng</Select.Option>
              <Select.Option value="Other">Khác</Select.Option>
            </Select>
          </div>
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Mô tả chi tiết:
            </Text>
            <div style={{ position: "relative" }}>
              <Input.TextArea
                rows={4}
                value={reportDescription}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                maxLength={500}
                style={{ paddingBottom: 28 }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 6,
                  fontSize: 12,
                  color: "#999",
                }}
              >
                {(reportDescription || "").length}/500
              </span>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

