import React from "react";
import { Modal, Alert, Typography } from "antd";
import { normalizeTestType, normalizeTestSkill, normalizeNumber } from "../utils.jsx";

const { Title, Text } = Typography;

export function RetakeConfirmModal({
  open,
  loading,
  testInfo,
  fallbackInfo,
  onConfirm,
  onCancel,
}) {
  const effectiveInfo = testInfo || {};
  const backup = fallbackInfo || {};

  const title = effectiveInfo.title || backup.testTitle || "Bài thi TOEIC";
  const effectiveType = effectiveInfo.testType || backup.testType;
  const normalizedType = normalizeTestType(effectiveType);
  const effectiveSkill = effectiveInfo.testSkill || backup.testSkill;
  const effectiveDuration =
    normalizeNumber(effectiveInfo.duration || backup.duration) > 0
      ? `${normalizeNumber(effectiveInfo.duration || backup.duration)} phút`
      : "Không giới hạn";
  const effectiveQuestionQuantity =
    normalizeNumber(effectiveInfo.questionQuantity || backup.questionQuantity) || "Không rõ";
  const effectiveTimeMode = effectiveInfo.isSelectTime ? "Có giới hạn thời gian" : "Không giới hạn thời gian";

  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            {title}
          </Title>
          <Text type="secondary">
            {normalizedType === "Simulator" ? "Mô phỏng theo đề thi thật" : "Bài luyện tập"}
          </Text>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Bắt đầu làm bài"
      cancelText="Hủy"
      confirmLoading={loading}
      maskClosable={false}
      closable={!loading}
      width={640}
    >
      <div>
        <Alert
          type="info"
          showIcon
          message="Làm lại bài thi"
          description={`Bạn sẽ làm lại bài thi với các chế độ đã chọn từ lần thi trước: ${effectiveTimeMode}`}
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Thông tin bài thi
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text>
              <strong>Loại bài thi:</strong> {normalizedType}
            </Text>
            {effectiveSkill && (
              <Text>
                <strong>Kỹ năng:</strong> {normalizeTestSkill(effectiveSkill)}
              </Text>
            )}
            <Text>
              <strong>Thời lượng đề:</strong> {effectiveDuration}
            </Text>
            <Text>
              <strong>Số lượng câu hỏi:</strong> {effectiveQuestionQuantity}
            </Text>
            <Text>
              <strong>Chế độ thời gian:</strong> {effectiveTimeMode}
            </Text>
          </div>
        </div>

        {normalizedType === "Simulator" ? (
          <Alert
            type="info"
            showIcon
            message="Chế độ Simulator"
            description="Bài thi sẽ tự động đếm ngược theo thời lượng chuẩn của đề và tự nộp khi hết giờ (giống lần thi trước)."
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message="Chế độ Practice"
            description={`Bạn sẽ làm bài với chế độ ${
              effectiveInfo?.isSelectTime ? "đếm ngược theo thời gian đề" : "đếm thời gian lên từ 00:00"
            } như lần thi trước.`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Alert
          type="info"
          showIcon
          message="Tính năng lưu tiến độ"
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                Hệ thống sẽ tự động lưu tiến độ làm bài của bạn mỗi 5 phút. Bạn cũng có thể nhấn nút
                <strong> "Lưu"</strong> trên thanh công cụ để lưu thủ công bất cứ lúc nào.
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                💡 Lưu ý: Nếu mất kết nối mạng, hệ thống sẽ lưu tạm thời các câu trả lời của bạn. Khi kết nối lại, tiến độ sẽ được lưu tự động.
              </div>
            </div>
          }
          style={{ marginBottom: 16 }}
        />

        <Alert
          type="warning"
          showIcon
          message="Lưu ý"
          description="Ngay sau khi xác nhận, đề thi sẽ bắt đầu và thời gian làm bài được ghi nhận."
        />
      </div>
    </Modal>
  );
}

