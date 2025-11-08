import React, { useState, useEffect } from "react";
import { Tabs, Form, Input, Button, Row, Col, Modal, notification, Table, Tag, Space, Empty, message } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { changePassword } from "@services/authService";
import { getTestHistory } from "@services/testsService";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Tabs
          defaultActiveKey="personal"
          className={styles.tabs}
          items={[
            {
              key: "personal",
              label: "Thông tin cá nhân",
              children: <PersonalTab user={user} />,
            },
            {
              key: "history",
              label: "Lịch sử thi",
              children: <TestHistoryTab />,
            },
            {
              key: "report",
              label: "Báo cáo",
              children: <div>Báo cáo</div>,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function PersonalTab({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const { oldPassword, newPassword, confirmNewPassword } = values;
      await changePassword({ oldPassword, newPassword, confirmNewPassword });
      notification.success({
        message: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật.",
      });
      handleCancel();
    } catch (error) {
      const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      if (
        msg.toLowerCase().includes("old password") ||
        msg.toLowerCase().includes("mật khẩu cũ") ||
        msg.toLowerCase().includes("current password")
      ) {
        form.setFields([
          {
            name: "oldPassword",
            errors: [msg],
          },
        ]);
      } else {
        notification.error({
          message: "Đổi mật khẩu thất bại",
          description: msg,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.tabPane}>
        <h2 className={styles.title}>Profile Information</h2>

        <Row gutter={24} justify="center">
          <Col xs={24} md={14} lg={14}>
            <Form layout="vertical" className={styles.form}>
              <Form.Item label="Full Name">
                <Input value={user?.fullName || ""} readOnly />
              </Form.Item>
              <Form.Item label="Email Address">
                <Input value={user?.email || ""} readOnly />
              </Form.Item>

              <Button block className={styles.primaryBtn} onClick={showModal}>
                Change Password
              </Button>
              <Button block className={styles.ghostBtn} type="default">
                Update Profile
              </Button>
            </Form>
          </Col>
        </Row>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onOk={() => form.submit()}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        onCancel={handleCancel}
        closable
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className={styles.form}
          onFinish={onFinish}
          name="change-password-form"
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                message:
                  "Phải có ít nhất 1 chữ và 1 số; chỉ gồm chữ và số (không khoảng trắng/ký tự đặc biệt)",
              },
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            getValueFromEvent={(e) => e?.target?.value}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export function TestHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getTestHistory();
      const historyList = Array.isArray(data) ? data : [];
      
      // Normalize data: convert PascalCase to camelCase để đảm bảo match với backend
      const normalizedHistory = historyList.map(item => ({
        testId: item.testId || item.TestId,
        testType: item.testType || item.TestType,
        testSkill: item.testSkill || item.TestSkill,
        title: item.title || item.Title,
        duration: item.duration || item.Duration,
        createdAt: item.createdAt || item.CreatedAt,
        totalQuestion: item.totalQuestion || item.TotalQuestion,
        correctQuestion: item.correctQuestion || item.CorrectQuestion,
      }));
      
      setHistory(normalizedHistory);
    } catch (error) {
      console.error("Error fetching test history:", error);
      message.error("Không thể tải lịch sử thi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSkillLabel = (skill) => {
    const skillMap = {
      1: "Speaking",
      2: "Writing",
      3: "Listening & Reading",
      4: "Four Skills",
    };
    return skillMap[skill] || skill;
  };

  const getSkillColor = (skill) => {
    const colorMap = {
      1: "green",
      2: "cyan",
      3: "purple",
      4: "blue",
    };
    return colorMap[skill] || "default";
  };

  const getTestTypeLabel = (type) => {
    const typeMap = {
      1: "Simulator",
      2: "Practice",
    };
    return typeMap[type] || type;
  };

  const getTestTypeColor = (type) => {
    return type === 1 ? "blue" : "orange";
  };

  const calculateScore = (correct, total) => {
    if (!total || total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Loại",
      dataIndex: "testType",
      key: "testType",
      width: 120,
      render: (type) => (
        <Tag color={getTestTypeColor(type)}>{getTestTypeLabel(type)}</Tag>
      ),
    },
    {
      title: "Kỹ năng",
      dataIndex: "testSkill",
      key: "testSkill",
      width: 150,
      render: (skill) => (
        <Tag color={getSkillColor(skill)}>{getSkillLabel(skill)}</Tag>
      ),
    },
    {
      title: "Kết quả",
      key: "result",
      width: 150,
      render: (_, record) => {
        const score = calculateScore(record.correctQuestion, record.totalQuestion);
        return (
          <Space direction="vertical" size="small">
            <span>
              <Tag color={getScoreColor(score)}>{score}%</Tag>
            </span>
            <span style={{ fontSize: 12, color: "#666" }}>
              {record.correctQuestion}/{record.totalQuestion} câu đúng
            </span>
          </Space>
        );
      },
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (duration) => `${duration} phút`,
    },
    {
      title: "Ngày làm",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className={styles.tabPane}>
      <h2 className={styles.title}>Lịch sử luyện thi</h2>
      <Row gutter={24} justify="center">
        <Col xs={24} md={22} lg={20}>
          {history.length === 0 && !loading ? (
            <Empty
              description="Chưa có lịch sử thi nào"
              style={{ marginTop: 40 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={history}
              rowKey={(record, index) => `${record.testId}-${record.createdAt}-${index}`}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bài thi`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
