import React from "react";
import { Modal, Table, Spin, Typography } from "antd";

const { Text } = Typography;

export function QuestionDetailModal({
  open,
  loading,
  questions,
  columns,
  pagination,
  onPaginationChange,
  emptyMessage,
  loadingIcon,
  onCancel,
}) {
  return (
    <Modal
      title="Chi tiết câu hỏi và đáp án"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1200}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin indicator={loadingIcon} size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải chi tiết câu hỏi...</Text>
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="key"
          pagination={{
            pageSize: pagination.size,
            current: pagination.current,
            showSizeChanger: true,
            onChange: (page, size) =>
              onPaginationChange({ current: page, size: size || pagination.size }),
            showTotal: (total) => `Tổng ${total} câu`,
          }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: emptyMessage }}
        />
      )}
    </Modal>
  );
}

